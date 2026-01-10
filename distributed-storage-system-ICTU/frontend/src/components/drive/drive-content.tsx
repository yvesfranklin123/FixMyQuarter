'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Loader2 } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { FileGrid } from '@/components/drive/file-grid';
import { SortControls } from '@/components/drive/sort-controls';
import { FolderBreadcrumb } from '@/components/drive/folder-breadcrumb';
import { DropZone } from '@/components/uploader/drop-zone';

// Logic & Store
import { useAppStore } from '@/store/use-app-store';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DriveContentProps {
  folderId: string;
}

export function DriveContent({ folderId }: DriveContentProps) {
  const { setFiles } = useAppStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. RÉCUPÉRATION DES DONNÉES
  const fetchFolderData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Aligné sur ton routeur Backend : /drive/files ou /folders/{id}
      const endpoint = folderId === 'root' ? '/drive/files' : `/folders/${folderId}`;
      const response = await api.get(endpoint);

      setFiles(response.data.files || []);
      setBreadcrumbs(response.data.breadcrumbs || []);
    } catch (error) {
      console.error("Nexus Sync Error:", error);
      toast({
        variant: "destructive",
        title: "Secteur injoignable",
        description: "Impossible de synchroniser les fragments de données.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [folderId, setFiles, toast]);

  useEffect(() => {
    fetchFolderData();
  }, [fetchFolderData]);

  // 2. LOGIQUE D'INJECTION (UPLOAD)
  const handleUpload = async (uploadFiles: File[]) => {
    if (uploadFiles.length === 0) return;

    const formData = new FormData();
    
    // ✅ ENVOI D'UN SEUL FICHIER (Pour matcher ton backend actuel)
    // Si tu veux en envoyer plusieurs, il faut que le backend utilise List[UploadFile]
    formData.append('file', uploadFiles[0]); 

    if (folderId && folderId !== 'root') {
      formData.append('folder_id', folderId);
    }

    try {
      toast({ title: "Injection Nexus..." });

      // ✅ IMPORTANT : On ne met PAS de headers manuels. 
      // Axios s'occupe de tout avec FormData.
      await api.post('/drive/upload', formData);
      
      await fetchFolderData();
      toast({ title: "Succès", description: "Fragment stabilisé." });
    } catch (error: any) {
      console.error("Détails de l'erreur:", error.response?.data);
      toast({ 
        variant: "destructive", 
        title: "Échec 422", 
        description: "Le champ 'file' est mal interprété par le serveur." 
      });
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 p-6 min-h-screen bg-black text-white">
      
      {/* INPUT CACHÉ POUR LE BOUTON CLASSIQUE */}
      <input 
        type="file"
        id="file-upload-input"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={(e) => e.target.files && handleUpload(Array.from(e.target.files))}
      />

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <FolderBreadcrumb items={breadcrumbs} />
        <SortControls />
      </div>

      {/* HERO SECTION - ONYX DESIGN */}
      <section className="relative overflow-hidden bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-500/20 group">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
              {folderId === 'root' ? 'Nexus Drive' : 'Explorateur'}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">
              Secteur : {folderId === 'root' ? 'Main_Terminal' : `ID_${folderId.slice(0, 8)}`}
            </p>
          </div>
          
          <Button 
            className="bg-white text-blue-600 hover:bg-zinc-100 rounded-2xl font-black uppercase tracking-widest px-8 h-14 shadow-xl transition-all active:scale-95"
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <Plus className="w-5 h-5 mr-2" /> Nouveau fragment
          </Button>
        </div>
      </section>

      {/* ZONE DE DÉPÔT (DROPZONE) */}
      <DropZone onFilesDrop={handleUpload} />

      {/* SECTEUR DES FICHIERS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between ml-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
              Fragments de données
            </h2>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
          </div>
        </div>
        
        <FileGrid folderId={folderId} isLoading={isLoading} />
      </div>
    </div>
  );
}