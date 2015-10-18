var CONST = {
    AutoCheckOut: 'autoCheckOut',
    SaveInAllFrames: 'saveInAllFrames',
    LibUrl: 'libUrl',
};

var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

var chbAutoCheckOut = document.getElementById('chbAutoCheckOut');
chbAutoCheckOut.checked = localStorage[CONST.AutoCheckOut] === 'true';
chbAutoCheckOut.addEventListener('click', function(event) {
    localStorage[CONST.AutoCheckOut] = event.target.checked;
});

var chbSaveAllFrames = document.getElementById('chbSaveAllFrames');
chbSaveAllFrames.checked = localStorage[CONST.SaveInAllFrames] === 'true';
chbSaveAllFrames.addEventListener('click', function(event) {
    localStorage[CONST.SaveInAllFrames] = event.target.checked;
});

var txtLibUrl = document.getElementById('txtLibUrl');
txtLibUrl.value = localStorage[CONST.LibUrl] ? localStorage[CONST.LibUrl] : 'SiteAssets';

var btnSave = document.getElementById('btnSave');
btnSave.onclick = function(event) {
    localStorage[CONST.LibUrl] = txtLibUrl.value;

    backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        code: 'SPush.defaultLibUrl="' + txtLibUrl.value + '";'
    });
};