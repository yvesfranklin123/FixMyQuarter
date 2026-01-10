'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FileObj, FolderObj, FileType } from '@/types/file';
import { api } from '@/lib/api';

// Type Union pour simplifier la manipulation des fichiers et dossiers
type DriveItem = FileObj | FolderObj;

// --- TYPES ---
interface User {
  id: string;
  email: string;
  full_name: string;
  is_superuser: boolean;
  used_storage: number; 
  storage_limit: number;
}

interface AppState {
  // UI State
  isSidebarOpen: boolean;
  viewMode: 'grid' | 'list';
  _hasHydrated: boolean; 
  setHasHydrated: (state: boolean) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;

  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  updateStorage: (used: number) => void;
  logout: () => void;

  // Data State
  files: DriveItem[];
  fetchFiles: (folderId?: string) => Promise<void>;
  setFiles: (files: DriveItem[]) => void;
  addFile: (file: DriveItem) => void;
  updateFile: (id: string, updates: Partial<DriveItem>) => void;
  removeFile: (id: string) => void; 
}

// --- STORE ---

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI Initial State
      isSidebarOpen: true,
      viewMode: 'grid',
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setViewMode: (mode) => set({ viewMode: mode }),

      // Auth Logic
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      updateStorage: (used) => set((state) => ({
        user: state.user ? { ...state.user, used_storage: used } : null
      })),
      logout: () => {
        set({ user: null, isAuthenticated: false, files: [] });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      },

      // Data Logic (Nexus Sync)
      files: [],

      fetchFiles: async (folderId) => {
        try {
          const endpoint = folderId && folderId !== 'root' 
            ? `/folders/${folderId}` 
            : '/drive/files';
          
          const response = await api.get(endpoint);
          const data = response.data;

          let newFiles: DriveItem[] = [];
          
          // Extraction sécurisée selon la structure de réponse du backend
          if (data && data.files) {
            newFiles = data.files as DriveItem[];
          } else if (Array.isArray(data)) {
            newFiles = data as DriveItem[];
          }

          set({ files: newFiles });
          console.log(`[Store] Nexus Sync : ${newFiles.length} fragments synchronisés.`);
        } catch (error) {
          console.error("[Store] Échec de synchronisation Nexus :", error);
          throw error;
        }
      },
      
      setFiles: (files) => set({ files: files as DriveItem[] }),

      addFile: (newFile) => set((state) => {
        const exists = state.files.some(f => f.id === newFile.id);
        if (exists) return state;
        // On cast explicitement le nouveau tableau pour satisfaire TS
        return { files: [newFile, ...state.files] as DriveItem[] };
      }),

      updateFile: (id, updates) => set((state) => ({
        files: state.files.map((f) => 
          f.id === id ? ({ ...f, ...updates } as DriveItem) : f
        )
      })),

      removeFile: (id) => set((state) => ({ 
        files: state.files.filter((f) => f.id !== id) 
      })),
    }),
    {
      name: 'nexus-app-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ 
        viewMode: state.viewMode, 
        isSidebarOpen: state.isSidebarOpen,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);