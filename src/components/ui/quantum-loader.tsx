import * as React from "react"
import { cn } from "@/lib/utils"

export interface QuantumLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  variant?: "pulse" | "spinner" | "dots"
  color?: "default" | "cyan" | "violet" | "green"
}

const QuantumLoader = React.forwardRef<HTMLDivElement, QuantumLoaderProps>(
  ({ 
    className, 
    size = "md", 
    variant = "pulse",
    color = "default",
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-12 h-12"
    }

    const colorClasses = {
      default: "border-[rgba(45,244,255,0.2)] border-t-[#2DF4FF]",
      cyan: "border-[rgba(45,244,255,0.2)] border-t-[#2DF4FF]",
      violet: "border-[rgba(163,78,255,0.2)] border-t-[#A34EFF]",
      green: "border-[rgba(182,240,128,0.2)] border-t-[#B6F080]"
    }

    const PulseLoader = () => (
      <div className={cn(
        "relative",
        sizeClasses[size]
      )}>
        <div className={cn(
          "absolute inset-0 rounded-full border-2 animate-spin",
          colorClasses[color]
        )} />
        <div className={cn(
          "absolute inset-2 rounded-full border border-[rgba(45,244,255,0.1)] animate-pulse"
        )} />
      </div>
    )

    const SpinnerLoader = () => (
      <div className={cn(
        "rounded-full border-2 animate-spin",
        sizeClasses[size],
        colorClasses[color]
      )} />
    )

    const DotsLoader = () => (
      <div className={cn(
        "flex space-x-1",
        sizeClasses[size]
      )}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full animate-bounce",
              size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : "w-3 h-3",
              color === "default" || color === "cyan" ? "bg-[#2DF4FF]" :
              color === "violet" ? "bg-[#A34EFF]" : "bg-[#B6F080]"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: "0.6s"
            }}
          />
        ))}
      </div>
    )

    const loaders = {
      pulse: PulseLoader,
      spinner: SpinnerLoader,
      dots: DotsLoader
    }

    const LoaderComponent = loaders[variant]

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          className
        )}
        {...props}
      >
        <LoaderComponent />
      </div>
    )
  }
)

QuantumLoader.displayName = "QuantumLoader"

export { QuantumLoader } 