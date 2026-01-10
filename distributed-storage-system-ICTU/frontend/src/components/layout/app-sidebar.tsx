'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Folder, Share2, Trash2, ShieldCheck, Search,
  Settings, LogOut, Zap, ChevronRight, Database, Bell, LayoutDashboard
} from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import { useAppStore } from '@/store/use-app-store';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAppStore();

  // Stockage : 1 Go par défaut
  const usedStorage = user?.used_storage || 0;
  const totalStorage = user?.storage_limit || 1073741824; 
  const storagePercentage = Math.min(Math.round((usedStorage / totalStorage) * 100), 100);

  // Déconnexion propre
  const handleLogout = () => {
    logout();
    localStorage.clear();
    window.location.href = '/login';
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/drive' },
    { name: 'Dossiers', icon: Folder, href: '/folders' },
    { name: 'Partagés', icon: Share2, href: '/shared' },
    { name: 'Recherche', icon: Search, href: '/search' },
    { name: 'Notifications', icon: Bell, href: '/notifications' },
    { name: 'Corbeille', icon: Trash2, href: '/trash' },
    { 
      name: 'Admin Panel', 
      icon: ShieldCheck, 
      href: '/admin', 
      hide: !user?.is_superuser,
      special: true 
    },
  ];

  return (
    <aside className="w-80 h-screen bg-black border-r border-white/5 flex flex-col p-6 relative z-50">
      
      {/* 1. BRANDING - NEXUS ONYX */}
      <div className="flex items-center gap-4 px-2 mb-10 group cursor-pointer">
        <div className="relative">
          <div className="absolute -inset-2 bg-blue-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-500" />
          <div className="relative w-12 h-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105">
            <Zap className="text-blue-500 w-7 h-7 fill-blue-500/20" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter italic leading-none text-white uppercase">
            Nexus<span className="text-blue-600">Onyx</span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 mt-1">
            Cloud OS v2.0
          </span>
        </div>
      </div>

      {/* 2. NAVIGATION DYNAMIQUE */}
      <nav className="flex-1 space-y-1 relative overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 px-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-800 shrink-0">Main Protocol</p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>
        
        {menuItems.filter(item => !item.hide).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5",
                item.special && "mt-10 bg-blue-600/5 border border-blue-500/10 hover:bg-blue-600/10"
              )}
            >
              <div className="flex items-center gap-4 z-10">
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive ? "text-blue-500 scale-110" : "text-zinc-600 group-hover:text-zinc-400",
                  item.special && "text-blue-400"
                )} />
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                    isActive ? "translate-x-1" : "group-hover:translate-x-1",
                    item.special && "text-blue-400"
                )}>
                  {item.name}
                </span>
              </div>

              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600/[0.03] rounded-2xl border border-blue-500/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]"
                />
              )}
              
              <ChevronRight className={cn(
                "w-3 h-3 transition-all duration-500",
                isActive ? "opacity-100 text-blue-500" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-zinc-800"
              )} />
            </Link>
          );
        })}
      </nav>

      {/* 3. WIDGET DE STOCKAGE NEXUS */}
      <div className="mt-auto pt-6 space-y-6">
        <div className="p-6 bg-zinc-900/20 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className={cn(
              "absolute -bottom-10 -right-10 w-24 h-24 blur-[50px] transition-colors duration-1000",
              storagePercentage > 85 ? "bg-rose-500/20" : "bg-blue-500/10"
          )} />

          <div className="relative z-10 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700">Storage Cluster</span>
                <span className="text-xl font-black italic tracking-tighter text-white">
                  {storagePercentage}%
                </span>
              </div>
              <div className={cn(
                  "p-2 rounded-xl bg-black border border-white/5 shadow-inner",
                  storagePercentage > 85 ? "text-rose-500" : "text-blue-500"
              )}>
                <Database className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-1 w-full bg-black rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${storagePercentage}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className={cn(
                    "h-full rounded-full relative",
                    storagePercentage > 85 ? "bg-rose-600" : "bg-blue-600"
                  )} 
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>
              <div className="flex justify-between text-[7px] font-black text-zinc-700 uppercase tracking-widest">
                <span>{formatBytes(usedStorage)}</span>
                <span className="text-zinc-500">{formatBytes(totalStorage)} Capacity</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FOOTER ACTIONS */}
        <div className="flex items-center justify-between px-2 pb-2">
          <Link 
            href="/settings" 
            className="p-3 text-zinc-700 hover:text-white transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 text-zinc-700 hover:text-rose-500 font-black text-[9px] uppercase tracking-[0.3em] hover:bg-rose-500/5 rounded-xl border border-transparent hover:border-rose-500/10 transition-all group"
          >
            Log Out
            <LogOut className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
}