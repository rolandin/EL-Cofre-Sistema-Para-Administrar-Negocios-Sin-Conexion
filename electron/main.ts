import { app, BrowserWindow } from 'electron';
import path from 'path';
import { startServer } from '../server/index';

let mainWindow: BrowserWindow | null = null;
let serverPort: number;

async function createWindow() {
  // Start the Express API server
  serverPort = await startServer(3847);
  console.log(`Express server started on port ${serverPort}`);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'El Cofre',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    // In dev, load Vite dev server (which proxies /api to Express)
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built frontend through Express
    mainWindow.loadURL(`http://127.0.0.1:${serverPort}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
