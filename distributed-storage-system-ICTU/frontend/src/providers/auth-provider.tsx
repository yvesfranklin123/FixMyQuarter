'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const isPublicRoute = ['/login', '/register', '/2fa'].includes(pathname);

      if (!token && !isPublicRoute && !pathname.startsWith('/share/')) {
        // Si pas de token et page protégée -> Login
        router.push('/login');
      } 
      else if (token && isPublicRoute) {
        // Si token et page login -> Dashboard
        router.push('/drive');
      }
      
      // Ici, on pourrait aussi charger le profil utilisateur dans un Store Zustand
      // si le token est présent.
    };

    checkAuth();
  }, [pathname, router]);

  return <>{children}</>;
}