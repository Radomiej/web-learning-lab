import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.wasm', '**/*.dat'],
  server: { port: 5181, strictPort: true },
});
