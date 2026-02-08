import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // This prevents Vite from trying to bundle the worker into a single file
    exclude: ['rembg-webgpu'], 
  },
  // Ensure the worker is treated as an EcmaScript Module
  worker: {
    format: 'es'
  }
});
