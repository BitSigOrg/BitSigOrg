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

var DispatchGroup = (function() {
    var nextId = 0

    function DispatchGroup() {
        var id = ++nextId
        var tokens = new Set()
        var onCompleted = null

        function checkCompleted() {
            if(!tokens.size) {
                if(onCompleted) {
                    onCompleted()
                }
            }
        }

        // the only requirement for this is that it's unique during the group's cycle
        function nextToken() {
            return Date.now() + Math.random()
        }

        this.enter = function () {
            let token = nextToken()
            tokens.add(token)
            return token
        }

        this.leave = function (token) {
            if(!token) throw new Error("'token' must be the value earlier returned by '.enter()'")
            tokens.delete(token)
            checkCompleted()
        }

        this.notify = function (whenCompleted) {
            if(!whenCompleted) throw new Error("'whenCompleted' must be defined")
            onCompleted = whenCompleted
            checkCompleted()
        }
    }

    return DispatchGroup;
})()

const snapshotToArray = snapshot => {
    const ret = [];
    snapshot.forEach(childSnapshot => {
        ret.push(childSnapshot);
    });
    return ret;
};

// latest_signers
// first_signers
// twitter_followers
var filter_type = "latest_signers"

function viewLatestSigners() {
  filter_type = "latest_signers"
  document.getElementById("latest_signers_button").style.backgroundColor = "#00a66c";
  document.getElementById("first_signers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("twitter_followers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("signers").innerHTML = ""

  setTimeout(function() {
    if (document.getElementById("signers").innerHTML == "") {
        document.getElementById("signers").innerHTML = '<div class="row mx-auto mt-5 mb-1"><div class="col-lg-6 col-md-6 text-center my-auto mx-auto"><p id="signers_title">Loading Signers...</p></div></div>'
    }
  }, 2000);

  firebase.database().ref("tokens").child("1").child("signer_users").orderByChild("num_signer").limitToLast(100).get().then((snapshot) => {
    if (snapshot.exists()) {
      document.getElementById("signers").innerHTML = ""
      snapshotToArray(snapshot).reverse().forEach(function(snapshot_user) {
        let val = snapshot_user.val();
        let eth_address = val.eth_address;
        let name = val.name;
        let num_signer = val.num_signer;
        let profileImageUrl = val.profileImageUrl;
        let twitter_username = val.twitter_username;
        var twitter_followers_count = val.twitter_followers_count;
        let twitter_profile_image_url = val.twitter_profile_image_url;
        if (twitter_followers_count == null) {
          twitter_followers_count = 0;
        }

        var html = '<div class="row mx-auto mb-1 mt-4">'
        html += '<div class="signer col-lg-6 col-md-6 text-center my-auto mx-auto">'
        if (profileImageUrl != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + profileImageUrl + '"/></div>'
        }
        else if (twitter_profile_image_url != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + twitter_profile_image_url + '"/></div>'
        }
        html += '<div class="text-center my-auto"><strong>Signer #' + num_signer + '</strong></div>'
        if(name != null && name != "") {
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
  filter_type = "first_signers"
  document.getElementById("latest_signers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("first_signers_button").style.backgroundColor = "#00a66c";
  document.getElementById("twitter_followers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("signers").innerHTML = ""

  setTimeout(function() {
    if (document.getElementById("signers").innerHTML == "") {
        document.getElementById("signers").innerHTML = '<div class="row mx-auto mt-5 mb-1"><div class="col-lg-6 col-md-6 text-center my-auto mx-auto"><p id="signers_title">Loading Signers...</p></div></div>'
    }
  }, 2000);

  firebase.database().ref("tokens").child("1").child("signer_users").orderByChild("num_signer").limitToFirst(100).get().then((snapshot) => {
    if (snapshot.exists()) {
      document.getElementById("signers").innerHTML = ""
      // let num = snapshot.val().num_signer;
      // let name = snapshot.val().name;
      snapshot.forEach(function(snapshot_user) {
        let val = snapshot_user.val();
        let eth_address = val.eth_address;
        let name = val.name;
        let num_signer = val.num_signer;
        let profileImageUrl = val.profileImageUrl;
        let twitter_username = val.twitter_username;
        var twitter_followers_count = val.twitter_followers_count;
        let twitter_profile_image_url = val.twitter_profile_image_url;
        if (twitter_followers_count == null) {
          twitter_followers_count = 0;
        }

        var html = '<div class="row mx-auto mb-1 mt-4">'
        html += '<div class="signer col-lg-6 col-md-6 text-center my-auto mx-auto">'
        if (profileImageUrl != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + profileImageUrl + '"/></div>'
        }
        else if (twitter_profile_image_url != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + twitter_profile_image_url + '"/></div>'
        }
        html += '<div class="text-center my-auto"><strong>Signer #' + num_signer + '</strong></div>'
        if(name != null && name != "") {
          console.log(name);
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
  filter_type = "twitter_followers"
  document.getElementById("latest_signers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("first_signers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("twitter_followers_button").style.backgroundColor = "#00a66c";
  document.getElementById("signers").innerHTML = ""

  setTimeout(function() {
    if (document.getElementById("signers").innerHTML == "") {
        document.getElementById("signers").innerHTML = '<div class="row mx-auto mt-5 mb-1"><div class="col-lg-6 col-md-6 text-center my-auto mx-auto"><p id="signers_title">Loading Signers...</p></div></div>'
    }
  }, 2000);


  firebase.database().ref("tokens").child("1").child("signer_users").orderByChild("twitter_followers_count").limitToLast(100).get().then((snapshot) => {
    if (snapshot.exists()) {
      document.getElementById("signers").innerHTML = ""
      snapshotToArray(snapshot).reverse().forEach(function(snapshot_user) {
        let val = snapshot_user.val();
        let eth_address = val.eth_address;
        let name = val.name;
        let num_signer = val.num_signer;
        let profileImageUrl = val.profileImageUrl;
        let twitter_username = val.twitter_username;
        var twitter_followers_count = val.twitter_followers_count;
        let twitter_profile_image_url = val.twitter_profile_image_url;
        if (twitter_followers_count == null) {
          twitter_followers_count = 0;
        }

        var html = '<div class="row mx-auto mb-1 mt-4">'
        html += '<div class="signer col-lg-6 col-md-6 text-center my-auto mx-auto">'
        if (profileImageUrl != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + profileImageUrl + '"/></div>'
        }
        else if (twitter_profile_image_url != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + twitter_profile_image_url + '"/></div>'
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

function search(e) {
  let val = e.target.value;
  var signers = []
  var searchEnded = false

  if (val == "") {
    document.getElementById("signers").innerHTML = ""
    if (filter_type == "first_signers") {
      viewFirstSigners()
    }
    else if (filter_type == "latest_signers") {
      viewLatestSigners()
    }
    else if (filter_type == "twitter_followers") {
      viewByTwitterFollowers()
    }
    return;
  }

  // get all the signers that match name, address, twitter
  // don't add duplicates while doing that
  // add each signer to the page
  var sync = new DispatchGroup();
  var token_0 = sync.enter()

  document.getElementById("signers").innerHTML = ""
  setTimeout(function() {
    if (document.getElementById("signers").innerHTML == "" && searchEnded == false) {
        document.getElementById("signers").innerHTML = '<div class="row mx-auto mt-5 mb-1"><div class="col-lg-6 col-md-6 text-center my-auto mx-auto"><p id="signers_title">Loading Signers...</p></div></div>'
    }
  }, 2000);

  var token_1 = sync.enter()
  firebase.database().ref("tokens").child("1").child("signer_users").orderByChild("name").startAt(val).endAt(val + "\u{f8ff}").limitToLast(30).get().then((snapshot) => {
    if (snapshot.exists()) {
      snapshotToArray(snapshot).forEach(function(snapshot_user) {
        if (!signers.includes(snapshot_user)) {
          signers.push(snapshot_user)
        }
      })
    }
    sync.leave(token_1);
  })

  var token_2 = sync.enter()
  firebase.database().ref("tokens").child("1").child("signer_users").orderByChild("eth_address").startAt(val).endAt(val + "\u{f8ff}").limitToLast(30).get().then((snapshot) => {
    if (snapshot.exists()) {
      snapshotToArray(snapshot).forEach(function(snapshot_user) {
        if (!signers.includes(snapshot_user)) {
          signers.push(snapshot_user)
        }
      })
    }
    sync.leave(token_2);
  })

  var token_3 = sync.enter()
  firebase.database().ref("tokens").child("1").child("signer_users").orderByChild("twitter_username").startAt(val).endAt(val + "\u{f8ff}").limitToLast(30).get().then((snapshot) => {
    if (snapshot.exists()) {
      snapshotToArray(snapshot).forEach(function(snapshot_user) {
        if (!signers.includes(snapshot_user)) {
          signers.push(snapshot_user)
        }
      })
    }
    sync.leave(token_3);
  })

  sync.leave(token_0);
  sync.notify(function() {
    document.getElementById("signers").innerHTML = ""
    searchEnded = true
    if (signers.length > 0) {
      document.getElementById("signers").innerHTML = ""
      signers.forEach(function(snapshot_user) {
        let val = snapshot_user.val();
        let eth_address = val.eth_address;
        let name = val.name;
        let num_signer = val.num_signer;
        let profileImageUrl = val.profileImageUrl;
        let twitter_username = val.twitter_username;
        var twitter_followers_count = val.twitter_followers_count;
        let twitter_profile_image_url = val.twitter_profile_image_url;
        if (twitter_followers_count == null) {
          twitter_followers_count = 0;
        }

        var html = '<div class="row mx-auto mb-1 mt-4">'
        html += '<div class="signer col-lg-6 col-md-6 text-center my-auto mx-auto">'
        if (profileImageUrl != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + profileImageUrl + '"/></div>'
        }
        else if (twitter_profile_image_url != null) {
          html += '<div class="text-center my-auto"><img class="profile-image" src="' + twitter_profile_image_url + '"/></div>'
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
      document.getElementById("signers_title").innerHTML = "The first signable NFT<br/>" + num.toString() + " Signers"
    }
  });

  firebase.database().ref("tokens").child("1").child("ipfs_link").get().then((snapshot) => {
    if (snapshot.exists()) {
      let link = snapshot.val(); 
      let hash = link.substring(7);
      document.getElementById("signers_link").href = "https://ipfs.io/ipfs/" + hash;
    }
  });

  document.getElementById("searchBar").addEventListener('input', search);

  document.getElementById("latest_signers_button").style.backgroundColor = "#85d2b7";
  document.getElementById("twitter_followers_button").style.backgroundColor = "#85d2b7";

  document.querySelector("#latest_signers_button").addEventListener("click", viewLatestSigners);
  document.querySelector("#first_signers_button").addEventListener("click", viewFirstSigners);
  document.querySelector("#twitter_followers_button").addEventListener("click", viewByTwitterFollowers);

  viewFirstSigners();
});

