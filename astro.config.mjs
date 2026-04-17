import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mkcert from 'vite-plugin-mkcert';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  output: 'static',
  base: '/scdv-verificador/',
  integrations: [react(), tailwind()],
  vite: {
    optimizeDeps: { exclude: ['@noble/ed25519'] },
    plugins: isDev ? [mkcert()] : [],
    server: isDev ? { https: true } : {},
  },
});
