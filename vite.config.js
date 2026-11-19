import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function readLocalDevVars() {
  const env = { ...process.env };
  const devVarsPath = path.resolve(process.cwd(), '.dev.vars');
  if (!fs.existsSync(devVarsPath)) return env;
  try {
    const raw = fs.readFileSync(devVarsPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m && !env[m[1]]) {
        env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // ignore local dev vars parse error
  }
  return env;
}

function localCloudflareFunctionsDevPlugin() {
  return {
    name: 'zenlab-local-api-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || '').split('?')[0];
        if (pathname !== '/api/tts' && pathname !== '/api/tutor') {
          return next();
        }

        try {
          const modPath =
            pathname === '/api/tts' ? './functions/api/tts.js' : './functions/api/tutor.js';
          const handlerModule = await server.ssrLoadModule(modPath);

          if (req.method === 'OPTIONS' && typeof handlerModule.onRequestOptions === 'function') {
            const webRes = await handlerModule.onRequestOptions();
            res.statusCode = webRes.status;
            webRes.headers.forEach((v, k) => res.setHeader(k, v));
            res.end();
            return;
          }

          if (req.method !== 'POST' || typeof handlerModule.onRequestPost !== 'function') {
            res.statusCode = 405;
            res.end();
            return;
          }

          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const rawBody = Buffer.concat(chunks);

          const webRequest = new Request(`http://127.0.0.1${req.url}`, {
            method: 'POST',
            headers: { 'content-type': req.headers['content-type'] || 'application/json' },
            body: rawBody
          });

          const webRes = await handlerModule.onRequestPost({
            request: webRequest,
            env: readLocalDevVars()
          });

          res.statusCode = webRes.status;
          webRes.headers.forEach((v, k) => res.setHeader(k, v));
          const buf = Buffer.from(await webRes.arrayBuffer());
          res.end(buf);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, fallback: true, error: err?.message || 'DEV_PROXY_ERROR' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localCloudflareFunctionsDevPlugin()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          lucide: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
