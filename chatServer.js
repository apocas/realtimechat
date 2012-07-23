var sys = require('sys');
var fs      = require('fs');
var socket = require('socket.io')
var express = require('express')
, http = require('http');

var app = express();

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({
        secret: 'keyboard cat'
    }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
    fs.readFile(__dirname + '/index.html', 'utf8', function(err, text){
        
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

        res.cookie('skynetl','yes',{
            maxAge: 2592000000
        });

        res.send(text);
    });
});

var server = http.createServer(app).listen(88, function(){
    console.log("Express server listening on port " + 88);
});

var io = socket.listen(server);



var clients = new Array();

function broadcast(event, msg) {
    for(var i = 0; i < clients.length; i++){
        clients[i].socket.emit(event, msg);
    }
}

function removeClient(c){
    for(var i = 0; i < clients.length; i++){
        if(clients[i].socket.id == c.id) {
            clients.splice(i,1);
        }
    }
}

function getClientName(c){
    for(var i = 0; i < clients.length; i++){
        if(clients[i].socket.id == c.id) {
            return clients[i].name;
        }
    }
    return null;
}

function getClientByName(name){
    for(var i = 0; i < clients.length; i++){
        if(clients[i].name.toLowerCase() == name.toLowerCase()) {
            return clients[i];
        }
    }
    return null;
}

io.sockets.on('connection', function (client) {
    
    client.on('list', function(msg) {
        for(var i = 0; i < clients.length; i++){
            if(clients[i].socket.id != client.id){
                client.emit("add", clients[i].name);
            }
        }
    });
    
    client.on('enter', function(msg) {
        if(getClientByName(msg) == null){
            clients.push(new Client(msg, client));
            client.emit("success");
            broadcast("add", msg);
        } else {
            client.emit("errorc","Username already exists!");
        }
    });
    
    client.on('send', function(msg) {
        if(msg.msg.indexOf('!ping') !== -1) {
            var n = msg.msg.split(" ");
            if(n.length == 2) {
                var cc = getClientByName(n[1]);
                if(cc != null) {
                    cc.socket.emit("ping",{
                        name: msg.name, 
                        time: currentTime()
                    });
                } else {
                    
                }
            }
        }
        
        broadcast("msg", {
            name: msg.name, 
            msg: msg.msg,
            time: currentTime()
        });
        
    });
    
    client.on('disconnect', function() {
        broadcast("remove", getClientName(client));
        removeClient(client);
    });

});


var Client = function (name , socket){
    this.name = name;
    this.socket = socket;
}

function currentTime() {
    var objToday = new Date(),
    curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
    curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
    curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds();
    var now = curHour + ":" + curMinute + ":" + curSeconds;
    return now;
}