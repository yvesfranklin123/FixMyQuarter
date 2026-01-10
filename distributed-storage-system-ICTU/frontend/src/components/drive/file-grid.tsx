'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, Loader2, FolderOpen, Share2, Trash2 } from 'lucide-react';

import { useAppStore } from '@/store/use-app-store';
import { FileCard } from './file-card';
import { FileRow } from './file-row';
import { cn } from '@/lib/utils';

interface FileGridProps {
  folderId: string; // 'root', 'shared', 'trash', ou UUID
  isLoading?: boolean;
}

export function FileGrid({ folderId, isLoading }: FileGridProps) {
  const { viewMode, files } = useAppStore();

  /**
   * --- LOGIQUE DE FILTRAGE NEXUS (STRICTE) ---
   */
  const filteredFiles = useMemo(() => {
    if (!files || !Array.isArray(files)) return [];

    return files.filter((file) => {
      // 1. PRIORITÉ : QUARANTAINE (TRASH)
      // Si on est dans la corbeille, on ne montre que les éléments supprimés
      if (folderId === 'trash') return file.is_trashed === true;
      
      // Si on n'est PAS dans la corbeille, on cache systématiquement les éléments supprimés
      if (file.is_trashed) return false;

      // 2. SECTEUR RÉSEAU (SHARED)
      // ✅ LOGIQUE MISE À JOUR : 
      // Si folderId est 'shared', on affiche TOUT le contenu du store.
      // Pourquoi ? Parce que SharedPage a déjà appelé l'API qui filtre par "shared_with_user_id".
      if (folderId === 'shared') return true; 

      // 3. NAVIGATION CLASSIQUE (DRIVE PERSO)
      // On normalise les IDs pour éviter les erreurs de type (String/UUID)
      const currentSecteur = String(folderId).trim().toLowerCase();
      const fragmentSecteur = file.folder_id ? String(file.folder_id).trim().toLowerCase() : 'root';

      if (currentSecteur === 'root') {
        return fragmentSecteur === 'root';
      }

      return fragmentSecteur === currentSecteur;
    });
  }, [files, folderId]);

  // --- 1. ÉTAT DE CHARGEMENT ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 space-y-6">
        <div className="relative">
          <Loader2 className="w-14 h-14 text-blue-600 animate-spin stroke-[1.5px]" />
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse">
          Synchronisation du maillage...
        </p>
      </div>
    );
  }

  // --- 2. ÉTAT VIDE ---
  if (filteredFiles.length === 0) {
    const emptyConfigs = {
      trash: { icon: Trash2, text: "Quarantaine Vide", sub: "Aucun fragment compromis détecté", color: "text-rose-500" },
      shared: { icon: Share2, text: "Réception Vide", sub: "Aucun fragment ne vous a été transmis", color: "text-blue-400" },
      root: { icon: HardDrive, text: "Secteur Vide", sub: "Prêt pour l'injection de données", color: "text-zinc-600" },
    };
    
    const config = emptyConfigs[folderId as keyof typeof emptyConfigs] || { 
      icon: FolderOpen, 
      text: "Secteur Vide", 
      sub: "Aucun fragment détecté dans ce nœud", 
      color: "text-zinc-500" 
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-32 bg-zinc-900/10 rounded-[3rem] border border-dashed border-white/[0.03] mx-2"
      >
        <div className="relative mb-8 p-8 bg-zinc-950/50 rounded-full border border-white/5 shadow-inner">
          <div className={cn("absolute inset-0 blur-3xl rounded-full opacity-5", config.color.replace('text', 'bg'))} />
          <config.icon className={cn("relative w-12 h-12 opacity-20", config.color)} />
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-zinc-500">{config.text}</h3>
          <p className="text-[9px] font-bold uppercase text-zinc-700 tracking-widest">{config.sub}</p>
        </div>
      </motion.div>
    );
  }

  // --- 3. RENDU FINAL (GRILLE OU LISTE) ---
  return (
    <div className="mt-8 px-2 min-h-[400px]">
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
          >
            {filteredFiles.map((file) => (
              <FileCard key={file.id} item={file} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md"
          >
            <div className="grid grid-cols-12 px-8 py-6 border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 bg-white/[0.01]">
              <div className="col-span-6 flex items-center gap-3">
                <FolderOpen className="w-3.5 h-3.5 text-blue-500/40" /> Identifiant du Fragment
              </div>
              <div className="col-span-3">Poids de la donnée</div>
              <div className="col-span-3 text-right pr-4">Horodatage</div>
            </div>
            
            <div className="divide-y divide-white/[0.02]">
              {filteredFiles.map((file, index) => (
                <FileRow key={file.id} item={file} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}