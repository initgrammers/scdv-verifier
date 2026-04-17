import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mkcert from 'vite-plugin-mkcert';
import AstroPWA from '@vite-pwa/astro';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  output: 'static',
  base: '/scdv-verificador/',
  integrations: [
    react(),
    tailwind(),
    AstroPWA({
      registerType: 'autoUpdate',
      base: '/scdv-verificador/',
      scope: '/scdv-verificador/',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'SCDV Verificador',
        short_name: 'Verificador',
        description: 'Verificador de certificados digitales auténticos',
        start_url: '/scdv-verificador/',
        id: '/scdv-verificador/',
        display: 'standalone',
        background_color: '#0A0A0F',
        theme_color: '#C8F135',
        orientation: 'portrait',
        lang: 'es',
        dir: 'ltr',
        categories: ['utilities', 'productivity'],
        icons: [
          {
            src: '/scdv-verificador/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/scdv-verificador/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/scdv-verificador/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/scdv-verificador/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        navigateFallback: '/scdv-verificador/',
        navigateFallbackAllowlist: [/^\/scdv-verificador/],
        runtimeCaching: [
          {
            urlPattern: /\/scdv-verificador\/.*\.(js|css|png|svg|ico|woff2?)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'scdv-static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  vite: {
    optimizeDeps: { exclude: ['@noble/ed25519'] },
    plugins: isDev ? [mkcert()] : [],
    server: isDev ? { https: true } : {},
  },
});
