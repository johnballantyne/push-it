var socket = io('/push-it');
var fingerprint2str;
var vid = document.getElementById('bigvid');
var bg = document.getElementsByClassName('push-it')[0];
var clients = [];

fingerprint2str = localStorage.getItem('fingerprint2');
var uri = document.createElement('a');
uri.href = document.URL;

if (bg !== null) {
    bg.addEventListener('click', function () {
        resetVid();
    }, false);
}

function resetVid() {
    vid.pause();
    vid.currentTime = 0;
    vid.muted = false;
    vid.style.visibility = "inherit";
}

socket.on('connect', function () {
    console.log('Firing. Room: %s', uri.pathname);
    if (!localStorage.getItem('fingerprint2')) {
        console.log('No Fingerprint found. Setting...');
        new Fingerprint2().get(function (result) {
            fingerprint2str = result;
            localStorage.setItem('fingerprint2', result);
            socket.emit('client connected', {
                'fp2str': fingerprint2str,
                'room': uri.pathname
            });
        });
    } else {
        socket.emit('client connected', {
            'fp2str': fingerprint2str,
            'room': uri.pathname
        });
    }
});

socket.on('push it', function (data) {
    console.log('Pushed.');
    resetVid();
    vid.play();
});

socket.on('clients update', function (data) {
    console.log('Clients:');
    console.log(data);
});
