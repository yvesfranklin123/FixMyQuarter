"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store"; // Import crucial
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, Loader2 } from "lucide-react";

export const CreateFolderModal = () => {
  const { isOpen, onClose, type } = useModal(); // Récupération de onClose depuis le store
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");

  const isModalOpen = isOpen && type === "createFolder";

  const handleCreate = async () => {
    setIsSubmitting(true);
    // Simulation API
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    console.log("Dossier créé:", name);
    setIsSubmitting(false);
    setName("");
    onClose(); // Maintenant onClose est bien défini
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[2.5rem] bg-white dark:bg-[#0A0A0A] border-none">
        <DialogHeader>
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4">
            <FolderPlus className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
            Nouveau <span className="text-blue-600">Dossier</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Input
            disabled={isSubmitting}
            placeholder="Nom du dossier (ex: Projets 2026)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded-2xl bg-gray-100/50 dark:bg-white/5 border-none px-6 font-bold"
          />
        </div>

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={handleCreate}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px]"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Générer le dossier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};