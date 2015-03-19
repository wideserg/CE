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

            var fileRelativeUrl = fileUri.substr(_spPageContextInfo.siteAbsoluteUrl.length);
            var pathParts = fileRelativeUrl.split('/');
            var fileName = pathParts[pathParts.length - 1]; /*'devtools.js';*/
            var folderRelativeUrl = fileRelativeUrl.substr(0, fileRelativeUrl.indexOf(fileName));

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

    if (fileInfo.type === 'script' || fileInfo.type === 'stylesheet') {

        backgroundPageConnection.postMessage({
            tabId: chrome.devtools.inspectedWindow.tabId,
            code: '(' + SPush.rewriteFile + ')("' + fileInfo.url + '","' + btoa(content) + '",' + (localStorage['autoCheckOut'] === 'true') + ');'
        });
    }
});

var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});