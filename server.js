var users		= {};
var port		= 3000;
var express		= require('express');
var app			= express();
var server		= require('http').createServer(app);
var io			= require('socket.io').listen(server);

server.listen(port);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/app/index.html');
});

io.sockets.on('connection', function(socket) {
	
	socket.on('new_user', function(data, callback) {
		if (data in users) 
		{
			callback(false);
		} 
		else 
		{
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket;
			updateUsers();
		}
	});
	
	function updateUsers() 
	{
		io.sockets.emit('usernames', Object.keys(users));
	}
	
	socket.on('send_message', function(data, callback) {
		var msg = data.trim();
		
		if (msg == '') return callback(false);
		
		if (msg.substr(0, 3) === '/w ') 
		{
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if (ind !== -1) 
			{
				var name = msg.substr(0, ind);
				var msg = msg.substr(ind + 1);
				if (name in users) 
				{
					users[name].emit('whisper', {username: socket.nickname, data: msg});
					console.log('Whisper');
				} 
				else 
				{
					callback('Error: Please enter a valid user!');
				}
			} 
			else 
			{
				callback('Error: Please enter a message for your whisper!');
			}
		} 
		else 
		{
			io.sockets.emit('new_message', {username: socket.nickname, data: msg});
		}
		
	});
	
	socket.on('disconnect', function(data) {
		if (!socket.nickname) 
		{
			return;
		}
		delete users[socket.nickname];
		updateUsers();
	}); 
	
});

console.log('Server Started, listens port: ' + port);