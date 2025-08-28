/**
 * Configuración de Next.js para el proyecto Kiki
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/next.config.js
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: Configurar dominios de imágenes permitidos
  images: {
    domains: [],
  },
  // TODO: Configurar headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig