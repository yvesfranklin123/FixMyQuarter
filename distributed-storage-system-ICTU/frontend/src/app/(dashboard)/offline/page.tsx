'use client';

import { WifiOff, ShieldCheck, HardDriveDownload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FileGrid } from '@/components/drive/file-grid';

export default function OfflinePage() {
  return (
    <div className="space-y-10">
      <div className="p-10 bg-gradient-to-br from-gray-900 to-black rounded-[3rem] border border-white/5 relative overflow-hidden">
        {/* Glow de fond */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <WifiOff className="w-6 h-6 text-emerald-500" />
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase font-black tracking-widest text-[9px]">
                Mode Local Actif
              </Badge>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">Disponibilité <br /> <span className="text-emerald-500">Hors-ligne</span></h1>
            <p className="text-sm text-gray-400 font-medium max-w-sm">
              Ces fichiers sont chiffrés et stockés physiquement sur ce terminal pour un accès instantané sans connexion.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex flex-col items-center gap-3">
            <HardDriveDownload className="w-10 h-10 text-emerald-500" />
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Espace Local Utilisé</p>
              <p className="text-2xl font-black italic text-white">12.4 GB</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
         <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Fichiers synchronisés</h2>
         <FileGrid filter="offline" />
      </div>
    </div>
  );
}