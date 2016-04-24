chrome.windows.getCurrent({}, function(w) {
    document.body.style.width = w.width / 3 + 'px';
});

requirejs.config({
    baseUrl: '../scripts',
    paths: {
        ko: './external/knockout-3.2.0',
    }
});

// Start the main app logic.
requirejs(['ko', 'consts', 'utils'],
    function(ko, CONSTS, utils) {

        var ScriptModel = function(scripts) {
            var self = this;

            self.grouppedScripts = utils.groupBy(scripts, function(o) {
                return o.group;
            });

            self.isEditMode = ko.observable(false);

            self.toggleEditMode = function() {
                self.isEditMode(!self.isEditMode());
            };

            self.executeScript = function(scriptData) {

                chrome.tabs.executeScript({
                    code: 'proxy.executeScriptOnPage("' + utils.escapeEndInScript(scriptData.script) + '");'
                });
            };
        };

        var scripts = localStorage[CONSTS.LS.Scripts] ? JSON.parse(localStorage[CONSTS.LS.Scripts]) : CONSTS.Sample;

        var viewModel = new ScriptModel(scripts);
        ko.applyBindings(viewModel);
    }
);