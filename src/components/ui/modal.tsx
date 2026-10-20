import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = "2xl",
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full z-10 my-8 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl transition-all animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] flex flex-col",
          maxWidthClasses[maxWidth],
          className
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-border/80">
          <div>
            {title && (
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-4"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 pt-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
