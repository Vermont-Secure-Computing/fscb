const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const path = require('path');
const https = require('https');
const homedir = require('os').homedir();
const fs = require("fs");
const jsonFile = homedir + "/data/data.json"
const jsonFileBanker = homedir + "/data/banker.json"
console.log(homedir)

const isDev = process.env.NODE_ENV !== 'production';

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: isDev ? 1500 : 800,
    height: 600,
    resizable: isDev,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Show devtools automatically if in development
  if (isDev) {
    win.webContents.openDevTools();
  }

  win.removeMenu()
  const existAccount = fs.existsSync(homedir + '/data/data.json')

  // const accountParse = JSON.parse(accounts)

  const existsUser = fs.existsSync(homedir + '/data/user.json')


  win.loadFile('src/index.html').then(() => {

    if (existAccount) {
      const accounts = fs.readFileSync(homedir +  "/data/data.json", "utf-8")
      console.log("accounts: ", accounts)
      win.webContents.send("list:file", accounts)
    }

    if (!existsUser) {
      win.webContents.send("user:profile", {"user": false})
    }
  })

}


app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

function idNumber() {
  try {
    if (fs.existsSync(jsonFile)) {
      const dataJson = fs.readFileSync(jsonFile, "utf-8")
      const jconvert = JSON.parse(dataJson)
      console.log("length: ", jconvert[Object.keys(jconvert)[Object.keys(jconvert).length - 1]].contract_id)
      return jconvert[Object.keys(jconvert)[Object.keys(jconvert).length - 1]].contract_id + 1
    } else {
      return 1
    }
  } catch(err) {
    console.error(err)
  }

}

function bankerIdNumber() {
  try {
    if (fs.existsSync(jsonFileBanker)) {
      const dataJson = fs.readFileSync(jsonFileBanker, "utf-8")
      const jconvert = JSON.parse(dataJson)
      console.log("banker length: ", jconvert[Object.keys(jconvert)[Object.keys(jconvert).length - 1]].banker_id)
      return jconvert[Object.keys(jconvert)[Object.keys(jconvert).length - 1]].banker_id + 1
    } else {
      return 1
    }
  } catch(err) {
    console.error(err)
  }

}

// idNumber()



ipcMain.on("message:contractnew", (e, options) => {
  e.preventDefault()
  console.log("rederer send", options)
  const getIdNumber = idNumber()
  pathMessage = 'message'
  // console.log(options.bankersMerge)
  const mybankers = fs.readFileSync(homedir + "/data/banker.json", "utf-8")
  const bankersParse = JSON.parse(mybankers)
  // console.log(typeof(bankersParse))
  let mergeBankers = []
  for (let i = 0; i < options.bankersMerge.length; i++ ) {
    for (let j in bankersParse) {
      if (options.bankersMerge[i] === bankersParse[j].pubkey) {
        mergeBankers.push(bankersParse[j])
      }
    }
  }
  // }
  // for (let i = 0; i < options.bankersMerge; i++ ) {
  //   const result = testing.fil
  // }
  // const contractTextReference = options.contractSendName +"-"+ options.creatorSendEmail +"-"+ "contract"+getIdNumber+".txt";
  // for (let i = 0; i < options.bankersMerge.length; i++) {
  //   let textData = `contract_id: ${getIdNumber} \n
  //   banker_id: ${options.bankersMerge[i].banker_id}
  //   creator_name: ${options.creatorSendName} \n
  //   creator_email: ${options.creatorSendEmail} \n
  //   banker_name: ${options.bankersMerge[i].banker_name} \n
  //   banker_email: ${options.bankersMerge[i].banker_email} \n
  //   banker_respons_address: ${options.bankersMerge[i].banker_response_address}`
  //   fs.mkdir(pathMessage, { recursive: true}, function (err) {
  //     //     if (err) return err;
  //     fs.writeFile(pathMessage +"/"+ options.bankersMerge[i].banker_request_address
  //       , textData, function writeText() {
  //       if (err) return console.log(err);
  //       // console.log(JSON.stringify(sData));
  //       console.log('writing to ' + options.bankersMerge[i].banker_request_address);
  //     });
  //   })

  // }

  let data = {
      "id": Math.floor(1000000000 + Math.random() * 9000000000),
      "contract_id": getIdNumber,
      // "txt_file_reference": contractTextReference,
      "contract_name": options.contractSendName,
      "creator_name": options.creatorSendName,
      "creator_email": options.creatorSendEmail,
      "bankers": mergeBankers,
      "signature_nedded": options.sigSendNumber,
      "address": options.pubkeySend,
      "redeem_script": options.redeemScriptSend,
      "signatures": [],
      "balance": "0.0",
      "currency": options.coinCurrencySend,
      "claimed": "false"
  }
  const sData = JSON.stringify(data, null, 2)
  const fileName = "data.json"
  const path = "data"
  try {
    fs.mkdir(homedir + "/" + path, { recursive: true}, function (err) {
      if (err) return err;
      // check if data.json is existing
      if (fs.existsSync(jsonFile)) {
        fs.readFile(homedir + "/" + path +"/"+ fileName, 'utf8', function(err, jdata){
          jdata = JSON.parse(jdata);
          //Step 3: append contract variable to list
          jdata["contract" + getIdNumber] = data
          // console.log(jdata);
          const wData = JSON.stringify(jdata, null, 2)
          fs.writeFile(homedir + "/" + path +"/"+ fileName, wData, function writeJson() {
            if (err) {
              console.log(err)
            } else {
              // console.log(fs.readFileSync("./data/data.json", "utf8"));
              const accounts = fs.readFileSync(homedir + "/data/data.json", "utf-8")
              win.webContents.send("list:file", accounts)
              win.webContents.send("send:newAccountSuccess", {})
            }
          })
      });
      } else {
        const addContract = {
          ["contract" + getIdNumber]: data
        }
        const sData = JSON.stringify(addContract, null, 2)
        fs.writeFile(homedir + "/" + path +"/"+ fileName
          , sData, function writeJson() {
          if (err)  {
            console.log(err)
          } else {
            // console.log(fs.readFileSync("./data/data.json", "utf8"));
            const accounts = fs.readFileSync(homedir + "/data/data.json", "utf-8")

            win.webContents.send("list:file", accounts)
            win.webContents.send("send:newAccountSuccess", {})

          }
        });
      }
    });
  } catch (e) {
    console.log(e)
  }
  console.log("Success")
  // const accounts = fs.readFileSync("./data/data.json", "utf-8")
  // win.webContents.send("list:file",  accounts)
})

ipcMain.on('message:addBanker', (e, options) => {
  console.log('message addbanker: ', options)
  const getBankerIdNumber = bankerIdNumber()
  let data = {
    "id": Math.floor(1000000000 + Math.random() * 9000000000),
    "banker_id": getBankerIdNumber,
    "banker_name": options.bankerName,
    "banker_email": options.bankerEmail,
    "currency": options.bankerCurrency,
    "pubkey": ""
  }
  const fileName = "banker.json"
  const path = "data"
  try {
    fs.mkdir(homedir + "/" + path, { recursive: true}, function (err) {
      if (err) return err;
      if (fs.existsSync(jsonFileBanker)) {
        fs.readFile(homedir + "/" + path +"/"+ fileName, 'utf8', function(err, jdata){
          jdata = JSON.parse(jdata);
          //console.log("current banker: ", jdata)
          //Step 3: append contract variable to list
          jdata["banker" + getBankerIdNumber] = data

          const wData = JSON.stringify(jdata, null, 2)
          fs.writeFile(homedir + "/" + path +"/"+ fileName, wData, function writeJson() {
            if (err) return console.log(err);
            win.webContents.send("send:newBanker", data)
            readBankersFile()
          })
      });
      } else {
        console.log("file not existing")
        const addBanker = {
          ["banker" + getBankerIdNumber]: data
        }
        const sData = JSON.stringify(addBanker, null, 2)
        fs.writeFile(homedir + "/" + path +"/"+ fileName
          , sData, function writeJson() {
          if (err) return console.log(err);
          // console.log(JSON.stringify(sData));
          console.log('writing to ' + fileName);
          win.webContents.send("send:newBanker", data)
          readBankersFile()
        });

      }
    });
  } catch (e) {
    console.log(e)
  }
})

function readBankersFile() {
  const fileName = "banker.json"
  const path = "data"
  if (fs.existsSync(homedir + "/" + path +"/"+ fileName)) {
    fs.readFile(homedir + "/" + path +"/"+ fileName, 'utf8', function(err, jdata){
      console.log("jdata: ", jdata)
      jdata = JSON.parse(jdata);
      //Step 3: append contract variable to list
      // console.log(jdata);
      // const wData = JSON.stringify(jdata, null, 2)
      win.webContents.send('send:bankers', jdata)
    })
  }
  return
}

ipcMain.on('click:addBanker', () => {
  console.log("ipcmain click: ")
  readBankersFile()
})

// ipcMain.on('get:balance', (e, options) => {
//   console.log(options)
//   const request = https.request(`https://twigchain.com/ext/getbalance/${options.pubkey}`, (response) => {
//     let data = '';
//     response.on('data', (chunk) => {
//         data = data + chunk.toString();
//     });

//     response.on('end', () => {
//         const body = JSON.parse(data);
//         console.log(body);
//         win.webContents.send('response:balance', body)
//     });
//   })

//   request.on('error', (error) => {
//       console.log('An error', error);
//       // win.webContents.send('response:balance', toString(0))
//   });

//   request.end()
// })

ipcMain.on('balance:api', (e, options) => {
  // e.preventDefault()
  // console.log(options)
  let account = {};
  const fileName = "data.json"
  const path = "data"
  if (fs.existsSync(jsonFile)) {
    accounts = fs.readFileSync(homedir + "/data/data.json", "utf-8")
    const allaccount = JSON.parse(accounts)
    for(let i in allaccount) {
      // console.log(i)
      // console.log(Object.keys(allaccount).length)
      const request = https.request(`https://twigchain.com/ext/getAddress/${allaccount[i].address}`, (response) => {
      let data = '';
      response.on('data', (chunk) => {
          data = data + chunk.toString();
      });

      response.on('end', async () => {
          const body = await JSON.parse(data);
          // console.log(body);
          // allaccount[i].balance = body
          if (body.address) {
            if (allaccount[i].address === body.address) {

              allaccount[i].balance = body.balance
              // const allparse = JSON.stringify(allaccount[i], null, 2)
              fs.readFile(homedir + "/" + path +"/"+ fileName, 'utf8', function(err, jdata){
                jdata = JSON.parse(jdata);
                //Step 3: append contract variable to list
                jdata[i] = allaccount[i]
                console.log(jdata);
                const wData = JSON.stringify(jdata, null, 2)
                fs.writeFile(homedir + "/" + path +"/"+ fileName, wData, (err) => {
                  if (err) {
                    return console.log(err)
                  } else {
                    const readMore = fs.readFileSync(homedir + "/data/data.json", "utf-8")

                    win.webContents.send("list:file",  readMore)

                  }
                })
              });
              // account = allaccount[i]
              // console.log(accounts)
              // const updateJson = JSON.stringify(allaccount[i], null, 2)
              // console.log(updateJson)
              // fs.writeFile(jsonFile, updateJson, function writeJson() {
              //   if (err) {
              //     return console.log(err)
              //   }
              // })
            }
          }
      });
      })

      request.on('error', (error) => {
          console.log('An error', error);
          // win.webContents.send('response:balance', toString(0))

      });
      request.end()
    }
  }
})


ipcMain.on('withdrawal:api', (e, txid) => {
  console.log("ipc main withdrawal txid: ", txid)
  try {
    const request = https.request(`https://api.logbin.org/api/broadcast/r?transaction=${txid}`, (response) => {
      console.log("withdrawal response")
      let data = '';
      response.on('data', (chunk) => {
          data = data + chunk.toString();
      });

      response.on('end', async () => {
          const body = await JSON.parse(data);
          console.log("withdrawal response message: ", body)
          win.webContents.send('withdrawal:broadcast-response', body)
      });
   })

    request.on('error', (error) => {
        console.log('An error', error);
        win.webContents.send('withdrawal:broadcast-response', body)
    });
    request.end()
  } catch(e) {
    console.log("error : ", e)
  }
})

ipcMain.on('unspent:api', (e, address) => {
  console.log("ipc main address: ", address)
  try {
    const request = https.request(`https://api.logbin.org/api?address=${address}`, (response) => {
      console.log("im here")
      let data = '';
      response.on('data', (chunk) => {
          data = data + chunk.toString();
      });

      response.on('end', async () => {
          const body = await JSON.parse(data);
          console.log("unspent body: ", body.message.address)
          win.webContents.send('unspent:address', body.message.address)
      });
   })

    request.on('error', (error) => {
        console.log('An error', error);
    });
    request.end()
  } catch(e) {
    console.log("error : ", e)
  }
})

ipcMain.on('get:user', async() => {
  if (fs.existsSync(homedir + "/data/user.json")) {
    const user = await JSON.parse(fs.readFileSync(homedir + "/data/user.json", "utf-8"))
    console.log("user data: ", user)
    win.webContents.send('response:user', user)
  }else {
    console.log()
  }
})

async function bankerPubkeyResponse(evt) {
  console.log(evt)
  if (fs.existsSync(homedir + "/data/banker.json")) {
    const allbankers = await JSON.parse(fs.readFileSync(homedir + "/data/banker.json", "utf-8"))
    console.log("got all bankers")
    for (const i in allbankers) {
      console.log("i: ", i)
      if (allbankers[i].banker_id == evt.banker_id) {
        allbankers[i].pubkey = evt.pubkey
        const wData = JSON.stringify(allbankers, null, 2)
        console.log(wData)
        fs.writeFile(homedir + "/data/banker.json", wData, (err) => {
          if (err) {
            console.log(err)
          } else {
            console.log("successful")
            // send
            win.webContents.send('addBanker:pubkey', {})
          }
        })
      }
    }
  }else {
    console.log("err in adding banker pubkey")
  }
}

async function bankerPubkeyRequest(evt) {
  if (fs.existsSync(homedir + "/data/user.json")) {
    const user = await JSON.parse(fs.readFileSync(homedir + "/data/user.json", "utf-8"))
    console.log("user log", user)
    evt.message = "response-pubkey"
    evt.pubkey = user.pubkey
    console.log(JSON.stringify(evt))
    win.webContents.send('response:pubkey', evt)
  }
}


/**
  Function that will update the account's withdrawal signature array
**/
async function bankerSignatureResponse(message) {
  if (fs.existsSync(homedir + "/data/data.json")) {
    const accounts = await JSON.parse(fs.readFileSync(homedir + "/data/data.json", "utf-8"))
    console.log(accounts)
    let accountID = message.id
    let bankerID = message.banker_id
    let next_banker
    for (const [key, value] of Object.entries(accounts)) {
      let account = value
      if (account.id == accountID) {
        for (const [index, signature] of account.signatures.entries()) {
          if(signature.banker_id == bankerID) {
            signature.transaction_id = message.transaction_id
            signature.status = "SIGNED"
            const date_signed = new Date()
            signature.date_signed = date_signed

            const updatedAccounts = JSON.stringify(accounts, null, 2)
            fs.writeFile(homedir + "/data/data.json"
              , updatedAccounts, function writeJson(err) {
              if (err)  {
                console.log(err)
              } else {
                console.log("accounts updated")
                // check number of signatures needed
                if (account.signatures.length == account.signature_nedded) {
                  console.log("ready to broadcast")
                  win.webContents.send('withdrawal:ready-to-broadcast', message)
                } else {
                  console.log("request signature to next banker")
                  for (const [index, banker] of account.bankers.entries()) {
                    if(banker.banker_id == bankerID) {
                      console.log("next banker: ", account.bankers[index + 1])
                      let next_banker = account.bankers[index + 1]

                      let newMessage = {
                        "header": "free_state_central_bank",
                        "message":"request-signature",
                        "id": message.id,
                        "contract_name": message.contract_name,
                        "banker_id": next_banker.banker_id,
                        "creator_name": message.creator_name,
                        "creator_email": message.creator_email,
                        "banker_name": next_banker.banker_name,
                        "banker_email": next_banker.banker_email,
                        "transaction_id_for_signature": message.transaction_id,
                        "currency":message.currency
                      }
                      console.log("new message: ", newMessage)

                      // Create new signature object in the account signature array
                      const newSignatory = {
                        "banker_id": next_banker.banker_id,
                        "date_requested": Date.now(),
                        "date_signed": null,
                        "status": "PENDING",
                        "transaction_id": ""
                      }
                      account.signatures.push(newSignatory)
                      const accountsNewSignatory = JSON.stringify(accounts, null, 2)
                      fs.writeFile(homedir + "/data/data.json"
                        , accountsNewSignatory, function writeJson(err) {
                        if (err)  {
                          console.log("updating signatures for next banker to sign error: ", err)
                        } else {
                          console.log("signature updated for next banker to sign: ")
                          win.webContents.send('response:banker-signature', newMessage)
                        }
                      })
                    }
                  }
                }
              }
            });
          }
        }
      }
    }


  }
}

ipcMain.on("banker:addorsig", (e, options) => {
  e.preventDefault()
  // console.log(typeof(options))
  const banker = JSON.parse(options)
  console.log(banker)
  if (banker.message.includes("request-pubkey")) {
    bankerPubkeyRequest(banker)
  }else if (banker.message.includes("response-pubkey")) {
    // console.log("response pubkey")
    bankerPubkeyResponse(banker)
  }else if (banker.message.includes("request-signature")) {
    console.log("request signature")
    win.webContents.send('request:banker-signature', banker)
  } else if (banker.message.includes("response-signature")) {
    console.log("response signature")
    bankerSignatureResponse(banker)
    //win.webContents.send('response:banker-signature', banker)
  }else {
    console.log("signature")
  }
})

ipcMain.on('user:address', (e, options) => {
  let data = {
    "user_name": options.userName,
    "user_email": options.userEmail,
    "address": options.userAddress.address,
    "pubkey": options.userAddress.pubkey,
    "privkey": options.userAddress.wif,
    "wif": options.userAddress.privkey
  }
  try {
    // const fileName = "user.json"
    const path = "data"
    const wData = JSON.stringify(data, null, 2)
    fs.mkdir(homedir + "/" + path, { recursive: true}, function (err) {
      fs.writeFile(homedir + "/data/user.json", wData, (err) => {
        if (err) {
          console.log(err)
        } else {
          win.webContents.send('create:profile', {})
        }
      })
    })
  }catch (e) {
    console.log(e)
  }
})

ipcMain.on('getredeemscript:redeemscript', (e, options) => {
  console.log("options script: ", options.script)
  const accounts = JSON.parse(fs.readFileSync(homedir + "/data/data.json", "utf-8"))
  const accountFilter = Object.values(accounts).filter(value => {
    console.log(value);
    return value.redeem_script === options.script;
  });
  console.log("account filter: ",JSON.stringify(accountFilter))
  win.webContents.send('account:filterSig', JSON.stringify(accountFilter))
});

ipcMain.on('signature:encode', (e, options) => {
  console.log(options)
  // const accounts = JSON.parse(fs.readFileSync(homedir + "/data/data.json", "utf-8"))
  // const accountFilter = Object.values(accounts).filter(value => {
  //   console.log(value);
  //   return value.id === options;
  // });
  // console.log("account filter: ",JSON.stringify(accountFilter))
  const path = "data"
  const fileName = "data.json"
  fs.readFile(homedir + "/" + path +"/"+ fileName, 'utf8', function(err, jdata){
    jdata = JSON.parse(jdata);
    //Step 3: append contract variable to list
    jdata["contract" + options.id] = options.contract
    // console.log(jdata);
    const wData = JSON.stringify(jdata, null, 2)
    fs.writeFile(homedir + "/" + path +"/"+ fileName, wData, function writeJson() {
      if (err) {
        console.log(err)
      } else {
        console.log("successfully updated");
        // const accounts = fs.readFileSync(homedir + "/data/data.json", "utf-8")
        // win.webContents.send("list:file", accounts)
        // win.webContents.send("send:newAccountSuccess", {})
      }
    })
  });
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
