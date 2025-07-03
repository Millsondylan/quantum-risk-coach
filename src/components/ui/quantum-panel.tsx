import * as React from "react"
import { cn } from "@/lib/utils"

export interface QuantumPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated"
  padding?: "none" | "sm" | "md" | "lg"
  margin?: "none" | "sm" | "md" | "lg"
  blur?: boolean
  glow?: boolean
  children: React.ReactNode
}

const QuantumPanel = React.forwardRef<HTMLDivElement, QuantumPanelProps>(
  ({ 
    className, 
    variant = "default", 
    padding = "md", 
    margin = "none",
    blur = true,
    glow = false,
    children,
    ...props 
  }, ref) => {
    const baseClasses = "rounded-2xl border transition-all duration-300 ease-out"
    
    const variantClasses = {
      default: "bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] border-[rgba(45,244,255,0.1)] shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
      glass: "bg-[rgba(26,34,51,0.8)] border-[rgba(45,244,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
      elevated: "bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] border-[rgba(45,244,255,0.2)] shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
    }

    const paddingClasses = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8"
    }

    const marginClasses = {
      none: "",
      sm: "m-4",
      md: "m-6",
      lg: "m-8"
    }

    const blurClasses = blur ? "backdrop-blur-[10px]" : ""
    const glowClasses = glow ? "hover:shadow-[0_0_12px_rgba(45,244,255,0.5),0_8px_32px_rgba(0,0,0,0.3)]" : ""

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          marginClasses[margin],
          blurClasses,
          glowClasses,
          "hover:border-[rgba(45,244,255,0.3)] hover:-translate-y-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

QuantumPanel.displayName = "QuantumPanel"

export { QuantumPanel } 