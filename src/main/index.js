import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  completeRepair,
  getKendaraan,
  getCategories,
  getSukuByKategori,
  getReports,
  login,
  addSukuCadang,
  addKendaraan,
  updateKendaraanStatus,
  getMechanics,
  getKendaraanForMekanik,
  getAssignedRepairByVehicle,
  assignRepair,
  addLogPerbaikan,
  deleteKendaraan,
  addMechanic
} from './model'
import fs from 'fs'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // ==========================================
  // MAINTENANCE SYSTEM HANDLERS (SUDAH DIPERBAIKI)
  // ==========================================
  ipcMain.handle('completeRepair', (event, payload) => completeRepair(event, payload))
  ipcMain.handle('getKendaraan', (event) => getKendaraan(event))
  ipcMain.handle('getKendaraanForMekanik', (event, id_user) => getKendaraanForMekanik(event, id_user))
  ipcMain.handle('getCategories', (event) => getCategories(event))
  ipcMain.handle('getSukuByKategori', (event, kategori) => getSukuByKategori(event, kategori))
  ipcMain.handle('getReports', (event) => getReports(event))
  ipcMain.handle('login', (event, username, password) => login(event, username, password))
  ipcMain.handle('getMechanics', (event) => getMechanics(event))
  ipcMain.handle('assignRepair', (event, payload) => assignRepair(event, payload))
  ipcMain.handle('getAssignedRepairByVehicle', (event, payload) => getAssignedRepairByVehicle(event, payload))
  ipcMain.handle('addSukuCadang', (event, payload) => addSukuCadang(event, payload))
  ipcMain.handle('addKendaraan', (event, payload) => addKendaraan(event, payload))
  ipcMain.handle('updateKendaraanStatus', (event, payload) => updateKendaraanStatus(event, payload))
  ipcMain.handle('addLogPerbaikan', (event, payload) => addLogPerbaikan(event, payload))
  ipcMain.handle('deleteKendaraan', (event, nomor_polisi) => deleteKendaraan(event, nomor_polisi))
  ipcMain.handle('addMechanic', (event, payload) => addMechanic(event, payload))

  ipcMain.handle('printPDF', async (event) => {
    const { canceled, filePath: savePath } = await dialog.showSaveDialog({
      title: 'Save report',
      defaultPath: 'report.pdf'
    })

    if (canceled || !savePath) {
      return { success: false, canceled: true }
    }

    const win = BrowserWindow.fromWebContents(event.sender)
    try {
      const data = await win.webContents.printToPDF({ printBackground: true, pageSize: 'A4' })
      await fs.promises.writeFile(savePath, data)
      return { success: true, path: savePath }
    } catch (err) {
      const message = err?.message || 'Failed to generate PDF'
      const locked = err?.code === 'EBUSY' || err?.code === 'EPERM' || err?.code === 'EACCES'
      if (locked) {
        return {
          success: false,
          canceled: false,
          error: `File sedang digunakan atau terkunci: ${savePath}. Tutup file tersebut dan coba lagi.`
        }
      }
      return { success: false, canceled: false, error: message }
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})