var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);

require('dotenv').load();
// serve static files from the current directory
app.use(express.static(__dirname));

//we'll keep clients data here
var clients = {};
  
//get EurecaServer class
var Eureca = require('eureca.io')

//create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:['setId', 'spawnEnemy', 'kill', 'updateState']});

//attach eureca.io to our http server
eurecaServer.attach(server);

app.set('port', (process.env.PORT || 3000));

//eureca.io provides events to detect clients connect/disconnect

//detect client connection
eurecaServer.onConnect(function (conn) {    
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);
	
	//the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);    
	
	//register the client
	clients[conn.id] = {id:conn.id, remote:remote}
	
	//here we call setId (defined in the client side)
	remote.setId(conn.id);	
});

//detect client disconnection
eurecaServer.onDisconnect(function (conn) {    
    console.log('Client disconnected ', conn.id);
	
	// var removeId = clients[conn.id].id;
	
	delete clients[conn.id];
	
	for (var c in clients)
	{
		var remote = clients[c].remote;
		
		//here we call kill() method defined in the client side
		remote.kill(conn.id);
	}	
});

eurecaServer.exports.deletePlayer = function(id) {
	
	clients[id].laststate.alive = false;
	for (var c in clients)
	{
		var remote = clients[c].remote;
		//here we call kill() method defined in the client side
		remote.kill(id);
	}	
}


eurecaServer.exports.handshake = function()
{
	for (var c in clients)
	{
		var remote = clients[c].remote;
		for (var cc in clients)
		{		
			//send latest known position
			var x = clients[cc].laststate ? clients[cc].laststate.x:  0;
			var y = clients[cc].laststate ? clients[cc].laststate.y:  0;



			if(clients[cc].laststate && clients[cc].laststate.alive){
				// console.log("clients[cc].laststate:", clients[cc].laststate)
				remote.spawnEnemy(clients[cc].id, x, y, clients[cc].laststate.avatarType);		
			}
		}
	}
}


//be exposed to client side
eurecaServer.exports.handleKeys = function (keys) {
	var conn = this.connection;
	var updatedClient = clients[conn.id];
	updatedClient.laststate = keys;

	for (var c in clients)
	{
		// console.log("keys:", keys)
		var remote = clients[c].remote;
		remote.updateState(updatedClient.id, keys);
		//keep last known state so we can send it to new connected clients
	}
}
// server.listen(process.env.PORT || 3000);

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});