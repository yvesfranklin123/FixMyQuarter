'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CollabCursorProps {
  name: string;
  color: string;
  x: number;
  y: number;
  isTyping?: boolean;
}

export function CollabCursor({ name, color, x, y, isTyping = false }: CollabCursorProps) {
  return (
    <motion.div
      className="absolute pointer-events-none z-[9999] flex flex-col items-start"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        x, 
        y, 
        opacity: 1, 
        scale: 1,
        filter: isTyping ? `drop-shadow(0 0 8px ${color}66)` : `drop-shadow(0 2px 4px rgba(0,0,0,0.2))`
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        x: { type: "spring", damping: 35, stiffness: 250, mass: 0.5 },
        y: { type: "spring", damping: 35, stiffness: 250, mass: 0.5 },
        scale: { duration: 0.2 }
      }}
    >
      {/* L'ombre de l'aura (Glow Effect) */}
      <div 
        className="absolute -inset-4 rounded-full opacity-20 blur-xl animate-pulse"
        style={{ backgroundColor: color }}
      />

      {/* Le Pointeur SVG */}
      <svg 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="white" 
        strokeWidth="2"
        strokeLinejoin="round"
        className="relative drop-shadow-sm"
      >
        <path 
          d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" 
          fill={color}
        />
      </svg>

      {/* Label Utilisateur */}
      <motion.div
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative ml-3 mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/20 shadow-2xl backdrop-blur-md"
        style={{ backgroundColor: color }}
      >
        <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
          {name}
        </span>

        {/* Petit indicateur de frappe (Typing Indicator) */}
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex gap-0.5"
            >
              <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 bg-white rounded-full animate-bounce" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Micro-onde de choc décorative (Pulse) */}
      <motion.div
        animate={{
          scale: [1, 1.5, 2],
          opacity: [0.3, 0.1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="absolute top-0 left-0 w-6 h-6 rounded-full -z-10"
        style={{ border: `2px solid ${color}` }}
      />
    </motion.div>
  );
}