import {buildClientVersion} from './server/clientVersion.js';
import {telemetryPlugin} from './server/telemetryPlugin.js';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  define: {__LAB_CLIENT_VERSION__: JSON.stringify(buildClientVersion())},
  plugins: [react(), telemetryPlugin()],
  assetsInclude: ['**/*.wasm', '**/*.dat', '**/*.so'],
  optimizeDeps: {
    include: ['@php-wasm/universal', 'ini'],
    exclude: ['@php-wasm/web-8-4'],
  },
  server: { port: 5181, strictPort: true, proxy: { '/api/ai': { target: 'http://127.0.0.1:5183', changeOrigin: true } } },
});
