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