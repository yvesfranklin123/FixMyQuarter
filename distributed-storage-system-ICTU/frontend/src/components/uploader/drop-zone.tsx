'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, ShieldCheck, Zap, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFilesDrop: (files: File[]) => void;
}

export function DropZone({ onFilesDrop }: DropZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesDrop(acceptedFiles);
    }
  }, [onFilesDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer transition-all duration-500",
        "rounded-[3rem] border-2 border-dashed p-12 overflow-hidden",
        isDragActive 
          ? "border-blue-500 bg-blue-50/50 scale-[1.01] shadow-2xl shadow-blue-500/10" 
          : "border-gray-200 bg-white/50 hover:border-blue-400 hover:bg-gray-50"
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center text-center space-y-4">
        {/* ICON ANIMATION */}
        <div className={cn(
          "w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500",
          isDragActive ? "bg-blue-600 rotate-12 scale-110" : "bg-gray-100 group-hover:bg-blue-100"
        )}>
          {isDragActive ? (
            <FileUp className="w-10 h-10 text-white animate-bounce" />
          ) : (
            <CloudUpload className="w-10 h-10 text-gray-400 group-hover:text-blue-600" />
          )}
        </div>

        {/* TEXT */}
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase italic tracking-tighter">
            {isDragActive ? "Relâchez pour injecter" : "Déposer vos fragments"}
          </h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Glissez-déposez ou cliquez pour sélectionner des fichiers
          </p>
        </div>

        {/* TECH BADGES */}
        <div className="flex items-center gap-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">P2P Distribution</span>
          </div>
        </div>
      </div>

      {/* BACKGROUND DECORATION */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}