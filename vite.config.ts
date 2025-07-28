import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  base: "/jaxfluids-simulation/",
  plugins: [
    react(),
    viteCompression({
      verbose: false,
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
    target: "esnext",
    minify: "terser",

    rollupOptions: {
      output: {
        manualChunks: {
          "onnx-runtime": ["onnxruntime-web"],
          "chart-vendor": ["recharts"],
          "data-processing": ["npyjs"],
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": ["lucide-react"],
        },
        // Optimize chunk naming
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },

    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.warn"],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
  },

  optimizeDeps: {
    include: ["onnxruntime-web", "recharts", "npyjs", "lucide-react"],
    exclude: [],
    // Force pre-bundling for better performance
    force: true,
  },

  esbuild: {
    drop: ["console", "debugger"],
    target: "esnext",
  },

  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === "js") {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    },
  },
});
