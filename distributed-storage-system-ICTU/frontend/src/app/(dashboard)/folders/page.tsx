'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderPlus, 
  Folder as FolderIcon, 
  Grid2X2, 
  List as ListIcon,
  Plus,
  ArrowRight
} from 'lucide-react';

import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/use-app-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileGrid } from '@/components/drive/file-grid';
import { CreateFolderModal } from '@/components/drive/create-folder-modal'; 

export default function FoldersPage() {
  const router = useRouter();
  const { viewMode, setViewMode, fetchFiles } = useAppStore(); // On récupère fetchFiles pour sync les fragments racine
  
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LOGIQUE DE RÉCUPÉRATION ---
  const fetchFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/folders'); 
      setFolders(res.data);
      // On rafraîchit aussi les fichiers racines pour la section 3
      await fetchFiles();
    } catch (err) {
      console.error("Nexus Sync Error (Folders):", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFiles]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      
      {/* 1. SECTION HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-2 bg-blue-600 rounded-[1.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative p-5 bg-zinc-900 border border-white/10 rounded-[1.5rem] shadow-2xl">
              <FolderIcon className="w-8 h-8 text-blue-500 fill-blue-500/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500/80">Nexus Protocol</span>
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Storage Cluster</span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
              Dossiers
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/30 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <ViewToggleButton 
              active={viewMode === 'grid'} 
              onClick={() => setViewMode('grid')}
              icon={<Grid2X2 className="w-4 h-4" />}
            />
            <ViewToggleButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
              icon={<ListIcon className="w-4 h-4" />}
            />
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black hover:bg-blue-600 hover:text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-xl transition-all shadow-xl active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2 stroke-[3px]" /> Init Folder
          </Button>
        </div>
      </header>

      {/* 2. SECTION : HIÉRARCHIE DES DOSSIERS */}
      <section className="space-y-8">
        <SectionHeader title="Archives Structurelles" />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-zinc-900/40 rounded-[2rem] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : folders.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {folders.map((folder) => (
                <FolderCard 
                  key={folder.id} 
                  folder={folder} 
                  onClick={() => router.push(`/folders/${folder.id}`)} 
                />
              ))}
            </motion.div>
          ) : (
            <EmptyFolderState onAction={() => setIsModalOpen(true)} />
          )}
        </AnimatePresence>
      </section>

      {/* 3. SECTION : FRAGMENTS RACINE */}
      <section className="space-y-8 pt-10 border-t border-white/5">
        <SectionHeader title="Fragments Non-Classés" />
        <FileGrid folderId="root" isLoading={isLoading} />
      </section>

      <CreateFolderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchFolders} 
      />
    </div>
  );
}

// --- SOUS-COMPOSANTS UTILITAIRES ---

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-6">
      <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 whitespace-nowrap">{title}</h2>
      <div className="h-px w-full bg-gradient-to-r from-zinc-800 via-zinc-800 to-transparent" />
    </div>
  );
}

function ViewToggleButton({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2.5 rounded-lg transition-all", 
        active ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-zinc-500 hover:text-zinc-200"
      )}
    >
      {icon}
    </button>
  );
}

function FolderCard({ folder, onClick }: { folder: any, onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group"
      onClick={onClick}
    >
      <Card className="p-6 bg-zinc-900/20 border-white/5 group-hover:border-blue-500/40 group-hover:bg-zinc-900/60 transition-all duration-500 rounded-[2.2rem] flex items-center justify-between cursor-pointer overflow-hidden relative">
        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-all">
            <FolderIcon className="w-6 h-6 text-zinc-600 group-hover:text-blue-500 group-hover:fill-blue-500/10 transition-colors" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-tight text-white truncate max-w-[150px]">{folder.name}</h3>
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">
              <span className="text-blue-500/50">#</span> {folder.files_count || 0} fragments
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-zinc-800 group-hover:text-blue-500 group-hover:translate-x-2 transition-all relative z-10" />
      </Card>
    </motion.div>
  );
}

function EmptyFolderState({ onAction }: { onAction: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] bg-zinc-900/5"
    >
      <div className="p-8 rounded-full bg-zinc-900/50 mb-6">
        <FolderPlus className="w-12 h-12 text-zinc-800" />
      </div>
      <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">Structure vide</p>
      <Button variant="ghost" onClick={onAction} className="mt-6 text-blue-500 font-black uppercase text-[9px] tracking-widest hover:bg-blue-500/10">
        Générer un point de montage
      </Button>
    </motion.div>
  );
}