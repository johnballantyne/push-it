var socket = io();

socket.on('push it', function (data) {
    document.getElementsByTagName('video')[0].play();
    console.log('Pushed.');
});

