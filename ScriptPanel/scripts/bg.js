chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  debugger;
    switch(request.type) {
        case "script-loaded":
            alert(request.data);
        default:
            alert(request.data);
        break;
    }
    return true;
});