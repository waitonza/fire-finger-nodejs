"use strict";

var socket = io.connect();
var current_room_id;
var current_player_id;
var width = 760;
var height = 640;
var comfirm_p1 = false;
var comfirm_p2 = false;
var end_game = false;
var rooms_lists;

window.onload = function() {
    //create the canvas
    Crafty.init(width, height);
    Crafty.canvas.init();
    //Fix the text format
    Crafty.c("TextFormat", {
        init: function() {
            this._textFont = {
                "type": "",
                "weight": "",
                "size": "",
                "family": ""
            }
        }
    });
    //Set the background color
    Crafty.background('rgb(0,0,0)');
    //The start scene
    Crafty.scene("Start", function() {
        Crafty.audio.play("bg",-1,0.5);
        //The background image
        Crafty.e("2D,DOM,Text,Image").image('img/bg.png').attr({
            x: 0,
            y: 0,
            w: width,
            h: height
        });
        //Game Name text
        Crafty.e("Game,2D,DOM,Text,TextFormat,Mouse").text("FIRE FINGER").textColor("#ffffff").textFont({
            size: "36px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 250,
            w: width,
            h: 20
        }).css('text-align', 'center')
        //Single player text
        Crafty.e("Single,2D,DOM,Text,TextFormat,Mouse").text("SINGLE PLAYER").textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 330,
            w: width,
            h: 20
        }).css('text-align', 'center')
        .bind("Click", function() {
            Crafty.scene("Single");
            Crafty.scene("Single");
        }).bind("MouseOver",function(){
            this.textColor("#ff0000");
        }).bind("MouseOut",function(){
            this.textColor("#ffffff");
        });
        //Multiplayer text
        Crafty.e("Muti-menu ,2D,DOM,Text,TextFormat,Mouse").text("MULTI PLAYER").textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 370,
            w: width,
            h: 20
        }).css('text-align', 'center')
        .bind("Click",function(){
            Crafty.scene("Multi-menu");
        }).bind("MouseOver",function(){
            this.textColor("#ff0000");
        }).bind("MouseOut",function(){
            this.textColor("#ffffff");
        });
        //Invite Friends text
        Crafty.e("Invite,2D,DOM,Text,TextFormat,Mouse").text("INVITE FRIEND").textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 410,
            w: width,
            h: 20
        }).css('text-align', 'center')
        .bind("Click", function() {
            sendRequestViaMultiFriendSelector();
        }).bind("MouseOver",function(){
            this.textColor("#ff0000");
        }).bind("MouseOut",function(){
            this.textColor("#ffffff");
        });
        //Credit text
        Crafty.e("Credit,2D,DOM,Text,TextFormat,Mouse").text("CREDIT").textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 450,
            w: width,
            h: 20
        }).css('text-align', 'center')
        .bind("MouseOver",function(){
            this.textColor("#ff0000");
        }).bind("MouseOut",function(){
            this.textColor("#ffffff");
        });
        //Developed by who text
        Crafty.e("Developed,2D,DOM,Text,TextFormat").text("Developed by Spark Studio").textColor("#ffffff").textFont({
            size: "14px",
            family: "Trebuchet MS",
            type: "Italic"
        }).attr({
            x: 0,
            y: 620,
            w: width
        }).css('text-align', 'center');
    });
    //The single player seen
    Crafty.scene("Single", function() {
        //Get the current FPS
        var FPS = +Crafty.timer.getFPS();
        //Set the base line that the word will start to disappear
        var baseLine = 535;
        //The current text of the play, current text that was typed.
        var player_text = "";
        var score = 0;
        var hp = 100;
        
        // Current difficulty
        var second_per_word = 3.2;
        
        var counter = 0;
        
        //The background
        Crafty.e("2D,DOM,Text,Image").image('img/frame.png').attr({
            x: 0,
            y: 0,
            w: width,
            h: height
        });
        //Baseline
        Crafty.e("2D,DOM,Text,Image").image('img/baseline_white.png').attr({
            x: 225,
            y: 520,
            //Middle at 521, for now put at 519 to 523
            w: width,
            h: height
        });
        //The score text
        Crafty.e("Score,2D,DOM,Text,TextFormat").text("Score : " + this.score).textColor("#000000").textFont({
            size: "16px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 250,
            y: 615,
            width: width
        })
        //The hp text
        Crafty.e("Hp,2D,DOM,Text,TextFormat").text("HP : " + hp).textColor("#000000").textFont({
            size: "16px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 480,
            y: 615,
            width: width
        })
        //The current player text
        Crafty.e("Player,2D,DOM,Text,TextFormat").text(player_text).textColor("#000000").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 570,
            w: width
        }).css('text-align', 'center')
        //Display the current player text
        .bind("KeyDown", function(e) {
            function isAlphabet(c) {
                return /^[a-zA-Z()]$/.test(c);
            }

            function startWith(str, pattern) {
                return pattern.length > 0 && pattern == str.substr(0, pattern.length);
            }
            if (isAlphabet(String.fromCharCode(e.key))) {
                
                if (player_text.length == 0) player_text += String.fromCharCode(e.key).toUpperCase();
                else player_text += String.fromCharCode(e.key).toLowerCase();
                
                var match = false;
                
                Crafty("Words").each(function() {
                    
                    if( this._textColor == "rgb(0,255,0)" || player_text.length == 0 ) return;
                    
                    if( player_text == this.text() ){
                        match = true;
                        this.textColor("#00ff00");
                        player_text = "";
                    }else if (startWith(this.text(), player_text)){
                        match = true;
                        this.textColor("#ff0000");
                    }else{
                        this.textColor("#ffffff");
                    }
                });
                
                if(!match){   
                    Crafty("Words").each(function() {
                        if (this._textColor != "rgb(0,255,0)" && startWith(this.text(),String.fromCharCode(e.key).toUpperCase()) ){
                            match = true;
                            this.textColor("#ff0000");
                            player_text = String.fromCharCode(e.key).toUpperCase();
                        }
                    });
                }
                
                if(!match) player_text = "";
                
                // Sound playing
                if (!match) {
                    Crafty.audio.play("type_wrong");
                }else{
                    Crafty.audio.play("type_correct");
                }
                
            }else if( e.key == Crafty.keys["SPACE"] ){
                player_text = "";
                Crafty("Words").each(function(){
                    if (this._textColor == "rgb(0,255,0)") {
                        if (this.y > 519 && this.y < 523) {
                            score += 6 * this.text().length;
                            this.destroy();
                            Crafty.audio.play("hit");
                        } else if (this.y > 518 && this.y < 524) {
                            score += 4 * this.text().length;
                            this.destroy();
                            Crafty.audio.play("hit");
                        } else if (this.y >= 517 && this.y <= 525) {
                            score += 2 * this.text().length;
                            this.destroy();
                            Crafty.audio.play("hit");
                        }
                    }
                });
            }

            Crafty("Player").each(function() {
                this.text(player_text);
            })
        });
        
        Crafty.e().bind("EnterFrame", function() {
            
            if( hp <= 0 ) return;
            
            if ( Crafty.frame() % ( Math.round(second_per_word) * FPS) == 0) {
                
                counter++;
                
                if(counter % 5 == 0)
                    second_per_word = second_per_word * 0.9;
                
                var wordList = [];
                Crafty("Words").each(function() {
                    wordList.push(this.text());
                });
                
                var current_word = "";
                current_word = dic[Math.floor(Math.random() * dic.length)];
                current_word = current_word.substring(0,1).toUpperCase() + current_word.substr(1);

                while( wordList.indexOf(current_word) != -1 && current_word.length < 3) {
                    current_word = dic[Math.floor(Math.random() * dic.length)];
                    current_word = current_word.substring(0,1).toUpperCase() + current_word.substr(1);
                };
                
                var random_x = Crafty.math.randomInt(232, 535);
                if (current_word.width() + random_x >= 520) {
                    random_x = 535 - current_word.width();
                }
                Crafty.e("Words,2D,DOM,Text,TextFormat").text(function() {
                    return current_word;
                }).textColor("#ffffff").textFont({
                    size: "16px",
                    family: "Trebuchet MS",
                    type: "Bold"
                }).attr({
                    x: random_x,
                    y: 29
                }).bind("EnterFrame", function() {
                    this.y += 1;
                    if (this.y == baseLine) {
                        if (this._textColor != "rgb(0,255,0)") {
                            hp -= this.text().length;
                            if( hp <= 0 ){
                                postToFeedSingle(score);
                                Crafty.scene("Over");
                            }
                        } else {
                            score += this.text().length;
                        }
                        this.destroy();
                    }
                });
            }
            Crafty("Score").each(function() {
                this.text("Score&nbsp:&nbsp;" + score);
            });
            Crafty("Hp").each(function() {
                this.text("Hp&nbsp:&nbsp" + hp);
            });
        })
    });

    //The Mutiplayer Menu scene
    Crafty.scene("Multi-menu", function() {
        Crafty.audio.play("bg",-1,0.5);
        //The background image
        Crafty.e("2D,DOM,Text,Image").image('img/bg.png').attr({
            x: 0,
            y: 0,
            w: width,
            h: height
        });
        //Game Name text
        Crafty.e("Game,2D,DOM,Text,TextFormat,Mouse").text("MULTI PLAYER MENU").textColor("#ffffff").textFont({
            size: "36px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 250,
            w: width,
            h: 20
        }).css('text-align', 'center')
        //Single player text
        Crafty.e("Single,2D,DOM,Text,TextFormat,Mouse").text("PLAY WITH FRIEND").textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 330,
            w: width,
            h: 20
        }).css('text-align', 'center')
        .bind("Click", function() {
            //Crafty.scene("Single");
        }).bind("MouseOver",function(){
            this.textColor("#ff0000");
        }).bind("MouseOut",function(){
            this.textColor("#ffffff");
        });
        //Multiplayer text
        Crafty.e("Multi ,2D,DOM,Text,TextFormat,Mouse").text("PLAY WITH RANDOM PLAYER").textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 370,
            w: width,
            h: 20
        }).css('text-align', 'center')
        .bind("Click",function(){
            socket.json.emit('list_of_rooms', { test: 1 });
            Crafty.scene("Multi-waiting");
        }).bind("MouseOver",function(){
            this.textColor("#ff0000");
        }).bind("MouseOut",function(){
            this.textColor("#ffffff");
        });
        //Back text
        Crafty.e("Back,2D,DOM,Text,TextFormat,Mouse").text("BACK").textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 410,
            w: width,
            h: 20
        }).css('text-align', 'center')
        .bind("Click", function() {
            Crafty.scene("Start");
        }).bind("MouseOver",function(){
            this.textColor("#ff0000");
        }).bind("MouseOut",function(){
            this.textColor("#ffffff");
        });
        //Developed by who text
        Crafty.e("Developed,2D,DOM,Text,TextFormat").text("Developed by Spark Studio").textColor("#ffffff").textFont({
            size: "14px",
            family: "Trebuchet MS",
            type: "Italic"
        }).attr({
            x: 0,
            y: 620,
            w: width
        }).css('text-align', 'center');
    });
    
    //The Mutiplayer Waiting Menu scene
    Crafty.scene("Multi-waiting", function() {
        Crafty.audio.play("bg",-1,0.5);
        var pass = false;
        for (var i = 0; i < 10; i++) {
            if(rooms_lists.rooms[i].number_of_connected_players == 1) {
                socket.json.emit('connect', {room_id: i, fb_id: userID, fb_name: my_name, fb_first_name: my_first_name, fb_last_name: my_last_name});
                pass = true;
            }   
        }
        if (!pass) {
            current_room_id = Math.floor((Math.random()*10));
            socket.json.emit('connect', {room_id: current_room_id, fb_id: userID, fb_name: my_name, fb_first_name: my_first_name, fb_last_name: my_last_name});
        }
        //The background image
        Crafty.e("2D,DOM,Text,Image").image('img/bg.png').attr({
            x: 0,
            y: 0,
            w: width,
            h: height
        });
        //Game Name text
        Crafty.e("Game,2D,DOM,Text,TextFormat,Mouse").text("MULTI PLAYER MENU").textColor("#ffffff").textFont({
            size: "36px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 250,
            w: width,
            h: 20
        }).css('text-align', 'center')
        //Finding player text
        Crafty.e("Single,2D,DOM,Text,TextFormat,Mouse").text("We're finding player, Waiting....").textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 330,
            w: width,
            h: 20
        }).css('text-align', 'center')
        .bind("Click", function() {
            Crafty.scene("Multi");
        });

        //Player 1 detail
        //pic
        Crafty.e("P1_fpic,2D,DOM,Text,Image").image(my_pic_url).attr({
            x: 270,
            y: 400,
            w: width,
            h: height
        });

        //first name
        Crafty.e("P1_fname,2D,DOM,Text,TextFormat,Mouse").text(my_first_name).textColor("#ffffff").textFont({
            size: "15px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: -85,
            y: 460,
            w: width,
            h: 15
        }).css('text-align', 'center')

        //last name
        Crafty.e("P1_lname,2D,DOM,Text,TextFormat,Mouse").text(my_last_name).textColor("#ffffff").textFont({
            size: "15px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: -85,
            y: 485,
            w: width,
            h: 15
        }).css('text-align', 'center')

        //VS text
        Crafty.e("VS,2D,DOM,Text,TextFormat,Mouse").text("VS").textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 410,
            w: width,
            h: 20
        }).css('text-align', 'center')

        //Blank player detail
        //pic
        Crafty.e("P2_fpic,2D,DOM,Text,Image").image('img/blank_fb_profile.jpg').attr({
            x: 440,
            y: 400,
            w: width,
            h: height
        });

        //first name
        Crafty.e("P2_fname,2D,DOM,Text,TextFormat,Mouse").text('Waiting').textColor("#ffffff").textFont({
            size: "15px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 85,
            y: 460,
            w: width,
            h: 15
        }).css('text-align', 'center')

        //last name
        Crafty.e("P2_lname,2D,DOM,Text,TextFormat,Mouse").text('Player').textColor("#ffffff").textFont({
            size: "15px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 85,
            y: 485,
            w: width,
            h: 15
        }).css('text-align', 'center')

        //Developed by who text
        Crafty.e("Developed,2D,DOM,Text,TextFormat").text("Developed by Spark Studio").textColor("#ffffff").textFont({
            size: "14px",
            family: "Trebuchet MS",
            type: "Italic"
        }).attr({
            x: 0,
            y: 620,
            w: width
        }).css('text-align', 'center');
    });

    Crafty.scene("Multi", function() {
        //Get the current FPS
        var FPS = +Crafty.timer.getFPS();
        //Set the base line that the word will start to disappear
        var baseLine = 535;
        //The current text of the play, current text that was typed.
        var player_text = "";
        var score = 0;
        var hp = 100;

        //The current text of the play, current text that was typed.
        var op_player_text = "";
        var op_score = 0;
        var op_hp = 100;
        
        // Current difficulty
        var second_per_word = 3;
        
        var counter = 0;
        
        socket.on('score_sync', function(obj){
            
            if (current_player_id == 1 && obj.current_player_id == 2) {
                op_score = obj.player_score;
                op_hp = obj.player_hp;
            } else if (current_player_id == 2 && obj.current_player_id == 1) {
                op_score = obj.player_score;
                op_hp = obj.player_hp;
            }

        });

        //The background image
        Crafty.e("2D,DOM,Text,Image").image('img/blue_fire_miti.png').attr({
            x: 0,
            y: 0,
            w: width,
            h: height
        });

        /**
         * Current player
         */

        //Current player baseline
        Crafty.e("2D,DOM,Text,Image").image('img/baseline_white.png').attr({
            x: 25,
            y: 520,
            //Middle at 521, for now put at 519 to 523
            w: width,
            h: height
        });

        //The current player score text
        Crafty.e("Score,2D,DOM,Text,TextFormat").text("Score : " + this.score).textColor("#000000").textFont({
            size: "16px",
            family: "nt"
        }).attr({
            x: 50,
            y: 615,
            width: width
        })
        //The hp current player text
        Crafty.e("Hp,2D,DOM,Text,TextFormat").text("HP : " + hp).textColor("#000000").textFont({
            size: "16px",
            family: "nt"
        }).attr({
            x: 280,
            y: 615,
            width: width
        })
        /*
        //The current player text
        Crafty.e("Player,2D,DOM,Text,TextFormat").text(player_text).textColor("#000000").textFont({
            size: "20px",
            family: "nt"
        }).attr({
            x: -200,
            y: 570,
            w: width
        }).css('text-align', 'center')
        */

        /**
         * Opponent player
         */
        
        Crafty.e("2D,DOM,Text,Image").image('img/baseline_white.png').attr({
            x: 420,
            y: 520,
            //Middle at 521, for now put at 519 to 523
            w: width,
            h: height
        });

        //The opponent player score text
        Crafty.e("Op_Score,2D,DOM,Text,TextFormat").text("Score : " + this.op_score).textColor("#000000").textFont({
            size: "16px",
            family: "nt"
        }).attr({
            x: 445,
            y: 615,
            width: width
        })
        //The hp opponent player text
        Crafty.e("Op_Hp,2D,DOM,Text,TextFormat").text("HP : " + op_hp).textColor("#000000").textFont({
            size: "16px",
            family: "nt"
        }).attr({
            x: 675,
            y: 615,
            width: width
        })

        /*
        //The opponent player text
        Crafty.e("Player,2D,DOM,Text,TextFormat").text(player_text).textColor("#000000").textFont({
            size: "20px",
            family: "nt"
        }).attr({
            x: 210,
            y: 570,
            w: width
        }).css('text-align', 'center')
        */

        //The current player text
        Crafty.e("Player,2D,DOM,Text,TextFormat").text(player_text).textColor("#000000").textFont({
            size: "20px",
            family: "nt"
        }).attr({
            x: -210,
            y: 570,
            w: width
        }).css('text-align', 'center')
        //Display the current player text
        .bind("KeyDown", function(e) {
            function isAlphabet(c) {
                return /^[a-zA-Z()]$/.test(c);
            }

            function startWith(str, pattern) {
                return pattern.length > 0 && pattern == str.substr(0, pattern.length);
            }
            
            if (isAlphabet(String.fromCharCode(e.key))) {
                
                if (player_text.length == 0) player_text += String.fromCharCode(e.key).toUpperCase();
                else player_text += String.fromCharCode(e.key).toLowerCase();
                
                var match = false;
                
                Crafty("Words").each(function() {
                    
                    if( this._textColor == "rgb(0,255,0)" || player_text.length == 0 ) return;
                    
                    if( player_text == this.text() ){
                        match = true;
                        this.textColor("#00ff00");
                        player_text = "";
                    }else if (startWith(this.text(), player_text)){
                        match = true;
                        this.textColor("#ff0000");
                    }else{
                        this.textColor("#ffffff");
                    }
                });
                
                if(!match){   
                    Crafty("Words").each(function() {
                        if (this._textColor != "rgb(0,255,0)" && startWith(this.text(),String.fromCharCode(e.key).toUpperCase()) ){
                            match = true;
                            this.textColor("#ff0000");
                            player_text = String.fromCharCode(e.key).toUpperCase();
                        }
                    });
                }
                
                if(!match) player_text = "";
                
                // Sound playing
                if (!match) {
                    Crafty.audio.play("type_wrong");
                }else{
                    Crafty.audio.play("type_correct");
                }
                
            }else if( e.key == Crafty.keys["SPACE"] ){
                player_text = "";
                Crafty("Words").each(function(){
                    if (this._textColor == "rgb(0,255,0)") {
                        if (this.y > 519 && this.y < 523) {
                            score += 6 * this.text().length;
                            this.destroy();
                            Crafty.audio.play("hit");
                        } else if (this.y > 518 && this.y < 524) {
                            score += 4 * this.text().length;
                            this.destroy();
                            Crafty.audio.play("hit");
                        } else if (this.y >= 517 && this.y <= 525) {
                            score += 2 * this.text().length;
                            this.destroy();
                            Crafty.audio.play("hit");
                        }
                    }
                });
            }

            Crafty("Player").each(function() {
                this.text(player_text);
            })
        });
        
        Crafty.e().bind("EnterFrame", function() {
            
            if (end_game) {
                hp = 0;
            }

            if(hp <= 0) return;
            
            if ( Crafty.frame() % ( Math.round(second_per_word) * FPS) == 0) {
                
                counter++;
    
                if(counter % 5 == 0)
                    second_per_word = second_per_word * 0.9;
                
                var wordList = [];
                Crafty("Words").each(function() {
                    wordList.push(this.text());
                });
                
                var current_word = "";
                current_word = dic[Math.floor(Math.random() * dic.length)];
                current_word = current_word.substring(0,1).toUpperCase() + current_word.substr(1);

                while( wordList.indexOf(current_word) != -1 && current_word.length < 3) {
                    current_word = dic[Math.floor(Math.random() * dic.length)];
                    current_word = current_word.substring(0,1).toUpperCase() + current_word.substr(1);
                };
                
                var random_x = Crafty.math.randomInt(32, 335);
                if (current_word.width() + random_x >= 320) {
                    random_x = 335 - current_word.width();
                }
                
                socket.json.emit('word_sync', {
                    room_id: current_room_id, 
                    current_fb_id: userID, 
                    current_player_id: current_player_id,
                    text: current_word, 
                    text_x: random_x, 
                    text_y: -50,
                });

                Crafty.e("Words,2D,DOM,Text,TextFormat").text(function() {
                    return current_word;
                }).textColor("#ffffff").textFont({
                    size: "16px",
                    family: "Trebuchet MS"
                }).attr({
                    x: random_x,
                    y: -50,
                    h: 10
                }).bind("EnterFrame", function() {
                    this.y += 1;
                    if (this.y == baseLine) {
                        if (this._textColor != "rgb(0,255,0)") {
                            hp -= this.text().length;
                            if( hp <= 0 ){
                                socket.json.emit('end_of_the_round', {
                                    room_id: current_room_id, 
                                    who_lose: current_player_id,
                                    player_score: score, 
                                    op_score: op_score,
                                });
                            }
                        } else {
                            score += this.text().length;
                        }
                        socket.json.emit('score_sync', {
                            room_id: current_room_id, 
                            current_player_id: current_player_id,
                            current_fb_id: userID,
                            player_score: score, 
                            player_hp: hp
                        });
                        this.destroy();
                    }
                });
            }

            Crafty("Score").each(function() {
                this.text("Score&nbsp:&nbsp;" + score);
            });
            Crafty("Hp").each(function() {
                this.text("Hp&nbsp:&nbsp" + hp);
            });
            Crafty("Op_Score").each(function() {
                this.text("Score&nbsp:&nbsp;" + op_score);
            });
            Crafty("Op_Hp").each(function() {
                this.text("Hp&nbsp:&nbsp" + op_hp);
            });
        })
    });
    Crafty.scene("Credit", function() {});
    Crafty.scene("Over", function() {
        
        //The background
        Crafty.e("2D,DOM,Text,Image").image('img/bg.png').attr({
            x: 0,
            y: 0,
            alpha: 0.5,
            w: width,
            h: height
        });
        
        Crafty.e("Over,2D,DOM,Text,TextFormat,Mouse").text("GAME OVER").textColor("#ffffff")
        .textFont({
            size: "40px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 300,
            w: width,
            h: height
        }).css('text-align', 'center').bind("Click", function() {
            end_game = false;
            current_room_id = undefined;
            current_player_id = undefined;
            comfirm_p1 = false;
            comfirm_p2 = false;
            Crafty.scene("Start");
        });
        
    });
    Crafty.scene("Loading", function() {
        Crafty.audio.add("type_correct", "sound/click.wav");
        Crafty.audio.add("type_wrong", "sound/fire.wav");
        Crafty.audio.add("hit", "sound/laser.wav");
        //Crafty.audio.add("bg", "sound/Evil Lead Synth.mp3");
        Crafty.audio.add("space", "sound/space.mp3");
        Crafty.load(['img/bg.png', 'img/menu.png', 'img/single.png',
                     'sound/space.mp3','sound/click.wav', 'sound/fire.wav'
                     , 'sound/laser.wav', 'sound/ship_fire.wav','img/frame.png'],function(){
                         Crafty.scene('Start');
                     });
        Crafty.e('2D,DOM,Text,TextFormat').text('LOADING...')
        .attr({
            x: 0,
            y: height / 2 - 20,
            w: width
        }).textFont({
            size: "32px",
            family  : "Trebuchet MS" 
        }).css('text-align', 'center');
    });
    
    Crafty.scene("Loading");
};
String.prototype.width = function(font) {
    var f = font || '16px nt',
        o = $('<div>' + this + '</div>').css({
            'position': 'absolute',
            'float': 'left',
            'white-space': 'nowrap',
            'visibility': 'hidden',
            'font': f
        }).appendTo($('body')),
        w = o.width();
    o.remove();
    return w;
}



// messages could be 6 types
// 1. - 1st/2nd player connected
// 2. - round could be started (so player 1 couldn't start if player 2 hadn't connected yet)
// 3. - round just began, synchronive initial position of the ball
// 4. - sync token with information about current player's ball and racket's position
// 5. - ball went out of the field / who loose / new round
// 6. - player in the same room has been disconnected
socket.on('list_of_rooms', function(obj){
    rooms_lists = obj;
});

socket.on('word_sync', function(obj){
    var baseLine = 535;
    if(obj.room_id == current_room_id) {
        if (current_player_id == 1 && obj.current_player_id == 2) {
            Crafty.e("Op_Words,2D,DOM,Text,TextFormat").text(obj.text).textColor("#ffffff").textFont({
                size: "16px",
                family: "Trebuchet MS"
            }).attr({
                x: obj.text_x + 395,
                y: obj.text_y,
                h: 10
            }).bind("EnterFrame", function() {
                this.y += 1;
                if (this.y == baseLine) {
                    this.destroy();
                }
            });
        } else if (current_player_id == 2 && obj.current_player_id == 1) {
            Crafty.e("Op_Words,2D,DOM,Text,TextFormat").text(obj.text).textColor("#ffffff").textFont({
                size: "16px",
                family: "Trebuchet MS"
            }).attr({
                x: obj.text_x + 395,
                y: obj.text_y,
                h: 10
            }).bind("EnterFrame", function() {
                this.y += 1;
                if (this.y == baseLine) {
                    this.destroy();
                }
            });
        }
    }
    
});

socket.on('player_connected', function(obj){
  
  // if user just connected to the server (current_player_id undefined) then init() all (if this is 1st player then draw ball near him)
  if(!current_player_id) {
    current_player_id = obj.player_id;
  } else {
    // if user was in room alone (he was player #1) and then switched to another room with one player he should be player #2 here
    if(obj.player_id == 2 && current_player_id == 1 && current_room_id != obj.room_id) {
      current_player_id = 2;
    }
  }
  
  current_room_id = obj.room_id;
  console.log('Your current room : ' + current_room_id);
  if(obj.room_id == current_room_id) {
    if(obj.player1 && obj.player2) {
        if (current_player_id == 1) {
            op_userID = obj.player2.fb_id;
            op_name = obj.player2.fb_name;
            op_first_name = obj.player2.fb_first_name;
            op_last_name = obj.player2.fb_last_name;
            op_pic_url = "https://graph.facebook.com/"+op_userID+"/picture";
        } else {
            op_userID = obj.player1.fb_id;
            op_name = obj.player1.fb_name;
            op_first_name = obj.player1.fb_first_name;
            op_last_name = obj.player1.fb_last_name;
            op_pic_url = "https://graph.facebook.com/"+op_userID+"/picture";
        }

        Crafty("P2_fpic").each(function(){
            this.destroy();
        });
        Crafty("P2_fname").each(function(){
            this.destroy();
        });
        Crafty("P2_lname").each(function(){
            this.destroy();
        });

        //Player 2 detail
        //pic
        Crafty.e("P2_fpic,2D,DOM,Text,Image").image(op_pic_url).attr({
            x: 440,
            y: 400,
            w: width,
            h: height
        });

        //first name
        Crafty.e("P2_fname,2D,DOM,Text,TextFormat,Mouse").text(op_first_name).textColor("#ffffff").textFont({
            size: "15px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 85,
            y: 460,
            w: width,
            h: 15
        }).css('text-align', 'center')

        //last name
        Crafty.e("P2_lname,2D,DOM,Text,TextFormat,Mouse").text(op_last_name).textColor("#ffffff").textFont({
            size: "15px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 85,
            y: 485,
            w: width,
            h: 15
        }).css('text-align', 'center')

        //Cancel text
        Crafty.e("Start ,2D,DOM,Text,TextFormat,Mouse").text("Start Game..").textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 530,
            w: width,
            h: 20
        }).css('text-align', 'center')
        .bind("Click",function(){
            //Crafty.scene("Multi-menu");
            this.text("Waiting for opponent player start!..");
            socket.json.emit('round_started', {
                room_id: current_room_id, 
                current_player_id: current_player_id
            });
            this.unbind("Click");
        }).bind("MouseOver",function(){
            this.textColor("#ff0000");
        }).bind("MouseOut",function(){
            this.textColor("#ffffff");
        });
    }
  }
    
});

socket.on('round_started', function(obj){

  if(obj.room_id == current_room_id) {
    if (obj.current_player_id == 1) {
        comfirm_p1 = true;
    }
    else {
        comfirm_p2 = true;
    }
  }

  if (comfirm_p1 && comfirm_p2) {
    Crafty.scene("Multi");
  };

});

socket.on('end_of_the_round', function(obj){
    end_game = true;
    socket.json.emit('disconnect_room_id', { room_id: current_room_id });
    if(obj.room_id == current_room_id) {
        Crafty.scene("Over");
        if (obj.player_score == obj.op_score) {
            postToFeedMuti('You draw', obj.player_score, obj.op_score);
        }
        else if (obj.who_lose == current_player_id) {
            // You lose
            postToFeedMuti('You lose', obj.player_score, obj.op_score);
        } else {
            // You Win
            postToFeedMuti('You win', obj.player_score, obj.op_score);
        }
    }
});