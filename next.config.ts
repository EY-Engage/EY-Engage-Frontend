import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    domains: ['localhost'], // ✅ autorise les images servies depuis le backend local
  },
};

export default nextConfig;
