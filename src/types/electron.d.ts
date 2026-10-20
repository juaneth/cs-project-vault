export interface ElectronAPI {
  isElectron: boolean
  getAutoLaunch: () => Promise<boolean>
  setAutoLaunch: (enabled: boolean) => Promise<boolean>
  minimizeToTray: () => Promise<void>
  quitApp: () => Promise<void>
  onOpenAddModal: (callback: () => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
