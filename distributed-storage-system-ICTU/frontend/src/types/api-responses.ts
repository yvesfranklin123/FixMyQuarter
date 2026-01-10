import { User } from './user';
import { FileObj, FolderObj } from './file';

// --- AUTHENTIFICATION ---

export interface LoginResponse {
  access_token: string;
  token_type: string; // "bearer"
  expires_in?: number;
  refresh_token?: string;
}

// --- GÉNÉRIQUES ---

/**
 * Structure de pagination standard
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// --- ADMIN DASHBOARD ---

export interface NodeStats {
  id: string;
  hostname: string;
  ip_address: string;
  is_online: boolean;
  cpu_usage: number;
  ram_usage: number;
  disk_total: number;
  disk_used: number;
  last_heartbeat: string;
}

export interface AdminDashboardStats {
  total_users: number;
  active_users_24h: number;
  total_storage_used: number;
  total_files: number;
  nodes: NodeStats[];
}

// --- DRIVE ---

export interface DriveContentResponse {
  folders: FolderObj[];
  files: FileObj[];
  breadcrumbs: { id: string; name: string }[];
}