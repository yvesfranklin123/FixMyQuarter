'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TwoFactorPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  return (
    <Card className="bg-white/5 backdrop-blur-3xl border-white/10 rounded-[3rem] shadow-2xl">
      <CardContent className="p-10 space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Vérification 2FA</h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Entrez le code envoyé sur votre appareil</p>
        </div>

        <div className="flex justify-center gap-3">
          {otp.map((_, i) => (
            <motion.input
              key={i}
              whileFocus={{ scale: 1.1 }}
              type="text"
              maxLength={1}
              className="w-12 h-16 bg-white/5 border-2 border-white/10 rounded-2xl text-center text-xl font-black text-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          ))}
        </div>

        <div className="space-y-4">
          <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20">
            Valider l'identité
          </Button>
          
          <button className="flex items-center justify-center gap-2 w-full text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
            <RefreshCw className="w-3 h-3" /> Renvoyer un nouveau code
          </button>
        </div>
      </CardContent>
    </Card>
  );
}