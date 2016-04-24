define(function() {

    var utils = {};

    utils.escapeEndInScript = function(script) {

        var escapedScript = script.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/$/gm, "¿\\");
        escapedScript = escapedScript.substr(0, escapedScript.length - 2);

        return escapedScript;
    };

    utils.groupBy = function(arr, selector) {
        var _selector = selector ? selector : function(o) {
            return o;
        };

        var _map = {};
        var put = function(map, key, value) {
            if (!map[_selector(key)]) {
                map[_selector(key)] = {};
                map[_selector(key)].group = [];
                map[_selector(key)].key = key;

            }
            map[_selector(key)].group.push(value);
        }

        arr.map(function(obj) {
            put(_map, obj, obj);
        });

        return Object.keys(_map).map(function(key) {
            return {
                key: _map[key].key,
                group: _map[key].group
            };
        });
    };

    return utils;
});

//load from GITHub test
/*jQuery.get('https://raw.githubusercontent.com/wideserg/SP/master/spscrolltop/SP.ScrollTop.js', function(content){ 

var script = document.createElement('script');
        script.textContent = '(function(){' + content+ '})();';
        (document.head || document.documentElement).appendChild(script);
        script.parentNode.removeChild(script);
 })*/