'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Construction de l'URL à partir de la variable d'environnement
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: `${formData.firstName} ${formData.lastName}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Capture des erreurs de validation FastAPI (422) ou erreurs métier
        const errorMsg = data.detail || (data.errors ? "Données invalides" : "Échec de l'enrôlement.");
        throw new Error(errorMsg);
      }

      toast({
        title: "PROTOCOLE RÉUSSI",
        description: "Votre Node Nexus a été initialisé avec succès.",
        variant: "success",
      });

      router.push('/login');

    } catch (error: any) {
      toast({
        title: "ERREUR RÉSEAU",
        description: error.message || "Impossible de joindre le serveur Nexus.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[500px]"
      >
        <Card className="glass-card border-white/50 rounded-[3rem] shadow-2xl shadow-blue-500/5 overflow-hidden">
          <CardContent className="p-10 space-y-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-2 shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                Nexus<span className="text-blue-600">Register</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                Initialisation du certificat de stockage
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Prénom</label>
                    <Input 
                      name="firstName"
                      required
                      placeholder="John" 
                      onChange={handleInputChange}
                      className="bg-white/50 border-gray-100 h-14 rounded-2xl focus-visible:ring-blue-500/20 font-bold transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nom</label>
                    <Input 
                      name="lastName"
                      required
                      placeholder="Doe" 
                      onChange={handleInputChange}
                      className="bg-white/50 border-gray-100 h-14 rounded-2xl focus-visible:ring-blue-500/20 font-bold transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email Identifiant</label>
                  <Input 
                    name="email"
                    type="email" 
                    required
                    placeholder="john@nexus.cloud" 
                    onChange={handleInputChange}
                    className="bg-white/50 border-gray-100 h-14 rounded-2xl focus-visible:ring-blue-500/20 font-bold transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Clé de sécurité</label>
                  <Input 
                    name="password"
                    type="password" 
                    required
                    placeholder="••••••••••••" 
                    onChange={handleInputChange}
                    className="bg-white/50 border-gray-100 h-14 rounded-2xl focus-visible:ring-blue-500/20 font-bold transition-all" 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 group transition-all duration-300 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-3">
                    Initier le compte 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                Déjà enrôlé ? 
                <Link href="/login" className="text-blue-600 font-black hover:underline ml-2 uppercase tracking-widest">
                  Se connecter au réseau
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}