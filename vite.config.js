import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, target: 'es2020',
    // Сайт и отдельная страница админки (/admin/).
    rollupOptions: { input: { main: resolve(import.meta.dirname, 'index.html'), admin: resolve(import.meta.dirname, 'admin/index.html') } },
  },
});
