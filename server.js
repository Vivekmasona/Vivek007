const ytdl = require('ytdl-core');
const express = require('express');
const cors = require('cors');
const app = express();

const path = require('path');

app.use(cors());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use("/css", express.static(path.join(__dirname, "src", "css")));
app.use("/js", express.static(path.join(__dirname, "src", "js")));

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, "src", "html", "Download.html"));
});

app.get('/download', async (req,res) => {
  
var URL = req.query.URL;
var Video = await ytdl.getBasicInfo(URL);

res.header("Content-Disposition", `attachment; filename="${Video.videoDetails.title}.mp4"`)
ytdl(URL, {
    format: 'mp4'
    }).pipe(res); 
});

app.use(function(req, res, next) {
  res.status(404).sendFile(path.join(__dirname, "src", "html", "404.html"));
});

app.listen(8080, () => {
    console.log('Server Running.');
});
