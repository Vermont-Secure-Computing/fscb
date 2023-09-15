const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require("fs");
const jsonFile = "./data/data.json"

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

// idNumber()



ipcMain.on("message:contractnew", (e, options) => {
  // console.log("rederer send", options)
  const getIdNumber = idNumber()
  pathMessage = 'message'
  // const contractTextReference = options.contractSendName +"-"+ options.creatorSendEmail +"-"+ "contract"+getIdNumber+".txt";
  for (let i = 0; i < options.bankersMerge.length; i++) {
    let textData = `contract_id: ${getIdNumber} \n
    banker_id: ${options.bankersMerge[i].banker_id}
    creator_name: ${options.creatorSendName} \n
    creator_email: ${options.creatorSendEmail} \n
    banker_name: ${options.bankersMerge[i].banker_name} \n
    banker_email: ${options.bankersMerge[i].banker_email} \n
    banker_respons_address: ${options.bankersMerge[i].banker_response_address}`
    fs.mkdir(pathMessage, { recursive: true}, function (err) {
      //     if (err) return err;
      fs.writeFile(pathMessage +"/"+ options.bankersMerge[i].banker_request_address
        , textData, function writeText() {
        if (err) return console.log(err);
        // console.log(JSON.stringify(sData));
        console.log('writing to ' + options.bankersMerge[i].banker_request_address);
      });
    })

  }

  let data = {
      "contract_id": getIdNumber,
      // "txt_file_reference": contractTextReference,
      "contract_name": options.contractSendName,
      "creator_name": options.creatorSendName,
      "creator_email": options.creatorSendEmail,
      "bankers": options.bankersMerge,
      "signature_nedded": options.sigSendNumber,
      "creator_pubkey": options.creatorAddressDetail.pubkey,
      "creator_address": options.creatorAddressDetail.address,
      "creator_wif": options.creatorAddressDetail.wif,
      "creator_privkey": options.creatorAddressDetail.privkey,
         "claimed": "false"
  }
  // const sData = JSON.stringify(data, null, 2)
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
          console.log(jdata);
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
          console.log('writing to ' + fileName);
        });
      }
    });
  } catch (e) {
    console.log(e)
  }
  console.log("Success")
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
