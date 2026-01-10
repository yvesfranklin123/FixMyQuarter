'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Database, ShieldCheck, Zap, Globe, ArrowRight, MousePointer2, Layers } from 'lucide-react';
import Link from 'next/link';

// Animation variants pour le rythme
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-blue-600/10 font-sans">
      
      {/* BACKGROUND ARCHITECTURE */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08),transparent_70%)]" />
      </div>

      {/* NAV PAROXYSMIQUE */}
      <nav className="relative z-50 h-28 px-8 lg:px-20 flex items-center justify-between border-b border-gray-200/50 backdrop-blur-xl bg-white/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Database className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter uppercase tracking-[-0.05em]">
            NEXUS<span className="text-blue-600">_</span>CORE
          </span>
        </div>
        
        <div className="flex items-center gap-10">
          <Link href="/login" className="hidden md:block text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground hover:text-blue-600 transition-colors">
            Accès Réseau
          </Link>
          <Link href="/register">
            <Button className="rounded-2xl px-8 h-12 bg-gray-900 text-white hover:bg-blue-600 transition-all font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-black/10">
              Déployer un Node
            </Button>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 pt-24 pb-20 px-6 lg:px-10 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-6 py-2 bg-white border border-gray-200 rounded-full mb-10 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-600">Protocol v3.0 Enabled</span>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-[clamp(3.5rem,12vw,9rem)] font-black italic tracking-tighter uppercase leading-[0.8] mb-6 text-gray-900"
          >
            Data <br /> 
            <span className="text-blue-600 underline decoration-gray-200 underline-offset-[10px]">Sovereignty.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl font-medium leading-relaxed mb-12"
          >
            L'infrastructure de stockage distribuée la plus rapide au monde. 
            Fragmentée, chiffrée, et dispersée sur un maillage global impénétrable.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-20 px-14 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] gap-4 group shadow-2xl shadow-blue-500/30">
              Initialiser le coffre <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="h-20 px-14 rounded-[2rem] border-gray-200 bg-white/50 backdrop-blur-md text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50">
              Livre Blanc
            </Button>
          </motion.div>
        </motion.div>
      </main>

      {/* FEATURE BENTO GRID */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              icon: ShieldCheck, 
              title: "Zero Knowledge", 
              desc: "Seule votre clé privée peut reconstituer les fragments de données.",
              bg: "bg-blue-50"
            },
            { 
              icon: Zap, 
              title: "Performance Ionique", 
              desc: "Streaming parallèle via 12 nodes simultanés pour une latence nulle.",
              bg: "bg-gray-50"
            },
            { 
              icon: Layers, 
              title: "Maillage Global", 
              desc: "Redondance multi-continentale assurant une disponibilité de 99.99%.",
              bg: "bg-slate-50"
            },
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={cn(
                "p-12 border border-gray-200/50 rounded-[4rem] flex flex-col items-start text-left glass-card transition-all",
                f.bg
              )}
            >
              <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 mb-8">
                <f.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-gray-900">{f.title}</h3>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wide leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DECORATIVE MOUSE TRACE (SVG) */}
      <div className="absolute bottom-10 left-10 opacity-20 hidden lg:block">
        <MousePointer2 className="w-6 h-6 rotate-[15deg]" />
        <div className="ml-8 -mt-2 px-3 py-1 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest rounded-md">
          Admin_Console_Linked
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire simple si cn n'est pas importé
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}