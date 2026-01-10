'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileObj, FolderObj, FileType } from '@/types/file';
import { FileActions } from './file-actions';
// On utilise l'import nommé. Vérifie bien que ShareModal est exporté avec "export function ShareModal"
import { ShareModal } from '@/components/drive/share-modal'; 
import { 
  Folder, FileText, ImageIcon, Video, 
  FileCode, FileArchive, Music, Clock, 
  ChevronRight, HardDrive, Share2 
} from 'lucide-react';
import { formatBytes, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function FileRow({ item, index }: { item: FileObj | FolderObj; index?: number }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const isFolder = item.type === FileType.FOLDER;
  const router = useRouter();

  const handleOpen = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('.action-trigger')) return;

    if (isFolder) {
      router.push(`/drive/${item.id}`);
    } else {
      router.push(`/preview/${item.id}`);
    }
  };

  const getFileConfig = () => {
    if (isFolder) return { 
      icon: <Folder className="w-4 h-4 fill-blue-500 text-blue-600" />, 
      color: "text-blue-600",
      bg: "bg-blue-500/10"
    };
    
    const mime = (item as FileObj).mime_type || '';
    if (mime.includes('image')) return { icon: <ImageIcon className="w-4 h-4 text-purple-500" />, color: "text-purple-600", bg: "bg-purple-500/10" };
    if (mime.includes('video')) return { icon: <Video className="w-4 h-4 text-pink-500" />, color: "text-pink-600", bg: "bg-pink-500/10" };
    if (mime.includes('javascript') || mime.includes('python')) return { icon: <FileCode className="w-4 h-4 text-emerald-500" />, color: "text-emerald-600", bg: "bg-emerald-500/10" };
    if (mime.includes('zip')) return { icon: <FileArchive className="w-4 h-4 text-orange-500" />, color: "text-orange-600", bg: "bg-orange-500/10" };
    
    return { icon: <FileText className="w-4 h-4 text-zinc-400" />, color: "text-zinc-600", bg: "bg-zinc-500/10" };
  };

  const config = getFileConfig();

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: (index ?? 0) * 0.03 }}
        onClick={handleOpen}
        className={cn(
          "group flex items-center gap-4 px-4 py-3 sm:px-6 cursor-pointer transition-all duration-200",
          "bg-transparent hover:bg-white/[0.03]",
          "border-b border-white/5 last:border-0"
        )}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-300 group-hover:scale-110 shrink-0",
            config.bg
          )}>
            {config.icon}
          </div>
          
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white truncate group-hover:text-blue-400 transition-colors">
                {item.name}
              </span>
              
              {(item.is_shared || (item as any).shares?.length > 0) && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  <Share2 className="w-2.5 h-2.5 text-blue-500" />
                  <span className="text-[7px] font-black uppercase text-blue-500 tracking-tighter">Shared</span>
                </div>
              )}
              
              {isFolder && <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-blue-500" />}
            </div>
            
            <span className="text-[10px] sm:hidden text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
               {isFolder ? 'Secteur' : formatBytes(item.size)}
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 w-48">
          <Clock className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
            {new Date(item.updated_at).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 w-32">
          <HardDrive className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            {isFolder ? '--' : formatBytes(item.size)}
          </span>
        </div>

        <div className="flex items-center gap-2 action-trigger relative z-30">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <FileActions 
              item={item} 
              onShare={() => setIsShareModalOpen(true)}
            />
          </div>
        </div>
      </motion.div>

      {/* ✅ RENDU CONDITIONNEL SÉCURISÉ POUR ÉVITER LE CRASH */}
      <AnimatePresence mode="wait">
        {isShareModalOpen && typeof ShareModal !== 'undefined' && (
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