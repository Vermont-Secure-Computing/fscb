var keys = ["02a580990522b85a9d842669f0950a615c061ec6916f32b8b3461efe58985c0cb4", "02bb3d790f459a017c11002a80671e8fc6213675b8845044996f51690011d7bdb0", "03d2fb8b133858b2a5b70e884451f2eaa23064e3dc9f77e417b317bed014f30dfc"]
var sigsNeeded = 2

 var multisig =  coinjs.pubkeys2MultisigAddress(keys, sigsNeeded);
 console.log(multisig)
 
//  Start Tab Pannels

const importText =   document.getElementById('import-text');
const formCreateAccount =   document.getElementById('create-new-form');
const contractName = document.getElementById("contract-name");
const accountName = document.getElementById("account-name");
const accountEmail = document.getElementById("account-email");
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
    console.log(file)

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

function saveAndCreateText(e) {
    e.preventDefault();
    console.log(contractName.value, " ", accountName.value, " ", accountEmail.value)
    const contractSendName = contractName.value;
    const accountSendName = accountName.value;
    const accountSendEmail = accountEmail.value;

    ipcRenderer.send("message:contractnew", {
        contractSendName,
        accountSendName,
        accountSendEmail
    });
}

importText.addEventListener("change", loadText)
formCreateAccount.addEventListener("submit", saveAndCreateText)






 
 