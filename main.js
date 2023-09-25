const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require("fs");
const jsonFile = "./data/data.json"
const jsonFileBanker = "./data/banker.json"

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

  const test = fs.readFileSync("./testing.json", "utf-8")
  // console.log(test)

  win.loadFile('src/index.html').then(() => {
    win.webContents.send("list:file", test)
  }).then(() => win.show())

  // const test = fs.readFileSync("./testing.json", "utf-8")
  // win.webContents.send("list:file", test)
  // console.log(test)
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
      console.log("length: ", jconvert[Object.keys(jconvert)[Object.keys(jconvert).length - 1]].banker_id)
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
  // console.log("rederer send", options)
  const getIdNumber = idNumber()
  pathMessage = 'message'
  // console.log(options.bankersMerge)
  const mybankers = fs.readFileSync("./data/banker.json", "utf-8")
  const bankersParse = JSON.parse(mybankers)
  // console.log(typeof(bankersParse))
  let mergeBankers = []
  for (let i = 0; i < options.bankersMerge.length; i++ ) {
    for (let j in bankersParse) {
      if (options.bankersMerge[i] === bankersParse[j].banker_email) {
        bankersParse[j].signature = ""
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
      // "creator_pubkey": options.creatorAddressDetail.pubkey,
      // "creator_address": options.creatorAddressDetail.address,
      // "creator_wif": options.creatorAddressDetail.wif,
      // "creator_privkey": options.creatorAddressDetail.privkey,
      "claimed": "false"
  }
  const sData = JSON.stringify(data, null, 2)
  const fileName = "data.json"
  const path = "data"
  try {
    fs.mkdir(path, { recursive: true}, function (err) {
      if (err) return err;
      if (fs.existsSync(jsonFile)) {
        fs.readFile(path +"/"+ fileName, 'utf8', function(err, jdata){
          jdata = JSON.parse(jdata);
          //Step 3: append contract variable to list
          jdata["contract" + getIdNumber] = data
          // console.log(jdata);
          const wData = JSON.stringify(jdata, null, 2)
          fs.writeFile(path +"/"+ fileName, wData, function writeJson() {
            if (err) return console.log(err);
          })
      });
      } else {
        const addContract = {
          ["contract" + getIdNumber]: data
        }
        const sData = JSON.stringify(addContract, null, 2)
        fs.writeFile(path +"/"+ fileName
          , sData, function writeJson() {
          if (err) return console.log(err);
          // console.log(JSON.stringify(sData));
          // console.log('writing to ' + fileName);
        });
      }
    });
  } catch (e) {
    console.log(e)
  }
  console.log("Success")
})

ipcMain.on('message:addBanker', (e, options) => {
  console.log(options)
  const getBankerIdNumber = bankerIdNumber()
  let data = {
    "id": Math.floor(1000000000 + Math.random() * 9000000000),
    "banker_id": getBankerIdNumber,
    "banker_name": options.bankerName,
    "banker_email": options.bankerEmail,
    "pubkey": ""
  }
  const fileName = "banker.json"
  const path = "data"
  try {
    fs.mkdir(path, { recursive: true}, function (err) {
      if (err) return err;
      if (fs.existsSync(jsonFileBanker)) {
        fs.readFile(path +"/"+ fileName, 'utf8', function(err, jdata){
          jdata = JSON.parse(jdata);
          //Step 3: append contract variable to list
          jdata["banker" + getBankerIdNumber] = data
          console.log(jdata);
          const wData = JSON.stringify(jdata, null, 2)
          fs.writeFile(path +"/"+ fileName, wData, function writeJson() {
            if (err) return console.log(err);
          })
      });
      } else {
        const addBanker = {
          ["banker" + getBankerIdNumber]: data
        }
        const sData = JSON.stringify(addBanker, null, 2)
        fs.writeFile(path +"/"+ fileName
          , sData, function writeJson() {
          if (err) return console.log(err);
          // console.log(JSON.stringify(sData));
          console.log('writing to ' + fileName);
        });
      }
    });
  } catch (e) {
    console.log(e)
  }
})

ipcMain.on('click:addBanker', () => {
  const fileName = "banker.json"
  const path = "data"
  fs.readFile(path +"/"+ fileName, 'utf8', function(err, jdata){
    jdata = JSON.parse(jdata);
    //Step 3: append contract variable to list
    // console.log(jdata);
    // const wData = JSON.stringify(jdata, null, 2)
    win.webContents.send('send:bankers', jdata)
    })
})

// async function loadListFile() {
//   const test = fs.readFileSync("./testing.json", "utf-8")
//   win.webContents.send("list:file", test)
//   // console.log(test)
// }

// loadListFile()

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
