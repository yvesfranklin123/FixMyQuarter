/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisation du rendu des images (Avatar, Previews)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'grainy-gradients.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Améliore la vitesse de build et de rechargement
  reactStrictMode: true,
  swcMinify: true,

  // Configuration pour le déploiement sur Nexus Nodes
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons'
    ],
  },
};

export default nextConfig;