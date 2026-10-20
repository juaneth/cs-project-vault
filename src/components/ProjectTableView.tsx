import React from 'react'
import {
  ExternalLink,
  Star,
  Edit2,
  Trash2
} from 'lucide-react'
import { GithubIcon } from '@/components/icons/Github'
import { CSProject } from '@/types/project'
import { Badge } from '@/components/ui/badge'
import { getDifficultyBadgeVariant, getStatusDotClass } from '@/components/ProjectCard'
import { getDomainIcon } from '@/components/StatsBanner'

interface ProjectTableViewProps {
  projects: CSProject[]
  onSelect: (project: CSProject) => void
  onEdit: (project: CSProject) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  projects,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800/80 bg-zinc-950/60">
      <table className="w-full text-left text-sm font-sans">
        <thead className="border-b border-zinc-850 bg-zinc-950 text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
          <tr>
            <th scope="col" className="w-10 px-3 py-2.5 text-center">Fav</th>
            <th scope="col" className="px-4 py-2.5">System & Tagline</th>
            <th scope="col" className="px-4 py-2.5">Domain</th>
            <th scope="col" className="px-4 py-2.5">Difficulty</th>
            <th scope="col" className="px-4 py-2.5">Status</th>
            <th scope="col" className="px-4 py-2.5">Complexity</th>
            <th scope="col" className="px-4 py-2.5">Stack</th>
            <th scope="col" className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-850">
          {projects.map((project) => (
            <tr
              key={project.id}
              className="hover:bg-zinc-900/50 transition-colors cursor-pointer group"
              onClick={() => onSelect(project)}
            >
              {/* Favorite Star */}
              <td
                className="px-3 py-2.5 text-center"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(project.id)
                }}
              >
                <button className="text-zinc-600 hover:text-white p-1">
                  <Star className={`w-3.5 h-3.5 ${project.isFavorite ? 'fill-white text-white' : ''}`} />
                </button>
              </td>

              {/* Title & Tagline */}
              <td className="px-4 py-2.5">
                <div className="font-medium text-white group-hover:text-zinc-200 transition-colors">
                  {project.title}
                </div>
                <div className="text-xs text-zinc-400 line-clamp-1 max-w-sm">
                  {project.tagline}
                </div>
              </td>

              {/* Domain */}
              <td className="px-4 py-2.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                  {getDomainIcon(project.domain, "w-3 h-3 text-zinc-500")}
                  <span>{project.domain}</span>
                </div>
              </td>

              {/* Difficulty */}
              <td className="px-4 py-2.5 whitespace-nowrap">
                <Badge variant={getDifficultyBadgeVariant(project.difficulty)}>
                  {project.difficulty}
                </Badge>
              </td>

              {/* Status */}
              <td className="px-4 py-2.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(project.status)}`} />
                  <span className="text-zinc-400">{project.status}</span>
                </div>
              </td>

              {/* Complexity */}
              <td className="px-4 py-2.5 whitespace-nowrap font-mono text-[11px] text-zinc-400">
                {project.complexity?.time ? (
                  <span className="text-zinc-300">{project.complexity.time}</span>
                ) : (
                  <span className="text-zinc-600">—</span>
                )}
              </td>

              {/* Tech Stack */}
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-1 flex-wrap max-w-xs">
                  {project.techStack.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="text-[10px] text-zinc-600 font-mono">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>
              </td>

              {/* Actions */}
              <td
                className="px-4 py-2.5 text-right whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-1">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
                      title="GitHub"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
                      title="Demo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => onEdit(project)}
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDelete(project.id)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
