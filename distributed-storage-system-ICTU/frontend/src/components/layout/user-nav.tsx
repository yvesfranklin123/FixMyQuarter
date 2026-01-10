'use client';

import { 
  User, Settings, LogOut, ShieldCheck, 
  Sparkles, Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/use-app-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserNav() {
  const router = useRouter();
  const { user, logout } = useAppStore();

  // Extraction des initiales pour le Fallback (ex: "Kemadjou Nexus" -> "KN")
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "NX";
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative outline-none group flex items-center gap-3 p-1 rounded-full transition-all hover:bg-gray-100/50 dark:hover:bg-white/5">
          <div className="relative">
            {/* Anneau de statut dynamique */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full opacity-70 group-hover:opacity-100 blur-[2px] transition-opacity duration-500" />
            <Avatar className="relative h-10 w-10 border-2 border-white dark:border-[#050505] shadow-2xl transition-transform duration-300 group-hover:scale-95">
              {/* On utilise l'avatar du backend s'il existe */}
              <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black">
                {getInitials(user?.full_name || "Nexus User")}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#050505] shadow-lg" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-72 p-2 rounded-[2rem] bg-white/80 dark:bg-[#050505]/80 backdrop-blur-2xl border-gray-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]" 
        align="end" 
        sideOffset={10}
      >
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                {user?.is_superuser ? 'Accès Root' : 'Compte Vérifié'}
              </p>
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-base font-black leading-none tracking-tight text-gray-900 dark:text-white italic uppercase truncate">
                {user?.full_name || 'Chargement...'}
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-1 truncate">{user?.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5" />

        <DropdownMenuGroup className="p-1 space-y-1">
          <DropdownMenuItem 
            onClick={() => router.push('/settings')}
            className="group rounded-2xl py-3 px-4 flex items-center gap-3 cursor-pointer transition-all focus:bg-blue-600 focus:text-white"
          >
            <div className="p-2 rounded-xl bg-blue-500/10 group-focus:bg-white/20 transition-colors">
              <User className="w-4 h-4 text-blue-500 group-focus:text-white" />
            </div>
            <span className="text-sm font-bold">Mon Profil</span>
            <DropdownMenuShortcut className="opacity-50 tracking-tighter text-[10px]">⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem className="group rounded-2xl py-3 px-4 flex items-center justify-between cursor-pointer transition-all focus:bg-purple-600 focus:text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 group-focus:bg-white/20 transition-colors">
                <Sparkles className="w-4 h-4 text-purple-500 group-focus:text-white" />
              </div>
              <span className="text-sm font-bold">Abonnement</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-purple-500/10 group-focus:bg-white/20 rounded-full">Pro</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5" />

        <DropdownMenuGroup className="p-1 space-y-1">
          <DropdownMenuItem className="group rounded-2xl py-3 px-4 flex items-center gap-3 cursor-pointer transition-all">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 group-hover:bg-blue-500/10 transition-colors">
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
            </div>
            <span className="text-sm font-bold">Paramètres</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="group rounded-2xl py-3 px-4 flex items-center gap-3 cursor-pointer transition-all">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 group-hover:bg-emerald-500/10 transition-colors">
              <Activity className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500" />
            </div>
            <span className="text-sm font-bold">Logs d'activité</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5" />

        <div className="p-1">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="group rounded-2xl py-3 px-4 flex items-center gap-3 text-red-500 font-bold focus:bg-red-500 focus:text-white cursor-pointer transition-all"
          >
            <div className="p-2 rounded-xl bg-red-500/10 group-focus:bg-white/20 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm uppercase tracking-widest">Déconnexion</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}