const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

app.use(cors());

app.use('/images', express.static(path.join(__dirname, 'src', 'images')));
app.use('/css', express.static(path.join(__dirname, 'src', 'css')));
app.use('/js', express.static(path.join(__dirname, 'src', 'js')));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'src', 'html', 'view.html'));
});

app.get('/view', async (req, res) => {
  const url = req.query.url;

  if (!url || !ytdl.validateURL(url)) {
    return res.sendFile(path.join(__dirname, 'src', 'html', 'nf.html'));
  }

  const videoInfo = await ytdl.getInfo(url);
  const videoTitle = videoInfo.videoDetails.title;
  const videoID = videoInfo.videoDetails.videoId;

  const videoFilePath = path.join(__dirname, 'videos', `${videoID}.mp4`);
  const audioFilePath = path.join(__dirname, 'audio', `${videoID}.mp3`);
  const outputFilePath = path.join(__dirname, 'output', `${videoTitle}.mp4`);

  // Download video and audio using ytdl-core
  const videoStream = ytdl(url, { quality: 'highestvideo', filter: 'audioandvideo' });
  const audioStream = ytdl(url, { quality: 'highestaudio', filter: 'audioonly' });

  const videoFile = fs.createWriteStream(videoFilePath);
  const audioFile = fs.createWriteStream(audioFilePath);

  videoStream.pipe(videoFile);
  audioStream.pipe(audioFile);

  Promise.all([
    new Promise((resolve, reject) => videoFile.on('finish', resolve).on('error', reject)),
    new Promise((resolve, reject) => audioFile.on('finish', resolve).on('error', reject))
  ])
    .then(() => {
      // Merge video and audio using ffmpeg
      ffmpeg()
        .input(videoFilePath)
        .input(audioFilePath)
        .outputOptions('-c:v copy')
        .outputOptions('-c:a aac')
        .outputOptions('-movflags +faststart')
        .outputOptions('-preset ultrafast')
        .outputOptions('-shortest') 
        .on('end', () => {
          console.log(`Finished generating video: ${outputFilePath}`);
          // Stream merged file to client
          const fileStream = fs.createReadStream(outputFilePath);
          fileStream.pipe(res);

          fileStream.on('error', (err) => console.error(err));
          fileStream.on('close', () => {
            console.log(`Finished streaming video: ${outputFilePath}`);
            // Cleanup downloaded files
            fs.unlink(videoFilePath, (err) => { if (err) console.error(err); });
            fs.unlink(audioFilePath, (err) => { if (err) console.error(err); });
            fs.unlink(outputFilePath, (err) => { if (err) console.error(err); });
          });
        })
        .on('error', (err) => console.error(err))
        .save(outputFilePath);
    })
    .catch((err) => console.error(err));
});

app.use(function(req, res, next) {
  res.status(404).sendFile(path.join(__dirname, 'src', 'html', '404.html'));
});

app.listen(8080, => () {
  console.log("Running.");
});
