/*  login_lib.js  v1.0  2016-04-26  Ari Okkonen

    A short JavaScript library to help utilizing the FIWARE POI Access Control
    in application web pages.

    NOTE: This library reserves several global names beginning LOGIN_, login_, 
          and logout_.
    
    Usage
    =====

    1.  Copy following user interface elements and the library link to a proper
        location of your application page. You may have to edit the library
        link, if located separately from your application.
        ----
          <!-- Begin access control elements: buttons, name, and image -->
          <button id="login_b" style="" type="button" 
              onclick="login_click();"><b>Log In</b></button>
          <button id="logout_b" style="display:none" type="button" 
              onclick="logout_click();"><b>Log Out</b></button>
          <span id="login_user_name"></span>&nbsp;
          <img id="login_user_image" 
              src="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=" 
              width="32" height="32"><br>
          <!-- End access control elements -->
          <!-- Include login library -->
          <script type="text/javascript" src="login_lib.js"></script>
        ----
      
    2.  Copy the following code template to the script part of your application. 
        Edit as needed. You may rename those my_logged_in and my_logged_out.
        ----
          // var LOGIN_SERVER = "http://www.example.org/poi_dp/"; // Note 
                                                             // trailing slash!
          var LOGIN_SERVER = ""; // can be left blank if in the same location 

          var auth_t = ""; // to be used in subsequent requests
                                     // as the auth_t parameter
          var login_user_info = {}; // {name: string, image: url_string}

          var login_completed = my_logged_in; // called when login completed
          var logout_completed = my_logged_out; // called when logout completed

          function my_logged_in() {
            // Here comes your code that is executed on login
          }

          function my_logged_out() {  
            // Here comes your code that is executed on logout
          }

          // Ensure that the login button is enabled if the page is reloaded.
          document.getElementById("login_b").disabled = false;
        ----

* Project: FI-WARE
* Copyright (c) 2016 Adminotech Oy, All Rights Reserved
* For conditions of distribution and use, see copyright notice in LICENSE
*/
var login_popup;
var login_poll_timer;
var auth_t = "";

function login_done(succeeded, login_data) {
  if (succeeded) {
    // Switch to logout button and show the user information.
    // Finally tell the application that the user has logged in
    document.getElementById("login_b").style.display = "none";
    document.getElementById("logout_b").style.display = "inline";
    auth_t = login_data.token; // proof of identity for subsequent ops
    login_user_info = login_data.user_info; // get user info to show
    document.getElementById("login_user_name").innerHTML =
        login_user_info.name;
    document.getElementById("login_user_image").setAttribute("src", 
        login_user_info.image);
    
    if(login_completed) login_completed(); // Tell it to the application
  } else {
    // Login failed, enable the login button
    document.getElementById("login_b").disabled = false;
  }
}

function login_authenticated(auth_data) {
  /*
    auth_data: {
      oauth2_token: string,
      auth_p:       string,
      user_id_info: {
        name: string,
        image: url_string
      }
    }
  */

  var _auth_t;
  var succeeded = false;
  var login_data = {};
  var response, err;
  var xhr = new XMLHttpRequest();
  var restQueryURL = LOGIN_SERVER + "login?auth_p=" + auth_data.auth_p;
  
  xhr.open('POST', restQueryURL, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    var done = true;
    try {
      response = JSON.parse(xhr.responseText);
      if (response.login) { // We're in!
        _auth_t = response.auth_t;
        succeeded = true;
        login_data = {
          token: _auth_t,
          user_info: auth_data.user_id_info
        };
          
      } else if (response.choices) { // multiple accounts available
        done = false;
        login_select_account(auth_data, response.choices);
      }
        
    } catch(err) {
      console.log("Login failed: " + err.message);
    }
    if(done) {
      login_done(succeeded, login_data);
    }
  };
  xhr.onerror = function() {
    login_done(false, {});
  };
  xhr.send(auth_data.oauth2_token);
}

function login_select_account(auth_data, account_choices) {
  /*
    auth_data: {
      oauth2_token: string,
      auth_p:       string,
      user_id_info: {
        name: string,
        image: url_string
      }
    }
    
    account_choices: {
      "<user_id>": "<user_name>, <user_email>", ...
    }
  */
  selection_popup("POI Accounts", "Select your POI DP account", account_choices,
      login_account_selected, auth_data);
}

function login_account_selected(auth_data, user_id) {
  
  var _auth_t;
  var succeeded = false;
  var login_data = {};
  var response, err;
  var xhr = new XMLHttpRequest();
  var restQueryURL = LOGIN_SERVER + "login?auth_p=" + auth_data.auth_p +
      "&user_id=" + user_id;
  
  xhr.open('POST', restQueryURL, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    var done = true;
    try {
      response = JSON.parse(xhr.responseText);
      if (response.login) { // We're in!
        _auth_t = response.auth_t;
        succeeded = true;
        login_data = {
          token: _auth_t,
          user_info: auth_data.user_id_info
        };
          
      }
        
    } catch(err) {
      console.log("Login failed: " + err.message);
    }
    if(done) {
      login_done(succeeded, login_data);
    }
  };
  xhr.onerror = function() {
    login_done(false, {});
  };
  xhr.send(auth_data.oauth2_token);
}

function login_poll() {
  // Polls when the authentication window finishes
  try {
    if(login_popup.done) {
      // finished, move to the next phase: login_done
      clearInterval(login_poll_timer);
      login_authenticated(
        {
          oauth2_token: login_popup.oauth2_token,
          auth_p: login_popup.auth_p,
          user_id_info: login_popup.user_id_info
        }
      );
      login_popup.close();
    }
  }
  catch(e) {
    console.log("Error: " + e.message);
  }
    
}

function login_click() {
  // disable login button, open login window and start polling it
  document.getElementById("login_b").disabled = true;
  login_popup = window.open(LOGIN_SERVER + "authenticate.html",
      "_blank", "width=500, height=610");
  login_poll_timer = setInterval(login_poll, 1000);
}

function logout_click_done() {
  // clear user name
  document.getElementById("login_user_name").innerHTML = "";
  // set empty image
  document.getElementById("login_user_image").setAttribute("src",
      "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=");
  // switch to enabled login button
  document.getElementById("login_b").style.display = "inline";
  document.getElementById("login_b").disabled = false;
  document.getElementById("logout_b").style.display = "none";
  
  if(logout_completed) logout_completed(); // Tell it to the application
}

function logout_click() {
/*
    Signs out from the (POI) service. Sends a logout request to the server and
    on the response calls the logout_click_done for the next phase.
*/
  var xhr = new XMLHttpRequest();
  var restQueryURL = LOGIN_SERVER + "logout?auth_t=" + auth_t;
  
  auth_t = "";
  xhr.open('GET', restQueryURL, true);
  xhr.onload = function() {
      logout_click_done();
    };
  xhr.send();
  
}

