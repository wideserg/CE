// Copyright (c) 2015 Sergey Shiroky. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Background page -- background.js
//Long lived connection
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

//Content script onload request
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.host == "proxy")
            sendResponse({
                code: 'SPush.defaultLibUrl="' + localStorage['libUrl'] + '";'
            });
    });