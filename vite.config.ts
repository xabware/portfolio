import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const basePath = process.env.VITE_BASE_PATH ?? (command === 'build' ? '/portfolio/' : '/')

  return {
    plugins: [react()],
    base: basePath,
    optimizeDeps: {
      exclude: ['@mlc-ai/web-llm'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // WebLLM separado (muy grande, carga diferida)
            webllm: ['@mlc-ai/web-llm'],
            // EmailJS separado (solo usado en contact)
            emailjs: ['@emailjs/browser'],
            // Three.js separado (solo usado en skills galaxy)
            three: ['three', '@react-three/fiber', '@react-three/drei'],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
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
  }
})
