'use client';

import { useEffect, useState } from 'react';
import { Share2, ShieldCheck, ArrowUpRight, Zap, Network, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { FileGrid } from '@/components/drive/file-grid';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/use-app-store';
import { Card } from '@/components/ui/card';

export default function SharedPage() {
  const { setFiles } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        setIsLoading(true);
        // Appel de la route backend optimisée avec joinedload(owner)
        const res = await api.get('/drive/files/shared');
        setFiles(res.data.files);
      } catch (err) {
        console.error("Nexus Network Sync Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSharedContent();
  }, [setFiles]);

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto min-h-screen bg-black">
      {/* 1. HEADER : IDENTITÉ RÉSEAU */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-blue-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative p-5 bg-zinc-950 border border-white/10 rounded-[1.8rem] shadow-2xl">
              <Share2 className="w-9 h-9 text-blue-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Nexus Network</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 italic">Incoming Stream</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
              Partagés <span className="text-zinc-800">avec moi</span>
            </h1>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
            <Card className="px-6 py-3 bg-zinc-900/30 border-white/5 rounded-2xl flex items-center gap-4 border-dashed">
                <Network className="w-4 h-4 text-blue-500" />
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase">Status</span>
                    <span className="text-sm font-black text-white">Liaison Active</span>
                </div>
            </Card>
            <Card className="px-6 py-3 bg-zinc-900/30 border-white/5 rounded-2xl flex items-center gap-4 border-dashed">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase">Protocole</span>
                    <span className="text-sm font-black text-white">Sécurisé</span>
                </div>
            </Card>
        </div>
      </div>

      {/* 2. BARRE D'ÉTAT SYSTÈME */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-600/5 border border-blue-500/10 p-4 rounded-[1.5rem] flex items-center gap-4 border-dashed"
      >
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Zap className="w-4 h-4 text-blue-500" />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Tous les fragments ci-dessous ont été synchronisés depuis d'autres secteurs du maillage.
        </p>
      </motion.div>

      {/* 3. GRILLE DE RÉCEPTION */}
      <section className="relative">
        <div className="flex items-center gap-3 mb-8">
            <Users className="w-4 h-4 text-zinc-700" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic text-shadow-glow">Dépôt collaboratif</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent ml-4" />
        </div>

        {/* folderId="shared" est le flag pour FileGrid */}
        <FileGrid folderId="shared" isLoading={isLoading} />
      </section>

      {/* 4. ACTIONS DE RÉSEAUTAGE (Si la liste est vide) */}
      {!isLoading && (
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] mb-4 text-center">Aucun nouveau fragment détecté ?</p>
            <button className="flex items-center gap-4 text-[11px] font-black text-white uppercase tracking-widest bg-zinc-900 hover:bg-blue-600 px-8 py-4 rounded-2xl border border-white/10 transition-all duration-500 group shadow-2xl">
                Demander une synchronisation
                <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
      )}
    </div>
  );
}