import * as React from "react"
import { cn } from "@/lib/utils"

export interface QuantumChartProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated"
  minHeight?: "sm" | "md" | "lg" | "xl"
  responsive?: boolean
  loading?: boolean
  children: React.ReactNode
}

const QuantumChart = React.forwardRef<HTMLDivElement, QuantumChartProps>(
  ({ 
    className, 
    variant = "default", 
    minHeight = "lg",
    responsive = true,
    loading = false,
    children,
    ...props 
  }, ref) => {
    const baseClasses = "rounded-2xl border transition-all duration-300 ease-out relative overflow-hidden"
    
    const variantClasses = {
      default: "bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] border-[rgba(45,244,255,0.1)] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]",
      glass: "bg-[rgba(26,34,51,0.8)] border-[rgba(45,244,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]",
      elevated: "bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] border-[rgba(45,244,255,0.2)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-[10px]"
    }

    const heightClasses = {
      sm: "min-h-[200px]",
      md: "min-h-[240px]",
      lg: "min-h-[300px]",
      xl: "min-h-[400px]"
    }

    const responsiveClasses = responsive ? "w-full max-w-full" : ""

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          heightClasses[minHeight],
          responsiveClasses,
          "hover:border-[rgba(45,244,255,0.3)] hover:shadow-[0_0_12px_rgba(45,244,255,0.3),0_8px_32px_rgba(0,0,0,0.3)]",
          className
        )}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(11,15,26,0.8)] backdrop-blur-[10px] z-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-2 border-[rgba(45,244,255,0.2)] border-t-[#2DF4FF] rounded-full animate-spin" />
              <p className="text-[#B2B2B2] text-sm">Loading chart data...</p>
            </div>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    )
  }
)

QuantumChart.displayName = "QuantumChart"

export { QuantumChart } 