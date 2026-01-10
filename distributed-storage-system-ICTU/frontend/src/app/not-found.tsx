'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-screen bg-[#020202] flex flex-col items-center justify-center text-center p-6">
      <div className="relative mb-10">
        <h1 className="text-[15rem] font-black italic tracking-tighter text-white/5 leading-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xl font-black uppercase tracking-[0.5em] text-blue-600">Nœud Introuvable</p>
        </div>
      </div>
      <p className="text-muted-foreground max-w-sm mb-10 font-medium">
        Le lien que vous avez suivi est soit corrompu, soit a été déplacé vers un autre cluster.
      </p>
      <Link href="/">
        <Button className="bg-white text-black h-14 px-10 rounded-2xl font-black uppercase tracking-widest">
          Retour au Noyau
        </Button>
      </Link>
    </div>
  );
}