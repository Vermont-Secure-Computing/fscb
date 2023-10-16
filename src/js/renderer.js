// var keys = ["02a580990522b85a9d842669f0950a615c061ec6916f32b8b3461efe58985c0cb4", "02bb3d790f459a017c11002a80671e8fc6213675b8845044996f51690011d7bdb0", "03d2fb8b133858b2a5b70e884451f2eaa23064e3dc9f77e417b317bed014f30dfc"]
// var sigsNeeded = 2
//  var multisig =  coinjs.pubkeys2MultisigAddress(keys, sigsNeeded);
//  console.log(multisig)





//  Start Tab Pannels

const importText =   document.getElementById('import-text');
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
const addMinus = document.getElementsByClassName('pubkeyAdd')[0]
console.log(addMinus)
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
let fifthTab = document.getElementById('fifth')

/**
  Import Text screen
**/
let importArea = document.getElementById('import-area')
let bankerVerifyWithdrawal = document.getElementById('banker-verify-withdrawal')
let bankerMessageSignTx = document.getElementById('banker-message-signtx-container')
let ownerMessageSignRequest = document.getElementById('owner-message-sign-request-container')



// console.log(getListClick)
// const accountList = document.getElementById('accounts-list');

const sigNumber = document.getElementById('releaseCoins');
const currency = document.getElementById('coin-currency')
let tabsContainer = document.getElementById('tabs');
let tabTogglers = tabsContainer.querySelectorAll("aside #tabs a");
let bankersArray
let openTab
let selectedAccountDetails = {}
let USER = {}
let BANKERS


getUserData()
tabTogglers.forEach(function(toggler) {
    toggler.addEventListener("click", function(e) {
        e.preventDefault();
        console.log('click button')
        importTextTab.classList.add('hidden')
        let tabName = this.getAttribute("href");
        openTab = tabName;
        if (tabName === "#first") {
            ipcRenderer.send("balance:api", {"send": "get"})
            let accountList = document.getElementById('accounts-list')
            let accountDetails = document.getElementById('account-details')
            let accountActions = document.getElementById('account-actions')
            let accountWithdrawal = document.getElementById('account-withdrawal')

            accountList.classList.remove("hidden")
            accountDetails.classList.add("hidden")
            accountActions.classList.add("hidden")
            accountWithdrawal.classList.add("hidden")
        }
        if (tabName === "#addbanker") {
            getBanker()
            //getUserData()
        }
        let tabContents = document.querySelector("#tab-contents");

        for (let i = 0; i < tabContents.children.length-1; i++) {
          tabTogglers[i].parentElement.classList.remove("bg-gradient-to-l", "from-gray-500");
          tabContents.children[i].classList.remove("hidden");
          if ("#" + tabContents.children[i].id === tabName) {
              continue;
          }
          tabContents.children[i].classList.add("hidden");

        }
        e.target.parentElement.classList.add("bg-gradient-to-l", "from-gray-500");
    });
});

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

async function saveAndCreateText(e) {
    e.preventDefault();
    // console.log(contractName.value, " ", creatorName.value, " ", creatorEmail.value)
    const contractSendName = contractName.value;
    const creatorSendName = USER.user_name;
    const creatorSendEmail = USER.user_email;

    coinjs.compressed = true
    const creatorAddressDetail = await coinjs.newKeys()
    // console.log("New Key ", creatorAddressDetail)
    const sigSendNumber = sigNumber.options[sigNumber.selectedIndex].text;
    const coinCurrencySend = currency.options[currency.selectedIndex].text;
    const innerMultiKey = document.querySelectorAll('.active a')
    console.log(innerMultiKey)

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
    console.log["banker merge ", bankersMerge]
    const keys = bankersMerge;
    const multisig =  coinjs.pubkeys2MultisigAddress(keys, sigSendNumber);
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
  importTextTab.classList.add('hidden')
  firstTab.classList.remove('hidden')
  secondTab.classList.add('hidden')
  addBankerTab.classList.add('hidden')
  thirdTab.classList.add('hidden')
  fourthTab.classList.add('hidden')
  fifthTab.classList.add('hidden')

  let tabContents = document.querySelector("#tab-contents");
  for (let i = 0; i < tabContents.children.length-1; i++) {
    tabTogglers[i].parentElement.classList.remove("bg-gradient-to-l", "from-gray-500");
  }
  let accountListTab = document.getElementById('account-list-tab')
  accountListTab.classList.add("bg-gradient-to-l", "from-gray-500");
})

ipcRenderer.on("list:file", function(e, evt){
    //console.log(e)
    const convertToJson = JSON.parse(evt)
    // console.log(convertToJson)
    // let text = ""
    // const container = document.getElementById('data-container')
    // text+='<tr>'
    // for(let x in convertToJson) {
    //     if(convertToJson.hasOwnProperty(x)){
    //         // console.log(convertToJson[x].email)
    //         text+="<td>" + convertToJson[x].email + "</td>"
    //     }
    // }
    // text+="</tr>"
    // // console.log(text)
    // // const stuff = convertToJson.map((item) => `<p>${item.firstname}<p>`)
    // container.innerHTML = text
    const accountBody = document.getElementById('accounts-list-body')
    // let accountTr = document.createElement('tr')
    // accountTr.setAttribute('class', 'border-b dark:border-neutral-500')
    // let accountTd = document.createElement('td')
    // accountTd.setAttribute('class', 'whitespace-nowrap px-6 py-4')
    // let accountTd1 = document.createElement('td')
    // accountTd1.setAttribute('class', 'whitespace-nowrap px-6 py-4')
    // let accountTd2 = document.createElement('td')
    // accountTd2.setAttribute('class', 'whitespace-nowrap px-6 py-4')
    // let respub;
    accountBody.innerHTML = ""
    for(let x in convertToJson) {
        if(convertToJson.hasOwnProperty(x)){
            //console.log("convert to json", convertToJson[x])
            // ipcRenderer.send("get:balance", {"pubkey": convertToJson[x].address})
            let row = accountBody.insertRow();
            let name = row.insertCell(0);
            name.setAttribute('class', 'pl-6')
            name.innerHTML = convertToJson[x].contract_name
            let address = row.insertCell(1);
            address.innerHTML = convertToJson[x].address
            let balance = row.insertCell(2);
            balance.setAttribute('class', 'text-center')
            balance.innerHTML = convertToJson[x].balance
            let veiwall = row.insertCell(3)
            veiwall.setAttribute('class', 'text-center')
            let viewAccountDetailsButton = document.createElement('button')
            viewAccountDetailsButton.setAttribute('class', "px-5 py-0.5 font-small text-white bg-orange-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-orange-500 hover:bg-orange-500 rounded-full")
            viewAccountDetailsButton.innerHTML = "view"
            veiwall.appendChild(viewAccountDetailsButton)
            //viewAccountDetailsButton.addEventListener('click', getAccountDetails)
            let details = convertToJson[x]
            viewAccountDetailsButton.addEventListener("click", function() {getAccountDetails(details);}, false);
            // ipcRenderer.on('response:balance', function(e, arg) {
            //     console.log(e)
            //     if (e.error) {
            //         balance.innerHTML = 0
            //     } else {
            //         balance.innerHTML = e
            //     }
            //     // ipcRenderer.removeAllListeners('get:balance');
            //     // ipcRenderer.removeAllListeners('response:balance');
            //     // ipcRenderer.removeAllListeners('list:file');
            // })

            // if(convertToJson.hasOwnProperty(x)){
            //     console.log(convertToJson[x].contract_name)
            //     // text+="<td>" + convertToJson[x].email + "</td>"
            // }
            // ipcRenderer.removeAllListeners('get:balance');
            // ipcRenderer.removeAllListeners('response:balance');
            // ipcRenderer.removeAllListeners('list:file');
        }
    }
    // accountTr.appendChild(accountTd)
    // accountTr.appendChild(accountTd1)
    // accountTr.appendChild(accountTd2)
    // accountBody.appendChild(accountTr)

})

function listAccountActions(actions){
  console.log("actions: ", actions)
  let accountDetails = document.getElementById('account-details')
  let accountWithdrawal = document.getElementById('account-withdrawal')
  let accountActions = document.getElementById('account-actions')
  accountDetails.classList.add("hidden")
  accountWithdrawal.classList.add("hidden")
  accountActions.classList.remove("hidden")
}

function outputsAddress(e) {
  console.log(e)

}

function accountWithdrawal(address){
  console.log("withdrawal: ", address.address)
  ipcRenderer.send("unspent:api", address.address)
  const script = coinjs.script()
  const addressScript = script.decodeRedeemScript(address.redeemscript)
  console.log("redeem script res ", addressScript)
//   let combinedList = []
  let accountDetails = document.getElementById('account-details')
  let accountWithdrawal = document.getElementById('account-withdrawal')
  let accountActions = document.getElementById('account-actions')
  let unspentdiv = document.getElementById('list-unspent')
  // let getuserinput = document.getElementsByClassName('user-input-amount')
  // console.log("get user input", getuserinput)
  let unspentAmountTotal = 0
  let userInputAmountTotal = 0
  let tx = coinjs.transaction();
  accountDetails.classList.add("hidden")
  accountWithdrawal.classList.remove("hidden")
  accountActions.classList.add("hidden")
  ipcRenderer.on('unspent:address', (e, evt) => {
    // const listParse = JSON.parse(evt)
    const listP = evt;
    // console.log(typeof(evt))
    for (let i = 0; i < listP.length; i++) {
        console.log(listP[i].txid)
        unspentAmountTotal += listP[i].amount
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
        div.setAttribute('class', 'grid md:grid-cols-3 gap-3')
        let input1 = document.createElement('input')
        input1.setAttribute('class', 'txid-withdraw, text-black')
        input1.setAttribute('id', 'txid-withdraw')
        input1.value = listP[i].txid
        let input2 = document.createElement('input')
        input2.setAttribute('class', 'text-black')
        input2.setAttribute('class', 'hidden')
        input2.setAttribute('id', 'vout-withdraw')
        input2.value = listP[i].vout
        let input3 = document.createElement('input')
        input3.setAttribute('class', 'text-black')
        input3.setAttribute('class', 'hidden')
        input3.setAttribute('id', 'script-withdraw')
        input3.value = addressScript.redeemscript
        let input4 = document.createElement('input')
        input4.setAttribute('class', 'text-black')
        input4.setAttribute('id', 'amount-withdraw')
        input4.value = listP[i].amount
        let check = document.createElement('input')
        check.setAttribute('type', 'checkbox')
        check.setAttribute('checked', '')
        check.addEventListener('change', (e, evt) => {
          console.log("e testing ", e)
          console.log("evt testing ", evt)
          if(e.target.defaultChecked) {
            check.removeAttribute('checked', '')
          } else {
            check.setAttribute('checked', '')
          }
        })
        div.appendChild(input1)
        div.appendChild(input2)
        div.appendChild(input3)
        div.appendChild(input4)
        div.appendChild(check)
        unspentdiv.appendChild(div)
    }
    console.log("total unspent: ", unspentAmountTotal)
  })
}

function getAccountDetails(account){
  console.log("get account details: ", account)
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
        let signature = row.insertCell(3);
        signature.innerHTML = bankers[x].signature ? bankers[x].signature : 'no signature yet'
      }
    }

    // Generate action and withdrawal buttons
    let buttonContainer = document.getElementById('account-buttons')
    buttonContainer.innerHTML = ''

    let viewActionsButton = document.createElement('button')
    viewActionsButton.classList.add("inline-flex", "items-center", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "text-white", "bg-orange-500", "rounded-full", "focus:ring-4", "focus:ring-yellow-200", "dark:focus:ring-yellow-900", "hover:bg-yellow-800")
    viewActionsButton.innerHTML = "Actions"
    let actions = account.signatures
    viewActionsButton.addEventListener("click", function() {listAccountActions(actions);}, false);

    let withdrawalButton = document.createElement('button')
    withdrawalButton.classList.add("inline-flex", "items-center", "m-2", "px-5", "py-2.5", "text-sm", "font-medium", "text-center", "text-white", "bg-orange-500", "rounded-full", "focus:ring-4", "focus:ring-yellow-200", "dark:focus:ring-yellow-900", "hover:bg-yellow-800")
    withdrawalButton.innerHTML = "Withdrawal"
    let address = {
        "address": account.address,
        "redeemscript": account.redeem_script
    }
    withdrawalButton.addEventListener("click", function() {accountWithdrawal(address);}, false);


    buttonContainer.appendChild(viewActionsButton)
    buttonContainer.appendChild(withdrawalButton)

  }
}

// ipcRenderer.on('list:file', function(evt) {
//     console.log(evt)
//     const accountBody = document.getElementById('accounts-list-body')
//     const accountTr = document.createElement('tr')

// })

function addOrDelete(e) {
    console.log("click add or delete")
    const mainKey = document.getElementById('address-amount')
    // let displayButton = document.querySelector("form button");
    // // const bankers = document.querySelectorAll('.banker')
    // // if (bankers.length >= 28 ) return;
    // // innerKey.getElementsByClassName('green')[0]
    // // const clone = '<div class="grid md:grid-cols-7 md:gap-6" id="multikeysInner">'+innerKey.innerHTML+'</div>'
    // // mainKey.innerHTML += clone
    // // document.getElementById('multikeys', 'img-anchor').dataset('./assets/imgs/minus.svg')
    let div = document.createElement('div');
    div.setAttribute("class", "grid md:grid-cols-3 gap-2");
    div.setAttribute('id', 'address-keys')
    // // let input1 = document.createElement('input')
    // // input1.setAttribute('class', 'col-span-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 banker-name')
    // // input1.setAttribute('placeholder', 'Bankers Name')
    // // input1.setAttribute('required', '')
    // // let input2 = document.createElement('input')
    // // input2.setAttribute('class', 'col-span-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 banker-email')
    // // input2.setAttribute('placeholder', 'Bankers Email')
    // // input2.setAttribute('required', '')
    // let select = document.createElement('select')
    // select.setAttribute('name', 'banker-name1')
    // select.setAttribute('id', 'bankers-name')
    // select.setAttribute('class', 'col-span-6 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500')
    // let option = document.createElement('option')
    // option.setAttribute('value', '')
    // option.setAttribute('disabled', 'disabled')
    // option.setAttribute('hidden', 'hidden')
    // option.setAttribute('selected', 'selected')
    // option.innerHTML = "Choose Banker"
    // select.appendChild(option)
    // // option.setAttribute('data-dept', 'Choose Banker')
    // for (const key in bankersArray) {
    //     const opt = bankersArray[key].banker_email
    //     console.log(opt)
    //     let option1 = document.createElement('option')
    //     option1.textContent = opt;
    //     option1.value = opt;
    //     select.appendChild(option1)
    // }
    // let anchor = document.createElement('a')
    // anchor.setAttribute('class', 'pubkeyRemove')
    // let minus = document.createElement('object')
    // minus.setAttribute('data', './images/minus.svg')
    // minus.setAttribute('width', '50')
    // minus.setAttribute('height', '50')
    // minus.setAttribute('class', 'red')
    // anchor.appendChild(minus)
    // div.appendChild(select)
    // // div.appendChild(input2)
    // div.appendChild(anchor)
    // mainKey.appendChild(div)
    let input1 = document.createElement('input')
    input1.setAttribute('class', 'text-black col-span-1 mt-2')
    input1.setAttribute('placeholder', 'Enter Address')
    let input2 = document.createElement('input')
    input2.addEventListener('onchange', ()=> {console.log("amount: ", input2.value)})
    input2.setAttribute('class', 'text-black col-span-1 mt-2 user-input-amount')
    input2.setAttribute('placeholder', 'Enter Amount')
    let anchor = document.createElement('a')
    anchor.setAttribute('class', 'pubkeyRemove')
    let minus = document.createElement('object')
    minus.setAttribute('data', './images/minus.svg')
    minus.setAttribute('width', '50')
    minus.setAttribute('height', '50')
    minus.setAttribute('class', 'red')
    anchor.appendChild(minus)
    div.appendChild(input1)
    div.appendChild(input2)
    div.appendChild(anchor)
    mainKey.appendChild(div)
}

function amountOnchange(amount) {
  console.log('amount change: ', amount)
}


let withdrawAmountInput = document.getElementById('withdraw-amount')
console.log("withdrawAmountInput: ", withdrawAmountInput.value)
withdrawAmountInput.addEventListener('input', amountOnchange(withdrawAmountInput.value))

function deleteInput(e) {
    const remove = e.target.classList.contains('pubkeyRemove')
    console.log(e.target)
    if (!remove) return;
    const removeEl = e.target.parentNode;
    document.getElementById('address-amount').removeChild(removeEl);
}

function addBanker(e) {
    e.preventDefault()
    // const mainBankerDiv = document.getElementById('addbanker')
    const nameInput = document.getElementById('banker-name-add')
    const emailInput = document.getElementById('banker-email-add')

    // Get value of selected currency
    var selectElement = document.querySelector('#banker-currency');
    var bankerCurrency = selectElement.value;

    const bankerName = nameInput.value
    const bankerEmail = emailInput.value

    /**
      Add banker form validation
    **/
    if (bankerName == "" || bankerEmail == "") {
      console.log("User name and email is required.")
      alertError("User name and email is required.")
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
    let bankersList = document.getElementById('bankers-list')
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
      "message": "request_pubkey",
      "creator_name": USER.user_name,
      "creator_email": USER.user_email,
      "banker_id": 5,
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
      select.setAttribute('multiple', '');
      select.dataset.placeholder = 'Choose Bankers'

      // Add the select component to the select container
      selectDiv.appendChild(select)

      // Get the selected value for contract currency
      // And filter bankers array with the value
      select.options.length = 0
      for(const key in bankersArray) {
        if(bankersArray[key].pubkey){
          const opt = bankersArray[key].banker_email;
          const pub = bankersArray[key].pubkey;
          const el = document.createElement("option");
          el.textContent = opt;
          el.value = pub;
          el.setAttribute('class', 'optionForSelection')
          select.appendChild(el);
        }
      }

      const selectOptions = select.querySelectorAll('option');
      const newSelect = document.createElement('div');
      newSelect.setAttribute('class', 'selectMultiple')
      const active = document.createElement('div');
      active.classList.add('active');
      const optionList = document.createElement('ul');
      const placeholder = select.dataset.placeholder;

      const span = document.createElement('span');
      span.innerText = placeholder;
      active.appendChild(span);

      selectOptions.forEach((option) => {
          //console.log(option)
          let text = option.innerText;
          if(option.selected){
              let tag = document.createElement('a');
              tag.dataset.value = option.value;
              tag.innerHTML = "<em>"+text+"</em><i></i>";
              active.appendChild(tag);
              span.classList.add('hide');
          }else{
              let item = document.createElement('li');
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
              a.dataset.value = li.dataset.value;
              a.innerHTML = "<em>"+li.innerText+"</em><i></i>";
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
                  li.dataset.value = a.dataset.value;
                  li.innerText = a.querySelector('em').innerText;
                  li.classList.add('show');
                  select.querySelector('ul').appendChild(li);
                  setTimeout(() => {
                      if(!selectEl.selectedOptions.length){
                          select.querySelector('span').classList.remove('hide');
                      }
                      li.className = '';
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
    if (startIndex !== -1 && endIndex !== -1) {
        let jsonStr = jsonString.substring(startIndex, endIndex + 1);
        jsonStr = jsonStr.replace(/\s/g, " ")
        console.log(typeof(jsonStr))
        ipcRenderer.send("banker:addorsig", jsonStr)
    }
}


/**
BANKER
-----Begin fscb message-----
{"header": "free_state_central_bank",
"message":"request-signature",
"id": "3607096450",
"account_name": "more list contract",
"banker_id": "8",
 "creator_name": "Robert Gludo",
 "creator_email": "robert@email.com",
"banker_name": "gripter",
 "banker_email": "gripter@email.com",
"transaction_id_for_signature":"0100000003658b21a68ca8f9fceb7c5051b53be3b46b88111f24648afebb6dd0bf144270780000000069522103417eb8968ac166dd9586f24fef4889fda053b251a886761cb9003d41fc3dd4ea2103577b26b2ced3512d76bc65efae1f32bee2b1fee422a146e5f59fa704d7c7f9de2102d25fb998eb19a2be9e33fdb62d0d779b9cf45f868fcf87988ad7682c0a1a611653ae00e1f5057ef7db4eb47c24191c2f650fdb4361ce932a2f7f9cac8f49a881a0ca5c96471d0000000069522103417eb8968ac166dd9586f24fef4889fda053b251a886761cb9003d41fc3dd4ea2103577b26b2ced3512d76bc65efae1f32bee2b1fee422a146e5f59fa704d7c7f9de2102d25fb998eb19a2be9e33fdb62d0d779b9cf45f868fcf87988ad7682c0a1a611653ae00e1f505627b5a06e8521614c0886d167bff911a5a137c5ce8ce538954b835ba0a5ce6c30000000069522103417eb8968ac166dd9586f24fef4889fda053b251a886761cb9003d41fc3dd4ea2103577b26b2ced3512d76bc65efae1f32bee2b1fee422a146e5f59fa704d7c7f9de2102d25fb998eb19a2be9e33fdb62d0d779b9cf45f868fcf87988ad7682c0a1a611653ae00c2eb0b01c041c817000000001976a914aac6a113dc48cd1a26dd55c68323bb4ec68f9b0f88ac00000000",
"currency":"woodcoin"}
-----End fscb message-----



-----Begin fscb message-----
{
  "header": "free_state_central_bank",
  "message": "response-signature-stargazer-robert@email.com-2797298723",
  "id": "3607096450",
  "account_name": "more list contract",
  "banker_id": "8",
  "creator_name": "Robert Gludo",
  "creator_email": "robert@email.com",
  "banker_name": "gripter",
  "banker_email": "gripter@email.com",
  "currency": "woodcoin",
  "transaction_id": "0100000003658b21a68ca8f9fceb7c5051b53be3b46b88111f24648afebb6dd0bf14427078000000006c004c69522103417eb8968ac166dd9586f24fef4889fda053b251a886761cb9003d41fc3dd4ea2103577b26b2ced3512d76bc65efae1f32bee2b1fee422a146e5f59fa704d7c7f9de2102d25fb998eb19a2be9e33fdb62d0d779b9cf45f868fcf87988ad7682c0a1a611653ae00e1f5057ef7db4eb47c24191c2f650fdb4361ce932a2f7f9cac8f49a881a0ca5c96471d000000006c004c69522103417eb8968ac166dd9586f24fef4889fda053b251a886761cb9003d41fc3dd4ea2103577b26b2ced3512d76bc65efae1f32bee2b1fee422a146e5f59fa704d7c7f9de2102d25fb998eb19a2be9e33fdb62d0d779b9cf45f868fcf87988ad7682c0a1a611653ae00e1f505627b5a06e8521614c0886d167bff911a5a137c5ce8ce538954b835ba0a5ce6c3000000006c004c69522103417eb8968ac166dd9586f24fef4889fda053b251a886761cb9003d41fc3dd4ea2103577b26b2ced3512d76bc65efae1f32bee2b1fee422a146e5f59fa704d7c7f9de2102d25fb998eb19a2be9e33fdb62d0d779b9cf45f868fcf87988ad7682c0a1a611653ae00c2eb0b01c041c817000000001976a914aac6a113dc48cd1a26dd55c68323bb4ec68f9b0f88ac00000000"
}
-----End fscb message-----
**/

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

  const tx = coinjs.transaction()
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

    let row = inputsTable.insertRow();
    let txid = row.insertCell(0);
    txid.innerHTML = input.outpoint.hash
    txid.setAttribute('width', '45%')
    let indexNo = row.insertCell(1);
    indexNo.innerHTML = input.outpoint.index
    indexNo.setAttribute('width', '10%')
    let script = row.insertCell(2);
    script.innerHTML = s.script
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
        addr = coinjs.scripthash2address(Crypto.util.bytesToHex(output.script.chunks[2]));
      } else if((output.script.chunks.length==2) && output.script.chunks[0]==0){
        addr = coinjs.bech32_encode(coinjs.bech32.hrp, [coinjs.bech32.version].concat(coinjs.bech32_convert(output.script.chunks[1], 8, 5, true)));
      } else {
        var pub = coinjs.pub;
        coinjs.pub = coinjs.multisig;
        addr = coinjs.scripthash2address(Crypto.util.bytesToHex(output.script.chunks[1]));
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
  signButton.addEventListener('click', () => {bankerSignTransaction(message)})

})

function bankerSignTransaction(message) {
  console.log("sign tx: ", message.transaction_id_for_signature)
  console.log("user privkey: ", USER.privkey)

  const tx = coinjs.transaction()
  const scriptToSign = tx.deserialize(message.transaction_id_for_signature)
  const signedTX = scriptToSign.sign(USER.privkey, "ALL")

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
  p1.innerHTML = USER.user_name + " response for your withdrawal signature request for " + message.account_name;
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
    // bankerForm.classList.remove('hidden')
    // bankersList.classList.remove('hidden')
    // bankerMessage.classList.add('hidden')
    console.log("close sign response message")
  }, false);
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
  p1.innerHTML = USER.user_name + " is requesting for a withdrawal transaction from " + message.account_name;
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
    console.log("close sign request message")
  }, false);
})

ipcRenderer.on('withdrawal:ready-to-broadcast', (e, message) => {
  console.log("withdrawal:ready-to-broadcast: ", message)
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
    coinjs.compressed = true
    const userAddress = await coinjs.newKeys()
    console.log(userAddress)
    ipcRenderer.send("user:address", {
        userName,
        userEmail,
        userAddress
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

ipcRenderer.on('response:pubkey', (e, evt) => {
    // const accountUser = JSON.parse(evt)
    console.log(evt)
    const textBody = document.getElementById('text-show')
    const textId = document.getElementById('import-show')
    const textImport = document.getElementById('import-area')
    const textImportArea = document.getElementById('import-text')
    const div = document.createElement('div')
    div.setAttribute('class', 'bg-white p-3 rounded-md')
    const button = document.createElement('button')
    button.setAttribute('class', 'py-2 px-3 rounded bg-orange-500')
    button.setAttribute('id', "import-again-button")
    button.textContent = "Import Again"
    const p = document.createElement('p')
    const br = document.createElement('br')
    const p1 = document.createElement('p')
    const p2 = document.createElement('p')
    const p3 = document.createElement('p')
    const p4 = document.createElement('p')
    const p5 = document.createElement('p')
    textId.classList.remove('hidden')
    textImport.classList.add('hidden')
    textImportArea.value = ''
    p.innerHTML = "Please copy the line below and send it to " + evt.creator_name;
    p1.innerHTML = evt.banker_name + "public key response to" + evt.creator_name + "request";
    p2.innerHTML = "Please copy the message inside and import in FSCB";
    p3.innerHTML = "-----Begin fscb message-----";
    p4.innerHTML = JSON.stringify(evt);
    p5.innerHTML = "-----End fscb message-----";
    // p4.setAttribute("class", "w-10")
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
});

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

async function generateClaim(e) {
  e.preventDefault()
  // const txid = document.getElementById('txid-withdraw').value
  // const vout = document.getElementById('vout-withdraw').value
  // const script = document.getElementById('script-withdraw').value
  // const amount = document.getElementById('amount-withdraw').value
  const address = document.getElementById('withdraw-address').value
  const amountWithdraw = document.getElementById('withdraw-amount').value
  // console.log("txid ", txid)
  // console.log('address ', address)
  // let tx = coinjs.transaction();
  // let scriptN = coinjs.script()
  // tx.addinput(txid, vout, script, amount, null)
  // tx.addoutput(address, amountWithdraw)
  // const out = await tx.serialize()
  // console.log("tx serialize", out)
  // console.log("decode tx serialize", tx.deserialize(out))
  let tx = coinjs.transaction()
  const getunspent = document.querySelectorAll('#inner-unspent')
  const getuserinput = document.querySelectorAll('#address-keys')
  let userunspentindex;
  let userinputindex;
  let unspentindexsum = 0;
  let userinputsum = 0 ;
  console.log(getunspent)
  for(let i = 0; i < getunspent.length; i++) {
    if(getunspent[i].children[4].defaultChecked) {
      userunspentindex = i
      unspentindexsum += getunspent[i].children[3].value
      tx.addinput(getunspent[i].children[0].value, getunspent[i].children[1].value, getunspent[i].children[2].value, getunspent[i].children[3].value, null)
    }
    // if(i === getunspent.length -1) {
    //   tx.addoutput(address, amountWithdraw)
    //   const out = await tx.serialize()
    //   console.log(out)
    // }
  }
  console.log(getuserinput)
  for (let i = 0; i < getuserinput.length; i++) {
    userinputindex = i
    userinputsum += getuserinput[i].children[1].value
    tx.addoutput(getuserinput[i].children[0].value, getuserinput[i].children[1].value)
  }

  if (userunspentindex === getunspent.length -1 && userinputindex === getuserinput.length -1) {
    console.log(tx.serialize())
  }

  if (userinputsum > unspentindexsum) {
    alertError("You are spending more than you have")
  }

}







// importText.addEventListener("change", loadText);
formCreateAccount.addEventListener("submit", saveAndCreateText);
importTextForm.addEventListener('submit', parseTextArea);
userProfileForm.addEventListener('submit', createUserProfile);
addMinus.addEventListener('click', addOrDelete);
minusButton.addEventListener('click', deleteInput);
formAddBanker.addEventListener('submit', addBanker);
getbankerClick.addEventListener('click', getBanker)
getListClick.addEventListener('click', getList)
importTextButton.addEventListener('click', openImportTextTab)
getbankerClick.addEventListener('click', getBanker);
getListClick.addEventListener('click', getList);
formWithdraw.addEventListener('submit', generateClaim);
