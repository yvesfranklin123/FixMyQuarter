import { api } from '@/lib/api';
import { DriveContentResponse, FileObj, FolderObj } from '@/types';

export const driveService = {
  /**
   * Récupère le contenu d'un dossier
   */
  getFolderContent: async (folderId?: string) => {
    const url = folderId ? `/drive/folders/${folderId}` : '/drive/folders/root';
    return api.get<DriveContentResponse>(url);
  },

  /**
   * Crée un nouveau dossier
   */
  createFolder: async (name: string, parentId?: string | null) => {
    return api.post<FolderObj>('/drive/folders/', { name, parent_id: parentId });
  },

  /**
   * Upload de fichier avec suivi de progression
   * @param onProgress Callback pour mettre à jour le Store Zustand
   */
  uploadFile: async (
    file: File, 
    folderId?: string | null,
    onProgress?: (percentage: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folder_id', folderId);

    return api.post<FileObj>('/drive/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  },

  deleteItem: async (id: string, type: 'file' | 'folder') => {
    const endpoint = type === 'file' ? 'files' : 'folders';
    return api.delete(`/drive/${endpoint}/${id}`);
  },
  
  moveItem: async (id: string, type: 'file' | 'folder', destinationFolderId: string | null) => {
     // endpoint backend à implémenter : /drive/files/{id}/move
     const endpoint = type === 'file' ? 'files' : 'folders';
     return api.patch(`/drive/${endpoint}/${id}/move`, { destination_id: destinationFolderId });
  }
};