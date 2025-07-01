import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  base: '/jaxfluids-feed-forward/',
  plugins: [
    react(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 1024,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    tailwindcss(),
  ],
  
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1600,
    
    // Enable source maps for debugging (optional)
    sourcemap: false,
    
    rollupOptions: {
      output: {
        // Manual chunking to separate heavy dependencies
        manualChunks: {
          // Separate ONNX Runtime into its own chunk
          'onnx-runtime': ['onnxruntime-web'],
          
          // Separate chart libraries
          'charts': ['recharts'],
          
          // Separate data processing libraries
          'data-processing': ['npyjs'],
          
          // React and related libraries
          'react-vendor': ['react', 'react-dom'],
        }
      }
    },
    
    // Target modern browsers for better optimization
    target: 'esnext',
    
    // Advanced minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'onnxruntime-web',
      'recharts',
      'npyjs'
    ],
    exclude: []
  },
  
  // Enable experimental features for better performance
  esbuild: {
    drop: ['console', 'debugger'],
  },
})