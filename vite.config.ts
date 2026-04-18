import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@store': path.resolve(__dirname, './src/store'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        // Automatically inject global SCSS variables & mixins into every module
        // so components can use $brand-color, respond-to(), etc. without @use
        additionalData: `
          @use "@/styles/variables" as *;
          @use "@/styles/mixins" as *;
        `,
      },
    },
  },

  server: {
    port: 5123,
    proxy: {
      '/api': {
        target: 'http:localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    // Generate source maps for production debugging
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        // Rollup's typings can treat `manualChunks` as a function.
        // Using a function avoids the "object literal may only specify known properties"
        // error while keeping the same chunking intent.
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react'
          }
          if (id.includes('node_modules/react-router-dom/')) {
            return 'router'
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }
          if (id.includes('node_modules/gsap/')) {
            return 'gsap'
          }
          if (id.includes('@stripe/stripe-js') || id.includes('@stripe/react-stripe-js')) {
            return 'stripe'
          }
          if (id.includes('node_modules/zustand/')) {
            return 'zustand'
          }

          return undefined
        },
      },
    },
  },
})
