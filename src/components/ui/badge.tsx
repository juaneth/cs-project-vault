import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "cyan" | "emerald" | "amber" | "violet" | "rose" | "white" | "solid"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-850",
    secondary: "border-zinc-850 bg-zinc-950 text-zinc-400",
    destructive: "border-zinc-800 bg-zinc-900 text-zinc-300",
    outline: "text-zinc-400 border-zinc-800 bg-transparent",
    white: "border-white/40 bg-white text-black font-semibold",
    solid: "border-zinc-700 bg-zinc-100 text-zinc-900 font-medium",
    // All semantic CS badges styled with distinct subtle monochrome textures
    cyan: "border-zinc-700/80 bg-zinc-900/80 text-zinc-200 font-mono",
    emerald: "border-zinc-800 bg-zinc-950 text-zinc-400 font-mono",
    amber: "border-zinc-700/90 bg-zinc-900 text-zinc-100 font-mono",
    violet: "border-white/25 bg-white/5 text-zinc-100 font-mono",
    rose: "border-white/35 bg-white/10 text-white font-mono",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
