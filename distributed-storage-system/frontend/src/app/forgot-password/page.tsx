"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  KeyRound, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  ShieldAlert 
} from "lucide-react";
import { AnimatedBg } from "@/components/ui/animated-bg";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Simulation d'appel API gRPC/Gateway
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast({
        title: "Instructions Sent",
        description: "Check your administrative inbox for the recovery link.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "Could not verify admin email. Please contact system root.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#0f172a] overflow-hidden font-sans">
      <AnimatedBg />
      
      {/* Effet de Halo Bleu */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative z-10 w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl text-center space-y-8"
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="request-form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="inline-flex p-4 bg-blue-500/10 rounded-3xl text-blue-500 mb-2 ring-1 ring-blue-500/20">
                <KeyRound size={32} />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">
                  Recovery <span className="text-blue-500">Mode</span>
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter your verified administrator email to receive a temporary gRPC access token.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                    Admin Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@nexus-storage.io" 
                      className="pl-11 bg-white/5 border-white/10 h-14 rounded-2xl text-white focus:border-blue-500/50 transition-all placeholder:text-slate-700" 
                    />
                  </div>
                </div>

                <Button 
                  disabled={isLoading}
                  className="w-full h-14 bg-white text-black hover:bg-blue-500 hover:text-white transition-all font-black rounded-2xl shadow-xl active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Request Reset Token"
                  )}
                </Button>
              </form>

              <Link 
                href="/" 
                className="inline-flex items-center text-sm text-slate-500 hover:text-white transition-colors group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
                Back to Login
              </Link>
            </motion.div>
          ) : (
            /* Vue de succès après soumission */
            <motion.div
              key="success-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-6 space-y-6"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-emerald-500/20 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Token Dispatched</h2>
                <p className="text-slate-400 text-sm">
                  A secure recovery link has been sent to <br />
                  <span className="text-blue-400 font-mono">{email}</span>
                </p>
              </div>
              <div className="pt-6">
                <Link href="/">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5">
                    Return to Terminal
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Note de sécurité en bas */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
          <ShieldAlert size={12} className="text-rose-500/50" />
          Single-use tokens expire in 15 minutes
        </div>
      </motion.div>
    </div>
  );
}