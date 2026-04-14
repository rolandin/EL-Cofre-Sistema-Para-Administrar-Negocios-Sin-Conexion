import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import serviceRoutes from './routes/services';
import salesRoutes from './routes/sales';
import employeeRoutes from './routes/employees';
import contractorRoutes from './routes/contractors';
import paymentRoutes from './routes/payments';
import appointmentRoutes from './routes/appointments';
import settingsRoutes from './routes/settings';
import backupRoutes from './routes/backup';
import metricsRoutes from './routes/metrics';
import userRoutes from './routes/users';
import inventoryRoutes from './routes/inventory';
import receiveRoutes from './routes/receive';
import returnsRoutes from './routes/returns';
import licenseRoutes from './routes/license';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/receive', receiveRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/license', licenseRoutes);

// In production, serve the built frontend
if (process.env.NODE_ENV !== 'development') {
  // In packaged Electron app, dist/ is unpacked outside app.asar
  // __dirname = resources/app.asar/dist-electron/server
  // unpacked dist = resources/app.asar.unpacked/dist
  const asarPath = path.join(__dirname, '../../dist');
  const unpackedPath = asarPath.replace('app.asar', 'app.asar.unpacked');

  // Try unpacked first (packaged app), then asar path (dev/local build)
  const fs = require('fs');
  const distPath = fs.existsSync(path.join(unpackedPath, 'index.html'))
    ? unpackedPath
    : asarPath;

  console.log('Serving frontend from:', distPath);

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
