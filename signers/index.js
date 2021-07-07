"use strict";

 var firebaseConfig = {
    apiKey: "AIzaSyB7aosAnOr4k0lgPPlR11vAA267hhEqh64",
    authDomain: "bitsig-21bf7.firebaseapp.com",
    databaseURL: "https://bitsig-21bf7-default-rtdb.firebaseio.com",
    projectId: "bitsig-21bf7",
    storageBucket: "bitsig-21bf7.appspot.com",
    messagingSenderId: "384266527311",
    appId: "1:384266527311:web:67a36d8fb27980158bc03a",
    measurementId: "G-H2NJN65ETF"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const snapshotToArray = snapshot => {
    const ret = [];
    snapshot.forEach(childSnapshot => {
        ret.push(childSnapshot);
    });
    return ret;
};

function viewLatestSigners() {
  document.getElementById("latest_signers_button").style.backgroundColor = "#00a66c";
  document.getElementById("first_signers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("twitter_followers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("signers").innerHTML = ""

  setInterval(function() {
    if (document.getElementById("signers").innerHTML == "") {
        document.getElementById("signers").innerHTML = '<div class="row mx-auto mt-5 mb-1"><div class="col-lg-6 col-md-6 text-center my-auto mx-auto"><p id="signers_title">Loading Signers...</p></div></div>'
    }
  }, 1000);

  firebase.database().ref("tokens").child("1").child("signer_users").orderByChild("num_signer").limitToLast(100).get().then((snapshot) => {
    if (snapshot.exists()) {
      document.getElementById("signers").innerHTML = ""
      snapshotToArray(snapshot).reverse().forEach(function(snapshot_user) {
        let val = snapshot_user.val();
        let eth_address = val.ethereum_address;
        let name = val.name;
        let num_signer = val.num_signer;
        let profileImageUrl = val.profileImageUrl;
        let twitter_username = val.twitter_username;
        var twitter_followers_count = val.twitter_followers_count;
        if (twitter_followers_count == null) {
          twitter_followers_count = 0;
        }

        var html = '<div class="row mx-auto mb-1 mt-4">'
        html += '<div class="signer col-lg-6 col-md-6 text-center my-auto mx-auto">'
        if (profileImageUrl != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + profileImageUrl + '"/></div>'
        }
        html += '<div class="text-center my-auto"><strong>Signer #' + num_signer + '</strong></div>'
        if(name != null) {
          html += '<div class="text-left my-auto" style="padding-top: 10px;"><p><strong>Name: </strong>' + name + '</p></div>'
        }
        html += '<div class="text-left my-auto"><p><strong>Wallet Address: </strong>' + eth_address + '</p></div>'
        if (twitter_username != null) {
          html += '<div class="col-lg-6 col-md-6 text-center mx-auto my-auto" style="padding-top: 10px;">'
          html += '<a href="https://twitter.com/' + twitter_username + '" style="color: black">'
          html += '<i class="fab fa-twitter-square fa-2x fa-fw"></i><p>@' + twitter_username + '</p><p>' + twitter_followers_count + ' Followers</p></a></div>'
        }
        html += '</div></div>'

        document.getElementById("signers").innerHTML += html
      })
    }
  })
}

function viewFirstSigners() {
  document.getElementById("latest_signers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("first_signers_button").style.backgroundColor = "#00a66c";
  document.getElementById("twitter_followers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("signers").innerHTML = ""

  setInterval(function() {
    if (document.getElementById("signers").innerHTML == "") {
        document.getElementById("signers").innerHTML = '<div class="row mx-auto mt-5 mb-1"><div class="col-lg-6 col-md-6 text-center my-auto mx-auto"><p id="signers_title">Loading Signers...</p></div></div>'
    }
  }, 1000);

  firebase.database().ref("tokens").child("1").child("signer_users").orderByChild("num_signer").limitToFirst(100).get().then((snapshot) => {
    if (snapshot.exists()) {
      document.getElementById("signers").innerHTML = ""
      // let num = snapshot.val().num_signer;
      // let name = snapshot.val().name;
      snapshot.forEach(function(snapshot_user) {
        let val = snapshot_user.val();
        let eth_address = val.ethereum_address;
        let name = val.name;
        let num_signer = val.num_signer;
        let profileImageUrl = val.profileImageUrl;
        let twitter_username = val.twitter_username;
        var twitter_followers_count = val.twitter_followers_count;
        if (twitter_followers_count == null) {
          twitter_followers_count = 0;
        }

        var html = '<div class="row mx-auto mb-1 mt-4">'
        html += '<div class="signer col-lg-6 col-md-6 text-center my-auto mx-auto">'
        if (profileImageUrl != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + profileImageUrl + '"/></div>'
        }
        html += '<div class="text-center my-auto"><strong>Signer #' + num_signer + '</strong></div>'
        if(name != null) {
          html += '<div class="text-left my-auto" style="padding-top: 10px;"><p><strong>Name: </strong>' + name + '</p></div>'
        }
        html += '<div class="text-left my-auto"><p><strong>Wallet Address: </strong>' + eth_address + '</p></div>'
        if (twitter_username != null) {
          html += '<div class="col-lg-6 col-md-6 text-center mx-auto my-auto" style="padding-top: 10px;">'
          html += '<a href="https://twitter.com/' + twitter_username + '" style="color: black">'
          html += '<i class="fab fa-twitter-square fa-2x fa-fw"></i><p>@' + twitter_username + '</p><p>' + twitter_followers_count + ' Followers</p></a></div>'
        }
        html += '</div></div>'

        document.getElementById("signers").innerHTML += html
      })
    }
  })
}

function viewByTwitterFollowers() {
  document.getElementById("latest_signers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("first_signers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("twitter_followers_button").style.backgroundColor = "#00a66c";
  document.getElementById("signers").innerHTML = ""

  setInterval(function() {
    if (document.getElementById("signers").innerHTML == "") {
        document.getElementById("signers").innerHTML = '<div class="row mx-auto mt-5 mb-1"><div class="col-lg-6 col-md-6 text-center my-auto mx-auto"><p id="signers_title">Loading Signers...</p></div></div>'
    }
  }, 1000);


  firebase.database().ref("tokens").child("1").child("signer_users").orderByChild("twitter_followers_count").limitToLast(100).get().then((snapshot) => {
    if (snapshot.exists()) {
      document.getElementById("signers").innerHTML = ""
      snapshotToArray(snapshot).reverse().forEach(function(snapshot_user) {
        let val = snapshot_user.val();
        let eth_address = val.ethereum_address;
        let name = val.name;
        let num_signer = val.num_signer;
        let profileImageUrl = val.profileImageUrl;
        let twitter_username = val.twitter_username;
        var twitter_followers_count = val.twitter_followers_count;
        if (twitter_followers_count == null) {
          twitter_followers_count = 0;
        }

        var html = '<div class="row mx-auto mb-1 mt-4">'
        html += '<div class="signer col-lg-6 col-md-6 text-center my-auto mx-auto">'
        if (profileImageUrl != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + profileImageUrl + '"/></div>'
        }
        html += '<div class="text-center my-auto"><strong>Signer #' + num_signer + '</strong></div>'
        if(name != null) {
          html += '<div class="text-left my-auto" style="padding-top: 10px;"><p><strong>Name: </strong>' + name + '</p></div>'
        }
        html += '<div class="text-left my-auto"><p><strong>Wallet Address: </strong>' + eth_address + '</p></div>'
        if (twitter_username != null) {
          html += '<div class="col-lg-6 col-md-6 text-center mx-auto my-auto" style="padding-top: 10px;">'
          html += '<a href="https://twitter.com/' + twitter_username + '" style="color: black">'
          html += '<i class="fab fa-twitter-square fa-2x fa-fw"></i><p>@' + twitter_username + '</p><p>' + twitter_followers_count + ' Followers</p></a></div>'
        }
        html += '</div></div>'

        document.getElementById("signers").innerHTML += html
      })
    }
  })
}

window.addEventListener('load', async () => {

  firebase.database().ref("numSignersForToken").child("1").get().then((snapshot) => {
    if (snapshot.exists()) {
      let num = snapshot.val();
      document.getElementById("signers_title").innerHTML = "Token #1: " + num.toString() + " Signers"
    }
  });

  document.getElementById("latest_signers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("twitter_followers_button").style.backgroundColor = "#85d2b7";

  document.querySelector("#latest_signers_button").addEventListener("click", viewLatestSigners);
  document.querySelector("#first_signers_button").addEventListener("click", viewFirstSigners);
  document.querySelector("#twitter_followers_button").addEventListener("click", viewByTwitterFollowers);

  viewFirstSigners();
});

