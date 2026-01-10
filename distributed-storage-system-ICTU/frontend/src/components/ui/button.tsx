"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-bold uppercase tracking-[0.15em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        default: 
          "bg-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] border-t border-white/20 hover:bg-blue-700",
        shiny: 
          "bg-gradient-to-br from-blue-500 to-indigo-700 text-white border-t border-white/30 shadow-xl after:absolute after:inset-0 after:bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-[transform] after:duration-1000",
        destructive: 
          "bg-red-600 text-white shadow-lg shadow-red-500/30 border-t border-white/10 hover:bg-red-700",
        outline: 
          "border-2 border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/20 backdrop-blur-md hover:border-blue-500/50 hover:text-blue-600 dark:text-gray-200",
        secondary: 
          "bg-gray-100 text-gray-900 dark:bg-white/5 dark:text-gray-100 dark:border-t dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10",
        ghost: 
          "text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
        glow: 
          "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_35px_rgba(37,99,235,0.8)] transition-shadow duration-500",
        white: 
          "bg-white text-gray-950 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)] hover:bg-gray-50 border-b-4 border-gray-200 active:border-b-0",
      },
      size: {
        default: "h-12 px-8 rounded-2xl",
        sm: "h-9 rounded-xl px-4 text-[10px]",
        lg: "h-16 rounded-[1.8rem] px-12 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// On fusionne les types pour supporter Framer Motion
type CombinedProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  VariantProps<typeof buttonVariants> & 
  { asChild?: boolean };

const Button = React.forwardRef<HTMLButtonElement, CombinedProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button

    // Animation de clic paroxysmique
    const motionProps = !asChild ? {
      whileHover: { scale: 1.02, y: -2 },
      whileTap: { scale: 0.96, y: 1 },
      transition: { type: "spring", stiffness: 400, damping: 15 }
    } : {}

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...motionProps}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }