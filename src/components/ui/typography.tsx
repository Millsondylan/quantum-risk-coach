import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Typography Variants for Consistent Styling
const typographyVariants = cva("", {
  variants: {
    // Screen-specific text styles
    screen: {
      dashboard: "tracking-tight",
      analytics: "tracking-tight",
      settings: "tracking-normal",
      aiCoach: "tracking-tight leading-relaxed",
    },
    // Text weight and emphasis
    weight: {
      light: "font-light text-muted-foreground",
      regular: "font-normal",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    // Text size scaling
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
    },
    // Color coding for different contexts
    context: {
      default: "text-foreground",
      positive: "text-green-600 dark:text-green-400",
      negative: "text-red-600 dark:text-red-400",
      neutral: "text-muted-foreground",
      highlight: "text-primary",
    },
    // Alignment options
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    screen: "dashboard",
    weight: "regular",
    size: "base",
    context: "default",
    align: "left",
  },
})

// Headline Component
const Headline = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & 
  VariantProps<typeof typographyVariants> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6
  }
>(({ 
  className, 
  level = 2, 
  screen, 
  weight, 
  size, 
  context, 
  align,
  ...props 
}, ref) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
  return React.createElement(
    HeadingTag, 
    {
      ref,
      className: cn(
        typographyVariants({ 
          screen, 
          weight: weight || "semibold", 
          size: size || (level === 1 ? "2xl" : "xl"), 
          context, 
          align 
        }),
        className
      ),
      ...props
    }
  )
})
Headline.displayName = "Headline"

// Description/Subtext Component
const Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & 
  VariantProps<typeof typographyVariants>
>(({ 
  className, 
  screen, 
  weight, 
  size, 
  context, 
  align,
  ...props 
}, ref) => (
  <p
    ref={ref}
    className={cn(
      typographyVariants({ 
        screen, 
        weight: weight || "light", 
        size: size || "sm", 
        context, 
        align 
      }),
      className
    )}
    {...props}
  />
))
Description.displayName = "Description"

// Statistic/Highlight Text Component
const Statistic = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & 
  VariantProps<typeof typographyVariants>
>(({ 
  className, 
  screen, 
  weight, 
  size, 
  context, 
  align,
  ...props 
}, ref) => (
  <span
    ref={ref}
    className={cn(
      typographyVariants({ 
        screen, 
        weight: weight || "bold", 
        size: size || "base", 
        context: context || "highlight", 
        align 
      }),
      className
    )}
    {...props}
  />
))
Statistic.displayName = "Statistic"

export { 
  Headline, 
  Description, 
  Statistic, 
  typographyVariants 
} 