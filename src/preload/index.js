import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer and maintenance system APIs
const api = {
 
  getCategories: () => ipcRenderer.invoke('getCategories'),
  getSukuByKategori: (kategori) => ipcRenderer.invoke('getSukuByKategori', kategori),
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  addSukuCadang: (payload) => ipcRenderer.invoke('addSukuCadang', payload),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
