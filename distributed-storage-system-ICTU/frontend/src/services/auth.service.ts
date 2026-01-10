import { api } from '@/lib/api';
import { LoginResponse, User } from '@/types/api-responses';
import { z } from 'zod';

// Schéma de validation pour l'inscription (Zod pour la pré-validation)
export const registerSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
  password: z.string().min(8),
  confirm_password: z.string().min(8)
}).refine((data) => data.password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

export type RegisterData = z.infer<typeof registerSchema>;

export const authService = {
  /**
   * Connexion via OAuth2 Password Flow (Multipart/Form-Data)
   */
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    // Note: FastAPI attend du form-data pour /token
    return api.post<LoginResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  register: async (data: Omit<RegisterData, 'confirm_password'>) => {
    return api.post<User>('/auth/register', data);
  },

  getMe: async () => {
    return api.get<User>('/users/me');
  },

  updateProfile: async (data: Partial<User>) => {
    return api.patch<User>('/users/me', data);
  },
  
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};