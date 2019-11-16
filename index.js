var app = require('express')();
var fs = require('fs');
var privateKey  = fs.readFileSync(__dirname + '/ssl/selfsigned.key', 'utf8');
var certificate = fs.readFileSync(__dirname + '/ssl/selfsigned.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var https = require('https').createServer(credentials, app);

var io = require('socket.io')(https);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var connections = [];

io.on('connection', function(socket){
  function log() {
		var array = [">>> "];
		for(var i = 0; i < arguments.length; i++) {
			array.push(arguments[i]);
		}
		socket.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Got message: ', message);
		socket.broadcast.emit('message', message); // should be room only
	});

	socket.on('create or join', function (room) {
		var numClients = io.sockets.clients(room).length;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);

		if(numClients == 0) {
			socket.join(room);
			socket.emit('created', room);
		} 

		else if(numClients == 1) {
			io.sockets.in(room).emit('join', room);
			socket.join(room);
			socket.emit('joined', room);
		} 

		else { // max two clients
			socket.emit('full', room);
		}

		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
	});
});

https.listen(3000, function(){
  console.log('listening on *:3000');
});