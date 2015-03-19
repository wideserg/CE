// Background page -- background.js
chrome.runtime.onConnect.addListener(function(devToolsConnection) {

    devToolsConnection.onMessage.addListener(devToolsListener);
    devToolsConnection.onDisconnect.addListener(disconnect);

    //Named functions issue !!!
    function devToolsListener(message, sender, sendResponse) {

        if (sender.name === "devtools-page") {
            chrome.tabs.executeScript(message.tabId, {
                    code: 'proxy.executeScriptOnPage("' + message.code.replace(/(\r)/gm, "\\").replace(/"/g, "\\\"") + '");',
                    allFrames: localStorage['saveInAllFrames'] === 'true'
                },
                function(argument) {
                    //debugger;
                }
            );
        }
    }

    function disconnect() {
        devToolsConnection.onMessage.removeListener(devToolsListener);
    }
});