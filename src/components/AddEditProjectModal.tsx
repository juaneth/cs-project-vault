import React, { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import {
  Code,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  HardDrive,
  Cpu,
  ExternalLink,
  FileText,
  TrendingUp,
  Palette
} from 'lucide-react'
import { GithubIcon } from '@/components/icons/Github'
import {
  CSProject,
  CSDomain,
  DifficultyLevel,
  ProjectStatus,
  GradientPreset,
  CS_DOMAINS,
  CS_DIFFICULTIES,
  PROJECT_STATUSES,
  GRADIENT_PRESETS,
  COMMON_TECH_STACK,
  ProjectMetric
} from '@/types/project'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { generateId } from '@/lib/utils'

interface AddEditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: CSProject) => void
  initialProject?: CSProject | null
}

export const AddEditProjectModal: React.FC<AddEditProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
}) => {
  const isEditing = !!initialProject

  // Form State
  const [title, setTitle] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [domain, setDomain] = useState<CSDomain>('Systems & OS')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Advanced')
  const [status, setStatus] = useState<ProjectStatus>('In Progress')
  const [techStack, setTechStack] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [paperUrl, setPaperUrl] = useState('')
  const [timeComplexity, setTimeComplexity] = useState('')
  const [spaceComplexity, setSpaceComplexity] = useState('')
  const [architectureNotes, setArchitectureNotes] = useState('')
  const [gradientPreset, setGradientPreset] = useState<GradientPreset>('monochrome-sheen')
  const [featured, setFeatured] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Dynamic Lists
  const [metrics, setMetrics] = useState<ProjectMetric[]>([])
  const [highlights, setHighlights] = useState<string[]>([])
  const [highlightInput, setHighlightInput] = useState('')

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'general' | 'cs-specs' | 'metrics' | 'links'>('general')

  // Populate form on edit
  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title || '')
      setTagline(initialProject.tagline || '')
      setDescription(initialProject.description || '')
      setDomain(initialProject.domain || 'Systems & OS')
      setDifficulty(initialProject.difficulty || 'Advanced')
      setStatus(initialProject.status || 'In Progress')
      setTechStack(initialProject.techStack || [])
      setGithubUrl(initialProject.githubUrl || '')
      setDemoUrl(initialProject.demoUrl || '')
      setPaperUrl(initialProject.paperUrl || '')
      setTimeComplexity(initialProject.complexity?.time || '')
      setSpaceComplexity(initialProject.complexity?.space || '')
      setArchitectureNotes(initialProject.architectureNotes || '')
      setGradientPreset(initialProject.gradientPreset || 'monochrome-sheen')
      setFeatured(initialProject.featured ?? false)
      setIsFavorite(initialProject.isFavorite ?? false)
      setMetrics(initialProject.metrics ? [...initialProject.metrics] : [])
      setHighlights(initialProject.keyHighlights ? [...initialProject.keyHighlights] : [])
    } else {
      // Default reset
      setTitle('')
      setTagline('')
      setDescription('')
      setDomain('Systems & OS')
      setDifficulty('Advanced')
      setStatus('In Progress')
      setTechStack(['C++', 'Rust'])
      setTagInput('')
      setGithubUrl('')
      setDemoUrl('')
      setPaperUrl('')
      setTimeComplexity('O(log N)')
      setSpaceComplexity('O(N)')
      setArchitectureNotes('')
      setGradientPreset('monochrome-sheen')
      setFeatured(false)
      setIsFavorite(false)
      setMetrics([
        { id: generateId(), label: 'Throughput', value: '500K ops/s' },
        { id: generateId(), label: 'Latency', value: '1.2 ms' }
      ])
      setHighlights([])
      setHighlightInput('')
    }
    setErrors({})
    setActiveTab('general')
  }, [initialProject, isOpen])

  // Tech stack handling
  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim()
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTechStack(techStack.filter(t => t !== tagToRemove))
  }

  // Highlights handling
  const handleAddHighlight = () => {
    const trimmed = highlightInput.trim()
    if (trimmed) {
      setHighlights([...highlights, trimmed])
      setHighlightInput('')
    }
  }

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  // Metrics handling
  const handleAddMetric = () => {
    setMetrics([
      ...metrics,
      { id: generateId(), label: '', value: '' }
    ])
  }

  const handleUpdateMetric = (id: string, field: 'label' | 'value', val: string) => {
    setMetrics(metrics.map(m => m.id === id ? { ...m, [field]: val } : m))
  }

  const handleRemoveMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id))
  }

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Project title is required'
    if (!tagline.trim()) newErrors.tagline = 'Tagline is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setActiveTab('general')
      return
    }

    const cleanedMetrics = metrics.filter(m => m.label.trim() && m.value.trim())

    const projectData: CSProject = {
      id: initialProject ? initialProject.id : generateId(),
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      domain,
      difficulty,
      status,
      techStack: techStack.length > 0 ? techStack : ['C++'],
      githubUrl: githubUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      paperUrl: paperUrl.trim() || undefined,
      featured,
      isFavorite,
      createdAt: initialProject ? initialProject.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      complexity: {
        time: timeComplexity.trim() || undefined,
        space: spaceComplexity.trim() || undefined,
      },
      keyHighlights: highlights,
      metrics: cleanedMetrics,
      architectureNotes: architectureNotes.trim() || undefined,
      gradientPreset,
    }

    onSave(projectData)

    if (!isEditing) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a', '#27272a']
        })
      } catch {
        // non-blocking
      }
    }

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <span className="flex items-center gap-2">
          <Code className="w-4 h-4 text-white" />
          <span className="font-semibold">{isEditing ? 'Edit CS Project' : 'New CS Project'}</span>
        </span>
      }
      description={
        isEditing
          ? 'Modify technical specifications, benchmarks, and architecture details.'
          : 'Document your new algorithm, distributed engine, compiler, or deep learning system.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {/* Navigation Tabs inside Form (Vercel Style) */}
        <div className="flex items-center gap-1 border-b border-zinc-850 pb-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>General</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cs-specs')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'cs-specs'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Complexity & Theory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Benchmarks ({metrics.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'links'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Links & Aesthetics</span>
          </button>
        </div>

        {/* TAB 1: General Info */}
        {activeTab === 'general' && (
          <div className="space-y-3.5 animate-in fade-in-50 duration-150">
            {/* Title & Tagline */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Project Title <span className="text-zinc-500">*</span>
              </label>
              <Input
                placeholder="e.g. AegisDB: Lock-Free LSM-Tree Storage Engine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`text-xs ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Tagline / One-liner Summary <span className="text-zinc-500">*</span>
              </label>
              <Input
                placeholder="e.g. High-throughput persistent key-value engine with Write-Ahead Logging & Bloom filters"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={`text-xs ${errors.tagline ? 'border-red-500' : ''}`}
              />
              {errors.tagline && <p className="text-xs text-red-400 mt-1">{errors.tagline}</p>}
            </div>

            {/* Domain & Difficulty & Status row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  CS Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as CSDomain)}
                  className="w-full h-8.5 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-650"
                >
                  {CS_DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full h-8.5 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-650"
                >
                  {CS_DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full h-8.5 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-650"
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tech Stack Tag Input */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Tech Stack & Tools
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Type a technology (e.g. Rust, CUDA, LLVM) and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag(tagInput)
                    }
                  }}
                  className="text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTag(tagInput)}
                  className="font-mono text-xs"
                >
                  Add
                </Button>
              </div>

              {/* Selected Tech Tags */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-950 border border-zinc-850 rounded-md min-h-[36px]">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 bg-zinc-900 text-zinc-300 text-xs font-mono px-2 py-0.5 rounded border border-zinc-800"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tech)}
                      className="text-zinc-500 hover:text-white"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {techStack.length === 0 && (
                  <span className="text-xs text-zinc-500 font-mono">No technologies added yet</span>
                )}
              </div>

              {/* Suggestions */}
              <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                <span className="text-[11px] text-zinc-500 font-mono">Suggestions:</span>
                {COMMON_TECH_STACK.slice(0, 10).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddTag(t)}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    +{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Technical Overview & System Description
              </label>
              <Textarea
                rows={3}
                placeholder="Explain the problem solved, design motivations, system architecture, and theoretical foundation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Complexity & Theory */}
        {activeTab === 'cs-specs' && (
          <div className="space-y-3.5 animate-in fade-in-50 duration-150">
            {/* Time & Space Complexity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Time Complexity Notation</span>
                </label>
                <Input
                  placeholder="e.g. O(1) write / O(log N) read"
                  value={timeComplexity}
                  onChange={(e) => setTimeComplexity(e.target.value)}
                  className="font-mono text-xs"
                />
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {['O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(V+E)'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTimeComplexity(c)}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Space Complexity Notation</span>
                </label>
                <Input
                  placeholder="e.g. O(N) or O(1) auxiliary"
                  value={spaceComplexity}
                  onChange={(e) => setSpaceComplexity(e.target.value)}
                  className="font-mono text-xs"
                />
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {['O(1)', 'O(log N)', 'O(N)', 'O(K) constant'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSpaceComplexity(c)}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Architecture Notes */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                Architecture & Data Structures
              </label>
              <Textarea
                rows={3}
                placeholder="Describe key data structures (e.g. SkipList, B-Tree, R-Tree, Bloom filter), concurrency model (lock-free, actors, epoll), or memory layout..."
                value={architectureNotes}
                onChange={(e) => setArchitectureNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Key Technical Highlights (Bullet points) */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center justify-between">
                <span>Key Technical Highlights</span>
                <span className="text-zinc-500 font-normal text-[11px]">
                  {highlights.length} bullet points
                </span>
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g. Zero-copy SIMD vectorized parser reducing memory traffic"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddHighlight()
                    }
                  }}
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddHighlight}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-2 rounded bg-zinc-900/60 border border-zinc-850 text-xs"
                  >
                    <span className="truncate text-zinc-300">• {h}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(i)}
                      className="text-zinc-500 hover:text-white shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Benchmarks & Metrics */}
        {activeTab === 'metrics' && (
          <div className="space-y-3.5 animate-in fade-in-50 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono text-zinc-200">
                  Performance Benchmarks & Empirical Results
                </h4>
                <p className="text-xs text-zinc-500">
                  Document IOPS, latency, throughput, memory footprint, or algorithmic speedups.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMetric}
                className="gap-1 text-xs font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Metric
              </Button>
            </div>

            <div className="space-y-2">
              {metrics.map((metric) => (
                <div key={metric.id} className="flex items-center gap-2">
                  <Input
                    placeholder="Metric (e.g. P99 Latency)"
                    value={metric.label}
                    onChange={(e) => handleUpdateMetric(metric.id, 'label', e.target.value)}
                    className="flex-1 text-xs font-mono"
                  />
                  <Input
                    placeholder="Value (e.g. 142 µs or 1.2M req/s)"
                    value={metric.value}
                    onChange={(e) => handleUpdateMetric(metric.id, 'value', e.target.value)}
                    className="flex-1 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMetric(metric.id)}
                    className="p-2 text-zinc-500 hover:text-white rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {metrics.length === 0 && (
                <div className="p-6 text-center border border-dashed border-zinc-800 rounded-lg text-zinc-500 text-xs font-mono">
                  No benchmarks added yet. Click &quot;Add Metric&quot; to specify performance bounds.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Links & Aesthetics */}
        {activeTab === 'links' && (
          <div className="space-y-3.5 animate-in fade-in-50 duration-150">
            {/* Repository URLs */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                <GithubIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>GitHub Repository URL</span>
              </label>
              <Input
                type="url"
                placeholder="https://github.com/username/project"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Live Interactive Demo URL</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://my-cs-project.dev"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Research Paper / arXiv URL</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://arxiv.org/abs/..."
                  value={paperUrl}
                  onChange={(e) => setPaperUrl(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Monochrome Accent Presets */}
            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-zinc-400" />
                <span>Card Sheen & Border Style</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {GRADIENT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setGradientPreset(p.id)}
                    className={`h-12 rounded-md border p-1 text-center flex flex-col items-center justify-center transition-all bg-gradient-to-b ${p.class} ${
                      gradientPreset === p.id
                        ? 'ring-1 ring-white border-white'
                        : 'border-zinc-800 hover:border-zinc-650'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-zinc-300">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured & Favorite flags */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-950 text-white focus:ring-0 h-4 w-4"
                />
                <span className="text-zinc-300">Featured Showcase Project</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-950 text-white focus:ring-0 h-4 w-4"
                />
                <span className="text-zinc-300">Add to Favorites ⭐</span>
              </label>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-850">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs text-zinc-400 font-mono"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {activeTab !== 'general' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTab === 'links') setActiveTab('metrics')
                  else if (activeTab === 'metrics') setActiveTab('cs-specs')
                  else if (activeTab === 'cs-specs') setActiveTab('general')
                }}
                className="text-xs font-mono"
              >
                Previous
              </Button>
            )}

            {activeTab !== 'links' ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (activeTab === 'general') setActiveTab('cs-specs')
                  else if (activeTab === 'cs-specs') setActiveTab('metrics')
                  else if (activeTab === 'metrics') setActiveTab('links')
                }}
                className="text-xs font-mono"
              >
                Next
              </Button>
            ) : null}

            <Button
              type="submit"
              variant="default"
              size="sm"
              className="text-xs font-semibold gap-1.5 font-mono"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Save Changes' : 'Create Project'}</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
