// Copyright (c) 2015 Sergey Shiroky. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//content script proxy
window.proxy = (function(p) {

    p.executeScriptOnPage = function(scriptCode) {
        injectCodeToPage(scriptCode);
    };

    function injectCodeToPage(code) {
        var script = document.createElement('script');
        script.textContent = '(function(){' + code + '})();';
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
    }

    return p;

})(window.proxy || {});

injectHost = function() {

    function completeDecode(c) {
        if (typeof c == "undefined" || c == null)
            return c;
        var b = c,
            d = decodeURIComponent(b);
        while (b != d) {
            b = d;
            d = decodeURIComponent(b)
        }
        return b;
    };

    window.SPush = (function() {

        function quickCreate(codeOrUrl) {

            var defaultLib = SPush.defaultLibUrl || 'SiteAssets';
            var cssSampleContent = "body{ //SPush: your css here }";
            var jsSampleContent = "//SPush: your js here ";
            var cssCode = 'css';
            var jsCode = 'js';
            var extension = getExtension(codeOrUrl);

            if (codeOrUrl === cssCode) {

                var fileUrl = SP.Utilities.UrlBuilder.urlCombine(_spPageContextInfo.webAbsoluteUrl, defaultLib + '/style.css');
                SPush.uploadFile(fileUrl, btoa(cssSampleContent), false, onWriteSuccess);
            } else if (codeOrUrl === jsCode) {

                var fileUrl = SP.Utilities.UrlBuilder.urlCombine(_spPageContextInfo.webAbsoluteUrl, defaultLib + '/script.js');
                SPush.uploadFile(fileUrl, btoa(jsSampleContent), false, onWriteSuccess);

            } else {

                SPush.uploadFile(codeOrUrl, extension === cssCode ? btoa(cssSampleContent) : btoa(jsSampleContent), false, onWriteSuccess);
            }

            function onWriteSuccess(relativeUrl) {

                var addedFileFormat = 'File {0} is loaded to current page.';

                if (extension === cssCode) {
                    if (registerCssLink) {
                        registerCssLink(relativeUrl, function() {

                            console.log(String.format(addedFileFormat, relativeUrl));
                        }, function() {});
                    } else {

                        console.log('Cannot AUTO register css in this page.')
                    }
                } else if (extension === jsCode) {
                    if (loadScript) {
                        loadScript(relativeUrl, function() {

                            console.log(String.format(addedFileFormat, relativeUrl));
                        }, function() {});
                    } else {

                        console.log('Cannot AUTO register js in this page.')
                    }
                }
            }
        };

        function getExtension(url) {

            var urlParts = url.split('?');
            var extensionParts = urlParts[0].split('.');

            return extensionParts[extensionParts.length - 1];

        }

        function injectCss(source, callback) {
            var css = 'h1 { background: red; }',
                head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            style.onload = style.onreadystatechange = function(_, isAbort) {
                if (isAbort || !style.readyState || /loaded|complete/.test(style.readyState)) {
                    style.onload = style.onreadystatechange = null;
                    style = undefined;

                    if (!isAbort) {
                        if (callback)
                            callback();
                    }
                }
            };

            head.appendChild(style);
        }

        function loadScript(source, callback) {

            var script = document.createElement('script');
            var prior = document.getElementsByTagName('script')[0];
            script.async = 1;
            prior.parentNode.insertBefore(script, prior);

            script.onload = script.onreadystatechange = function(_, isAbort) {
                if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                    script.onload = script.onreadystatechange = null;
                    script = undefined;

                    if (!isAbort) {
                        if (callback)
                            callback();
                    }
                }
            };

            script.src = source;
        }

        return quickCreate;
    })();

    window.SPush.uploadFile = function(fileUri, base64content, needCheckOut, fSuccess, fFail) {

        fileUri = RemoveUrlKeyValue("ctag", fileUri).replace('?', '');
        var relativePrefix = _spPageContextInfo.siteServerRelativeUrl === '/' ? '' : _spPageContextInfo.siteServerRelativeUrl;
        var fileRelativeUrl = relativePrefix + fileUri.substr(_spPageContextInfo.siteAbsoluteUrl.length);

        var pathParts = fileRelativeUrl.split('/');
        var fileName = pathParts[pathParts.length - 1];
        var folderRelativeUrl = fileRelativeUrl.substr(0, fileRelativeUrl.indexOf(fileName));

        folderRelativeUrl = completeDecode(folderRelativeUrl);
        fileRelativeUrl = completeDecode(fileRelativeUrl);

        var createInfo = new SP.FileCreationInformation();
        createInfo.set_content(base64content);
        createInfo.set_overwrite(true);
        createInfo.set_url(fileName);

        var ctx = new SP.ClientContext.get_current();
        var file;

        if (needCheckOut) {
            file = ctx.get_web().getFileByServerRelativeUrl(fileRelativeUrl);
            file.checkOut();
        }

        var files = ctx.get_web().getFolderByServerRelativeUrl(folderRelativeUrl).get_files();
        file = files.add(createInfo);

        ctx.load(file);
        ctx.load(files);

        if (needCheckOut) {
            file.checkIn();
        }

        /*Prevent double upload because onResourceContentCommitted can fire twice at sinle save action.*/
        ctx.executeQueryAsync(
            Function.createDelegate(this,
                function() {
                    window._spushStarted = false;

                    var fileUrl = file.get_serverRelativeUrl();
                    console.log(String.format('SPush: File has been rewritten. ({0})', fileUrl));

                    fSuccess && fSuccess(fileUrl);
                }),
            Function.createDelegate(this,
                function(ontext, info) {
                    window._spushStarted = false;
                    console.log('SPush: Rewrite file exception: ', info.get_message());

                    fFail && fFail(info);
                }));
    };
};

chrome.runtime.sendMessage({
    host: 'proxy'
}, function(data) {
    window.proxy.executeScriptOnPage(data.code);
});

window.proxy.executeScriptOnPage('(' + injectHost + ')();');