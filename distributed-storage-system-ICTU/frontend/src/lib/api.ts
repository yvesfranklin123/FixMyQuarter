'use client';

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  // ❌ SUPPRIMÉ : Ne jamais mettre de Content-Type fixe ici pour permettre l'upload
  timeout: 30000,
  withCredentials: true,
});

// 1. Intercepteur de REQUÊTE
api.interceptors.request.use(
  (config) => {
    // ✅ GESTION DYNAMIQUE DU CONTENT-TYPE
    // Si config.data est un FormData (upload), on laisse Axios gérer (pour inclure la boundary)
    // Sinon, on applique application/json par défaut pour les routes classiques
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Intercepteur de RÉPONSE
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // A. Gestion du 401 (Unauthorized / Expired)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('nexus-app-storage'); 
        
        if (!window.location.pathname.includes('/login')) {
          console.error("Session Nexus réinitialisée : Accès refusé");
          window.location.href = '/login?expired=true';
        }
      }
    }

    // B. Formatage des erreurs 422 (FastAPI Validation)
    if (error.response?.status === 422) {
      const detail = error.response.data.detail;
      error.message = Array.isArray(detail) 
        ? detail.map((err: any) => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ')
        : detail || "Erreur de validation des données";
    }

    // C. Erreurs Réseau (Serveur Down)
    if (!error.response) {
      error.message = "Lien avec le cluster rompu. Le serveur est injoignable.";
    }

    return Promise.reject(error);
  }
);

/**
 * ACTIONS GLOBALES
 */
export const copyFile = async (fileId: string, targetFolderId: string | null) => {
  const response = await api.post(`/drive/files/${fileId}/copy`, {
    target_folder_id: targetFolderId 
  });
  return response.data;
};