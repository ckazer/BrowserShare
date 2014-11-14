//var i = 0
chrome.browserAction.onClicked.addListener(function(tab) {
//  i += 1
//  console.log("You are now Browser Sharing!!");
//  console.log(i)
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://127.0.0.1:8000", true);
    xhr.onreadystagechange = function() {
        if (xhr.readyState == 4) {
          var resp = xhr.responseText
        }
    }
    xhr.send();
});
