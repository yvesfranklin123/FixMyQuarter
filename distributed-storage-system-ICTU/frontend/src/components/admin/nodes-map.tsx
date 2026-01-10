'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Server, Globe, Activity, HardDrive, Cpu, Zap } from 'lucide-react';
import { NodeStats } from '@/types/api-responses';
import { cn, formatBytes } from '@/lib/utils';

// Helper pour déterminer la couleur de charge
const getStatusColor = (usage: number) => {
  if (usage > 85) return 'text-red-500 bg-red-500';
  if (usage > 60) return 'text-amber-500 bg-amber-500';
  return 'text-emerald-500 bg-emerald-500';
};

export function NodesMap({ nodes }: { nodes: NodeStats[] }) {
  return (
    <div className="w-full space-y-6">
      {/* Header avec Statut Global */}
      <div className="flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
            <Globe className="w-6 h-6 text-white animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Réseau NexusCore</h3>
            <p className="text-sm text-muted-foreground">
              {nodes.filter(n => n.is_online).length} serveurs actifs sur {nodes.length} localisations
            </p>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          {nodes.map((_, i) => (
            <div key={i} className="h-1.5 w-6 rounded-full bg-emerald-500/20 overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Grid des Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {nodes.map((node, index) => {
          const cpuColor = getStatusColor(node.cpu_usage);
          const ramUsagePercent = (node.ram_usage / 100) * 100; // Si node.ram_usage est déjà en %

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 p-1 shadow-xl transition-all hover:shadow-blue-500/10"
            >
              <div className="p-5 space-y-5">
                {/* Top Section: Identity & Status */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-3 rounded-2xl transition-colors",
                      node.is_online ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-red-50 dark:bg-red-500/10"
                    )}>
                      <Server className={cn(
                        "w-5 h-5",
                        node.is_online ? "text-emerald-500" : "text-red-500"
                      )} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                        {node.hostname}
                      </h4>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{node.ip_address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter",
                      node.is_online ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {node.is_online ? "Online" : "Offline"}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-medium">Latence: 24ms</span>
                  </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                   {/* CPU Section */}
                   <div className="space-y-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-black">{node.cpu_usage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className={cn("h-full", cpuColor.split(' ')[1])}
                          initial={{ width: 0 }}
                          animate={{ width: `${node.cpu_usage}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">Processeur</p>
                   </div>

                   {/* RAM Section */}
                   <div className="space-y-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-black">{node.ram_usage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${node.ram_usage}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">Mémoire RAM</p>
                   </div>
                </div>

                {/* Storage Bar (Full width) */}
                <div className="space-y-2 px-1">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Capacité Disque</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {formatBytes(node.disk_used)} / {formatBytes(node.disk_total)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 border border-gray-200 dark:border-gray-700">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(node.disk_used / node.disk_total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Footer Link / Detail */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] text-muted-foreground font-medium">Uptime: 99.98%</span>
                  </div>
                  <button className="text-[10px] font-bold text-blue-500 hover:underline">
                    LOGS SYSTÈME →
                  </button>
                </div>
              </div>

              {/* Effet décoratif de fond */}
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Server size={120} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}