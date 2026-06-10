import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import auth from 'auth-astro';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), auth()],
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'server', // Enable Server-Side Rendering (SSR) for Auth.js integration
});
