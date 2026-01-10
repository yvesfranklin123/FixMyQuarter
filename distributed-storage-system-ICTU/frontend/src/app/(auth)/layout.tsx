'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Database } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Grille de fond dynamique */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_70%)]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 1, ease: "anticipate" }}
            className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] mb-6"
          >
            <Database className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">Nexus<span className="text-blue-500">Secure</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-2">Accès au réseau décentralisé</p>
        </div>
        
        {children}
        
        <div className="mt-8 flex items-center justify-center gap-6 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
          <span>Encryption AES-256</span>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <span>Zero Knowledge Architecture</span>
        </div>
      </motion.div>
    </div>
  );
}