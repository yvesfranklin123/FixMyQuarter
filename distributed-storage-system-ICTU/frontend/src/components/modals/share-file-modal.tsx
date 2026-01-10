"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Copy, Check, Share2, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const ShareFileModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [copied, setCopied] = useState(false);
  const isModalOpen = isOpen && type === "shareFile";
  const { fileName } = data;

  const shareUrl = `${window.location.origin}/share/${data.fileId}`;

  const onCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Optionnel : toast({ title: "Lien copié !" });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 border-none bg-white dark:bg-[#0A0A0A] rounded-[2.5rem]">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-2">
            <Share2 className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
            Partager <span className="text-blue-600 font-black">Nexus</span>
          </DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Configuration des droits d'accès
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Lien de transfert</label>
            <div className="flex items-center gap-x-2">
              <Input 
                readOnly 
                value={shareUrl}
                className="bg-gray-100/50 dark:bg-white/5 border-none h-12 rounded-xl text-xs font-mono"
              />
              <Button onClick={onCopy} size="icon" className="h-12 w-12 rounded-xl bg-blue-600 shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tight">Accès Public</p>
                  <p className="text-[9px] text-muted-foreground">Toute personne avec le lien peut voir</p>
                </div>
             </div>
             <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase text-blue-500">Modifier</Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full h-12 rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest text-[10px]">
            Terminer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};