var btn_view = document.querySelector('.btn-view');
var url_input = document.querySelector('.url-input');

btn_view.onclick = function() {
  location.href = `${location.href}view?url=${url_input.value}`
}
