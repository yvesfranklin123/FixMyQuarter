'use client';

import { useState } from 'react';
import { Users, Send, Loader2, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface ShareModalProps {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

export function ShareModal({ fileId, fileName, onClose }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!email) return;
    setIsSending(true);

    try {
      // 1. Recherche du nœud utilisateur via son email
      const userRes = await api.get(`/users/search?email=${email}`);
      const recipientId = userRes.data.id;

      // 2. Création de la liaison de partage
      await api.post(`/drive/${fileId}/share-with/${recipientId}`);
      
      toast({ 
        title: "SYNCHRONISATION RÉUSSIE", 
        description: `Le fragment est désormais accessible pour ${email}.` 
      });
      onClose();
    } catch (err: any) {
      console.error("Share error:", err);
      toast({ 
        variant: "destructive", 
        title: "ERREUR DE PROTOCOLE", 
        description: err.response?.status === 404 
          ? "Utilisateur introuvable dans le cluster Nexus." 
          : "Échec de la transmission du fragment." 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Overlay avec flou */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Effet de lueur bleue en arrière-plan */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-white leading-tight">Partage Réseau</h2>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[180px]">
                  {fileName}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <div className="relative space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-1">
              Identifiant Cible (Email)
            </label>
            <div className="relative">
              <input 
                autoFocus
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                placeholder="recherche.utilisateur@nexus.com" 
                className="w-full bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-sm text-white placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-blue-500/50 shrink-0 mt-0.5" />
            <p className="text-[9px] font-medium text-zinc-500 leading-relaxed uppercase tracking-wider">
              La transmission de ce fragment créera une liaison de lecture permanente vers le nœud destinataire.
            </p>
          </div>

          <Button 
            onClick={handleShare} 
            disabled={isSending || !email}
            className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 disabled:text-zinc-700 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-600/10"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Initialisation...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Autoriser l'accès
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Optionnel: ajout d'un export default pour éviter les erreurs d'importation
export default ShareModal;