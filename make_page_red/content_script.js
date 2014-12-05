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
    text = window.getSelection()
  }/* else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  } */
  return text;
}

text = getSelectionText();
/***************************************************************/

function getSelectionBoundaryElement(isStart) {
    var range, sel, container;
    if (document.selection) {
        range = document.selection.createRange();
        range.collapse(isStart);
        return range.parentElement();
    } else {
        sel = window.getSelection();
        if (sel.getRangeAt) {
            if (sel.rangeCount > 0) {
                range = sel.getRangeAt(0);
            }
        } else {
            // Old WebKit
            range = document.createRange();
            range.setStart(sel.anchorNode, sel.anchorOffset);
            range.setEnd(sel.focusNode, sel.focusOffset);

            // Handle the case when the selection was selected backwards (from the end to the start in the document)
            if (range.collapsed !== sel.isCollapsed) {
                range.setStart(sel.focusNode, sel.focusOffset);
                range.setEnd(sel.anchorNode, sel.anchorOffset);
            }
       }

        if (range) {
           container = range[isStart ? "startContainer" : "endContainer"];

           // Check if the container is a text node and return its parent if so
           return container.nodeType === 3 ? container.parentNode : container;
        }   
    }
}

/*****************************************************************/

if (text != ""){
  anchorN = text.anchorNode;
  anchorO = text.anchorOffset;
  focusN = text.focusNode;
  focusO = text.focusOffset;

  if (anchorO % 1 === 0){
    node = getSelectionBoundaryElement(true);
    node = node.nodeName;
    chrome.runtime.sendMessage({anchorO: anchorO.toString(), focusO: focusO.toString(), node: node.toString()});
  }

  //document.body.style.backgroundColor="red"
}
