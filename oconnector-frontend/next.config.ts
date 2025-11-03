import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Para Cloudflare Pages com Next.js 16:
  // Export estático (recomendado para este projeto)
  output: 'export',
  
  // Desabilitar image optimization (não funciona em export estático)
  images: {
    unoptimized: true,
  },
  
  // Headers não funcionam com export estático
  // Configure no Cloudflare Pages → Settings → HTTP Headers
};

export default nextConfig;
