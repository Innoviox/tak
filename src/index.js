var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookieParser = require('cookie-parser');
var xss = require('xss');

var Airtable = require('airtable');

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'key0S23VokV1zvdT0'
});

var base = Airtable.base('appvViVoTQrAVwGwR');
var players = {};

function login(user, res) {
    res.cookie("username", user, {
        maxAge: 900000
    });
}

app.use(express.static('public'));
app.use(cookieParser());

app.get('/', function (req, res) {
    console.log("got / request", req.query);
    io.sockets.emit("reload-players");
    io.sockets.emit('update-players', players);
    if (req.query['login']) {
        io.sockets.emit('login-correct-toaster', req.query["username"]);
    }
    res.sendFile(__dirname + '/index.html');
});

app.get('/login', function (req, res) {
    console.log("got login request");
    base('Table 1').select({
        view: "Grid view",
        filterByFormula: "{Username} = \"" + req.query['username'] + "\""
    }).eachPage(function page(records, fetchNextPage) {
        records.forEach(function (record) {
            if (record.get("Password") == req.query['password']) {
                login(record.get("Username"), res);
                res.redirect("/?login=true&username=" + record.get("Username"));
                return;
            }
        });
    }, function done(err) {
        if (err) {
            console.log(err);
            return;
        }
        res.redirect("/?login=false");
    });
});

app.get('/create', function (req, res) {
    console.log("got create request");
    base('Table 1').create({
        "Username": req.query['username'],
        "Password": req.query['password'],
        "Admin?": false
    }, function (err, record) {
        if (err) {
            console.error(err);
            res.redirect("/?created=false")
            return;
        }
        login(req.query['username'], res);
        res.redirect("/?created=true");
        return;
    });
})

io.sockets.on('connection', function (socket) {
    socket.on('send', function (data) {
        io.sockets.emit('update-chat', socket.username, xss(data));
    });

    socket.on('add-user', function (username) {
        var sanitized = xss(username);
        socket.username = sanitized;
        players[sanitized] = sanitized;
        socket.emit('update-chat', '[AUTO-MSG', 'you have connected]');
        socket.broadcast.emit('update-chat', '[AUTO-MSG', sanitized + ' has connected]');
        io.sockets.emit('update-players', players);
    });

    socket.on('disconnect', function () {
        delete players[socket.username];
        io.sockets.emit('update-players', players);
        socket.broadcast.emit('update-chat', '[AUTO-MSG', socket.username + ' has disconnected]');
    });

    socket.on('remove-user', function (data) {
        delete players[data];
        io.sockets.emit('update-players', players);
        socket.broadcast.emit('update-chat', '[AUTO-MSG', data + ' has disconnected]');
    });
});

http.listen(3001, function () {
    console.log('listening on 0.0.0.0:3001');
});