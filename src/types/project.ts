export type CSDomain =
  | 'Systems & OS'
  | 'AI & Machine Learning'
  | 'Compilers & Languages'
  | 'Distributed Systems'
  | 'Algorithms & Data Structures'
  | 'Cryptography & Security'
  | 'Computer Graphics & Vision'
  | 'Databases & Storage'
  | 'Networking & Protocols'
  | 'Web & Cloud Architecture'
  | 'Other'

export type ProjectStatus =
  | 'Active'
  | 'Completed'
  | 'In Progress'
  | 'Prototype'
  | 'Research Paper'
  | 'Archived'

export type GradientPreset =
  | 'monochrome-sheen'
  | 'zinc-carbon'
  | 'graphite-dark'
  | 'silver-slate'
  | 'obsidian-noir'
  | 'wireframe-grid'

export interface CSProject {
  id: string
  title: string
  tagline: string
  description: string
  domain: CSDomain
  folder?: string
  status: ProjectStatus
  techStack: string[]
  githubUrl?: string
  demoUrl?: string
  paperUrl?: string
  featured: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  keyHighlights: string[]
  architectureNotes?: string
  gradientPreset: GradientPreset
}

export const CS_DOMAINS: CSDomain[] = [
  'Systems & OS',
  'AI & Machine Learning',
  'Compilers & Languages',
  'Distributed Systems',
  'Algorithms & Data Structures',
  'Cryptography & Security',
  'Computer Graphics & Vision',
  'Databases & Storage',
  'Networking & Protocols',
  'Web & Cloud Architecture',
  'Other',
]

export const PROJECT_STATUSES: ProjectStatus[] = [
  'In Progress',
  'Completed',
  'Active',
  'Prototype',
  'Research Paper',
  'Archived',
]

export const GRADIENT_PRESETS: { id: GradientPreset; label: string; class: string; border: string }[] = [
  { id: 'monochrome-sheen', label: 'Silver Sheen', class: 'from-white/10 via-white/5 to-transparent', border: 'border-white/20' },
  { id: 'zinc-carbon', label: 'Zinc Carbon', class: 'from-zinc-500/15 via-zinc-600/5 to-transparent', border: 'border-zinc-700' },
  { id: 'graphite-dark', label: 'Graphite', class: 'from-zinc-700/25 via-zinc-800/10 to-transparent', border: 'border-zinc-600' },
  { id: 'silver-slate', label: 'Silver Slate', class: 'from-neutral-400/15 via-neutral-500/5 to-transparent', border: 'border-neutral-700' },
  { id: 'obsidian-noir', label: 'Obsidian Noir', class: 'from-zinc-800/30 via-zinc-900/10 to-transparent', border: 'border-zinc-800' },
  { id: 'wireframe-grid', label: 'Wireframe', class: 'from-white/15 via-white/5 to-transparent', border: 'border-white/30' },
]

export const COMMON_TECH_STACK = [
  'Rust',
  'C++',
  'C',
  'Go',
  'Python',
  'TypeScript',
  'WebAssembly',
  'CUDA',
  'PyTorch',
  'LLVM',
  'Linux Kernel',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'Redis',
  'gRPC',
  'Protobuf',
  'WebGPU',
  'WGSL',
  'React',
  'Next.js',
  'Tailwind CSS',
  'Kafka',
  'GraphQL'
]
