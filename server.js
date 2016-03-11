var express = require('express');
var app = express(app);
var server = require('http').createServer(app);
var cors = require('cors');
require('dotenv').load();

var twilClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// serve static files from the current directory
app.use(express.static(__dirname));

app.use(cors());
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

  //Send an SMS text message
  twilClient.sendMessage({
      to:'+19182901127', // Any number Twilio can deliver to
      from: '+19187314092', // A number you bought from Twilio and can use for outbound communication
      body: 'Someone is playing your game, dude!' // body of the SMS message
  });
	
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

server.listen(process.env.PORT || 3000);