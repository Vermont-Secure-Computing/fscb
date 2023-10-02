const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  removeAllListeners: (channel, func) => {
      ipcRenderer.removeAllListeners(channel)
  }
});