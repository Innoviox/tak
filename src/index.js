var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Airtable = require('airtable');
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: ''
});
var base = Airtable.base('appvViVoTQrAVwGwR');

base('Table 1').select({
    view: "Grid view"
}).eachPage(function page(records, fetchNextPage) {
    records.forEach(function(record) {
        console.log('Retrieved', record.get('Username'));
    });

    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
});

// Serve scripts, css, and resources
app.use(express.static('public'));

app.get('/', function(req, res){
  console.log(__dirname);
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3001, function(){
  console.log('listening on 0.0.0.0:3001');
});
