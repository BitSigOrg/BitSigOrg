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

let bitsig_contract_address = "0xa4201FCbb1D90AdfAF67B2632b8236B39D3c49f3"


async function init() {
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
    theme: "dark"
  });

  // if (web3Modal.cachedProvider) {
  //   onConnect();
  // }
  // console.log("test")
  // if (localStorage.getItem("walletProvider") !== null && localStorage.getItem("walletProvider") !== "") {
  //   console.log("cache exists")
  //   console.log("provider ", localStorage.getItem("walletProvider"))
  //   provider = JSON.parse(localStorage.getItem("walletProvider"));
  //   console.log(provider)
  // }

  document.getElementById("connect").style.display = "inline";

  console.log("Web3Modal instance is", web3Modal);
}

var num_signers = 1
var assets = []
var wrapped_nft;


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

  console.log("----")

  document.getElementById("disconnect").style.display = "inline";
}


async function refreshAccountData() {
  document.getElementById("disconnect").style.display = "inline";
  document.getElementById("connect").style.display = "none";

  document.querySelector("#disconnect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
  document.querySelector("#disconnect").removeAttribute("disabled")
}


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

  provider.on("connect", (chainId) => {
    console.log("connected")
    // localStorage.setItem("walletProvider", JSON.stringify(provider));
    
  });

  provider.on("disconnect", (code, message) => {
    onDisconnect();
  });

  await refreshAccountData();
}

async function onDisconnect() {
  console.log("Killing the wallet connection");

  // await web3Modal.clearCachedProvider();
  // provider = null;

  provider = null;
  // localStorage.setItem("walletProvider", null);

  selectedAccount = null;

  document.getElementById('disconnect').style.display = "none";
  document.getElementById('connect').style.display = "inline";
}

/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
  init();
  document.querySelector("#connect").addEventListener("click", onConnect);
  document.querySelector("#disconnect").addEventListener("click", onDisconnect);

  const params = (new URL(document.location)).searchParams;
  let contract_address = params.get('contract_address');
  let token_id = params.get('token_id');

  let opensea_api = "https://rinkeby-api.opensea.io/api/v1/assets?asset_contract_addresses=" + contract_address + "&token_ids=" + token_id;
  var request = new XMLHttpRequest()
  request.open('GET', opensea_api, true)
  request.onload = function () {
    // Begin accessing JSON data here
    var data = JSON.parse(this.response)
    if (request.status >= 200 && request.status < 400) {
      var nft = data.assets[0]
      wrapped_nft = nft;

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
      
      if (nft.asset_contract.address.toLowerCase() === bitsig_contract_address.toLowerCase()) {
        let metadata_url = wrapped_nft.token_metadata
        if (metadata_url !== null) {
          var request_metadata = new XMLHttpRequest()
          request_metadata.open('GET', metadata_url, true)
          request_metadata.onload = function () {
            var metadata = JSON.parse(this.response)
            if (request_metadata.status >= 200 && request_metadata.status < 400) {
              let wrapped_nft_contract = metadata.wrapped_nft_contract;
              let wrapped_nft_token_id = metadata.wrapped_nft_token_id;

              // These will be null since just added them to metadata and not in the existing one
              if (wrapped_nft_contract!== null && wrapped_nft_token_id !== null) {

              }
            }
          }
          request_metadata.send()
        }
        html += '<div class="text-center my-auto" style="padding-top: 15px;"><p><strong>Wrapped NFT: <a href="https://testnets.opensea.io/assets/' + nft.asset_contract.address + "/" + nft.token_id + '" target="_blank"></strong><br/>View on OpenSea</a></p></div>'
        html += '<div class="text-center my-auto" style="padding-top: 40px;"><button onclick="mintNFT()" class="gradient-button">Sign</button></div>'
      }
      html += '</div></div>'
      document.getElementById("nft-form").innerHTML = html

      // window.contract = loadContract(web3);
      window.wrapped_nft = wrapped_nft;
      
    } else {
      console.log('error')
    }
  }
  request.send()
});












