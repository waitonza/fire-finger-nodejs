// Require HTTP module (to start server) and Socket.IO
var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var app = express();

var server = module.exports = http.createServer(app);
var io = require("socket.io").listen(server);
var port = process.env.PORT;
var db = mongoose.createConnection('mongodb://heroku_app9450213:jjtbcgk82tuns322rtqbcaf5tt@ds045157.mongolab.com:45157/heroku_app9450213');

var singleSchema = mongoose.Schema({player_fb_id: String,
                                    player_fb_fname: String,
                                    player_fb_lname: String,
                                    player_fb_pic_url : String,
                                    player_score: Number });
var mutiSchema = mongoose.Schema({player_fb_id: String,
                                  player_fb_fname: String,
                                  player_fb_lname: String,
                                  player_fb_pic_url : String,
                                  player_win: Number,
                                  player_lose: Number });

server.listen(port, function() {
  console.log("Listening on " + port);
});

app.post('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

// TODO make port configurable

var buffer = []
  , number_of_rooms = 50
  , rooms = []
  ;

for(var i = 0; i < number_of_rooms; i++) {
  rooms[i] = {count: 0}; //, round_started: false};
}   

function get_list_of_rooms() {
  var list_of_rooms = {number_of_rooms: number_of_rooms, rooms: []}
  for(var i = 0; i < number_of_rooms; i++) {
    var player1 = rooms[i].player1 || {};
    var player2 = rooms[i].player2 || {};
    if (rooms[i].count == 1) {
        player2 = {};
    } else if (rooms[i].count == 0) {
        player1 = {};
        player2 = {};
    }
    list_of_rooms['rooms'].push({number_of_connected_players: rooms[i].count, player1: player1, player2: player2 })
  }
  return list_of_rooms;
}


function find_room_and_disconnect_by_session_id(id) {
  for(var i = 0; i < number_of_rooms; i++) {
    var room = rooms[i];
    if(room.count > 0) {
      if(room.player1_id == id) {
        room.player1_id = null;
        room.count -= 1;
        break;
      } else if(room.player2_id == id) {
        room.player2_id = null;
        room.count -= 1;
        break;
      }
    }
  }
}

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10);
  io.set('log level', 1); // reduce logging
  io.set('close timeout', 60);
});

io.sockets.on('connection', function(socket) {
  socket.emit('list_of_rooms', get_list_of_rooms());
  
  socket.on('list_of_rooms', function() {
    socket.emit('list_of_rooms', get_list_of_rooms());  
  });

  socket.on('disconnect', function() {
    // make sure that socket's room_id variable is set, so we could keep table of connected users relevant
    console.log('disconnect form other');
    if(socket.room_id != null) {
      rooms[socket.room_id].count -= 1;
      find_room_and_disconnect_by_session_id(socket.id);
      socket.leave('room#'+socket.room_id);
    }
    io.sockets.json.emit('list_of_rooms', get_list_of_rooms());
  });

  socket.on('disconnect_room_id', function(msg) {
    // make sure that socket's room_id variable is set, so we could keep table of connected users relevant
    console.log(msg);
    if(msg.room_id != null) {
      rooms[msg.room_id].count -= 1;
      socket.leave('room#'+msg.room_id);
    }
    io.sockets.json.emit('list_of_rooms', get_list_of_rooms());
    console.log(get_list_of_rooms());
  });

  socket.on('multi_score_sent', function(msg) {
    /*
    var MutiScore = db.model('MutiScore', mutiSchema);
    
    MutiScore.findOne({"player_fb_id": msg.player_fb_id}, function(e,r) {
      console.log(r);
      if (r == null) {
        var sc = new MutiScore(msg);
        sc.save(function (err) {
          if (err) // ...
            console.log('error');
        });
        console.log('Create new player profile id : ' + msg.player_fb_id);
      } else {
        console.log('Update player profile id : ' + msg.player_fb_id);
        // do your updates here
        if (msg.player_score >= r.player_score) {
          console.log('New score was update');
          SingleScores.update({"player_fb_id": msg.player_fb_id}, {$set: { "player_score": msg.player_score }}, {upsert: true}, function(err) {
            if (err) {
              console.log('It cannot save!');
            }
          });
        } else {
          console.log("New score wasn't update");
        }
      }
    });
    */
  
  });
  
  socket.on('single_score_sent', function(msg) {
    
    var SingleScores = db.model('SingleScores', singleSchema);
    
    SingleScores.findOne({"player_fb_id": msg.player_fb_id}, function(e,r) {
      console.log(r);
      if (r == null) {
        var sc = new SingleScores(msg);
        sc.save(function (err) {
          if (err) // ...
            console.log('error');
        });
        console.log('Create new player profile id : ' + msg.player_fb_id);
      } else {
        console.log('Update player profile id : ' + msg.player_fb_id);
        // do your updates here
        if (msg.player_score >= r.player_score) {
          console.log('New score was update');
          SingleScores.update({"player_fb_id": msg.player_fb_id}, {$set: { "player_score": msg.player_score }}, {upsert: true}, function(err) {
            if (err) {
              console.log('It cannot save!');
            }
          });
        } else {
          console.log("New score wasn't update");
        }
      }
    });
  
  });
  
  socket.on('round_started', function(msg) {
    //console.log(msg);
    io.sockets.in('room#'+msg.room_id).json.emit('round_started', msg);
  });
  
  socket.on('word_sync', function(msg) {
    io.sockets.in('room#'+msg.room_id).emit('word_sync', msg);
  });

  socket.on('score_sync', function(msg) {
    io.sockets.in('room#'+msg.room_id).emit('score_sync', msg);
  });

  socket.on('player_ty_sync', function(msg) {
    io.sockets.in('room#'+msg.room_id).emit('player_ty_sync', msg);
  });

  socket.on('player_spcae_sync', function(msg) {
    io.sockets.in('room#'+msg.room_id).emit('player_spcae_sync', msg);
  });
  
  socket.on('end_of_the_round', function(msg) {
    //selected_room.set_round_started(false);
    io.sockets.in('room#'+msg.room_id).json.emit("end_of_the_round", msg);
  });
        
  socket.on('connect', function(msg) {
    console.log(msg);
    socket.join('room#' + msg.room_id);
    socket.room_id = msg.room_id;
    find_room_and_disconnect_by_session_id(socket.id);
    rooms[msg.room_id].count += 1;

    if (rooms[msg.room_id].count == 2 && rooms[msg.room_id].player1['fb_id'] == msg.fb_id) {
      rooms[msg.room_id].count -= 1;
    }
    
    if(rooms[msg.room_id].count == 1) {
      rooms[msg.room_id].player1 = {};
      rooms[msg.room_id].player1_id = socket.id;
      rooms[msg.room_id].player1['fb_name'] = msg.fb_name;
      rooms[msg.room_id].player1['fb_first_name'] = msg.fb_first_name;
      rooms[msg.room_id].player1['fb_last_name'] = msg.fb_last_name;
      rooms[msg.room_id].player1['fb_id'] = msg.fb_id;
    } else {
      rooms[msg.room_id].player2 = {};
      rooms[msg.room_id].player2_id = socket.id;
      rooms[msg.room_id].player2['fb_name'] = msg.fb_name;
      rooms[msg.room_id].player2['fb_first_name'] = msg.fb_first_name;
      rooms[msg.room_id].player2['fb_last_name'] = msg.fb_last_name;
      rooms[msg.room_id].player2['fb_id'] = msg.fb_id;
    }
    console.log(rooms);
    
    // check whether this connected user was not connected to the other room on the same server
    if(rooms[msg.room_id].count == 1) {
      socket.json.emit('player_connected', {player_id: 1, room_id: msg.room_id, player1: rooms[msg.room_id].player1});
    } else if(rooms[msg.room_id].count == 2) {
      // when second player has connected, 1st player could had moved up or down his default position, so show him right cordinates in buffer variable
      io.sockets.in('room#'+msg.room_id).json.emit('player_connected', {player_id: 2, room_id: msg.room_id, player1: rooms[msg.room_id].player1, player2: rooms[msg.room_id].player2});// buffer: buffer
    }
    
    io.sockets.json.emit('list_of_rooms', get_list_of_rooms());
    console.log(get_list_of_rooms());
  })

});