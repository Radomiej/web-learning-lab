import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ plugins: [react()], resolve: { alias: { react: 'C:/Nauka/web-learning-lab/node_modules/react/index.js', 'react-dom/client': 'C:/Nauka/web-learning-lab/node_modules/react-dom/client.js', 'react/jsx-runtime': 'C:/Nauka/web-learning-lab/node_modules/react/jsx-runtime.js' } }, server: { host: '0.0.0.0' } })
