'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, FolderPlus, Sparkles, X } from 'lucide-react';

import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/use-app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function CreateFolderModal({ isOpen, onClose, onRefresh }: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addFile } = useAppStore();

  // --- LOGIQUE DE FERMETURE ---
  const handleClose = () => {
    setName('');
    onClose();
  };

  // --- LOGIQUE DE CRÉATION ---
  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    
    try {
      // 1. Appel API vers l'endpoint standardisé
      const res = await api.post('/folders', { 
        name: name.trim(),
        parent_id: null 
      });

      // 2. Synchronisation optimiste du store local
      if (res.data) {
        addFile(res.data);
      }

      toast({ 
        title: "SECTEUR INITIALISÉ", 
        description: `Le dossier "${name}" est désormais actif sur le cluster.` 
      });

      onRefresh();   // Mise à jour de la vue parente
      handleClose(); // Réinitialisation et fermeture
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "ERREUR DE PROTOCOLE", 
        description: err.response?.data?.detail || "Échec de l'allocation du secteur." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay avec flou gaussien */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Fenêtre Modale Nexus */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden"
          >
            {/* Décoration de bordure supérieure */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                  <FolderPlus className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-white leading-none">Nouveau Secteur</h2>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Allocation de métadonnées</p>
                </div>
              </div>
              <button 
                onClick={handleClose} 
                className="text-zinc-700 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Champ de saisie Onyx */}
            <div className="relative group mb-8">
              <Input 
                autoFocus
                placeholder="Identifiant du dossier..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className={cn(
                  "bg-zinc-900/50 border-white/5 text-white h-14 rounded-2xl px-6 transition-all duration-500 placeholder:text-zinc-700 font-bold outline-none",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  name.length > 0 
                    ? "border-blue-500/50 bg-blue-500/5 shadow-[0_0_20px_rgba(37,99,235,0.1)]" 
                    : "focus:border-zinc-700"
                )}
              />
              {name.length > 0 && (
                <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-pulse" />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                onClick={handleClose} 
                variant="ghost" 
                className="flex-1 rounded-2xl uppercase font-black text-[10px] tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-white/5 h-14"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={isLoading || !name.trim()} 
                className={cn(
                    "flex-1 rounded-2xl uppercase font-black text-[10px] tracking-[0.2em] h-14 transition-all duration-300",
                    name.trim() 
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]" 
                      : "bg-zinc-900 text-zinc-700 border border-white/5 cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Initialiser"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}