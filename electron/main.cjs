const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow = null
let tray = null
let isQuitting = false

// Configure auto-launch at login
function ensureLoginSettings(enabled = true) {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true, // Start in background tray on boot
      name: 'CS Projects Vault'
    })
  } catch (err) {
    console.error('Failed to set login item settings:', err)
  }
}

// Ensure default open-at-login on initial setup if not configured
const initialLoginSettings = app.getLoginItemSettings()
if (!initialLoginSettings.openAtLogin) {
  ensureLoginSettings(true)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 850,
    minHeight: 620,
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 22 },
    show: false, // Don't show immediately to prevent flash
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  })

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  const startUrl = isDev
    ? (process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
    : `file://${path.join(__dirname, '../dist/index.html')}`

  // Load URL with automatic retry in dev mode if Vite is booting
  function loadAppUrl() {
    mainWindow.loadURL(startUrl).catch(() => {
      if (isDev) {
        setTimeout(loadAppUrl, 600)
      } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
      }
    })
  }

  loadAppUrl()

  // Gracefully show window when ready, unless opened hidden at login
  mainWindow.once('ready-to-show', () => {
    const isLoginHidden = process.argv.includes('--hidden') || app.getLoginItemSettings().wasOpenedAsHidden
    if (!isLoginHidden) {
      mainWindow.show()
    }
  })

  // Prevent app from quitting when user clicks the window close button [x]
  // Instead, hide to background tray
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
      if (app.dock) {
        // Keep or hide from dock if running purely in background tray
      }
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets/trayTemplate.png')
  let icon = nativeImage.createFromPath(iconPath)

  if (icon.isEmpty()) {
    // Fallback minimal template image if file is not found
    icon = nativeImage.createEmpty()
  }

  // macOS template image: automatically inverts colors to match dark/light menu bar
  icon.setTemplateImage(true)

  tray = new Tray(icon)
  tray.setToolTip('CS Projects Vault')

  updateTrayMenu()

  // Clicking tray icon toggles window visibility
  tray.on('click', () => {
    toggleWindowVisibility()
  })
}

function updateTrayMenu() {
  if (!tray) return

  const loginSettings = app.getLoginItemSettings()

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'CS Vault',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: mainWindow && mainWindow.isVisible() ? 'Hide Window' : 'Open CS Vault',
      click: () => toggleWindowVisibility(),
    },
    {
      label: 'New CS Project...',
      click: () => {
        if (!mainWindow) createWindow()
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send('action-open-add-modal')
      },
    },
    { type: 'separator' },
    {
      label: 'Launch at Login',
      type: 'checkbox',
      checked: loginSettings.openAtLogin,
      click: (menuItem) => {
        ensureLoginSettings(menuItem.checked)
        updateTrayMenu()
      },
    },
    { type: 'separator' },
    {
      label: 'Quit CS Vault',
      accelerator: 'Command+Q',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
}

function toggleWindowVisibility() {
  if (!mainWindow) {
    createWindow()
    return
  }

  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
  updateTrayMenu()
}

// Single instance lock (prevent multiple background instances)
const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    createWindow()
    createTray()

    app.on('activate', () => {
      // macOS dock click behavior
      if (mainWindow === null) {
        createWindow()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    })
  })
}

// Keep application alive even if all windows are closed (runs in background tray)
app.on('window-all-closed', () => {
  // Do NOT quit on macOS so tray remains active in menu bar
  if (process.platform !== 'darwin') {
    // For Windows/Linux, can also stay alive in tray
  }
})

app.on('before-quit', () => {
  isQuitting = true
})

// ── File-based project persistence ──────────────────────────────────────────
function getProjectsFilePath() {
  return path.join(app.getPath('userData'), 'projects.json')
}

ipcMain.handle('load-projects', () => {
  try {
    const filePath = getProjectsFilePath()
    if (!fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to load projects from disk:', err)
    return null
  }
})

ipcMain.handle('save-projects', (_event, projects) => {
  try {
    const filePath = getProjectsFilePath()
    fs.writeFileSync(filePath, JSON.stringify(projects, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Failed to save projects to disk:', err)
    return false
  }
})

// IPC Handlers
ipcMain.handle('get-auto-launch', () => {
  return app.getLoginItemSettings().openAtLogin
})

ipcMain.handle('set-auto-launch', (_event, enabled) => {
  ensureLoginSettings(Boolean(enabled))
  updateTrayMenu()
  return app.getLoginItemSettings().openAtLogin
})

ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide()
    updateTrayMenu()
  }
})

ipcMain.handle('quit-app', () => {
  isQuitting = true
  app.quit()
})
