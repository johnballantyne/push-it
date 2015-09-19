var socket = io();
var vid = document.getElementById('bigvid');

setInterval(function () { console.log(vid.buffered.end(0)) }, 17);


socket.on('push it', function (data) {
    console.log('Pushed.');
    vid.pause();
    vid.currentTime = 0;
    vid.muted = false;
    vid.style.visibility = "inherit";
    vid.play();
});

