import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: {
      '$lib': resolve(__dirname, './src/lib'),
      '$components': resolve(__dirname, './src/components')
    }
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    exclude: ['@3d-dice/dice-box']
  }
});
