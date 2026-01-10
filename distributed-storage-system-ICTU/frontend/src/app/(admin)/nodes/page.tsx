'use client';

import { Badge } from '@/components/ui/badge';
import { Cpu, Globe, HardDrive, Wifi, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function NodesPage() {
  // Simulation de données provenant de l'orchestrateur (Docker/K8s)
  const nodes = [
    { id: 'NX-01', location: 'Paris, FR', load: 12, status: 'Online', uptime: '14d 2h', storage: '1.2 TB' },
    { id: 'NX-02', location: 'Tokyo, JP', load: 45, status: 'Online', uptime: '8d 5h', storage: '850 GB' },
    { id: 'NX-03', location: 'New York, US', load: 89, status: 'Warning', uptime: '1d 12h', storage: '2.1 TB' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER : MONITORING GLOBAL */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Infrastructure Live</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
            Clusters de <span className="text-zinc-800">Nœuds</span>
          </h1>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2 ml-1">Distribution mondiale des fragments de données</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
          Sytèmes 100% Opérationnels
        </Badge>
      </div>

      {/* GRILLE DES NŒUDS */}
      <div className="grid gap-6">
        {nodes.map((node, index) => (
          <motion.div 
            key={node.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:bg-zinc-900/60 transition-all duration-500"
          >
            {/* Indicateur de statut latéral */}
            <div className={cn(
              "absolute left-0 top-1/4 w-1 h-1/2 rounded-r-full transition-all",
              node.status === 'Online' ? "bg-emerald-500 shadow-[0_0_15px_#10b981]" : "bg-amber-500 shadow-[0_0_15px_#f59e0b]"
            )} />

            <div className="flex items-center gap-8 flex-1">
              {/* Icône de Nœud */}
              <div className="w-16 h-16 bg-black rounded-[1.5rem] flex items-center justify-center border border-white/10 group-hover:border-red-600/50 transition-colors relative overflow-hidden">
                <Globe className="w-8 h-8 text-zinc-700 group-hover:text-red-600 transition-colors relative z-10" />
                <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-black uppercase tracking-tighter italic text-2xl text-white">{node.id}</h3>
                  <Badge variant="outline" className="text-[8px] border-white/10 text-zinc-500 font-bold uppercase">{node.uptime}</Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-blue-500" /> {node.location}</span>
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                  <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-purple-500" /> {node.storage}</span>
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Latence: 14ms</span>
                </div>
              </div>
            </div>

            {/* Jauge de Charge CPU/RAM */}
            <div className="flex flex-col gap-3 min-w-[250px]">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-2">
                  <Cpu className="w-3 h-3" /> Charge Système
                </span>
                <span className={cn(
                  "text-xs font-mono font-black",
                  node.load > 80 ? "text-red-500" : "text-emerald-500"
                )}>
                  {node.load}%
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${node.load}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    node.load > 80 ? "bg-red-600 shadow-[0_0_10px_#dc2626]" : "bg-emerald-500"
                  )}
                />
              </div>
            </div>

            {/* Actions / Statut */}
            <div className="flex items-center gap-4">
               <button className="p-3 bg-white/5 hover:bg-red-600/10 hover:text-red-600 rounded-xl transition-all text-zinc-600 border border-transparent hover:border-red-600/20">
                  <Activity className="w-5 h-5" />
               </button>
               <Badge className={cn(
                 "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none",
                 node.status === 'Online' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
               )}>
                 {node.status}
               </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}