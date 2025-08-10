
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  chooseChrome: () => ipcRenderer.invoke('choose-chrome'),
  runTasks: () => ipcRenderer.invoke('run-tasks'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  onLog: (cb) => ipcRenderer.on('log', (event, msg) => cb(msg))
});
