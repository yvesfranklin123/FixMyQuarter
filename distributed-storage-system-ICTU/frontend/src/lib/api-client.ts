const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Récupération automatique du token depuis le localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexus_token') : null;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Gestion des erreurs FastAPI (422, 401, 500)
      const error = new Error(data.detail || 'Erreur serveur');
      (error as any).status = response.status;
      (error as any).errors = data.errors; // Pour les erreurs de validation
      throw error;
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};