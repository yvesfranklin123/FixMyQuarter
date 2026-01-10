'use client';

import { Clock, History } from 'lucide-react';
import { FileRow } from '@/components/drive/file-row';
import { Badge } from '@/components/ui/badge';

export default function RecentPage() {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-blue-500/10 rounded-[1.8rem] border border-blue-500/20">
          <Clock className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Récents</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Derniers accès au flux de données</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* GROUPE : AUJOURD'HUI */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-blue-500/20 text-blue-500">Aujourd'hui</Badge>
            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-3">
             <FileRow index={0} item={{ id: '1', name: 'Contrat_Nexus_v2.pdf', type: 'file', updated_at: '10:42' }} />
             <FileRow index={1} item={{ id: '2', name: 'Rendu_Architecture_3D.zip', type: 'file', updated_at: '09:15' }} />
          </div>
        </div>

        {/* GROUPE : HIER */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="opacity-50">Hier</Badge>
            <div className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
          </div>
          <div className="grid grid-cols-1 gap-3 opacity-70">
             <FileRow index={2} item={{ id: '3', name: 'Database_Backup.sql', type: 'file', updated_at: 'Hier' }} />
          </div>
        </div>
      </div>
    </div>
  );
}