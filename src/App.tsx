import { useState, useEffect, useMemo } from 'react'
import { Plus, FolderPlus, FilterX, Clock, Cpu, Database } from 'lucide-react'
import { CSProject } from '@/types/project'
import { Header } from '@/components/Header'
import { StatsBanner } from '@/components/StatsBanner'
import { ProjectFilterBar } from '@/components/ProjectFilterBar'
import { ProjectCard } from '@/components/ProjectCard'
import { ProjectTableView } from '@/components/ProjectTableView'
import { ProjectFolderCard } from '@/components/ProjectFolderCard'
import { AddEditProjectModal } from '@/components/AddEditProjectModal'
import { ProjectDetailModal } from '@/components/ProjectDetailModal'
import { ImportExportModal } from '@/components/ImportExportModal'
import { Button } from '@/components/ui/button'
import { generateId } from '@/lib/utils'

const STORAGE_KEY = 'cs_projects_vault_data'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron

function formatMemory(bytes: number): string {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

/** Load projects: Electron file → localStorage → defaults */
async function loadProjectsFromStorage(): Promise<CSProject[]> {
  if (isElectron && window.electronAPI?.loadProjects) {
    try {
      const data = await window.electronAPI.loadProjects()
      if (Array.isArray(data) && data.length > 0) return data as CSProject[]
    } catch {
      // fall through to localStorage
    }
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // fall through to defaults
  }
  return []
}

/** Save projects: Electron file + localStorage (always keep both in sync) */
async function saveProjectsToStorage(projects: CSProject[]): Promise<void> {
  if (isElectron && window.electronAPI?.saveProjects) {
    try {
      await window.electronAPI.saveProjects(projects)
    } catch {
      // non-fatal
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch {
    // quota or private mode
  }
}

export function App() {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [systemUsage, setSystemUsage] = useState<{
    cpuPercent: number
    memoryUsedBytes: number
    memoryTotalBytes: number
  } | null>(null)
  const [systemUsageUnavailable, setSystemUsageUnavailable] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const getSystemUsage = window.electronAPI?.getSystemUsage
    if (!isElectron || !getSystemUsage) return

    let isMounted = true
    const updateSystemUsage = () => {
      getSystemUsage()
        .then((usage) => {
          if (!isMounted) return
          setSystemUsage(usage)
          setSystemUsageUnavailable(false)
        })
        .catch(() => {
          if (isMounted) setSystemUsageUnavailable(true)
        })
    }

    updateSystemUsage()
    const timer = window.setInterval(updateSystemUsage, 5000)
    return () => {
      isMounted = false
      window.clearInterval(timer)
    }
  }, [])

  // Projects State
  const [projects, setProjects] = useState<CSProject[]>([])
  const [projectsLoaded, setProjectsLoaded] = useState(false)

  // Load persisted projects on mount (async to support Electron IPC)
  useEffect(() => {
    loadProjectsFromStorage().then((loaded) => {
      setProjects(loaded)
      setProjectsLoaded(true)
    })
  }, [])

  // Persist projects whenever they change (skip the very first render before load completes)
  useEffect(() => {
    if (!projectsLoaded) return
    saveProjectsToStorage(projects)
  }, [projects, projectsLoaded])

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL')
  const [folderFilter, setFolderFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [techFilter, setTechFilter] = useState<string>('ALL')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Modals State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<CSProject | null>(null)
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<CSProject | null>(null)
  const [isImportExportOpen, setIsImportExportOpen] = useState(false)

  // Listen for Electron tray "New CS Project..." action
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.onOpenAddModal) {
      const cleanup = window.electronAPI.onOpenAddModal(() => {
        setEditingProject(null)
        setIsAddEditOpen(true)
      })
      return cleanup
    }
  }, [])

  // Extract all unique tech stack options from current projects
  const allAvailableTech = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => p.techStack.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [projects])

  const availableFolders = useMemo(
    () => Array.from(new Set(projects.map((project) => project.folder?.trim()).filter((folder): folder is string => Boolean(folder)))).sort(),
    [projects],
  )

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedDomain !== 'ALL') count++
    if (folderFilter !== 'ALL') count++
    if (statusFilter !== 'ALL') count++
    if (techFilter !== 'ALL') count++
    if (onlyFavorites) count++
    if (searchQuery.trim()) count++
    return count
  }, [selectedDomain, folderFilter, statusFilter, techFilter, onlyFavorites, searchQuery])

  const handleResetFilters = () => {
    setSelectedDomain('ALL')
    setFolderFilter('ALL')
    setStatusFilter('ALL')
    setTechFilter('ALL')
    setOnlyFavorites(false)
    setSearchQuery('')
  }

  // Filter & Sort Pipeline
  const matchingProjects = useMemo(() => {
    let result = [...projects]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(q)
        const inTagline = p.tagline.toLowerCase().includes(q)
        const inDesc = p.description.toLowerCase().includes(q)
        const inDomain = p.domain.toLowerCase().includes(q)
        const inFolder = p.folder?.toLowerCase().includes(q) ?? false
        const inTech = p.techStack.some((t) => t.toLowerCase().includes(q))
        const inArch = p.architectureNotes ? p.architectureNotes.toLowerCase().includes(q) : false
        const inHighlights = p.keyHighlights.some((h) => h.toLowerCase().includes(q))
        return inTitle || inTagline || inDesc || inDomain || inFolder || inTech || inArch || inHighlights
      })
    }

    // Domain filter
    if (selectedDomain !== 'ALL') {
      result = result.filter((p) => p.domain === selectedDomain)
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter)
    }

    // Tech filter
    if (techFilter !== 'ALL') {
      result = result.filter((p) => p.techStack.includes(techFilter))
    }

    // Favorites filter
    if (onlyFavorites) {
      result = result.filter((p) => p.isFavorite)
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title)
      }
      return 0
    })

    return result
  }, [
    projects,
    searchQuery,
    selectedDomain,
    statusFilter,
    techFilter,
    onlyFavorites,
    sortBy,
  ])

  const filteredProjects = useMemo(
    () => folderFilter === 'ALL'
      ? matchingProjects
      : matchingProjects.filter((project) => project.folder?.trim() === folderFilter),
    [matchingProjects, folderFilter],
  )

  const folderCards = useMemo(() => {
    const counts = new Map<string, number>()
    matchingProjects.forEach((project) => {
      const folder = project.folder?.trim()
      if (folder) counts.set(folder, (counts.get(folder) || 0) + 1)
    })
    return Array.from(counts, ([name, projectCount]) => ({ name, projectCount }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [matchingProjects])

  const unfiledProjects = folderFilter === 'ALL'
    ? filteredProjects.filter((project) => !project.folder?.trim())
    : []

  // Project CRUD operations
  const handleSaveProject = (savedProject: CSProject) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === savedProject.id)
      if (exists) {
        return prev.map((p) => (p.id === savedProject.id ? savedProject : p))
      }
      return [savedProject, ...prev]
    })
    if (selectedProjectForDetail?.id === savedProject.id) {
      setSelectedProjectForDetail(savedProject)
    }
  }

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (selectedProjectForDetail?.id === id) {
      setSelectedProjectForDetail(null)
    }
  }

  const handleDuplicateProject = (projectToCopy: CSProject) => {
    const duplicated: CSProject = {
      ...projectToCopy,
      id: generateId(),
      title: `${projectToCopy.title} (Clone)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    }
    setProjects((prev) => [duplicated, ...prev])
  }

  const handleToggleFavorite = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    )
    if (selectedProjectForDetail?.id === id) {
      setSelectedProjectForDetail((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      )
    }
  }

  const handleImportProjects = (imported: CSProject[]) => {
    setProjects(imported)
  }

  const handleOpenAddModal = () => {
    setEditingProject(null)
    setIsAddEditOpen(true)
  }

  const handleOpenEditModal = (project: CSProject) => {
    setEditingProject(project)
    setIsAddEditOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Top Navigation */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={handleOpenAddModal}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        totalCount={projects.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* CS Stats & Domain Bar */}
        <StatsBanner
          projects={projects}
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
        />

        {/* Filter & View Mode Bar */}
        <ProjectFilterBar
          folderFilter={folderFilter}
          onFolderChange={setFolderFilter}
          availableFolders={availableFolders}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          techFilter={techFilter}
          onTechChange={setTechFilter}
          allAvailableTech={allAvailableTech}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onlyFavorites={onlyFavorites}
          onToggleFavorites={() => setOnlyFavorites((prev) => !prev)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeFiltersCount={activeFiltersCount}
          onResetFilters={handleResetFilters}
          resultsCount={filteredProjects.length}
        />

        {folderFilter === 'ALL' && folderCards.length > 0 && (
          <section aria-label="Project folders" className="mb-5">
            <div className="mb-3 flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-zinc-500" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Folders
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {folderCards.map(({ name, projectCount }) => (
                <ProjectFolderCard
                  key={name}
                  name={name}
                  projectCount={projectCount}
                  onOpen={() => setFolderFilter(name)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Projects View */}
        {(folderFilter === 'ALL' ? unfiledProjects : filteredProjects).length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(folderFilter === 'ALL' ? unfiledProjects : filteredProjects).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={setSelectedProjectForDetail}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteProject}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <ProjectTableView
              projects={folderFilter === 'ALL' ? unfiledProjects : filteredProjects}
              onSelect={setSelectedProjectForDetail}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteProject}
              onToggleFavorite={handleToggleFavorite}
            />
          )
        ) : folderFilter !== 'ALL' || folderCards.length === 0 ? (
          /* Empty Search / No Projects State */
          <div className="text-center py-16 px-4 rounded-xl border border-dashed border-zinc-850 bg-zinc-950/40">
            <div className="mx-auto h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
              {activeFiltersCount > 0 ? (
                <FilterX className="w-5 h-5 text-zinc-400" />
              ) : (
                <FolderPlus className="w-5 h-5 text-zinc-300" />
              )}
            </div>
            <h3 className="text-sm font-semibold text-white font-mono">
              {activeFiltersCount > 0
                ? 'No CS systems matched your filters'
                : 'No projects in your vault'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4 font-mono">
              {activeFiltersCount > 0
                ? 'Try broadening your search keywords or clearing active filters.'
                : 'Catalog your algorithms, distributed systems, compilers, or ML models.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              {activeFiltersCount > 0 ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs font-mono">
                  Reset Filters
                </Button>
              ) : null}
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenAddModal}
                className="text-xs gap-1.5 font-semibold font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </Button>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-850 bg-black/90 py-5 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3 text-[11px] text-zinc-500">
          <span className="group relative inline-flex items-center gap-1.5" tabIndex={0}>
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 whitespace-nowrap rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-[10px] text-zinc-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100"
            >
              Local time · {currentTime.toLocaleDateString()}
            </span>
          </span>
          {isElectron && (
            <>
              <span className="group relative inline-flex items-center gap-1.5" tabIndex={0}>
                <Cpu className="h-3.5 w-3.5 text-zinc-400" />
                <span>{systemUsage ? `${systemUsage.cpuPercent}%` : '--'}</span>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 whitespace-nowrap rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-[10px] text-zinc-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                >
                  {systemUsageUnavailable
                    ? 'CPU usage unavailable'
                    : `System CPU usage · ${systemUsage ? `${systemUsage.cpuPercent}%` : 'Loading…'}`}
                </span>
              </span>
              <span className="group relative inline-flex items-center gap-1.5" tabIndex={0}>
                <Database className="h-3.5 w-3.5 text-zinc-400" />
                <span>{systemUsage ? formatMemory(systemUsage.memoryUsedBytes) : '--'}</span>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 whitespace-nowrap rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-[10px] text-zinc-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                >
                  {systemUsageUnavailable
                    ? 'Memory usage unavailable'
                    : `System memory · ${systemUsage ? `${formatMemory(systemUsage.memoryUsedBytes)} / ${formatMemory(systemUsage.memoryTotalBytes)}` : 'Loading…'}`}
                </span>
              </span>
            </>
          )}
          <button
            onClick={() => setIsImportExportOpen(true)}
            className="hover:text-white transition-colors"
          >
            Export JSON
          </button>
        </div>
      </footer>

      {/* Modals */}
      <AddEditProjectModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveProject}
        initialProject={editingProject}
        availableFolders={availableFolders}
      />

      <ProjectDetailModal
        project={selectedProjectForDetail}
        isOpen={!!selectedProjectForDetail}
        onClose={() => setSelectedProjectForDetail(null)}
        onEdit={(proj) => {
          setSelectedProjectForDetail(null)
          handleOpenEditModal(proj)
        }}
        onDelete={handleDeleteProject}
        onDuplicate={handleDuplicateProject}
        onToggleFavorite={handleToggleFavorite}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        projects={projects}
        onImport={handleImportProjects}
      />
    </div>
  )
}
export default App
