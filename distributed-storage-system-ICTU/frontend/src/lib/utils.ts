import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Fusionne les classes Tailwind proprement (résout les conflits p-4 vs p-2)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate des octets en taille lisible (Standard Nexus : GB, MB, KB)
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  
  // Calcul de l'index de grandeur
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  // Protection contre les index hors tableau
  const unit = sizes[i] || 'Bytes'
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${unit}`
}

/**
 * Formate une date de manière élégante pour l'interface Onyx
 * Gère les erreurs si la date est invalide
 */
export function formatDate(dateString: string | Date | undefined) {
  if (!dateString) return "Date inconnue"
  
  try {
    const date = new Date(dateString)
    
    // Vérification si la date est valide
    if (isNaN(date.getTime())) return "Format invalide"

    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    return "Date erronée"
  }
}

/**
 * Formate une date relative (ex: "Aujourd'hui à 14:00")
 */
export function formatRelativeDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

    if (diffInDays === 0) return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffInDays === 1) return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    
    return formatDate(dateString);
}

/**
 * Simulation de latence réseau pour les tests UI (Spinners, Skeletons)
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));