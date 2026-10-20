import React from 'react'
import {
  ExternalLink,
  FileText,
  Clock,
  HardDrive,
  Cpu,
  Star,
  Edit2,
  Trash2,
  Copy,
  TrendingUp,
  CheckCircle,
  Calendar,
  Share2
} from 'lucide-react'
import { GithubIcon } from '@/components/icons/Github'
import { CSProject } from '@/types/project'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { getDifficultyBadgeVariant, getStatusDotClass } from '@/components/ProjectCard'
import { getDomainIcon } from '@/components/StatsBanner'

interface ProjectDetailModalProps {
  project: CSProject | null
  isOpen: boolean
  onClose: () => void
  onEdit: (project: CSProject) => void
  onDelete: (id: string) => void
  onDuplicate: (project: CSProject) => void
  onToggleFavorite: (id: string) => void
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
}) => {
  if (!project) return null

  const gradientStyles: Record<string, string> = {
    'monochrome-sheen': 'from-white/10 via-white/5 to-transparent border-t-white/30',
    'zinc-carbon': 'from-zinc-500/15 via-zinc-600/5 to-transparent border-t-zinc-600',
    'graphite-dark': 'from-zinc-700/25 via-zinc-800/10 to-transparent border-t-zinc-500',
    'silver-slate': 'from-neutral-400/15 via-neutral-500/5 to-transparent border-t-neutral-600',
    'obsidian-noir': 'from-zinc-800/30 via-zinc-900/10 to-transparent border-t-zinc-700',
    'wireframe-grid': 'from-white/15 via-white/5 to-transparent border-t-white/40',
  }

  const headerGradient = gradientStyles[project.gradientPreset] || gradientStyles['monochrome-sheen']

  const copySummary = () => {
    const summary = `${project.title}\nDomain: ${project.domain} | Difficulty: ${project.difficulty}\nComplexity: Time: ${project.complexity?.time || 'N/A'}, Space: ${project.complexity?.space || 'N/A'}\n${project.tagline}\n${project.githubUrl || ''}`
    navigator.clipboard.writeText(summary)
    alert('Project specifications copied to clipboard!')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      className="p-0 overflow-hidden"
    >
      {/* Top Banner with Project Context */}
      <div className={`p-6 bg-gradient-to-b ${headerGradient} border-b border-zinc-850 relative`}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono bg-zinc-950 text-zinc-300 border border-zinc-800">
              {getDomainIcon(project.domain, "w-3.5 h-3.5 text-zinc-400")}
              <span>{project.domain}</span>
            </span>

            <Badge variant={getDifficultyBadgeVariant(project.difficulty)}>
              {project.difficulty}
            </Badge>

            <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono bg-zinc-950 text-zinc-400 border border-zinc-800">
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(project.status)}`} />
              <span>{project.status}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(project.id)}
              className={`p-2 rounded-md transition-colors ${
                project.isFavorite
                  ? 'text-white bg-white/10'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
              title="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${project.isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={copySummary}
              className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-md transition-colors"
              title="Copy Summary"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {project.title}
        </h1>
        <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
          {project.tagline}
        </p>

        {/* External Action Links */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors border border-zinc-700 shadow-sm"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}

          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-md bg-white text-black hover:bg-zinc-200 transition-colors font-semibold shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Demonstration</span>
            </a>
          )}

          {project.paperUrl && (
            <a
              href={project.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-md bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors border border-zinc-700 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Research Paper</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Body Details */}
      <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto font-sans">
        {/* Algorithmic Complexity Cards */}
        {project.complexity && (project.complexity.time || project.complexity.space) && (
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
              Theoretical Complexity Bounds
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.complexity.time && (
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                  <div className="p-2 rounded bg-zinc-900 text-zinc-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 font-mono block">
                      Time Complexity
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {project.complexity.time}
                    </span>
                  </div>
                </div>
              )}

              {project.complexity.space && (
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                  <div className="p-2 rounded bg-zinc-900 text-zinc-300">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 font-mono block">
                      Space Complexity
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {project.complexity.space}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Benchmarks & Empirical Metrics */}
        {project.metrics && project.metrics.length > 0 && (
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
              <span>Empirical Performance Benchmarks</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {project.metrics.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg bg-zinc-950 border border-zinc-850"
                >
                  <span className="text-[11px] text-zinc-500 font-mono block truncate">{m.label}</span>
                  <span className="text-base font-bold font-mono text-white tracking-tight">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Architecture Notes */}
        {project.architectureNotes && (
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span>Architecture & Data Structures</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-850 text-xs text-zinc-300 leading-relaxed font-sans">
              {project.architectureNotes}
            </div>
          </div>
        )}

        {/* Key Highlights */}
        {project.keyHighlights && project.keyHighlights.length > 0 && (
          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
              Key Engineering Breakthroughs
            </h4>
            <ul className="space-y-1.5">
              {project.keyHighlights.map((highlight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-xs text-zinc-300 p-2.5 rounded-md bg-zinc-950/70 border border-zinc-850"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Description */}
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
            Overview
          </h4>
          <div className="p-3.5 rounded-lg bg-zinc-950/40 border border-zinc-850 text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
            {project.description || 'No detailed description provided.'}
          </div>
        </div>

        {/* Tech Stack Showcase */}
        <div>
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
            Technologies & Tools
          </h4>
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-xs font-mono border border-zinc-800"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Timestamp footer */}
        <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Created {formatDate(project.createdAt)}
          </span>
          <span>Updated {formatDate(project.updatedAt)}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-zinc-850 bg-zinc-950 flex items-center justify-between">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm('Are you sure you want to delete this project?')) {
              onDelete(project.id)
              onClose()
            }
          }}
          className="text-xs font-mono gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onDuplicate(project)
              onClose()
            }}
            className="text-xs font-mono gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              onEdit(project)
              onClose()
            }}
            className="text-xs font-mono gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Project</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
