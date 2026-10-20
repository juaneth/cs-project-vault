import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow" | "cyber"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]"

    const variantStyles = {
      default: "bg-white text-black hover:bg-zinc-200 border border-white/10 shadow-sm font-semibold dark:bg-white dark:text-black dark:hover:bg-zinc-200",
      destructive: "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700",
      outline: "border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700",
      secondary: "bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white border border-zinc-800/80",
      ghost: "text-zinc-400 hover:text-white hover:bg-zinc-900",
      link: "text-zinc-200 underline-offset-4 hover:underline",
      glow: "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.18)] font-semibold border border-white/20",
      cyber: "bg-black border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-zinc-950",
    }

    const sizeStyles = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-lg px-6 text-sm",
      icon: "h-8.5 w-8.5 p-0",
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
