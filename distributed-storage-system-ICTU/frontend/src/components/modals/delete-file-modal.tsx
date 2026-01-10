"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const DeleteFileModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "deleteFile";
  const { fileId, fileName } = data;

  const onConfirm = async () => {
    try {
      setIsLoading(true);
      
      // Simulation de l'appel API vers Nexus Core
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log(`Fichier ${fileId} supprimé`);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent">
        <div className="bg-white dark:bg-[#0A0A0A] p-8 space-y-6">
          
          {/* ICONE D'ALERTE ANIMÉE */}
          <div className="flex justify-center">
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"
              />
              <div className="relative w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <div className="absolute -top-1 -right-1 bg-red-500 p-1.5 rounded-full border-4 border-white dark:border-[#0A0A0A]">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">
              Suppression <span className="text-red-500 text-shadow-glow">Critique</span>
            </DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Confirmation du protocole de destruction
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer <br />
              <span className="text-gray-900 dark:text-white font-black italic">"{fileName}"</span> ? 
              <br />Cette action déplacera le fichier vers la corbeille.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              disabled={isLoading}
              onClick={onClose}
              variant="outline"
              className="flex-1 h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px]"
            >
              Annuler
            </Button>
            <Button
              disabled={isLoading}
              onClick={onConfirm}
              className="flex-1 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirmer la destruction"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};