window.proxy = (function(p) {

    p.getVar = function() {
        injectFuncToPage(getWinVar, '"q1"');
    };

    p.executeScriptOnPage = function(scriptCode) {
        injectCodeToPage(scriptCode);
    };

    p.getOrigin = function() {
        sendResponse("getOrigin", window.location.origin);
    };

    function sendResponse(key, data) {

        chrome.runtime.sendMessage({
            type: key,
            data: data
        });
    }

    function getWinVar(varName) {

        //alert(window[varName]);

        window.postMessage({
            type: "FROM_PAGE",
            text: window[varName]
        }, "*");
        //TODO: window.postMessage to interact
    }

    removeEndChar = function(script) {

        var escapedScript = script.replace(/\¿/gm, "\n");

        return escapedScript;
    };

    function injectCodeToPage(code) {
        var script = document.createElement('script');
        script.textContent = '(function(){' + removeEndChar(code) + '})();';
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
    }

    function injectFuncToPage(code, args) {
        var script = document.createElement('script');
        script.textContent = '(' + code + ')(' + (args || '') + ');';
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
    }

    return p;

})(window.proxy || {});

var port = chrome.runtime.connect();

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "FROM_PAGE")) {
        console.log("Content script received: " + event.data.text);
        //port.postMessage(event.data.text);

        chrome.runtime.sendMessage({
            type: "anyTypeToBackground",
            data: event.data.text
        });


    }
}, false);