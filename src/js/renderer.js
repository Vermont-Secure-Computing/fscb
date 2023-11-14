// var keys = ["02a580990522b85a9d842669f0950a615c061ec6916f32b8b3461efe58985c0cb4", "02bb3d790f459a017c11002a80671e8fc6213675b8845044996f51690011d7bdb0", "03d2fb8b133858b2a5b70e884451f2eaa23064e3dc9f77e417b317bed014f30dfc"]
// var sigsNeeded = 2
 // var multisig =  coinjs.pubkeys2MultisigAddress(keys, sigsNeeded);
 // console.log(multisig)


//  Start Tab Pannels

const importText = document.getElementById('import-text');
// const bankersClick = document.getElementsByClassName('pubkeyAdd')[0];

const formCreateAccount =   document.getElementById('create-new-form');
const importTextButton = document.getElementById('import-text-button')
const importTextForm = document.getElementById('import-text-form');
const userProfileForm = document.getElementById('user-profile-form')
const formAddBanker = document.getElementById('add-banker-form');
const formWithdraw = document.getElementById('withdraw-submit')
const contractName = document.getElementById("contract-name");
const creatorName = document.getElementById("creator-name");
const creatorEmail = document.getElementById("creator-email");
const creatorAddress = document.getElementById("creator-address");
const minusButton = document.getElementById('address-amount');
//const addMinus = document.getElementsByClassName('pubkeyAdd')[0]
const withdrawalAddBtn = document.getElementById('withdrawal-plus-icon')
const getbankerClick = document.getElementsByClassName('getbankerClick')[0]
const getListClick = document.getElementsByClassName('getlistClick')[0]

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


// console.log(getListClick)
// const accountList = document.getElementById('accounts-list');

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
let DONATION_BTC = 'WhAiyvrEhG6Ty9AkTb1hnUwbT3PubdWkAg'
let DONATION_LTC = 'WhAiyvrEhG6Ty9AkTb1hnUwbT3PubdWkAg'
let DONATION_ADDRESS = 'WhAiyvrEhG6Ty9AkTb1hnUwbT3PubdWkAg'
let WITHDRAWAL_FEE = 0.01

getUserData()
tabTogglers.forEach(function(toggler) {
    toggler.addEventListener("click", function(e) {
        e.preventDefault();

        importTextTab.classList.add('hidden')
        let tabName = this.getAttribute("href");

        openTab = tabName;
        if (tabName === "#first") {
            ipcRenderer.send("balance:api", {"send": "get"})
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
  console.log("show import list screen")
  let tabContents = document.querySelector("#tab-contents");
  for (let i = 0; i < tabContents.children.length-1; i++) {
    if (tabTogglers[i].parentElement) {
      tabTogglers[i].parentElement.classList.remove("bg-gradient-to-l", "from-gray-500");
    }
  }
  let accountListTab = document.getElementById('account-list-tab')
  console.log("accountListTab: ", accountListTab)
  accountListTab.classList.add("bg-gradient-to-l", "from-gray-500");
}


function loadText(e) {

    const file = e.target.files[0];
    // console.log(file)

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


/**
  New account creation
**/
async function saveAndCreateText(e) {
    e.preventDefault();
    // console.log(contractName.value, " ", creatorName.value, " ", creatorEmail.value)
    const contractSendName = contractName.value;
    const creatorSendName = USER.user_name;
    const creatorSendEmail = USER.user_email;

    const sigSendNumber = sigNumber.options[sigNumber.selectedIndex].text;
    const coinCurrencySend = currency.options[currency.selectedIndex].text;
    const innerMultiKey = document.querySelectorAll('.activeClass a')
    console.log("innerMultiKey", innerMultiKey)

    /**
      New account data validation
    **/
    if (contractSendName == "") return alertError("Contract name is required.")
    if (innerMultiKey.length == 0) return alertError("Please select a banker")

    let bankersMerge = [];
    for (let i = 0; i < innerMultiKey.length; i++) {
    //     bankersMerge.push({"banker_id": contractSendName.split(' ').join('_') + "-" + innerMultiKey[i].querySelector('.banker-email').value + "-" + (Math.floor(1000000000 + Math.random() * 9000000000)),
    //     "banker_name": innerMultiKey[i].querySelector('.banker-name').value,
    //     "banker_email": innerMultiKey[i].querySelector('.banker-email').value,
    //     "banker_address": "",
    //     "banker_signature": "",
    //     "banker_request_address": "banker-request-address" + "-" + innerMultiKey[i].querySelector('.banker-email').value + "-" + (Math.floor(1000000000 + Math.random() * 9000000000)) + ".txt",
    //     "banker_response_address": "banker-response-address" + "-" + innerMultiKey[i].querySelector('.banker-email').value + "-" + (Math.floor(1000000000 + Math.random() * 9000000000)) + ".txt",
    //     "banker_request_signature": "banker-request-signature" + "-" + innerMultiKey[i].querySelector('.banker-email').value + "-" + (Math.floor(1000000000 + Math.random() * 9000000000)) + ".txt",
    //     "banker_response_signature": "banker-response-signature" + "-" + innerMultiKey[i].querySelector('.banker-email').value + "-" + (Math.floor(1000000000 + Math.random() * 9000000000)) + ".txt"
    // })
        bankersMerge.push(innerMultiKey[i].dataset.value)
    }

    let coin_js

    if (coinCurrencySend === "woodcoin") {
      coin_js = coinjs
    } else if (coinCurrencySend === "bitcoin") {
      coin_js = bitcoinjs
    } else if (coinCurrencySend === "litecoin") {
      coin_js = litecoinjs
    } else {
      console.log("invalid currency")
    }


    coin_js.compressed = true
    const creatorAddressDetail = await coin_js.newKeys()

    console.log("creatorAddressDetail ", creatorAddressDetail)
    const keys = bankersMerge;
    const multisig =  coin_js.pubkeys2MultisigAddress(keys, sigSendNumber);
    console.log("multisig ", multisig)
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
  alertSuccess("Account successfully created.")
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
            balance.setAttribute('class', 'pl-4')
            balance.innerHTML = convertToJson[x].balance
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
    // console.log('withdrawal: ', withdrawal)
    // console.log("has prop: ", withdrawal.hasOwnProperty('txid'))
    for(let x in withdrawal.signatures) {
      console.log("x: ", x)
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

        //dateFormat = dateReq.toDateString() + ", "+ dateReq.getHours() + ":" + dateReq.getMinutes();
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
            console.log("view ", withdrawal.signatures[x].transaction_id)
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
  console.log("actions back btn: ")
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
  ipcRenderer.send("unspent:api", {"address": address.address, "currency": address.currency})

  let coin_js
  if (address.currency === "woodcoin") {
    coin_js = coinjs
  } else if (address.currency === "bitcoin") {
    coin_js = bitcoinjs
  } else if (address.currency === "litecoin") {
    coin_js = litecoinjs
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

  ipcRenderer.on('unspent:address', (e, evt) => {
    // const listParse = JSON.parse(evt)
    console.log(evt)
    const listP = evt.utxo;
    //console.log("unspent address: ", evt, listP.length)
    if (unspentAmountTotal == 0) {
      for (let i = 0; i < listP.length; i++) {
        // console.log(listP[i].txid)
        let listPAmount;
        let listPTXID;
        let listPvout
        if (evt.currency === 'woodcoin') {
          listPAmount = listP[i].amount
          listPTXID = listP[i].txid
          listPvout = listP[i].vout
        } else {
          listPAmount = listP[i].value
          listPTXID = listP[i].transaction_hash
          listPvout = listP[i].index
        }
        unspentAmountTotal += Number(listPAmount / 100000000)
        // let row = tableBody.insertRow()
        // let transactionId = row.insertCell(0)
        // transactionId.innerHTML = listP[i].txid.substring(0,30)+"..."
        // let vout = row.insertCell(1)
        // vout.innerHTML = listP[i].vout
        // let script = row.insertCell(2)
        // script.innerHTML = addressScript.redeemscript.substring(0,20)+"..."
        // let amount = row.insertCell(3)
        // amount.innerHTML = listP[i].amount
        // tx.addinput(listP[i].txid, listP[i].vout, addressScript.redeemscript, null)
        // tx.addoutput("WdBb5rTtXjDYGHBZvXHbhxyUar1n7RA1VJ", 1.99)
        // console.log("tx log test: ", tx.serialize())
        let div = document.createElement('div')
        div.setAttribute('id', 'inner-unspent')
        div.setAttribute('class', 'grid md:grid-cols-4 gap-3')
        let input1 = document.createElement('input')
        input1.setAttribute('class', 'col-span-2 txid-withdraw text-black text-base text-normal p-1')
        input1.setAttribute('id', 'txid-withdraw')
        input1.value = listPTXID
        let input2 = document.createElement('input')
        input2.setAttribute('class', 'text-black')
        input2.setAttribute('class', 'hidden')
        input2.setAttribute('id', 'vout-withdraw')
        input2.value = listPvout
        let input3 = document.createElement('input')
        input3.setAttribute('class', 'text-black text-base text-normal')
        input3.setAttribute('class', 'hidden')
        input3.setAttribute('id', 'script-withdraw')
        input3.value = addressScript.redeemscript
        let input4 = document.createElement('input')
        input4.setAttribute('class', 'col-span-1 text-black text-base text-normal p-1')
        input4.setAttribute('id', 'amount-withdraw')
        input4.value = listPAmount / 100000000
        let input5 = document.createElement('input')
        input5.setAttribute('class', 'hidden')
        input5.value = address.redeemscript
        let check = document.createElement('input')
        check.setAttribute('type', 'checkbox')
        check.setAttribute('checked', '')
        check.addEventListener('change', (e, evt) => {
          console.log("e testing ", e)
          console.log("evt testing ", evt)
          let withdrawAmt = getTotalWithdrawalAmt()

          if(e.target.defaultChecked) {
            check.removeAttribute('checked', '')
            console.log("subtract this amount: ", input4.value)

            unspentAmountTotal -= parseFloat(input4.value)
            withdrawalFee.value = (unspentAmountTotal - withdrawAmt).toFixed(8)
          } else {
            check.setAttribute('checked', '')
            console.log("add this amount: ", input4.value)
            unspentAmountTotal += parseFloat(input4.value)
            withdrawalFee.value = (unspentAmountTotal - withdrawAmt).toFixed(8)
          }
        })
        div.appendChild(input1)
        div.appendChild(input2)
        div.appendChild(input3)
        div.appendChild(input4)
        div.appendChild(input5)
        div.appendChild(check)
        unspentdiv.appendChild(div)
    }
    }
    console.log("total unspent: ", unspentAmountTotal)
    withdrawalFee.value = unspentAmountTotal
  })
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
  console.log("amount to subtract: ", amount)
  console.log("withdrawal fee: ", unspentAmountTotal - TOTAL_AMOUNT_TO_WITHDRAW)
}

let withdrawAmountInput = document.getElementById('withdraw-amount')
withdrawAmountInput.addEventListener('input', () => {amountOnInput(withdrawAmountInput.value)})
withdrawAmountInput.addEventListener('change', () => {amountOnchange(withdrawAmountInput.value)})

function getAccountDetails(account){
  console.log("get account details: ", account)
  ACCOUNT_CURRENCY = account.currency
  if (account.hasOwnProperty('id')) {
    let accountList = document.getElementById('accounts-list')
    let accountDetails = document.getElementById('account-details')

    accountList.classList.add("hidden")
    accountDetails.classList.remove("hidden")

    //accountDetails.innerHTML = ""
    let accountName = document.getElementById('account-name')
    let creatorName = document.getElementById('creator-name')
    let accountEmail = document.getElementById('account-email')
    let accountBalance = document.getElementById('account-balance')
    let accountAddress = document.getElementById('account-address')
    let accountRedeemScript = document.getElementById('account-redeem-script')
    let accountCurrency = document.getElementById('account-currency')

    accountName.innerHTML = account.contract_name
    creatorName.innerHTML = account.creator_name
    accountEmail.innerHTML = account.creator_email
    accountBalance.innerHTML = account.balance
    accountAddress.innerHTML = account.address
    accountRedeemScript.innerHTML = account.redeem_script
    accountCurrency.innerHTML = account.currency


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
        // let signature = row.insertCell(3);
        // signature.innerHTML = bankers[x].pubkey ? bankers[x].pubkey : 'no signature yet'
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
    if (account.balance > 0) {
      withdrawalButton.classList.add("inline-flex", "items-center", "m-2", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "text-white", "bg-orange-500", "rounded-full", "focus:ring-4", "focus:ring-yellow-200", "dark:focus:ring-yellow-900", "hover:bg-yellow-800")
      withdrawalButton.disabled = false;
    } else {
      withdrawalButton.classList.add("inline-flex", "items-center", "m-2", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "text-white", "bg-orange-500", "rounded-full", "cursor-not-allowed")
      withdrawalButton.disabled = true;
    }

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

// ipcRenderer.on('list:file', function(evt) {
//     console.log(evt)
//     const accountBody = document.getElementById('accounts-list-body')
//     const accountTr = document.createElement('tr')

// })


function setDonationAddress(currency) {
  if (currency === "woodcoin") {
    DONATION_ADDRESS = DONATION_LOG
  } else if (currency === "bitcoin") {
    DONATION_ADDRESS = DONATION_BTC
  } else if (currency === "litecoin") {
    DONATION_ADDRESS = DONATION_LTC
  } else {
    console.log("invalid currency")
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
    // const mainBankerDiv = document.getElementById('addbanker')
    const nameInput = document.getElementById('banker-name-add')
    const emailInput = document.getElementById('banker-email-add')

    // Get value of selected currency
    var selectElement = document.getElementById('banker-coin-currency');
    var bankerCurrency = selectElement.options[selectElement.selectedIndex].text;

    console.log("bankerCurrency: ", bankerCurrency)
    const bankerName = nameInput.value
    const bankerEmail = emailInput.value

    /**
      Add banker form validation
    **/
    if (bankerName == "" || bankerEmail == "") {
      alertError("Banker User name and email is required.")
      return
    }
    if (bankerEmail) {
      let validEmail = isEmailValid(bankerEmail)
      if (!validEmail) {
        console.log("Please enter a valid email")
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
    // if (!bankersArray) {
    //     ipcRenderer.send('click:addBanker', {})
    // }
    ipcRenderer.send('click:addBanker', {})
}

function getUserData() {
  ipcRenderer.send('get:user', {})
}

ipcRenderer.on('response:user', function(e, evt){
  if (evt) {
    USER = evt
    console.log("USER: ", USER)
  }
})


ipcRenderer.on('send:newBanker', function(e, evt) {
    let bankerForm = document.getElementById('add-banker-form')
    let bankersList = document.getElementById('bankers-list-container')
    let bankerMessage = document.getElementById('banker-message-container')

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

    console.log('new banker message: ', evt)
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
      bankerForm.classList.remove('hidden')
      bankersList.classList.remove('hidden')
      bankerMessage.classList.add('hidden')
    }, false);

    console.log("div button: ", buttonDiv)
    buttonDiv.appendChild(closeButton)
    bankerMessage.appendChild(buttonDiv)
})


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
    if (openTab == "#second") {
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
      console.log("account currency: ", currency)
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
      // active.classList.add('active');
      // active.setAttribute('class', 'relative z-2 pt-8 pb-2 py-12 rounded-lg text-sm min-h-44 shadow-[0_4px_16px_0_rgba(255,165,0,0.12)] transition shadow-[0_4px_16px_0_rgba(255,165,0,0.12)] duration-300 ease-in hover:shadow-[0_4px_24px_-1px_rgba(255,165,0,0.16)]')
      active.setAttribute('class', 'activeClass')
      const optionList = document.createElement('ul');
      optionList.setAttribute('class', 'optionListClass')
      // optionList.setAttribute('class', 'm-0 p-0 list-none text-base z-1 absolute top-full left-0 right-0 invisible opacity-0 rounded-lg translate-x-0 translate-y-20 origin-top-right shadow-[0_12px_20px_rgba(255,165,0,0.8)] transition-all duration-400 ease-in-out ')
      const placeholder = select.dataset.placeholder;

      const span = document.createElement('span');
      span.setAttribute('class', 'spanClass')
      // span.setAttribute('class', 'text-blue-200 block absolute left-12 cursor-pointer top-8 leading-7 transition-all duration-300 ease-in')
      span.innerText = placeholder;
      active.appendChild(span);

      selectOptions.forEach((option) => {
          //console.log(option)
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
              // item.setAttribute('class', 'text-indigo-950 bg-white px-12 py-16 cursor-pointer overflow-hidden relative litransition [&>*:first-child]:rounded-br-lg [&>*:first-child]:rounded-bl-none [&>*:last-child]:rounded-bl-lg [&>*:last-child]:rounded-br-none')
              item.dataset.value = option.value;
              item.innerHTML = text;
              optionList.appendChild(item);
          }
      });
      const arrow = document.createElement('div');
      arrow.classList.add('arrow');
      // arrow.setAttribute('class', 'arrowClass')
      active.appendChild(arrow);

      newSelect.appendChild(active);
      newSelect.appendChild(optionList);

      select.parentElement.append(newSelect);
      span.appendChild(select);

      // newSelect.appendChild(select);
      //select.style.display = "none";
      //1
      //document.querySelectorAll('.selectMultiple ul li').forEach((li) => {
      document.querySelector('.selectMultiple ul').addEventListener('click', (e) => {
          let li = e.target.closest('li');
          if(!li){return;}
          let select = li.closest('.selectMultiple');
          if(!select.classList.contains('clicked')){
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
              // a.style.display = "none";
              select.querySelector('div').appendChild(a); //might have to check later
              let selectEl = select.querySelector('select');
              let opt = selectEl.querySelector('option[value="'+li.dataset.value+'"]');
              opt.setAttribute('selected', 'selected');
              setTimeout(() => {
                  a.classList.add('shown');
                  select.querySelector('span').classList.add('hide');
                  // if(select.querySelector('option').innerText == li.innerText){
                  // 	select.querySelector('option').selected
                  // }

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
      //             setTimeout(() => {
      //                 if(li.previousElementSibling){
      //                     li.previousElementSibling.classList.remove('beforeRemove');
      //                 }
      //                 if(li.nextElementSibling){
      //                     li.nextElementSibling.classList.remove('afterRemove');
      //                 }

      //             }, 200);
              }, 300); //600
                  //2nd
          }
      });
      //2
      //document.querySelectorAll('.selectMultiple > div a').forEach((a) => {
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
                  // li.setAttribute('class', 'itemClass')
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

})


function parseTextArea(e) {
    e.preventDefault();
    const textarea = document.getElementById('import-text');
    console.log(textarea)
    // const resultDiv = document.getElementById('result');
    const jsonString = textarea.value;
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    console.log("startIndex: ", startIndex)
    console.log("endIndex: ", endIndex)

    if (startIndex !== -1 && endIndex !== -1) {
        let jsonStr = jsonString.substring(startIndex, endIndex + 1);
        jsonStr = jsonStr.replace(/\s/g, " ")
        console.log("json str", jsonStr)
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
  console.log("request:banker-signature: ", message)

  importArea.classList.add('hidden')
  bankerVerifyWithdrawal.classList.remove('hidden')

  let inputsTable = document.getElementById('banker-verify-inputs')
  let outputsTable = document.getElementById('banker-verify-outputs')

  let coin_js
  if (message.currency === "woodcoin") {
    coin_js = coinjs
  } else if (message.currency === "bitcoin") {
    coin_js = bitcoinjs
  } else if (message.currency === "litecoin") {
    coin_js = litecoinjs
  } else {
    console.log("invalid currency")
  }

  const tx = coin_js.transaction()
  const deserializeTx = tx.deserialize(message.transaction_id_for_signature)
  console.log("deserialize tx: ", deserializeTx)

  let inputs = deserializeTx.ins
  let outputs = deserializeTx.outs

  for (let i = 0; i < inputs.length; i++) {
    var s = deserializeTx.extractScriptKey(i);
    let input = inputs[i]
    console.log("s: ", s.script)
    console.log("N: ", input.outpoint.index)
    console.log(input.outpoint.hash)
    let inputs1 = document.createElement('input')
    inputs1.setAttribute('readonly', true)
    inputs1.setAttribute('class', 'md:flex px-3 bg-gray-300 text-black h-10 left-96 py-2 w-96');
    inputs1.value = input.outpoint.hash
    let row = inputsTable.insertRow();
    let txid = row.insertCell(0);
    // txid.innerHTML = input.outpoint.hash
    txid.appendChild(inputs1)
    txid.setAttribute('width', '45%')
    let inputs2 = document.createElement('input')
    inputs2.setAttribute('readonly', true)
    inputs2.setAttribute('class', 'text-black text-center');
    inputs2.value = input.outpoint.index
    let indexNo = row.insertCell(1);
    indexNo.setAttribute('class', 'text-center bg-white text-black font-semibold')
    indexNo.innerHTML = input.outpoint.index
    // indexNo.appendChild(inputs2)
    indexNo.setAttribute('width', '10%')
    let inputs3 = document.createElement('input')
    inputs3.setAttribute('readonly', true)
    inputs3.setAttribute('class', 'md:flex bg-gray-300 pl-1 h-10 text-black px-3 py-2 w-full');
    inputs3.value = s.script
    let script = row.insertCell(2);
    // script.innerHTML = s.script
    script.appendChild(inputs3)
    script.setAttribute('width', '45%')
  }

  for (let i = 0; i < outputs.length; i++) {

    let output = outputs[i]
      console.log("output: ", output)
    if(output.script.chunks.length==2 && output.script.chunks[0]==106){ // OP_RETURN

      var data = Crypto.util.bytesToHex(output.script.chunks[1]);
      var dataascii = hex2ascii(data);

      if(dataascii.match(/^[\s\d\w]+$/ig)){
        data = dataascii;
      }
      console.log("address: ", data)
      console.log("amount: ", (output.value/100000000).toFixed(8))
      console.log("script: ", Crypto.util.bytesToHex(output.script.buffer))
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

      console.log("address: ", addr)
      console.log("amount: ", (output.value/100000000).toFixed(8))
      console.log("script: ", Crypto.util.bytesToHex(output.script.buffer))
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
  signButton.addEventListener('click', () => {

    let pk = document.getElementById('banker-pivkey-for-signature')
    let privkey = pk.value
    // console.log("pk: ", privkey)
    // console.log("is valid: ", isKeyValid(privkey))
    if (privkey) {
        if (isWifKeyValid(privkey)) {
        bankerSignTransaction(message, privkey)
        } else {
          alertError('The text you entered is not a valid private key.')
        }
    } else {
      alertError('Please enter your private key for this account.')
    }

  })

})

function bankerSignTransaction(message, privkey) {
  console.log("sign tx: ", message.transaction_id_for_signature)
  console.log("user privkey: ", privkey)


  let tx
  if (message.currency === "woodcoin") {
    tx = coinjs.transaction()
  } else if (message.currency === "bitcoin") {
    tx = bitcoinjs.transaction()
  }  else if (message.currency === "litecoin") {
    tx = litecoinjs.transaction()
  }

  const scriptToSign = tx.deserialize(message.transaction_id_for_signature)
  signedTX = scriptToSign.sign(privkey, 1)

  console.log("signed: ", signedTX)

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
    console.log("close sign response message")

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


ipcRenderer.on('response:banker-signature', (e, message) => {
  console.log("response:banker-signature: ", message)

  alertSuccess("Banker signature successfully updated.")

  ownerMessageSignRequest.classList.remove('hidden')
  importArea.classList.add('hidden')

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
    // bankerForm.classList.remove('hidden')
    // bankersList.classList.remove('hidden')
    // bankerMessage.classList.add('hidden')
    importArea.classList.remove('hidden')
    ownerMessageSignRequest.classList.add('hidden')
    importText.value = ""

    showImportListScreen()
    console.log("close sign request message")
  }, false);

  buttonDiv.appendChild(closeButton)
})

ipcRenderer.on('withdrawal:ready-to-broadcast', (e, message) => {
  console.log("withdrawal:ready-to-broadcast: ", message)

  ownerWithdrawalBroadcast.classList.remove('hidden')
  importArea.classList.add('hidden')

  let withdrawalTxId = document.getElementById('owner-withdrawal-txid-for-broadcast')
  withdrawalTxId.innerHTML = message.transaction_id

  let broadcastButton = document.getElementById("owner-withdrawal-broadcast-button")
  broadcastButton.addEventListener('click', () => {
    ipcRenderer.send('withdrawal:api', message)
  })

  let closeButton = document.getElementById("owner-withdrawal-close-button")
  closeButton.addEventListener('click', () => {
    console.log("close button")

    importArea.classList.remove('hidden')
    ownerWithdrawalBroadcast.classList.add('hidden')
    importText.value = ""
    withdrawalTxId.innerHTML = ""

    showImportListScreen()
  })
})

ipcRenderer.on('withdrawal:broadcast-response', (e, res) => {
  console.log("withdrawal:broadcast-response: ", res)
  let withdrawalSuccessResponseContainer = document.getElementById('owner-withdrawal-response-success-container')
  let withdrawalErrorResponseContainer = document.getElementById('owner-withdrawal-response-error-container')

  let withdrawalTxIdResponse = document.getElementById('owner-withdrawal-txid-response')
  let withdrawalErrorResponse = document.getElementById('owner-withdrawal-error-response')

  let broadcastButton = document.getElementById("owner-withdrawal-broadcast-button")
  let closeButton = document.getElementById("owner-withdrawal-close-button")
  closeButton.addEventListener('click', () => {
    console.log("close button")
    showImportListScreen()
  })

  if(res.message){
    console.log("res message: ", res.message.result)
    withdrawalSuccessResponseContainer.classList.remove('hidden')
    withdrawalTxIdResponse.innerHTML = res.message.result

    closeButton.classList.remove('hidden')
    broadcastButton.classList.add('hidden')

    /**
      Update the account details with the withdrawal transaction
    */

  } else {
    console.log(res.error.error.message)
    withdrawalErrorResponseContainer.classList.remove('hidden')
    withdrawalErrorResponse.innerHTML = res.error.error.message

    closeButton.classList.remove('hidden')
    broadcastButton.classList.add('hidden')
  }
})



ipcRenderer.on('user:profile', (evt) => {
    const userProfile = document.getElementById('user-profile')
    const aside = document.getElementById('aside')
    const tabsContent = document.getElementById('tab-contents')
    userProfile.classList.remove('hidden')
    aside.classList.add('hidden')
    tabsContent.classList.add('hidden')
})

function getList() {
    ipcRenderer.send("balance:api", {})
}

async function createUserProfile(e) {
    e.preventDefault()
    const userName = document.getElementById('user-name').value
    const userEmail = document.getElementById('user-email').value

    /**
      Validation
    **/
    if (userName == '' || userEmail == '') {
      alertError("Name and email is required.")
      return
    } else if (userName.length > 50) {
      alertError("Name should not be more than 50 characters")
      return
    } else if (!isEmailValid) {
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
    ipcRenderer.on('create:profile', (e) => {
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
      let updatedHex = privkeyHexInput.value
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

      let pubkey = pubkeyInput.value
      message.message = "response-pubkey"
      message.pubkey = pubkey

      bankerGeneratePrivkey.classList.add('hidden')
      finalizeNewKeys(message)
    })

    return
})

function finalizeNewKeys(evt){
    // const accountUser = JSON.parse(evt)
    console.log(evt)
    const textBody = document.getElementById('text-show')
    const textId = document.getElementById('import-show')
    const textImport = document.getElementById('import-area')
    const textImportArea = document.getElementById('import-text')
    const div = document.createElement('div')
    div.setAttribute('class', 'bg-white p-3 rounded-md')
    const button = document.createElement('button')
    button.setAttribute('class', 'inline-flex items-center px-10 py-3 text-sm font-medium text-center text-white bg-orange-500 focus:ring-4 focus:ring-orange-500 dark:focus:bg-orange-500 hover:bg-orange absolute mt-5 right-10 rounded-full')
    button.setAttribute('id', "import-again-button")
    button.textContent = "Import Again"
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
    // p4.setAttribute("class", "w-10")
    p4.classList.add('whitespace-pre-wrap', 'break-all')
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
  alertSuccess("Successfully added banker's publick key.")

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
  e.preventDefault()
  let withdrawFeeInput = document.getElementById("withdraw-fee")
  let userInputtedFee = withdrawFeeInput.value

  if (unspentAmountTotal == 0) {
    alertError("No unspent selected.")
    return
  }

  /****/
  // for (let i = 0; i < getuserinput.length; i++) {
  //   let address = getuserinput[i].children[0].value
  //   let amount = getuserinput[i].children[1].value
  //
  //   userinputindex = i
  //   userinputsum += Number(amount)
  //   console.log(address, amount)
  //
  //   let isValidAddress = coinjs.addressDecode(address)
  //   if (isValidAddress == false) {
  //     alertError("Address is not valid")
  //     return
  //   } else {
  //     tx.addoutput(address, amount)
  //   }
  // }

  let change = (unspentAmountTotal - TOTAL_AMOUNT_TO_WITHDRAW).toFixed(8)
  console.log("change: ", change)
  console.log("userInputtedFee: ", userInputtedFee)

  if (unspentAmountTotal < TOTAL_AMOUNT_TO_WITHDRAW) {
    alertError("Insufficient balance. Please adjust the withdrawal amount.")
    return
  }

  if (userInputtedFee == change) {
    if (change > 0.001) {
      let text = "Current transaction fee is high. If you want to proceed, click Ok";
      if (confirm(text) == true) {
        generateClaim(0)
      } else {
        console.log("The confirmation modal is cancelled.")
      }
    } else {
      generateClaim(0)
    }
  } else if (userInputtedFee > change) {
    alertError("Transaction fee is greater than remaining amount. Please adjust.")
  } else if (userInputtedFee < change) {
    console.log("should generate change address")
    let amountToChangeAddress = unspentAmountTotal - TOTAL_AMOUNT_TO_WITHDRAW - userInputtedFee
    generateClaim(amountToChangeAddress)
  }

}

async function generateClaim(changeAmount) {
  console.log("generate claim")
  console.log("account currency: ", ACCOUNT_CURRENCY)
  //e.preventDefault()
  // const txid = document.getElementById('txid-withdraw').value
  // const vout = document.getElementById('vout-withdraw').value
  // const script = document.getElementById('script-withdraw').value
  // const amount = document.getElementById('amount-withdraw').value
  // const address = document.getElementById('withdraw-address').value
  // const amountWithdraw = document.getElementById('withdraw-amount').value
  // console.log("txid ", txid)
  // console.log('address ', address)
  // let tx = coinjs.transaction();
  // let scriptN = coinjs.script()
  // tx.addinput(txid, vout, script, amount, null)
  // tx.addoutput(address, amountWithdraw)
  // const out = await tx.serialize()
  // console.log("tx serialize", out)
  // console.log("decode tx serialize", tx.deserialize(out))
  let coin_js
  if (ACCOUNT_CURRENCY === "woodcoin") {
    coin_js = coinjs
  } else if (ACCOUNT_CURRENCY === "bitcoin") {
    coin_js = bitcoinjs
  } else if (ACCOUNT_CURRENCY === "litecoin") {
    coin_js = litecoinjs
  } else {
    console.log("invalid currency")
    return
  }

  let tx = coin_js.transaction()

  const getunspent = document.querySelectorAll('#inner-unspent')
  const getuserinput = document.querySelectorAll('#address-keys')
  //const changeAddressinput = document.getElementById('change-address')
  let userunspentindex;
  let userinputindex;
  let unspentindexsum = 0;
  let userinputsum = 0 ;
  let txRedeemTransaction;
  let accountSigFilter;
  let inputsTable = document.getElementById('banker-verify-inputs-initial')
  let outputsTable = document.getElementById('banker-verify-outputs-initial')

  // Clear input and output table
  inputsTable.innerHTML = ""
  outputsTable.innerHTML = ""

  console.log("get unspent", getunspent)
  for(let i = 0; i < getunspent.length; i++) {
    if(getunspent[i].children[5].defaultChecked) {
      userunspentindex = i
      console.log(getunspent[i].children[3].value)
      unspentindexsum += Number(getunspent[i].children[3].value)
      tx.addinput(getunspent[i].children[0].value, getunspent[i].children[1].value, getunspent[i].children[2].value, null)
    }
    // if(i === getunspent.length -1) {
    //   tx.addoutput(address, amountWithdraw)
    //   const out = await tx.serialize()
    //   console.log(out)
    // }
  }

  console.log(getuserinput)
  for (let i = 0; i < getuserinput.length; i++) {
    let address = getuserinput[i].children[0].value
    let amount = getuserinput[i].children[1].value

    userinputindex = i
    userinputsum += Number(amount)
    console.log(address, amount)

    let isValidAddress = coin_js.addressDecode(address)
    if (isValidAddress == false) {
      alertError("Address is not valid")
      return
    } else {
      tx.addoutput(address, amount)
    }
  }

  // if (changeAddressinput) {
  //   console.log("changeAddressinput amount: ", changeAddressinput.children[1].value)
  //   console.log("changeAddressinput address: ", changeAddressinput.children[0].value)
  //   userinputsum += changeAddressinput.children[1].value
  //   tx.addoutput(changeAddressinput.children[0].value, changeAddressinput.children[1].value)
  // }

  /**
    Add a change address to the tx.addoutput if change is greater than withdrawal fee
  **/
  console.log("unspentindexsum: ", unspentindexsum)
  console.log("userinputsum: ", userinputsum)

  /**
    Disabled automatic addition of change address
  **/
  // let change = unspentindexsum - userinputsum
  // console.log("change: ", change)
  // let change_amount = change - WITHDRAWAL_FEE
  // console.log("change_amount: ", change_amount)
  if (changeAmount) {
    console.log('add ouput: ', CHANGE_ADDRESS, changeAmount)
    tx.addoutput(CHANGE_ADDRESS, changeAmount)
  }
  /**End of automatically adding change address**/

  if (userunspentindex <= getunspent.length -1 && userinputindex <= getuserinput.length -1) {
    let accountDetails = document.getElementById('account-details')
    let accountWithdrawal = document.getElementById('account-withdrawal')
    let accountActions = document.getElementById('account-actions')
    let withdrawalReference = document.getElementById('withdraw-reference')
    accountDetails.classList.add('hidden')
    accountWithdrawal.classList.add('hidden')
    accountActions.classList.add('hidden')
    withdrawalReference.classList.remove('hidden')
    txRedeemTransaction = tx.serialize();
    // console.log("redeem script", getunspent[0].children[4].value)
    ipcRenderer.send('getredeemscript:redeemscript', {"script": getunspent[0].children[4].value});
    const deserializeTx = tx.deserialize(tx.serialize())
    console.log("deserialize tx: ", deserializeTx)
    console.log("txRedeemTransaction: ", txRedeemTransaction)
    console.log("tx size: ", tx.size())
    let inputs = deserializeTx.ins
    let outputs = deserializeTx.outs

    for (let i = 0; i < inputs.length; i++) {
      var s = deserializeTx.extractScriptKey(i);
      let input = inputs[i]
      console.log("s: ", s.script)
      console.log("N: ", input.outpoint.index)
      console.log(input.outpoint.hash)

      // let row = inputsTable.insertRow();
      // let txid = row.insertCell(0);
      // txid.innerHTML = input.outpoint.hash
      // txid.setAttribute('width', '45%')
      // let indexNo = row.insertCell(1);
      // indexNo.innerHTML = input.outpoint.index
      // indexNo.setAttribute('width', '10%')
      // let script = row.insertCell(2);
      // script.innerHTML = s.script
      // script.setAttribute('width', '45%')
      let inputs1 = document.createElement('input')
      inputs1.setAttribute('readonly', true)
      inputs1.setAttribute('class', 'md:flex px-3 bg-gray-300 text-black h-10 left-96 py-2 w-96');
      inputs1.value = input.outpoint.hash
      let row = inputsTable.insertRow();
      let txid = row.insertCell(0);
      // txid.innerHTML = input.outpoint.hash
      txid.appendChild(inputs1)
      txid.setAttribute('width', '45%')
      let inputs2 = document.createElement('input')
      inputs2.setAttribute('readonly', true)
      inputs2.setAttribute('class', 'text-black text-center');
      inputs2.value = input.outpoint.index
      let indexNo = row.insertCell(1);
      indexNo.setAttribute('class', 'text-center bg-white text-black font-semibold')
      indexNo.innerHTML = input.outpoint.index
      // indexNo.appendChild(inputs2)
      indexNo.setAttribute('width', '10%')
      let inputs3 = document.createElement('input')
      inputs3.setAttribute('readonly', true)
      inputs3.setAttribute('class', 'md:flex bg-gray-300 pl-1 h-10 text-black px-3 py-2 w-full');
      inputs3.value = s.script
      let script = row.insertCell(2);
      // script.innerHTML = s.script
      script.appendChild(inputs3)
      script.setAttribute('width', '45%')
    }

    for (let i = 0; i < outputs.length; i++) {

      let output = outputs[i]
        console.log("output: ", output)
      if(output.script.chunks.length==2 && output.script.chunks[0]==106){ // OP_RETURN

        var data = Crypto.util.bytesToHex(output.script.chunks[1]);
        var dataascii = hex2ascii(data);

        if(dataascii.match(/^[\s\d\w]+$/ig)){
          data = dataascii;
        }
        console.log("address: ", data)
        console.log("amount: ", (output.value/100000000).toFixed(8))
        console.log("script: ", Crypto.util.bytesToHex(output.script.buffer))
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
          coin_js.pub = pub;
        }

        console.log("address: ", addr)
        console.log("amount: ", (output.value/100000000).toFixed(8))
        console.log("script: ", Crypto.util.bytesToHex(output.script.buffer))
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
    ipcRenderer.on('account:filterSig', (e, evt) => {
      console.log(evt)
      accountSigFilter = evt
    })

    const generateButton = document.getElementById('generate-request-signature-message')
    generateButton.addEventListener('click', function() {
      requestSignatureWindow(txRedeemTransaction, accountSigFilter)
    }, false)
  } else {
    console.log("userunspentindex: ", userunspentindex)
    console.log("getunspent.length -1: ", getunspent.length -1)
    console.log("userinputindex: ", userinputindex)
    console.log("getuserinput.length -1: ", getuserinput.length -1)
  }


  // if (userinputsum > unspentindexsum) {
  //   alertError("You are spending more than you have")
  // }

}

function requestSignatureWindow(tx, account) {

  // Clear withdraw address and amount input
  let withdrawAddrInput = document.getElementById('withdraw-address')
  let withdrawAmtInput = document.getElementById('withdraw-amount')
  let withdrawFeeInput = document.getElementById('withdraw-fee')

  withdrawAddrInput.value = ""
  withdrawAmtInput.value = ""
  withdrawAmtInput.value = 0

  let withdrawalID = Date.now()
  let accountDetails = document.getElementById('account-details')
  let accountWithdrawal = document.getElementById('account-withdrawal')
  let accountActions = document.getElementById('account-actions')
  let withdrawalReference = document.getElementById('withdraw-reference')
  let sendSignature = document.getElementById('send-signature')
  let messageSignature = document.getElementById('request-sig-message')
  messageSignature.innerHTML = ""
  accountDetails.classList.add('hidden')
  accountWithdrawal.classList.add('hidden')
  accountActions.classList.add('hidden')
  withdrawalReference.classList.add('hidden')
  sendSignature.classList.remove('hidden')
  console.log("tx: ", tx)
  console.log("account: ", typeof(account))
  const accountParse = JSON.parse(account)
  console.log("account parse: ", accountParse)
  const br = document.createElement('br')
  const p1 = document.createElement('p')
  p1.innerHTML = "Please copy the line below and send it to" + " " + accountParse[0].bankers[0].banker_email
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
  p8.innerHTML = '"banker_id":' + accountParse[0].bankers[0].banker_id + ','
  const p9 = document.createElement('p')
  p9.innerHTML = '"creator_name":' + '"' + accountParse[0].creator_name + '",'
  const p10 = document.createElement('p')
  p10.innerHTML = '"creator_email":' + '"' + accountParse[0].creator_email + '",'
  const p11 = document.createElement('p')
  p11.innerHTML = '"banker_name":' + '"' + accountParse[0].bankers[0].banker_name + '",'
  const p12 = document.createElement('p')
  p12.innerHTML = '"banker_email":' + '"' + accountParse[0].bankers[0].banker_email + '",'
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
  console.log("action data: ", data)
  const newWithdrawal = {
    id: withdrawalID,
    signatures: [
      data
    ]
  }
  accountParse[0].withdrawals.push(newWithdrawal)
  ipcRenderer.send('signature:encode', {"id": accountParse[0].contract_id, "contract": accountParse[0]})
  // console.log("new account parse", JSON.stringify(accountParse[0]))
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
  console.log("export users data")
  ipcRenderer.send("export:get-data", {})
}

function browseDirectory() {
  console.log("click event for the file browser")
  //inputFileBrowser.click()
  let dir = browser.downloads.showDefaultFolder();
  console.log("dir: ", dir)
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
  div.appendChild(p1)
  div.appendChild(p2)
  div.appendChild(p3)

  backupMessageBody.appendChild(div)

  closeBtn.addEventListener("click", function() {

    console.log("close back up screen")
    backupBtnContainer.classList.remove('hidden')
    backupMessageContainer.classList.add('hidden')

    showImportListScreen()
  }, false);
})


ipcRenderer.on('response:import-json', (e) => {
  alertSuccess("Successfully imported FSCB data.")
  const textarea = document.getElementById('import-text');
  textarea.innerHTML = ""
})


// importText.addEventListener("change", loadText);
formCreateAccount.addEventListener("submit", saveAndCreateText);
importTextForm.addEventListener('submit', parseTextArea);
userProfileForm.addEventListener('submit', createUserProfile);
withdrawalAddBtn.addEventListener('click', () => {addOrDelete('address-keys')});
//minusButton.addEventListener('click', deleteInput);
formAddBanker.addEventListener('submit', addBanker);
getbankerClick.addEventListener('click', getBanker)
getListClick.addEventListener('click', getList)
importTextButton.addEventListener('click', openImportTextTab)
getbankerClick.addEventListener('click', getBanker);
getListClick.addEventListener('click', getList);
formWithdraw.addEventListener('submit', checkTxFee);
donateBtn.addEventListener('click', addDonationAddress);
exportBtn.addEventListener('click', exportJsonData);
sendSignatureCloseBtn.addEventListener('click', closeSendSignatureScreen)
//browseBtn.addEventListener('click', browseDirectory)
