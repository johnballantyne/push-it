var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var github = require('./github');

app.use(express.static('public'));

io.on('connection', function(socket){
    github.setActive(true);
    github.getCommits(function annoyEveryone() {
        io.emit('push it', 'test');
    });
    console.log('User conn');
    socket.on('disconnect', function () {
        github.setActive(false);
    });
});

io.on('disconnect', function(socket) {
    console.log('---Disconnect');
    github.setActive(false);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

