'use client';

import { useAppStore } from '@/store/use-app-store';
import { User, Mail, Shield, ShieldCheck, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto space-y-10 p-6">
      <header className="space-y-2">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
          Profil <span className="text-blue-600">Réseau</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
          Identité numérique Nexus sécurisée
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CARTE D'IDENTITÉ */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[3rem] space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase">{user?.full_name}</h2>
                <p className="text-blue-500 font-bold text-xs uppercase tracking-widest">Opérateur de données</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email
                </span>
                <p className="font-bold text-white">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Statut
                </span>
                <p className="font-bold text-emerald-500 uppercase italic">Certifié</p>
              </div>
            </div>
          </div>
        </div>

        {/* STATUT DU NODE */}
        <div className="bg-blue-600 rounded-[3rem] p-8 text-white space-y-6 shadow-2xl shadow-blue-500/20">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
            <HardDrive className="w-4 h-4" /> Stockage Node
          </h3>
          <div className="space-y-2">
             <p className="text-4xl font-black italic tracking-tighter">
               {user?.storage_percent || 0}%
             </p>
             <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-white" 
                 style={{ width: `${user?.storage_percent || 0}%` }}
               />
             </div>
             <p className="text-[9px] font-bold uppercase opacity-60">Synchronisation P2P stable</p>
          </div>
        </div>
      </div>
    </div>
  );
}