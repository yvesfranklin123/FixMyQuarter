"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const AnimatedBg = () => {
  const [mounted, setMounted] = useState(false);

  // useEffect ne s'exécute que sur le client après le premier rendu
  useEffect(() => {
    setMounted(true);
  }, []);

  // Si on est encore sur le serveur, on affiche un fond vide
  if (!mounted) {
    return <div className="fixed inset-0 bg-[#0f172a] z-0" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0f172a]">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/10 rounded-full blur-3xl"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%" 
          }}
          animate={{ 
            y: ["-10%", "110%"], 
            opacity: [0, 0.3, 0] 
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          style={{ width: '150px', height: '150px' }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-slate-900/50" />
    </div>
  );
};