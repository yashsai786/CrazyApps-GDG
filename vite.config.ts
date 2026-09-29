import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import apiAnalyzeHandler from './api/analyze.js';

function absentBackendPlugin(): Plugin {
  return {
    name: 'absent-backend-api',
    configureServer(server) {
      server.middlewares.use('/api/analyze', async (req, res) => {
        // Polyfill express/vercel helper methods on Connect res for dev server
        if (!(res as any).status) {
          (res as any).status = function (code: number) {
            res.statusCode = code;
            return res;
          };
        }
        if (!(res as any).json) {
          (res as any).json = function (data: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };
        }

        try {
          await apiAnalyzeHandler(req as any, res as any);
        } catch (err) {
          console.error('[ViteDevAPI] Error in analyze handler:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Server error occurred during analysis' }));
          }
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  // Load env variables (GROQ_API_KEY)
  const env = loadEnv(mode, process.cwd(), '');
  process.env.GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY;

  return {
    plugins: [react(), absentBackendPlugin()],
    server: {
      port: 3000,
      open: false,
      host: true
    }
  };
});
