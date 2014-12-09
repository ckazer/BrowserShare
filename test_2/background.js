var extensionOn = false;
var timerID = undefined;

var websites = ["http://www.google.com", "http://www.facebook.com", "http://en.wikipedia.org", "http://www.youtube.com", "http://www.yahoo.com", "http://www.cs.swarthmore.edu", "http://www.github.com", "http://www.linkedin.com", "chrome://extensions", "http://www.yennycheung.com"];
var website_index = 0;
var cyclingCurTab = undefined;
var website_count = 0;
var tripup_count = 0;
var EXPERIMENT_ITERATIONS = 40;

var UPDATE_INTERVAL = 1000;

function runTest(){
  chrome.tabs.query({'lastFocusedWindow': true, 'active': true}, 
      function(curTab){
    chrome.tabs.update(curTab[0].id, {'url': websites[website_count]},
      function(){
      if (website_count == 9){
        website_count = 0;
      } else{
        website_count++;
      }
    });
  });
  timerID = window.setTimeout(runTest, UPDATE_INTERVAL);
}

chrome.browserAction.onClicked.addListener(function(tab) {
  extensionOn = !(extensionOn);

  if(extensionOn){
    runTest();
  } else {
    clearTimeout(timerID);
  }
});
