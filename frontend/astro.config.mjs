import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import auth from 'auth-astro';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321',
  integrations: [react(), auth(), sitemap()],
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    plugins: [tailwindcss()],
    define: {
      BACKEND_URL: JSON.stringify(process.env.BACKEND_URL || 'http://localhost:3001'),
    },
    server: {
      allowedHosts: true,
    },
  },
  output: 'server',
});