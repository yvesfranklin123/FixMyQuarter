/**
 * Représente un utilisateur connecté dans le système NexusCloud.
 */
export interface User {
  id: number;
  email: string;
  full_name: string;
  
  // Rôles et Permissions
  is_active: boolean;
  is_superuser: boolean;
  
  // Gestion du Quota (en octets)
  storage_limit: number;
  used_storage: number;
  
  // Sécurité
  mfa_enabled?: boolean; // Optionnel si pas encore implémenté
  
  created_at: string; // ISO 8601 Date String
  updated_at?: string;
}

/**
 * Utilisé pour l'affichage public (partage de fichiers)
 */
export interface UserPublic {
  id: number;
  full_name: string;
  avatar_url?: string; // Généré via Gravatar ou Upload
}