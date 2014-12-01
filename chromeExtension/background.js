/*******(╯°□°）╯︵ ┻━┻-----------TODO-----------┬──┬◡ﾉ(° -°ﾉ)***************/
/*
 * Functionality: 1. Connect to EC2
 *                2. Add increasing integer to track current page -- DONE
 *                3. Is there a way to handle repeated, quick navigations?
 *                4. Research/add highlighting
 *                5. Write content script for highlighting
 *
 * Follow-up/polishing: 1. Robust code for initially connecting to server
 *                      2. Master/slave mode
 *                      3. Set text from text box
 *                      4. Democratic vote mode?
 *
 * Experiments: 1. Does it even funciton?
 *              2. How quickly can we send pings before it breaks?
 *              3. How much overhead is associated with the ping?
 *              4. 
*/
/*******(」゜ロ゜)」--------------------------------щ(゜ロ゜щ)**************/



var PING_INTERVAL = 3000;
var CHROME_TAB_LOADED = "complete";
var extensionOn = false;
var serverURL = undefined;

var updateInflight = false; // Replace with better consistency model/algorithm?
var oldURL = undefined;
var counter = 0;
var launchedTab = undefined;


// TODO: HTTP Get Security?
// Later TODO: Initialization - Tell server if master or slave.
// Currently - Turns extension on and off to periodically ping server.
chrome.browserAction.onClicked.addListener(function(tab) {
  extensionOn = !(extensionOn);

  if (extensionOn) { 
    var input = initExtension();

    if (input != null) {
      console.log("Extension is on");
      startExtension();
    }
    else {
      extensionOn = false;
      console.log("Null URL entered. Extension turned off.");
    }
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
    chrome.tabs.query({'lastFocusedWindow': true, 'active': true}, 
      function(curTab) {

      // console.log(changeInfo);
      // console.log("Tab: " + tab.url);
      // console.log("OldURL: " + oldURL);
      //console.log("launchedTab: " + launchedTab.toString());
      if (((changeInfo.url != undefined) || (tab.url != oldURL)) 
                     && curTab[0].id == launchedTab) {
        //console.log("CURR TAB: " + curTab[0].id.toString());
        // Accounts for two ways URL updates are reflected in Chrome.
        if (changeInfo.url != undefined) {
          params = ["url=" + changeInfo.url, "counter=" + counter.toString()];
        }
        else if (tab.url != oldURL) {
          params = ["url=" + tab.url, "counter=" + counter.toString()];
        }

        updateInflight = true; // Temporary "consistency model~"
        // Send request only once, when tab has completely loaded new URL.
        if (changeInfo.status == CHROME_TAB_LOADED) {
          counter ++; //Counter gets incremented here because it's certain
                      //this happens once per update
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
    });
  }
});


//TODO: Check user input for valid remote server URL.
/* initExtension -
 * sets up connection to server, or returns null if cancelled
 * Also sets the launchedTab variable which restricts the extension
 * to work only on the launchedTab
 * */
function initExtension() {


  var input = window.prompt("Please enter URL of server.", "Server URL");
  if (input == null) {
    return null;
  }

  chrome.tabs.query({'lastFocusedWindow': true, 'active': true}, 
    function(curTab) {
      launchedTab = curTab[0].id;
  });

  serverURL = input;
  return input;
}


// Later TODO: Affect only a unique tab instead of 'active' tabs?
// TODO: Account for inputted server URL.
function startExtension() {
  sendRequest("ping", ["sender=masterClient"], function(response) {
        console.log("Server URL: " + response.curURL);
        if (updateInflight == false) {
          chrome.tabs.query({'lastFocusedWindow': true, 'active': true}, 
            function(curTab) {
              if((curTab[0].url != response.curURL) && 
                       (curTab[0].id == launchedTab) && 
                              (counter > response.counter)){
                chrome.tabs.update(curTab[0].id, {'url': response.curURL},
                  function(){});
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
  serverURL = undefined;
  launchedTab = undefined;
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
  var url = serverURL;
  url += action;
  url += "?";
  for (i in params) {
    url += encodeURIComponent(params[i]);
    if (i != params.length-1) {
      url += "&";
    }
  }
  return url;
}
