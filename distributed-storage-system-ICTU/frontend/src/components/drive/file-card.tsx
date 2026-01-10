'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Folder, FileText, ImageIcon, Video, 
  FileCode, FileArchive, Music, ExternalLink, Share2 
} from 'lucide-react';

import { FileObj, FolderObj, FileType } from '@/types/file';
import { FileActions } from './file-actions';
import { ShareModal } from './share-modal'; // ✅ Import relatif direct (plus sûr)
import { formatBytes, cn } from '@/lib/utils';

export function FileCard({ item }: { item: FileObj | FolderObj }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const isFolder = item.type === FileType.FOLDER;
  const router = useRouter();

  const handleOpen = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.action-trigger')) return;
    
    if (isFolder) {
      router.push(`/drive/${item.id}`);
    } else {
      router.push(`/preview/${item.id}`);
    }
  };

  const getFileStyle = () => {
    if (isFolder) return { 
      icon: <Folder className="w-10 h-10 fill-blue-500 text-blue-600" />, 
      color: "bg-blue-500/10",
      border: "group-hover:border-blue-500/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]" 
    };
    
    const mime = (item as FileObj).mime_type || '';
    const config = {
      image: { icon: <ImageIcon className="w-10 h-10 text-purple-500" />, color: "bg-purple-500/10", border: "group-hover:border-purple-500/50" },
      video: { icon: <Video className="w-10 h-10 text-pink-500" />, color: "bg-pink-500/10", border: "group-hover:border-pink-500/50" },
      audio: { icon: <Music className="w-10 h-10 text-amber-500" />, color: "bg-amber-500/10", border: "group-hover:border-amber-500/50" },
      archive: { icon: <FileArchive className="w-10 h-10 text-orange-500" />, color: "bg-orange-500/10", border: "group-hover:border-orange-500/50" },
      code: { icon: <FileCode className="w-10 h-10 text-emerald-500" />, color: "bg-emerald-500/10", border: "group-hover:border-emerald-500/50" },
      default: { icon: <FileText className="w-10 h-10 text-zinc-400" />, color: "bg-zinc-500/10", border: "group-hover:border-zinc-500/50" }
    };

    if (mime.includes('image')) return config.image;
    if (mime.includes('video')) return config.video;
    if (mime.includes('audio')) return config.audio;
    if (mime.includes('zip') || mime.includes('rar')) return config.archive;
    if (mime.includes('javascript') || mime.includes('python') || mime.includes('json') || mime.includes('html')) return config.code;

    return config.default;
  };

  const style = getFileStyle();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        onClick={handleOpen}
        className={cn(
          "group relative cursor-pointer overflow-hidden",
          "bg-zinc-900/20 dark:bg-black/20 backdrop-blur-md",
          "border border-white/5 rounded-[2.2rem]",
          "p-6 transition-all duration-500 hover:bg-zinc-900/40",
          style.border,
          style.glow
        )}
      >
        {/* ✅ INDICATEUR DE PARTAGE */}
        {(item.is_shared || (item as any).shares?.length > 0) && (
          <div className="absolute top-6 left-24 z-10 flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-md animate-in fade-in zoom-in duration-500">
            <Share2 className="w-2.5 h-2.5 text-blue-500" />
            <span className="text-[7px] font-black uppercase tracking-widest text-blue-500">Node Shared</span>
          </div>
        )}

        <div className={cn(
          "absolute -right-10 -top-10 w-32 h-32 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full",
          style.color.replace('/10', '')
        )} />

        <div className="flex items-start justify-between mb-8">
          <div className={cn("p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner", style.color)}>
            {style.icon}
          </div>
          <div className="action-trigger relative z-30">
            <FileActions item={item} onShare={() => setIsShareModalOpen(true)} />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-black tracking-tight text-white truncate group-hover:text-blue-400 transition-colors">
            {item.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
              {isFolder ? 'Secteur' : formatBytes(item.size)}
            </span>
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
              {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </span>
          </div>
        </div>

        <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <ExternalLink className="w-4 h-4 text-blue-500/50" />
        </div>
      </motion.div>

      {/* ✅ RENDU CONDITIONNEL SÉCURISÉ */}
      <AnimatePresence>
        {isShareModalOpen && ShareModal && (
          <ShareModal 
            fileId={item.id} 
            fileName={item.name} 
            onClose={() => setIsShareModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}