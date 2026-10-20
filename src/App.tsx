import { useState, useEffect, useMemo } from 'react'
import { Plus, FolderPlus, Terminal, FilterX } from 'lucide-react'
import { CSProject } from '@/types/project'
import { INITIAL_PROJECTS } from '@/data/initialProjects'
import { Header } from '@/components/Header'
import { StatsBanner } from '@/components/StatsBanner'
import { ProjectFilterBar } from '@/components/ProjectFilterBar'
import { ProjectCard } from '@/components/ProjectCard'
import { ProjectTableView } from '@/components/ProjectTableView'
import { AddEditProjectModal } from '@/components/AddEditProjectModal'
import { ProjectDetailModal } from '@/components/ProjectDetailModal'
import { ImportExportModal } from '@/components/ImportExportModal'
import { Button } from '@/components/ui/button'
import { generateId } from '@/lib/utils'

const STORAGE_KEY = 'cs_projects_vault_data'
const THEME_KEY = 'cs_vault_theme'

export function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved !== null) return saved === 'dark'
    return true // Default dark mode for Vercel/Cursor aesthetic
  })

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem(THEME_KEY, 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem(THEME_KEY, 'light')
    }
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode((prev) => !prev)

  // Projects State
  const [projects, setProjects] = useState<CSProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // fallback
    }
    return INITIAL_PROJECTS
  })

  // Persist projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    } catch {
      // quota or private mode fallback
    }
  }, [projects])

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL')
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

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedDomain !== 'ALL') count++
    if (difficultyFilter !== 'ALL') count++
    if (statusFilter !== 'ALL') count++
    if (techFilter !== 'ALL') count++
    if (onlyFavorites) count++
    if (searchQuery.trim()) count++
    return count
  }, [selectedDomain, difficultyFilter, statusFilter, techFilter, onlyFavorites, searchQuery])

  const handleResetFilters = () => {
    setSelectedDomain('ALL')
    setDifficultyFilter('ALL')
    setStatusFilter('ALL')
    setTechFilter('ALL')
    setOnlyFavorites(false)
    setSearchQuery('')
  }

  // Filter & Sort Pipeline
  const filteredProjects = useMemo(() => {
    let result = [...projects]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(q)
        const inTagline = p.tagline.toLowerCase().includes(q)
        const inDesc = p.description.toLowerCase().includes(q)
        const inDomain = p.domain.toLowerCase().includes(q)
        const inTech = p.techStack.some((t) => t.toLowerCase().includes(q))
        const inArch = p.architectureNotes ? p.architectureNotes.toLowerCase().includes(q) : false
        const inHighlights = p.keyHighlights.some((h) => h.toLowerCase().includes(q))
        const inComplexity = p.complexity?.time?.toLowerCase().includes(q) || p.complexity?.space?.toLowerCase().includes(q)
        return inTitle || inTagline || inDesc || inDomain || inTech || inArch || inHighlights || inComplexity
      })
    }

    // Domain filter
    if (selectedDomain !== 'ALL') {
      result = result.filter((p) => p.domain === selectedDomain)
    }

    // Difficulty filter
    if (difficultyFilter !== 'ALL') {
      result = result.filter((p) => p.difficulty === difficultyFilter)
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
      if (sortBy === 'difficulty-desc') {
        const weight: Record<string, number> = {
          'Research / High-Perf': 4,
          'Advanced': 3,
          'Intermediate': 2,
          'Beginner': 1,
        }
        return (weight[b.difficulty] || 0) - (weight[a.difficulty] || 0)
      }
      return 0
    })

    return result
  }, [
    projects,
    searchQuery,
    selectedDomain,
    difficultyFilter,
    statusFilter,
    techFilter,
    onlyFavorites,
    sortBy,
  ])

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

  const handleResetData = () => {
    if (
      confirm(
        'Reset all projects back to the default CS sample catalog? Any custom added projects will be replaced.'
      )
    ) {
      setProjects(INITIAL_PROJECTS)
      localStorage.removeItem(STORAGE_KEY)
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
        onResetData={handleResetData}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
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
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
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

        {/* Projects View */}
        {filteredProjects.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
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
              projects={filteredProjects}
              onSelect={setSelectedProjectForDetail}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteProject}
              onToggleFavorite={handleToggleFavorite}
            />
          )
        ) : (
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-850 bg-black/90 py-5 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-300">CS Vault</span>
            <span className="text-zinc-650">—</span>
            <span className="text-zinc-500">Monochrome Systems Architecture</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <span>Local Storage Active</span>
            <span className="text-zinc-650">•</span>
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="hover:text-white transition-colors"
            >
              Export JSON
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddEditProjectModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveProject}
        initialProject={editingProject}
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
