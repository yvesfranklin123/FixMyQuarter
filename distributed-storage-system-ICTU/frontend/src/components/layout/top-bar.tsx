'use client';

import { cn } from '@/lib/utils'; 
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, User, LogOut, Shield, Settings, ShieldCheck, Loader2, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/use-app-store';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';

export function TopBar() {
  const { user, setFiles, logout } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // --- LOGIQUE DE RECHERCHE ---
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await api.get(`/search/files?query=${searchQuery}`);
          setFiles(res.data);
        } catch (err) {
          console.error("Nexus Search Error:", err);
        } finally {
          setIsSearching(false);
        }
      } else if (searchQuery.length === 0 && pathname === '/dashboard') {
        try {
           const res = await api.get('/drive/files');
           setFiles(res.data.files);
        } catch (e) { /* Géré par l'intercepteur API */ }
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, setFiles, pathname]);

  // --- LOGIQUE DE DÉCONNEXION (ARRANGÉE) ---
  const handleLogout = () => {
    // 1. Nettoyer le store Zustand
    logout();
    
    // 2. Nettoyer physiquement le localStorage pour arrêter l'intercepteur API
    localStorage.clear();
    
    // 3. Redirection "Hard" vers la route correcte
    // Puisque votre page est dans (auth)/login, l'URL est bien '/login'
    window.location.replace('/login');
  };

  return (
    <header className="h-20 border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-40 px-8 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* BARRE DE RECHERCHE */}
      <div className="relative w-full max-w-md group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
          )}
        </div>
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher dans le cluster Nexus..." 
          className="pl-12 bg-zinc-900/30 border-white/5 text-white rounded-2xl h-11 text-[11px] font-black uppercase tracking-widest focus-visible:ring-blue-500/20 placeholder:text-zinc-700 transition-all border-dashed focus:border-solid"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* NOTIFICATIONS */}
        <button className="relative p-2.5 text-zinc-500 hover:text-white transition-all group">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
        </button>

        <div className="h-8 w-px bg-white/10 mx-2" />

        {/* MENU UTILISATEUR */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-4 outline-none group text-left">
            <div className="hidden lg:block text-right">
              <p className="text-[11px] font-black text-white leading-none uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                {user?.full_name || 'Anonyme'}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <p className={cn(
                  "text-[8px] font-black uppercase tracking-[0.2em]",
                  user?.is_superuser ? "text-blue-500" : "text-zinc-500"
                )}>
                  {user?.is_superuser ? 'Root Authority' : 'Node Member'}
                </p>
                <Shield className={cn("w-2.5 h-2.5", user?.is_superuser ? "text-blue-500" : "text-zinc-700")} />
              </div>
            </div>

            <div className="relative">
                <div className="relative w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-blue-500/50 transition-all">
                    <User className="w-5 h-5 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,1)]" />
                </div>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-64 bg-zinc-950/90 backdrop-blur-xl border-white/10 rounded-[1.8rem] p-2 mt-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <DropdownMenuLabel className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center justify-between">
              Secteur Identité <Zap className="w-3 h-3 text-blue-500" />
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-white/5 mx-2" />
            
            <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center rounded-xl font-black text-[10px] uppercase tracking-[0.15em] py-3.5 cursor-pointer text-zinc-400 focus:bg-blue-600 focus:text-white gap-3 transition-all">
                    <Settings className="w-4 h-4 opacity-70" /> Profil Réseau
                </Link>
            </DropdownMenuItem>

            {user?.is_superuser && (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex items-center rounded-xl font-black text-[10px] uppercase tracking-[0.15em] py-3.5 cursor-pointer text-blue-500 focus:bg-blue-600 focus:text-white gap-3">
                  <ShieldCheck className="w-4 h-4" /> Panneau Superuser
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-white/5 mx-2" />
            
            {/* UTILISATION DE onSelect POUR ÉVITER LES BUGS RADIX */}
            <DropdownMenuItem 
              onSelect={handleLogout} 
              className="rounded-xl font-black text-[10px] uppercase tracking-[0.15em] py-3.5 cursor-pointer text-rose-500 focus:bg-rose-500 focus:text-white gap-3"
            >
              <LogOut className="w-4 h-4" /> Déconnexion Terminal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}