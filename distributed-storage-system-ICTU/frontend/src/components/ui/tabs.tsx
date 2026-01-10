"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "relative inline-flex h-14 items-center justify-center rounded-[1.8rem] p-1.5",
      "bg-gray-100/50 dark:bg-white/5 backdrop-blur-xl",
      "border border-gray-200/50 dark:border-white/10",
      "shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inner_0_2px_10px_rgba(0,0,0,0.5)]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "group relative z-10 inline-flex items-center justify-center whitespace-nowrap px-8 py-2.5",
      "text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300",
      "text-muted-foreground hover:text-gray-900 dark:hover:text-white",
      "data-[state=active]:text-white dark:data-[state=active]:text-white",
      "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  >
    <span className="relative z-20">{children}</span>
    
    {/* Indicateur de fond animé (uniquement visible si actif) */}
    <div className="absolute inset-0 z-10 hidden group-data-[state=active]:block">
      <motion.div
        layoutId="activeTabIndicator"
        className="h-full w-full rounded-[1.3rem] bg-blue-600 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.6)]"
        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
      />
    </div>
    
    {/* Lueur au survol */}
    <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 group-data-[state=active]:group-hover:opacity-0 transition-opacity">
      <div className="h-full w-full rounded-[1.3rem] bg-gray-200/50 dark:bg-white/5" />
    </div>
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    asChild
    className={cn(
      "mt-6 ring-offset-white focus-visible:outline-none dark:ring-offset-gray-950",
      className
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  </TabsPrimitive.Content>
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }