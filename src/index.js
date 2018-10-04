var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookieParser = require('cookie-parser')

var Airtable = require('airtable');

Airtable.configure({endpointUrl: 'https://api.airtable.com', apiKey: ''});

var base = Airtable.base('appvViVoTQrAVwGwR');

function login(user, res) {
    res.cookie("username", user, {maxAge: 900000});
    res.redirect("/");
}

app.use(express.static('public'));
app.use(cookieParser());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/login', function(req, res) {
    console.log("got login request");
    base('Table 1').select({
        view: "Grid view",
        filterByFormula: "{Username} = \"" + req.query['username'] + "\""
    }).eachPage(function page(records, fetchNextPage) {
        records.forEach(function(record) {
            if (record.get("Password") == req.query['password']) {
                login(record.get("Username"), res);
                return;
            }
        });
    }, function done(err) {
        if (err) {
            console.log(err);
            return;
        }
    });
});

app.get('/create', function(req, res) {
    console.log("got create request");
    base('Table 1').create({
        "Username": req.query['username'],
        "Password": req.query['password'],
        "Admin?": false
    }, function(err, record) {
        if (err) {
            console.error(err);
            return;
        }
        login(req.query['username'], res);
    });
})

var players = {};
io.sockets.on('connection', function(socket) {
    socket.on('send', function(data) {
        io.sockets.emit('update-chat', socket.username, data);
    });

    socket.on('add-user', function(username) {
        socket.username = username;
        players[username] = username;
        socket.emit('update-chat', '[AUTO-MSG', 'you have connected]');
        socket.broadcast.emit('update-chat', '[AUTO-MSG', username + ' has connected]');
        io.sockets.emit('update-players', players);
    });

    socket.on('disconnect', function() {
        delete players[socket.username];
        io.sockets.emit('update-players', players);
        socket.broadcast.emit('update-chat', '[AUTO-MSG', socket.username + ' has disconnected]');
    });
});

http.listen(3001, function() {
    console.log('listening on 0.0.0.0:3001');
});
