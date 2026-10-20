const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  onOpenAddModal: (callback) => {
    ipcRenderer.on('action-open-add-modal', callback)
    return () => ipcRenderer.removeListener('action-open-add-modal', callback)
  }
})
