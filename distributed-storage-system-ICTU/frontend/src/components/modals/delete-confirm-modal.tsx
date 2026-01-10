'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ itemName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Overlay avec flou "Danger" */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-red-950/20 backdrop-blur-md"
      />

      {/* Fenêtre Modale de Paroxysme */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative w-full max-w-md bg-white dark:bg-[#0a0505] rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(220,38,38,0.3)] border border-red-100/50 dark:border-red-900/20 overflow-hidden"
      >
        {/* Glow de fond pour l'alerte */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="p-10 space-y-8 relative z-10">
          {/* Header : Icône de mise en garde */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div 
              animate={isHovered ? { rotate: [0, -5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full animate-pulse" />
              <div className="relative p-6 bg-red-600 rounded-[2rem] shadow-xl shadow-red-500/40">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase text-red-600 dark:text-red-500">
                Attention
              </h2>
              <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                <ShieldAlert className="w-3 h-3" />
                Action irréversible
              </div>
            </div>
          </div>

          {/* Corps de texte */}
          <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 text-center">
            <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-200">
              Êtes-vous certain de vouloir supprimer définitivement <br />
              <span className="text-red-600 dark:text-red-500 font-black italic text-base break-all">
                "{itemName}"
              </span> ?
            </p>
          </div>

          {/* Boutons d'Action */}
          <div className="flex flex-col gap-3">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <Button 
                onClick={onConfirm}
                className={cn(
                  "w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-600/20 gap-3 transition-all duration-300"
                )}
              >
                <Trash2 className="w-5 h-5" />
                Confirmer la suppression
              </Button>
            </motion.div>

            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              Annuler
            </Button>
          </div>
        </div>

        {/* Barre de danger décorative */}
        <div className="h-1.5 w-full flex">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-full flex-1",
                i % 2 === 0 ? "bg-red-600" : "bg-black dark:bg-red-950"
              )} 
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}