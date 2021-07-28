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
  if (localStorage.getItem("walletProvider") !== null) {
    provider = JSON.parse(localStorage.getItem("walletProvider"));
  }

  document.getElementById("connect").style.display = "inline";
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

  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

  provider.on("connect", (chainId) => {
    localStorage['walletProvider'] = JSON.stringify(provider);
  });

  provider.on("connect", (chainId) => {
    localStorage.setItem("walletProvider") = JSON.stringify(provider);
  });

  provider.on("disconnect", (code, message) => {
    onDisconnect();
  });

  await refreshAccountData();
}

async function onDisconnect() {
  console.log("Killing the wallet connection");

  // await web3Modal.clearCachedProvider();
  provider = null;
  localStorage.setItem("walletProvider") = null;

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
});















