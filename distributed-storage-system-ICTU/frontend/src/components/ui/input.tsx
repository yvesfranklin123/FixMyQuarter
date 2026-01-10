"use client"

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <motion.div
        className="relative w-full group"
        initial={false}
        whileHover="hover"
      >
        {/* Glow décoratif en arrière-plan au focus */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[1.4rem] blur-sm opacity-0 group-focus-within:opacity-30 transition-opacity duration-500" />
        
        <input
          type={type}
          className={cn(
            // Structure & Taille
            "relative flex h-14 w-full rounded-[1.2rem] px-6 py-4 text-sm transition-all duration-300",
            
            // Couleurs de base (Look sculpté)
            "bg-gray-50/50 dark:bg-[#0a0a0a] border-2 border-transparent",
            "text-gray-900 dark:text-gray-100 placeholder:text-muted-foreground/50 placeholder:font-medium",
            
            // Ombres internes (Profondeur)
            "shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inner_0_2px_10px_rgba(0,0,0,0.4)]",
            
            // États Interactifs (Le Paroxysme)
            "hover:bg-white dark:hover:bg-[#0f0f0f] hover:border-gray-200 dark:hover:border-white/10",
            "focus-visible:outline-none focus-visible:bg-white dark:focus-visible:bg-black",
            "focus-visible:border-blue-500/50 focus-visible:shadow-[0_0_20px_rgba(37,99,235,0.1)]",
            
            // Accessibilité & État désactivé
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale",
            
            // Typographie
            "font-bold tracking-tight",
            
            className
          )}
          ref={ref}
          {...props}
        />

        {/* Ligne d'accentuation animée sous l'input */}
        <motion.div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-blue-500 rounded-full"
          initial={{ width: "0%" }}
          whileFocus={{ width: "40%" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </motion.div>
    );
  }
);
Input.displayName = "Input";

export { Input };