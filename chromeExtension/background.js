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
 */
/*******(」゜ロ゜)」--------------------------------щ(゜ロ゜щ)**************/



var PING_INTERVAL = 3000;
var CHROME_TAB_LOADED = "complete";
var extensionOn = false;

var serverURL = undefined; // URL of remote server that forwards updates
var updateInflight = false; // Replace with better consistency model/algorithm?
var oldURL = undefined; //URL of the last page visited
var counter = 0; // Increasing counter that tracks if we're ahead of the server
var launchedTab = undefined; // Tab the extension was launched on
var ID = undefined; // ID of whether this server is a master or slave


// TODO: HTTP Get Security?
chrome.browserAction.onClicked.addListener(function(tab) {
  //Switches extension on/off
  extensionOn = !(extensionOn);

  if (extensionOn) { 
    var inputAddr = initExtension();

    if (inputAddr != null) {
      console.log("Extension is on");
      runExtension();
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

// Attempts to catch when preloading changes the ID of a tab, and updates
// launchedTab
chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId){
  console.log("TAB WAS REPLACED");
  console.log("launchedTab: " + launchedTab.toString());
  console.log("removedTabId: " + removedTabId.toString());
  console.log("addedTabId: " + addedTabId.toString());
  
  if(removedTabId == launchedTab){
    launchedTab = addedTabId;
  }
});

// Upon visit to new URL, tell server of new URL.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  //console.log("ID: " + ID);
  //console.log("launchedTab: " + launchedTab);
  // Only send an update if the extension is on, we're a master, and we're on
  // the launched tab
  if (extensionOn && (ID=="m")) {
    chrome.tabs.query({'lastFocusedWindow': true, 'active': true}, 
      function(curTab) {

      // console.log(changeInfo);
      // console.log("Tab: " + tab.url);
      // console.log("OldURL: " + oldURL);
      
      // console.log("launchedTab: " + launchedTab.toString());
      // console.log("CURR TAB: " + curTab[0].id.toString());
      if (((changeInfo.url != undefined) || (tab.url != oldURL)) 
                     && curTab[0].id == launchedTab) {
        // Accounts for two ways URL updates are reflected in Chrome.
        if (changeInfo.url != undefined) {
          counter ++;
          params = ["url=" + changeInfo.url, "counter=" + counter.toString()];
        }
        else if (tab.url != oldURL) {
          counter ++;
          params = ["url=" + tab.url, "counter=" + counter.toString()];
        }

        updateInflight = true; 
        // Send request only once, when tab has completely loaded new URL.
        if (changeInfo.status == CHROME_TAB_LOADED) {
          //counter ++; //Counter gets incremented here because it's certain
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
 * Sets up connection to server, or returns null if cancelled
 * 
 * Sets the launchedTab variable which restricts the extension
 * to work only on the launchedTab
 * 
 * Sets the ID of the extension to be a master or slave
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

  ID = window.prompt("Are you participating as a master(m) or slave(s)?");

  serverURL = input;
  return input;
}

/* runExtension
 *
 * Main body of extension that executes pings to the server and updates
 * the local tab's URL.
 *
 * While the extension is on, it calls itself recursively asynchronously using
 * setTimeout()
 */
function runExtension() {
  sendRequest("ping", ["sender=masterClient"], function(response) {
        console.log("Server URL: " + response.curURL);
        if (updateInflight == false) {
          chrome.tabs.query({'lastFocusedWindow': true, 'active': true}, 
            function(curTab) {
              // Three conditions: 1. prevent unnecessary reloading
              //                   2. Are we in the correct tab?
              //                   3. Are we ahead of the update?
              if((curTab[0].url != response.curURL) && 
                       (curTab[0].id == launchedTab) && 
                              (counter <= response.counter)){
                chrome.tabs.update(curTab[0].id, {'url': response.curURL},
                  function(){});

                // We've caught up to the server, so set the counter to match
                // the server
                counter = response.counter;
              }
              oldURL = response.curURL;
            });
        }
  });
  timerId = window.setTimeout(runExtension, PING_INTERVAL);
}

// Clear out all of the stored globals
function stopExtension() {
  clearTimeout(timerId);
  serverURL = undefined;
  launchedTab = undefined;
  ID = undefined;
}

/* sendRequest - Sends a POST (GET?) request to server.
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
