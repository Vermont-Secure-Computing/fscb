const { app, BrowserWindow, ipcMain, ipcRenderer, clipboard } = require('electron');
const path = require('path');
const https = require('https');
const homedir = require('os').homedir();
const fs = require("fs");
const contextMenu = require('electron-context-menu');
const jsonFile = homedir + "/.fscb/data.json"
const jsonFileBanker = homedir + "/.fscb/banker.json"

const config = require('dotenv');
config.config({
  path: '.env'
})
const {
  API_KEY
} = process.env

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


  const existsUser = fs.existsSync(homedir + '/.fscb/user.json')


  win.loadFile('src/index.html').then(() => {

    if (existAccount) {
      const accounts = fs.readFileSync(homedir +  "/.fscb/data.json", "utf-8");
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
  try {
    const accounts = await JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))
    let checker = false
    for (const [key, value] of Object.entries(accounts)) {
      let acct = value
      if (acct.address === address && acct.redeem_script) {
        checker = true
        break;
      }
    }

  	return checker
  } catch(e) {
    if (e.code === "ENOENT") return false
  }
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

  let data = {
      "id": Math.floor(1000000000 + Math.random() * 9000000000),
      "contract_id": getIdNumber,
      "contract_name": options.contractSendName,
      "creator_name": options.creatorSendName,
      "creator_email": options.creatorSendEmail,
      "bankers": mergeBankers,
      "signature_nedded": options.sigSendNumber,
      "address": options.pubkeySend,
      "redeem_script": options.redeemScriptSend,
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
          const wData = JSON.stringify(jdata, null, 2)
          fs.writeFile(homedir + "/" + path +"/"+ fileName, wData, function writeJson() {
            if (err) {
              console.log(err)
            } else {
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

})

ipcMain.on('message:addBanker', (e, options) => {
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
        const addBanker = {
          ["banker" + getBankerIdNumber]: data
        }
        const sData = JSON.stringify(addBanker, null, 2)
        fs.writeFile(homedir + "/" + path +"/"+ fileName
          , sData, function writeJson() {
          if (err) return console.log(err);
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
      jdata = JSON.parse(jdata);
      win.webContents.send('send:bankers', jdata)
    })
  }
  return
}

ipcMain.on('click:addBanker', () => {
  readBankersFile()
})


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
	const txid = message.transaction_id
	const accountId = message.id
	const withdrawalId = message.withdrawal_id

	if (message.currency === "woodcoin") {
		try {
	    const request = https.request(`https://api.logbin.org/api/broadcast/r?transaction=${txid}`, (response) => {
	      let data = '';
	      response.on('data', (chunk) => {
	          data = data + chunk.toString();
	      });

	      response.on('end', async () => {
	          const body = await JSON.parse(data);

						if (body.message) {
							const accounts = await JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))
							for (const [key, value] of Object.entries(accounts)) {
					      let account = value
					      if (account.id == accountId) {
									for (const [index, withdrawal] of account.withdrawals.entries()){
										if (withdrawal.id == withdrawalId){
											withdrawal.date_broadcasted = Date.now()
											withdrawal.txid = body.message.result
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
		      let data = '';
		      response.on('data', (chunk) => {
		          data = data + chunk.toString();
		      });

		      response.on('end', async () => {
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

							if (body.message) {
								const accounts = await JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))
								for (const [key, value] of Object.entries(accounts)) {
						      let account = value
						      if (account.id == accountId) {
										for (const [index, withdrawal] of account.withdrawals.entries()){
											if (withdrawal.id == withdrawalId){
												withdrawal.date_broadcasted = Date.now()
												withdrawal.txid = body.data.hash
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
  if (address.currency === 'woodcoin') {
    try {
      const request = https.request(`https://api.logbin.org/api?address=${address.address}`, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
        });

        response.on('end', async () => {
            const body = await JSON.parse(data);
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
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
        });

        response.on('end', async () => {
            const body = await JSON.parse(data);
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
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
        });

        response.on('end', async () => {
            const body = await JSON.parse(data);
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
    win.webContents.send('response:user', user)
  }else {
    console.log()
  }
})

async function bankerPubkeyResponse(evt) {
  if (fs.existsSync(homedir + "/.fscb/banker.json")) {
    const allbankers = await JSON.parse(fs.readFileSync(homedir + "/.fscb/banker.json", "utf-8"))
    for (const i in allbankers) {
      if (allbankers[i].banker_id == evt.banker_id) {
        allbankers[i].pubkey = evt.pubkey
        const wData = JSON.stringify(allbankers, null, 2)
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
    evt.message = "response-pubkey"
    evt.pubkey = user.pubkey
    win.webContents.send('response:pubkey', evt)
  }
}

async function importData(data) {

	if (data.user) {
		const user = JSON.stringify(data.user, null, 2)
		fs.writeFile(homedir + "/.fscb/user.json"
			, user, function writeJson(err) {
			if (err) return console.log(err);
		});
	}
	if (data.bankers) {
		const bankers = JSON.stringify(data.bankers, null, 2)
		fs.writeFile(homedir + "/.fscb/banker.json"
			, bankers, function writeJson(err) {
			if (err) return console.log(err);
		});
	}
	if (data.accounts) {
		const accounts = JSON.stringify(data.accounts, null, 2)
		fs.writeFile(homedir + "/.fscb/data.json"
			, accounts, function writeJson(err) {
			if (err) return console.log(err);
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
				            // check number of signatures needed
										const signatures = withdrawal.signatures.filter(val => val.transaction_id != "");
				            if (signatures.length == account.signature_nedded) {
				              win.webContents.send('withdrawal:ready-to-broadcast', message)
				            } else {
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
	try {
	  const banker = JSON.parse(options)
	  if (banker.message.includes("request-pubkey")) {
	    //bankerPubkeyRequest(banker)
	    /**
	      Generate new keys for the account
	    **/
	    win.webContents.send('request:banker-pubkey', banker)
	  }else if (banker.message.includes("response-pubkey")) {
	    bankerPubkeyResponse(banker)
	  }else if (banker.message.includes("request-signature")) {
	    win.webContents.send('request:banker-signature', banker)
	  } else if (banker.message.includes("response-signature")) {
	    bankerSignatureResponse(banker)
	  } else if (banker.message.includes("import:json-data")) {
	    importData(banker)
	  } else {
			win.webContents.send('import-text:invalid', {})
	  }
	} catch (e) {
		win.webContents.send('import-text:invalid', {})
	}
})

ipcMain.on('user:address', (e, options) => {
  let data = {
    "user_name": options.userName,
    "user_email": options.userEmail,
  }
  try {
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
  const accounts = JSON.parse(fs.readFileSync(homedir + "/.fscb/data.json", "utf-8"))
  const accountFilter = Object.values(accounts).filter(value => {
    return value.redeem_script === options.script;
  });
  win.webContents.send('account:filterSig', JSON.stringify(accountFilter))
});

ipcMain.on('signature:encode', (e, options) => {
  const path = ".fscb"
  const fileName = "data.json"
  fs.readFile(homedir + "/" + path +"/"+ fileName, 'utf8', function(err, jdata){
    jdata = JSON.parse(jdata);
    //Step 3: append contract variable to list
    jdata["contract" + options.id] = options.contract
    const wData = JSON.stringify(jdata, null, 2)
    fs.writeFile(homedir + "/" + path +"/"+ fileName, wData, function writeJson() {
      if (err) {
        console.log(err)
      } else {
        const accounts = fs.readFileSync(homedir + "/.fscb/data.json", "utf-8")
        win.webContents.send("list:file", accounts)
      }
    })
  });
})


/**
	Function to create a backup file
**/
ipcMain.on('export:get-data', () => {

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

	win.webContents.send('export:response', message)

})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
