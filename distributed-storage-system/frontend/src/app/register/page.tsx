"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  UserPlus, 
  ArrowLeft, 
  Mail, 
  Lock, 
  ShieldCheck,
  User,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { AnimatedBg } from "@/components/ui/animated-bg";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // États du formulaire
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  // Gestion des changements d'input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logique de soumission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulation d'appel API (Remplace par ton appel axios réel)
      // await axios.post("/api/auth/register", formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
      toast({
        title: "Identity Initialized",
        description: "Your administrator account has been created.",
      });

      // Redirection après un court délai pour montrer le succès
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An error occurred during cluster provisioning.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#0f172a] overflow-hidden font-sans">
      <AnimatedBg />
      
      {/* Glow décoratif en arrière-plan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative z-10 w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-8"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="register-form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Bouton Retour */}
              <Link 
                href="/" 
                className="inline-flex items-center text-sm text-slate-500 hover:text-blue-400 transition-colors group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
                Back to login
              </Link>

              {/* Header */}
              <div className="space-y-3">
                <div className="inline-flex p-3 bg-blue-600/20 rounded-2xl border border-blue-500/20 mb-2">
                  <UserPlus className="text-blue-500 h-6 w-6" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                  Join Nexus<span className="text-blue-500">Gate</span>
                </h1>
                <p className="text-slate-400 text-sm font-medium">
                  Initialize your administrative identity for the gRPC cluster.
                </p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe" 
                      className="pl-11 bg-white/5 border-white/10 h-14 rounded-2xl text-white focus:border-blue-500/50 transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Admin Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@nexus.io" 
                      className="pl-11 bg-white/5 border-white/10 h-14 rounded-2xl text-white focus:border-blue-500/50 transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Master Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••" 
                      className="pl-11 bg-white/5 border-white/10 h-14 rounded-2xl text-white focus:border-blue-500/50 transition-all" 
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] group"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Initialize Account
                      <ShieldCheck className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-slate-500 text-xs font-medium border-t border-white/5 pt-6">
                By registering, you agree to the cluster security protocols.
              </p>
            </motion.div>
          ) : (
            /* Vue de succès après inscription */
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-emerald-500/20 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white">Identity Verified</h2>
                <p className="text-slate-400">Redirecting to gRPC access terminal...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}