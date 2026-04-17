import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mkcert from 'vite-plugin-mkcert';
import AstroPWA from '@vite-pwa/astro';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  output: 'static',
  base: '/scdv-verifier/',
  integrations: [
    react(),
    tailwind(),
    AstroPWA({
      registerType: 'autoUpdate',
      base: '/scdv-verifier/',
      scope: '/scdv-verifier/',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'SCDV Verificador',
        short_name: 'Verificador',
        description: 'Verificador de certificados digitales auténticos',
        start_url: '/scdv-verifier/',
        id: '/scdv-verifier/',
        display: 'standalone',
        background_color: '#0A0A0F',
        theme_color: '#C8F135',
        orientation: 'portrait',
        lang: 'es',
        dir: 'ltr',
        categories: ['utilities', 'productivity'],
        icons: [
          {
            src: '/scdv-verifier/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/scdv-verifier/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/scdv-verifier/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/scdv-verifier/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        globDirectory: 'dist',
        navigateFallback: null,
        manifestTransforms: [
          (entries) => {
            const seen = new Set();
            const manifest = entries
              .map((entry) => {
                const url = entry.url.startsWith('/scdv-verifier/')
                  ? entry.url
                  : `/scdv-verifier/${entry.url}`;
                return { ...entry, url };
              })
              .filter((entry) => {
                if (seen.has(entry.url)) return false;
                seen.add(entry.url);
                return true;
              });
            return { manifest };
          },
        ],
        navigateFallback: '/scdv-verifier/index.html',
        navigateFallbackAllowlist: [/^\/scdv-verifier\//],
        runtimeCaching: [
          {
            urlPattern: /\/scdv-verifier\/.*\.(js|css|png|svg|ico|woff2?)$/,
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
