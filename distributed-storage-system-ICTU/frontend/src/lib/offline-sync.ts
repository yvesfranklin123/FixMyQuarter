import Dexie, { Table } from 'dexie';

export interface OfflineFile {
  id: string; // UUID du fichier
  name: string;
  blob: Blob; // Le contenu du fichier
  mimeType: string;
  folderId: string | null;
  createdAt: number;
  syncStatus: 'synced' | 'pending_upload' | 'pending_delete';
}

class NexusDatabase extends Dexie {
  files!: Table<OfflineFile>;

  constructor() {
    super('NexusCloudDB');
    this.version(1).stores({
      files: 'id, folderId, syncStatus, createdAt' // Index pour recherche rapide
    });
  }
}

export const db = new NexusDatabase();

// Helpers
export const offlineService = {
  saveFile: async (file: OfflineFile) => {
    return db.files.put(file);
  },
  
  getFilesByFolder: async (folderId: string | null) => {
    return db.files.where('folderId').equals(folderId || 'root').toArray();
  },
  
  getPendingUploads: async () => {
    return db.files.where('syncStatus').equals('pending_upload').toArray();
  }
};