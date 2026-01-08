//  Start Tab Pannels

const importText = document.getElementById('import-text-area');

const formCreateAccount =   document.getElementById('create-new-form');
const importTextButton = document.getElementById('import-text-button')
const importTextForm = document.getElementById('import-text-form');
const userProfileForm = document.getElementById('user-profile-form')
const formAddBanker = document.getElementById('add-banker-form');
const formWithdraw = document.getElementById('withdraw-submit')
const contractName = document.getElementById("contract-name");
const creatorEmail = document.getElementById("creator-email");
const creatorAddress = document.getElementById("creator-address");
const minusButton = document.getElementById('address-amount');
const withdrawalAddBtn = document.getElementById('withdrawal-plus-icon')
const getbankerClick = document.getElementsByClassName('getbankerClick')[0]
const getListClick = document.getElementsByClassName('getlistClick')[0]
let CURRENT_ACCOUNT = null;

/**
  Tabs container ids
**/
let importTextTab = document.getElementById('importText')
let firstTab = document.getElementById('first')
let secondTab = document.getElementById('second')
let addBankerTab = document.getElementById('addbanker')
let thirdTab = document.getElementById('third')
let fourthTab = document.getElementById('fourth')
let fifthTab = document.getElementById('sixth')

/**
  Import Text screen
**/
let importArea = document.getElementById('import-area')
let bankerVerifyWithdrawal = document.getElementById('banker-verify-withdrawal')
let bankerMessageSignTx = document.getElementById('banker-message-signtx-container')
let ownerMessageSignRequest = document.getElementById('owner-message-sign-request-container')
let ownerWithdrawalBroadcast = document.getElementById('owner-withdrawal-broadcast-container')
let bankerGeneratePrivkey = document.getElementById('banker-privkey-generation')


/**
  Withdrawal screen
**/
let withdrawalFee = document.getElementById("withdraw-fee")
let donateBtn = document.getElementById("donate-button")
let sendSignatureCloseBtn = document.getElementById("send-signature-close-btn")

/**
  Export screen
**/
let exportBtn = document.getElementById("export-btn")
let browseBtn = document.getElementById("export-browse-btn")
let inputFileBrowser = document.getElementById("select-dir")


/**
  Add banker screen
*/
let bankerForm = document.getElementById('add-banker-form')
let bankersList = document.getElementById('bankers-list-container')
let bankerMessage = document.getElementById('banker-message-container')


const sigNumber = document.getElementById('releaseCoins');
const currency = document.getElementById('account-coin-currency')
currency.addEventListener('change', setAccountCurrency)
let ACCOUNT_CURRENCY = "woodcoin"

let tabsContainer = document.getElementById('tabs');
let tabTogglers = tabsContainer.querySelectorAll("aside #tabs a");
let bankersArray
let openTab
let selectedAccountDetails = {}
let USER = {}
let BANKERS

/**
  Withdrawal vars
**/
let unspentAmountTotal = 0
let userInputAmountTotal = 0
let TOTAL_AMOUNT_TO_WITHDRAW = 0
let CHANGE_ADDRESS
let CHANGE_AMOUNT
let DONATION_LOG = 'WhAiyvrEhG6Ty9AkTb1hnUwbT3PubdWkAg'
let DONATION_BTC = '3QgAVe5W8EpRUKk7ucmA2Ra3suYzC4yRE4'
let DONATION_LTC = 'MQDbDfTKe3SUNGmrKF3DsjSWhwX2BBzJtw'
let DONATION_ADDRESS = '3QgAVe5W8EpRUKk7ucmA2Ra3suYzC4yRE4'
let WITHDRAWAL_FEE = 0.01

/**
 * API Keys
 */

const API_PROVIDER_KEY = "API_PROVIDER";
const API_KEYS_MAP    = "API_KEYS";
const providerSelect = document.getElementById("apiProviderSelect");
const apiKeyWrapper  = document.getElementById("apiKeyWrapper");
const apiInfoText    = document.getElementById("apiInfoText");

(function migrateLegacyApiKey() {
  const legacy = localStorage.getItem("API_KEY");
  if (!legacy) return;

  let keys = {};
  try {
    keys = JSON.parse(localStorage.getItem(API_KEYS_MAP)) || {};
  } catch {
    keys = {};
  }

  if (!keys.blockcypher) {
    keys.blockcypher = legacy;
    localStorage.setItem(API_KEYS_MAP, JSON.stringify(keys));
    localStorage.setItem(API_PROVIDER_KEY, "blockcypher");
  }

  localStorage.removeItem("API_KEY");
})();

function updateApiUI() {
  const provider = providerSelect.value;

  if (provider === "mempool") {
    apiKeyWrapper.classList.add("hidden");
    apiInfoText.innerText =
      "mempool.space is used by default. No API key required.";
  } else {
    apiKeyWrapper.classList.remove("hidden");
    apiInfoText.innerText =
      "BlockCypher is used for BTC/LTC. API key required.";
  }
}

function getApiPayload() {
  const provider = getApiProvider();
  return {
    apiProvider: provider,
    apiKey: provider === "blockcypher" ? getApiKey() : null
  };
}


providerSelect.addEventListener("change", () => {
  localStorage.setItem(API_PROVIDER_KEY, providerSelect.value);

  // restore key when switching
  const input = document.getElementById("apiKeyInput");
  if (providerSelect.value === "blockcypher") {
    input.value = getApiKey("blockcypher") || "";
  } else {
    input.value = "";
  }

  updateApiUI();
});


getUserData()
tabTogglers.forEach(function(toggler) {
    toggler.addEventListener("click", function(e) {
        e.preventDefault();

        importTextTab.classList.add('hidden')
        // Clear import textarea
        importText.value = ""

        //Close add banker message
        closeBankerMessage()

        //Close withdrawal request for sig screen
        closeSendSignatureOnLeave()

        let tabName = this.getAttribute("href");

        openTab = tabName;
        if (tabName === "#first") {
            ipcRenderer.send("balance:api", {
              send: "get",
              apiProvider: getApiProvider(),
              apiKey: getApiProvider() === "blockcypher" ? getApiKey() : null
            });       
            let accountList = document.getElementById('accounts-list')
            let accountDetails = document.getElementById('account-details')
            let accountActions = document.getElementById('account-actions')
            let accountWithdrawal = document.getElementById('account-withdrawal')
            let withdrawalRef = document.getElementById('withdraw-reference')
            // Account Withdrawal screen
            let withdrawAddressInput = document.getElementById('withdraw-address')
            let withdrawAmountInput = document.getElementById('withdraw-amount')
            // Withdrawal reference screen
            let listUnspentRef = document.getElementById('banker-verify-inputs-initial')
            let listOutputRef = document.getElementById('banker-verify-outputs-initial')

            let sendSignatureView = document.getElementById('send-signature')
            let messageWithdrawalSignature = document.getElementById('request-sig-message')

            accountList.classList.remove("hidden")
            accountDetails.classList.add("hidden")
            accountActions.classList.add("hidden")
            accountWithdrawal.classList.add("hidden")
            withdrawalRef.classList.add("hidden")
            sendSignatureView.classList.add("hidden")

            withdrawAddressInput.value = ""
            withdrawAmountInput.value = ""
            withdrawAddressInput.innerHTML = ""
            withdrawAmountInput.innerHTML = ""
            listUnspentRef.innerHTML = ""
            listOutputRef.innerHTML = ""
            messageWithdrawalSignature.innerHTML = ""
        }
        if (tabName === "#addbanker") {
            getBanker()
            getUserData()
        }

        if (tabName === "#second") {
          // Always sync selected currency first
          ACCOUNT_CURRENCY = currency.options[currency.selectedIndex].text;
        
          // Build banker dropdown from already-loaded bankers
          if (Array.isArray(BANKERS)) {
            buildCreateAccountBankerSelect(BANKERS);
          } else {
            // Bankers not loaded yet → fetch them
            getBanker();
          }
        }
        
        let tabContents = document.querySelector("#tab-contents");

        for (let i = 0; i < tabContents.children.length-1; i++) {
          tabTogglers[i].parentElement.classList.remove("bg-gradient-to-l", "from-gray-500");
          tabContents.children[i+1].classList.remove("hidden");
          if ("#" + tabContents.children[i+1].id === tabName) {
              continue;
          }
          tabContents.children[i+1].classList.add("hidden");

        }
        e.target.parentElement.classList.add("bg-gradient-to-l", "from-gray-500");
    });
});



/**
  Refresh button in account list screen
**/
let refreshBtn = document.getElementById("refresh-account-list")
refreshBtn.addEventListener("click", () => {
  ipcRenderer.send("balance:api", {
    send: "get",
    apiProvider: getApiProvider(),
    apiKey: getApiProvider() === "blockcypher" ? getApiKey() : null
  });    
})
/**
  End of Refresh button in account list screen
**/


/**
 * Sanitize inputs by replacing HTML tags with a null string
 */
function removeTagsFromInput(str) {
  if ((str===null) || (str===''))
      return false;
  else
      str = str.toString();
       
  return str.replace( /(<([^>]+)>)/ig, '');
}
/**
 * End of sanitation
 */




function setAccountCurrency() {
  const coinCurrencySend = currency.options[currency.selectedIndex].text;
  ACCOUNT_CURRENCY = coinCurrencySend
  ipcRenderer.send("newaccount:banker:filter", {});
}

/**
  Navigate to Import List screen
**/
function showImportListScreen() {
  importTextTab.classList.add('hidden')
  firstTab.classList.remove('hidden')
  secondTab.classList.add('hidden')
  addBankerTab.classList.add('hidden')
  thirdTab.classList.add('hidden')
  fourthTab.classList.add('hidden')
  fifthTab.classList.add('hidden')

  let tabContents = document.querySelector("#tab-contents");
  for (let i = 0; i < tabContents.children.length-1; i++) {
    if (tabTogglers[i].parentElement) {
      tabTogglers[i].parentElement.classList.remove("bg-gradient-to-l", "from-gray-500");
    }
  }
  let accountListTab = document.getElementById('account-list-tab')

  accountListTab.classList.add("bg-gradient-to-l", "from-gray-500");
}


function loadText(e) {

    const file = e.target.files[0];

    // Check if file is an image
    if (!isFileTxt(file)) {
        alert('Please select a txt file');
        return;
    }
    window.location.href = "mailto:?subject=Test Subject&body=Please do copy and paste on a text file&to=mail@example.org, text@example.org";
}

function isFileTxt(file) {
    const acceptedTextType = ['text/plain'];
    return file && acceptedTextType.includes(file['type']);
  }


function slicePubkey(pubkey) {
  if (pubkey) {
    return pubkey.substring(0, 20) + '...'
  } else {
    return "Pending ..."
  }
}

// ===== API KEY STORAGE (PROVIDER-AWARE) =====
function saveApiKey() {
  const input  = document.getElementById("apiKeyInput");
  const status = document.getElementById("apiKeyStatus");
  const providerSelect = document.getElementById("apiProviderSelect");

  if (!input || !providerSelect) return;

  const apiKey   = input.value.trim();
  const provider = providerSelect.value;

  if (provider === "mempool") {
    alertInfo("mempool.space does not require an API key.");
    return;
  }

  if (!apiKey) {
    alertError("Please enter an API key.");
    return;
  }

  // Load existing keys map
  let keys = {};
  try {
    keys = JSON.parse(localStorage.getItem(API_KEYS_MAP)) || {};
  } catch {
    keys = {};
  }

  // Save key under provider name
  keys[provider] = apiKey;

  // Persist
  localStorage.setItem(API_KEYS_MAP, JSON.stringify(keys));
  localStorage.setItem(API_PROVIDER_KEY, provider);

  if (status) {
    status.classList.remove("hidden");
    status.innerText = `API key saved for ${provider}.`;
  }
}


function getApiProvider() {
  return localStorage.getItem(API_PROVIDER_KEY) || "mempool";
}

function getApiKey(providerOverride = null) {
  const provider = providerOverride || getApiProvider();

  let keys = {};
  try {
    keys = JSON.parse(localStorage.getItem(API_KEYS_MAP)) || {};
  } catch {
    keys = {};
  }

  return keys[provider] || null;
}

// ==========================



/**
  New account creation
**/
async function saveAndCreateText(e) {
    e.preventDefault();
    const contractSendName = removeTagsFromInput(contractName.value);
    const creatorSendName = USER.user_name;
    const creatorSendEmail = USER.user_email;

    const sigSendNumber = sigNumber.options[sigNumber.selectedIndex].text;
    const coinCurrencySend = currency.options[currency.selectedIndex].text;
    const innerMultiKey = document.querySelectorAll('.activeClass a')

    /**
      New account data validation
    **/
    if (contractSendName == "") return alertError("Contract name is required.")
    if (contractSendName.length > 75) return alertError("Contract name should not be more than 75 characters.")
    if (innerMultiKey.length == 0) return alertError("Please select a banker")
    if (innerMultiKey.length < parseInt(sigSendNumber)) return alertError("Number of required signature should not be more than the number of bankers.")

    let bankersMerge = [];
    for (let i = 0; i < innerMultiKey.length; i++) {
        bankersMerge.push(innerMultiKey[i].dataset.value)
    }

    let coin_js

    if (coinCurrencySend === "bitcoin") {
      coin_js = bitcoinjs
    } else if (coinCurrencySend === "litecoin") {
      coin_js = litecoinjs
    } else if (coinCurrencySend === "woodcoin") {
      coin_js = coinjs
    } else {
      console.log("invalid currency")
    }

    coin_js.compressed = true
    const creatorAddressDetail = await coin_js.newKeys()

    const keys = bankersMerge;
    const multisig =  coin_js.pubkeys2MultisigAddress(keys, sigSendNumber);

    const pubkeySend = multisig.address;
    const redeemScriptSend = multisig.redeemScript;

    ipcRenderer.send("message:contractnew", {
        contractSendName,
        creatorSendName,
        creatorSendEmail,
        bankersMerge,
        sigSendNumber,
        coinCurrencySend,
        creatorAddressDetail,
        pubkeySend,
        redeemScriptSend
    });
}

ipcRenderer.on("send:newAccountSuccess", function() {
  contractName.value = ""
  alertSuccess("Account successfully created.")
  showImportListScreen()
})

ipcRenderer.on("new-account-error:existing", function() {
  contractName.value = ""
  alertError("Account creation failed. Generated address and redeem script are already used.")
  showImportListScreen()
})

ipcRenderer.on("list:file", function(e, evt){
    const convertToJson = JSON.parse(evt)
    const accountBody = document.getElementById('accounts-list-body')
    let coinInitial;

    accountBody.innerHTML = ""
    for(let x in convertToJson) {
        if(convertToJson.hasOwnProperty(x)){
            if (convertToJson[x].currency === 'woodcoin') {
              coinInitial = 'LOG'
            } else if (convertToJson[x].currency === 'bitcoin') {
              coinInitial = 'BTC'
            } else {
              coinInitial = 'LTC'
            }
            let row = accountBody.insertRow();
            let name = row.insertCell(0);
            name.setAttribute('class', 'pl-6')
            name.innerHTML = convertToJson[x].contract_name
            let address = row.insertCell(1);
            address.innerHTML = coinInitial + ':' + convertToJson[x].address
            let balance = row.insertCell(2);
            let rawBalance = convertToJson[x].balance;
            balance.setAttribute('class', 'pl-4')
            if (convertToJson[x].currency === 'bitcoin' || convertToJson[x].currency === 'litecoin') {
              balance.innerHTML = (rawBalance / 100000000).toFixed(8);
            } else {
              balance.innerHTML = rawBalance;
            }
            let veiwall = row.insertCell(3)
            veiwall.setAttribute('class', 'text-center')
            let viewAccountDetailsButton = document.createElement('button')
            viewAccountDetailsButton.setAttribute('class', "px-5 py-0.5 font-small text-white bg-orange-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-orange-500 hover:bg-orange-500 rounded-full")
            viewAccountDetailsButton.innerHTML = "view"
            veiwall.appendChild(viewAccountDetailsButton)

            let details = convertToJson[x]
            viewAccountDetailsButton.addEventListener("click", function() {getAccountDetails(details);}, false);

        }
    }
})


/**
  Account Actions Screen
  List request for signatures status
**/

function addNewlines(str) {
  var result = '';
  while (str.length > 0) {
    result += str.substring(0, 75) + '\n';
    str = str.substring(75);
  }
  return result;
}

function showTxId(txid) {
  let message = "Transaction ID: " + txid
  let messageLineBreaks = addNewlines(message)
  alert(messageLineBreaks)
}

function listAccountActions(actions, signatureNeeded){
  let accountDetails = document.getElementById('account-details')
  let accountWithdrawal = document.getElementById('account-withdrawal')
  let accountActions = document.getElementById('account-actions')
  accountDetails.classList.add("hidden")
  accountWithdrawal.classList.add("hidden")
  accountActions.classList.remove("hidden")

  let tableBody = document.getElementById('actions-list-body')
  tableBody.innerHTML = ''

  /**
    Check if the withdrawal is ready for broadcasting
  **/
  for (const [index, withdrawal] of actions.entries()){
    for(let x in withdrawal.signatures) {
      if(withdrawal.signatures.hasOwnProperty(x)){
        let row = tableBody.insertRow();
        let id = row.insertCell(0);
        id.innerHTML = withdrawal.id
        let date = row.insertCell(1);
        let dateReq
        if (withdrawal.signatures[x].date_signed) {
          dateReq = new Date(withdrawal.signatures[x].date_signed);
        } else {
          dateReq = new Date(withdrawal.signatures[x].date_requested);
        }

        dateFormat = dateReq.toDateString()
        date.innerHTML = dateFormat
        let banker = row.insertCell(2);
        banker.innerHTML = withdrawal.signatures[x].banker_name
        let action = row.insertCell(3);
        action.innerHTML = withdrawal.signatures[x].action
        let txid = row.insertCell(4);
        if (withdrawal.signatures[x].transaction_id) {
          let id = 'view-txid-btn-' + String(withdrawal.id) + String(withdrawal.signatures[x].banker_id)
          let viewBtn = "<button class='ml-4 disabled:opacity-75 bg-blue-500 active:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline' id='"+id+"'>View</button>"
          txid.innerHTML = viewBtn
          let viewTxidBtn = document.getElementById(id)
          viewTxidBtn.addEventListener('click', () => {
            showTxId(withdrawal.signatures[x].transaction_id)
          })
        } else {
          txid.innerHTML = ""
        }
        let status = row.insertCell(5);
        status.innerHTML = withdrawal.signatures[x].status
      }
    }

    if(withdrawal.hasOwnProperty('txid')){

      let row = tableBody.insertRow();
      let id = row.insertCell(0);
      id.innerHTML = withdrawal.id
      let date = row.insertCell(1);
      let date_broadcasted = new Date(withdrawal.date_broadcasted)
      dateFormat = date_broadcasted.toDateString()
      date.innerHTML = dateFormat
      let banker = row.insertCell(2);
      banker.innerHTML = "Owner"
      let action = row.insertCell(3);
      action.innerHTML = "Withdrawal broadcasted"
      let txid = row.insertCell(4);
      let viewBtn = "<button class='ml-4 disabled:opacity-75 bg-blue-500 active:bg-blue-700 text-white font-semibold hover:text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline' id='view-txid-btn'>View</button>"
      txid.innerHTML = viewBtn
      let viewTxidBtn = document.getElementById('view-txid-btn')
      viewTxidBtn.addEventListener('click', () => showTxId(withdrawal.txid))
      let status = row.insertCell(5);
      status.innerHTML = "Success"
    }
  }
}

let actionsBackBtn = document.getElementById('account-actions-back-btn')
actionsBackBtn.addEventListener('click', listAccountActionsBack)

function listAccountActionsBack(){
  let accountDetails = document.getElementById('account-details')
  let accountWithdrawal = document.getElementById('account-withdrawal')
  let accountActions = document.getElementById('account-actions')
  accountDetails.classList.remove("hidden")
  accountWithdrawal.classList.add("hidden")
  accountActions.classList.add("hidden")
}
/**
  End of Account Actions
**/


function outputsAddress(e) {
  console.log(e)

}

/**
  Owner view - Account withdrawal
**/
function accountWithdrawalFunc(address){
  CHANGE_ADDRESS = address.address

  let coin_js
  if (address.currency === "bitcoin") {
    coin_js = bitcoinjs
  } else if (address.currency === "litecoin") {
    coin_js = litecoinjs
  } else if (address.currency === "woodcoin") {
    coin_js = coinjs
  } else {
    console.log("invalid currency")
  }
  

  const script = coin_js.script()
  const addressScript = script.decodeRedeemScript(address.redeemscript)

  let accountDetails = document.getElementById('account-details')
  let accountWithdrawal = document.getElementById('account-withdrawal')
  let accountActions = document.getElementById('account-actions')
  let unspentdiv = document.getElementById('list-unspent')

  // Clear unspent list
  unspentdiv.innerHTML = ""
  unspentAmountTotal = 0
  userInputAmountTotal = 0
  TOTAL_AMOUNT_TO_WITHDRAW = 0

  let tx = coin_js.transaction();
  accountDetails.classList.add("hidden")
  accountWithdrawal.classList.remove("hidden")
  accountActions.classList.add("hidden")

  ipcRenderer.removeAllListeners('unspent:address');

  ipcRenderer.once('unspent:address', (e, evt) => {
    const listP = evt.utxo;

    unspentAmountTotal = 0;
    unspentdiv.innerHTML = '';

    for (let i = 0; i < listP.length; i++) {
      const isWoodcoin = evt.currency === 'woodcoin';

      const amount = isWoodcoin
        ? listP[i].amount / 1e8
        : listP[i].value / 1e8;

      const txid = isWoodcoin ? listP[i].txid : listP[i].tx_hash;
      const vout = isWoodcoin ? listP[i].vout : listP[i].output_no;

      unspentAmountTotal += amount;

      const row = document.createElement('div');
      row.className = 'grid md:grid-cols-4 gap-3';
      row.classList.add('inner-unspent');


      const txInput = document.createElement('input');
      txInput.readOnly = true;
      txInput.className = 'col-span-2 text-black p-1';
      txInput.value = txid;

      const amtInput = document.createElement('input');
      amtInput.readOnly = true;
      amtInput.className = 'text-black p-1';
      amtInput.value = amount.toFixed(8);

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = true;

      check.addEventListener('change', () => {
        const withdrawAmt = getTotalWithdrawalAmt();

        unspentAmountTotal += check.checked
          ? amount
          : -amount;

        withdrawalFee.value =
          (unspentAmountTotal - withdrawAmt).toFixed(8);
      });

      const voutInput = document.createElement('input');
      voutInput.type = 'hidden';
      voutInput.className = 'vout-withdraw';
      voutInput.value = String(vout); // output_no

      const scriptInput = document.createElement('input');
      scriptInput.type = 'hidden';
      scriptInput.className = 'script-withdraw';
      scriptInput.value = evt.currency === 'woodcoin'
        ? (listP[i].scriptpubKey || '')
        : (listP[i].script_hex || '');

      const redeemInput = document.createElement('input');
      redeemInput.type = 'hidden';
      redeemInput.className = 'redeem-withdraw';
      redeemInput.value = address.redeemscript || '';

      row.append(txInput, voutInput, scriptInput, amtInput, redeemInput, check);
      unspentdiv.appendChild(row);
    }

    withdrawalFee.value = unspentAmountTotal.toFixed(8);
  });

  ipcRenderer.send("unspent:api", {
    address: address.address,
    currency: address.currency,
    ...getApiPayload()
  });  
}

function getTotalWithdrawalAmt() {
  const getuserinput = document.querySelectorAll('#address-keys')
  let totalOutput = 0

  for (let i = 0; i < getuserinput.length; i++) {
    let amount = getuserinput[i].children[1].value
    totalOutput += Number(amount)
  }
  return totalOutput
}

function amountOnInput(amount) {
  if (!isNaN(amount)) {
    const getuserinput = document.querySelectorAll('#address-keys')
    let totalOutput = 0

    for (let i = 0; i < getuserinput.length; i++) {
      let amount = getuserinput[i].children[1].value
      totalOutput += Number(amount)
    }

    TOTAL_AMOUNT_TO_WITHDRAW = totalOutput
    withdrawalFee.value = (unspentAmountTotal - TOTAL_AMOUNT_TO_WITHDRAW).toFixed(8)
  }
}

function amountOnchange(amount) {
  const getuserinput = document.querySelectorAll('#address-keys')
  let totalOutput = 0

  for (let i = 0; i < getuserinput.length; i++) {
    let amount = getuserinput[i].children[1].value
    totalOutput += Number(amount)
  }

  //TOTAL_AMOUNT_TO_WITHDRAW += Number(amount)
  TOTAL_AMOUNT_TO_WITHDRAW = totalOutput
  withdrawalFee.value = (unspentAmountTotal - TOTAL_AMOUNT_TO_WITHDRAW).toFixed(8)
}

function amountOnchangeSubtract(amount) {

  TOTAL_AMOUNT_TO_WITHDRAW -= Number(amount)
  withdrawalFee.value = (unspentAmountTotal - TOTAL_AMOUNT_TO_WITHDRAW).toFixed(8)
}

let withdrawAmountInput = document.getElementById('withdraw-amount')
withdrawAmountInput.addEventListener('input', () => {amountOnInput(withdrawAmountInput.value)})
withdrawAmountInput.addEventListener('change', () => {amountOnchange(withdrawAmountInput.value)})

function getAccountDetails(account){
  CURRENT_ACCOUNT = account;
  ACCOUNT_CURRENCY = account.currency
  if (account.hasOwnProperty('id')) {
    let accountList = document.getElementById('accounts-list')
    let accountDetails = document.getElementById('account-details')

    accountList.classList.add("hidden")
    accountDetails.classList.remove("hidden")

    //accountDetails.innerHTML = ""
    let accountName = document.getElementById('account-name')
    let accountEmail = document.getElementById('account-email')
    let accountBalance = document.getElementById('account-balance')
    let accountAddress = document.getElementById('account-address')
    let accountRedeemScript = document.getElementById('account-redeem-script')
    let accountCurrency = document.getElementById('account-currency')
    let accountSignatures = document.getElementById('account-signatures')

    accountName.innerHTML = account.contract_name
    accountEmail.innerHTML = account.creator_email
    accountBalance.innerHTML = account.balance
    accountAddress.innerHTML = account.address
    accountRedeemScript.innerHTML = account.redeem_script
    accountCurrency.innerHTML = account.currency
    accountSignatures.innerHTML = account.signature_nedded


    let tableBody = document.getElementById('account-bankers-list')
    tableBody.innerHTML = ''
    let bankers = account.bankers
    for(let x in bankers) {
      if(bankers.hasOwnProperty(x)){
        let pubkey = slicePubkey(bankers[x].pubkey)
        let row = tableBody.insertRow();
        let name = row.insertCell(0);
        name.innerHTML = bankers[x].banker_name
        let email = row.insertCell(1);
        email.innerHTML = bankers[x].banker_email
        let publicKey = row.insertCell(2);
        publicKey.innerHTML = pubkey
      }
    }

    // Generate action and withdrawal buttons
    let buttonContainer = document.getElementById('account-buttons')
    buttonContainer.innerHTML = ''

    let viewActionsButton = document.createElement('button')
    viewActionsButton.classList.add("inline-flex", "items-center", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "text-white", "bg-orange-500", "rounded-full", "focus:ring-4", "focus:ring-yellow-200", "dark:focus:ring-yellow-900", "hover:bg-yellow-800")
    viewActionsButton.innerHTML = "Actions"
    let actions = account.withdrawals
    let signaturesNeeded = account.signature_nedded
    viewActionsButton.addEventListener("click", function() {listAccountActions(actions, signaturesNeeded);}, false);

    /**
      Disable withdrawal button when account balance is zero(0)
    **/
    let withdrawalButton = document.createElement('button')
    withdrawalButton.innerHTML = "Withdrawal"
    // if (account.balance > 0) {
    //   withdrawalButton.classList.add("inline-flex", "items-center", "m-2", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "text-white", "bg-orange-500", "rounded-full", "focus:ring-4", "focus:ring-yellow-200", "dark:focus:ring-yellow-900", "hover:bg-yellow-800")
    //   withdrawalButton.disabled = false;
    // } else {
    //   withdrawalButton.classList.add("inline-flex", "items-center", "m-2", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "text-white", "bg-orange-500", "rounded-full", "cursor-not-allowed")
    //   withdrawalButton.disabled = true;
    // }

    withdrawalButton.classList.add("inline-flex", "items-center", "m-2", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "text-white", "bg-orange-500", "rounded-full", "focus:ring-4", "focus:ring-yellow-200", "dark:focus:ring-yellow-900", "hover:bg-yellow-800")
    //   withdrawalButton.disabled = false;
    let address = {
        "address": account.address,
        "redeemscript": account.redeem_script,
        "currency": account.currency
    }
    withdrawalButton.addEventListener("click", function() {
      setDonationAddress(account.currency)
      accountWithdrawalFunc(address);
    }, false);


    buttonContainer.appendChild(viewActionsButton)
    buttonContainer.appendChild(withdrawalButton)

  }
}


function setDonationAddress(currency) {
  const DONATION_MAP = {
    bitcoin: DONATION_BTC,
    litecoin: DONATION_LTC,
    woodcoin: DONATION_LOG,
  };
  
  DONATION_ADDRESS = DONATION_MAP[currency];
  
  if (!DONATION_ADDRESS) {
    console.log("invalid currency");
  }    
}

function addDonationAddress() {
  const addressInput = document.getElementById('withdraw-address')
  if (addressInput.value) {
    addOrDelete('donation-address')
  } else {
    addressInput.value = DONATION_ADDRESS
  }
}

function addOrDelete(id) {
    console.log("click add or delete")
    const mainKey = document.getElementById('address-amount')

    let div = document.createElement('div');
    div.setAttribute("class", "grid md:grid-cols-4 gap-2");
    div.setAttribute('id', 'address-keys')

    let input1 = document.createElement('input')
    input1.setAttribute('class', 'text-base text-black font-normal h-10 col-span-2 mt-2')
    input1.setAttribute('placeholder', 'Enter Address')
    input1.setAttribute('required', '')
    let input2 = document.createElement('input')
    // input2.addEventListener('onchange', ()=> {console.log("amount: ", input2.value)})
    input2.setAttribute('class', 'text-base text-black font-normal h-10 col-span-1 mt-2 user-input-amount')
    input2.setAttribute('placeholder', 'Enter Amount')
    input2.setAttribute('required', '')

    /**
      Add event listener to the amount input
    **/
    input2.addEventListener('input', () => {amountOnInput(input2.value)})
    input2.addEventListener('change', () => {amountOnchange(input2.value)})

    if (id == "donation-address") {
        input1.value = DONATION_ADDRESS
    }

    let anchor = document.createElement('a')
    anchor.setAttribute('class', 'red pubkeyRemove cursor-pointer')
    //let minus = document.createElement('object')
    let minus = document.createElement('img')
    minus.setAttribute('src', './images/minus.svg')
    minus.setAttribute('width', '50')
    minus.setAttribute('height', '50')
    minus.setAttribute('class', 'red pubkeyRemove')



    div.appendChild(input1)
    div.appendChild(input2)
    div.appendChild(minus)
    mainKey.appendChild(div)

    minus.addEventListener('click', (e) => {
      console.log('minus click')
      deleteInput(e)
      if (input2.value) amountOnchangeSubtract(input2.value)
    })
}

function deleteInput(e) {
    const removeEl = e.target.parentNode;
    const remove = e.target.classList.contains('pubkeyRemove')
    if (!remove) return;

    document.getElementById('address-amount').removeChild(removeEl);
}

function addBanker(e) {
    e.preventDefault()
    const nameInput = document.getElementById('banker-name-add')
    const emailInput = document.getElementById('banker-email-add')

    // Get value of selected currency
    var selectElement = document.getElementById('banker-coin-currency');
    var bankerCurrency = selectElement.options[selectElement.selectedIndex].text;

    const bankerName = removeTagsFromInput(nameInput.value)
    const bankerEmail = emailInput.value

    /**
      Add banker form validation
    **/
    if (bankerName == "" || bankerEmail == "") {
      alertError("Banker User name and email is required.")
      return
    }
    if (bankerName.length > 75) return alertError("Banker name should not be more than 75 characters.")
    if (bankerEmail) {
      let validEmail = isEmailValid(bankerEmail)
      if (!validEmail) {
        alertError("Please enter a valid email")
        return
      }
    }
    /**
      Check the banker to be add is already in the bankers,json
    **/
    if (BANKERS) {
      for(let x in BANKERS) {
          if(BANKERS.hasOwnProperty(x)){
              if (BANKERS[x].banker_name == bankerName && BANKERS[x].banker_email == bankerEmail && BANKERS[x].currency == bankerCurrency) {
                alertError("You are trying to add a banker that is already in the list.")
                return
              }
          }
      }
    }

    ipcRenderer.send('message:addBanker', {
        bankerName,
        bankerEmail,
        bankerCurrency
    })
    nameInput.value = ''
    emailInput.value = ''
}

function getBanker() {
    ipcRenderer.send('click:addBanker', {})
}

function getUserData() {
  ipcRenderer.send('get:user', {})
}

ipcRenderer.on('response:user', function(e, evt){
  if (evt) {
    USER = evt
  }
})


ipcRenderer.on('send:newBanker', function(e, evt) {

    bankerForm.classList.add('hidden')
    bankersList.classList.add('hidden')
    bankerMessage.classList.remove('hidden')


    let buttonDiv = document.getElementById('banker-message-close-button')
    const div = document.createElement('div')
    div.setAttribute('class', 'bg-white p-3 rounded-md text-black')
    const p = document.createElement('p')
    const br = document.createElement('br')
    const p1 = document.createElement('p')
    const p2 = document.createElement('p')
    const p3 = document.createElement('p')
    const p4 = document.createElement('pre')
    const p5 = document.createElement('p')

    let userName = USER.user_name
    let message = {
      "header": "free_state_central_bank",
      "message": "request-pubkey",
      "creator_name": USER.user_name,
      "creator_email": USER.user_email,
      "banker_id": evt.banker_id,
      "banker_name": evt.banker_name,
      "banker_email": evt.banker_email,
      "currency": evt.currency
    }


    bankerMessage.innerHTML = ''
    p.innerHTML = "Please copy the line below and send it to " + message.banker_email;
    p1.innerHTML = USER.user_name + " is requesting for you to become a banker.";
    p2.innerHTML = "Please copy the message inside and import in FSCB";
    p3.innerHTML = "-----Begin fscb message-----";
    p4.innerHTML = JSON.stringify(message, undefined, 2);
    p5.innerHTML = "-----End fscb message-----";


    const copyToClipboardText = p1.innerHTML + '\n' + p2.innerHTML + '\n' + p3.innerHTML + '\n' + p4.innerHTML  + '\n' +  p5.innerHTML
    let copyButtonContainer = document.createElement('div')
    copyButtonContainer.setAttribute('class', 'flex justify-end')
    let copyButton = document.createElement('img')
    copyButton.setAttribute('src', './images/copy_button.png')
    copyButton.setAttribute('class', 'px-2 cursor-pointer hover:scale-125 transition duration-500')
    copyButton.addEventListener("click", function() {
      ipcRenderer.send('message:copy', copyToClipboardText)
      alertSuccess("Message successfully copied in clipboard.")
    }, false);

    copyButtonContainer.appendChild(copyButton)
    div.appendChild(copyButtonContainer)
    div.appendChild(p)
    div.appendChild(br)
    div.appendChild(p1)
    div.appendChild(p2)
    div.appendChild(p3)
    div.appendChild(p4)
    div.appendChild(p5)

    bankerMessage.appendChild(div)


    let closeButton = document.createElement('button')
    closeButton.classList.add("inline-flex", "items-center", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "absolute", "right-5", "mt-5", "text-white", "bg-orange-500", "rounded-lg", "focus:ring-4", "focus:ring-blue-200", "dark:focus:ring-orange-500", "hover:bg-orange-500")
    closeButton.innerHTML = "Close"
    closeButton.addEventListener("click", function() {
      closeBankerMessage()
    }, false);

    buttonDiv.appendChild(closeButton)
    bankerMessage.appendChild(buttonDiv)
})

function closeBankerMessage() {
  bankerForm.classList.remove('hidden')
  bankersList.classList.remove('hidden')
  bankerMessage.classList.add('hidden')
}


ipcRenderer.on('send:bankers', function(e, evt) {
    bankersArray = evt
    BANKERS = evt
    //
    // Start of Banker's table
    //
    const bankersBody = document.getElementById('bankers-list-body')

    bankersBody.innerHTML = ""
    for(let x in bankersArray) {
        if(bankersArray.hasOwnProperty(x)){
            let pubkey = slicePubkey(bankersArray[x].pubkey)
            let row = bankersBody.insertRow();
            let name = row.insertCell(0);
            name.innerHTML = bankersArray[x].banker_name
            let email = row.insertCell(1);
            email.innerHTML = bankersArray[x].banker_email
            let pubKey = row.insertCell(2);
            pubKey.innerHTML = pubkey
            let currency = row.insertCell(3)
            currency.innerHTML = bankersArray[x].currency
        }
    }
    //
    // End of Banker's table
    //


    // select multiple
    // if (openTab === "#second") {
    //   openTab = "#second";

    //   if (Array.isArray(BANKERS)) {
    //     buildCreateAccountBankerSelect(BANKERS);
    //   } else {
    //     getBanker(); // fallback if not loaded yet
    //   }
    // }

    if (openTab === "#second") {
      buildCreateAccountBankerSelect(BANKERS);
    }

})

function buildCreateAccountBankerSelect(bankersArray) {
  const selectDiv = document.getElementById('banker-select')
      selectDiv.innerHTML = ''


      var select =  document.createElement("select");
      select.classList.add('hidden')
      select.setAttribute('multiple', '');
      select.dataset.placeholder = 'Choose Bankers'

      // Add the select component to the select container
      selectDiv.appendChild(select)

      // Get the selected value for contract currency
      // And filter bankers array with the value
      select.options.length = 0
      for(const key in bankersArray) {
        if(bankersArray[key].pubkey && bankersArray[key].currency === ACCOUNT_CURRENCY){
          const opt = bankersArray[key].banker_email;
          const pub = bankersArray[key].pubkey;
          const el = document.createElement("option");
          el.textContent = opt;
          el.value = pub;
          el.setAttribute('class', 'hidden')
          select.appendChild(el);
        }
      }

      const selectOptions = select.querySelectorAll('option');
      const newSelect = document.createElement('div');
      newSelect.setAttribute('class', 'selectMultiple bg-white w-60 relative')
      const active = document.createElement('div');

      active.setAttribute('class', 'activeClass')
      const optionList = document.createElement('ul');
      optionList.setAttribute('class', 'optionListClass')

      const placeholder = select.dataset.placeholder;

      const span = document.createElement('span');
      span.setAttribute('class', 'spanClass')

      span.innerText = placeholder;
      active.appendChild(span);

      selectOptions.forEach((option) => {
          let text = option.innerText;
          if(option.selected){
              let tag = document.createElement('a');
              tag.setAttribute('class', 'relative pt-0 pr-5 pb-5 pl-0')
              tag.dataset.value = option.value;
              tag.innerHTML = "<em class='emClass'>"+text+"</em><i class='iClass'></i>";
              active.appendChild(tag);
              span.classList.add('opacity-0 invicible -translate-x-4');
          }else{
              let item = document.createElement('li');
              item.setAttribute('class', 'itemClass')
              item.dataset.value = option.value;
              item.innerHTML = text;
              optionList.appendChild(item);
          }
      });
      const arrow = document.createElement('div');
      arrow.classList.add('arrow');
      active.appendChild(arrow);

      newSelect.appendChild(active);
      newSelect.appendChild(optionList);

      select.parentElement.append(newSelect);
      span.appendChild(select);


      document.querySelector('.selectMultiple ul').addEventListener('click', (e) => {
          let li = e.target.closest('li');
          if(!li){return;}
          let select = li.closest('.selectMultiple');

          // add a checker, banker selected should not exceed to 14 bankers
          let selectedB = document.querySelectorAll('.activeClass a')
          if(!select.classList.contains('clicked') && selectedB.length < 14){

              select.classList.add('clicked');
              if(li.previousElementSibling){
                  li.previousElementSibling.classList.add('beforeRemove');
              }
              if(li.nextElementSibling){
                  li.nextElementSibling.classList.add('afterRemove');
              }
              li.classList.add('remove');
              let a = document.createElement('a');
              a.setAttribute('class', 'relative pt-0 pr-5 pb-5 pl-0')
              a.dataset.value = li.dataset.value;
              a.innerHTML = "<em class='emClass'>"+li.innerText+"</em><i class='iClass'></i>";
              a.classList.add('notShown');

              select.querySelector('div').appendChild(a); //might have to check later
              let selectEl = select.querySelector('select');
              let opt = selectEl.querySelector('option[value="'+li.dataset.value+'"]');
              opt.setAttribute('selected', 'selected');
              setTimeout(() => {
                  a.classList.add('shown');
                  select.querySelector('span').classList.add('hide');

              }, 300);
              //1st
              setTimeout(() => {
                  let styles = window.getComputedStyle(li);
                      let liHeight = styles.height;
                      let liPadding = styles.padding;
                      let removing = li.animate([
                          {
                              height: liHeight,
                              padding: liPadding
                          },
                          {
                              height: '0px',
                              padding: '0px'
                          }
                      ], {
                          duration: 300, easing: 'ease-in-out'
                      });
                      removing.onfinish = () => {
                          if(li.previousElementSibling){
                              li.previousElementSibling.classList.remove('beforeRemove');
                          }
                          if(li.nextElementSibling){
                              li.nextElementSibling.classList.remove('afterRemove');
                          }
                          li.remove();
                          select.classList.remove('clicked');
                      }
              }, 300); //600
                  //2nd
          } else {
            alertError("Maximum number of bankers in an account is 14.")
          }
      });
      //2

      document.querySelector('.selectMultiple > div').addEventListener('click', (e) => {
          let a = e.target.closest('a');
          let select = e.target.closest('.selectMultiple');
          if(!a){return;}
          a.className = '';
          a.classList.add('remove');
          select.classList.add('open');
          let selectEl = select.querySelector('select');
          let opt = selectEl.querySelector('option[value="'+a.dataset.value+'"]');
          opt.removeAttribute('selected');
          //setTimeout(() => {
              a.classList.add('disappear');
              setTimeout(() => {
                  // start animation
                  let styles = window.getComputedStyle(a);
                  let padding = styles.padding;
                  let deltaWidth = styles.width;
                  let deltaHeight = styles.height;

                  let removeOption = a.animate([
                      {
                          width: deltaWidth,
                          height: deltaHeight,
                          padding: padding
                      },
                      {
                          width: '0px',
                          height: '0px',
                          padding: '0px'
                      }
                  ], {
                      duration: 0,
                      easing: 'ease-in-out'
                  });

                  let li = document.createElement('li');
                  li.dataset.value = a.dataset.value;
                  li.innerText = a.querySelector('em').innerText;
                  li.classList.add('show');
                  select.querySelector('ul').appendChild(li);
                  setTimeout(() => {
                      if(!selectEl.selectedOptions.length){
                          select.querySelector('span').classList.remove('hide');
                      }
                      li.className = 'itemClass';
                  }, 350);

                  removeOption.onfinish = () => {
                      a.remove();
                  }
                  //end animation

              }, 300);
          //}, 400);
      });
      //});
      //3
      document.querySelectorAll('.selectMultiple > div .arrow, .selectMultiple > div span').forEach((el) => {
          el.addEventListener('click', (e) => {
              el.closest('.selectMultiple').classList.toggle('open');
          });
      });
}


function parseTextArea(e) {
    e.preventDefault();
    const textarea = document.getElementById('import-text-area');
    const jsonString = removeTagsFromInput(textarea.value);
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1) {
        let jsonStr = jsonString.substring(startIndex, endIndex + 1);
        jsonStr = jsonStr.replace(/\s/g, " ")
        ipcRenderer.send("banker:addorsig", jsonStr)
    } else {
      invalidJSONerror()
    }
}

function invalidJSONerror() {
  alertError("Invalid FSCB JSON message. Please copy the message sent to your email.")
}

ipcRenderer.on('import-text:invalid', () => {
  invalidJSONerror()
})

/**
  Banker Function (Withdrawal - request for signature)
  Sign the txid from account owner
**/
ipcRenderer.on('request:banker-signature', (e, message) => {

  importArea.classList.add('hidden')
  bankerVerifyWithdrawal.classList.remove('hidden')

  let inputsTable = document.getElementById('banker-verify-inputs')
  let outputsTable = document.getElementById('banker-verify-outputs')

  let coin_js
  const COIN_MAP = {
    bitcoin: bitcoinjs,
    litecoin: litecoinjs,
    woodcoin: coinjs
  };
  
  coin_js = COIN_MAP[message.currency];
  
  if (!coin_js) {
    console.log("invalid currency");
  }
  

  const tx = coin_js.transaction()
  const deserializeTx = tx.deserialize(message.transaction_id_for_signature)

  let inputs = deserializeTx.ins
  let outputs = deserializeTx.outs

  for (let i = 0; i < inputs.length; i++) {
    var s = deserializeTx.extractScriptKey(i);
    let input = inputs[i]
    let inputs1 = document.createElement('input')
    inputs1.setAttribute('readonly', true)
    inputs1.setAttribute('class', 'md:flex px-3 bg-gray-300 text-black h-10 left-96 py-2 w-96');
    inputs1.value = input.outpoint.hash
    let row = inputsTable.insertRow();
    let txid = row.insertCell(0);
    txid.appendChild(inputs1)
    txid.setAttribute('width', '45%')
    let inputs2 = document.createElement('input')
    inputs2.setAttribute('readonly', true)
    inputs2.setAttribute('class', 'text-black text-center');
    inputs2.value = input.outpoint.index
    let indexNo = row.insertCell(1);
    indexNo.setAttribute('class', 'text-center bg-white text-black font-semibold')
    indexNo.innerHTML = input.outpoint.index
    indexNo.setAttribute('width', '10%')
    let inputs3 = document.createElement('input')
    inputs3.setAttribute('readonly', true)
    inputs3.setAttribute('class', 'md:flex bg-gray-300 pl-1 h-10 text-black px-3 py-2 w-full');
    inputs3.value = s.script
    let script = row.insertCell(2);
    script.appendChild(inputs3)
    script.setAttribute('width', '45%')
  }

  for (let i = 0; i < outputs.length; i++) {

    let output = outputs[i]
    if(output.script.chunks.length==2 && output.script.chunks[0]==106){ // OP_RETURN

      var data = Crypto.util.bytesToHex(output.script.chunks[1]);
      var dataascii = hex2ascii(data);

      if(dataascii.match(/^[\s\d\w]+$/ig)){
        data = dataascii;
      }
      let row = outputsTable.insertRow();
      let address = row.insertCell(0);
      address.innerHTML = data
      address.setAttribute('width', '45%')
      let amount = row.insertCell(1);
      amount.innerHTML = (output.value/100000000).toFixed(8)
      amount.setAttribute('width', '10%')
      let script = row.insertCell(2);
      script.innerHTML = Crypto.util.bytesToHex(output.script.buffer)
      script.setAttribute('width', '45%')
    } else {

      var addr = '';
      if(output.script.chunks.length==5){
        addr = coin_js.scripthash2address(Crypto.util.bytesToHex(output.script.chunks[2]));
      } else if((output.script.chunks.length==2) && output.script.chunks[0]==0){
        addr = coin_js.bech32_encode(coin_js.bech32.hrp, [coin_js.bech32.version].concat(coin_js.bech32_convert(output.script.chunks[1], 8, 5, true)));
      } else {
        var pub = coin_js.pub;
        coin_js.pub = coin_js.multisig;
        addr = coin_js.scripthash2address(Crypto.util.bytesToHex(output.script.chunks[1]));
        coinjs.pub = pub;
      }

      let row = outputsTable.insertRow();
      let address = row.insertCell(0);
      address.setAttribute('width', '45%')
      address.innerHTML = addr
      let amount = row.insertCell(1);
      amount.innerHTML = (output.value/100000000).toFixed(8)
      amount.setAttribute('width', '10%')
      let script = row.insertCell(2);
      script.innerHTML = Crypto.util.bytesToHex(output.script.buffer)
      script.setAttribute('width', '45%')
    }
  }

  let signButton = document.getElementById("banker-sign-button")
    signButton.onclick = null;
    signButton.onclick = () => {

    let pk = document.getElementById('banker-pivkey-for-signature')
    let privkey = removeTagsFromInput(pk.value)
    if (privkey) {
        if (isWifKeyValid(privkey)) {
        bankerSignTransaction(message, privkey)
        } else {
          alertError('The text you entered is not a valid private key.')
        }
    } else {
      alertError('Please enter your private key for this account.')
    }

  }
})

function bankerSignTransaction(message, privkey) {

  let tx
  if (message.currency === "bitcoin") {
    tx = bitcoinjs.transaction()
  } else if (message.currency === "litecoin") {
    tx = litecoinjs.transaction()
  } else if (message.currency === "woodcoin") {
    tx = coinjs.transaction()
  } else {
    console.log("invalid currency")
  }


  const scriptToSign = tx.deserialize(message.transaction_id_for_signature)
  const signedTX = scriptToSign.sign(privkey, 1)

  bankerVerifyWithdrawal.classList.add('hidden')
  bankerMessageSignTx.classList.remove('hidden')

  let bankerMessageSignTxBody = document.getElementById('banker-message-signtx-body')
  let signResponseTitle = document.getElementById('sign-response-title')
  let buttonDiv = document.getElementById('banker-message-signtx-close-button')
  const div = document.createElement('div')
  div.setAttribute('class', 'bg-white p-3 rounded-md text-black')

  const p1 = document.createElement('p')
  const p2 = document.createElement('p')
  const p3 = document.createElement('p')
  const p4 = document.createElement('pre')
  const p5 = document.createElement('p')

  delete message.transaction_id_for_signature
  message.message = "response-signature-" + message.banker_id
  message.transaction_id = signedTX

  bankerMessageSignTxBody.innerHTML = ''

  signResponseTitle.innerHTML = "Please copy the line below and send it to " + message.creator_email;
  p1.innerHTML = USER.user_name + " response for your withdrawal signature request for " + message.contract_name;
  p2.innerHTML = "Please copy the message inside and import in FSCB";
  p3.innerHTML = "-----Begin fscb message-----";
  p4.innerHTML = JSON.stringify(message, undefined, 2);
  p5.innerHTML = "-----End fscb message-----";

  const copyToClipboardText = p1.innerHTML + '\n' + p2.innerHTML + '\n' + p3.innerHTML + '\n' + p4.innerHTML  + '\n' +  p5.innerHTML
  let copyButtonContainer = document.createElement('div')
  copyButtonContainer.setAttribute('class', 'flex justify-end')
  let copyButton = document.createElement('img')
  copyButton.setAttribute('src', './images/copy_button.png')
  copyButton.setAttribute('class', 'px-2 cursor-pointer hover:scale-125 transition duration-500')
  copyButton.addEventListener("click", function() {
    ipcRenderer.send('message:copy', copyToClipboardText)
    alertSuccess("Message successfully copied in clipboard.")
  }, false);

  copyButtonContainer.appendChild(copyButton)
  div.appendChild(copyButtonContainer)

  p1.classList.add('my-1')
  p4.classList.add('whitespace-pre-wrap', 'break-all')
  div.appendChild(p1)
  div.appendChild(p2)
  div.appendChild(p3)
  div.appendChild(p4)
  div.appendChild(p5)

  bankerMessageSignTxBody.appendChild(div)


  let closeButton = document.createElement('button')
  closeButton.classList.add("inline-flex", "items-center", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "absolute", "right-5", "mt-5", "text-white", "bg-orange-500", "rounded-lg", "focus:ring-4", "focus:ring-blue-200", "dark:focus:ring-orange-500", "hover:bg-orange-500")
  closeButton.innerHTML = "Close"
  closeButton.addEventListener("click", function() {

    importArea.classList.remove('hidden')
    bankerMessageSignTx.classList.add('hidden')
    importText.value = ""
    bankerMessageSignTxBody.innerHTML = ""

    // Clear verify withdrawal inputs
    let inputsTable = document.getElementById('banker-verify-inputs')
    let outputsTable = document.getElementById('banker-verify-outputs')
    let userPrivKey = document.getElementById('banker-pivkey-for-signature')

    inputsTable.innerHTML = ""
    outputsTable.innerHTML = ""
    userPrivKey.value = ""

    showImportListScreen()
  }, false);

  buttonDiv.appendChild(closeButton)
};


/**
  After importing banker signature response,
  show the select next banker screen
**/
ipcRenderer.on('response:banker-signature', (e, data) => {

  const account = data.account
  const message = data.message

  // Loop thru the account withdrawal array And
  // get the list of bankers that already signed
  const bankers = account.bankers
  let acctWithdrawal
  let signedBankers = []

  for (const [index, withdrawal] of account.withdrawals.entries()) {
    if (withdrawal.id === Number(message.withdrawal_id)) {
      let sx = withdrawal.signatures
      for (const [index, signature] of sx.entries()) {
        if (signature.status === "SIGNED") {
          signedBankers.push(signature)
        }
      }
    }
  }
  const bankersArray = bankers.filter((elem) => !signedBankers.find((banker) => elem.banker_id === banker.banker_id));

  let selectNextBankerScreen = document.getElementById('request-sig-next-banker-select')
  selectNextBankerScreen.classList.remove('hidden')
  importArea.classList.add('hidden')

  //
  // Start of Signed Banker's table
  //
  const bankersBody = document.getElementById('signed-bankers-list-body')

  bankersBody.innerHTML = ""
  for(let x in signedBankers) {
      if(signedBankers.hasOwnProperty(x)){
          let signedTx = slicePubkey(signedBankers[x].transaction_id)
          let row = bankersBody.insertRow();
          let name = row.insertCell(0);
          name.innerHTML = signedBankers[x].banker_name
          let dateSigned = row.insertCell(1);
          let ds = signedBankers[x].date_signed
          dateFormat = ds.toDateString()
          dateSigned.innerHTML = dateFormat
          let signature = row.insertCell(2);
          signature.innerHTML = signedTx
      }
  }
  //
  // End of Banker's table
  //


  let selectBankers = document.getElementById("next-banker-to-sign-container")
  var select =  document.getElementById("select-next-bankers-to-sign");
  select.innerHTML = ''
  select.dataset.placeholder = 'Choose Bankers'

  const el = document.createElement("option");
  el.textContent = "Select a banker";
  el.value = "";
  select.appendChild(el);
  bankersArray.forEach((banker, i) => {
    const opt = banker.banker_email;
    const pub = banker.pubkey;
    const el = document.createElement("option");
    el.textContent = opt;
    el.value = JSON.stringify(banker);
    select.appendChild(el);
  });

  let generateBtn = document.getElementById('generate-next-sign-message')
  generateBtn.onclick = null
  generateBtn.onclick = () => {
    const banker = select.options[select.selectedIndex].value;

    if (banker) {
      let parsedBanker = JSON.parse(banker)
      ipcRenderer.send("owner:save-next-banker", {account, message, parsedBanker})
    } else {
      alertError("Please select a banker.")
    }
  }
})

ipcRenderer.on('owner:show-banker-signature-message', (e, message) => {

  alertSuccess("Banker signature successfully updated.")

  ownerMessageSignRequest.classList.remove('hidden')
  let selectNextBankerScreen = document.getElementById('request-sig-next-banker-select')
  selectNextBankerScreen.classList.add('hidden')

  let ownerMessageSignRequestBody = document.getElementById('owner-message-sign-request-body')
  let signResponseTitle = document.getElementById('sign-request-title')
  let buttonDiv = document.getElementById('owner-message-sign-request-close-button')
  const div = document.createElement('div')
  div.setAttribute('class', 'bg-white p-3 rounded-md text-black')

  const p1 = document.createElement('p')
  const p2 = document.createElement('p')
  const p3 = document.createElement('p')
  const p4 = document.createElement('pre')
  const p5 = document.createElement('p')

  ownerMessageSignRequestBody.innerHTML = ''

  signResponseTitle.innerHTML = "Please copy the line below and send it to " + message.banker_email;
  p1.innerHTML = USER.user_name + " is requesting for a withdrawal transaction from " + message.contract_name;
  p2.innerHTML = "Please copy the message inside and import in FSCB";
  p3.innerHTML = "-----Begin fscb message-----";
  p4.innerHTML = JSON.stringify(message, undefined, 2);
  p5.innerHTML = "-----End fscb message-----";

  const copyToClipboardText = p1.innerHTML + '\n' + p2.innerHTML + '\n' + p3.innerHTML + '\n' + p4.innerHTML  + '\n' +  p5.innerHTML
  let copyButtonContainer = document.createElement('div')
  copyButtonContainer.setAttribute('class', 'flex justify-end')
  let copyButton = document.createElement('img')
  copyButton.setAttribute('src', './images/copy_button.png')
  copyButton.setAttribute('class', 'px-2 cursor-pointer hover:scale-125 transition duration-500')
  copyButton.addEventListener("click", function() {
    ipcRenderer.send('message:copy', copyToClipboardText)
    alertSuccess("Message successfully copied in clipboard.")
  }, false);

  copyButtonContainer.appendChild(copyButton)
  div.appendChild(copyButtonContainer)

  p1.classList.add('my-1')
  p4.classList.add('whitespace-pre-wrap', 'break-all')
  div.appendChild(p1)
  div.appendChild(p2)
  div.appendChild(p3)
  div.appendChild(p4)
  div.appendChild(p5)

  ownerMessageSignRequestBody.appendChild(div)


  let closeButton = document.createElement('button')
  closeButton.classList.add("inline-flex", "items-center", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "absolute", "right-5", "mt-5", "text-white", "bg-orange-500", "rounded-lg", "focus:ring-4", "focus:ring-blue-200", "dark:focus:ring-orange-500", "hover:bg-orange-500")
  closeButton.innerHTML = "Close"
  closeButton.addEventListener("click", function() {
    importArea.classList.remove('hidden')
    ownerMessageSignRequest.classList.add('hidden')
    importText.value = ""

    showImportListScreen()
  }, false);

  buttonDiv.appendChild(closeButton)
})

ipcRenderer.on('withdrawal:ready-to-broadcast', (e, message) => {

  ownerWithdrawalBroadcast.classList.remove('hidden')
  importArea.classList.add('hidden')

  let withdrawalTxId = document.getElementById('owner-withdrawal-txid-for-broadcast')
  withdrawalTxId.innerHTML = message.transaction_id

  let broadcastButton = document.getElementById("owner-withdrawal-broadcast-button")
  broadcastButton.onclick = null
  broadcastButton.onclick = () => {
    ipcRenderer.send('withdrawal:api', {
      ...message,
      apiProvider: getApiProvider(),
      apiKey: getApiKey()
    });
  }

  let closeButton = document.getElementById("owner-withdrawal-close-button")
  closeButton.onclick = null
  closeButton.onclick = () => {

    importArea.classList.remove('hidden')
    ownerWithdrawalBroadcast.classList.add('hidden')
    importText.value = ""
    withdrawalTxId.innerHTML = ""

    showImportListScreen()
  }
})

ipcRenderer.on('withdrawal:broadcast-response', (e, res) => {
  const withdrawalSuccessResponseContainer =
    document.getElementById('owner-withdrawal-response-success-container');
  const withdrawalErrorResponseContainer =
    document.getElementById('owner-withdrawal-response-error-container');

  const withdrawalTxIdResponse =
    document.getElementById('owner-withdrawal-txid-response');
  const withdrawalErrorResponse =
    document.getElementById('owner-withdrawal-error-response');

  const broadcastButton =
    document.getElementById("owner-withdrawal-broadcast-button");
  const closeButton =
    document.getElementById("owner-withdrawal-close-button");

  closeButton.onclick = () => {
    showImportListScreen();
  };

  // Reset UI
  withdrawalSuccessResponseContainer.classList.add('hidden');
  withdrawalErrorResponseContainer.classList.add('hidden');

  if (res.message && res.message.result) {
    // Success
    withdrawalSuccessResponseContainer.classList.remove('hidden');
    withdrawalTxIdResponse.innerText = res.message.result;

  } else {
    // Error
    withdrawalErrorResponseContainer.classList.remove('hidden');
    withdrawalErrorResponse.innerText =
      res?.error?.message || 'Broadcast failed. Please check the transaction.';
  }

  closeButton.classList.remove('hidden');
  broadcastButton.classList.add('hidden');
});




ipcRenderer.on('user:profile', (evt) => {
    const userProfile = document.getElementById('user-profile')
    const aside = document.getElementById('aside')
    const tabsContent = document.getElementById('tab-contents')
    userProfile.classList.remove('hidden')
    aside.classList.add('hidden')
    tabsContent.classList.add('hidden')
})

function getList() {
  ipcRenderer.send("balance:api", {
    send: "get",
    apiProvider: getApiProvider(),
    apiKey: getApiProvider() === "blockcypher" ? getApiKey() : null
  });    
}


async function createUserProfile(e) {
    e.preventDefault()
    const userName = removeTagsFromInput(document.getElementById('user-name').value)
    const userEmail = removeTagsFromInput(document.getElementById('user-email').value)

    /**
      Validation
    **/
    if (userName == '' || userEmail == '') {
      alertError("Name and email is required.")
      return
    } else if (userName.length > 50) {
      alertError("Name should not be more than 50 characters")
      return
    } else if (!isEmailValid(userEmail)) {
      alertError("Invalid email address")
      return
    }


    /**
      Disabled key creation on create User
    **/
    ipcRenderer.send("user:address", {
        userName,
        userEmail,
    })
    ipcRenderer.once('create:profile', (e) => {
        const userProfile = document.getElementById('user-profile')
        const aside = document.getElementById('aside')
        const tabsContent = document.getElementById('tab-contents')
        userProfile.classList.add('hidden')
        aside.classList.remove('hidden')
        tabsContent.classList.remove('hidden')
        alertSuccess("Profile has successfully been created")
    })
}


function isKeyValid(hex) {
  var key = hex.toString();
  var isValidFormat = /^[0-9a-fA-F]{64}$/.test(key)
  return isValidFormat
}

function isWifKeyValid(hex) {
  var key = hex.toString();
  var isValidFormat = /^[0-9a-zA-Z]{52}$/.test(key)
  return isValidFormat
}


ipcRenderer.on('request:banker-pubkey', async(e, message) => {
    importArea.classList.add('hidden')
    bankerGeneratePrivkey.classList.remove('hidden')
    let coin_js
    if (message.currency === "woodcoin") {
      coin_js = coinjs
    } else if (message.currency === "bitcoin") {
      coin_js = bitcoinjs
    } else if (message.currency === "litecoin") {
      coin_js = litecoinjs
    } else {
      return
    }

    coin_js.compressed = true
    let userAddress = await coin_js.newKeys()

    let privkeyHexInput = document.getElementById('pivkey-hex')
    let privkeyWifInput = document.getElementById('pivkey-wif')
    let pubkeyInput = document.getElementById('pubkey-compressed')
    let accountOwner = document.getElementById('account-owner-name')
    let accountOwner2 = document.getElementById('account-owner-name2')

    privkeyHexInput.value = userAddress.privkey
    privkeyWifInput.value = userAddress.wif
    pubkeyInput.value = userAddress.pubkey
    accountOwner.innerHTML = message.creator_name
    accountOwner2.innerHTML = message.creator_name

    let generatePrivkey = document.getElementById('banker-generate-privkey')
    let finalizeKeys = document.getElementById('banker-finalize-keys')

    generatePrivkey.addEventListener('click', async() => {
      let updatedHex = removeTagsFromInput(privkeyHexInput.value)
      let isValid = isKeyValid(updatedHex)
      if (!isValid) {
        alertError("The text you entered is not a valid private key")
        return
      }

      let newKeys = await coin_js.newKeysFromHex(updatedHex)

      privkeyHexInput.value = newKeys.privkey
      privkeyWifInput.value = newKeys.wif
      pubkeyInput.value = newKeys.pubkey

      return

    })

    finalizeKeys.addEventListener('click', () => {

      let response = confirm("Are you sure you have save the keys in a safe place?")
      if (response == true) {
        let pubkey = pubkeyInput.value
        message.message = "response-pubkey"
        message.pubkey = pubkey

        bankerGeneratePrivkey.classList.add('hidden')
        finalizeNewKeys(message)
      } else {
          console.log("not saved")
      }
    })

    return
})

function finalizeNewKeys(evt){
    const textBody = document.getElementById('text-show')
    const textId = document.getElementById('import-show')
    const textImport = document.getElementById('import-area')
    const textImportArea = document.getElementById('import-text-area')
    const div = document.createElement('div')
    div.setAttribute('class', 'bg-white p-3 rounded-md')
    const button = document.createElement('button')
    button.setAttribute('class', 'inline-flex items-center px-10 py-3 text-sm font-medium text-center text-white bg-orange-500 focus:ring-4 focus:ring-orange-500 dark:focus:bg-orange-500 hover:bg-orange absolute mt-5 right-10 rounded-full')
    button.setAttribute('id', "import-again-button")
    button.textContent = "Clear"
    const p = document.createElement('p')
    const br = document.createElement('br')
    const p1 = document.createElement('p')
    const p2 = document.createElement('p')
    const p3 = document.createElement('p')
    const p4 = document.createElement('pre')
    const p5 = document.createElement('p')
    textId.classList.remove('hidden')
    textImport.classList.add('hidden')
    textImportArea.value = ''
    p.innerHTML = "Please copy the line below and send it to " + evt.creator_name;
    p1.innerHTML = evt.banker_name + " public key response to " + evt.creator_name + " request";
    p2.innerHTML = "Please copy the message inside and import in FSCB";
    p3.innerHTML = "-----Begin fscb message-----";
    p4.innerHTML = JSON.stringify(evt, undefined, 2);
    p5.innerHTML = "-----End fscb message-----";
    p4.classList.add('whitespace-pre-wrap', 'break-all')

    const copyToClipboardText = p1.innerHTML + '\n' + p2.innerHTML + '\n' + p3.innerHTML + '\n' + p4.innerHTML  + '\n' +  p5.innerHTML
    let copyButtonContainer = document.createElement('div')
    copyButtonContainer.setAttribute('class', 'flex justify-end')
    let copyButton = document.createElement('img')
    copyButton.setAttribute('src', './images/copy_button.png')
    copyButton.setAttribute('class', 'px-2 cursor-pointer hover:scale-125 transition duration-500')
    copyButton.addEventListener("click", function() {
      ipcRenderer.send('message:copy', copyToClipboardText)
      alertSuccess("Message successfully copied in clipboard.")
    }, false);

    copyButtonContainer.appendChild(copyButton)
    div.appendChild(copyButtonContainer)
    div.appendChild(p)
    div.appendChild(br)
    div.appendChild(p1)
    div.appendChild(p2)
    div.appendChild(p3)
    div.appendChild(p4)
    div.appendChild(p5)
    textBody.appendChild(div)
    textBody.appendChild(button)
    const importAgain = document.getElementById('import-again-button')
    importAgain.addEventListener('click', importAgainShow)
};


//
// When the banker's pubkey is successfully added, clear the textarea
// and show success toast message
//
ipcRenderer.on('addBanker:pubkey', (e, evt) => {
  importText.value = ''
  alertSuccess("Successfully added banker's public key.")

})

function importAgainShow(div, button) {
    const textId = document.getElementById('import-show')
    const textImport = document.getElementById('import-area')
    const textBody = document.getElementById('text-show')
    textId.classList.add('hidden')
    textImport.classList.remove('hidden')
    textBody.innerHTML = ''

}

function openImportTextTab() {
  importTextTab.classList.remove('hidden')
  firstTab.classList.add('hidden')
  secondTab.classList.add('hidden')
  addBankerTab.classList.add('hidden')
  thirdTab.classList.add('hidden')
  fourthTab.classList.add('hidden')
  fifthTab.classList.add('hidden')

  let tabContents = document.querySelector("#tab-contents");
  for (let i = 0; i < tabContents.children.length-1; i++) {
    tabTogglers[i].parentElement.classList.remove("bg-gradient-to-l", "from-gray-500");
  }
}


function alertInfo(message) {
    Toastify.toast({
      text: message,
      duration: 50000,
      close: true,
      style: {
        background: '#fefefe',
        borderColor: '#fdfdfe',
        color: '#818182',
        textAlign: 'center',
        wordBreak: 'break-all'
      },
    });
  }

function alertSuccess(message) {
    Toastify.toast({
      text: message,
      duration: 10000,
      close: false,
      style: {
        background: '#d4edda',
        borderColor: '#c3e6cb',
        color: '#155724',
        textAlign: 'center',
      },
    });
  }

function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 10000,
        close: false,
        style: {
            background: '#f8d7da',
            borderColor: '#f5c6cb',
            color: '#721c24',
            textAlign: 'center',
        },
    });
};


/**
  Helper functions
**/
function isEmailValid(email) {
  var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (email.match(validRegex)) {
    return true;
  } else {
    return false;
  }
}

function checkTxFee(e) {
  console.log("checkTxFee fired");
  e.preventDefault();

  console.log("STEP 1: entered function");
  const feeInput = document.getElementById("withdraw-fee");
  console.log("STEP 2: feeInput =", feeInput);
  const fee = Number(feeInput.value);

  console.log("STEP 3: fee =", fee);

  TOTAL_AMOUNT_TO_WITHDRAW = getTotalWithdrawalAmt();

  console.log("STEP 4: unspentAmountTotal =", unspentAmountTotal);
  console.log("STEP 5: TOTAL_AMOUNT_TO_WITHDRAW =", TOTAL_AMOUNT_TO_WITHDRAW);

  

  // 2️⃣ HARD GUARDS (no silent failures)
  if (
    typeof unspentAmountTotal !== "number" ||
    typeof TOTAL_AMOUNT_TO_WITHDRAW !== "number" ||
    !ACCOUNT_CURRENCY ||
    !CHANGE_ADDRESS
  ) {
    alertError("Internal error: missing withdrawal state.");
    console.error({
      unspentAmountTotal,
      TOTAL_AMOUNT_TO_WITHDRAW,
      ACCOUNT_CURRENCY,
      CHANGE_ADDRESS,
      fee
    });
    return;
  }

  // 3️⃣ VALIDATIONS
  if (unspentAmountTotal <= 0) {
    alertError("No unspent selected.");
    return;
  }

  if (isNaN(fee) || fee < 0) {
    alertError("Invalid transaction fee.");
    return;
  }

  if (TOTAL_AMOUNT_TO_WITHDRAW <= 0) {
    alertError("Withdrawal amount is zero.");
    return;
  }

  if (unspentAmountTotal < TOTAL_AMOUNT_TO_WITHDRAW + fee) {
    alertError("Insufficient balance including fee.");
    return;
  }

  // 4️⃣ CALCULATE CHANGE
  const change = Number(
    (unspentAmountTotal - TOTAL_AMOUNT_TO_WITHDRAW - fee).toFixed(8)
  );

  // 5️⃣ WARN IF FEE IS HIGH
  if (fee > 0.001) {
    if (!confirm(`Transaction fee is high (${fee}). Continue?`)) {
      return;
    }
  }

  // 6️⃣ DUST CHECK
  if (change > 0 && change < 0.00000546) {
    alertError("Change amount is too small (dust).");
    return;
  }

  // 7️⃣ PROCEED
  generateClaim(change > 0 ? change : 0);
}


async function generateClaim(changeAmount) {
  // coin lib
  let coin_js;
  if (ACCOUNT_CURRENCY === "woodcoin") coin_js = coinjs;
  else if (ACCOUNT_CURRENCY === "bitcoin") coin_js = bitcoinjs;
  else if (ACCOUNT_CURRENCY === "litecoin") coin_js = litecoinjs;
  else {
    console.log("invalid currency");
    return;
  }

  const tx = coin_js.transaction();

  let decodedRedeemScript = null;

  if (!CURRENT_ACCOUNT || !CURRENT_ACCOUNT.redeem_script) {
    alertError("Missing account redeem script.");
    return;
  }
  

  try {
    const scriptObj = coin_js.script();
    const decoded = scriptObj.decodeRedeemScript(
      CURRENT_ACCOUNT.redeem_script.trim()
    );

    if (!decoded || !decoded.redeemscript) {
      throw new Error("Invalid redeem script");
    }

    decodedRedeemScript = decoded.redeemscript;
  } catch (e) {
    console.error(e);
    alertError("Failed to decode redeem script.");
    return;
  }

  // rows + outputs
  const unspentRows = document.querySelectorAll('#list-unspent .inner-unspent, #list-unspent .inner-unspent-manual');
  const outputRows = document.querySelectorAll('#address-amount #address-keys');

  console.log("get unspent rows:", unspentRows);

  if (!unspentRows.length) {
    alertError("No UTXO selected or loaded.");
    return;
  }

  const inputsTable = document.getElementById('banker-verify-inputs-initial');
  const outputsTable = document.getElementById('banker-verify-outputs-initial');

  inputsTable.innerHTML = "";
  outputsTable.innerHTML = "";

  let anyInputSelected = false;
  let txRedeemTransaction;
  let accountSigFilter;

  // build inputs (UTXOs)
  for (let i = 0; i < unspentRows.length; i++) {
    const row = unspentRows[i];

    // checkbox
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (!checkbox || !checkbox.checked) continue;

    anyInputSelected = true;

    // txid + amount (your UI has these)
    const inputs = row.querySelectorAll('input');
    // For API rows: [txidInput, amountInput, checkbox]
    // For manual rows: [txidInput, voutInput(hidden), scriptInput(hidden), amountInput, redeemInput(hidden), checkbox]
    const txidInput = inputs[0];

    if (!txidInput || !txidInput.value) {
      alertError("Missing TXID in a selected UTXO row.");
      return;
    }

    // vout + script are REQUIRED to sign/construct inputs
    const voutInput = row.querySelector('.vout-withdraw');
    const scriptInput = row.querySelector('.script-withdraw');

    // If this is an API-generated row (no vout/script), it cannot be used to build a real tx input
    if (!voutInput || !scriptInput) {
      alertError("Selected UTXO row is missing vout/script. Please use manual UTXO (+) rows for signing.");
      return;
    }

    const vout = Number(voutInput.value);
    const script = scriptInput.value || null;

    if (Number.isNaN(vout)) {
      alertError("Invalid vout in selected UTXO row.");
      return;
    }

    // coinjs tx.addinput(txid, vout, script, sequence)
    tx.addinput(
      txidInput.value,
      vout,
      decodedRedeemScript,
      null
    );
  }

  if (!anyInputSelected) {
    alertError("No UTXO selected.");
    return;
  }

  // build outputs (withdraw destinations)
  if (!outputRows.length) {
    alertError("No withdrawal outputs found.");
    return;
  }

  for (let i = 0; i < outputRows.length; i++) {
    const address = outputRows[i].children[0]?.value;
    const amount = outputRows[i].children[1]?.value;

    if (!address || !amount) {
      alertError("Output address/amount is missing.");
      return;
    }

    const amtNum = Number(amount);
    if (Number.isNaN(amtNum) || amtNum <= 0) {
      alertError("Invalid output amount.");
      return;
    }

    try {
      coin_js.addressDecode(address);
    } catch {
      alertError("Address is not valid");
      return;
    }    

    const amountCoins = Number(amtNum.toFixed(8));
    tx.addoutput(address, amountCoins);

  }

  if (changeAmount && Number(changeAmount) > 0) {
    tx.addoutput(CHANGE_ADDRESS, Number(changeAmount));
  }

  const accountDetails = document.getElementById('account-details');
  const accountWithdrawal = document.getElementById('account-withdrawal');
  const accountActions = document.getElementById('account-actions');
  const withdrawalReference = document.getElementById('withdraw-reference');

  accountDetails.classList.add('hidden');
  accountWithdrawal.classList.add('hidden');
  accountActions.classList.add('hidden');
  withdrawalReference.classList.remove('hidden');

  txRedeemTransaction = tx.serialize();

  // IMPORTANT: your old code used getunspent[0].children[4] (no longer exists)
  // If you truly need redeemscript, fetch it from the FIRST selected manual row redeem input (if present).
  const firstSelectedRow = [...unspentRows].find(r => r.querySelector('input[type="checkbox"]')?.checked);
  const redeemInput = firstSelectedRow?.querySelector('input[type="hidden"]'); // last resort
  // Better: give redeem input a class like ".redeem-withdraw" and query that instead.

  // If you have a redeemscript field, call it safely:
  const redeemScriptField =
    firstSelectedRow?.querySelector('.redeem-withdraw') || null;

  if (redeemScriptField?.value) {
    ipcRenderer.send('getredeemscript:redeemscript', { script: redeemScriptField.value });
  } else {
    // If your flow depends on this event, you must ensure manual rows include redeemscript.
    console.warn("No redeemscript found in selected UTXO rows. Skipping getredeemscript call.");
  }

  const deserializeTx = tx.deserialize(tx.serialize());
  const inputs = deserializeTx.ins;
  const outputs = deserializeTx.outs;

  // render inputs
  for (let i = 0; i < inputs.length; i++) {
    const s = deserializeTx.extractScriptKey(i);
    const input = inputs[i];

    const inputs1 = document.createElement('input');
    inputs1.readOnly = true;
    inputs1.className = 'md:flex px-3 bg-gray-300 text-black h-10 left-96 py-2 w-96';
    inputs1.value = input.outpoint.hash;

    const row = inputsTable.insertRow();
    const txid = row.insertCell(0);
    txid.appendChild(inputs1);
    txid.setAttribute('width', '45%');

    const indexNo = row.insertCell(1);
    indexNo.className = 'text-center bg-white text-black font-semibold';
    indexNo.innerHTML = input.outpoint.index;
    indexNo.setAttribute('width', '10%');

    const inputs3 = document.createElement('input');
    inputs3.readOnly = true;
    inputs3.className = 'md:flex bg-gray-300 pl-1 h-10 text-black px-3 py-2 w-full';
    inputs3.value = s.script;

    const scriptCell = row.insertCell(2);
    scriptCell.appendChild(inputs3);
    scriptCell.setAttribute('width', '45%');
  }

  // render outputs
  for (let i = 0; i < outputs.length; i++) {
    const output = outputs[i];

    if (output.script.chunks.length == 2 && output.script.chunks[0] == 106) {
      // OP_RETURN
      let data = Crypto.util.bytesToHex(output.script.chunks[1]);
      const dataascii = hex2ascii(data);
      if (dataascii.match(/^[\s\d\w]+$/ig)) data = dataascii;

      const row = outputsTable.insertRow();
      row.insertCell(0).innerHTML = data;
      row.cells[0].setAttribute('width', '45%');
      row.insertCell(1).innerHTML = (output.value / 100000000).toFixed(8);
      row.cells[1].setAttribute('width', '10%');
      row.insertCell(2).innerHTML = Crypto.util.bytesToHex(output.script.buffer);
      row.cells[2].setAttribute('width', '45%');
    } else {
      let addr = '';
      if (output.script.chunks.length == 5) {
        addr = coin_js.scripthash2address(Crypto.util.bytesToHex(output.script.chunks[2]));
      } else if ((output.script.chunks.length == 2) && output.script.chunks[0] == 0) {
        addr = coin_js.bech32_encode(
          coin_js.bech32.hrp,
          [coin_js.bech32.version].concat(coin_js.bech32_convert(output.script.chunks[1], 8, 5, true))
        );
      } else {
        const pub = coin_js.pub;
        coin_js.pub = coin_js.multisig;
        addr = coin_js.scripthash2address(Crypto.util.bytesToHex(output.script.chunks[1]));
        coin_js.pub = pub;
      }

      const row = outputsTable.insertRow();
      row.insertCell(0).innerHTML = addr;
      row.cells[0].setAttribute('width', '45%');
      row.insertCell(1).innerHTML = (output.value / 100000000).toFixed(8);
      row.cells[1].setAttribute('width', '10%');
      row.insertCell(2).innerHTML = Crypto.util.bytesToHex(output.script.buffer);
      row.cells[2].setAttribute('width', '45%');
    }
  }

  ipcRenderer.removeAllListeners('account:filterSig');
  ipcRenderer.on('account:filterSig', (e, evt) => {
    accountSigFilter = evt;
  });

  const generateButton = document.getElementById('generate-request-signature-message');
  if (generateButton) {
    generateButton.onclick = () => {
      selectBankerToSign(txRedeemTransaction, accountSigFilter);
    };
  }
}



function selectBankerToSign(tx, account, withdrawalID=null) {

  let accountDetails = document.getElementById('account-details')
  let accountWithdrawal = document.getElementById('account-withdrawal')
  let accountActions = document.getElementById('account-actions')
  let withdrawalReference = document.getElementById('withdraw-reference')
  let reqBankersSelect = document.getElementById('request-sig-banker-select')
  let messageSignature = document.getElementById('request-sig-message')
  messageSignature.innerHTML = ""
  accountDetails.classList.add('hidden')
  accountWithdrawal.classList.add('hidden')
  accountActions.classList.add('hidden')
  withdrawalReference.classList.add('hidden')
  reqBankersSelect.classList.remove('hidden')

  const accountParse = JSON.parse(account)

  let selectBankers = document.getElementById("next-banker-to-sign")
  var select =  document.getElementById("select-bankers-to-sign");
  select.innerHTML = ''
  select.dataset.placeholder = 'Choose Bankers'

  let bankersArray = accountParse[0].bankers

  const el = document.createElement("option");
  el.textContent = "Select a banker";
  el.value = "";
  select.appendChild(el);
  bankersArray.forEach((banker, i) => {
    const opt = banker.banker_email;
    const pub = banker.pubkey;
    const el = document.createElement("option");
    el.textContent = opt;
    el.value = JSON.stringify(banker);
    select.appendChild(el);
  });

  let generateBtn = document.getElementById('generate-sign-message')
  generateBtn.addEventListener('click', () => {
    let selectBanker = document.getElementById('select-bankers-to-sign')
    const banker = select.options[select.selectedIndex].value;

    if (banker) {
      let parsedBanker = JSON.parse(banker)
      requestSignatureWindow(tx, account, parsedBanker)
    } else {
      alertError("Please select a banker.")
    }
  })

}

function addManualUnspentRow() {
  const unspentdiv = document.getElementById('list-unspent')

  const div = document.createElement('div')
  div.className = 'grid md:grid-cols-4 gap-3 inner-unspent-manual items-center'

  // TXID
  const txidInput = document.createElement('input')
  txidInput.className = 'col-span-2 txid-withdraw text-black text-base p-1'
  txidInput.placeholder = 'Enter TXID'

  // VOUT (default 0, editable)
  const voutInput = document.createElement('input')
  voutInput.className = 'hidden vout-withdraw text-black text-base p-1'
  voutInput.type = 'number'
  voutInput.min = '0'
  voutInput.step = '1'
  voutInput.value = '0'
  voutInput.placeholder = 'Vout'

  // SCRIPT (auto-filled redeem script)
  const scriptInput = document.createElement('input')
  scriptInput.className = 'hidden script-withdraw text-black text-base p-1'
  scriptInput.placeholder = 'Redeem Script'
  scriptInput.value = CURRENT_ACCOUNT?.redeem_script || ''

  // AMOUNT
  const amountInput = document.createElement('input')
  amountInput.className = 'amount-withdraw text-black text-base p-1'
  amountInput.type = 'number'
  amountInput.step = '0.00000001'
  amountInput.min = '0'
  amountInput.placeholder = 'Amount'

  // ACTIONS
  const actions = document.createElement('div')
  actions.className = 'flex items-center gap-2'

  const check = document.createElement('input')
  check.type = 'checkbox'
  check.checked = true
  check.style.transform = 'scale(1.2)'

  const gearBtn = document.createElement('button')
  gearBtn.type = 'button'
  gearBtn.textContent = '⚙️'
  gearBtn.title = 'Show / Hide vout & script'

  const trashBtn = document.createElement('button')
  trashBtn.type = 'button'
  trashBtn.textContent = '🗑'
  trashBtn.title = 'Remove UTXO'

  // Toggle vout + script
  gearBtn.addEventListener('click', () => {
    const show = voutInput.classList.contains('hidden')
    voutInput.classList.toggle('hidden', !show)
    scriptInput.classList.toggle('hidden', !show)

    if (show) {
      div.classList.remove('md:grid-cols-4')
      div.classList.add('md:grid-cols-6')
      voutInput.classList.add('col-span-1')
      scriptInput.classList.add('col-span-2')
    } else {
      div.classList.remove('md:grid-cols-6')
      div.classList.add('md:grid-cols-4')
    }
  })

  // Delete row
  trashBtn.addEventListener('click', () => {
    div.remove()
    recalcUnspentTotal()
  })

  // Amount recalculation
  amountInput.addEventListener('input', recalcUnspentTotal)
  check.addEventListener('change', recalcUnspentTotal)

  actions.append(check, gearBtn, trashBtn)

  // ORDER
  div.append(
    txidInput,
    voutInput,
    scriptInput,
    amountInput,
    actions
  )

  unspentdiv.appendChild(div)
}




function recalcUnspentTotal() {
  let total = 0
  const rows = document.querySelectorAll('#list-unspent .inner-unspent-manual, #list-unspent')

  rows.forEach(row => {
    const amountInput = row.querySelector('.amount-withdraw') || row.querySelector('#amount-withdraw')
    const checkbox = row.querySelector('input[type="checkbox"]')

    if (amountInput && checkbox && checkbox.checked) {
      total += parseFloat(amountInput.value || 0)
    }
  })

  unspentAmountTotal = total
  let withdrawAmt = getTotalWithdrawalAmt()
  withdrawalFee.value = (unspentAmountTotal - withdrawAmt).toFixed(8)
}

function requestSignatureWindow(tx, account, banker) {

  // Clear withdraw address and amount input
  let withdrawAddrInput = document.getElementById('withdraw-address')
  let withdrawAmtInput = document.getElementById('withdraw-amount')
  let withdrawFeeInput = document.getElementById('withdraw-fee')

  withdrawAddrInput.value = ""
  withdrawAmtInput.value = ""
  withdrawAmtInput.value = 0

  let withdrawalID = Date.now()
  let sendSignature = document.getElementById('send-signature')
  let messageSignature = document.getElementById('request-sig-message')
  let selectBankerScreen = document.getElementById('request-sig-banker-select')
  messageSignature.innerHTML = ""
  selectBankerScreen.classList.add('hidden')
  sendSignature.classList.remove('hidden')
  const accountParse = JSON.parse(account)
  const br = document.createElement('br')

  const p1 = document.createElement('p')
  p1.innerHTML = "Please copy the line below and send it to" + " " + banker.banker_email
  const p2 = document.createElement('p')
  p2.innerHTML = accountParse[0].creator_name + " is requesting for your banker signature at this " + accountParse[0].contract_name
  const p3 = document.createElement('p')
  p3.innerHTML = "Please copy the message inside and import in FSCB"
  const p4 = document.createElement('p')
  p4.innerHTML = "-----Begin fscb message-----"
  const p5 = document.createElement('p')
  p5.innerHTML = "{" + '"header":"free_state_central_bank",'
  const p6 = document.createElement('p')
  p6.innerHTML = '"message": "request-signature",'
  const p7 = document.createElement('p')
  p7.innerHTML = '"id":' + '"' + accountParse[0].id + '",'
  const p8 = document.createElement('p')
  p8.innerHTML = '"banker_id":' + banker.banker_id + ','
  const p9 = document.createElement('p')
  p9.innerHTML = '"creator_name":' + '"' + accountParse[0].creator_name + '",'
  const p10 = document.createElement('p')
  p10.innerHTML = '"creator_email":' + '"' + accountParse[0].creator_email + '",'
  const p11 = document.createElement('p')
  p11.innerHTML = '"banker_name":' + '"' + banker.banker_name + '",'
  const p12 = document.createElement('p')
  p12.innerHTML = '"banker_email":' + '"' + banker.banker_email + '",'
  const p13 = document.createElement('p')
  p13.innerHTML = '"transaction_id_for_signature":' + '"' + tx + '",'
  const p14 = document.createElement('p')
  p14.innerHTML = '"currency":' + '"' + accountParse[0].currency + '",'
  const p15 = document.createElement('p')
  p15.innerHTML = '"contract_name":' + '"' + accountParse[0].contract_name + '",'
  const p16 = document.createElement('p')
  p16.innerHTML = '"withdrawal_id":' + '"' + withdrawalID + '"}'
  const p17 = document.createElement('p')
  p17.innerHTML = "-----End fscb message-----"

  const copyToClipboardText = p2.innerHTML + '\n' + p3.innerHTML + '\n' + p4.innerHTML  + '\n' +  p5.innerHTML + '\n' + p6.innerHTML + '\n' + p7.innerHTML + '\n' + p8.innerHTML + '\n' + p9.innerHTML + '\n' + p10.innerHTML + '\n' + p11.innerHTML + '\n' + p12.innerHTML + '\n' + p13.innerHTML + '\n' + p14.innerHTML + '\n' + p15.innerHTML
   + '\n' + p16.innerHTML + '\n' + p17.innerHTML
  let copyButtonContainer = document.createElement('div')
  copyButtonContainer.setAttribute('class', 'flex justify-end')
  let copyButton = document.createElement('img')
  copyButton.setAttribute('src', './images/copy_button.png')
  copyButton.setAttribute('class', 'px-2 cursor-pointer hover:scale-125 transition duration-500')
  copyButton.addEventListener("click", function() {
    ipcRenderer.send('message:copy', copyToClipboardText)
    alertSuccess("Message successfully copied in clipboard.")
  }, false);

  copyButtonContainer.appendChild(copyButton)
  messageSignature.appendChild(copyButtonContainer)
  messageSignature.appendChild(p1)
  messageSignature.appendChild(br)
  messageSignature.appendChild(br)
  messageSignature.appendChild(p2)
  messageSignature.appendChild(p3)
  messageSignature.appendChild(p4)
  messageSignature.appendChild(p5)
  messageSignature.appendChild(p6)
  messageSignature.appendChild(p7)
  messageSignature.appendChild(p15)
  messageSignature.appendChild(p8)
  messageSignature.appendChild(p9)
  messageSignature.appendChild(p10)
  messageSignature.appendChild(p11)
  messageSignature.appendChild(p12)
  messageSignature.appendChild(p13)
  messageSignature.appendChild(p14)
  messageSignature.appendChild(p16)
  messageSignature.appendChild(p17)
  const data = {
    "banker_id": accountParse[0].bankers[0].banker_id,
    "banker_name": accountParse[0].bankers[0].banker_name,
    "date_requested": Date.now(),
    "date_signed": null,
    "status": "PENDING",
    "transaction_id": "",
    "action": "Request for signature"
  }
  const newWithdrawal = {
    id: withdrawalID,
    signatures: [
      data
    ]
  }
  accountParse[0].withdrawals.push(newWithdrawal)
  ipcRenderer.send('signature:encode', {"id": accountParse[0].contract_id, "contract": accountParse[0]})
}

function closeSendSignatureOnLeave() {
  let sendSignature = document.getElementById('send-signature')
  let signatureMessage = document.getElementById('request-sig-message')
  let accountListScreen = document.getElementById('accounts-list')

  accountListScreen.classList.remove('hidden')
  sendSignature.classList.add('hidden')
  signatureMessage.innerHTML = ""
}

function closeSendSignatureScreen() {
  let sendSignature = document.getElementById('send-signature')
  let signatureMessage = document.getElementById('request-sig-message')
  let accountListScreen = document.getElementById('accounts-list')

  accountListScreen.classList.remove('hidden')
  sendSignature.classList.add('hidden')
  signatureMessage.innerHTML = ""

  showImportListScreen()
}



/**
  Function to export json data
**/
function exportJsonData() {
  ipcRenderer.send("export:get-data", {})
}

function browseDirectory() {
  let dir = browser.downloads.showDefaultFolder();
}

/**
  Display data to backup in a textarea and let
  the copy and save it
**/
ipcRenderer.on('export:response', (e, message) => {
  //alertSuccess("Successfully created a backup file.")
  let backupBtnContainer = document.getElementById('backup-btn-container')
  let backupMessageContainer = document.getElementById('backup-message-container')
  let backupMessageBody = document.getElementById('backup-message')
  let closeBtn = document.getElementById('close-backup-btn')

  backupBtnContainer.classList.add('hidden')
  backupMessageContainer.classList.remove('hidden')

  const div = document.createElement('div')
  div.setAttribute('class', 'bg-white p-3 rounded-md text-black')
  const p1 = document.createElement('p')
  const p2 = document.createElement('pre')
  const p3 = document.createElement('p')

  backupMessageBody.innerHTML = ''

  p1.innerHTML = "-----Begin fscb message-----";
  p2.innerHTML = JSON.stringify(message, undefined, 2);
  p3.innerHTML = "-----End fscb message-----";

  p1.classList.add('my-1')
  p2.classList.add('whitespace-pre-wrap', 'break-all')

  const copyToClipboardText = p1.innerHTML + '\n' + p2.innerHTML + '\n' + p3.innerHTML
  let copyButtonContainer = document.createElement('div')
  copyButtonContainer.setAttribute('class', 'flex justify-end')
  let copyButton = document.createElement('img')
  copyButton.setAttribute('src', './images/copy_button.png')
  copyButton.setAttribute('class', 'px-2 cursor-pointer hover:scale-125 transition duration-500')
  copyButton.addEventListener("click", function() {
    ipcRenderer.send('message:copy', copyToClipboardText)
    alertSuccess("Message successfully copied in clipboard.")
  }, false);

  copyButtonContainer.appendChild(copyButton)
  div.appendChild(copyButtonContainer)
  div.appendChild(p1)
  div.appendChild(p2)
  div.appendChild(p3)

  backupMessageBody.appendChild(div)

  closeBtn.addEventListener("click", function() {
    backupBtnContainer.classList.remove('hidden')
    backupMessageContainer.classList.add('hidden')

    showImportListScreen()
  }, false);
})


ipcRenderer.on('response:import-json', (e) => {
  alertSuccess("Successfully imported FSCB data.")
  const textarea = document.getElementById('import-text-area');
  textarea.innerHTML = ""
})

document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveApiKeyBtn');
  const input = document.getElementById('apiKeyInput');
  const providerSelect = document.getElementById('apiProviderSelect');

  if (!localStorage.getItem(API_PROVIDER_KEY)) {
    localStorage.setItem(API_PROVIDER_KEY, "mempool");
  }
  

  if (saveBtn) {
    saveBtn.addEventListener('click', saveApiKey);
  }

  // Restore provider
  if (providerSelect) {
    providerSelect.value = getApiProvider();

    providerSelect.addEventListener('change', () => {
      localStorage.setItem(API_PROVIDER_KEY, providerSelect.value);

      // Clear key input if mempool
      if (providerSelect.value === "mempool") {
        input.value = "";
        input.disabled = false; // keep enabled but hidden by UI
      } else {
        input.disabled = false;
        input.value = getApiKey(providerSelect.value) || "";
      }      
    });
  }

  // Restore API key
  if (input && providerSelect?.value !== "mempool") {
    input.value = getApiKey() || "";
  }

  updateApiUI();

  ipcRenderer.send("api:state", {
    apiProvider: getApiProvider(),
    apiKey: getApiProvider() === "blockcypher" ? getApiKey() : null
  });
});




formCreateAccount.addEventListener("submit", saveAndCreateText);
importTextForm.addEventListener('submit', parseTextArea);
userProfileForm.addEventListener('submit', createUserProfile);
withdrawalAddBtn.addEventListener('click', () => {addOrDelete('address-keys')});
formAddBanker.addEventListener('submit', addBanker);
getbankerClick.addEventListener('click', getBanker)
getListClick.addEventListener('click', getList)
importTextButton.addEventListener('click', openImportTextTab)
getbankerClick.addEventListener('click', getBanker);
formWithdraw.addEventListener('submit', checkTxFee);
donateBtn.addEventListener('click', addDonationAddress);
exportBtn.addEventListener('click', exportJsonData);
sendSignatureCloseBtn.addEventListener('click', closeSendSignatureScreen)

const unspentAddBtn = document.getElementById('unspent-plus-icon');

if (unspentAddBtn) {
  console.log('Unspent + button found');
  unspentAddBtn.addEventListener('click', () => {
    console.log('Unspent + clicked');
    addManualUnspentRow();
  });
}

