var rest = require('restler');
var IOTA = require('iota.lib.js');
var express = require('express')
var app = express()
var server = require('http').Server(app);
var io = require('socket.io')(server);
var async = require('async');

app.use(express.static('public'))
var sockets = [];

io.on('connection', function (s) {
  sockets.push(s);

  s.emit('nodeInfo', gNodeInfo);

  updatePeerInfo();
  s.on('disconnect', function(data){
    var i = sockets.indexOf(s);
    if(i != -1) {
	    sockets.splice(i, 1);
    }
  });
  
  s.on('addPeer', function (data) {
    console.log("!!!!Adding peer",data);
    try{
        iota.api.addNeighbors([data.address], function(error, result) {
        if (error) {
            console.error(error);
            s.emit('result', error.message);
        } else {
            console.log(result);
            s.emit('result', "Peer added Successfully");
            updatePeerInfo();
        }
        });
    }
    catch(e){
        s.emit('result', e.message);
    }
  });
  
  s.on('removePeer', function (data) {
    console.log("!!!!Removing peer",data);
    try {
        iota.api.removeNeighbors([data.address], function(error, result) {
        if (error) {
            console.error(error);
            s.emit('result', error.message);
        } else {
            console.log(result);
            s.emit('peerDeleted', data);            

        }
        });
    }
    catch(e){
        s.emit('result', e.message);
    }
  });
  

});

// Create IOTA instance with host and port as provider
var iota = new IOTA({
    'host': 'http://localhost',
    'port': 14800
});

// Create IOTA instance directly with provider
var iota = new IOTA({
    'provider': 'http://localhost:14800'
});

var gNodeInfo = {};
var gPeerInfo = [];

function updateNodeInfo(){
    sockets.forEach(function (s){
        s.emit('nodeInfo', gNodeInfo);
    });
}

function updatePeerInfo(peer){
    gPeerInfo.forEach(function(peer){
           sockets.forEach(function (s){
                s.emit('peerInfo', peer);
            });
    });
}


function getNeighbours(){
iota.api.getNeighbors(function(error, peers) {
    if (error) {
        console.error(error);
    } else {
        console.log(peers);
        gPeerInfo = peers;
        updatePeerInfo();
    }
});    
}

setInterval(function(){
// now you can start using all of the functions
    getNeighbours();
},5000);


function getSystemInfo(){

iota.api.getNodeInfo(function(error, success) {
    if (error) {
        console.error(error);
    } else {
        console.log(success);
        gNodeInfo = success;
        updateNodeInfo();
    }
});
    
}


setInterval(function(){
    getSystemInfo();
},10000);




server.listen(8888);
