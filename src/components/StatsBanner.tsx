import React from 'react'
import {
  Cpu,
  Brain,
  Code2,
  Network,
  GitBranch,
  ShieldCheck,
  Glasses,
  Database,
  Globe,
  Cloud,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react'
import { CSProject, CSDomain } from '@/types/project'
import { Card } from '@/components/ui/card'

interface StatsBannerProps {
  projects: CSProject[]
  selectedDomain: string
  onSelectDomain: (domain: string) => void
}

export const getDomainIcon = (domain: CSDomain | string, className: string = "w-3.5 h-3.5") => {
  switch (domain) {
    case 'Systems & OS':
      return <Cpu className={className} />
    case 'AI & Machine Learning':
      return <Brain className={className} />
    case 'Compilers & Languages':
      return <Code2 className={className} />
    case 'Distributed Systems':
      return <Network className={className} />
    case 'Algorithms & Data Structures':
      return <GitBranch className={className} />
    case 'Cryptography & Security':
      return <ShieldCheck className={className} />
    case 'Computer Graphics & Vision':
      return <Glasses className={className} />
    case 'Databases & Storage':
      return <Database className={className} />
    case 'Networking & Protocols':
      return <Globe className={className} />
    case 'Web & Cloud Architecture':
      return <Cloud className={className} />
    default:
      return <Layers className={className} />
  }
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  projects,
  selectedDomain,
  onSelectDomain,
}) => {
  // Aggregate Stats
  const completedCount = projects.filter(p => p.status === 'Completed').length
  const activeCount = projects.filter(p => p.status === 'In Progress' || p.status === 'Active').length

  // Domain breakdown count
  const domainCounts = projects.reduce((acc, p) => {
    acc[p.domain] = (acc[p.domain] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const domainList: CSDomain[] = [
    'Databases & Storage',
    'Compilers & Languages',
    'Distributed Systems',
    'AI & Machine Learning',
    'Cryptography & Security',
    'Computer Graphics & Vision',
    'Systems & OS',
    'Algorithms & Data Structures',
    'Networking & Protocols',
    'Web & Cloud Architecture',
    'Other',
  ]

  return (
    <div className="space-y-4 mb-6">
      {/* Vercel / Cursor Minimal Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <Card className="p-3.5 bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Total Systems</span>
            <span className="text-zinc-500">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{projects.length}</span>
            <span className="text-[11px] text-zinc-500 font-mono">repos</span>
          </div>
        </Card>

        <Card className="p-3.5 bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Production</span>
            <span className="text-zinc-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{completedCount}</span>
            <span className="text-[11px] text-zinc-500 font-mono">completed</span>
          </div>
        </Card>

        <Card className="p-3.5 bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">In Flight</span>
            <span className="text-zinc-500">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{activeCount}</span>
            <span className="text-[11px] text-zinc-500 font-mono">active</span>
          </div>
        </Card>
      </div>

      {/* Domain Quick Pills Horizontal Scroll */}
      <div className="relative">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          <button
            onClick={() => onSelectDomain('ALL')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-all border ${
              selectedDomain === 'ALL'
                ? 'bg-white text-black border-white shadow-sm font-semibold'
                : 'bg-zinc-950/80 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>All Domains</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] ${
              selectedDomain === 'ALL' ? 'bg-zinc-200 text-black' : 'bg-zinc-900 text-zinc-400'
            }`}>
              {projects.length}
            </span>
          </button>

          {domainList.map((domain) => {
            const count = domainCounts[domain] || 0
            const isSelected = selectedDomain === domain
            return (
              <button
                key={domain}
                onClick={() => onSelectDomain(isSelected ? 'ALL' : domain)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-sm font-semibold'
                    : 'bg-zinc-950/80 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {getDomainIcon(domain, "w-3 h-3 text-current")}
                <span>{domain}</span>
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] ${
                    isSelected ? 'bg-zinc-200 text-black' : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
