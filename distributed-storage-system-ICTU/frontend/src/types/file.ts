import { UserPublic } from './user';

export enum FileType {
  FILE = 'file',
  FOLDER = 'folder',
}

/**
 * Structure commune pour tout élément du maillage Nexus
 */
export interface BaseItem {
  id: string; // UUID
  name: string;
  owner_id: number;
  folder_id: string | null; // Changé de parent_id à folder_id pour matcher ton Backend
  created_at: string;
  updated_at: string;
  is_trashed: boolean;
  is_starred?: boolean;
  is_shared?: boolean;
}

/**
 * Un secteur de stockage (Folder)
 */
export interface FolderObj extends BaseItem {
  type: FileType.FOLDER; // Littéral strict
  color?: string;
  path?: string;
}

/**
 * Un fragment de donnée (File)
 */
export interface FileObj extends BaseItem {
  type: FileType.FILE; // Littéral strict
  size: number;
  mime_type: string;
  content_hash?: string;
  thumbnail_url?: string;
  owner?: UserPublic;
}

/**
 * Type Union pour les listes du store
 * C'est ce type qui permet à TS de différencier les deux via la propriété 'type'
 */
export type DriveItem = FileObj | FolderObj;

/**
 * Status de transfert
 */
export interface FileUploadStatus {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}