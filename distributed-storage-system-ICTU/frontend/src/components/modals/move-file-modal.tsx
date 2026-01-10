'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore, ModalType } from '@/store/use-modal-store';

// Import de toutes les modales de paroxysme
import { CreateFolderModal } from '@/components/modals/create-folder-modal';
import { ShareFileModal } from '@/components/modals/share-file-modal';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import { MoveFileModal } from '@/components/modals/move-file-modal';

/**
 * Registre des Modales
 * Associe chaque type à son composant correspondant pour une clarté maximale
 */
const MODAL_COMPONENTS: Record<ModalType, React.ComponentType<any>> = {
  createFolder: CreateFolderModal,
  shareFile: ShareFileModal,
  deleteConfirm: DeleteConfirmModal,
  moveFile: MoveFileModal,
};

export function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, type, data, onClose } = useModalStore();

  // 1. Protection contre les erreurs d'hydratation (SSR)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Verrouillage du scroll du body pour une UX "OS Natif"
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isMounted) return null;

  // Récupération dynamique du composant
  const ActiveModal = type ? MODAL_COMPONENTS[type] : null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && ActiveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* OVERLAY GLOBAL : L'effet de profondeur paroxysmique */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-950/40 dark:bg-black/60 backdrop-blur-md transition-all"
          />

          {/* CONTENEUR DE LA MODALE : Gère l'animation d'entrée/sortie */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3 
            }}
            className="relative z-[101] w-full flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto w-full flex justify-center">
              <ActiveModal 
                data={data} 
                onClose={onClose}
                // Props spécifiques extraites de data si nécessaire
                itemName={data?.item?.name || data?.file?.name}
              />
            </div>
          </motion.div>

          {/* EFFET DÉCORATIF : Glow lumineux qui suit la modale */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.2)_0%,transparent_50%)]"
          />
        </div>
      )}
    </AnimatePresence>
  );
}