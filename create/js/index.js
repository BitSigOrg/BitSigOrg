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
    cacheProvider: true, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  if (web3Modal.cachedProvider) {
    console.log("cached")
    onConnect();
  }
  else {
    onConnect();
  }

  console.log("Web3Modal instance is", web3Modal);
}

var num_signers = 1

var assets = []

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
  // document.querySelector("#network-name").textContent = chainData.name;

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();

  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  selectedAccount = accounts[0];
  ethaddress = selectedAccount;

  console.log(selectedAccount);

  const params = (new URL(document.location)).searchParams;
  let contract_address = params.get('contract_address');
  let token_id = params.get('token_id');

  let opensea_api = "https://api.opensea.io/api/v1/assets?asset_contract_addresses=" + contract_address + "&token_ids=" + token_id;
  var request = new XMLHttpRequest()
  request.open('GET', opensea_api, true)
  request.onload = function () {
    // Begin accessing JSON data here
    var data = JSON.parse(this.response)
    if (request.status >= 200 && request.status < 400) {
      var nft = data.assets[0]
      console.log(nft)
      document.getElementById("nft-form").innerHTML = ""
      var html = '<div class="row mx-auto mb-4 mt-0">'
      html += '<div class="nft col-lg-11 col-md-11 text-center my-auto mx-auto">'
      if (nft.image_original_url != null) {
        html += '<div class="text-center my-auto"><img class="nft-image" src="' + nft.image_original_url + '"/></div>'
      }
      if(nft.name != null && nft.name != "") {
        html += '<div class="text-center my-auto" style="padding-top: 10px;"><p><strong>Name: </strong>' + nft.name + '</p></div>'
      }
      if(nft.description != null && nft.description != "") {
        html += '<div class="text-center my-auto" style="padding-top: 15px;"><p><strong>Description: </strong>' + nft.description + '</p></div>'
      }
      html += '<div class="text-center my-auto" style="padding-top: 15px;"><p><strong>Wrapped NFT: <a href="https://opensea.io/assets/' + nft.asset_contract.address + "/" + nft.token_id + '" target="_blank"></strong>https://opensea.io/assets/' + nft.asset_contract.address + "/" + nft.token_id + '</a></p></div>'
      
      html += '<div class="text-center my-auto" style="padding-top: 30px;"><p><strong>Request Signatures</strong></p></div>'

      html += '<div class="text-center my-auto" style="padding-top: 15px;"><div><input id="signer_eth_addr_' + num_signers.toString() + '" class="signer_input" placeholder="Signer #1 - Ethereum address"/></div>and / or</div>'
      html += '<div class="text-center my-auto" style="padding-top: 4px;"><div><input id="signer_twitter_' + num_signers.toString() + '" class="signer_input" placeholder="Signer #1 - Twitter username"/></div></div>'
      html += '<div id="signer_end_' + num_signers.toString() + '" class="text-center my-auto" style="padding-top: 25px;"><div><input id="signer_amount_' + num_signers.toString() + '" type="number" class="signer_input" placeholder="Signer #1 - Amount paid to sign"/></div></div>'

      html += '<div class="text-center my-auto" style="padding-top: 35px;"><p>* Withdraw your deposit at any time *</p></div>'
      html += '<div class="text-center my-auto" style="padding-top: 10px;"><button onclick="addSigner()" id="another_signature" class="make_signable">Request Another Signature</button></div>'

      // html += '<div class="text-center my-auto" style="padding-top: 30px;">Anyone can sign<button class="make_signable" style="margin-left: 15px;">Yes</button><button class="make_signable" style="margin-left: 5px;">No</button></div>'

      html += '<div class="text-center my-auto" style="padding-top: 40px;"><button class="gradient-button">Mint</button></div>'
      html += '</div></div>'
      document.getElementById("nft-form").innerHTML = html

      
    } else {
      console.log('error')
    }
  }
  request.send()

  document.getElementById("disconnect").style.display = "inline";
}

function addSigner() {
  num_signers += 1;
  var html = ""
  html += '<div class="text-center my-auto" style="padding-top: 50px;"><div><input id="signer_eth_addr_' + num_signers.toString() + '" class="signer_input" placeholder="Signer #' + num_signers.toString() + ' - Ethereum address"/></div>and / or'
  html += '<div class="text-center my-auto" style="padding-top: 4px;"><div><input id="signer_twitter_' + num_signers.toString() + '" class="signer_input" placeholder="Signer #' + num_signers.toString() + ' - Twitter username"/></div>'
  html += '<div id="signer_end_' + num_signers.toString() + '" class="text-center my-auto" style="padding-top: 25px;"><div><input id="signer_amount_' + num_signers.toString() + '" type="number" class="signer_input" placeholder="Signer #' + num_signers.toString() + ' - Amount paid to sign"/></div>'
  var last_signer = document.getElementById("signer_end_" + (num_signers-1).toString());
  last_signer.insertAdjacentHTML("afterend", html);
}

async function mintNFT() {
  
}


/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

  document.getElementById("disconnect").style.display = "inline";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
  document.querySelector("#disconnect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
  document.querySelector("#disconnect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {

  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    if (accounts !== null) {
      console.log(accounts[0])
    }
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

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

  var modal = document.getElementById("signUpModal");

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});

