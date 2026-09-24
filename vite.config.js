import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.wasm', '**/*.dat', '**/*.so'],
  optimizeDeps: {
    include: ['@php-wasm/universal', 'ini'],
    exclude: ['@php-wasm/web-8-4'],
  },
  server: { port: 5181, strictPort: true },
});
