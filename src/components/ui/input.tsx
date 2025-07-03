import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "quantum" | "glass"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const baseClasses = "flex h-14 w-full rounded-xl border bg-transparent px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ease-out"
    
    const variantClasses = {
      default: "border-input bg-background text-foreground",
      quantum: "border-[rgba(45,244,255,0.2)] bg-[rgba(26,34,51,0.8)] text-[#F4F4F4] placeholder:text-[#B2B2B2] backdrop-blur-[10px] focus:border-[#2DF4FF] focus:shadow-[0_0_12px_rgba(45,244,255,0.5)] focus:bg-[rgba(26,34,51,0.9)]",
      glass: "border-[rgba(45,244,255,0.2)] bg-[rgba(26,34,51,0.6)] text-[#F4F4F4] placeholder:text-[#B2B2B2] backdrop-blur-[10px]"
    }

    return (
      <input
        type={type}
        className={cn(baseClasses, variantClasses[variant], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
