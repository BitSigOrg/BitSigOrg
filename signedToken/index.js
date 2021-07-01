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

  // Display fully loaded UI for wallet data
  document.querySelector("#btn-connect").style.display = "none";
  document.querySelector("#btn-disconnect").style.display = "inline";
  document.querySelector("#blockchain_status").style.display = "inline";
  document.querySelector("#sign_button").style.display = "inline";
}

// can ask if they want to be on the token too
function sign() {
  var modal = document.getElementById("signUpModal");
  modal.style.display = "block";
}


async function refreshAccountData() {
  document.querySelector("#btn-disconnect").style.display = "none";
  document.querySelector("#btn-connect").style.display = "inline";
  document.querySelector("#blockchain_status").style.display = "none";
  document.querySelector("#sign_button").style.display = "none";

  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
  document.querySelector("#btn-connect").removeAttribute("disabled")
}

async function onConnect() {

  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  fetchAccountData();

  await refreshAccountData();
}

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
  document.querySelector("#btn-connect").style.display = "inline";
  document.querySelector("#btn-disconnect").style.display = "none";
  document.querySelector("#blockchain_status").style.display = "none";
  document.querySelector("#sign_button").style.display = "none";
}

function setLoading() {
    var canvas = document.getElementById("qr");
    canvas.width = 2048;
    canvas.height = 2408;
    var context = canvas.getContext("2d");

    var img = new Image();
    img.src = "img/ticket_loading.jpg";
    img.onload = function () {
        context.drawImage(img, 0, 0, img.width, img.height,0, 0, canvas.width, canvas.height);
    };
}

function addTextToImage(imagePath, sigNum) {
    var canvas = document.getElementById("qr");
    canvas.width = 2048;
    canvas.height = 2408;
    var context = canvas.getContext("2d");

    var img = new Image();
    img.src = imagePath;
    img.onload = function () {
        context.drawImage(img, 0, 0, img.width, img.height,0, 0, canvas.width, canvas.height);
        context.lineWidth = 1;
        context.fillStyle = "#27bd82";
        // context.lineStyle = "#ffff00";
        context.font = "bolder 98px avenir";

        context.fillText(sigNum, 710 - (25 * (sigNum.length-13)), 310)
    };
}

function addTextToImageName(imagePath, sigNum, name) {
    var canvas = document.getElementById("qr");
    canvas.width = 2048;
    canvas.height = 2408;
    var context = canvas.getContext("2d");

    var img = new Image();
    img.src = imagePath;
    img.onload = function () {
        context.drawImage(img, 0, 0, img.width, img.height,0, 0, canvas.width, canvas.height);
        context.lineWidth = 1;
        context.fillStyle = "#27bd82";
        // context.lineStyle = "#ffff00";
        context.font = "bolder 98px avenir";

        context.fillText(sigNum, 710 - (25 * (sigNum.length-13)), 310)
        context.fillText(name, 710 - (25 * (name.length-13)), 460)
    };
}

function addTextToImageNameExtended(imagePath, sigNum, name, name_extended) {
    var canvas = document.getElementById("qr");
    canvas.width = 2048;
    canvas.height = 2408;
    var context = canvas.getContext("2d");

    var img = new Image();
    img.src = imagePath;
    img.onload = function () {
        context.drawImage(img, 0, 0, img.width, img.height,0, 0, canvas.width, canvas.height);
        context.lineWidth = 1;
        context.fillStyle = "#27bd82";
        // context.lineStyle = "#ffff00";
        context.font = "bolder 98px avenir";

        context.fillText(sigNum, 710 - (25 * (sigNum.length-13)), 310)
        context.fillText(name, 710 - (25 * (name.length-13)), 460)
        context.fillText(name_extended, 710 - (25 * (name.length-13)), 580)
    };
}

function saveImage() {
  // var canvas = document.getElementById("qr");
  // var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); 
  // window.location.href=image;

  var link = document.createElement('a');
  link.download = 'bitsig_receipt.png';
  link.href = document.getElementById('qr').toDataURL()
  link.click();
}

window.addEventListener('load', async () => {
  setLoading();

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("signed in");
      var uid = user.uid;
      console.log(uid);
      firebase.database().ref("tokens").child("1").child("signer_users").child(uid).get().then((snapshot) => {
        console.log("1")
        if (snapshot.exists()) {
          console.log("2")
          let num = snapshot.val().num_signer;
          console.log(num)
          let name = snapshot.val().name;
          console.log(name)
          if (name == "") {
            addTextToImage('img/ticket_10.jpg', "Signature #" + num.toString())
          }
          else if (nameExtended == "") {
            addTextToImageName('img/ticket_10_name.jpg', "Signature #" + num.toString(), "Signer: " + name)
          }
          else {
            addTextToImageNameExtended('img/ticket_10_name_extended.jpg', "Signature #" + num.toString(), "Signer: " + name, nameExtended)
          }
        }
      })
    } else {
      console.log("not signed in")
      // window.location.replace('https://bitsig.org/');
    }
  });

  document.querySelector("#save_button").addEventListener("click", saveImage);

  // init();
  // document.querySelector("#btn-connect").addEventListener("click", onConnect);
  // document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
  // document.querySelector("#sign_button").addEventListener("click", sign);
  // document.querySelector("#modal-continue").addEventListener("click", verificationCode);
  // document.querySelector("#modal-resend").addEventListener("click", resendCode);
  // document.querySelector("#modal-sign").addEventListener("click", finishSigning);

  // var modal = document.getElementById("signUpModal");
  // var btn = document.getElementById("myBtn");
  // var span = document.getElementsByClassName("close")[0];

  // // When the user clicks on <span> (x), close the modal
  // span.onclick = function() {
  //   modal.style.display = "none";
  // }

  // // When the user clicks anywhere outside of the modal, close it
  // window.onclick = function(event) {
  //   if (event.target == modal) {
  //     modal.style.display = "none";
  //   }
  // }
});

