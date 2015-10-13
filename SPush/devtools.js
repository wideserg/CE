// Copyright (c) 2015 Sergey Shiroky. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//TODO: create constants.js
var SPush = (function(sp) {
    sp.rewriteFile = function(fileUri, base64content, needCheckOut) {
        if (typeof window.SP !== 'undefined' && /*Is SP site*/
            fileUri.startsWith(_spPageContextInfo.siteAbsoluteUrl) && /*File belongs to this web*/
            !window._spushStarted && /*First SPush request*/
            fileUri.indexOf(SP.Utilities.Utility.layoutS_LATESTVERSION_URL) === -1 /*Isn`t a layouts resource*/
        ) {
            fileUri = RemoveUrlKeyValue("ctag", fileUri).replace('?', '');
            var relativePrefix = _spPageContextInfo.siteServerRelativeUrl === '/' ? '' : _spPageContextInfo.siteServerRelativeUrl;
            var fileRelativeUrl = relativePrefix + fileUri.substr(_spPageContextInfo.siteAbsoluteUrl.length);
            var pathParts = fileRelativeUrl.split('/');
            var fileName = pathParts[pathParts.length - 1]; /*'devtools.js';*/
            var folderRelativeUrl = fileRelativeUrl.substr(0, fileRelativeUrl.indexOf(fileName));

            folderRelativeUrl = URI.completeDecode(folderRelativeUrl);
            fileRelativeUrl = URI.completeDecode(fileRelativeUrl);

            var createInfo = new SP.FileCreationInformation();
            createInfo.set_content(base64content); /*setting the content of the new file*/
            createInfo.set_overwrite(true);
            createInfo.set_url(fileName);
            var ctx = new SP.ClientContext.get_current();
            if (needCheckOut) {
                this.file = ctx.get_web().getFileByServerRelativeUrl(fileRelativeUrl);
                this.file.checkOut();
            }
            this.files = ctx.get_web().getFolderByServerRelativeUrl(folderRelativeUrl).get_files();
            ctx.load(this.files);
            this.files.add(createInfo);
            if (needCheckOut) {
                this.file.checkIn();
            }

            /*Prevent double upload because onResourceContentCommitted can fire twice at sinle save action.*/
            window._spushStarted = true;
            ctx.executeQueryAsync(
                Function.createDelegate(this,
                    function() {
                        window._spushStarted = false;
                        console.log('SPush: File has been rewritten.', arguments);
                    }),
                Function.createDelegate(this,
                    function(ontext, info) {
                        window._spushStarted = false;
                        console.log('SPush: Rewrite file exception: ', info.get_message());
                    })
            );
        }
    };

    return sp;

})(SPush || {});

chrome.devtools.panels.sources.createSidebarPane(
    "SPush",
    function(sidebar) {
        sidebar.setPage("Sidebar/sidebar.html");
    });

chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function(fileInfo, content) {
    try {
        if (fileInfo.type === 'script' || fileInfo.type === 'stylesheet') {
            backgroundPageConnection.postMessage({
                tabId: chrome.devtools.inspectedWindow.tabId,
                code: '(' + SPush.rewriteFile + ')("' + fileInfo.url + '","' + Base64.encode(content) + '",' + (localStorage['autoCheckOut'] === 'true') + ');'
            });
        }
    } catch (er) {
        chrome.devtools.inspectedWindow.eval("console.error(\"" + er.toString() + "\");");
    }
});

var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // private method for UTF-8 encoding
    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }
}