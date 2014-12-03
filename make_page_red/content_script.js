//document.body.style.backgroundColor="red"
/*
var s = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.extension.getURL('script.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);
*/
function getSelectionText() { 
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  } 
  return text;
}

text = getSelectionText()

if (text != ""){
  console.log(text);
  chrome.runtime.sendMessage({message: text});
  document.body.style.backgroundColor="red"
}
