import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', '127.0.0.1'], // ✅ autorise les images servies depuis les backends locaux
  },
  
  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_NEST_BACKEND_URL: process.env.NEXT_PUBLIC_NEST_BACKEND_URL || 'http://localhost:3001',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5058',
    NEXT_PUBLIC_INTERNAL_API_KEY: process.env.NEXT_PUBLIC_INTERNAL_API_KEY || 'ey-engage-internal-key-2024',
  },
};

export default nextConfig;
