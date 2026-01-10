'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { useAppStore } from '@/store/use-app-store';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setUser, user, logout } = useAppStore();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('nexus_token');

      // 1. Si aucun jeton n'est détecté, on redirige immédiatement au terminal
      if (!token) {
        logout();
        window.location.href = '/login';
        return;
      }

      try {
        const response = await api.get('/users/me');
        setUser(response.data);
        setIsInitializing(false);
      } catch (error) {
        console.error("Nexus Security: Session compromise ou expirée.");
        // 2. Nettoyage total en cas d'échec pour stopper les boucles 401
        logout();
        localStorage.clear();
        Cookies.remove('nexus_token');
        window.location.href = '/login?expired=true';
      }
    };

    if (!user) {
      fetchUser();
    } else {
      setIsInitializing(false);
    }
  }, [setUser, user, logout]);

  // Écran de verrouillage pendant la vérification du maillage
  if (isInitializing) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin relative z-10" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 animate-pulse">
          Initialisation du Maillage...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Barre latérale fixe */}
      <AppSidebar />

      {/* Zone de contenu principale */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TopBar avec identité synchronisée */}
        <TopBar />

        {/* Contenu applicatif (Drive, Settings, Admin, etc.) */}
        <main className="flex-1 overflow-y-auto bg-[#050505] p-4 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}