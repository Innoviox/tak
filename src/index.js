var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookieParser = require('cookie-parser')

var Airtable = require('airtable');

Airtable.configure({endpointUrl: 'https://api.airtable.com', apiKey: ''});

var base = Airtable.base('appvViVoTQrAVwGwR');

// Serve scripts, css, and resources
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
                res.cookie("username", record.get("Username"), {maxAge: 900000});
                res.redirect("/");
                return;
            }
        });
    }, function done(err) {
        if (err) {
            console.log(err);
            return;
        }
    });
})

io.on('connection', function(socket) {
    console.log('a user connected');
});

http.listen(3001, function() {
    console.log('listening on 0.0.0.0:3001');
});
