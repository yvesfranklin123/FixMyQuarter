'use client';

import { useEffect, useState } from 'react';

// Importation des composants réels (assure-toi qu'ils existent)
import { CreateFolderModal } from '@/components/modals/create-folder-modal';
import { ShareFileModal } from '@/components/modals/share-file-modal';
import { DeleteFileModal } from '@/components/modals/delete-file-modal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  // Sécurité anti-hydratation pour Next.js 14/15
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CreateFolderModal />
      <ShareFileModal />
      <DeleteFileModal />
      {/* Ajoute ici tes futures modales comme RenameFileModal, etc. */}
    </>
  );
};