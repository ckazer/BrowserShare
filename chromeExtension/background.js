var PING_INTERVAL = 3000;
var extensionOn = false;

// TODO: HTTP Get Security?
// TODO: Initialization - Provide URL/IP ADDR to server.
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


// TODO: Convert periodic action from pinging to listening for updates.
function startExtension() {
  console.log("Extension is on");
  sendRequest("ping", ["sender=masterClient"], function(response) {
    console.log(response.message);
  });

  timerId = window.setTimeout(startExtension, PING_INTERVAL);
}


function stopExtension() {
  clearTimeout(timerId);
  console.log("Extension is off.");
}


function sendRequest(action, params, callback) {
    var url = createURL(action, params);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status==200) {
          var data = JSON.parse(xhr.responseText);
          callback(data);
        }
    };
    xhr.open("POST", url, true);
    //xhr.open("POST", "http://127.0.0.1:8880/ping?sender=masterClient", true);
    //xhr.setRequestHeader(); 
    xhr.send();
}


function createURL(action, params) {
  var url = "http://127.0.0.1:8880/";
  url += action;
  url += "?";
  for (i in params) {
    url += params[i];
  }
  return url;
}