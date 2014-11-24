var PING_INTERVAL = 3000;
var CHROME_TAB_LOADED = "complete";
var extensionOn = false;
var updateInflight = false; // Replace with better consistency model/algorithm?
var oldURL = undefined;
//records the old URL so updates aren't duplicated

// TODO: HTTP Get Security?
// Later TODO: Initialization - Tell server if master or slave.
// Currently - Turns extension on and off to periodically ping server.
chrome.browserAction.onClicked.addListener(function(tab) {
  extensionOn = !(extensionOn);

  if (extensionOn) {
    console.log("Extension is on");
    startExtension();
  }
  else {
    console.log("Extension is off.");
    stopExtension();
  } 

});

// NOTE: Apparently Chrome does not always pick up rapid tab changes
//       and instead attempts to reload the current URL.
// Upon visit to new URL, tell server of new URL.
// TODO: When the URL is forced to change after a ping, this gets called.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (extensionOn) {
    // console.log(changeInfo);
    // console.log("Tab: " + tab.url);
    // console.log("OldURL: " + oldURL);
    
    if (changeInfo.url != undefined || tab.url != oldURL) {
      // Accounts for two ways URL updates are reflected in Chrome.
      if (changeInfo.url != undefined) {
        params = ["url=" + changeInfo.url];
      }
      else if (tab.url != oldURL) {
        params = ["url=" + tab.url];
      }

      updateInflight = true; // Temporary "consistency model~"
      // Send request only once, when tab has completely loaded new URL.
      if (changeInfo.status == CHROME_TAB_LOADED) {
        sendRequest("URL_update", params, function(response) {
          if (response.message == true) {
            console.log("Server received updated URL.");
          }
          else {
            //TODO: Resend request upon failure?
            console.log("Server did not receive updated URL.")
          }
          updateInflight = false;
        });
      }
    }
  }
});

// Later TODO: Affect only a unique tab instead of 'active' tabs?
// TODO: Convert periodic action from pinging to listening for updates.
function startExtension() {
  sendRequest("ping", ["sender=masterClient"], function(response) {
        console.log("Server URL: " + response.curURL);
        if (updateInflight == false) {
          chrome.tabs.query({'lastFocusedWindow': true, 'active': true}, 
            function(allTabs) {
              for(var i=0; i<allTabs.length; i+=1){
                if(allTabs[i].url != response.curURL){
                  chrome.tabs.update(allTabs[i].id, {'url': response.curURL},
                    function(){});
                }
              }
              oldURL = response.curURL;
            });
        }
  });
  // TODO: Can we change this to setInterval()?
  timerId = window.setTimeout(startExtension, PING_INTERVAL);
}


function stopExtension() {
  clearTimeout(timerId);
}

/* sendRequest - Sends a GET request to server.
 * @param:
 *   action - A string representing the action server needs to respond to.
 *   params - List of strings to be added to GET request URL.
 *   callback - Callback function for server response.
 */
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

/* createURL - Helper function to create a URL string.
 * @param:
 *   action - A string representing action server needs to respond to.
 *   params - List of strings to be added to GET request URL.
 * @return:
 *   url - A string representing the constructed URL.
 */
function createURL(action, params) {
  var url = "http://127.0.0.1:8880/";
  url += action;
  url += "?";
  for (i in params) {
    url += params[i];
    if (i != params.length-1) {
      url += "&";
    }
  }
  return url;
}
