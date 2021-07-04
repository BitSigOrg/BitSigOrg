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
firebase.analytics();

 // Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;

var bitsigSignature;
var name;
var ethaddress;
var signedMessage;
var firebaseUID = "";
var twitterUsername = "";


/**
 * Setup the orchestra
 */
function init() {

  console.log("Initializing example");
  console.log("WalletConnectProvider is", WalletConnectProvider);
  console.log("Fortmatic is", Fortmatic);
  console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

  // Check that the web page is run in a secure context,
  // as otherwise MetaMask won't be available
  // if(location.protocol !== 'https:') {
  //   // https://ethereum.stackexchange.com/a/62217/620
  //   const alert = document.querySelector("#alert-error-https");
  //   alert.style.display = "block";
  //   document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  //   return;
  // }

  // Tell Web3modal what providers we have available.
  // Built-in web browser provider (only one can exist as a time)
  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "a1d2d05b386a403296580b00c8032130",
      }
    },

    fortmatic: {
      package: Fortmatic,
      options: {
        key: "pk_test_C99A517CE7B79A76"
        // key: "pk_live_A4C2D41D64B917E8"
      }
    }
  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  console.log("Web3Modal instance is", web3Modal);
}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {

  // Get a Web3 instance for the wallet
  const web3 = new Web3(provider);

  console.log("Web3 instance is", web3);

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId();
  // Load chain information over an HTTP API
  const chainData = evmChains.getChain(chainId);
  document.querySelector("#network-name").textContent = chainData.name;

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();

  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  selectedAccount = accounts[0];
  ethaddress = selectedAccount;

  // document.querySelector("#selected-account").textContent = selectedAccount;

  // Get a handle
  // const template = document.querySelector("#template-balance");
  // const accountContainer = document.querySelector("#accounts");

  // Purge UI elements any previously loaded accounts
  // accountContainer.innerHTML = '';

  // // Go through all accounts and get their ETH balance
  // const rowResolvers = accounts.map(async (address) => {
  //   const balance = await web3.eth.getBalance(address);
  //   // ethBalance is a BigNumber instance
  //   // https://github.com/indutny/bn.js/
  //   const ethBalance = web3.utils.fromWei(balance, "ether");
  //   const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
  //   console.log(humanFriendlyBalance);
  //   // Fill in the templated row and put in the document
  //   // const clone = template.content.cloneNode(true);
  //   // clone.querySelector(".address").textContent = address;
  //   // clone.querySelector(".balance").textContent = humanFriendlyBalance;
  //   // accountContainer.appendChild(clone);
  // });

  // Because rendering account does its own RPC commucation
  // with Ethereum node, we do not want to display any results
  // until data for all accounts is loaded
  // await Promise.all(rowResolvers);

  // Display fully loaded UI for wallet data
  document.querySelector("#btn-connect-container").style.display = "none";
  document.querySelector("#btn-disconnect").style.display = "inline";
  document.querySelector("#blockchain_status").style.display = "inline";
  document.querySelector("#sign_button").style.display = "inline";
}

function closeSigning() {
  var modal = document.getElementById("emailConfirmationModal");
  modal.style.display = "none";
}

// connects name and twitter too
function finishSigning() {
  var new_name = document.getElementById("modal-name-2").value;
  if (new_name == null) {
    new_name = "";
  }
  if (new_name !== "" && new_name !== name && firebaseUID !== ""){
    firebase.database().ref("tokens").child("1").child("signer_users").child(firebaseUID).child("name").set(new_name);
    firebase.database().ref("users").child(firebaseUID).child("name").set(new_name);
  }
  document.querySelector("#addNameTwitterModal").style.display = "none";
  window.location.replace('https://bitsig.org/signedToken');
}

function connectToTwitter() {
  var provider = new firebase.auth.TwitterAuthProvider();
  firebase.auth().currentUser.linkWithPopup(provider).then((result) => {
    let twitter_info = result.additionalUserInfo;
    if (twitter_info !== null) {
      let profile = twitter_info.profile;
      if (profile !== null) {
        let username = profile["screen_name"]
        let profile_image_url = profile["profile_image_url"]
        let verified = profile["verified"]
        let followers_count = profile["followers_count"]
        let id = profile["id_str"]
        twitterUsername = username;
        if (username !== null && username !== "" && firebaseUID !== "") {
          firebase.database().ref("tokens").child("1").child("signer_users").child(firebaseUID).child("twitter_username").set(username);
          firebase.database().ref("users").child(firebaseUID).child("twitter_username").set(username);

          firebase.database().ref("tokens").child("1").child("signer_users").child(firebaseUID).child("followers_count").set(followers_count);
          firebase.database().ref("users").child(firebaseUID).child("followers_count").set(followers_count);

          firebase.database().ref('twitter_users').child(username).child(firebaseUID).set({
            twitter_id: id,
            profile_image_url: profile_image_url,
            verified: verified
          }, (error) => {
            if (error) {
              console.log("error")
            } else {
              console.log("connected twitter")
            }
          });

          // set "connected"
         document.getElementById("connect-twitter").innerHTML = '<i class="fab fa-twitter"></i> ' + username;
        }
      }
    }
  }).catch((error) => {
    // Handle Errors here.
    // ...
  });
}

function connectSignature(uid) {
  alert("connecting signature")
  firebase.database().ref("users").child(uid).get().then((snapshot) => {
    if (!snapshot.exists()) {
      firebase.database().ref('users').child(uid).set({
        eth_address: ethaddress,
        name: name,
        twitter_username: ""
      }, (error) => {
        if (error) {
          console.log("failed to create user in database")
        } else {
          firebase.database().ref("users").child(firebaseUID).child("asked_for_name").set(true);
          firebase.database().ref('tokens').child("1").child("signer_users").child(uid).set({
            ethereum_address: ethaddress,
            message: signedMessage,
            name: name,
            signature: bitsigSignature,
            num_signer: 1
          }, (error) => {
            if (error) {
              console.log("error")
            } else {
              console.log("successfully signed");
              document.querySelector("#signUpModal").style.display = "none";
              document.querySelector("#addNameTwitterModal").style.display = "block";
              document.querySelector("#modal-name-2").value = name;
            }
          });
        }
      });
    }
  }).catch((error) => {
    console.error(error);
  });
}

function signIn() {
  let email = document.getElementById("modal-email").value;
  let password = document.getElementById("password-1").value;
  let password2 = document.getElementById("password-2").value;
  name = document.getElementById("modal-name").value;
  if (name == null) {
    name = "";
  }

  if (password == password2) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
      var user = userCredential.user;
      firebaseUID = user.uid;
      connectSignature(user.uid);
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ..
    });
  }
  else {
    alert("Passwords don't match.")
  }
}

// can ask if they want to be in the token too later
async function sign() {
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  const secondsSinceEpoch = Math.round(Date.now() / 1000)
  var message = "contractAddress=abcd&tokenId=1" + "&timestamp=" + secondsSinceEpoch;
  signedMessage = message;
  var hash = web3.utils.sha3(message)

  var sign_modal = document.getElementById("askForSignModal");
  sign_modal.style.display = "block";

  var signature = await web3.eth.personal.sign(hash, accounts[0]);
  window.localStorage.setItem('bitsigSignature', signature);
  bitsigSignature = signature;


  sign_modal.style.display = "none";
  var modal = document.getElementById("signUpModal");
  modal.style.display = "block";
}

function googleSignin() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;
    var token = credential.accessToken;
    var user = result.user;
    firebaseUID = user.uid;

    connectSignature(user.uid);
  }).catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorMessage)
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
  document.querySelector("#btn-disconnect").style.display = "none";
  document.querySelector("#btn-connect-container").style.display = "inline";
  document.querySelector("#blockchain_status").style.display = "none";
  document.querySelector("#sign_button").style.display = "none";
  document.querySelector("#blockchain_status").style.display = "none";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
  document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {

  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  // // Subscribe to accounts change
  // provider.on("accountsChanged", (accounts) => {
  //   fetchAccountData();
  // });

  // // Subscribe to chainId change
  // provider.on("chainChanged", (chainId) => {
  //   fetchAccountData();
  // });

  // // Subscribe to networkId change
  // provider.on("networkChanged", (networkId) => {
  //   fetchAccountData();
  // });

  fetchAccountData();

  await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

  console.log("Killing the wallet connection", provider);

  // TODO: Which providers have close method?
  if(provider.close) {
    await provider.close();

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
    provider = null;
  }

  selectedAccount = null;

  // Set the UI back to the initial state
  document.querySelector("#btn-connect-container").style.display = "inline";
  document.querySelector("#btn-disconnect").style.display = "none";
  document.querySelector("#blockchain_status").style.display = "none";
  document.querySelector("#sign_button").style.display = "none";
}


/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
  init();
  document.querySelector("#btn-connect").addEventListener("click", onConnect);
  document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
  document.querySelector("#sign_button").addEventListener("click", sign);
  document.querySelector("#modal-continue").addEventListener("click", signIn);
  document.querySelector("#google-button").addEventListener("click", googleSignin);
  document.querySelector("#finish-signing").addEventListener("click", finishSigning);
  document.querySelector("#connect-twitter").addEventListener("click", connectToTwitter);

  var modal = document.getElementById("signUpModal");

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});

