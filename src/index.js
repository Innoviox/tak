const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser');
const xss = require('xss');
const Airtable = require('airtable');

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'key0S23VokV1zvdT0'
});

var base = Airtable.base('appvViVoTQrAVwGwR');
var players = {};
var current_board = undefined;
function login(user, res) {
    res.cookie("username", user, {
        maxAge: 900000000
    });
}

app.use(express.static('public'));
app.use(cookieParser());

app.get('/', function (req, res) {
    console.log("got / request", req.query);
    io.sockets.emit("reload-players");
    io.sockets.emit('update-players', players);
    if (req.query['login'] !== undefined) {
        io.sockets.emit('login-toaster', req.query["username"], req.query['login']);
    } else if (req.query['created'] !== undefined) {
        io.sockets.emit('create-toaster', req.query["username"], req.query["created"])
    }
    res.sendFile(__dirname + '/index.html');
});

app.get('/logout', function(req, res) {
    console.log("got logout request", req.query);
    delete players[req.query['username']];
    res.clearCookie("username");
    res.redirect("/");
    res.end();
});

app.get('/login', function (req, res) {
    console.log("got login request");
    base('Table 1').select({
        view: "Grid view",
        filterByFormula: "{Username} = \"" + req.query['username'] + "\""
    }).eachPage(function page(records, fetchNextPage) {
        records.forEach(function (record) {
            if (record.get("Password") === req.query['password']) {
                login(record.get("Username"), res);
                res.redirect("/?login=true&username=" + record.get("Username"));
                res.end();
            }
        });
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.log(err);
            return;
        }
        if (!res.finished) {
            res.redirect("/?login=false&username=" + req.query['curr_sock_user']);
            res.end();
        }
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
            res.redirect("/?created=false&username=" + req.query['username']);
            res.end();
            return;
        }
        login(req.query['username'], res);
        res.redirect("/?created=true&username=" + req.query['username']);
        res.end();
    });
})

io.sockets.on('connection', function (socket) {
    socket.on('send', function (data) {
        io.sockets.emit('update-chat', socket.username, xss(data));
    });

    socket.on("made-move", function(username, move, board) {
        console.log("made move");
        current_board = board;
        io.sockets.emit("make-move", username, move, board);
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
    console.log("attaching current board", current_board);
    io.sockets.emit("update-board", current_board);
});

http.listen(3000, function () {
    console.log('listening on 0.0.0.0:3000');
});