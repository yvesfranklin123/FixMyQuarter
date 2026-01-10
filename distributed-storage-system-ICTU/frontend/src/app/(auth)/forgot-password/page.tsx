'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LifeBuoy, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <Card className="bg-white/5 backdrop-blur-3xl border-white/10 rounded-[3rem] shadow-2xl">
      <CardContent className="p-10 space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-4 bg-amber-500/10 rounded-2xl mb-2">
            <LifeBuoy className="w-8 h-8 text-amber-500 animate-spin-slow" />
          </div>
          <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Récupération</h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Envoyez une demande de réinitialisation</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email de secours</label>
            <Input type="email" placeholder="john@nexus.cloud" className="bg-white/5 border-white/5 h-12 rounded-2xl" />
          </div>
          <Button className="w-full h-14 rounded-2xl bg-white text-black hover:bg-gray-200 font-black uppercase tracking-[0.2em]">
            Envoyer les instructions
          </Button>
        </div>

        <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Retourner à l'accueil
        </Link>
      </CardContent>
    </Card>
  );
}