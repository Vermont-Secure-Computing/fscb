const { contextBridge, ipcRenderer } = require('electron');
const Toastify = require('toastify-js');

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) =>
    ipcRenderer.send(channel, data),

  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) =>
      func(event, ...args)
    ),

  once: (channel, func) =>
    ipcRenderer.once(channel, (event, ...args) =>
      func(event, ...args)
    ),

  removeAllListeners: (channel) =>
    ipcRenderer.removeAllListeners(channel),
});

contextBridge.exposeInMainWorld('Toastify', {
  toast: (options) => Toastify(options).showToast(),
});
