"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle2, AlertCircle, Info, Flame } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-6 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-4",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full flex-col overflow-hidden rounded-[2rem] border p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all",
  {
    variants: {
      variant: {
        default: "bg-white/80 dark:bg-[#080808]/80 backdrop-blur-2xl border-gray-200/50 dark:border-white/10 text-gray-950 dark:text-gray-50",
        destructive: "bg-red-600/90 dark:bg-red-950/90 backdrop-blur-xl border-red-500/50 text-white shadow-red-500/20",
        success: "bg-emerald-600/90 dark:bg-emerald-950/90 backdrop-blur-xl border-emerald-500/50 text-white shadow-emerald-500/20",
        warning: "bg-amber-500/90 dark:bg-amber-950/90 backdrop-blur-xl border-amber-400/50 text-white shadow-amber-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, children, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full", className)}
      {...props}
    >
      <div className="flex w-full gap-4">
        <div className="flex shrink-0 items-center justify-center">
           {variant === 'success' && <CheckCircle2 className="h-6 w-6 text-white" />}
           {variant === 'destructive' && <AlertCircle className="h-6 w-6 text-white" />}
           {variant === 'warning' && <Flame className="h-6 w-6 text-white" />}
           {variant === 'default' && <Info className="h-6 w-6 text-blue-500" />}
        </div>
        
        <div className="flex flex-1 flex-col gap-1">
          {children}
        </div>

        <ToastPrimitives.Close className="absolute right-4 top-4 rounded-full p-1 opacity-50 transition-all hover:opacity-100 hover:bg-white/10 text-current">
          <X className="h-4 w-4" />
        </ToastPrimitives.Close>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-black/10 dark:bg-white/10">
        <motion.div 
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 5, ease: "linear" }}
          className={cn("h-full w-full", variant === 'default' ? "bg-blue-500" : "bg-white/40")}
        />
      </div>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn("text-sm font-black uppercase tracking-widest leading-none", className)} {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-[11px] font-bold opacity-80 leading-relaxed tracking-tight", className)} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action ref={ref} className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-xl border bg-transparent px-3 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 disabled:pointer-events-none disabled:opacity-50", className)} {...props} />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

type ToastActionElement = React.ReactElement<typeof ToastAction>

// Exportations corrigées avec alias propres
export {
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastPrimitives as ToastPrimitiveExports
}

// Exportation de Close avec le nom attendu par Toaster
export const ToastClose = ToastPrimitives.Close;