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

let bitsig_contract_address = "0x983fD6909F2eb2CE7e30De18C5B882fA78952B09"


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
  // https://cryptobook.nakov.com/crypto-libraries-for-developers/javascript-crypto-libraries prob the best

  /*

    let elliptic = require('elliptic');
    let sha3 = require('js-sha3');
    let ec = new elliptic.ec('secp256k1');

    // let keyPair = ec.genKeyPair(); // Generate random keys
    let keyPair = ec.keyFromPrivate(
    "97ddae0f3a25b92268175400149d65d6887b9cefaf28ea2c078e05cdc15a3c0a");
    let privKey = keyPair.getPrivate("hex");
    let pubKey = keyPair.getPublic();
    console.log(`Private key: ${privKey}`);
    console.log("Public key :", pubKey.encode("hex").substr(2));
    console.log("Public key (compressed):",
    pubKey.encodeCompressed("hex"));

    // sign message
    let msg = 'Message for signing';
    let msgHash = sha3.keccak256(msg);
    let signature = 
      ec.sign(msgHash, privKey, "hex", {canonical: true});

    console.log(`Msg: ${msg}`);
    console.log(`Msg hash: ${msgHash}`);
    console.log("Signature:", signature);

    // verify message
    let hexToDecimal = (x) => ec.keyFromPrivate(x, "hex")
      .getPrivate().toString(10);
    let pubKeyRecovered = ec.recoverPubKey(
      hexToDecimal(msgHash), signature,
      signature.recoveryParam, "hex");
    console.log("Recovered pubKey:",
      pubKeyRecovered.encodeCompressed("hex"));
    let validSig = ec.verify(
      msgHash, signature, pubKeyRecovered);
    console.log("Signature valid?", validSig);

    // also unrelated but just cuz of the v r s
    const message = web3.sha3('Hello World');
    const signature = await web3.eth.sign(account, message);
    const { v, r, s } = ethUtil.fromRpcSig(signature);
  */

  // https://ethereum.stackexchange.com/questions/71565/verifying-modular-exponentiation-operation-in-etherum/71590#71590
  // RSA verification in solidity

  // var signature = await web3.eth.personal.sign("Sign message to sign in", selectedAccount);
  // var Bits = 1024; 
  // console.log(signature)
  // var RSAkey = cryptico.generateRSAKey(signature, Bits);
  // var PublicKeyString = cryptico.publicKeyString(RSAkey);      
  // console.log(PublicKeyString);

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
      html += '<div class="text-center my-auto" style="padding-top: 15px;"><p><strong>Wrapped NFT: <a href="https://opensea.io/assets/' + nft.asset_contract.address + "/" + nft.token_id + '" target="_blank"></strong>https://opensea.io/assets/' + nft.asset_contract.address + "/" + nft.token_id + '</a></p></div>'
      
      html += '<div class="text-center my-auto" style="padding-top: 30px;"><p><strong>Request Signatures</strong></p></div>'

      html += '<div class="text-center my-auto" style="padding-top: 15px;"><div><input id="signer_eth_addr_' + num_signers.toString() + '" class="signer_input" placeholder="Signer #1 - Ethereum address"/></div>and / or</div>'
      html += '<div class="text-center my-auto" style="padding-top: 4px;"><div><input id="signer_twitter_' + num_signers.toString() + '" class="signer_input" placeholder="Signer #1 - Twitter username"/></div></div>'
      html += '<div id="signer_end_' + num_signers.toString() + '" class="text-center my-auto" style="padding-top: 25px;"><div><input id="signer_amount_' + num_signers.toString() + '" type="number" class="signer_input" placeholder="Signer #1 - Amount paid to sign"/></div></div>'

      html += '<div class="text-center my-auto" style="padding-top: 35px;"><p>* Withdraw your deposit at any time *</p></div>'
      html += '<div class="text-center my-auto" style="padding-top: 10px;"><button onclick="addSigner()" id="another_signature" class="make_signable">Request Another Signature</button></div>'

      // html += '<div class="text-center my-auto" style="padding-top: 30px;">Anyone can sign<button class="make_signable" style="margin-left: 15px;">Yes</button><button class="make_signable" style="margin-left: 5px;">No</button></div>'

      html += '<div class="text-center my-auto" style="padding-top: 40px;"><button onclick="mintNFT()" class="gradient-button">Mint</button></div>'
      html += '</div></div>'
      document.getElementById("nft-form").innerHTML = html

      // window.contract = loadContract(web3);
      window.wrapped_nft = wrapped_nft;
      
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
  if (wrapped_nft == null) {
    return
  }
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  var account = accounts[0];

  var signer_addresses = []
  var addresses_values = []

  var signer_twitters = []
  var twitter_values = []

  var totalAmount = 0;

  for (var i=0; i<num_signers; i++) {
    var address = document.getElementById("signer_eth_addr_" + (i+1).toString()).value;
    var twitter = document.getElementById("signer_twitter_" + (i+1).toString()).value;
    var amount = document.getElementById("signer_amount_" + (i+1).toString()).value;

    if (address !== null && address !== "") {
      signer_addresses.push(address)
      addresses_values.push(web3.utils.toWei(amount.toString(), "ether"));
    }
    else if (twitter !== null && twitter !== "") {
      signer_twitters.push(twitter)
      twitter_values.push(web3.utils.toWei(amount.toString(), "ether"));
    }
    totalAmount += parseFloat(amount);
  }

  console.log(signer_addresses)
  console.log(addresses_values)
  console.log(signer_twitters)
  console.log(twitter_values)

  let metadata_url = wrapped_nft.token_metadata
  if (metadata_url !== null) {
    var request_metadata = new XMLHttpRequest()
    request_metadata.open('GET', metadata_url, true)
    request_metadata.onload = function () {
      var metadata = JSON.parse(this.response)
      if (request_metadata.status >= 200 && request_metadata.status < 400) {

        // figure out the token ID so that it can be placed in URL
        const hash = web3.utils.soliditySha3({ type: 'address', value: wrapped_nft.asset_contract.address },{ type: 'uint256', value: wrapped_nft.token_id });
        const token_id = web3.utils.hexToNumberString(hash);

        metadata.external_url = "https://bitsig.org/token?contract_address=" + bitsig_contract_address + "&token_id=" + token_id

        if (metadata.name !== null && metadata.name !== "") {
          metadata.name = metadata.name + " | Signed"
        }
        else {
          metadata.name = "Signed Token"
        }

        let upload_name = bitsig_contract_address + "_" + token_id + ".json"

        var request_hash = new XMLHttpRequest()
        request_hash.open('POST', "https://us-central1-bitsig-21bf7.cloudfunctions.net/uploadMetadata", true)
        request_hash.onload = function () {
          let hash = this.response;
          console.log(hash)

          var totalAmountWei = web3.utils.toWei(totalAmount.toString(), "ether")

          console.log("ipfs://" + hash)
          console.log(wrapped_nft.asset_contract.address)
          console.log(wrapped_nft.token_id)

          // file uploaded, now we can set that as the tokenURI
          var contract = new web3.eth.Contract([{"inputs":[{"internalType":"address[]","name":"_allowedSigners","type":"address[]"},{"internalType":"uint256[]","name":"_amountForEach","type":"uint256[]"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"addAllowedSigners","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"string[]","name":"_reservedSigners","type":"string[]"},{"internalType":"uint256[]","name":"_amountForEachReserved","type":"uint256[]"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"addReservedSigners","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"hash","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"addSignature","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_reservedSigner","type":"string"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"increaeAmountForReserved","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_allowedSigner","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"increaseAmountForApproved","outputs":[],"stateMutability":"payable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"tokenURI_","type":"string"},{"internalType":"address[]","name":"_allowedSigners","type":"address[]"},{"internalType":"uint256[]","name":"_amountForEach","type":"uint256[]"},{"internalType":"string[]","name":"_reservedSigners","type":"string[]"},{"internalType":"uint256[]","name":"_amountForEachReserved","type":"uint256[]"},{"internalType":"address","name":"_externalNftContractAddress","type":"address"},{"internalType":"uint256","name":"_externalTokenId","type":"uint256"}],"name":"safeMint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_reservedSigner","type":"string"},{"internalType":"address","name":"_signerAddress","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"setAddressForReserved","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"address","name":"_allowedSigner","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"withdrawAllowedSigner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_reservedSigner","type":"string"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"withdrawReservedSigner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_externalNftContractAddress","type":"address"},{"internalType":"uint256","name":"_externalTokenId","type":"uint256"}],"name":"getTokenIdOfWrappedNFT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getTokenSigners","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"}],"name":"reservedSignerPayouts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"signerPayouts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"tokenSignDate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenSigners","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]
            , bitsig_contract_address);
          var safeMint = contract.methods.safeMint("ipfs://" + hash, signer_addresses, addresses_values, signer_twitters, twitter_values, wrapped_nft.asset_contract.address, wrapped_nft.token_id).encodeABI();

          // Chain ID of Ropsten Test Net is 3, replace it to 1 for Main Net
          var chainId = 3;
          web3.eth.sendTransaction({to:bitsig_contract_address, from:account, value: totalAmountWei, data: safeMint, "chainId": chainId})
          .on('transactionHash', function(hash){
            console.log("hash")
            console.log(hash)
          })
          .on('receipt', function(receipt){
            console.log("receipt")
            console.log(receipt)
          })
          .on('confirmation', function(confirmationNumber, receipt){ 

          })
          .on('error', console.error); // If a out of gas error, the second parameter is the receipt.

        }
        var metadata_params = {
          "metadata": metadata,
          "name": upload_name
        }
        request_hash.send(JSON.stringify(metadata_params))
      }
    }
    request_metadata.send()
  }
  else {
    // create your own metadata with wrapped contract address and wrapped contract id
    createMetadata()
    // then can upload to pinata and use that as the tokenURI
  }
}

function createMetadata() {

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

  // console.log("Killing the wallet connection", provider);

  // // TODO: Which providers have close method?
  // if(provider.close) {
  //   await provider.close();

  //   // If the cached provider is not cleared,
  //   // WalletConnect will default to the existing session
  //   // and does not allow to re-scan the QR code with a new wallet.
  //   // Depending on your use case you may want or want not his behavir.
  //   await web3Modal.clearCachedProvider();
  //   provider = null;
  // }

  await web3Modal.clearCachedProvider();

  selectedAccount = null;
}

/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
  init();

  document.getElementById('disconnect').addEventListener("click", onDisconnect())

  var modal = document.getElementById("signUpModal");

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});

