var Download = document.querySelector('.download');
var URL = document.querySelector('.URL');

Download.addEventListener('click', () => {
  GetDownload(URL);
});

function GetDownload(URL) {
  fetch(`${location.href}download?URL=${URL.value}`, { method: 'GET' })
  .then(res => res.text())
  .then(text => console.log(text));
}
