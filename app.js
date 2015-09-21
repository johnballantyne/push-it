var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pushitio = io.of('/push-it');
var github = require('./github');

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile('index.html', { 'root': __dirname + '/public/' });
});

app.get(/w/, function (req, res) {
    res.sendFile('push-it.html', { 'root': __dirname + '/public/' });
});
var clients = {};

function updateClients(clientData) {
    pushitio.emit('clients update', clients);
}

pushitio.on('connection', function(socket){
    github.setActive(true);
    github.getCommits(function annoyEveryone() {
        pushitio.emit('push it', 'test');
    });

    socket.on('client connected', function (data) {
        console.log('Joining: %s', data.room);
        socket.join(data.room);
        console.log('Our rooms: %s', pushitio.rooms);
        updateClients(data);
        console.log("clients: " + clients);
    });

    socket.on('disconnect', function (data) {
        github.setActive(false);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

