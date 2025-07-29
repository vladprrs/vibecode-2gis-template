import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Path aliases
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@/config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@/styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
    }
  },

  // Plugins
  plugins: [
    // ESLint plugin disabled for now - can be re-enabled after dependencies are fixed
  ],

  // Server configuration
  server: {
    port: 8080,
    host: '0.0.0.0',
    open: '/test/dashboard-figma-demo-modular.html',
    cors: true,
    hmr: {
      overlay: true
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2022',
    lib: {
      entry: {
        main: resolve(__dirname, 'src/main.ts'),
        demo: resolve(__dirname, 'src/demo/DashboardFigmaDemo.js')
      },
      formats: ['es']
    },
    rollupOptions: {
      external: [],
      output: {
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  },

  // Preview server
  preview: {
    port: 4173,
    host: '0.0.0.0',
    open: '/test/dashboard-figma-demo-modular.html'
  },

  // Environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  },

  // Base URL for deployment
  base: './',

  // Static assets handling
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.gif', '**/*.webp']
}); 