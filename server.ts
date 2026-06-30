import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse large base64 image strings in database payloads
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // API endpoint to save the database state back to the disk (to persist in Git/Cloudflare)
  app.post('/api/save-database', (req, res) => {
    try {
      const dbPath = path.join(process.cwd(), 'src', 'services', 'database_seed.json');
      fs.writeFileSync(dbPath, JSON.stringify(req.body, null, 2), 'utf-8');
      console.log('Successfully saved updated database seed to disk at:', dbPath);
      return res.json({ success: true, message: 'Database saved successfully!' });
    } catch (err: any) {
      console.error('Error writing database seed to file:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to save database' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Vite development vs production asset serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TRS SERVER] Running successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
