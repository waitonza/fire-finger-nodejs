'use strict';

var socket = io.connect();
var current_room_id;
var current_player_id;
var width = 760;
var height = 640;
var comfirm_p1 = false;
var comfirm_p2 = false;
var end_game = false;
var rooms_lists;
var isCanPlay = false;
var op_offset = 380;

function startWith(str, pattern) {
    return pattern.length > 0 && pattern == str.substr(0, pattern.length);
}

window.onload = function() {
    var load_counter = 0;
    var score = 0;
    var combo = 0;
    //create the canvas
    Crafty.init(width, height);
    Crafty.settings.modify("autoPause", false);
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
        var isSingle = false;
        var isMulti = false;
        var counter = 0;
        // Crafty.audio.play("bg",-1,0.5);
        //The background image
        Crafty.e("2D,DOM,Image").image("img/bg_360x640.png").attr({
            x: 380 - 180,
            y: 0,
            w: 360,
            h: height
        });
        //Game Name text
        Crafty.e("Game,2D,DOM,Text,TextFormat").text("FIRE FINGER").attr({
            x: 0,
            y: 180,
            w: width,
        }).textFont({
            size: "36px",
            family: "Trebuchet MS"
        }).css('text-align', 'center');
        //Single player text
        Crafty.e("Single,2D,DOM,Text,TextFormat,Mouse").text("SINGLE PLAYER").textColor("#ffffff").textFont({
            size: "18px",
            family: "Trebuchet MS"
        }).attr({
            x: 0,
            y: 290,
            w: width,
            h: 20
        }).css('text-align', 'center').bind("Click", function() {
            isSingle = true;
        }).bind("MouseOver", function() {
            this.textColor("#ff0000");
        }).bind("MouseOut", function() {
            this.textColor("#ffffff");
        });
        //Multiplayer text
        Crafty.e("Multi ,2D,DOM,Text,TextFormat,Mouse").text("MULTI PLAYER").textColor("#ffffff").textFont({
            size: "18px",
            family: "Trebuchet MS"
        }).attr({
            x: 0,
            y: 320,
            w: width,
            h: 20
        }).css('text-align', 'center').bind("Click", function() {
            isMulti = true;
        }).bind("MouseOver", function() {
            this.textColor("#ff0000");
        }).bind("MouseOut", function() {
            this.textColor("#ffffff");
        });
        //Invite Friends text
        Crafty.e("Invite,2D,DOM,Text,TextFormat,Mouse").text("INVITE FRIEND").textColor("#ffffff").textFont({
            size: "18px",
            family: "Trebuchet MS"
        }).attr({
            x: 0,
            y: 350,
            w: width,
            h: 20
        }).css('text-align', 'center').bind("Click", function() {
            sendRequestViaMultiFriendSelector();
        }).bind("MouseOver", function() {
            this.textColor("#ff0000");
        }).bind("MouseOut", function() {
            this.textColor("#ffffff");
        });
        //Credit text
        Crafty.e("Credit,2D,DOM,Text,TextFormat,Mouse").text("CREDIT").textColor("#ffffff").textFont({
            size: "18px",
            family: "Trebuchet MS"
        }).attr({
            x: 0,
            y: 380,
            w: width,
            h: 20
        }).css('text-align', 'center').bind("MouseOver", function() {
            this.textColor("#ff0000");
        }).bind("MouseOut", function() {
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
        Crafty.e().bind("EnterFrame", function() {
            if (isSingle || isMulti) {
                counter++;
                Crafty("Game").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("Single").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("Multi").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("Credit").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("Invite").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("Developed").each(function() {
                    this.alpha -= 0.05;
                });
                if (counter == 50) {
                    if (isSingle) {
                        Crafty.scene("Single");
                        isSingle = false;
                    } else {
                        socket.json.emit('list_of_rooms', { test: 1 });
                        Crafty.scene("Multi-waiting");
                        isMulti = false;
                    }
                }
            }
        });
    });
    //The single player seen
    Crafty.scene("Single", function() {
        //Get the current FPS
        var FPS = +Crafty.timer.getFPS();
        //Set the base line that the word will start to disappear
        var baseLine = 530;
        //The current text of the play, current text that was typed.
        var player_text = "";
        var hp = 100;
        // Current difficulty
        var second_per_word = 3.2;
        var counter = 0;
        //The background image
        Crafty.e("2D,DOM,Image").image("img/single_bg.jpg").attr({
            x: 380 - 180,
            y: 0,
            w: 360,
            h: height
        });
        //Baseline
        Crafty.e("2D,DOM,Color,Image").image('img/blueline.png').attr({
            x: 200,
            y: 515,
            //Middle at 521, for now put at 519 to 523
            w: 360,
            h: 11
        });
        //The score text
        Crafty.e("2D,DOM,Color").attr({
            x: 420,
            y: 2,
            w: 137,
            h: 20,
            alpha: 0.3
        }).color('rgb(0,0,0)');
        Crafty.e("Score,2D,DOM,Text,TextFormat").text("SCORE : " + this.score).textColor("#ffffff").textFont({
            size: "16px",
            family: "Trebuchet MS"
        }).attr({
            x: 425,
            y: 0,
            w: width
        })
        //The hp text bar
        Crafty.e("2D,DOM,Color").attr({
            x: 202,
            y: 2,
            w: 150,
            h: 20,
            alpha: 0.3
        }).color('rgb(0,0,0)');
        Crafty.e("HP,2D,DOM,Text").text("HP :").textColor("#ffffff").textFont({
            size: "16px",
            family: "Trebuchet MS"
        }).attr({
            x: 205,
            y: 0,
            w: width
        });
        Crafty.e("Hp,2D,DOM,Color,Image").color('#92CD00').attr({
            x: 240,
            y: 5,
            w: 150,
            h: 14
        }).bind("EnterFrame", function() {
            this.w = hp / 100 * 100;
            if (hp / 100 * 100 < 70) {
                this.color('#D5401A');
            }
            if (hp / 100 * 100 < 40) {
                this.color('#AD1813');
            }
        });
        //The current player text
        Crafty.e("Player,2D,DOM,Text,TextFormat").text(player_text).textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 0,
            y: 560,
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
                player_text += String.fromCharCode(e.key).toUpperCase();
                var match = false;
                Crafty("Words").each(function() {
                    if (this._textColor == "rgb(0,255,0)" || player_text.length == 0) return;
                    if (player_text == this.text()) {
                        match = true;
                        this.textColor("#00ff00");
                        player_text = "";
                    } else if (startWith(this.text(), player_text)) {
                        match = true;
                        this.textColor("#ff0000");
                    } else {
                        this.textColor("#ffffff");
                    }
                });
                if (!match) {
                    Crafty("Words").each(function() {
                        if (this._textColor != "rgb(0,255,0)" && startWith(this.text(), String.fromCharCode(e.key).toUpperCase())) {
                            match = true;
                            this.textColor("#ff0000");
                            player_text = String.fromCharCode(e.key).toUpperCase();
                        }
                    });
                }
                if (!match) player_text = "";
                // Sound playing
                if (!match) {
                    Crafty.audio.play("type_wrong");
                } else {
                    Crafty.audio.play("type_correct");
                }
            } else if (e.key == Crafty.keys["SPACE"]) {
                player_text = "";
                var missed = true;
                Crafty("Words").each(function() {
                    if (this._textColor == '#AD1813') {
                        missed = false;
                        Crafty.e('2D, DOM, Text, TextFormat, Tween').text("Perfect").textFont({
                            size: '18px',
                            family: 'Trebuchet MS'
                        }).attr({
                            x: 0,
                            y: 480,
                            w: width,
                            alpha: 0.7
                        }).css('text-align', 'center').tween({
                            alpha: 0,
                            y: 450
                        }, FPS).textColor('#AD1813');
                        combo += 1;
                        score += (combo + 1) * this.text().length;
                        this.destroy();
                    } else if (this._textColor == '#D5401A') {
                        missed = false;
                        Crafty.e('2D, DOM, Text, TextFormat, Tween').text("Cool").textFont({
                            size: '18px',
                            family: 'Trebuchet MS'
                        }).attr({
                            x: 0,
                            y: 480,
                            w: width,
                            alpha: 0.7
                        }).css('text-align', 'center').tween({
                            alpha: 0,
                            y: 450
                        }, FPS).textColor('#D5401A');
                        combo = 0;
                        score += 1.3 * this.text().length;
                        this.destroy();
                    } else if (this._textColor == '#F6E82C') {
                        missed = false;
                        Crafty.e('2D, DOM, Text, TextFormat, Tween').text("Bad").textFont({
                            size: '18px',
                            family: 'Trebuchet MS'
                        }).attr({
                            x: 0,
                            y: 480,
                            w: width,
                            alpha: 0.7
                        }).css('text-align', 'center').tween({
                            alpha: 0,
                            y: 450
                        }, FPS).textColor('#F6E82C');
                        combo = 0;
                        score += 1.1 * this.text().length;
                        this.destroy();
                    }
                });
                if (missed == true) {
                    Crafty.e('2D, DOM, Text, TextFormat, Tween').text("Miss").attr({
                        x: 0,
                        y: 480,
                        w: width,
                        alpha: 0.7
                    })
                    .textFont({
                        size: '18px',
                        family: 'Trebuchet MS'
                    })
                    .css('text-align', 'center').tween({
                        alpha: 0,
                        y: 450
                    }, FPS);
                    hp -= 1;
                }
            }
            Crafty("Player").each(function() {
                this.text(player_text);
            })
        });
        Crafty.e().bind("EnterFrame", function() {
            if (hp <= 0) return;
            if (Crafty.frame() % (Math.round(second_per_word) * FPS) == 0) {
                counter++;
                if (counter % 5 == 0) second_per_word = second_per_word * 0.9;
                var wordList = [];
                Crafty("Words").each(function() {
                    wordList.push(this.text());
                });
                var current_word = "";
                current_word = dic[Math.floor(Math.random() * dic.length)];
                current_word = current_word.substring(0).toUpperCase();
                while (wordList.indexOf(current_word) != -1 && current_word.length < 3) {
                    current_word = dic[Math.floor(Math.random() * dic.length)];
                    current_word = current_word.substring(0).toUpperCase();
                };
                var random_x = Crafty.math.randomInt(232, 480);
                if (current_word.width() + random_x >= 520) {
                    random_x = 535 - current_word.width();
                }
                Crafty.e("Words,2D,DOM,Text,TextFormat,Color").text(function() {
                    return current_word;
                }).textColor("#ffffff").textFont({
                    size: "14px",
                    family: "Trebuchet MS",
                    type: "bold"
                }).attr({
                    x: random_x,
                    y: 20
                }).bind("EnterFrame", function() {
                    this.y += 1;
                    if (this.y >= 518 && this.y <= 522 && this._textColor == '#D5401A') {
                        this._textColor = '#AD1813';
                    } else if (this.y >= 514 && this.y <= 526 && (this._textColor == '#AD1813' || this._textColor == '#F6E82C')) {
                        this._textColor = '#D5401A';
                    } else if (this.y >= 510 && this.y <= 530 && (this._textColor == 'rgb(0,255,0)' || this._textColor == '#D5401A')) {
                        this._textColor = '#F6E82C';
                    }
                    if (this.y > 529) {
                        this._textColor = 'rgb(255,255,255)';
                    }
                    if (this.y == baseLine) {
                        if (this._textColor != "rgb(0,0,255)") {
                            hp -= this.text().length;
                            if (hp <= 0) {
                                postToFeedSingle(score);
                                Crafty.scene("Over");
                            }
                        } else {
                            //NEVER CALLED
                            score += this.text().length;
                            hp -= 1;
                        }
                    }
                    if (this.y > baseLine) {
                        this.alpha -= 0.1;
                        if (this.alpha <= 0.0) {
                            Crafty.e('2D, DOM, Text, TextFormat, Tween').text("Fade").attr({
                                x: 0,
                                y: 480,
                                w: width
                            })
                            .textFont({
                                size: '18px',
                                family: 'Trebuchet MS'
                            }).css('text-align', 'center').tween({
                                alpha: 0,
                                y: 450
                            }, FPS);
                            this.destroy();
                        }
                    }
                });
            }
            Crafty("Score").each(function() {
                this.text("SCORE&nbsp:&nbsp;" + Math.round(score));
            });
        })
    });
    
    //The Mutiplayer Menu scene
    Crafty.scene("Multi-waiting", function() {
        var counter = 0;
        // Crafty.audio.play("bg",-1,0.5);
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
        Crafty.e("2D,DOM,Image").image("img/bg_360x640.png").attr({
            x: 380 - 180,
            y: 0,
            w: 360,
            h: height
        }); 

        //Game Name text
        Crafty.e("Game,2D,DOM,Text,TextFormat").text("FIRE FINGER").attr({
            x: 0,
            y: 180,
            w: width,
        }).textFont({
            size: "36px",
            family: "Trebuchet MS"
        }).css('text-align', 'center');

        Crafty.e("Multi,2D,DOM,Text,TextFormat").text("MULTI PLAYER").attr({
            x: 0,
            y: 240,
            w: width,
        }).textFont({
            size: "24px",
            family: "Trebuchet MS"
        }).css('text-align', 'center');

        //Finding player player text
        Crafty.e("Single,2D,DOM,Text,TextFormat,Mouse").text("We're finding player, Waiting....").textColor("#ffffff").textFont({
            size: "18px",
            family: "Trebuchet MS"
        }).attr({
            x: 0,
            y: 320,
            w: width,
            h: 20
        }).css('text-align', 'center')

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
        Crafty.e().bind("EnterFrame", function() {

            if (isCanPlay) {
                counter++;
                Crafty("Game").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("Single").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("Multi").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("P1_fpic").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("P1_fname").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("P1_lname").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("VS").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("P2_fpic").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("P2_fname").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("P2_lname").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("Developed").each(function() {
                    this.alpha -= 0.05;
                });
                Crafty("Start").each(function() {
                    this.alpha -= 0.05;
                });
                if (counter == 50) {
                    Crafty.scene("Multi");
                    isCanPlay = false;
                }
            }
        });
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

        socket.on('player_ty_sync', function(obj){
            
            if (current_player_id == 1 && obj.current_player_id == 2) {
                op_player_text = obj.player_text;
            } else if (current_player_id == 2 && obj.current_player_id == 1) {
                op_player_text = obj.player_text;
            }
        });

        //The background image
        Crafty.e("2D,DOM,Text,Image").image('img/Dark-Blue-760x640.jpg').attr({
            x: 0,
            y: 0,
            w: width,
            h: height
        });

        /**
         * Current player
         */

        //Baseline
        Crafty.e("2D,DOM,Color,Image").image('img/bluelinelong.png').attr({
            x: 0,
            y: 515,
            //Middle at 521, for now put at 519 to 523
            //w: 360,
            h: 11
        });
        //The score text
        Crafty.e("2D,DOM,Color").attr({
            x: 220,
            y: 2,
            w: 137,
            h: 20,
            alpha: 0.3
        }).color('rgb(0,0,0)');
        Crafty.e("Score,2D,DOM,Text,TextFormat").text("SCORE : " + this.score).textColor("#ffffff").textFont({
            size: "16px",
            family: "Trebuchet MS"
        }).attr({
            x: 225,
            y: 0,
            w: width
        })
        //The hp text bar
        Crafty.e("2D,DOM,Color").attr({
            x: 2,
            y: 2,
            w: 160,
            h: 20,
            alpha: 0.3
        }).color('rgb(0,0,0)');
        Crafty.e("HP,2D,DOM,Text").text("HP :").textColor("#ffffff").textFont({
            size: "16px",
            family: "Trebuchet MS"
        }).attr({
            x: 5,
            y: 0,
            w: width
        });
        Crafty.e("Hp,2D,DOM,Color,Image").color('#92CD00').attr({
            x: 40,
            y: 5,
            w: 150,
            h: 14
        }).bind("EnterFrame", function() {
            this.w = hp / 100 * 100;
            if (hp / 100 * 100 < 70) {
                this.color('#D5401A');
            }
            if (hp / 100 * 100 < 40) {
                this.color('#AD1813');
            }
        });

        /**
         * Opponent player
         */

        //The opponent player score text
        Crafty.e("2D,DOM,Color").attr({
            x: 220 + op_offset,
            y: 2,
            w: 137,
            h: 20,
            alpha: 0.3
        }).color('rgb(0,0,0)');
        Crafty.e("Op_Score,2D,DOM,Text,TextFormat").text("SCORE : " + this.op_score).textColor("#ffffff").textFont({
            size: "16px",
            family: "Trebuchet MS"
        }).attr({
            x: 225 + op_offset,
            y: 0,
            w: width
        })

        //The hp opponent text bar
        Crafty.e("2D,DOM,Color").attr({
            x: 2 + op_offset,
            y: 2,
            w: 160,
            h: 20,
            alpha: 0.3
        }).color('rgb(0,0,0)');
        Crafty.e("Op_Hp,2D,DOM,Text").text("HP :").textColor("#ffffff").textFont({
            size: "16px",
            family: "Trebuchet MS"
        }).attr({
            x: 5 + op_offset,
            y: 0,
            w: width
        });
        Crafty.e("Op_Hp,2D,DOM,Color,Image").color('#92CD00').attr({
            x: 40 + op_offset,
            y: 5,
            w: 150,
            h: 14
        }).bind("EnterFrame", function() {
            this.w = op_hp / 100 * 100;
            if (op_hp / 100 * 100 < 70) {
                this.color('#D5401A');
            }
            if (op_hp / 100 * 100 < 40) {
                this.color('#AD1813');
            }
        });
        
        //The opponent player text
        Crafty.e("Op_Player,2D,DOM,Text,TextFormat").text(op_player_text).textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: 200,
            y: 560,
            w: width
        }).css('text-align', 'center')

        //The current player text
        w: width
        Crafty.e("Player,2D,DOM,Text,TextFormat").text(player_text).textColor("#ffffff").textFont({
            size: "20px",
            family: "Trebuchet MS",
            type: "Bold"
        }).attr({
            x: -200,
            y: 560,
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
                player_text += String.fromCharCode(e.key).toUpperCase();
                var match = false;
                socket.json.emit('player_ty_sync', {
                    room_id: current_room_id, 
                    current_player_id: current_player_id,
                    player_text: player_text
                });
                Crafty("Words").each(function() {
                    if (this._textColor == "rgb(0,255,0)" || player_text.length == 0) return;
                    if (player_text == this.text()) {
                        match = true;
                        this.textColor("#00ff00");
                        player_text = "";
                    } else if (startWith(this.text(), player_text)) {
                        match = true;
                        this.textColor("#ff0000");
                    } else {
                        this.textColor("#ffffff");
                    }
                });
                if (!match) {
                    Crafty("Words").each(function() {
                        if (this._textColor != "rgb(0,255,0)" && startWith(this.text(), String.fromCharCode(e.key).toUpperCase())) {
                            match = true;
                            this.textColor("#ff0000");
                            player_text = String.fromCharCode(e.key).toUpperCase();
                        }
                    });
                }
                if (!match) player_text = "";
                // Sound playing
                if (!match) {
                    Crafty.audio.play("type_wrong");
                } else {
                    Crafty.audio.play("type_correct");
                }
            } else if (e.key == Crafty.keys["SPACE"]) {
                var missed = true;
                Crafty("Words").each(function() {
                    if (this._textColor == '#AD1813') {
                        missed = false;
                        Crafty.e('2D, DOM, Text, TextFormat, Tween').text("Perfect").textFont({
                            size: '18px',
                            family: 'Trebuchet MS'
                        }).attr({
                            x: -200,
                            y: 480,
                            w: width,
                            alpha: 0.7
                        }).css('text-align', 'center').tween({
                            alpha: 0,
                            y: 450
                        }, FPS).textColor('#AD1813');
                        combo += 1;
                        score += (combo + 1) * this.text().length;
                        this.destroy();
                    } else if (this._textColor == '#D5401A') {
                        missed = false;
                        Crafty.e('2D, DOM, Text, TextFormat, Tween').text("Cool").textFont({
                            size: '18px',
                            family: 'Trebuchet MS'
                        }).attr({
                            x: -200,
                            y: 480,
                            w: width,
                            alpha: 0.7
                        }).css('text-align', 'center').tween({
                            alpha: 0,
                            y: 450
                        }, FPS).textColor('#D5401A');
                        combo = 0;
                        score += 1.3 * this.text().length;
                        this.destroy();
                    } else if (this._textColor == '#F6E82C') {
                        missed = false;
                        Crafty.e('2D, DOM, Text, TextFormat, Tween').text("Bad").textFont({
                            size: '18px',
                            family: 'Trebuchet MS'
                        }).attr({
                            x: -200,
                            y: 480,
                            w: width,
                            alpha: 0.7
                        }).css('text-align', 'center').tween({
                            alpha: 0,
                            y: 450
                        }, FPS).textColor('#F6E82C');
                        combo = 0;
                        score += 1.1 * this.text().length;
                        this.destroy();
                    }
                });
                if (missed == true) {
                    Crafty.e('2D, DOM, Text, TextFormat, Tween').text("Miss").attr({
                        x: -200,
                        y: 480,
                        w: width,
                        alpha: 0.7
                    })
                    .textFont({
                        size: '18px',
                        family: 'Trebuchet MS'
                    })
                    .css('text-align', 'center').tween({
                        alpha: 0,
                        y: 450
                    }, FPS);
                    hp -= 1;
                }
            }
            Crafty("Player").each(function() {
                this.text(player_text);
            })
        });
        Crafty.e().bind("EnterFrame", function() {
            if (end_game) {
                hp = 0;
            }
            if (hp <= 0) return;
            if (Crafty.frame() % (Math.round(second_per_word) * FPS) == 0) {
                counter++;
                if (counter % 5 == 0) second_per_word = second_per_word * 0.9;
                var wordList = [];
                Crafty("Words").each(function() {
                    wordList.push(this.text());
                });
                var current_word = "";
                current_word = dic[Math.floor(Math.random() * dic.length)];
                current_word = current_word.substring(0).toUpperCase();
                while (wordList.indexOf(current_word) != -1 && current_word.length < 3) {
                    current_word = dic[Math.floor(Math.random() * dic.length)];
                    current_word = current_word.substring(0).toUpperCase();
                };
                var random_x = Crafty.math.randomInt(0, 335);
                if (current_word.width() + random_x >= 320) {
                    random_x = 335 - current_word.width();
                }
                socket.json.emit('word_sync', {
                    room_id: current_room_id, 
                    current_fb_id: userID, 
                    current_player_id: current_player_id,
                    text: current_word, 
                    text_x: random_x, 
                    text_y: 20,
                });
                Crafty.e("Words,2D,DOM,Text,TextFormat,Color").text(function() {
                    return current_word;
                }).textColor("#ffffff").textFont({
                    size: "14px",
                    family: "Trebuchet MS",
                    type: "bold"
                }).attr({
                    x: random_x,
                    y: 20
                }).bind("EnterFrame", function() {
                    this.y += 1;
                    if (this.y >= 519 && this.y <= 521 && this._textColor == '#D5401A') {
                        this._textColor = '#AD1813';
                    } else if (this.y >= 515 && this.y <= 525 && (this._textColor == '#AD1813' || this._textColor == '#F6E82C')) {
                        this._textColor = '#D5401A';
                    } else if (this.y >= 511 && this.y <= 529 && (this._textColor == 'rgb(0,255,0)' || this._textColor == '#D5401A')) {
                        this._textColor = '#F6E82C';
                    }
                    if (this.y > 529) {
                        this._textColor = 'rgb(255,255,255)';
                    }
                    if (this.y == baseLine) {
                        if (this._textColor != "rgb(0,0,255)") {
                            hp -= this.text().length;
                            if (hp <= 0) {
                                socket.json.emit('end_of_the_round', {
                                    room_id: current_room_id, 
                                    who_lose: current_player_id,
                                    player_score: Math.round(score), 
                                    op_score: Math.round(op_score),
                                });
                            }
                        } else {
                            score += this.text().length;
                            hp -= 1;
                        }
                        this.destroy();
                    }
                    if (this.y > baseLine) {
                        this.alpha -= 0.1;
                        if (this.alpha <= 0.0) {
                            Crafty.e('2D, DOM, Text, TextFormat, Tween').text("Fade").attr({
                                x: -200,
                                y: 480,
                                w: width
                            })
                            .textFont({
                                size: '18px',
                                family: 'Trebuchet MS'
                            }).css('text-align', 'center').tween({
                                alpha: 0,
                                y: 450
                            }, FPS);
                            this.destroy();
                        }
                    }
                    socket.json.emit('score_sync', {
                        room_id: current_room_id, 
                        current_player_id: current_player_id,
                        current_fb_id: userID,
                        player_score: score, 
                        player_hp: hp
                    });
                });
            }
            Crafty("Score").each(function() {
                this.text("SCORE&nbsp:&nbsp;" + Math.round(score));
            });
            Crafty("Op_Score").each(function() {
                this.text("Score&nbsp:&nbsp;" + Math.round(op_score));
            });
            Crafty("Op_Player").each(function() {
                this.text(op_player_text);
            });
            Crafty("Op_Words").each(function() {
                if( this._textColor == "rgb(0,255,0)" || op_player_text.length == 0 ) return;
                
                if( op_player_text == this.text() ){
                    this.textColor("#00ff00");
                    op_player_text = "";
                }else if (startWith(this.text(), op_player_text)){
                    this.textColor("#ff0000");
                }else{
                    this.textColor("#ffffff");
                }
            });
        })
        Crafty.e("Divide,2D,DOM,Color").attr({
            x: 379,
            y: 0,
            h: 640,
            w: 3
        }).color('#cc0000');
    });
    Crafty.scene("Credit", function() {});
    Crafty.scene("Over", function() {
        //The background
        Crafty.e("2D,DOM,Image").image("img/single_bg.jpg").attr({
            x: 380 - 180,
            y: 0,
            w: 360,
            h: height
        });
        Crafty.e("Over,2D,DOM,Text,TextFormat,Mouse").text("GAME OVER").textColor("#ffffff").textFont({
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
        Crafty.e().bind("EnterFrame", function() {
            load_counter++;
            if (load_counter == 180) {
                Crafty.scene("Start");
            }
        })
        Crafty.load(['img/loading.gif']);
        Crafty.e('2D,DOM,Image').image('img/loading.gif').attr({
            x: width / 2 - 24,
            y: height / 2 - 24,
            w: width,
            h: height
        });
        Crafty.audio.add("type_correct", "sound/click.wav");
        Crafty.audio.add("type_wrong", "sound/fire.wav");
        Crafty.audio.add("hit", "sound/laser.wav");
        Crafty.audio.add("bg", "sound/Evil Lead Synth.mp3");
        Crafty.audio.add("space", "sound/space.mp3");
        Crafty.load(['img/bg_360x640.png', 'img/single_bg.jpg', 'img/single.png', 'img/flame.gif', 'sound/space.mp3', 'sound/click.wav', 'sound/fire.wav', 'sound/laser.wav', 'sound/ship_fire.wav', 'img/frame.png', 'sound/click.wav', 'sound/fire.wav', 'sound/laser.wav', 'sound/space.mp3']);
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
                x: obj.text_x + op_offset,
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
                x: obj.text_x + op_offset,
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
        Crafty.e("Start ,2D,DOM,Text,TextFormat,Mouse").text("Click, To Start Game..").textColor("#ffffff").textFont({
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
            this.unbind("MouseOver");
            this.unbind("MouseOut");
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
    isCanPlay = true;
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