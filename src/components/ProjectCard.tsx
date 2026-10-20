import React from 'react'
import {
  ExternalLink,
  FileText,
  Star,
  Edit2,
  Trash2,
  TrendingUp,
  Folder
} from 'lucide-react'
import { GithubIcon } from '@/components/icons/Github'
import { CSProject, ProjectStatus } from '@/types/project'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDomainIcon } from '@/components/StatsBanner'

interface ProjectCardProps {
  project: CSProject
  onSelect: (project: CSProject) => void
  onEdit: (project: CSProject) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export const getStatusDotClass = (status: ProjectStatus) => {
  switch (status) {
    case 'Completed':
      return 'bg-white'
    case 'In Progress':
    case 'Active':
      return 'bg-zinc-400 animate-pulse'
    case 'Prototype':
      return 'bg-zinc-500'
    case 'Research Paper':
      return 'bg-zinc-300'
    default:
      return 'bg-zinc-600'
  }
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const gradientStyles: Record<string, string> = {
    'monochrome-sheen': 'from-white/10 via-white/5 to-transparent border-t-white/30',
    'zinc-carbon': 'from-zinc-500/15 via-zinc-600/5 to-transparent border-t-zinc-600',
    'graphite-dark': 'from-zinc-700/25 via-zinc-800/10 to-transparent border-t-zinc-500',
    'silver-slate': 'from-neutral-400/15 via-neutral-500/5 to-transparent border-t-neutral-600',
    'obsidian-noir': 'from-zinc-800/30 via-zinc-900/10 to-transparent border-t-zinc-700',
    'wireframe-grid': 'from-white/15 via-white/5 to-transparent border-t-white/40',
  }

  const gradientClass = gradientStyles[project.gradientPreset] || gradientStyles['monochrome-sheen']

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-zinc-800/80 bg-zinc-950/70 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-950 hover:-translate-y-0.5">
      {/* Top Ambient Monochrome Sheen Bar */}
      <div className={`h-16 w-full bg-gradient-to-b ${gradientClass} absolute top-0 left-0 pointer-events-none border-t`} />

      {/* Card Content Top */}
      <div className="relative p-5 pb-3">
        {/* Domain Badge + Star */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
              {getDomainIcon(project.domain, "w-3 h-3 text-zinc-400")}
              <span className="truncate max-w-[140px]">{project.domain}</span>
            </span>
            {project.folder && (
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono bg-zinc-950 text-zinc-400 border border-zinc-800">
                <Folder className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{project.folder}</span>
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(project.id)
            }}
            className={`p-1.5 rounded-md transition-colors ${
              project.isFavorite
                ? "text-white bg-white/10"
                : "text-zinc-600 hover:text-white hover:bg-zinc-900"
            }`}
            title={project.isFavorite ? "Remove favorite" : "Mark as favorite"}
          >
            <Star className={`w-3.5 h-3.5 ${project.isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Project Title & Status */}
        <div className="mb-2">
          <h3
            onClick={() => onSelect(project)}
            className="text-base font-semibold tracking-tight text-white group-hover:text-zinc-200 transition-colors cursor-pointer line-clamp-1"
          >
            {project.title}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {project.tagline}
          </p>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {project.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded bg-zinc-900 border border-zinc-850 px-2 py-0.5 text-[11px] font-mono text-zinc-400"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="text-[10px] text-zinc-600 font-mono">
              +{project.techStack.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer / Action Bar */}
      <div className="relative border-t border-zinc-850 bg-zinc-950 px-5 py-2.5 flex items-center justify-between gap-2 mt-2">
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
          <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(project.status)}`} />
          <span className="text-[11px]">{project.status}</span>
        </div>

        {/* Links & Quick Actions */}
        <div className="flex items-center gap-1">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
              title="GitHub Repository"
              onClick={(e) => e.stopPropagation()}
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>
          )}

          {project.paperUrl && (
            <a
              href={project.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
              title="Research Paper"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText className="w-3.5 h-3.5" />
            </a>
          )}

          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
              title="Live Demo"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => onEdit(project)}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
            title="Edit Project"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(project.id)}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded transition-colors"
            title="Delete Project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSelect(project)}
            className="text-xs font-mono h-7 px-2 ml-1 text-zinc-300 hover:text-white hover:bg-zinc-900"
          >
            View
          </Button>
        </div>
      </div>
    </Card>
  )
}
