import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Récupération du token via le cookie 'nexus_token'
  const session = request.cookies.get('nexus_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. REDIRECTION RACINE (/)
  // On redirige vers /drive qui est ton point d'entrée Dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/drive', request.url));
  }

  // 2. PROTECTION DES PAGES D'AUTH
  // Si déjà connecté, on empêche le retour sur Login/Register
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/drive', request.url));
  }

  // 3. PROTECTION DES ZONES SÉCURISÉES
  // On protège /drive (ton dashboard) et /admin (le panel superuser)
  const isProtectedRoute = pathname.startsWith('/drive') || pathname.startsWith('/admin');
  
  if (!session && isProtectedRoute) {
    // Si pas de session, retour au terminal de login
    const loginUrl = new URL('/login', request.url);
    // Optionnel : on peut ajouter l'URL de retour en paramètre
    // loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configuration du Matcher pour couvrir tout le cluster sauf les assets
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * 1. api (API routes internes)
     * 2. _next/static (fichiers compilés)
     * 3. _next/image (images optimisées)
     * 4. favicon.ico et assets publics
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}