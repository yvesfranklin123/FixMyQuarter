'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, Download, Share2, Loader2, FileText, AlertCircle, Edit3, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { FileObj } from '@/types/file';
import { useToast } from '@/hooks/use-toast';

export default function PreviewPage() {
  const { fileId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [file, setFile] = useState<FileObj | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- 1. SYNCHRONISATION DU FLUX ---
  const loadFileData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Récupération des métadonnées
      const response = await api.get(`/drive/${fileId}`);
      setFile(response.data);

      // Récupération du flux binaire complet (Blob) via Axios pour inclure le JWT
      const stream = await api.get(`/drive/${fileId}/download`, { 
        responseType: 'blob' 
      });

      // Transformation du binaire en URL locale pour le navigateur
      const url = window.URL.createObjectURL(new Blob([stream.data]));
      setPreviewUrl(url);
    } catch (err: any) {
      console.error("Nexus Sync Error:", err);
      setError("Accès refusé ou flux corrompu");
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    loadFileData();
    return () => { if (previewUrl) window.URL.revokeObjectURL(previewUrl); };
  }, [loadFileData]);

  // --- 2. ACTIONS RÉSEAU ---
  const handleDownload = () => {
    if (!previewUrl || !file) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.setAttribute('download', file.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast({ title: "Nexus Download", description: "Fragment extrait avec succès." });
  };

  const handleShare = () => {
    // Copie l'URL actuelle (qui est le lien de partage)
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Lien Copié", description: "Prêt pour distribution réseau." });
  };

  const handleEdit = async () => {
    const newName = prompt("Renommer le fragment :", file?.name);
    if (!newName || newName === file?.name) return;
    try {
      await api.patch(`/drive/${fileId}`, { name: newName });
      setFile(prev => prev ? { ...prev, name: newName } : null);
      toast({ title: "Mise à jour", description: "Nom réécrit sur le cluster." });
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Échec de réécriture." });
    }
  };

  if (isLoading) return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic animate-pulse">
        Synchronisation Nexus...
      </span>
    </div>
  );

  if (error || !file) return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-10">
      <AlertCircle className="w-16 h-16 text-red-500/20 mb-4" />
      <h2 className="text-xl font-black uppercase italic text-white tracking-tighter">{error}</h2>
      <Button onClick={() => router.back()} className="mt-6 bg-zinc-900 border border-white/5 rounded-xl px-8 uppercase font-black text-[10px]">
        Quitter le secteur
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col text-white font-sans">
      {/* HEADER ONYX DESIGN */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 backdrop-blur-xl z-50 bg-black/40">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90">
            <X className="text-white w-6 h-6" />
          </button>
          <div className="flex flex-col border-l border-white/10 pl-6">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Nexus Viewer</span>
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-sm font-bold truncate max-w-md italic opacity-80">{file.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleShare} variant="ghost" size="icon" className="hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button onClick={handleDownload} variant="ghost" size="icon" className="hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 font-black uppercase text-[10px] h-10 transition-transform active:scale-95 shadow-lg shadow-blue-600/20">
            <Edit3 className="w-4 h-4 mr-2" /> Editer
          </Button>
        </div>
      </header>

      {/* ZONE DE VISUALISATION */}
      <main className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black opacity-100" />
        
        <motion.div 
          initial={{ scale: 0.99, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-5xl h-full flex items-center justify-center relative"
        >
          <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-950/40 shadow-2xl flex items-center justify-center">
            
            {/* RENDU SELON LE TYPE DE DONNÉES */}
            {file.mime_type?.includes('image') ? (
              <img src={previewUrl!} alt="Preview" className="max-w-full max-h-full object-contain p-4 shadow-2xl transition-transform hover:scale-[1.01]" />
            ) : file.mime_type === 'application/pdf' ? (
              <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full border-none invert-[0.05] opacity-90" title="PDF Viewer" />
            ) : (
              <div className="flex flex-col items-center gap-8 p-12 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                  <FileText className="relative w-24 h-24 text-zinc-800" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm italic">Format non supporté</h3>
                  <p className="text-zinc-600 text-[9px] uppercase tracking-[0.3em] leading-relaxed max-w-xs mx-auto">
                      Fragment .{file.extension} prêt pour extraction ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
                <Button onClick={handleDownload} className="bg-white text-black hover:bg-zinc-200 rounded-2xl px-10 font-black uppercase text-[10px] h-14 transition-all hover:px-12">
                  Extraire le fragment
                </Button>
              </div>
            )}
            
          </div>
        </motion.div>
      </main>
    </div>
  );
}