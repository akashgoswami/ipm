#!/usr/bin/env node

var rest = require('restler');
var IOTA = require('iota.lib.js');
var express = require('express')
var app = express()
var server = require('http').Server(app);
var io = require('socket.io')(server);
var async = require('async');
var minimist = require('minimist');
var basicAuth = require('express-basic-auth');
var jsonfile = require('jsonfile')

var gNodeInfo = {};
var gPeerInfo = [];
var gTags = {};

var tagFileName = (process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] || process.cwd()) +"/iota-pm.conf";

jsonfile.readFile(tagFileName, function(err, obj) {
      if (err) {
          console.log("Unable to locate any previous tag file at", tagFileName);
      }
      else if (obj) {
          console.log("Restored tags from ", tagFileName);          
          gTags = Object.assign(gTags, obj);
      }
});


function generator(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

var sockets = [];


var argv = minimist(process.argv.slice(2), {
    string: [ 'iri' ],    
    alias: {
        h: 'help',
        i: 'iri',
        u: 'auth',        
        r: 'refresh',
        p: 'port'
    }
});

if (argv.refresh) {
    if (argv.refresh < 5 || argv.refresh > 600 )   
    {
        console.log("Refresh Value must be within 5 to 600 seconds.");
        process.exit(0);
    }
}



app.use(express.static(__dirname+'/public'));

if (argv.help) printHelp();

function printHelp()
{

    console.log("IPM:    IOTA Peer Manager");
    console.log("        Manage and monitor IOTA peer health status in beautiful dashboard.");    

    console.log("Usage:");        
    console.log("iota-pm [--iri=iri_api_url] [--port=your_local_port] [--refresh=interval]");
    console.log("  -i --iri       = The API endpoint for IOTA IRI implementation (Full Node). ");
    console.log("  -p --port      = Local server IP and port where the dashboard web server should be running");    
    console.log("  -r --refresh   = Refresh interval in seconds for IRI statistics gathering (default 10s)");    
    console.log("  -h --help      = print this message");    
    console.log("");            
    console.log("Example.");            
    console.log("iota-pm -i http://127.0.0.1:14800 -p 127.0.0.1:8888");            
    console.log("IPM will connect to IOTA endpoint and produce the status at localhost port 8888");            
    console.log("To view the dashboard, simply open a browser and point to http://127.0.0.1:8888");                
    console.log("");       
    process.exit(0);
};


function saveConfig (){
    jsonfile.writeFile(tagFileName, gTags, {spaces: 2}, function (err) {
    if (err) console.error(err);
    });
}

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
            s.emit('result', "Peer added Successfully. Please also update your IRI config file (if required)");
            updatePeerInfo();
        }
        });
        saveConfig();
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
            s.emit('peerDeleted', data);            
        }
        });
    }
    catch(e){
        s.emit('result', e.message);
    }
  });
  
  s.on('updateTag', function (data) {
       gTags[data.address] = data.tag;
       saveConfig();
  });

});

// Create IOTA instance directly with provider
var iota = new IOTA({
    'provider': (argv.iri || 'http://localhost:14800')
});

function updateNodeInfo(){
    sockets.forEach(function (s){
        s.emit('nodeInfo', gNodeInfo);
    });
}

function updatePeerInfo(peer){
    gPeerInfo.forEach(function(peer){
           peer.tag = gTags[peer.address] || 'Unknown Peer';
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
        //console.log(peers);
        gPeerInfo = peers;
        updatePeerInfo();
    }
});    
}

setInterval(function(){
// now you can start using all of the functions
    getNeighbours();
}, argv.refresh*1000 || 10000);


function getSystemInfo(){

iota.api.getNodeInfo(function(error, success) {
    if (error) {
        console.error(error);
    } else {
        //console.log(success);
        gNodeInfo = success;
        updateNodeInfo();
    }
});
    
}

getSystemInfo();
getNeighbours();
    
setInterval(function(){
    getSystemInfo();
},30000);

var port = 8888;
var host = "127.0.0.1";

if (typeof argv.port === 'string'){
    var portArgs = argv.port.split(':');
    port = portArgs[1];
    host = portArgs[0];    
}
else if (argv.port){
    port = argv.port;
}

console.log("Serving IOTA peer dashboard at http://"+host+":"+port);

server.listen(port,host);