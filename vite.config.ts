import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false,
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
  ],
  base: '/portfolio',
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separar vendor chunks por librería
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'lucide';
            }
            if (id.includes('@mlc-ai/web-llm')) {
              return 'webllm';
            }
            if (id.includes('@emailjs')) {
              return 'emailjs';
            }
            // Otros node_modules en vendor común
            return 'vendor';
          }
          
          // Separar componentes por sección
          if (id.includes('src/components/sections')) {
            const section = id.split('/').pop()?.replace('.tsx', '');
            return `section-${section}`;
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    cssMinify: 'lightningcss',
    reportCompressedSize: false,
    target: 'es2020',
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})
