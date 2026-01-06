"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { Zap, ShieldCheck, Globe, Cpu, ArrowRight, Lock, Activity } from "lucide-react";

export default function RootPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#050505] text-white overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- CÔTÉ GAUCHE : AUTHENTIFICATION --- */}
      <div className="relative flex flex-col items-center justify-center p-8 z-10 border-r border-white/5">
        {/* Grille de fond technologique */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Glow principal arrière-plan */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-[400px] space-y-8 relative">
          
          {/* LOGO ET TITRE ALIGNÉS */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-10 lg:items-start"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ rotate: 5, scale: 1.05, filter: "brightness(1.2)" }}
                className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer relative group"
              >
                <div className="absolute inset-0 bg-blue-400 blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
                <Cpu className="h-7 w-7 text-white relative z-10" />
              </motion.div>
              
              <h1 className="text-4xl font-black tracking-tighter">
                NEXUS<span className="text-blue-500">GATE</span>
              </h1>
            </div>
            
            <p className="text-slate-500 text-sm font-medium ml-1">Distributed gRPC Cluster Access</p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LoginForm onLogin={() => window.location.href = "/dashboard"} />
            </motion.div>
          </AnimatePresence>

          {/* Liens de navigation secondaire (size="sm" supprimé pour corriger l'erreur) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4 pt-4"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <Link 
                href="/forgot-password" 
                className="hover:text-blue-400 transition-colors flex items-center gap-1 group"
              >
                <Lock className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" /> 
                Forgot security key?
              </Link>
              <Link 
                href="/register" 
                className="text-blue-500 hover:text-blue-400 font-bold transition-colors flex items-center gap-1 group"
              >
                Create account 
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Badge de sécurité gRPC */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 border-t border-white/5"
          >
            <div className="flex items-center gap-2 group cursor-help hover:text-emerald-400 transition-colors">
              <ShieldCheck className="h-3 w-3 text-emerald-500 group-hover:animate-pulse" /> TLS 1.3 Active
            </div>
            <div className="flex items-center gap-2 group cursor-help hover:text-blue-400 transition-colors">
              <Globe className="h-3 w-3 text-blue-500 group-hover:rotate-180 transition-transform duration-1000" /> Multi-region mesh
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CÔTÉ DROIT : VITRINE TECHNOLOGIQUE --- */}
      <div className="hidden lg:flex flex-col justify-center p-20 bg-[#0c0c0c] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.12, 0.08],
            x: [0, 15, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[140px]" 
        />
        <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full" />

        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 space-y-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-[0.2em] uppercase">
            <Activity className="w-4 h-4 text-blue-500 animate-pulse" /> Cluster Health: 100%
          </div>
          
          <div className="space-y-4">
            <h2 className="text-7xl font-black leading-[0.95] tracking-tighter uppercase">
              Orchestrate your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-500">
                Data Nodes.
              </span>
            </h2>
            <p className="text-slate-400 text-xl max-w-lg leading-relaxed font-medium">
              High-performance distributed storage via gRPC. Synchronize, monitor, and scale nodes with near-zero latency infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/10">
            <motion.div whileHover={{ x: 5 }} className="group cursor-default">
              <div className="text-5xl font-black text-white group-hover:text-blue-500 transition-colors flex items-baseline gap-1">
                0.2<span className="text-xl text-slate-500 font-bold">ms</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2 group-hover:text-slate-400 transition-colors">gRPC Latency</p>
            </motion.div>
            <motion.div whileHover={{ x: 5 }} className="group cursor-default">
              <div className="text-5xl font-black text-white group-hover:text-blue-500 transition-colors flex items-baseline gap-1">
                99.9<span className="text-xl text-slate-500 font-bold">%</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2 group-hover:text-slate-400 transition-colors">Node Uptime</p>
            </motion.div>
          </div>
          
          <div className="flex gap-2 items-center">
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="h-[2px] w-12 bg-blue-500/10 rounded-full overflow-hidden relative"
              >
                <motion.div 
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "linear" }}
                  className="absolute inset-0 h-full w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                />
              </motion.div>
            ))}
            <span className="ml-4 text-[9px] font-black text-slate-700 uppercase tracking-widest">Live Data Stream</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}