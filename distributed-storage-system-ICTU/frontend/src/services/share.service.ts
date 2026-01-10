import { api } from '@/lib/api';

export interface ShareLinkResponse {
  link: string;
  token: string;
  expires_at: string;
}

export const shareService = {
  createShareLink: async (fileId: string, expiresInMinutes = 1440) => {
    return api.post<ShareLinkResponse>(`/share/${fileId}`, { expires_in_minutes: expiresInMinutes });
  },

  // Récupérer les infos d'un fichier partagé (Public, sans token Auth)
  getSharedFile: async (token: string) => {
    // Note: On utilise une instance axios différente sans header Authorization si nécessaire, 
    // ou on laisse le backend gérer l'accès public.
    return api.get(`/share/public/${token}`);
  }
};