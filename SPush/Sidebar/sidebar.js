var chbAutoCheckOut = document.getElementById('chbAutoCheckOut');
chbAutoCheckOut.checked = localStorage['autoCheckOut'] === 'true';
chbAutoCheckOut.addEventListener('click', function(event) {
    localStorage['autoCheckOut'] = event.target.checked;
});

var chbSaveAllFrames = document.getElementById('chbSaveAllFrames');
chbSaveAllFrames.checked = localStorage['saveInAllFrames'] === 'true';
chbSaveAllFrames.addEventListener('click', function(event) {
    localStorage['saveInAllFrames'] = event.target.checked;
});