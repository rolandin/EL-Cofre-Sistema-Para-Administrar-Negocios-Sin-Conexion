import express from 'express';

const app = express();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

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
