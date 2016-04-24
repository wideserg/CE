requirejs.config({
    baseUrl: '../scripts',
    paths: {
        knockout: './external/knockout-3.2.0',
        komapping: './external/ko.mapping',
        jsmode: './external/codemirror.jsmode',
    },
    shim: {
        komapping: {
            deps: ['knockout'],
            exports: 'komapping'
        }
    },
    packages: [{
        name: "codemirror",
        location: "./external",
        main: "codemirror"
    }]
});

// Start the main app logic.
requirejs(['knockout', 'komapping', 'codemirror', 'consts', 'jsmode'],
    function(ko, komapping, codemirror, CONSTS) {
        ko.mapping = komapping;

        ko.bindingHandlers.codemirror = {

            init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var options = valueAccessor();
                var editor = codemirror.fromTextArea(element, options);

                editor.on('change', function(cm) {
                    allBindingsAccessor().value(cm.getValue());
                    bindingContext.$parent.newChanges(true);
                });

                element.editor = editor;
                if (allBindingsAccessor().value()) {
                    editor.setValue(allBindingsAccessor().value());
                }
                editor.refresh();

                var wrapperElement = editor.getWrapperElement();

                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    wrapperElement.remove();
                });
            },
            update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var editor = element.editor;
                editor.refresh();
            }
        };

        var OptionsModel = function(scripts) {
            var self = this;

            self.scripts = scripts;

            self.addScript = function() {
                self.scripts.push(new ScriptModel());

                self.newChanges(true);
            };

            self.saveAllScripts = function() {
                localStorage[CONSTS.LS.Scripts] = ko.mapping.toJSON(self.scripts);

                self.newChanges(false);
            };

            self.removeScript = function(scriptData) {
                self.scripts.remove(scriptData);

                self.newChanges(true);
            };

            self.exportJSON = function() {
                var fileName = 'sandwich.confg';

                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(ko.toJSON(self.scripts))); //text/plain
                element.setAttribute('download', fileName);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            };

            self.importJSON = function() {

                if (confirm("Are you sure to replace all buttons with imported?")) {
                    //self.scripts.removeAll();
                    var newScripts = JSON.parse(importedData);
                    for (var id in newScripts) {

                        var newScript = ko.mapping.fromJS(newScripts[id], ScriptModel.mapping);
                        self.scripts.push(newScript);
                    }

                    self.importIsLoaded(false);
                    self.newChanges(true);
                }

            };

            self.handleFile = function(data, evt) {
                var files = evt.target.files; // FileList object
                f = files[0];
                var reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = (function(theFile) {
                    return function(e) {
                        // Render thumbnail.
                        var jsonObj = e.target.result
                        var b64Parts = jsonObj.split(',');

                        importedData = atob(b64Parts[b64Parts.length - 1]);
                        self.importIsLoaded(true);

                        console.log(importedData);
                    };
                })(f);

                // Read in the image file as a data URL.
                reader.readAsDataURL(f);
            };

            self.importIsLoaded = ko.observable(false);
            self.newChanges = ko.observable(false);

            var importedData = null;
        };

        function ScriptModel(data) {
            var self = this;

            if (data) {
                ko.mapping.fromJS(data, {}, self);
            } else {
                self.name = ko.observable('');
                self.group = ko.observable('');
                self.script = ko.observable('');
            }

            self.isFull = ko.observable(false);
            self.toggleViewMode = function() {

                self.isFull(!self.isFull());
            };

            return self;
        }

        ScriptModel.mapping = {
            create: function(options) {
                return new ScriptModel(options.data);
            }
        };

        var myScripts = localStorage[CONSTS.LS.Scripts] ? ko.mapping.fromJS(JSON.parse(localStorage[CONSTS.LS.Scripts]), ScriptModel.mapping) : ko.mapping.fromJS(CONSTS.Sample, ScriptModel.mapping);
        var viewModel = new OptionsModel(myScripts);

        ko.applyBindings(viewModel);
    }
);



//remove comments: .replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[\w\s\']*$)|(\<![\-\-\s\w\>\/]*\>)/gm,'')