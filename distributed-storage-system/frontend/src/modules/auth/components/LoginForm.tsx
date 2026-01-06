"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button"; // Import de buttonVariants
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Utilitaire pour fusionner les classes

interface Props {
  onLogin: () => void;
}

export function LoginForm({ onLogin }: Props) {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 transition duration-1000"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-[#0c0c0c]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600/10 border border-blue-500/20 mb-4"
          >
            <ShieldCheck className="w-8 h-8 text-blue-500" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Nexus <span className="text-blue-500">Access</span></h1>
          <p className="text-neutral-500 text-sm mt-2 font-medium">Secure Node Management Console</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  type="email" 
                  placeholder="admin@nexus.io" 
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Key Phrase</label>
                {/* CORRECTION : On utilise className pour le style au lieu de size */}
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Recover Access
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••••••" 
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 group transition-all"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Authorize Session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-neutral-500 text-sm">
            New operator?{" "}
            <Link href="/register" className="text-white font-bold hover:text-blue-400 transition-colors">
              Apply for Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}