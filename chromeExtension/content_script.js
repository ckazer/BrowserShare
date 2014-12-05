function getSelectionText() { 
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  }
  // The following code is intended to work for Internet Explorer
  /* else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  } */ 
  return text;
}

text = getSelectionText();
if (text != ""){
  chrome.runtime.sendMessage({text: text});
} else {
  chrome.runtime.sendMessage({text: "ERROR_NO_SELECTION"});
}
