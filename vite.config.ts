import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  base: "/jaxfluids-feed-forward/",
  plugins: [
    react(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 1024,
      algorithm: "gzip",
      ext: ".gz",
    }),
    tailwindcss(),
  ],

  build: {
    chunkSizeWarningLimit: 1600,
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks: {
          "onnx-runtime": ["onnxruntime-web"],
          charts: ["recharts"],
          "data-processing": ["npyjs"],
          "react-vendor": ["react", "react-dom"],
        },
      },
    },

    // Target modern browsers for better optimization
    target: "esnext",

    // Advanced minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"],
      },
      mangle: {
        safari10: true,
      },
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["onnxruntime-web", "recharts", "npyjs"],
    exclude: [],
  },

  // Enable experimental features for better performance
  esbuild: {
    drop: ["console", "debugger"],
  },
});
