import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Storage - gRPC Cluster Control",
  description: "Next-gen Distributed Storage Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // On force la classe "dark" et on applique le fond Bleu Cassé (#0f172a)
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f172a] text-slate-100 min-h-screen`}
        suppressHydrationWarning={true}
      >
        {/* Le contenu des pages (Login, Register, Dashboard) s'affiche ici */}
        {children}
        
        {/* Toaster permet d'afficher les alertes gRPC (ex: "Node Plein") */}
        <Toaster />
      </body>
    </html>
  );
}