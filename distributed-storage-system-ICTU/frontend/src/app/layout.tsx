import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { ModalProvider } from '@/providers/modal-provider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import '@/app/globals.css';

/**
 * Configuration des polices avec stratégie de repli
 * 'display: swap' permet d'afficher une police système en attendant le chargement
 */
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  weight: ['900'], 
  style: ['italic'], 
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NEXUS CLOUD | Distributed Storage Engine',
  description: 'Next-gen decentralized storage with AES-256 encryption.',
  icons: {
    icon: '/favicon.ico', // Assurez-vous d'avoir un favicon dans /public
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          montserrat.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Le ModalProvider gère toutes les fenêtres surgissantes (Share, Delete, etc.) */}
          <ModalProvider />
          
          {/* Contenu principal de l'application */}
          {children}
          
          {/* Le Toaster gère l'affichage des notifications (Success, Error, etc.) */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}