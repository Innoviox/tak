var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
  console.log('listening on 0.0.0.0:3000');
});
