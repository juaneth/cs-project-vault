import React, { useState, useEffect } from 'react'
import { Plus, Terminal, Download, Search, Command, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onOpenAddModal: () => void
  onOpenImportExport: () => void
  totalCount: number
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenImportExport,
  totalCount,
}) => {
  const isElectron = typeof window !== 'undefined' && (
    Boolean(window.electronAPI?.isElectron) ||
    window.navigator.userAgent.toLowerCase().includes('electron') ||
    Boolean((window as any).process?.versions?.electron)
  )

  const [autoLaunch, setAutoLaunch] = useState<boolean>(true)

  useEffect(() => {
    if (isElectron && window.electronAPI?.getAutoLaunch) {
      window.electronAPI.getAutoLaunch().then((val) => setAutoLaunch(val)).catch(() => {})
    }
  }, [isElectron])

  const handleToggleAutoLaunch = async () => {
    if (isElectron && window.electronAPI?.setAutoLaunch) {
      const updated = await window.electronAPI.setAutoLaunch(!autoLaunch)
      setAutoLaunch(updated)
    }
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors select-none"
      style={isElectron ? ({ WebkitAppRegion: 'drag' } as any) : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left Section: macOS Traffic Lights Spacer + Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          {/* macOS Traffic Lights Reserved Safe Area */}
          {isElectron && (
            <div
              className="w-[74px] h-full shrink-0 select-none mr-1.5"
              style={{ WebkitAppRegion: 'drag' } as any}
              aria-hidden="true"
            />
          )}

          <div
            className="flex items-center gap-3 shrink-0"
            style={isElectron ? ({ WebkitAppRegion: 'no-drag' } as any) : undefined}
          >
            <div className="h-8 w-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10 shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
                CS Vault
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-400 shrink-0">
                <span>{totalCount}</span>
                <span className="text-zinc-600">•</span>
                <span>{totalCount === 1 ? 'sys' : 'systems'}</span>
              </span>

              {/* Electron Background / Auto-Launch Indicator */}
              {isElectron && (
                <button
                  onClick={handleToggleAutoLaunch}
                  className="hidden xl:inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors shrink-0"
                  title={autoLaunch ? "Auto-launches on system login (Click to toggle)" : "Launch on login disabled (Click to enable)"}
                >
                  <Power className={`w-3 h-3 ${autoLaunch ? "text-white" : "text-zinc-600"}`} />
                  <span>Login Auto-Start: {autoLaunch ? "ON" : "OFF"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Global Search Bar (Cursor style) */}
        <div
          className="flex-1 max-w-md hidden md:block"
          style={isElectron ? ({ WebkitAppRegion: 'no-drag' } as any) : undefined}
        >
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search architecture, algorithms, stacks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-12 h-8 bg-zinc-950/70 border-zinc-850 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 transition-all font-mono"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-zinc-500 font-mono pointer-events-none">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Actions & Utilities */}
        <div
          className="flex items-center gap-2 shrink-0"
          style={isElectron ? ({ WebkitAppRegion: 'no-drag' } as any) : undefined}
        >
          {/* Import / Export JSON */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenImportExport}
            className="hidden sm:inline-flex gap-1.5 text-xs text-zinc-400 hover:text-white h-8"
            title="Import or Export JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline font-mono">JSON</span>
          </Button>

          {/* Add New CS Project CTA */}          <Button
            onClick={onOpenAddModal}
            variant="default"
            size="sm"
            className="gap-1.5 text-xs font-semibold h-8 px-3.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div
        className="md:hidden px-4 pb-2.5 pt-1"
        style={isElectron ? ({ WebkitAppRegion: 'no-drag' } as any) : undefined}
      >
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search projects, tags, domains..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-4 h-8 bg-zinc-950/70 border-zinc-850 text-xs text-zinc-200 placeholder:text-zinc-600 font-mono"
          />
        </div>
      </div>
    </header>
  )
}
