'use client';

import { useState } from 'react';
import { 
  Maximize2, FileText, Download, Printer, 
  X, ShieldCheck, ExternalLink, Minimize2,
  FileSearch, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
  url: string;
  title: string;
  onClose?: () => void;
}

export function PDFViewer({ url, title, onClose }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "flex flex-col bg-white dark:bg-[#050505] border border-gray-200 dark:border-gray-800 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.3)] transition-all duration-700 ease-in-out",
        isFullscreen 
          ? "fixed inset-0 z-[100] rounded-0" 
          : "relative w-full h-[85vh] rounded-[3rem] overflow-hidden"
      )}
    >
      {/* 1. TOP BAR - ANALYTICS & CONTROLS */}
      <div className="flex items-center justify-between px-8 h-24 border-b border-gray-100 dark:border-gray-900 bg-white/50 dark:bg-gray-950/50 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-5">
          {isFullscreen && (
             <Button 
               variant="ghost" 
               size="icon" 
               className="rounded-full bg-gray-100 dark:bg-gray-800"
               onClick={() => setIsFullscreen(false)}
             >
               <ChevronLeft className="w-5 h-5" />
             </Button>
          )}
          
          <div className="p-3.5 bg-red-500/10 rounded-[1.25rem] shadow-inner">
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          
          <div className="flex flex-col space-y-0.5">
            <h3 className="text-base font-black uppercase tracking-tight truncate max-w-[180px] sm:max-w-md text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                <ShieldCheck className="w-3 h-3" /> Chiffré AES-256
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PDF Standard</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-gray-100/50 dark:bg-gray-900/50 p-1 rounded-2xl mr-2">
            <ToolbarButton onClick={() => window.print()} title="Imprimer">
              <Printer className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => window.open(url, '_blank')} title="Ouvrir dans un nouvel onglet">
              <ExternalLink className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-2xl w-12 h-12 hover:bg-blue-500/10 hover:text-blue-500 transition-all"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>

          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-2xl w-12 h-12 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white transition-all ml-2"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>

      {/* 2. PDF VIEWPORT - THE CORE */}
      <div className="flex-1 relative bg-[#f4f4f5] dark:bg-[#0a0a0a] p-4 md:p-10 overflow-hidden">
        {/* Effet d'ombre portée sur l'iframe pour donner de la profondeur */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none z-10" />
        
        <iframe
          src={`${url}#view=FitH&scrollbar=0&toolbar=0&navpanes=0`}
          className="w-full h-full rounded-[1.5rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-white dark:bg-gray-900"
          title={title}
        />
        
        {/* Floating Page Search Helper (UI only) */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 dark:bg-white/90 backdrop-blur-xl rounded-full flex items-center gap-4 shadow-2xl z-20 transition-transform hover:scale-105">
           <FileSearch className="w-4 h-4 text-white dark:text-black" />
           <span className="text-[10px] font-black text-white dark:text-black uppercase tracking-widest">Navigation Optimisée</span>
        </div>
      </div>

      {/* 3. FOOTER - FINAL CALL TO ACTION */}
      <div className="px-10 h-20 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between bg-white dark:bg-gray-950">
        <div className="hidden md:flex flex-col">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Propriétaire</span>
          <span className="text-xs font-bold">Système NexusCore</span>
        </div>

        <Button className="h-12 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-[10px] gap-3 shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:translate-y-0">
          <Download className="w-4 h-4" /> 
          Conserver une copie locale
        </Button>

        <div className="hidden md:block w-32 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
           <motion.div 
             className="h-full bg-blue-500"
             initial={{ width: "0%" }}
             animate={{ width: "100%" }}
             transition={{ duration: 2 }}
           />
        </div>
      </div>
    </motion.div>
  );
}

// Sous-composant pour les boutons de la barre d'outils
function ToolbarButton({ 
  children, 
  onClick, 
  title 
}: { 
  children: React.ReactNode; 
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-3 rounded-xl transition-all duration-200 text-muted-foreground hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 shadow-none hover:shadow-sm"
    >
      {children}
    </button>
  );
}