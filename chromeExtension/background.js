//var i = 0
chrome.browserAction.onClicked.addListener(function(tab) {
//  i += 1
//  console.log("You are now Browser Sharing!!");
//  console.log(i)
//  chrome API to get TAB URL
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status==200) {
          console.log(xhr.responseText);
        }
    };
    xhr.open("POST", "http://127.0.0.1:8880/ping", true);
    //xhr.setRequestHeader();
    xhr.send();
  
  /*chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.query({'lastFocusedWindow': true}, function(allTabs){
      for(var i=0; i<allTabs.length; i+=1){
        chrome.tabs.update(allTabs[i].id, {'url': changeInfo.url},
          function(){}); 
      };
    });
  });*/
});
