'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, ZoomOut, RotateCw, Download, 
  Maximize, Minimize, RefreshCcw, Image as ImageIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function ImageViewer({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 1));
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[75vh] flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0a0a0a] rounded-[3.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden group transition-all duration-500"
    >
      {/* BACKGROUND DECOR : PATTERN DE TRANSPARENCE (Pour les PNG) */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1' fill-rule='evenodd'%3E%3Crect width='10' height='10'/%3E%3Crect x='10' y='10' width='10' height='10'/%3E%3C/g%3E%3C/svg%3E")` }} 
      />

      {/* TOOLBAR FLOTTANTE (GLASSMORPHISM) */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-8 z-30 flex items-center gap-2 p-2 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/20 dark:border-gray-800 rounded-[2rem] shadow-2xl shadow-black/20"
      >
        <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-800 mr-1">
          <ImageIcon className="w-4 h-4 text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-widest ml-1 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <ToolbarButton onClick={handleZoomOut} disabled={scale <= 1}>
          <ZoomOut className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton onClick={handleZoomIn} disabled={scale >= 5}>
          <ZoomIn className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={() => setRotation(r => r + 90)}>
          <RotateCw className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={handleReset} className="text-amber-500 hover:bg-amber-500/10">
          <RefreshCcw className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 mx-1" />

        <ToolbarButton className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20">
          <Download className="w-4 h-4" />
        </ToolbarButton>
      </motion.div>

      {/* INFO BADGE (TOP LEFT) */}
      <div className="absolute top-8 left-8 z-30 flex flex-col gap-1">
        <h3 className="text-sm font-black uppercase tracking-tighter italic text-gray-900 dark:text-white drop-shadow-sm">
          {alt || "Nexus_View_01"}
        </h3>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Source Chiffrée AES-256</p>
      </div>

      {/* L'IMAGE ANIMÉE */}
      <div className={cn(
        "relative w-full h-full flex items-center justify-center transition-all duration-300",
        scale > 1 ? "cursor-move" : "cursor-default"
      )}>
        <AnimatePresence mode="wait">
          <motion.img
            key={src}
            src={src}
            alt={alt}
            style={{ scale, x, y, rotate: rotation }}
            drag={scale > 1}
            dragConstraints={containerRef}
            dragElastic={0.1}
            className="max-w-[85%] max-h-[85%] object-contain select-none shadow-2xl rounded-lg"
            initial={{ opacity: 0, scale: 0.9, rotate: rotation - 10 }}
            animate={{ opacity: 1, scale, rotate: rotation }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          />
        </AnimatePresence>
      </div>

      {/* GRADIENT DE VIGNETTAGE DÉCORATIF */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 dark:border-black/5 rounded-[3.5rem]" />
    </div>
  );
}

// Sous-composant pour les boutons de la barre d'outils
function ToolbarButton({ 
  children, 
  onClick, 
  disabled = false, 
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-3 rounded-2xl transition-all duration-300 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed",
        "hover:scale-110 active:scale-95",
        "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
        className
      )}
    >
      {children}
    </button>
  );
}