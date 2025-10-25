import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'recharts',
      'jspdf',
      'jspdf-autotable',
      'html2canvas',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities'
    ]
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: [
      '.sandbox.novita.ai', // Allow all sandbox domains
      'localhost'
    ],
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  },
  build: {
    // Production optimizations
    target: 'es2015',
    minify: 'esbuild', // Using esbuild for faster builds
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['@heroicons/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit
    cssCodeSplit: true,
    sourcemap: false // Disable sourcemaps in production for size
  }
})
