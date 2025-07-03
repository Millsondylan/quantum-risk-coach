import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target",
  {
    variants: {
      variant: {
        default: "bg-[#1C1C2C] text-[#F4F4F4] border border-[rgba(45,244,255,0.2)] hover:bg-[#1C1C2C]/90 hover:border-[rgba(45,244,255,0.4)] hover:translate-y-[-2px] hover:shadow-[0_0_12px_rgba(45,244,255,0.5)] active:scale-95 active:shadow-[0_0_20px_rgba(45,244,255,0.8)]",
        destructive: "bg-gradient-to-br from-[#FF6F61] to-[#DC2626] text-[#F4F4F4] border-0 hover:translate-y-[-2px] hover:shadow-[0_0_12px_rgba(255,111,97,0.5)] active:scale-95",
        outline: "border border-[rgba(45,244,255,0.3)] bg-transparent text-[#F4F4F4] hover:bg-[rgba(45,244,255,0.1)] hover:border-[rgba(45,244,255,0.5)] hover:translate-y-[-2px] hover:shadow-[0_0_12px_rgba(45,244,255,0.3)] active:scale-95",
        secondary: "bg-[#1C1C2C] text-[#F4F4F4] border border-[rgba(45,244,255,0.3)] hover:bg-[#1C1C2C]/90 hover:border-[rgba(45,244,255,0.5)] hover:translate-y-[-2px] hover:shadow-[0_0_12px_rgba(45,244,255,0.4)] active:scale-95",
        ghost: "hover:bg-[rgba(45,244,255,0.1)] hover:text-[#F4F4F4] active:scale-95",
        link: "text-[#2DF4FF] underline-offset-4 hover:underline hover:text-[#2DF4FF]/80",
        quantum: "bg-gradient-to-br from-[#2DF4FF] to-[#A34EFF] text-[#0B0F1A] font-semibold border-0 shadow-[0_0_12px_rgba(45,244,255,0.5)] hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(45,244,255,0.8)] active:scale-95",
        success: "bg-gradient-to-br from-[#B6F080] to-[#10B981] text-[#0B0F1A] font-semibold border-0 hover:translate-y-[-2px] hover:shadow-[0_0_12px_rgba(182,240,128,0.5)] active:scale-95",
        warning: "bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-[#0B0F1A] font-semibold border-0 hover:translate-y-[-2px] hover:shadow-[0_0_12px_rgba(245,158,11,0.5)] active:scale-95",
      },
              size: {
          default: "h-12 px-6 py-3 text-base",
          sm: "h-10 px-4 py-2 text-sm",
          lg: "h-14 px-8 py-4 text-lg",
          icon: "h-11 w-11",
          "icon-lg": "h-14 w-14",
        },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, ripple = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const [rippleEffect, setRippleEffect] = React.useState<{ x: number; y: number } | null>(null)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !loading) {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        setRippleEffect({ x, y })
        
        // Clear ripple effect after animation
        setTimeout(() => setRippleEffect(null), 300)
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
        {rippleEffect && ripple && (
          <span
            className="absolute rounded-full bg-[rgba(45,244,255,0.3)] animate-[ripple_300ms_ease-out] pointer-events-none"
            style={{
              left: rippleEffect.x - 20,
              top: rippleEffect.y - 20,
              width: 40,
              height: 40,
            }}
          />
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
