/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages publica los proyectos en /<repositorio>/.
  // En desarrollo local se mantiene la raíz /.
  base: process.env.GITHUB_ACTIONS ? '/dispatch-platform-demo/' : '/',
  plugins: [react()],
  worker: {
    // El worker de MapLibre es un módulo ES.
    format: 'es',
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/maplibre-gl')) return 'maplibre';
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
