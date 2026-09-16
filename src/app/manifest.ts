import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mi Tienda & Inventario',
    short_name: 'Mi Tienda',
    description: 'Gestiona tu catálogo de productos y vende directamente por WhatsApp.',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#F1F5F9',
    theme_color: '#3C50E0',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
