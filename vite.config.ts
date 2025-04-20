import { defineConfig, loadEnv } from 'vite';
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react({
        // Enable Fast Refresh for better development experience
        fastRefresh: true,
      }),
      // Only use component tagger in development
      mode === 'development' && componentTagger(),
    ].filter(Boolean),

    base: '/SafeBite-V1/', // Change this to your repo name

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    define: {
      'import.meta.env.VITE_ADMIN_USERNAME': JSON.stringify(env.VITE_ADMIN_USERNAME),
      'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(env.VITE_ADMIN_PASSWORD),
    },

    build: {
      // Enable minification
      minify: true,
      // Split chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'ui': ['@/components/ui'],
          },
        },
      },
      // Generate source maps for debugging in development
      sourcemap: mode !== 'production',
      // Reduce chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
    },
  };
});
