'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Cookies from 'js-cookie'; 
import { useAppStore } from '@/store/use-app-store';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setUser = useAppStore((state) => state.setUser);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Nettoyage préventif
    localStorage.removeItem('token');
    Cookies.remove('nexus_token');

    try {
      const loginData = new URLSearchParams();
      loginData.append('username', formData.email);
      loginData.append('password', formData.password);

      // ✨ CORRECTION DE L'URL : Ajout de /auth/ avant /login
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: loginData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Identifiants réseau incorrects.");
      }

      if (data.access_token) {
        // Sync Cookie pour Middleware
        Cookies.set('nexus_token', data.access_token, { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        // Sync LocalStorage pour Axios
        localStorage.setItem('token', data.access_token);
        
        if (data.user) setUser(data.user);
      }

      toast({
        title: "ACCÈS AUTORISÉ",
        description: "Certificat validé. Connexion au maillage établie.",
      });

      // Redirection vers le cluster
      window.location.href = '/drive';

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "ÉCHEC D'AUTHENTIFICATION",
        description: error.message || "Le Node distant n'a pas répondu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[450px]"
      >
        <Card className="bg-zinc-950 border-white/10 rounded-[3rem] shadow-2xl shadow-blue-500/5 overflow-hidden">
          <CardContent className="p-10 space-y-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-2 shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">
                Nexus<span className="text-blue-600">Login</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                Vérification du certificat d'accès
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">
                    Identifiant Réseau
                  </label>
                  <Input 
                    name="email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nom@nexus.cloud" 
                    className="bg-white/5 border-white/10 h-14 rounded-2xl focus-visible:ring-blue-500/20 font-bold text-white placeholder:text-zinc-700 outline-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">
                    Code d'accès
                  </label>
                  <Input 
                    name="password"
                    required
                    type="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••" 
                    className="bg-white/5 border-white/10 h-14 rounded-2xl focus-visible:ring-blue-500/20 font-bold text-white placeholder:text-zinc-700 outline-none" 
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 group transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-3">
                    Autoriser la session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                Nouveau sur le réseau ? 
                <Link href="/register" className="text-blue-600 font-black hover:underline ml-2 uppercase tracking-widest transition-all">
                  S'enrôler
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}