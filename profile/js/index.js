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

  // let opensea_api = "https://api.opensea.io/api/v1/assets?owner=0x409062a018E3355f158f0D13dF222E161Df92d79"
  let opensea_api = "https://rinkeby-api.opensea.io/api/v1/assets?owner=0x409062a018E3355f158f0D13dF222E161Df92d79"
  var request = new XMLHttpRequest()
  request.open('GET', opensea_api, true)
  request.onload = function () {
    // Begin accessing JSON data here
    var data = JSON.parse(this.response)
    if (request.status >= 200 && request.status < 400) {
      assets = data.assets
      console.log(assets)
      document.getElementById("nfts").innerHTML = '<div class="col-lg-6 col-md-6 text-center my-auto mx-auto"><p class="desc_text_highlighted">My NFTs</p></div>'
      assets.forEach((nft) => {
        let create_url = '../create/index.html?contract_address=' + nft.asset_contract.address + '&token_id=' + nft.token_id

        var html = '<div class="row mx-auto mb-1 mt-4">'
        html += '<div class="nft col-lg-5 col-md-5 text-center my-auto mx-auto">'
        if (nft.image_original_url != null) {
          html += '<div class="text-center my-auto"><img class="nft-image" src="' + nft.image_original_url + '"/></div>'
        }
        if(nft.name != null && nft.name != "") {
          html += '<div class="text-center my-auto" style="padding-top: 0px;"><p><strong>' + nft.asset_contract.name + ': </strong>' + nft.name + '</p></div>'
        }
        if(nft.token_id != null && nft.token_id != "") {
          html += '<div class="text-center my-auto" style="padding-top: 0px;"><p><strong>Token ID: </strong>' + nft.token_id + '</p></div>'
        }
        html += '<div class="text-center my-auto"><a style="text-decoration:none" target="_blank" href="' + nft.permalink + '"><p>View on OpenSea</p><a/></div>'
        html += '<a href="' + create_url + '"><div class="text-center my-auto" style="padding-top: 20px;"><button class="make_signable">Make Signable</button></a></div>'
        html += '</div></div>'
        document.getElementById("nfts").innerHTML += html

      })
    } else {
      console.log('error')
    }
  }
  request.send()



  document.getElementById("disconnect").style.display = "inline";
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

