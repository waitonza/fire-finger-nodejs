  var accessToken;
  var userID;

  // Additional JS functions here
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '296376977130858', // App ID
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    // Additional init code here
    FB.getLoginStatus(function(response) {
      console.log(response);
      
    if (response.status === 'connected') {
      // connected
      console.log('Logined');
      //logout();
      accessToken = response.authResponse.accessToken;
      userID = response.authResponse.userID;
      friendListAPI();
    } else if (response.status === 'not_authorized') {
      // not_authorized
      console.log('Not Autorized');
      login();
    } else {
      // not_logged_in
      console.log('Not Login');
      login();
    }
   });
  };

  // Load the SDK Asynchronously
  (function(d){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     ref.parentNode.insertBefore(js, ref);
   }(document));

  function login() {
    FB.login(function(response) {
        if (response.authResponse) {
            // connected
        } else {
            // cancelled
        }
    });
  }

  function friendListAPI() {
    console.log('Welcome!  Fetching your information.... ');
    var url = '/me/friends?access_token=' + accessToken;
    FB.api(url, function(response) {
        console.log(response);
        for (var i = 0; i < response.data.length; i++) {
          var friend = response.data[i];
          var x = document.getElementById("FBfriendlist");
          var url = "https://graph.facebook.com/"+friend.id+"/picture";
          var fun = 'postToFeed('+friend.id+')';
          var request = 'sendRequestTo('+friend.id+')';
          var z = '<tr><td><img src="'+url+'"></td><td>'+friend.name+'</td><td><button onclick="'+fun+'">Post it!</button></td><td><button onclick="'+request+'">Send it!</button></td></tr>';
          x.innerHTML += z;
        };
        //console.log('Good to see you, ' + response.name + '.');
    });
  }

  function logout() {
    FB.logout(function(response) {
      // user is now logged out
    });
  }

  function postToFeed(score) {

        // calling the API ...
        var obj = {
          method: 'feed',
          link: 'https://apps.facebook.com/fire-finger/',
          picture: 'http://fire-finger.herokuapp.com/img/game-logo.png',
          name: 'Fire Finger Score',
          caption: 'Your score of Fire Finger',
          description: 'You got ' + score + ' points.'
        };

        function callback(response) {
          //alert("Post ID: " + response['post_id']);
        }

        FB.ui(obj, callback);
  }

  function postToFeedWithFriend(sendto) {

        // calling the API ...
        var obj = {
          method: 'feed',
          link: 'https://apps.facebook.com/fire-finger/',
          picture: 'http://fire-finger.herokuapp.com/img/game-logo.png',
          name: 'Fire Finger Score',
          to: sendto,
          caption: 'Reference Documentation',
          description: 'Using Dialogs to interact with users.'
        };

        function callback(response) {
          //alert("Post ID: " + response['post_id']);
        }

        FB.ui(obj, callback);
  }

      function sendRequestTo(id) {
        FB.ui({method: 'apprequests',
          message: 'Fire Finger invite Request',
          to: id
        }, requestCallback);
      }

      function sendRequestViaMultiFriendSelector() {
        FB.ui({method: 'apprequests',
          message: 'Fire Finger invite Request'
        }, requestCallback);
      }
      
      function requestCallback(response) {
        // Handle callback here
      }