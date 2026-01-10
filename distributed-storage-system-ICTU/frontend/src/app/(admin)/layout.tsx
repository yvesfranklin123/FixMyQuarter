'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Terminal, Lock, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store'; // Importe ton store pour vérifier le user

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAppStore();

  // --- SÉCURITÉ : VÉRIFICATION DU RÔLE SUPERUSER ---
  // On utilise un useEffect pour éviter les erreurs de redirection pendant le rendu
  useEffect(() => {
    // Si tu as déjà branché ton auth, décommente la ligne ci-dessous :
    // if (!user?.is_superuser) router.push('/drive');
    
    // Pour tes tests actuels, on laisse passer
    const isSuperUser = true; 
    if (!isSuperUser) router.push('/drive');
  }, [user, router]);

  return (
    <div className="flex h-screen bg-[#020202] text-gray-100 overflow-hidden">
      {/* 1. SIDEBAR (VARIANTE ADMIN ROUGE) */}
      <AppSidebar variant="admin" />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* 2. SCANNER DE SÉCURITÉ ANIMÉ (Ligne rouge haut de page) */}
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_15px_rgba(220,38,38,0.8)] z-50"
        />
        
        {/* 3. HEADER DE CONTRÔLE (ONYX DESIGN) */}
        <header className="h-20 border-b border-white/5 bg-black/60 backdrop-blur-xl px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="relative">
                <div className="absolute inset-0 bg-red-600/20 blur-lg rounded-full animate-pulse" />
                <div className="relative w-11 h-11 bg-red-600/10 border border-red-600/30 rounded-2xl flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-red-600" />
                </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-red-600">Root Access</h2>
                <span className="text-[8px] px-1.5 py-0.5 bg-red-600/10 border border-red-600/20 text-red-500 rounded font-bold italic">Level_01</span>
              </div>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Noyau de contrôle Nexus • Node_01</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-white/5 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <div className="h-3 w-[1px] bg-white/10" />
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-red-600" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-400">Session Sécurisée</span>
              </div>
            </div>
          </div>
        </header>

        {/* 4. ZONE DE CONTENU DYNAMIQUE */}
        <section className="flex-1 overflow-y-auto custom-scrollbar relative">
          {/* Overlay de grille de données (subtil) */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
          
          <div className="p-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </section>

      </main>
    </div>
  );
}