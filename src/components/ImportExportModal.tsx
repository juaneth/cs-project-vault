import React, { useState } from 'react'
import { Download, Upload, Copy, Check, AlertCircle } from 'lucide-react'
import { CSProject } from '@/types/project'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ImportExportModalProps {
  isOpen: boolean
  onClose: () => void
  projects: CSProject[]
  onImport: (importedProjects: CSProject[]) => void
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  projects,
  onImport,
}) => {
  const [jsonInput, setJsonInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const jsonString = JSON.stringify(projects, null, 2)

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cs_vault_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImportSubmit = () => {
    setError(null)
    if (!jsonInput.trim()) {
      setError('Please paste valid JSON data to import.')
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      if (!Array.isArray(parsed)) {
        setError('Imported JSON must be an array of CS projects.')
        return
      }

      const validProjects = parsed.filter((p: any) => p && typeof p.title === 'string')
      if (validProjects.length === 0) {
        setError('No valid project objects found in the JSON.')
        return
      }

      onImport(validProjects as CSProject[])
      alert(`Successfully imported ${validProjects.length} CS project(s)!`)
      onClose()
      setJsonInput('')
    } catch (e: any) {
      setError('Invalid JSON format: ' + e.message)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setJsonInput(text)
    }
    reader.readAsText(file)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <span className="flex items-center gap-2">
          <Download className="w-4 h-4 text-white" />
          <span className="font-semibold">Import & Export Systems (JSON)</span>
        </span>
      }
      description="Backup your computer science portfolio or restore previously exported projects."
    >
      <div className="space-y-4 font-sans">
        {/* Export Section */}
        <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono text-zinc-200 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export {projects.length} Repositories</span>
            </h4>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs font-mono gap-1 h-7.5"
              >
                {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                className="text-xs font-mono gap-1 h-7.5"
              >
                <Download className="w-3 h-3" />
                <span>Download .json</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-mono">
            Save a full snapshot of all your project architectures, complexity bounds, and metrics.
          </p>
        </div>

        {/* Import Section */}
        <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono text-zinc-200 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span>Import Systems</span>
            </h4>

            <label className="cursor-pointer text-xs font-mono text-zinc-300 hover:text-white underline underline-offset-2">
              Upload JSON file
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <Textarea
            rows={5}
            placeholder="Paste JSON array of projects here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="font-mono text-xs bg-zinc-950 border-zinc-850"
          />

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              variant="default"
              size="sm"
              onClick={handleImportSubmit}
              className="text-xs font-mono gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Systems</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
