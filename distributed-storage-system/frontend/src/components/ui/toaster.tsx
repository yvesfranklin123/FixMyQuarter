"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {/* On définit les types pour éviter les erreurs implicit 'any' */}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-slate-900/80 border-white/10 backdrop-blur-lg">
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="text-white font-bold">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-slate-400 text-xs">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-white/50 hover:text-white" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}