const { app, BrowserWindow, ipcMain, ipcRenderer, clipboard } = require('electron');
const path = require('path');
const https = require('https');
const homedir = require('os').homedir();
const fs = require("fs");
const contextMenu = require('electron-context-menu');
const jsonFile = homedir + "/.fscb/data.json"
const jsonFileBanker = homedir + "/.fscb/banker.json"
console.log(homedir)

const config = require('dotenv');
config.config({
  path: '.env'
})
const {
  API_KEY
} = process.env
console.log("API_KEY: ", API_KEY)

const isDev = process.env.NODE_ENV !== 'production';

let win;

contextMenu({
	showSaveImageAs: true
});

const createWindow = () => {
  // Create splash window
  var splash = new BrowserWindow({
    width: isDev ? 1500 : 800,
    height: 728,
    resizable: isDev,
    transparent: false,
    frame: false,
    alwaysOnTop: true,
  });


  splash.loadFile('src/splash.html');

  splash.center();


  setTimeout(function () {

    splash.close();


    // Create main window
    win = new BrowserWindow({
      width: isDev ? 1500 : 800,
      height: 728,
      resizable: isDev,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        devTools: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Show devtools automatically if in development
    if (isDev) {
      win.webContents.openDevTools();
    }


  win.removeMenu()
  const existAccount = fs.existsSync(homedir + '/.fscb/data.json')

  // const accountParse = JSON.parse(accounts)

  const existsUser = fs.existsSync(homedir + '/.fscb/user.json')


  win.loadFile('src/index.html').then(() => {

    if (existAccount) {
      const accounts = fs.readFileSync(homedir +  "/.fscb/data.json", "utf-8");
      console.log("accounts: ", accounts);
      win.webContents.send("list:file", accounts);
    }

    if (!existsUser) {
      win.webContents.send("user:profile", {"user": false});
    }
  });


  win.center();

  win.show();

}, 2000);
};


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

/**
	Function to copy message to clipboard
**/
ipcMain.on("message:copy", async(e, message) => {
	clipboard.writeText(message)
})


/**
	Check if address and redeem script is already used by an existing account
**/
async function isAccountAddressExisting(address, redeemScript) {
  const accounts = await JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))

  let checker = false
  for (const [key, value] of Object.entries(accounts)) {
    let acct = value
    if (acct.address === address && acct.redeem_script) {
      checker = true
      break;
    }
  }

  console.log("checker: ", checker)
	return checker
}


/**
	Function to create a new contract/account
**/
ipcMain.on("message:contractnew", async(e, options) => {
  e.preventDefault()

	// Check if address or redeem script already used by an existing account
	const isAddressExisting = await isAccountAddressExisting(options.pubkeySend, options.redeemScriptSend)

	if (isAddressExisting === true) {
		win.webContents.send("new-account-error:existing", {})
		return
	}


  const getIdNumber = idNumber()
  pathMessage = 'message'
  const mybankers = fs.readFileSync(homedir + "/.fscb/banker.json", "utf-8")
  const bankersParse = JSON.parse(mybankers)
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
	console.log("mergeBankers: ", mergeBankers)
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
      //"signatures": [],
			"withdrawals": [],
      "balance": "0.0",
      "currency": options.coinCurrencySend,
      "claimed": "false"
  }
  const sData = JSON.stringify(data, null, 2)
  const fileName = "data.json"
  const path = ".fscb"
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
              // console.log(fs.readFileSync("./.fscb/data.json", "utf8"));
              const accounts = fs.readFileSync(homedir + "/.fscb/data.json", "utf-8")
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
            // console.log(fs.readFileSync("./.fscb/data.json", "utf8"));
            const accounts = fs.readFileSync(homedir + "/.fscb/data.json", "utf-8")

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
  // const accounts = fs.readFileSync("./.fscb/data.json", "utf-8")
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
  const path = ".fscb"
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


ipcMain.on('newaccount:banker:filter', (e) => {
	readBankersFile()
})

function readBankersFile() {
  const fileName = "banker.json"
  const path = ".fscb"
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
  const path = ".fscb"
  if (fs.existsSync(jsonFile)) {
    accounts = fs.readFileSync(homedir + "/.fscb/data.json", "utf-8")
    const allaccount = JSON.parse(accounts)
    for(let i in allaccount) {
      // console.log(Object.keys(allaccount).length)
      if (allaccount[i].currency === 'woodcoin') {
        const request = https.request(`https://twigchain.com/ext/getAddress/${allaccount[i].address}`, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
            //console.log("all account ", chunk.toString())
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
                  try {
                    jdata = JSON.parse(jdata);
                    //Step 3: append contract variable to list
                    jdata[i] = allaccount[i]
                    console.log(jdata);
                    const wData = JSON.stringify(jdata, null, 2)
                    fs.writeFile(homedir + "/" + path +"/"+ fileName, wData, (err) => {
                      if (err) {
                        return console.log(err)
                      } else {
                        const readMore = fs.readFileSync(homedir + "/.fscb/data.json", "utf-8")

                        win.webContents.send("list:file",  readMore)

                      }
                    })
                  } catch (e) {
                    console.log("parsing error: ", e)
                  }
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
      } else if (allaccount[i].currency === 'bitcoin') {
          console.log("currency ", allaccount[i].currency)
          console.log("currency address ", allaccount[i].address)
          const options = {
            hostname: 'chain.so',
            path: `/api/v3/balance/BTC/${allaccount[i].address}`,
            port: 443,
            method: 'GET',
            headers: {
              'API-KEY': API_KEY
            }
          }
          const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
              data = data + chunk.toString();
              console.log("all account 2 ", chunk.toString())
            });
            response.on('end', async () => {
              const body = await JSON.parse(data);
              // const bodydata = Object.keys(body.data)
              // const removeBracket = bodydata[0]
              console.log("chain so response balance: ", body)
              if (body.data) {
                // if (allaccount[i].address === removeBracket) {
                  // console.log("bitcoin satoshi ", body.data[allaccount[i].address].address.balance / Math.pow(10,8))
                  allaccount[i].balance = body.data.confirmed // Math.pow(10,8)
                  fs.readFile(homedir + "/" + path +"/"+ fileName, 'utf8', function(err, jdata){
                    try {
                      jdata = JSON.parse(jdata);
                      //Step 3: append contract variable to list
                      jdata[i] = allaccount[i]
                      console.log(jdata);
                      const wData = JSON.stringify(jdata, null, 2)
                      fs.writeFile(homedir + "/" + path +"/"+ fileName, wData, (err) => {
                        if (err) {
                          return console.log(err)
                        } else {
                          const readMore = fs.readFileSync(homedir + "/.fscb/data.json", "utf-8")

                          win.webContents.send("list:file",  readMore)

                        }
                      })
                    } catch (e) {
                      console.log("parsing error: ", e)
                    }
                  });
                // }
              }
            })

          })
          request.on('error', (error) => {
            console.log('An error', error);
            // win.webContents.send('response:balance', toString(0))

          });
          request.end()
      } else if (allaccount[i].currency === 'litecoin') {
        console.log("currency ", allaccount[i].currency)
          console.log("currency address ", allaccount[i].address)
          const options = {
            hostname: 'chain.so',
            path: `/api/v3/balance/LTC/${allaccount[i].address}`,
            port: 443,
            method: 'GET',
            headers: {
              'API-KEY': API_KEY
            }
          }
          const request = https.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
              data = data + chunk.toString();
              // console.log("all account 2 ", chunk.toString())
            });
            response.on('end', async () => {
              const body = await JSON.parse(data);
              // const bodydata = Object.keys(body.data)
              // const removeBracket = bodydata[0]
              console.log("chain so response balance: ", body)
              if (body.data) {
                // if (allaccount[i].address === removeBracket) {
                  // console.log("bitcoin satoshi ", body.data[allaccount[i].address].address.balance / Math.pow(10,8))
                  allaccount[i].balance = body.data.confirmed  // Math.pow(10,8)
                  fs.readFile(homedir + "/" + path +"/"+ fileName, 'utf8', function(err, jdata){
                    try {
                      jdata = JSON.parse(jdata);
                      //Step 3: append contract variable to list
                      jdata[i] = allaccount[i]
                      console.log(jdata);
                      const wData = JSON.stringify(jdata, null, 2)
                      fs.writeFile(homedir + "/" + path +"/"+ fileName, wData, (err) => {
                        if (err) {
                          return console.log(err)
                        } else {
                          const readMore = fs.readFileSync(homedir + "/.fscb/data.json", "utf-8")

                          win.webContents.send("list:file",  readMore)

                        }
                      })
                    } catch (e) {
                      console.log("parsing error: ", e)
                    }
                  });
                // }
              }
            })

          })
          request.on('error', (error) => {
            console.log('An error', error);
            // win.webContents.send('response:balance', toString(0))

          });
          request.end()
    } else {
        console.log("Chain not found")
        return
      }
    }
  }
})


ipcMain.on('withdrawal:api', (e, message) => {
  console.log("ipc main withdrawal txid: ", message)
	const txid = message.transaction_id
	const accountId = message.id
	const withdrawalId = message.withdrawal_id

	if (message.currency === "woodcoin") {
		try {
	    const request = https.request(`https://api.logbin.org/api/broadcast/r?transaction=${txid}`, (response) => {
	      console.log("withdrawal response")
	      let data = '';
	      response.on('data', (chunk) => {
	          data = data + chunk.toString();
	      });

	      response.on('end', async () => {
					console.log("response end: ", data)
	          const body = await JSON.parse(data);

	          console.log("withdrawal response message: ", body)
						if (body.message) {
							console.log("body.message: ", body.message)
							const accounts = await JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))
							for (const [key, value] of Object.entries(accounts)) {
					      let account = value
								console.log("account.id vs accountId: ", account.id, accountId)
					      if (account.id == accountId) {
									console.log("inside account: ")
									for (const [index, withdrawal] of account.withdrawals.entries()){
										console.log("withdrawal.id vs withdrawalId: ", withdrawal.id, withdrawalId)
										if (withdrawal.id == withdrawalId){
											console.log("inside withdrawal id")
											withdrawal.date_broadcasted = Date.now()
											withdrawal.txid = body.message.result
											console.log(withdrawal)
											const updatedAccounts = JSON.stringify(accounts, null, 2)
											fs.writeFile(homedir + "/.fscb/data.json"
												, updatedAccounts, function writeJson(err) {
												if (err)  {
													console.log("updating withdrawal after successful broadcasting error: ", err)
												} else {
													console.log("withdrawal broadcasted. record updated")
												}
											})
										}
									}
								}
							}
						}
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
	} else if (message.currency === "bitcoin" || message.currency === "litecoin") {
		let chain = message.currency === "bitcoin" ? "BTC" : "LTC";
		try {
			var postData = JSON.stringify({
    		'tx_hex' : txid
			});

			const options = {
				hostname: 'chain.so',
				path: `/api/v3/broadcast_transaction/${chain}`,
				port: 443,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'API-KEY': API_KEY
				}
			}
		  const request = https.request(options, (response) => {
		      console.log("withdrawal response")
		      let data = '';
		      response.on('data', (chunk) => {
		          data = data + chunk.toString();
		      });

		      response.on('end', async () => {
						console.log("response end: ", data)
		          const resp = await JSON.parse(data);
							let body

							if (resp.data) {
								body = {
									message: {
										result: resp.data.hash
									}
								}
							} else {
								body = {
									error : {
										error: {
											message: resp.error
										}
									}
								}
							}

		          console.log("withdrawal response message: ", body)
							if (body.message) {
								console.log("body.message: ", body.message)
								const accounts = await JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))
								for (const [key, value] of Object.entries(accounts)) {
						      let account = value
									console.log("account.id vs accountId: ", account.id, accountId)
						      if (account.id == accountId) {
										console.log("inside account: ")
										for (const [index, withdrawal] of account.withdrawals.entries()){
											console.log("withdrawal.id vs withdrawalId: ", withdrawal.id, withdrawalId)
											if (withdrawal.id == withdrawalId){
												console.log("inside withdrawal id")
												withdrawal.date_broadcasted = Date.now()
												withdrawal.txid = body.data.hash
												console.log(withdrawal)
												const updatedAccounts = JSON.stringify(accounts, null, 2)
												fs.writeFile(homedir + "/.fscb/data.json"
													, updatedAccounts, function writeJson(err) {
													if (err)  {
														console.log("updating withdrawal after successful broadcasting error: ", err)
													} else {
														console.log("withdrawal broadcasted. record updated")
													}
												})
											}
										}
									}
								}
							}
		          win.webContents.send('withdrawal:broadcast-response', body)
		      });
		  })
		  request.write(postData);
	    request.on('error', (error) => {
	        console.log('An error', error);
	        win.webContents.send('withdrawal:broadcast-response', body)
	    });
	    request.end()
	  } catch(e) {
	    console.log("error : ", e)
	  }
	} else {
		console.log("invalid currency")
		return
	}



})

ipcMain.on('unspent:api', (e, address) => {
  console.log("ipc main address: ", address)
  if (address.currency === 'woodcoin') {
    try {
      const request = https.request(`https://api.logbin.org/api?address=${address.address}`, (response) => {
        console.log("im here")
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
        });

        response.on('end', async () => {
            const body = await JSON.parse(data);
						console.log("unspent body woodcoin: ", body)
            console.log("unspent body woodcoin: ", body.message.address)
            win.webContents.send('unspent:address', {"utxo":body.message.address, "currency":address.currency})
        });
     })

      request.on('error', (error) => {
          console.log('An error', error);
      });
      request.end()
    } catch(e) {
      console.log("error : ", e)
    }
  } else if (address.currency === 'bitcoin') {
    try {
      const options = {
        hostname: 'chain.so',
        path: `/api/v3/unspent_outputs/BTC/${address.address}/1`,
        port: 443,
        method: 'GET',
        headers: {
          'API-KEY': API_KEY
        }
      }
      const request = https.request(options , (response) => {
        console.log("im here")
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
        });

        response.on('end', async () => {
            const body = await JSON.parse(data);
            // console.log("body response", body)
            console.log("unspent body: ", body.data.outputs)
            win.webContents.send('unspent:address', {"utxo":body.data.outputs, "currency":address.currency})
        });
     })

      request.on('error', (error) => {
          console.log('An error', error);
      });
      request.end()
    } catch(e) {
      console.log("error : ", e)
    }
  } else if (address.currency === 'litecoin') {
    try {
      const options = {
        hostname: 'chain.so',
        path: `/api/v3/unspent_outputs/LTC/${address.address}/1`,
        port: 443,
        method: 'GET',
        headers: {
          'API-KEY': API_KEY
        }
      }
      const request = https.request(options, (response) => {
        console.log("im here")
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
        });

        response.on('end', async () => {
            const body = await JSON.parse(data);
            console.log("body response", body)
            console.log("ltc unspent body: ", body.data.outputs)
            win.webContents.send('unspent:address', {"utxo":body.data.outputs, "currency":address.currency})
        });
     })

      request.on('error', (error) => {
          console.log('An error', error);
      });
      request.end()
    } catch(e) {
      console.log("error : ", e)
    }
  } else {
      console.log("Chain not found")
      return
  }
})

ipcMain.on('get:user', async() => {
  if (fs.existsSync(homedir + "/.fscb/user.json")) {
    const user = await JSON.parse(fs.readFileSync(homedir + "/.fscb/user.json", "utf-8"))
    console.log("user data: ", user)
    win.webContents.send('response:user', user)
  }else {
    console.log()
  }
})

async function bankerPubkeyResponse(evt) {
  console.log(evt)
  if (fs.existsSync(homedir + "/.fscb/banker.json")) {
    const allbankers = await JSON.parse(fs.readFileSync(homedir + "/.fscb/banker.json", "utf-8"))
    console.log("got all bankers")
    for (const i in allbankers) {
      console.log("i: ", i)
      if (allbankers[i].banker_id == evt.banker_id) {
        allbankers[i].pubkey = evt.pubkey
        const wData = JSON.stringify(allbankers, null, 2)
        console.log(wData)
        fs.writeFile(homedir + "/.fscb/banker.json", wData, (err) => {
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
  if (fs.existsSync(homedir + "/.fscb/user.json")) {
    const user = await JSON.parse(fs.readFileSync(homedir + "/.fscb/user.json", "utf-8"))
    console.log("user log", user)
    evt.message = "response-pubkey"
    evt.pubkey = user.pubkey
    console.log(JSON.stringify(evt))
    win.webContents.send('response:pubkey', evt)
  }
}

async function importData(data) {

	if (data.user) {
		const user = JSON.stringify(data.user, null, 2)
		fs.writeFile(homedir + "/.fscb/user.json"
			, user, function writeJson(err) {
			if (err) return console.log(err);
			console.log('writing to user.json');
		});
	}
	if (data.bankers) {
		const bankers = JSON.stringify(data.bankers, null, 2)
		fs.writeFile(homedir + "/.fscb/banker.json"
			, bankers, function writeJson(err) {
			if (err) return console.log(err);
			console.log('writing to banker.json');
		});
	}
	if (data.accounts) {
		const accounts = JSON.stringify(data.accounts, null, 2)
		fs.writeFile(homedir + "/.fscb/data.json"
			, accounts, function writeJson(err) {
			if (err) return console.log(err);
			console.log('writing to data.json');
		});
	}

	/****/
	win.webContents.send('response:import-json', {})
}


/**
  Function that will update the account's withdrawal signature array
**/
async function bankerSignatureResponse(message) {
  if (fs.existsSync(homedir + "/.fscb/data.json")) {
    const accounts = await JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))
    console.log(accounts)
    let accountID = message.id
    let bankerID = message.banker_id
    let next_banker

		for (const [key, value] of Object.entries(accounts)) {
      let account = value
      if (account.id == accountID) {
				for (const [index, withdrawal] of account.withdrawals.entries()){
					if (withdrawal.id == message.withdrawal_id){
			    	for (const [index, signature] of withdrawal.signatures.entries()) {
				      if(signature.banker_id == bankerID) {
				        signature.transaction_id = message.transaction_id
				        signature.status = "SIGNED"
				        const date_signed = new Date()
				        signature.date_signed = date_signed

				        const updatedAccounts = JSON.stringify(accounts, null, 2)
				        fs.writeFile(homedir + "/.fscb/data.json"
				          , updatedAccounts, function writeJson(err) {
				          if (err)  {
				            console.log(err)
				          } else {
				            console.log("accounts updated")
				            // check number of signatures needed
										const signatures = withdrawal.signatures.filter(val => val.transaction_id != "");
										console.log("signatures: ", signatures);
				            if (signatures.length == account.signature_nedded) {
				              console.log("ready to broadcast")
				              win.webContents.send('withdrawal:ready-to-broadcast', message)
				            } else {
				              console.log("request signature to next banker")
											let data = {
												"account": account,
												"message": message
											}
											win.webContents.send('response:banker-signature', data)

				            }
				          }
				        });
				      }
			    	}
					}
				}
			}
		}
  }
}

ipcMain.on("owner:save-next-banker", async(e, data) => {
	let account = data.account
	let message = data.message
	let next_banker = data.parsedBanker

	console.log("data: ", data)

	if (fs.existsSync(homedir + "/.fscb/data.json")) {
    const accounts = await JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))

		for (const [key, value] of Object.entries(accounts)) {
      let acct = value
      if (acct.id == account.id) {
				for (const [index, withdrawal] of acct.withdrawals.entries()){
					if (withdrawal.id == message.withdrawal_id){

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
					    "currency": message.currency,
							"withdrawal_id": message.withdrawal_id,
					  }
					  console.log("new message: ", newMessage)

					  // Create new signature object in the account signature array
					  const newSignatory = {
					    "banker_id": next_banker.banker_id,
							"banker_name": next_banker.banker_name,
					    "date_requested": Date.now(),
					    "date_signed": null,
					    "status": "PENDING",
					    "transaction_id": "",
							"action": "Request for signature"
					  }
					  withdrawal.signatures.push(newSignatory)

					  const accountsNewSignatory = JSON.stringify(accounts, null, 2)
					  fs.writeFile(homedir + "/.fscb/data.json"
					    , accountsNewSignatory, function writeJson(err) {
					    if (err)  {
					      console.log("updating signatures for next banker to sign error: ", err)
					    } else {
					      console.log("signature updated for next banker to sign: ")
					      win.webContents.send('owner:show-banker-signature-message', newMessage)
					    }
					  })

					}
				}
			}
		}
	}
})

ipcMain.on("banker:addorsig", (e, options) => {
  e.preventDefault()
  // console.log(typeof(options))
	try {
	  const banker = JSON.parse(options)
	  console.log(banker)
	  if (banker.message.includes("request-pubkey")) {
	    //bankerPubkeyRequest(banker)
	    /**
	      Generate new keys for the account
	    **/
	    win.webContents.send('request:banker-pubkey', banker)
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
	  } else if (banker.message.includes("import:json-data")) {
	    console.log("import backup data")
	    importData(banker)
	  } else {
	    console.log("signature")
			win.webContents.send('import-text:invalid', {})
	  }
	} catch (e) {
		win.webContents.send('import-text:invalid', {})
	}
})

ipcMain.on('user:address', (e, options) => {
  console.log("user:address: ", options)
  let data = {
    "user_name": options.userName,
    "user_email": options.userEmail,
    // "address": options.userAddress.address,
    // "pubkey": options.userAddress.pubkey, // pubkey compressed 66 chars
    // "privkey": options.userAddress.wif, // privkey 52 chars base58
    // "wif": options.userAddress.privkey // privkey hex 64 chars
  }
  try {
    // const fileName = "user.json"
    const path = ".fscb"
    const wData = JSON.stringify(data, null, 2)
    fs.mkdir(homedir + "/" + path, { recursive: true}, function (err) {
      fs.writeFile(homedir + "/.fscb/user.json", wData, (err) => {
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
  const accounts = JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))
  const accountFilter = Object.values(accounts).filter(value => {
    console.log(value);
    return value.redeem_script === options.script;
  });
  console.log("account filter: ",JSON.stringify(accountFilter))
  win.webContents.send('account:filterSig', JSON.stringify(accountFilter))
});

ipcMain.on('signature:encode', (e, options) => {
  console.log(options)
  // const accounts = JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))
  // const accountFilter = Object.values(accounts).filter(value => {
  //   console.log(value);
  //   return value.id === options;
  // });
  // console.log("account filter: ",JSON.stringify(accountFilter))
  const path = ".fscb"
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
        const accounts = fs.readFileSync(homedir + "/.fscb/data.json", "utf-8")
        win.webContents.send("list:file", accounts)
        // win.webContents.send("send:newAccountSuccess", {})
      }
    })
  });
})


/**
	Function to create a backup file
**/
ipcMain.on('export:get-data', () => {

	console.log("export main")
  console.log("does data.json exist? : ", fs.existsSync(homedir + '/.fscb/data.json'))
	const user = fs.existsSync(homedir + '/.fscb/user.json') ? fs.readFileSync(homedir + "/.fscb/user.json", "utf-8") : null
	const bankers = fs.existsSync(homedir + '/.fscb/banker.json') ? fs.readFileSync(homedir + "/.fscb/banker.json", "utf-8") : null
	const accounts = fs.existsSync(homedir + '/.fscb/data.json') ? fs.readFileSync(homedir + "/.fscb/data.json", "utf-8") : null

	const parsedUser = user ? JSON.parse(user) : null
  const parsedBankers = bankers ? JSON.parse(bankers) : null
  const parsedAccounts = accounts ? JSON.parse(accounts) : null

  let accountJson = {
    "user": parsedUser,
    "bankers": parsedBankers,
    "accounts": parsedAccounts
  }

	let message = {
		"header": "free_state_central_bank",
		"message": "import:json-data",
		"user": parsedUser,
		"bankers": parsedBankers,
		"accounts": parsedAccounts
	}

  //console.log("json message: ", message)

	// let backup = "This is your FSCB backup. \n"
	// const textBegin = "----- Begin fscb message ----- \n"
	// const textEnd = "\n ----- End fscb message ----- \n"
	//
	// let backupMessage = backup + textBegin + JSON.stringify(message) + textEnd
	// console.log("backupMessage: ", backupMessage)

	/**
		Disabled. New backup flow, display data in a textarea and let the user copy and save it
	**/
	// const path = "data"
  // const fileName = "backup.txt"
	// fs.writeFile(homedir + "/" + path +"/"+ fileName, backupMessage, function writeJson(err, bytes) {
	// 	if (err) {
	// 		console.log(err)
	// 	} else {
	// 		console.log("successfully write backup, bytes: ", bytes);
	// 		win.webContents.send('export:response', {})
	// 		return
	// 	}
	// })

	win.webContents.send('export:response', message)

})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
