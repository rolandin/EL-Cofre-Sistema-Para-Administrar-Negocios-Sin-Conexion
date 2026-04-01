import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

// Import route modules (will be added incrementally)
import authRoutes from './routes/auth';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api', authRoutes);

// In production, serve the built frontend
if (process.env.NODE_ENV !== 'development') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export function startServer(port: number = 3847): Promise<number> {
  return new Promise((resolve) => {
    const server = app.listen(port, '127.0.0.1', () => {
      console.log(`El Cofre API running on http://127.0.0.1:${port}`);
      resolve(port);
    });

    server.on('error', () => {
      const server2 = app.listen(0, '127.0.0.1', () => {
        const addr = server2.address();
        const actualPort = typeof addr === 'object' && addr ? addr.port : port;
        console.log(`El Cofre API running on http://127.0.0.1:${actualPort}`);
        resolve(actualPort);
      });
    });
  });
}

export default app;
