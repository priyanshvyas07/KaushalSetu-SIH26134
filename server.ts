import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { authRouter } from './backend/api/auth';
import { studentRouter } from './backend/api/student';
import { instituteRouter } from './backend/api/institute';
import { employerRouter } from './backend/api/employer';
import { adminRouter } from './backend/api/admin';
import { marketRouter } from './backend/api/market';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON and URL-encoded body parsers with generous limits for resume PDF/text uploads
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Mount Versioned REST API endpoints (v1) and legacy aliases
  app.use('/api/v1/auth', authRouter);
  app.use('/api/auth', authRouter);

  app.use('/api/v1/students', studentRouter);
  app.use('/api/v1/student', studentRouter);
  app.use('/api/students', studentRouter);
  app.use('/api/student', studentRouter);

  app.use('/api/v1/institutes', instituteRouter);
  app.use('/api/v1/institute', instituteRouter);
  app.use('/api/institutes', instituteRouter);
  app.use('/api/institute', instituteRouter);

  app.use('/api/v1/employers', employerRouter);
  app.use('/api/v1/employer', employerRouter);
  app.use('/api/employers', employerRouter);
  app.use('/api/employer', employerRouter);

  app.use('/api/v1/admin', adminRouter);
  app.use('/api/admin', adminRouter);

  app.use('/api/v1/market', marketRouter);
  app.use('/api/market', marketRouter);

  // Health check endpoint
  const healthHandler = (req: express.Request, res: express.Response) => {
    res.json({
      status: 'healthy',
      app: 'KaushalSetu Skill Intelligence Platform',
      version: '1.0.0-sih26134',
      timestamp: new Date().toISOString(),
      api_version: 'v1',
      intelligence_layer: 'active',
      data_notice: 'DEMO/SEED DATA - Benchmark models active'
    });
  };
  app.get('/api/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // Vite development middleware or static production build
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KaushalSetu server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
