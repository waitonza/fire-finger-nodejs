"use strict";

window.onload = function() {
    var width = 760;
    var height = 640;
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
        }).bind("MouseOver",function(){
            this.textColor("#ff0000");
        }).bind("MouseOut",function(){
            this.textColor("#ffffff");
        });
        //Multiplayer text
        Crafty.e("Multi ,2D,DOM,Text,TextFormat,Mouse").text("MULTI PLAYER").textColor("#ffffff").textFont({
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
            Crafty.scene("Multi");
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
                                postToFeed(score);
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
    Crafty.scene("Multi", function() {
        //Get the current FPS
        var FPS = +Crafty.timer.getFPS();
        //Set the base line that the word will start to disappear
        var baseLine = 535;
        //The current text of the play, current text that was typed.
        var player_text = "";
        var score = 0;
        var hp = 100;
        
        // Current difficulty
        var second_per_word = 3;
        
        var counter = 0;
        
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
        Crafty.e("Score,2D,DOM,Text,TextFormat").text("Score : " + this.score).textColor("#000000").textFont({
            size: "16px",
            family: "nt"
        }).attr({
            x: 445,
            y: 615,
            width: width
        })
        //The hp opponent player text
        Crafty.e("Hp,2D,DOM,Text,TextFormat").text("HP : " + hp).textColor("#000000").textFont({
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
            x: -200,
            y: 570,
            w: width
        }).css('text-align', 'center')
        */

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
                
                var random_x = Crafty.math.randomInt(32, 335);
                if (current_word.width() + random_x >= 320) {
                    random_x = 335 - current_word.width();
                }
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
                                postToFeed(score);
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