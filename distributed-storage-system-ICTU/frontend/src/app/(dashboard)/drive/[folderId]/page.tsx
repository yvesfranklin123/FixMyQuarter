'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Plus, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { FileGrid } from '@/components/drive/file-grid';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/use-app-store'; 
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function FolderDetailPage() {
  const { folderId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // Accès au store Nexus
  const { fetchFiles, _hasHydrated } = useAppStore(); 
  
  const [folder, setFolder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * --- 1. INITIALISATION DU SECTEUR ---
   */
  const initSecteur = useCallback(async () => {
    if (!folderId || !_hasHydrated) return; 
    
    try {
      setIsLoading(true);
      const [folderRes] = await Promise.all([
        api.get(`/folders/${folderId}`),
        fetchFiles(folderId as string) 
      ]);
      setFolder(folderRes.data);
    } catch (err: any) {
      console.error("Nexus Sync Error:", err);
      toast({
        variant: "destructive",
        title: "ALERTE SYNC",
        description: "Secteur introuvable dans le cluster."
      });
      router.push('/folders');
    } finally {
      setIsLoading(false);
    }
  }, [folderId, fetchFiles, _hasHydrated, router, toast]);

  useEffect(() => {
    initSecteur();
  }, [initSecteur]);

  /**
   * --- 2. LOGIQUE DE SUPPRESSION DU DOSSIER ---
   */
  const handleDeleteFolder = async () => {
    if (!confirm("Voulez-vous vraiment désintégrer ce secteur ? Les fragments seront déplacés vers la racine.")) return;

    try {
      setIsDeleting(true);
      await api.delete(`/folders/${folderId}`);
      
      toast({
        title: "SECTEUR DÉSINTÉGRÉ",
        description: "Le dossier a été supprimé du cluster avec succès.",
      });

      router.push('/folders');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "ERREUR CRITIQUE",
        description: "Impossible de supprimer le secteur.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * --- 3. LOGIQUE D'INJECTION (UPLOAD) ---
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file); 
    formData.append('folder_id', folderId as string);

    setIsUploading(true);
    try {
      await api.post('/drive/upload', formData);
      toast({
        title: "FRAGMENT INJECTÉ",
        description: `${file.name} synchronisé avec succès.`
      });
      await fetchFiles(folderId as string); 
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "ÉCHEC TRANSFERT",
        description: "Protocole d'injection interrompu."
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/folders')}
            className="rounded-2xl w-12 h-12 bg-zinc-900/50 border border-white/5 hover:bg-blue-600 hover:text-white transition-all shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="space-y-1">
            <nav className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
              <span className="hover:text-blue-500 cursor-pointer transition-colors" onClick={() => router.push('/folders')}>Cluster</span>
              <ChevronRight className="w-3 h-3 opacity-30" />
              <span className="text-blue-500/80">Secteur Actif</span>
            </nav>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
              {isLoading ? (
                <div className="h-10 w-48 bg-zinc-900 animate-pulse rounded-xl" />
              ) : (
                folder?.name || "Secteur"
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ✅ BOUTON SUPPRIMER LE DOSSIER */}
          <Button 
            variant="ghost"
            disabled={isDeleting || isLoading}
            onClick={handleDeleteFolder}
            className="rounded-2xl h-12 px-5 bg-zinc-900/50 border border-white/5 text-zinc-500 hover:bg-rose-600/10 hover:text-rose-500 transition-all active:scale-95"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>

          <Button 
            disabled={isUploading || isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2 stroke-[3px]" />}
            {isUploading ? "Injection..." : "Injecter Fragment"}
          </Button>
        </div>
      </header>

      {!isLoading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardStat label="Fragments" value={folder?.files_count || "0"} color="text-blue-500" />
          <CardStat label="Sécurité" value="Niveau 4" color="text-emerald-500" />
          <CardStat label="Nœud" value="Nexus-Main" color="text-purple-500" />
        </motion.div>
      )}

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 whitespace-nowrap">Flux de données</h2>
          <div className="h-px w-full bg-gradient-to-r from-zinc-800 to-transparent" />
        </div>
        <FileGrid folderId={folderId as string} isLoading={isLoading} />
      </motion.section>
    </div>
  );
}

function CardStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-[2.2rem] relative overflow-hidden group">
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 rounded-full transition-all group-hover:opacity-20", color.replace('text', 'bg'))} />
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">{label}</p>
      <p className={cn("text-xl font-black italic uppercase tracking-tight", color)}>{value}</p>
    </div>
  );
}