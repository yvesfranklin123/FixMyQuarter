'use client';

import { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  MoreHorizontal, 
  ShieldCheck, 
  ShieldAlert, 
  Ban, 
  Trash2, 
  HardDrive,
  Mail,
  Zap,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/utils';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/');
        setUsers(res.data);
      } catch (err) {
        console.error("Critical Error: Unable to scan user directory", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-red-600" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Scan du répertoire en cours...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* 1. HEADER & RECHERCHE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
            Directory <span className="text-zinc-800">Users</span>
          </h1>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-2 ml-1">Gestion des accès et privilèges réseau</p>
        </div>

        <div className="relative group w-full lg:w-[400px]">
          <div className="absolute inset-0 bg-red-600/5 blur-xl group-hover:bg-red-600/10 transition-all opacity-0 group-focus-within:opacity-100" />
          <div className="relative flex items-center bg-zinc-900/40 border border-white/5 rounded-2xl px-5 focus-within:border-red-600/50 transition-all">
            <Search className="w-4 h-4 text-zinc-700" />
            <input 
              type="text" 
              placeholder="RECHERCHER UN IDENTIFIANT..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none p-4 text-[11px] font-bold text-white placeholder:text-zinc-800 outline-none uppercase tracking-widest"
            />
          </div>
        </div>
      </div>

      {/* 2. TABLE DES UTILISATEURS (LISTE ONYX) */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
        <div className="grid grid-cols-12 px-8 py-6 border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 bg-white/[0.01]">
          <div className="col-span-4">Identité Utilisateur</div>
          <div className="col-span-3">Privilèges</div>
          <div className="col-span-3">Allocation Data</div>
          <div className="col-span-2 text-right">Contrôle</div>
        </div>

        <div className="divide-y divide-white/[0.02]">
          <AnimatePresence>
            {filteredUsers.map((user, i) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 items-center px-8 py-5 hover:bg-white/[0.02] transition-colors group"
              >
                {/* COL 1: IDENTITY */}
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-red-600/30 transition-colors">
                    <UsersIcon className="w-4 h-4 text-zinc-600 group-hover:text-red-600 transition-colors" />
                    {user.is_active && (
                      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-black text-white uppercase tracking-tighter truncate group-hover:text-red-500 transition-colors">
                      {user.full_name || 'Utilisateur Anonyme'}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-600 flex items-center gap-1.5 uppercase tracking-widest">
                      <Mail className="w-2.5 h-2.5" /> {user.email}
                    </span>
                  </div>
                </div>

                {/* COL 2: PRIVILEGES */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    {user.is_superuser ? (
                      <Badge className="bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg text-[8px] font-black tracking-widest uppercase">
                        <ShieldAlert className="w-3 h-3 mr-1" /> Root Admin
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-lg text-[8px] font-black tracking-widest uppercase">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Standard User
                      </Badge>
                    )}
                  </div>
                </div>

                {/* COL 3: STORAGE */}
                <div className="col-span-3">
                  <div className="space-y-1.5 pr-8">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-600">
                      <span>{formatBytes(user.storage_used || 0)} / 10 GB</span>
                      <span className="text-zinc-400">12%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>
                </div>

                {/* COL 4: ACTIONS */}
                <div className="col-span-2 flex justify-end gap-3">
                  <button className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl transition-all text-zinc-600 hover:text-white group/btn">
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    title="Bannir l'utilisateur"
                    className="p-2.5 bg-zinc-900 hover:bg-red-600/10 border border-white/5 hover:border-red-600/30 rounded-xl transition-all text-zinc-600 hover:text-red-600"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2.5 bg-zinc-900 hover:bg-red-600 border border-white/5 rounded-xl transition-all text-zinc-600 hover:text-white shadow-xl">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}