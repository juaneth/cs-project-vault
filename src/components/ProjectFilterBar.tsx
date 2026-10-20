import React from 'react'
import {
  ArrowUpDown,
  LayoutGrid,
  List,
  Star,
  X,
  Folder
} from 'lucide-react'
import { PROJECT_STATUSES } from '@/types/project'
import { Button } from '@/components/ui/button'

interface ProjectFilterBarProps {
  folderFilter: string
  onFolderChange: (val: string) => void
  availableFolders: string[]
  statusFilter: string
  onStatusChange: (val: string) => void
  techFilter: string
  onTechChange: (val: string) => void
  allAvailableTech: string[]
  sortBy: string
  onSortChange: (val: string) => void
  onlyFavorites: boolean
  onToggleFavorites: () => void
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  activeFiltersCount: number
  onResetFilters: () => void
  resultsCount: number
}

export const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  folderFilter,
  onFolderChange,
  availableFolders,
  statusFilter,
  onStatusChange,
  techFilter,
  onTechChange,
  allAvailableTech,
  sortBy,
  onSortChange,
  onlyFavorites,
  onToggleFavorites,
  viewMode,
  onViewModeChange,
  activeFiltersCount,
  onResetFilters,
  resultsCount,
}) => {
  return (
    <div className="flex flex-col gap-2.5 mb-5 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Folder Dropdown */}
          {availableFolders.length > 0 && (
            <div className="relative flex h-8 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 font-mono text-xs text-zinc-400">
              <Folder className="h-3.5 w-3.5 text-zinc-500" />
              <select
                value={folderFilter}
                onChange={(e) => onFolderChange(e.target.value)}
                className="bg-transparent text-zinc-300 focus:outline-none"
                aria-label="Filter by folder"
              >
                <option value="ALL">All Folders</option>
                {availableFolders.map((folder) => (
                  <option key={folder} value={folder}>
                    {folder}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-zinc-650 font-mono"
            >
              <option value="ALL">All Statuses</option>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Tech Stack filter dropdown */}
          {allAvailableTech.length > 0 && (
            <div className="relative">
              <select
                value={techFilter}
                onChange={(e) => onTechChange(e.target.value)}
                className="h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-zinc-650 font-mono"
              >
                <option value="ALL">All Tech Stack</option>
                {allAvailableTech.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Starred Only Toggle */}
          <Button
            variant={onlyFavorites ? "default" : "outline"}
            size="sm"
            onClick={onToggleFavorites}
            className={`h-8 gap-1.5 text-xs font-mono transition-colors ${
              onlyFavorites
                ? "bg-white text-black border-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-current" : ""}`} />
            <span>Favorites</span>
          </Button>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 text-xs text-zinc-400 hover:text-white gap-1 px-2 font-mono"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear ({activeFiltersCount})</span>
            </Button>
          )}
        </div>

        {/* Right Sort & View Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Results count label */}
          <span className="text-xs text-zinc-500 hidden sm:inline-block font-mono">
            {resultsCount} {resultsCount === 1 ? 'match' : 'matches'}
          </span>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-md px-2 h-8 font-mono">
            <ArrowUpDown className="w-3 h-3 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-950 p-0.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
