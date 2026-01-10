'use client';

import { 
  Download, Share2, Trash2, Edit3, 
  MoreVertical, Loader2, Link as LinkIcon, 
  Info, Copy, Users 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { FileObj, FolderObj } from '@/types/file';
import { useToast } from "@/hooks/use-toast";
import { api } from '@/lib/api';
import { useAppStore } from '@/store/use-app-store';
import { useState } from 'react';

interface FileActionsProps {
  item: FileObj | FolderObj;
  trigger?: React.ReactNode;
  onShare?: () => void; // ✅ Prop pour déclencher la Modal de partage utilisateur
}

export function FileActions({ item, trigger, onShare }: FileActionsProps) {
  const isFolder = item.type === 'folder';
  const { toast } = useToast();
  const { setFiles, files } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. COPIER LE LIEN (Partage externe rapide)
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/preview/${item.id}`;
    navigator.clipboard.writeText(link);
    toast({ 
      title: "LIAISON ÉTABLIE", 
      description: "Le lien de preview a été copié dans le presse-papier." 
    });
  };

  // 2. DUPLIQUER / CLONER
  const handleClone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      const res = await api.post(`/drive/files/${item.id}/copy`, {
        target_folder_id: (item as FileObj).folder_id || null
      });
      setFiles([res.data, ...files]);
      toast({ 
        title: "SECTEUR CLONÉ", 
        description: `Une copie de ${item.name} a été injectée dans le maillage.` 
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "ERREUR DE RÉPLICATION", 
        description: "Échec du clonage binaire." 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. SUPPRIMER (Désintégration)
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Voulez-vous désintégrer ce ${isFolder ? 'dossier' : 'fragment'} ?`)) return;
    
    setIsProcessing(true);
    try {
      const endpoint = isFolder ? `/drive/folders/${item.id}` : `/drive/files/${item.id}`;
      await api.delete(endpoint);
      setFiles(files.filter(f => f.id !== item.id));
      toast({ title: "DÉSINTÉGRATION RÉUSSIE", description: "Élément placé en quarantaine." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "ACTION REFUSÉE", description: "Erreur de protocole système." });
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. EXTRAIRE (Téléchargement)
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) return;
    try {
      const response = await api.get(`/drive/${item.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ variant: "destructive", title: "ERREUR FLUX", description: "Échec de l'extraction binaire." });
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger || (
          <button 
            disabled={isProcessing}
            className="p-2 hover:bg-white/10 rounded-xl transition-all outline-none disabled:opacity-50 group"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            ) : (
              <MoreVertical className="w-4 h-4 text-zinc-500 group-hover:text-blue-500" />
            )}
          </button>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 rounded-[1.8rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-950/90 backdrop-blur-2xl border-white/10 text-white border-dashed"
      >
        <DropdownMenuLabel className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center justify-between">
          Secteur Actions <Info className="w-3 h-3" />
        </DropdownMenuLabel>

        <DropdownMenuGroup className="p-1">
          {/* ✅ NOUVEAU : Partage Réseau (Ouvre la Modal) */}
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); onShare?.(); }} 
            className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-blue-600 transition-colors"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-xs uppercase tracking-widest">Partager au réseau</span>
          </DropdownMenuItem>

          {/* ✅ TOUJOURS DISPONIBLE : Copier le lien */}
          <DropdownMenuItem onClick={handleCopyLink} className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-blue-600 transition-colors">
            <LinkIcon className="w-4 h-4 opacity-70" />
            <span className="font-bold text-xs uppercase tracking-widest">Copier le lien</span>
          </DropdownMenuItem>

          {!isFolder && (
            <DropdownMenuItem onClick={handleClone} className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-blue-600 transition-colors">
              <Copy className="w-4 h-4 opacity-70 text-blue-400" />
              <span className="font-bold text-xs uppercase tracking-widest">Dupliquer</span>
              <DropdownMenuShortcut className="text-[9px] opacity-30">⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-blue-600 transition-colors">
            <Edit3 className="w-4 h-4 opacity-70" />
            <span className="font-bold text-xs uppercase tracking-widest">Renommer</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2 bg-white/5 mx-2" />

        <DropdownMenuGroup className="p-1">
          {!isFolder && (
            <DropdownMenuItem onClick={handleDownload} className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-emerald-600 transition-colors">
              <Download className="w-4 h-4 text-emerald-500 group-focus:text-white" />
              <span className="font-bold text-xs uppercase tracking-widest">Extraire</span>
              <DropdownMenuShortcut className="text-[9px] opacity-30">⌘D</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-rose-600 text-rose-500 focus:text-white transition-colors" 
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-widest">Désintégrer</span>
            <DropdownMenuShortcut className="text-[9px] opacity-30">⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}