'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileIcon, X, CheckCircle2, 
  Loader2, FileText, AlertCircle, 
  Zap, ShieldCheck 
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadItemProps {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  onCancel?: () => void;
}

export function UploadItem({ file, progress, status, onCancel }: UploadItemProps) {
  const isError = status === 'error';
  const isCompleted = status === 'completed';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        x: isError ? [0, -4, 4, -4, 4, 0] : 0 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        x: { duration: 0.4 } 
      }}
      className={cn(
        "relative p-5 rounded-[2rem] border transition-all duration-500 overflow-hidden",
        isCompleted 
          ? "bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
          : isError 
            ? "bg-red-500/5 border-red-500/20" 
            : "bg-white/50 dark:bg-[#080808]/50 backdrop-blur-xl border-gray-100 dark:border-white/10 shadow-xl"
      )}
    >
      {/* Background Glow Progress (Subtile) */}
      <motion.div 
        className="absolute inset-0 bg-blue-500/5 pointer-events-none"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
      />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Animated Icon Container */}
            <div className={cn(
              "p-3 rounded-2xl transition-all duration-500",
              isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : 
              isError ? "bg-red-500 text-white" : "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            )}>
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.div>
                ) : isError ? (
                  <motion.div key="error" initial={{ rotate: 90 }} animate={{ rotate: 0 }}>
                    <AlertCircle className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="upload"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Zap className="w-5 h-5 fill-current" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black truncate text-gray-900 dark:text-white uppercase tracking-tighter italic">
                {file.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                  {formatBytes(file.size)}
                </span>
                {status === 'uploading' && (
                   <span className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-widest animate-pulse">
                     <ShieldCheck className="w-3 h-3" /> Chiffrement actif
                   </span>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={onCancel} 
            className={cn(
              "p-2 rounded-full transition-all hover:rotate-90",
              isCompleted ? "text-emerald-500 opacity-0" : "text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technical Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                 Flux de données
               </span>
               <span className={cn(
                 "text-xs font-black italic tracking-tighter uppercase",
                 isCompleted ? "text-emerald-500" : isError ? "text-red-500" : "text-blue-500"
               )}>
                 {isCompleted ? 'Transmission sécurisée' : isError ? 'Échec du nœud' : 'Synchronisation Nexus'}
               </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black italic tracking-tighter text-gray-900 dark:text-white leading-none">
                {progress}%
              </span>
            </div>
          </div>
          
          <div className="relative group/progress">
            <Progress 
              value={progress} 
              className={cn(
                "h-2 rounded-full",
                isCompleted && "bg-emerald-500/20"
              )} 
            />
            {/* Glow effect at the tip of progress */}
            {!isCompleted && !isError && (
              <motion.div 
                className="absolute top-0 bottom-0 w-8 bg-blue-400 blur-md opacity-50"
                style={{ left: `calc(${progress}% - 32px)` }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}