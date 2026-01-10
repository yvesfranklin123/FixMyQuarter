"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 select-none focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: 
          "border-blue-400/30 bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)]",
        secondary: 
          "border-gray-200/50 bg-gray-100/80 backdrop-blur-md text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-white/10",
        destructive: 
          "border-red-500/20 bg-red-500/10 text-red-600 shadow-[0_2px_10px_rgba(239,68,68,0.1)] dark:text-red-400 hover:bg-red-500/20",
        outline: 
          "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900",
        success: 
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shadow-[0_2px_10px_rgba(16,185,129,0.1)] dark:text-emerald-400 hover:bg-emerald-500/20",
        premium:
          "border-purple-500/30 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }