const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
// Disable GPU on Linux to avoid DRM/Mesa issues
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-gpu-compositing");
// optional: force software GL
app.commandLine.appendSwitch("use-gl", "swiftshader");
const path = require('path');
const https = require('https');
const homedir = require('os').homedir();
const fs = require("fs");
const contextMenu = require('electron-context-menu');
const jsonFile = homedir + "/.fscb/data.json"
const jsonFileBanker = homedir + "/.fscb/banker.json"

let CURRENT_API_PROVIDER = "mempool";
let CURRENT_API_KEY = null;

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");


// const config = require('dotenv');
// config.config({
//   path: '.env'
// })
// const {
//   API_KEY
// } = process.env

const isDev = process.env.NODE_ENV !== 'production';

let win;

contextMenu({
	showSaveImageAs: true
});

const createWindow = () => {
  // Create splash window
  var splash = new BrowserWindow({
    width: 1200,
    height: 740,
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
      width: 1200,
      height: 740,
      resizable: isDev,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        devTools: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Show devtools automatically if in development
    // if (isDev) {
    //   win.webContents.openDevTools();
    // }


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

ipcMain.on("api:state", (e, state) => {
  CURRENT_API_PROVIDER = state.apiProvider || "mempool";
  CURRENT_API_KEY = state.apiKey || null;

  console.log("[API] Provider:", CURRENT_API_PROVIDER);
});

const DATA_PATH = homedir + "/.fscb/data.json";
const BANKER_PATH = homedir + "/.fscb/banker.json";

function writeDataJsonSafely(mutatorFn) {
  let data;

  try {
    data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) {
    console.error("data.json corrupted — aborting write");
    return;
  }

  // mutate in memory
  mutatorFn(data);

  // atomic write
  const tmp = DATA_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DATA_PATH);

  win.webContents.send("list:file", fs.readFileSync(DATA_PATH, "utf-8"));
}

function writeBankerJsonSafely(mutatorFn) {
  let data = {};

  if (fs.existsSync(BANKER_PATH)) {
    try {
      data = JSON.parse(fs.readFileSync(BANKER_PATH, "utf8"));
    } catch (e) {
      console.error("banker.json corrupted — aborting write");
      return;
    }
  }

  // mutate in memory
  mutatorFn(data);

  // atomic write
  const tmp = BANKER_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, BANKER_PATH);
}


function resolveExplorerHost(provider, currency) {
  if (provider !== "mempool") return null;

  if (currency === "bitcoin") return "mempool.space";
  if (currency === "litecoin") return "litecoinspace.org";

  return null; // unsupported
}

function addressMatchesCurrency(currency, address) {
  if (currency === "bitcoin") {
    return address.startsWith("bc1") ||
           address.startsWith("1") ||
           address.startsWith("3");
  }

  if (currency === "litecoin") {
    return address.startsWith("ltc1") ||
           address.startsWith("L") ||
           address.startsWith("M");
  }

  return true;
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
    if (!fs.existsSync(jsonFile)) return 1;

    const dataJson = fs.readFileSync(jsonFile, "utf-8");
    const jconvert = JSON.parse(dataJson);

    const ids = Object.values(jconvert)
      .map(v => Number(v.contract_id))
      .filter(Number.isFinite);

    return ids.length ? Math.max(...ids) + 1 : 1;

  } catch (err) {
    console.error("idNumber error:", err);
    return 1;
  }
}


function bankerIdNumber() {
  try {
    if (!fs.existsSync(jsonFileBanker)) return 1;

    const dataJson = fs.readFileSync(jsonFileBanker, "utf-8");
    const jconvert = JSON.parse(dataJson);

    const ids = Object.values(jconvert)
      .map(v => Number(v.banker_id))
      .filter(Number.isFinite);

    return ids.length ? Math.max(...ids) + 1 : 1;

  } catch (err) {
    console.error("bankerIdNumber error:", err);
    return 1;
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
      if (acct.address === address && acct.redeem_script === redeemScript) {
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
  let bankersParse = {};
  if (fs.existsSync(homedir + "/.fscb/banker.json")) {
    bankersParse = JSON.parse(
      fs.readFileSync(homedir + "/.fscb/banker.json", "utf-8")
    );
  }
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
  try {
    fs.mkdirSync(homedir + "/.fscb", { recursive: true });

    const bankerId = bankerIdNumber();

    const bankerData = {
      id: Math.floor(1000000000 + Math.random() * 9000000000),
      banker_id: bankerId,
      banker_name: options.bankerName,
      banker_email: options.bankerEmail,
      currency: options.bankerCurrency,
      pubkey: ""
    };

    // SAFE write
    writeBankerJsonSafely((json) => {
      json["banker" + bankerId] = bankerData;
    });

    // notify renderer
    win.webContents.send("send:newBanker", bankerData);
    readBankersFile();

  } catch (e) {
    console.error("add banker error:", e);
  }
});



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


ipcMain.on('balance:api', (e, options = {}) => {
  if (!fs.existsSync(DATA_PATH)) return;

  // DEFAULT = mempool (no API key needed)
  const provider =
    options.apiProvider ??
    CURRENT_API_PROVIDER ??
    "mempool";

  const apiKey =
    options.apiKey ??
    CURRENT_API_KEY ??
    null;


  if (provider === "blockcypher" && !apiKey) {
    win.webContents.send("balance:error", {
      message: "BlockCypher API key not set"
    });
    return;
  }

  let accounts;
  try {
    accounts = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch {
    win.webContents.send("balance:error", {
      message: "Invalid data.json"
    });
    return;
  }

  for (const key of Object.keys(accounts)) {
    const acct = accounts[key];

    // =================================================
    // WOODCOIN (unchanged)
    // =================================================
    if (acct.currency === "woodcoin") {
      https.get(`https://twigchain.com/ext/getAddress/${acct.address}`, res => {
        let data = "";
        res.on("data", c => data += c);
        res.on("end", () => {
          try {
            const body = JSON.parse(data);
            writeDataJsonSafely(json => {
              json[key].confirmed_balance = body.balance;
              json[key].unconfirmed_balance = 0;
              json[key].balance = body.balance;
            });
          } catch (e) {
            console.error("woodcoin balance error:", e);
          }
        });
      });
      continue;
    }

    // =================================================
    // BTC / LTC
    // =================================================
    

    if (!addressMatchesCurrency(acct.currency, acct.address)) {
      console.warn(
        "Skipping balance refresh — address/currency mismatch:",
        acct.currency,
        acct.address
      );
      continue;
    }

    // =================================================
    // MEMPOOL.SPACE (DEFAULT)
    // =================================================
    if (provider === "mempool") {
      const explorer = resolveExplorerHost(provider, acct.currency);
    
      if (!explorer) {
        continue; // skip unsupported coins (woodcoin, etc.)
      }
    
      https.request({
        hostname: explorer,
        path: `/api/address/${acct.address}`,
        method: "GET",
        headers: { Accept: "application/json" }
      }, res => {
        let data = "";
        res.on("data", c => data += c);
        res.on("end", () => {
          const ct = res.headers["content-type"] || "";
    
          // ⚠️ Esplora returns text/plain on errors
          if (!ct.includes("application/json")) {
            console.error(`${explorer} non-JSON response:`, data);
            return;
          }
    
          let body;
          try {
            body = JSON.parse(data);
          } catch {
            console.error(`${explorer} JSON parse failed`);
            return;
          }
    
          const confirmed =
            body.chain_stats.funded_txo_sum -
            body.chain_stats.spent_txo_sum;
    
          const unconfirmed =
            body.mempool_stats.funded_txo_sum -
            body.mempool_stats.spent_txo_sum;
    
          writeDataJsonSafely(json => {
            json[key].confirmed_balance = confirmed;
            json[key].unconfirmed_balance = unconfirmed;
            json[key].balance = confirmed + unconfirmed;
          });
        });
      }).end();
    
      continue;
    }

    // =================================================
    // BLOCKCYPHER (OPTIONAL)
    // =================================================
    else if (provider === "blockcypher") {
      let coinPath;
      switch (acct.currency) {
        case "bitcoin":
          coinPath = "btc/main";
          break;
        case "litecoin":
          coinPath = "ltc/main";
          break;
        default:
          console.warn("BlockCypher unsupported currency:", acct.currency);
          continue;
      }
      const path =
        `/v1/${coinPath}/addrs/${acct.address}/balance` +
        `?token=${encodeURIComponent(apiKey)}`;

      https.request({
        hostname: "api.blockcypher.com",
        path,
        method: "GET",
        headers: { Accept: "application/json" }
      }, res => {
        let data = "";
        res.on("data", c => data += c);
        res.on("end", () => {
          try {
            const body = JSON.parse(data);

            const confirmed = body.balance || 0;
            const unconfirmed = body.unconfirmed_balance || 0;

            writeDataJsonSafely(json => {
              json[key].confirmed_balance = confirmed;
              json[key].unconfirmed_balance = unconfirmed;
              json[key].balance = confirmed + unconfirmed;
            });

          } catch (e) {
            console.error("BlockCypher balance parse error:", e);
          }
        });
      }).end();
    }
  }
});




ipcMain.on('withdrawal:api', (e, message = {}) => {
  const {
    transaction_id: txHex,
    id: accountId,
    withdrawal_id: withdrawalId,
    currency,
    apiProvider,
    apiKey
  } = message;

  const provider =
    apiProvider ??
    CURRENT_API_PROVIDER ??
    "mempool";

  const key =
    apiKey ??
    CURRENT_API_KEY ??
    null;


  if (!txHex || !currency) {
    win.webContents.send('withdrawal:broadcast-response', {
      error: { message: 'Invalid withdrawal request' }
    });
    return;
  }

  // =================================================
  // WOODCOIN (UNCHANGED)
  // =================================================
  if (currency === "woodcoin") {
    try {
      https.get(
        `https://api.logbin.org/api/broadcast/r?transaction=${txHex}`,
        res => {
          let data = "";
          res.on("data", c => data += c);
          res.on("end", () => {
            let body;
            try {
              body = JSON.parse(data);
            } catch {
              win.webContents.send('withdrawal:broadcast-response', {
                error: { message: 'Invalid response from woodcoin API' }
              });
              return;
            }

            if (!body?.message?.result) {
              win.webContents.send('withdrawal:broadcast-response', {
                error: { message: 'Broadcast failed' }
              });
              return;
            }

            writeDataJsonSafely(json => {
              for (const acct of Object.values(json)) {
                if (acct.id == accountId) {
                  for (const w of acct.withdrawals) {
                    if (w.id == withdrawalId) {
                      w.date_broadcasted = Date.now();
                      w.txid = body.message.result;
                    }
                  }
                }
              }
            });

            win.webContents.send('withdrawal:broadcast-response', {
              message: { result: body.message.result }
            });
          });
        }
      );
    } catch (e) {
      console.error("woodcoin broadcast error:", e);
    }
    return;
  }

  // =================================================
  // MEMPOOL MODE (DEFAULT)
  //  =================================================
  if (provider === "mempool") {
    const explorer = resolveExplorerHost("mempool", currency);
    if (!explorer) return;

    const postData = txHex;

    const req = https.request({
      hostname: explorer,
      path: "/api/tx",
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": Buffer.byteLength(postData)
      }
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        if (!res.statusCode || res.statusCode >= 300) {
          win.webContents.send('withdrawal:broadcast-response', {
            error: { message: data || "Broadcast failed" }
          });
          return;
        }

        const txid = data.trim();

        writeDataJsonSafely(json => {
          for (const acct of Object.values(json)) {
            if (acct.id == accountId) {
              for (const w of acct.withdrawals) {
                if (w.id == withdrawalId) {
                  w.date_broadcasted = Date.now();
                  w.txid = txid;
                }
              }
            }
          }
        });

        win.webContents.send('withdrawal:broadcast-response', {
          message: { result: txid }
        });
      });
    });

    req.on("error", err => {
      win.webContents.send('withdrawal:broadcast-response', {
        error: { message: err.message }
      });
    });

    req.write(postData);
    req.end();
    return;
  }

  // =================================================
  // BLOCKCYPHER (OPTIONAL FALLBACK)
  // =================================================
  if (provider === "blockcypher") {
    if (!key) {
      win.webContents.send('withdrawal:broadcast-response', {
        error: { message: 'BlockCypher API key not set' }
      });
      return;
    }

    // Map currency → BlockCypher chain
    let coinPath;
    switch (currency) {
      case "bitcoin":
        coinPath = "btc/main";
        break;
      case "litecoin":
        coinPath = "ltc/main";
        break;
      default:
        win.webContents.send('withdrawal:broadcast-response', {
          error: { message: `BlockCypher unsupported currency: ${currency}` }
        });
        return;
    }

    const postData = JSON.stringify({ tx: txHex });

    const req = https.request({
      hostname: "api.blockcypher.com",
      path: `/v1/${coinPath}/txs/push?token=${encodeURIComponent(key)}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        let resp;
        try {
          resp = JSON.parse(data);
        } catch {
          win.webContents.send('withdrawal:broadcast-response', {
            error: { message: "Invalid BlockCypher response" }
          });
          return;
        }

        if (!resp?.tx?.hash) {
          win.webContents.send('withdrawal:broadcast-response', {
            error: { message: resp?.errors?.[0]?.error || "Broadcast failed" }
          });
          return;
        }

        writeDataJsonSafely(json => {
          for (const acct of Object.values(json)) {
            if (acct.id == accountId) {
              for (const w of acct.withdrawals) {
                if (w.id == withdrawalId) {
                  w.date_broadcasted = Date.now();
                  w.txid = resp.tx.hash;
                }
              }
            }
          }
        });

        win.webContents.send('withdrawal:broadcast-response', {
          message: { result: resp.tx.hash }
        });
      });
    });

    req.write(postData);
    req.end();
  }
});



ipcMain.on('unspent:api', (e, payload = {}) => {
  const { address, currency, apiProvider, apiKey } = payload;

  if (!currency || !address) {
    win.webContents.send('unspent:error', {
      message: 'Invalid address request'
    });
    return;
  }

  const provider = apiProvider ?? CURRENT_API_PROVIDER ?? "mempool";
  const key = apiKey ?? CURRENT_API_KEY ?? null;

  // =========================
  // WOODCOIN (UNCHANGED)
  // =========================
  if (currency === 'woodcoin') {
    try {
      https.get(
        `https://api.logbin.org/api?address=${address}`,
        res => {
          let data = "";
          res.on("data", c => data += c);
          res.on("end", () => {
            const body = JSON.parse(data);
            win.webContents.send('unspent:address', {
              utxo: body.message.address,
              currency: currency
            });
          });
        }
      ).on("error", err => {
        win.webContents.send('unspent:error', { message: err.message });
      });
    } catch (e) {
      console.error("woodcoin utxo error:", e);
    }
    return;
  }

  // =========================
  // Address ↔ currency guard
  // =========================
  if (!addressMatchesCurrency(currency, address)) {
    console.warn(
      "Skipping UTXO fetch — address/currency mismatch:",
      currency,
      address
    );
    return;
  }

  // =========================
  // MEMPOOL MODE (DEFAULT)
  // =========================
  if (provider === "mempool") {
    const explorer = resolveExplorerHost("mempool", currency);
    if (!explorer) return;

    https.request({
      hostname: explorer,
      path: `/api/address/${address}/utxo`,
      method: "GET",
      headers: { Accept: "application/json" }
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        const ct = res.headers["content-type"] || "";
        if (!ct.includes("application/json")) {
          console.error(`${explorer} non-JSON UTXO response:`, data);
          return;
        }

        let utxos;
        try {
          utxos = JSON.parse(data);
        } catch {
          console.error(`${explorer} UTXO JSON parse failed`);
          return;
        }

        // CONFIRMED ONLY (safe spending)
        const confirmed = utxos
          .filter(u => u.status?.confirmed)
          .map(u => ({
            tx_hash: u.txid,
            output_no: u.vout,
            value: u.value,
            confirmations: u.status.confirmed ? 1 : 0,
            script_hex: u.scriptpubkey
          }));

        win.webContents.send('unspent:address', {
          utxo: confirmed,
          currency: currency
        });
      });
    }).end();

    return;
  }

  // =========================
  // BLOCKCYPHER (OPTIONAL)
  // =========================
  if (provider === "blockcypher") {
    if (!key) {
      win.webContents.send('unspent:error', {
        message: 'BlockCypher API key not set'
      });
      return;
    }

    // Map currency → BlockCypher chain
    let coinPath;
    switch (currency) {
      case "bitcoin":
        coinPath = "btc/main";
        break;
      case "litecoin":
        coinPath = "ltc/main";
        break;
      default:
        win.webContents.send('unspent:error', {
          message: `BlockCypher unsupported currency: ${currency}`
        });
        return;
    }


    const path =
      `/v1/${coinPath}/addrs/${address}` +
      `?unspentOnly=true&includeScript=true&token=${encodeURIComponent(key)}`;

    https.request({
      hostname: "api.blockcypher.com",
      path,
      method: "GET",
      headers: { Accept: "application/json" }
    }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        let resp;
        try {
          resp = JSON.parse(data);
        } catch {
          win.webContents.send('unspent:error', {
            message: 'Invalid response from BlockCypher'
          });
          return;
        }

        const all = [
          ...(resp.txrefs || []),
          ...(resp.unconfirmed_txrefs || [])
        ];

        const utxo = all
          .filter(u => u.confirmations > 0)
          .map(u => ({
            tx_hash: u.tx_hash,
            output_no: u.tx_output_n,
            value: u.value,
            confirmations: u.confirmations,
            script_hex: u.script
          }));

        win.webContents.send('unspent:address', {
          utxo,
          currency: currency
        });
      });
    }).end();
  }
});




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

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

