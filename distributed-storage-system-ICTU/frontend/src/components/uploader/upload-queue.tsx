'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, ChevronDown, CloudUpload, 
  X, Zap, Activity, CheckCircle2,
  Maximize2, Minimize2
} from 'lucide-react';
import { UploadItem } from './upload-item';
import { cn } from '@/lib/utils';

interface UploadQueueProps {
  uploads: {
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
  }[];
}

export function UploadQueue({ uploads }: UploadQueueProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const stats = useMemo(() => {
    const completed = uploads.filter(u => u.status === 'completed').length;
    const totalProgress = uploads.reduce((acc, curr) => acc + curr.progress, 0) / uploads.length;
    return { completed, totalProgress };
  }, [uploads]);

  if (uploads.length === 0) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 100, opacity: 0 }}
      layout
      className={cn(
        "fixed bottom-8 right-8 z-[100] w-96 transition-all duration-500",
        "bg-white/70 dark:bg-[#080808]/70 backdrop-blur-3xl",
        "border border-gray-200/50 dark:border-white/10",
        "rounded-[2.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.4)]",
        "overflow-hidden"
      )}
    >
      {/* 1. DYNAMIC HEADER */}
      <div 
        className={cn(
          "p-5 flex items-center justify-between cursor-pointer transition-colors relative overflow-hidden",
          stats.totalProgress === 100 
            ? "bg-emerald-500/10 dark:bg-emerald-500/20" 
            : "bg-blue-600 dark:bg-blue-600/90"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Background Sync Animation */}
        <motion.div 
          className="absolute inset-0 bg-white/10"
          initial={{ x: "-100%" }}
          animate={{ x: stats.totalProgress === 100 ? "0%" : `${stats.totalProgress - 100}%` }}
          transition={{ type: "spring", bounce: 0, duration: 1 }}
        />

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            {stats.totalProgress === 100 ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <Zap className="w-4 h-4 text-white animate-pulse" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {stats.totalProgress === 100 ? 'Synchronisation Terminée' : 'Nexus Uploader'}
            </span>
            <span className="text-[9px] font-bold text-white/70 uppercase">
              {stats.completed} / {uploads.length} fichiers sécurisés
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white">
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. UPLOAD LIST AREA */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative"
          >
            {/* Soft Mask for scrolling */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white dark:from-[#080808] to-transparent z-10 pointer-events-none" />
            
            <div className="max-h-[450px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {uploads.map((u, i) => (
                <UploadItem key={u.file.name + i} {...u} />
              ))}
            </div>

            <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-white dark:from-[#080808] to-transparent z-10 pointer-events-none" />
            
            {/* 3. FOOTER STATS */}
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  Bande passante optimisée
                </span>
              </div>
              <span className="text-[10px] font-black italic text-blue-500">
                {Math.round(stats.totalProgress)}% Global
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}