const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const { join } = require('path');
const app = express();

const fs = require('node:fs');
const { spawn } = require('child_process');

app.use(cors());

app.use('/images', express.static(join(__dirname, 'src', 'images')));
app.use('/css', express.static(join(__dirname, 'src', 'css')));
app.use('/js', express.static(join(__dirname, 'src', 'js')));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req,res) => {
  res.sendFile(join(__dirname, 'src', 'html', 'convert.html'));
});

app.get('/view', async (req, res) => {
  var url = req.query.url;

  if (!url || !ytdl.validateURL(url)) {
    return res.sendFile(join(__dirname, 'src', 'html', 'nf.html'));
  }

  var Video = await ytdl.getBasicInfo(url);

  const info = await ytdl.getInfo(ytdl.getURLVideoID(url));
  const videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', format: 'mp4' });
  const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });

  const video = ytdl(url, { format: videoFormat });
  const audio = ytdl(url, { format: audioFormat });

  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-i', 'pipe:1',
    '-c', 'copy',
    '-f', 'matroska',
    'pipe:2'
  ]);

  const headers = {
    'Content-Type': 'video/mp4',
    'Content-Disposition': `inline; filename="${Video.videoDetails.title}.mp4"`,
    'Content-Transfer-Encoding': 'binary'
  };

  res.writeHead(200, headers);

  video.pipe(ffmpeg.stdin);
  audio.pipe(ffmpeg.stdin);

  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
});

app.use(function(req, res, next) {
  res.status(404).sendFile(join(__dirname, 'src', 'html', '404.html'));
});

app.listen(8080);
