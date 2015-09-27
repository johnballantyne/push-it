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

// Match: /[word]/[word] or /[word]/[word]/
app.get(/^\/\w+\/\w+\/?$/, function (req, res) {
    res.sendFile('push-it.html', { 'root': __dirname + '/public/' });
});

app.use(function(req, res, next) {
    res.status(404).sendFile('404.html', { 'root': __dirname + '/public/' });
});
var clients = {};

function clientsInRoom(nsp, room) {
    var clients = io.of(nsp).adapter.rooms[room];
    if (clients) {
        return Object.keys(clients).length;
    } else {
        return 0;
    }
}

function totalClients() {
    console.log('Number of rooms: %s', totalRooms());
    return Object.keys(pushitio.connected).length;
}

/*********************************************
 * http://stackoverflow.com/a/31210008/1832306
 *********************************************/
function totalRooms() {
    var availableRooms = [];
    var rooms = pushitio.adapter.rooms;
    console.log(JSON.stringify(rooms)); 
    if (rooms) {
        for (var room in rooms) {
            if (!rooms[room].hasOwnProperty(room)) {
            availableRooms.push(room);
            }
        }
    }
    return availableRooms.length;
}

pushitio.on('connection', function(socket){
    github.setActive(true);
    github.getCommits(function annoyEveryone() {
        pushitio.emit('push it', 'test');
    });

    socket.on('client connected', function (data) {
        if (!data.room.match(/^\/\w+\/\w+\/?/)) {
            console.log(data.room);
            console.log('Someone probably tinkered with the client side code');
            return;
        }


        console.log('Joining: %s', data.room);
        socket.join(data.room);
        console.log('Total clients: %s', totalClients());
        console.log('%s clients in room %s', clientsInRoom('/push-it', data.room), data.room);
        console.log('%s roster:', data.room);
        for (var id in io.of('/push-it').adapter.rooms[data.room]) {
            console.log("    Client:" + io.of('/push-it').adapter.nsp.connected[id]);
        };
    });

    socket.on('disconnect', function (data) {
        if (!totalRooms()) {
            github.setActive(false);
        }
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

