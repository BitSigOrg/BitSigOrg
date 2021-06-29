"use strict";

/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

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

async function finishSigning() {
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  var message = "Some string"
  var hash = web3.utils.sha3(message)
  var signature = await web3.eth.personal.sign(hash, accounts[0])
  alert(signature);
}

function verificationCode() {
  document.querySelector("#modal-email").style.display = "none";
  document.querySelector("#modal-name").style.display = "none";
  document.querySelector("#modal-continue-container").style.display = "none";

  document.querySelector("#modal-verification-container").style.display = "inline";
  document.querySelector("#modal-verification-info").innerHTML = "Enter the verification code sent<br/>to " + document.getElementById("modal-email").value;
  document.querySelector("#modal-verification-info-container").style.display = "inline";
  document.querySelector("#modal-resend-container").style.display = "inline";
  document.querySelector("#modal-sign-container").style.display = "inline";
}

// can ask if they want to be on the token too
function sign() {
  var modal = document.getElementById("signUpModal");
  modal.style.display = "block";
}

function resendCode() {

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
  document.querySelector("#btn-connect").style.display = "inline";
  document.querySelector("#blockchain_status").style.display = "none";
  document.querySelector("#sign_button").style.display = "none";

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
  document.querySelector("#btn-connect").style.display = "inline";
  document.querySelector("#btn-disconnect").style.display = "none";
  document.querySelector("#blockchain_status").style.display = "none";
  document.querySelector("#sign_button").style.display = "none";
}


/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
  // Confirm the link is a sign-in with email link.
  let params = (new URL(document.location)).searchParams;
  let name = params.get('name');
  let signature = params.get('signature')

  if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    var email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      // later on, have them re-enter email to stop session injection
      email = params.get('email');
    }
    // The client SDK will parse the code from the link for you.
    firebase.auth().signInWithEmailLink(email, window.location.href)
      .then((result) => {
        // Clear email from storage.
        window.localStorage.removeItem('emailForSignIn');
        let user = result.user;
        console.log("got user")
        console.log(user);
        console.log(name);
        console.log(signature);
      })
      .catch((error) => {
      
      });
  }

  init();
  document.querySelector("#btn-connect").addEventListener("click", onConnect);
  document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
  // document.querySelector("#sign_button").addEventListener("click", sign);
  // document.querySelector("#modal-continue").addEventListener("click", verificationCode);
  // document.querySelector("#modal-resend").addEventListener("click", resendCode);
  // document.querySelector("#modal-sign").addEventListener("click", finishSigning);

  var modal = document.getElementById("signUpModal");
  var btn = document.getElementById("myBtn");
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});

