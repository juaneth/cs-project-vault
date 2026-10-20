export interface ElectronAPI {
  isElectron: boolean
  getAutoLaunch: () => Promise<boolean>
  setAutoLaunch: (enabled: boolean) => Promise<boolean>
  minimizeToTray: () => Promise<void>
  quitApp: () => Promise<void>
  onOpenAddModal: (callback: () => void) => () => void
  loadProjects: () => Promise<unknown[] | null>
  saveProjects: (projects: unknown[]) => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
