export interface ElectronAPI {
  isElectron: boolean
  getAutoLaunch: () => Promise<boolean>
  setAutoLaunch: (enabled: boolean) => Promise<boolean>
  getSystemUsage: () => Promise<SystemUsage>
  minimizeToTray: () => Promise<void>
  quitApp: () => Promise<void>
  onOpenAddModal: (callback: () => void) => () => void
  loadProjects: () => Promise<unknown[] | null>
  saveProjects: (projects: unknown[]) => Promise<boolean>
}

export interface SystemUsage {
  cpuPercent: number
  memoryUsedBytes: number
  memoryTotalBytes: number
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
