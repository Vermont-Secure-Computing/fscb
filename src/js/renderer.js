// var keys = ["02a580990522b85a9d842669f0950a615c061ec6916f32b8b3461efe58985c0cb4", "02bb3d790f459a017c11002a80671e8fc6213675b8845044996f51690011d7bdb0", "03d2fb8b133858b2a5b70e884451f2eaa23064e3dc9f77e417b317bed014f30dfc"]
// var sigsNeeded = 2



//  var multisig =  coinjs.pubkeys2MultisigAddress(keys, sigsNeeded);
//  console.log(multisig)
 
//  Start Tab Pannels

const importText =   document.getElementById('import-text');
// const bankersClick = document.getElementById('bakers-address').getElementsByClassName('pubkeyAdd')[0];

const formCreateAccount =   document.getElementById('create-new-form');
const contractName = document.getElementById("contract-name");
const creatorName = document.getElementById("creator-name");
const creatorEmail = document.getElementById("creator-email");
const creatorAddress = document.getElementById("creator-address");
const minusButton = document.getElementById('multikeys');
const addMinus = document.getElementById('multikeys').getElementsByClassName('pubkeyAdd')[0]

const sigNumber = document.getElementById('releaseCoins');
let tabsContainer = document.getElementById('tabs');
let tabTogglers = tabsContainer.querySelectorAll("nav #tabs a");



tabTogglers.forEach(function(toggler) {
    toggler.addEventListener("click", function(e) {
        e.preventDefault();

        let tabName = this.getAttribute("href");

        let tabContents = document.querySelector("#tab-contents");

        for (let i = 0; i < tabContents.children.length; i++) {
        
        tabTogglers[i].parentElement.classList.remove("border-t", "border-r", "border-l", "-mb-px", "bg-white");  tabContents.children[i].classList.remove("hidden");
        if ("#" + tabContents.children[i].id === tabName) {
            continue;
        }
        tabContents.children[i].classList.add("hidden");
        
        }
        e.target.parentElement.classList.add("border-t", "border-r", "border-l", "-mb-px", "bg-white");
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

async function saveAndCreateText(e) {
    e.preventDefault();
    // console.log(contractName.value, " ", creatorName.value, " ", creatorEmail.value)
    const contractSendName = contractName.value;
    const creatorSendName = creatorName.value;
    const creatorSendEmail = creatorEmail.value;
    
    coinjs.compressed = true
    const creatorAddressDetail = await coinjs.newKeys()
    // console.log("New Key ", creatorAddressDetail)
    const sigSendNumber = sigNumber.options[sigNumber.selectedIndex].text;
    const innerMultiKey = document.querySelectorAll('.multikeysInner')
    let bankersMerge = []
    for (let i = 0; i < innerMultiKey.length; i++) {
        bankersMerge.push({"banker_id": contractSendName.split(' ').join('_') + "-" + innerMultiKey[i].querySelector('.banker-email').value + "-" + (Math.floor(1000000000 + Math.random() * 9000000000)), 
        "banker_name": innerMultiKey[i].querySelector('.banker-name').value, 
        "banker_email": innerMultiKey[i].querySelector('.banker-email').value, 
        "banker_address": "",
        "banker_signature": "",
        "banker_request_address": "banker-request-address" + "-" + innerMultiKey[i].querySelector('.banker-email').value + "-" + (Math.floor(1000000000 + Math.random() * 9000000000)) + ".txt",
        "banker_response_address": "banker-response-address" + "-" + innerMultiKey[i].querySelector('.banker-email').value + "-" + (Math.floor(1000000000 + Math.random() * 9000000000)) + ".txt",
        "banker_request_signature": "banker-request-signature" + "-" + innerMultiKey[i].querySelector('.banker-email').value + "-" + (Math.floor(1000000000 + Math.random() * 9000000000)) + ".txt",
        "banker_response_signature": "banker-response-signature" + "-" + innerMultiKey[i].querySelector('.banker-email').value + "-" + (Math.floor(1000000000 + Math.random() * 9000000000)) + ".txt"
    })
    }

    ipcRenderer.send("message:contractnew", {
        contractSendName,
        creatorSendName,
        creatorSendEmail,
        bankersMerge,
        sigSendNumber,
        creatorAddressDetail
    });
}

ipcRenderer.on("list:file", function(evt){
    const convertToJson = JSON.parse(evt)
    // console.log(convertToJson)
    let text = ""
    const container = document.getElementById('data-container')
    text+='<tr>'
    for(let x in convertToJson) {
        if(convertToJson.hasOwnProperty(x)){
            // console.log(convertToJson[x].email)
            text+="<td>" + convertToJson[x].email + "</td>"
        }
    }
    text+="</tr>"
    // console.log(text)
    // const stuff = convertToJson.map((item) => `<p>${item.firstname}<p>`)
    container.innerHTML = text
})

function addOrDelete() {
    const mainKey = document.getElementById('multikeys')
    let displayButton = document.querySelector("form button");
    const bankers = document.querySelectorAll('.banker')
    if (bankers.length >= 28 ) return;
    // innerKey.getElementsByClassName('green')[0]
    // const clone = '<div class="grid md:grid-cols-7 md:gap-6" id="multikeysInner">'+innerKey.innerHTML+'</div>'
    // mainKey.innerHTML += clone
    // document.getElementById('multikeys', 'img-anchor').dataset('./assets/imgs/minus.svg')
    let div = document.createElement('div');
    div.setAttribute("class", "grid md:grid-cols-7 md:gap-6 multikeysInner");
    let input1 = document.createElement('input')
    input1.setAttribute('class', 'col-span-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 banker-name')
    input1.setAttribute('placeholder', 'Bankers Name')
    input1.setAttribute('required', '')
    let input2 = document.createElement('input')
    input2.setAttribute('class', 'col-span-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 banker-email')
    input2.setAttribute('placeholder', 'Bankers Email')
    input2.setAttribute('required', '')
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

function deleteInput(e) {
    const remove = e.target.classList.contains('pubkeyRemove')
    if (!remove) return;
    const removeEl = e.target.parentNode; 
    document.getElementById('multikeys').removeChild(removeEl);
}

importText.addEventListener("change", loadText)
formCreateAccount.addEventListener("submit", saveAndCreateText)
addMinus.addEventListener('click', addOrDelete)
minusButton.addEventListener('click', deleteInput)





 
 