// var keys = ["02a580990522b85a9d842669f0950a615c061ec6916f32b8b3461efe58985c0cb4", "02bb3d790f459a017c11002a80671e8fc6213675b8845044996f51690011d7bdb0", "03d2fb8b133858b2a5b70e884451f2eaa23064e3dc9f77e417b317bed014f30dfc"]
// var sigsNeeded = 2
//  var multisig =  coinjs.pubkeys2MultisigAddress(keys, sigsNeeded);
//  console.log(multisig)



//  Start Tab Pannels

const importText =   document.getElementById('import-text');
// const bankersClick = document.getElementById('bakers-address').getElementsByClassName('pubkeyAdd')[0];

const formCreateAccount =   document.getElementById('create-new-form');
const importTextForm = document.getElementById('import-text-form');
const userProfileForm = document.getElementById('user-profile-form')
const formAddBanker = document.getElementById('add-banker-form');
const contractName = document.getElementById("contract-name");
const creatorName = document.getElementById("creator-name");
const creatorEmail = document.getElementById("creator-email");
const creatorAddress = document.getElementById("creator-address");
const minusButton = document.getElementById('multikeys');
const addMinus = document.getElementById('multikeys').getElementsByClassName('pubkeyAdd')[0]
const getbankerClick = document.getElementsByClassName('getbankerClick')[0]
const getListClick = document.getElementsByClassName('getlistClick')[0]
// console.log(getListClick)
// const accountList = document.getElementById('accounts-list');

const sigNumber = document.getElementById('releaseCoins');
const currency = document.getElementById('coin-currency')
let tabsContainer = document.getElementById('tabs');
let tabTogglers = tabsContainer.querySelectorAll("aside #tabs a");
let bankersArray
let openTab =




tabTogglers.forEach(function(toggler) {
    toggler.addEventListener("click", function(e) {
        e.preventDefault();
        console.log('click button')

        let tabName = this.getAttribute("href");
        openTab = tabName;
        if (tabName === "#first") {
            ipcRenderer.send("balance:api", {"send": "get"})
        }
        if (tabName === "#addbanker") {
            getBanker()
        }
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
    const coinCurrencySend = currency.options[currency.selectedIndex].text;
    const innerMultiKey = document.querySelectorAll('.active a')
    console.log(innerMultiKey)
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

ipcRenderer.on("list:file", function(e, evt){
    console.log(e)
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
            console.log("convert to json", convertToJson[x])
            // ipcRenderer.send("get:balance", {"pubkey": convertToJson[x].address})
            let row = accountBody.insertRow();
            let name = row.insertCell(0);
            name.innerHTML = convertToJson[x].contract_name
            let address = row.insertCell(1);
            address.innerHTML = convertToJson[x].address
            let balance = row.insertCell(2);
            balance.innerHTML = convertToJson[x].balance
            let veiwall = row.insertCell(3)
            let buttonall = document.createElement('button')
            buttonall.innerHTML = "view all"
            veiwall.appendChild(buttonall)
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

// ipcRenderer.on('list:file', function(evt) {
//     console.log(evt)
//     const accountBody = document.getElementById('accounts-list-body')
//     const accountTr = document.createElement('tr')

// })

// function addOrDelete() {
//     console.log("click add or delete")
//     const mainKey = document.getElementById('multikeys')
//     let displayButton = document.querySelector("form button");
//     // const bankers = document.querySelectorAll('.banker')
//     // if (bankers.length >= 28 ) return;
//     // innerKey.getElementsByClassName('green')[0]
//     // const clone = '<div class="grid md:grid-cols-7 md:gap-6" id="multikeysInner">'+innerKey.innerHTML+'</div>'
//     // mainKey.innerHTML += clone
//     // document.getElementById('multikeys', 'img-anchor').dataset('./assets/imgs/minus.svg')
//     let div = document.createElement('div');
//     div.setAttribute("class", "grid md:grid-cols-7 md:gap-6 multikeysInner");
//     // let input1 = document.createElement('input')
//     // input1.setAttribute('class', 'col-span-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 banker-name')
//     // input1.setAttribute('placeholder', 'Bankers Name')
//     // input1.setAttribute('required', '')
//     // let input2 = document.createElement('input')
//     // input2.setAttribute('class', 'col-span-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 banker-email')
//     // input2.setAttribute('placeholder', 'Bankers Email')
//     // input2.setAttribute('required', '')
//     let select = document.createElement('select')
//     select.setAttribute('name', 'banker-name1')
//     select.setAttribute('id', 'bankers-name')
//     select.setAttribute('class', 'col-span-6 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500')
//     let option = document.createElement('option')
//     option.setAttribute('value', '')
//     option.setAttribute('disabled', 'disabled')
//     option.setAttribute('hidden', 'hidden')
//     option.setAttribute('selected', 'selected')
//     option.innerHTML = "Choose Banker"
//     select.appendChild(option)
//     // option.setAttribute('data-dept', 'Choose Banker')
//     for (const key in bankersArray) {
//         const opt = bankersArray[key].banker_email
//         console.log(opt)
//         let option1 = document.createElement('option')
//         option1.textContent = opt;
//         option1.value = opt;
//         select.appendChild(option1)
//     }
//     let anchor = document.createElement('a')
//     anchor.setAttribute('class', 'pubkeyRemove')
//     let minus = document.createElement('object')
//     minus.setAttribute('data', './images/minus.svg')
//     minus.setAttribute('width', '50')
//     minus.setAttribute('height', '50')
//     minus.setAttribute('class', 'red')
//     anchor.appendChild(minus)
//     div.appendChild(select)
//     // div.appendChild(input2)
//     div.appendChild(anchor)
//     mainKey.appendChild(div)
// }

// function deleteInput(e) {
//     const remove = e.target.classList.contains('pubkeyRemove')
//     if (!remove) return;
//     const removeEl = e.target.parentNode;
//     document.getElementById('multikeys').removeChild(removeEl);
// }

function addBanker(e) {
    e.preventDefault()
    // const mainBankerDiv = document.getElementById('addbanker')
    const nameInput = document.getElementById('banker-name-add')
    const emailInput = document.getElementById('banker-email-add')

    // Get value of selected currency
    var selectElement = document.querySelector('#banker-currency');
    var bankerCurrency = selectElement.value;
    console.log("currency: ", currency)
    // console.log(mainBankerDiv)
    const bankerName = nameInput.value
    const bankerEmail = emailInput.value
    console.log("add banker: ", bankerName, bankerEmail)
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

ipcRenderer.on('send:bankers', function(e, evt) {
    bankersArray = evt
    //
    // Start of Banker's table
    //
    const bankersBody = document.getElementById('bankers-list-body')

    bankersBody.innerHTML = ""
    for(let x in bankersArray) {
        if(bankersArray.hasOwnProperty(x)){
            let row = bankersBody.insertRow();
            let name = row.insertCell(0);
            name.innerHTML = bankersArray[x].banker_name
            let email = row.insertCell(1);
            email.innerHTML = bankersArray[x].banker_email
            let pubKey = row.insertCell(2);
            pubKey.innerHTML = bankersArray[x].public_key
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

      console.log(select)
      select.options.length = 0
      for(const key in bankersArray) {
          const opt = bankersArray[key].banker_email;
          const pub = bankersArray[key].pubkey;
          const el = document.createElement("option");
          el.textContent = opt;
          el.value = pub;
          el.setAttribute('class', 'optionForSelection')
          select.appendChild(el);
      }

      const selectOptions = select.querySelectorAll('option');
      const newSelect = document.createElement('div');
      newSelect.classList.add('selectMultiple');
      const active = document.createElement('div');
      active.classList.add('active');
      const optionList = document.createElement('ul');
      const placeholder = select.dataset.placeholder;

      const span = document.createElement('span');
      span.innerText = placeholder;
      active.appendChild(span);

      selectOptions.forEach((option) => {
          console.log(option)
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
        jsonStr = jsonStr.replace(/\s/g, "")
        console.log(typeof(jsonStr))
        ipcRenderer.send("banker:addorsig", jsonStr)
    }
}

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

function alertSuccess(message) {
    Toastify.toast({
      text: message,
      duration: 5000,
      close: false,
      style: {
        background: 'green',
        color: 'white',
        textAlign: 'center',
      },
    });
  }

  function alertError(message) {
    Toastify.toast({
      text: message,
      duration: 5000,
      close: false,
      style: {
        background: 'red',
        color: 'white',
        textAlign: 'center',
      },
    });
  }





// importText.addEventListener("change", loadText);
formCreateAccount.addEventListener("submit", saveAndCreateText);
importTextForm.addEventListener('submit', parseTextArea);
userProfileForm.addEventListener('submit', createUserProfile);
// addMinus.addEventListener('click', addOrDelete);
// minusButton.addEventListener('click', deleteInput);
formAddBanker.addEventListener('submit', addBanker);
getbankerClick.addEventListener('click', getBanker)
getListClick.addEventListener('click', getList)
