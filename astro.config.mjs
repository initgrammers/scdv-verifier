import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  base: '/scdv-verificador/',
  integrations: [react(), tailwind()],
  vite: {
    optimizeDeps: { exclude: ['@noble/ed25519'] },
  },
});
