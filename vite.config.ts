import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      // Why this proxy exists:
      // In a Docker Compose network, containers cannot communicate using 'localhost' since each container
      // has its own loopback interface. Thus, we route requests to the respective service names
      // (e.g., node-backend and python-backend) defined in docker-compose.yml.
      // We read VITE_NODE_BACKEND_URL and VITE_PYTHON_BACKEND_URL from environment variables.
      // If those environment variables are not set, it falls back to localhost to preserve compatibility
      // for developers running the stack directly on their host machine without Docker.
      proxy: {
        '/api': {
          target: env.VITE_NODE_BACKEND_URL || 'http://localhost:3002',
          changeOrigin: true,
        },
        '/py-api': {
          target: env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/py-api/, '/api'),
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
