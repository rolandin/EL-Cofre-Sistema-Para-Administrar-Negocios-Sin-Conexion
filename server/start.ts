import { startServer } from './index';

startServer(3847).then((port) => {
  console.log(`El Cofre API ready on http://127.0.0.1:${port}`);
});
