'use client';

import { Star, LayoutGrid } from 'lucide-react';
import { FileRow } from '@/components/drive/file-row';

export default function StarredPage() {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-amber-500/10 rounded-[1.5rem] border border-amber-500/20">
          <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Favoris</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Accès rapide aux éléments critiques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Simulation de fichiers favoris */}
        {[1, 2, 3].map((i) => (
          <FileRow key={i} index={i} item={{ id: `${i}`, name: `Important_Doc_0${i}.pdf`, starred: true, type: 'file' }} />
        ))}
      </div>
    </div>
  );
}