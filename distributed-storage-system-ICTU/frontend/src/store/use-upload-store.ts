import { create } from 'zustand';

export interface UploadItem {
  id: string;      // ID unique temporaire
  file: File;
  progress: number; // 0 à 100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  folderId?: string | null; // Dossier de destination
}

interface UploadState {
  uploads: UploadItem[];
  isExpanded: boolean; // Fenêtre réduite ou agrandie
  
  // Actions
  addUpload: (file: File, folderId?: string | null) => string;
  updateProgress: (id: string, progress: number) => void;
  markCompleted: (id: string) => void;
  markError: (id: string, error: string) => void;
  removeUpload: (id: string) => void;
  toggleExpanded: () => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  uploads: [],
  isExpanded: true,

  addUpload: (file, folderId) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      uploads: [
        ...state.uploads, 
        { 
          id, 
          file, 
          progress: 0, 
          status: 'pending', 
          folderId 
        }
      ],
      isExpanded: true // Ouvre la fenêtre quand un upload commence
    }));
    return id;
  },

  updateProgress: (id, progress) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, progress, status: 'uploading' } : u
      ),
    })),

  markCompleted: (id) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, progress: 100, status: 'completed' } : u
      ),
    })),

  markError: (id, error) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, status: 'error', error } : u
      ),
    })),

  removeUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.id !== id),
    })),

  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  
  clearCompleted: () => set((state) => ({
    uploads: state.uploads.filter(u => u.status !== 'completed')
  })),
}));