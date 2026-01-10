"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const safeValue = value || 0;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full",
        // Châssis sculpté
        "bg-gray-100 dark:bg-[#0a0a0a]",
        "border border-gray-200/50 dark:border-white/5",
        "shadow-[inner_0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[inner_0_2px_10px_rgba(0,0,0,0.5)]",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        asChild
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className={cn(
            "relative h-full w-full flex-1 transition-all duration-500",
            "bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400",
            "shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          )}
        >
          {/* Effet de balayage (Shimmer) */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-[shimmer_2s_infinite] -translate-x-full" />
          </div>

          {/* Particules de brillance (Texture de données) */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

          {/* Lueur de tête (La pointe de la progression) */}
          <div className="absolute right-0 top-0 h-full w-4 bg-white blur-md opacity-50 transition-opacity" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-1 bg-white shadow-[0_0_15px_#fff] rounded-full" />
        </motion.div>
      </ProgressPrimitive.Indicator>

      {/* Réflectivité de surface (L'éclat du verre) */}
      <div className="absolute inset-0 pointer-events-none rounded-full border-t border-white/20 dark:border-white/5" />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }