var PING_INTERVAL = 3000;
var extensionOn = false;

// TODO: Initialization - Provide URL/IP ADDR to server. Listen for updates.
// Currently - Turns extension on and off to periodically ping server.
chrome.browserAction.onClicked.addListener(function(tab) {
  extensionOn = !(extensionOn);
  
  if (extensionOn) {
    startExtension();
  }
  else {
    stopExtension();
  } 

});

// TODO: Upon visit to new URL, tell other clients to change to said URL.
// Currently - Changes all open tabs to new URL.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (extensionOn) {
    chrome.tabs.query({'lastFocusedWindow': true}, function(allTabs) {
      for (var i=0; i < allTabs.length; i+=1) {
        chrome.tabs.update(allTabs[i].id, {'url': changeInfo.url},
          function(){}); 
      };
    });
  }
});

function startExtension() {
  console.log("Extension is on");
  sendPing();

  timerId = window.setTimeout(startExtension, PING_INTERVAL);
}

function stopExtension() {
  clearTimeout(timerId);
  console.log("Extension is off.");
}

function sendPing() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status==200) {
          console.log(xhr.responseText);
        }
    };
    xhr.open("POST", "http://127.0.0.1:8880/ping?color=red", true);
    //xhr.setRequestHeader();
    xhr.send();
}