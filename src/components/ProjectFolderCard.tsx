import React from 'react'
import { ArrowRight, Folder, FolderOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ProjectFolderCardProps {
  name: string
  projectCount: number
  onOpen: () => void
}

export const ProjectFolderCard: React.FC<ProjectFolderCardProps> = ({
  name,
  projectCount,
  onOpen,
}) => (
  <Card className="group overflow-hidden border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-600 hover:bg-zinc-950">
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-36 w-full flex-col justify-between p-5 text-left"
      aria-label={`Open folder ${name}, ${projectCount} ${projectCount === 1 ? 'project' : 'projects'}`}
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition-colors group-hover:border-zinc-700 group-hover:text-white">
          <Folder className="h-5 w-5 group-hover:hidden" />
          <FolderOpen className="hidden h-5 w-5 group-hover:block" />
        </div>
        <ArrowRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-zinc-300" />
      </div>
      <div className="mt-5">
        <h3 className="truncate text-sm font-semibold text-zinc-100">{name}</h3>
        <p className="mt-1 text-xs font-mono text-zinc-500">
          {projectCount} {projectCount === 1 ? 'project' : 'projects'}
        </p>
      </div>
    </button>
  </Card>
)
