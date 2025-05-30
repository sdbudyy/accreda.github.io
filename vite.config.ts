import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    base: mode === 'production' ? '/accreda.github.io/' : '/',
    server: mode === 'development' ? {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001', // Backend port for dev
          changeOrigin: true,
        },
      },
    } : undefined,
    // Log the environment variables (without the actual values for security)
    define: {
      __SUPABASE_URL_EXISTS__: JSON.stringify(!!env.VITE_SUPABASE_URL),
      __SUPABASE_ANON_KEY_EXISTS__: JSON.stringify(!!env.VITE_SUPABASE_ANON_KEY),
    },
    optimizeDeps: {
      include: [], // add plugins you use
    },
  };
});
