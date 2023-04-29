const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());

app.use("/css", express.static(path.join(__dirname, "src", "css")));
app.use("/js", express.static(path.join(__dirname, "src", "js")));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, "src", "html", "Convert.html"));
});

app.get('/view', async (req,res) => {  
var URL = req.query.url;
  
if(!URL || !ytdl.validateURL(URL)) return res.sendFile(path.join(__dirname, "src", "html", "NotFound.html"));
var Video = await ytdl.getBasicInfo(URL);

res.header("Content-Disposition", `inline; filename="${Video.videoDetails.title}.mp4"`);
res.header("Content-Type", "video/mp4");
res.header("Content-Transfer-Encoding", "binary");
 
const info = await ytdl.getInfo(ytdl.getURLVideoID(URL));
const format = ytdl.chooseFormat(info.formats, { quality: 22 });

ytdl(URL, {
    format: format => format
    }).pipe(res); 
});

app.use(function(req, res, next) {
  res.status(404).sendFile(path.join(__dirname, "src", "html", "404.html"));
});

app.listen(8080, () => {
    console.log('Server Running.');
});
