var Download = document.querySelector('.download');
var url = document.querySelector('.url');

Download.addEventListener('click', () => {
  location.href = `${location.href}view?url=${url.value}`
});
