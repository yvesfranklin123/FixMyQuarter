'use client';

import { useEffect, useState } from 'react';
import { Trash2, RotateCcw, Loader2, RefreshCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatBytes } from '@/lib/utils';

export default function TrashPage() {
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTrash = async () => {
    try {
      const response = await api.get('/drive/files/trash');
      setTrashedFiles(response.data.files);
    } catch (err) {
      console.error("Erreur Corbeille:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTrash(); }, []);

  // RESTAURER
  const handleRestore = async (fileId: string) => {
    try {
      await api.patch(`/drive/files/${fileId}`, { is_trashed: false });
      setTrashedFiles(prev => prev.filter(f => f.id !== fileId));
      toast({ title: "Fragment restauré" });
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur" });
    }
  };

  // SUPPRESSION DÉFINITIVE (Un seul)
  const handleHardDelete = async (fileId: string) => {
    if (!confirm("Désintégrer ce fragment définitivement ? Cette action est irréversible.")) return;
    try {
      await api.delete(`/drive/files/${fileId}/hard`);
      setTrashedFiles(prev => prev.filter(f => f.id !== fileId));
      toast({ title: "Fragment désintégré", description: "Espace disque libéré." });
    } catch (err) {
      toast({ variant: "destructive", title: "Erreur de suppression" });
    }
  };

  // VIDER TOUTE LA CORBEILLE
  const handleEmptyTrash = async () => {
    if (!confirm("Vider entièrement la corbeille ? Tous les fragments seront perdus.")) return;
    try {
      await api.delete('/drive/trash/empty');
      setTrashedFiles([]);
      toast({ title: "Corbeille vidée", description: "Secteur Nexus nettoyé." });
    } catch (err) {
      toast({ variant: "destructive", title: "Échec du nettoyage" });
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-red-500" /></div>;

  return (
    <div className="space-y-10 p-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-500/10 rounded-[1.8rem] border border-red-500/20">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Corbeille</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 text-emerald-500">Flux de quarantaine</p>
          </div>
        </div>
        
        {trashedFiles.length > 0 && (
          <Button 
            onClick={handleEmptyTrash}
            variant="destructive" 
            className="rounded-xl font-black uppercase text-[10px] px-6 shadow-lg shadow-red-500/20"
          >
            Vider définitivement
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {trashedFiles.length > 0 ? trashedFiles.map((file) => (
          <Card key={file.id} className="p-4 bg-zinc-950/50 border-white/5 flex items-center justify-between group hover:border-red-500/30 transition-all rounded-[1.2rem]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl">
                <Trash2 className="w-5 h-5 text-zinc-500" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-white">{file.name}</h3>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest italic text-red-500/60">
                  {formatBytes(file.size)} • SUPPRESSION IMMINENTE
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => handleRestore(file.id)}
                variant="ghost" size="icon" className="rounded-full hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-500"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => handleHardDelete(file.id)}
                variant="ghost" size="icon" className="rounded-full hover:bg-red-500/10 text-zinc-400 hover:text-red-500"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )) : (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-30">
                <RefreshCcw className="w-10 h-10 text-white mx-auto mb-4" />
                <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Secteur Vide</p>
            </div>
        )}
      </div>
    </div>
  );
}