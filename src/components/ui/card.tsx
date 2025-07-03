import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "quantum" | "glass"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const baseClasses = "rounded-2xl border transition-all duration-300 ease-out"
  
  const variantClasses = {
    default: "bg-card text-card-foreground shadow-sm",
    quantum: "bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] border-[rgba(45,244,255,0.1)] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px] hover:border-[rgba(45,244,255,0.3)] hover:shadow-[0_0_12px_rgba(45,244,255,0.5),0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-1",
    glass: "bg-[rgba(26,34,51,0.8)] border-[rgba(45,244,255,0.2)] backdrop-blur-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
  }

  return (
    <div
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-[#F4F4F4]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#B2B2B2]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
