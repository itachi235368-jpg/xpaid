import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

const ipfsServerPlugin = (): Plugin => ({
  name: 'ipfs-server-proxy',
  configureServer(server) {
    server.middlewares.use('/api/ipfs', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        return res.end('Method Not Allowed');
      }
      let body = '';
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const { name, symbol, description, twitter, telegram, website, imageBase64, imageName } = JSON.parse(body);
          const form = new FormData();
          let imageBlob: Blob;
          if (imageBase64) {
            const byteChars = atob(imageBase64.replace(/^data:image\/\w+;base64,/, ''));
            const byteNumbers = new Uint8Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
              byteNumbers[i] = byteChars.charCodeAt(i);
            }
            imageBlob = new Blob([byteNumbers], { type: 'image/png' });
          } else {
            imageBlob = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' });
          }

          form.append('file', imageBlob, imageName || `${(symbol || 'token').toLowerCase()}.png`);
          form.append('name', name || 'Token');
          form.append('symbol', symbol || 'TKN');
          form.append('description', description || '');
          if (twitter) form.append('twitter', twitter);
          if (telegram) form.append('telegram', telegram);
          if (website) form.append('website', website);
          form.append('showName', 'true');

          const pumpRes = await fetch('https://pump.fun/api/ipfs', {
            method: 'POST',
            body: form,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (pumpRes.ok) {
            const data = await pumpRes.json();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
          } else {
            const errText = await pumpRes.text();
            res.statusCode = pumpRes.status || 502;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: errText }));
          }
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: err?.message || 'Server error' }));
        }
      });
    });
  }
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), ipfsServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
