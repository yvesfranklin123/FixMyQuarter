'use client';

import { useState } from 'react';
import { ShieldAlert, Terminal, Eye, ShieldCheck, Activity, Search, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SecurityPage() {
  const [isScanning, setIsScanning] = useState(false);

  const logs = [
    { time: '14:22:01', event: 'Tentative brute force bloquée', ip: '192.168.1.45', level: 'CRITICAL', node: 'NX-01' },
    { time: '14:20:15', event: 'Nouveau certificat SSL généré', ip: 'System', level: 'INFO', node: 'NX-Global' },
    { time: '14:18:32', event: 'Accès Admin: Kemadjou Nexus', ip: '10.0.0.1', level: 'SUCCESS', node: 'NX-Core' },
    { time: '14:15:09', event: 'Scan de vulnérabilité hebdomadaire', ip: '127.0.0.1', level: 'INFO', node: 'Scanner_A' },
    { time: '14:02:44', event: 'Alerte : Modification fichier config', ip: '88.12.33.21', level: 'WARNING', node: 'NX-03' },
  ];

  const triggerScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-600 bg-red-600/10 border-red-600/20';
      case 'WARNING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'SUCCESS': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* 1. HEADER : STATUS PERIMETRIQUE */}
      <div className="p-10 bg-zinc-900/40 border border-white/5 rounded-[3rem] relative overflow-hidden group">
        {/* Grille de fond animée pour l'effet radar */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className={cn(
                "absolute inset-0 bg-red-600/20 blur-2xl rounded-full transition-all duration-1000",
                isScanning ? "scale-150 opacity-100" : "scale-100 opacity-50"
              )} />
              <div className="relative p-5 bg-black border border-red-600/30 rounded-[1.8rem] flex items-center justify-center">
                {isScanning ? (
                  <Activity className="w-10 h-10 text-red-600 animate-pulse" />
                ) : (
                  <ShieldAlert className="w-10 h-10 text-red-600 animate-bounce" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">Périmètre Nexus</h2>
                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-500 uppercase tracking-widest">Actif</div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-2">Zéro intrusion détectée • Cluster intègre</p>
            </div>
          </div>

          <button 
            onClick={triggerScan}
            disabled={isScanning}
            className={cn(
              "relative px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all overflow-hidden group",
              isScanning ? "bg-zinc-800 text-zinc-500" : "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
            )}
          >
            <span className="relative z-10 flex items-center gap-3">
              {isScanning ? <Search className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              {isScanning ? "Analyse en cours..." : "Lancer Scan Viral"}
            </span>
            {isScanning && (
              <motion.div 
                className="absolute inset-0 bg-red-600/20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            )}
          </button>
        </div>
      </div>

      {/* 2. STATS DE SÉCURITÉ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Attaques Bloquées', value: '4,281', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'IPs en Blacklist', value: '142', icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Certificats Actifs', value: '12/12', icon: Activity, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-zinc-900/20 border border-white/5 rounded-3xl flex items-center gap-5">
            <div className={cn("p-3 bg-white/5 rounded-xl", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black italic text-white tracking-tighter uppercase">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* 3. TERMINAL DE LOGS */}
      <div className="bg-black rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="px-8 py-5 bg-zinc-900/30 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-amber-500/50" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>
            <div className="w-px h-4 bg-white/10 mx-2" />
            <Terminal className="w-4 h-4 text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Live Audit Stream</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-700">KERNEL_V.1.0.4</span>
        </div>

        <div className="p-6 font-mono text-[11px] space-y-1">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-12 items-center gap-4 p-3 hover:bg-white/[0.02] rounded-xl transition-colors group border border-transparent hover:border-white/5"
              >
                <div className="col-span-2 text-zinc-600 flex items-center gap-2">
                   <span className="opacity-0 group-hover:opacity-100 text-red-600 transition-opacity">{">"}</span>
                   [{log.time}]
                </div>
                <div className="col-span-2">
                   <span className={cn(
                     "px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tighter",
                     getLevelStyle(log.level)
                   )}>
                     {log.level}
                   </span>
                </div>
                <div className="col-span-5 text-zinc-300 font-bold tracking-tight">
                  {log.event}
                </div>
                <div className="col-span-2 text-zinc-600 text-right">
                  {log.ip}
                </div>
                <div className="col-span-1 text-zinc-800 font-black text-right text-[9px]">
                  {log.node}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Ligne de commande factice */}
          <div className="flex items-center gap-3 p-3 mt-4 text-red-600/50">
            <span className="animate-pulse">_</span>
            <span className="text-[9px] font-black uppercase tracking-widest italic">Nexus_Terminal active... Awaiting command</span>
          </div>
        </div>
      </div>
    </div>
  );
}