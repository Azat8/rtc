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
  console.log('a user connected');

    socket.on('user-connected', (user) => {
        connections.push(user);

        io.emit('new-user', connections);
    });
});

https.listen(3000, function(){
  console.log('listening on *:3000');
});