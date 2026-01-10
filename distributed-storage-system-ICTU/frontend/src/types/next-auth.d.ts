/* eslint-disable @typescript-eslint/no-unused-vars */
import { User as CustomUser } from './user';

/**
 * Extension des types globaux pour React et le DOM
 * Utile si vous attachez des propriétés personnalisées à l'objet Window
 */
declare global {
  interface Window {
    // Par exemple pour le debugging
    __NEXUS_DEBUG__?: boolean;
  }
}

/**
 * Si jamais vous décidez d'utiliser la librairie "next-auth" plus tard,
 * ceci permettra de typer la session correctement.
 */
declare module 'next-auth' {
  interface Session {
    user: CustomUser;
    accessToken: string;
  }

  interface User extends CustomUser {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
  }
}