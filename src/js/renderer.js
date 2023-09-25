// var keys = ["02a580990522b85a9d842669f0950a615c061ec6916f32b8b3461efe58985c0cb4", "02bb3d790f459a017c11002a80671e8fc6213675b8845044996f51690011d7bdb0", "03d2fb8b133858b2a5b70e884451f2eaa23064e3dc9f77e417b317bed014f30dfc"]
// var sigsNeeded = 2





//  var multisig =  coinjs.pubkeys2MultisigAddress(keys, sigsNeeded);
//  console.log(multisig)
 
//  Start Tab Pannels

const importText =   document.getElementById('import-text');
// const bankersClick = document.getElementById('bakers-address').getElementsByClassName('pubkeyAdd')[0];

const formCreateAccount =   document.getElementById('create-new-form');
const formAddBanker = document.getElementById('add-banker-form');
const contractName = document.getElementById("contract-name");
const creatorName = document.getElementById("creator-name");
const creatorEmail = document.getElementById("creator-email");
const creatorAddress = document.getElementById("creator-address");
const minusButton = document.getElementById('multikeys');
const addMinus = document.getElementById('multikeys').getElementsByClassName('pubkeyAdd')[0]
const testingClick = document.getElementsByClassName('testingClick')[0]

const sigNumber = document.getElementById('releaseCoins');
let tabsContainer = document.getElementById('tabs');
let tabTogglers = tabsContainer.querySelectorAll("nav #tabs a");
let bankersArray



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
    const innerMultiKey = document.querySelectorAll('.active a')
    console.log(innerMultiKey)
    let bankersMerge = []
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
    console.log("click add or delete")
    const mainKey = document.getElementById('multikeys')
    let displayButton = document.querySelector("form button");
    // const bankers = document.querySelectorAll('.banker')
    // if (bankers.length >= 28 ) return;
    // innerKey.getElementsByClassName('green')[0]
    // const clone = '<div class="grid md:grid-cols-7 md:gap-6" id="multikeysInner">'+innerKey.innerHTML+'</div>'
    // mainKey.innerHTML += clone
    // document.getElementById('multikeys', 'img-anchor').dataset('./assets/imgs/minus.svg')
    let div = document.createElement('div');
    div.setAttribute("class", "grid md:grid-cols-7 md:gap-6 multikeysInner");
    // let input1 = document.createElement('input')
    // input1.setAttribute('class', 'col-span-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 banker-name')
    // input1.setAttribute('placeholder', 'Bankers Name')
    // input1.setAttribute('required', '')
    // let input2 = document.createElement('input')
    // input2.setAttribute('class', 'col-span-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 banker-email')
    // input2.setAttribute('placeholder', 'Bankers Email')
    // input2.setAttribute('required', '')
    let select = document.createElement('select')
    select.setAttribute('name', 'banker-name1')
    select.setAttribute('id', 'bankers-name')
    select.setAttribute('class', 'col-span-6 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500')
    let option = document.createElement('option')
    option.setAttribute('value', '')
    option.setAttribute('disabled', 'disabled')
    option.setAttribute('hidden', 'hidden')
    option.setAttribute('selected', 'selected')
    option.innerHTML = "Choose Banker"
    select.appendChild(option)
    // option.setAttribute('data-dept', 'Choose Banker')
    for (const key in bankersArray) {
        const opt = bankersArray[key].banker_email
        console.log(opt)
        let option1 = document.createElement('option')
        option1.textContent = opt;
        option1.value = opt;
        select.appendChild(option1)
    }
    let anchor = document.createElement('a')
    anchor.setAttribute('class', 'pubkeyRemove')
    let minus = document.createElement('object')
    minus.setAttribute('data', './images/minus.svg')
    minus.setAttribute('width', '50')
    minus.setAttribute('height', '50')
    minus.setAttribute('class', 'red')
    anchor.appendChild(minus)
    div.appendChild(select)
    // div.appendChild(input2)
    div.appendChild(anchor)
    mainKey.appendChild(div)
}

function deleteInput(e) {
    const remove = e.target.classList.contains('pubkeyRemove')
    if (!remove) return;
    const removeEl = e.target.parentNode; 
    document.getElementById('multikeys').removeChild(removeEl);
}

function addBanker(e) {
    e.preventDefault()
    // const mainBankerDiv = document.getElementById('addbanker')
    const bankerName = document.getElementById('banker-name-add').value
    const bankerEmail = document.getElementById('banker-email-add').value
    // console.log(mainBankerDiv)
    ipcRenderer.send('message:addBanker', {
        bankerName,
        bankerEmail
    })
}

function getBanker() {
    if (!bankersArray) {
        ipcRenderer.send('click:addBanker', {})
    }
}

ipcRenderer.on('send:bankers', function(e) {
    const select = document.querySelector("select[multiple]");
    console.log(select)
    bankersArray = e
    for(const key in bankersArray) {
        // console.log(bankersArray[key])
        // let data = {
        //     "banker_name": bankersArray[key].banker_name
        // }
        const opt = bankersArray[key].banker_email;
        // console.log(opt)
        const el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        el.setAttribute('class', 'optionForSelection')
        select.appendChild(el);
    }

    // select multiple

// let select = document.getElementById('bankers-name');
    const selectOptions = select.querySelectorAll('option');
    // console.log(selectOptions)

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
    
})



// importText.addEventListener("change", loadText);
formCreateAccount.addEventListener("submit", saveAndCreateText);
// addMinus.addEventListener('click', addOrDelete);
minusButton.addEventListener('click', deleteInput);
formAddBanker.addEventListener('submit', addBanker);
testingClick.addEventListener('click', getBanker)





 
 