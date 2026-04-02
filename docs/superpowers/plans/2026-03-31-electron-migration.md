# El Cofre — Electron + Express + React Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate El Cofre from Next.js to an Electron desktop app with Express backend and React frontend, producing installable .exe (Windows) and .dmg (macOS) packages.

**Architecture:** Electron main process starts an Express server (local port) that serves the API. The renderer loads a Vite-built React SPA. SQLite stays as-is via better-sqlite3. React Router replaces Next.js routing.

**Tech Stack:** Electron 28+, Express 4, React 18, Vite 5, React Router 6, better-sqlite3, TailwindCSS, shadcn/ui, electron-builder

**Spec:** `docs/superpowers/specs/2026-03-31-electron-migration-license-system-design.md`

---

## Phase 1: Project Scaffold

### Task 1: Initialize Electron + Vite project structure

**Files:**
- Create: `electron/main.ts`
- Create: `electron/preload.ts`
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `src/index.html`
- Create: `server/index.ts`
- Create: `vite.config.ts`
- Create: `electron-builder.yml`
- Create: `tsconfig.node.json`
- Create: `tsconfig.web.json`
- Modify: `package.json`
- Modify: `tsconfig.json`

- [ ] **Step 1: Create new package.json with all dependencies**

Replace the current `package.json`:

```json
{
  "name": "elcofre",
  "version": "1.0.0",
  "private": true,
  "main": "dist-electron/main.js",
  "scripts": {
    "dev:frontend": "vite",
    "dev:electron": "NODE_ENV=development electron .",
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:electron\"",
    "build": "tsc -p tsconfig.node.json && vite build",
    "package:win": "npm run build && electron-builder --win",
    "package:mac": "npm run build && electron-builder --mac",
    "package": "npm run build && electron-builder --win --mac",
    "lint": "eslint src server electron"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.1",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-hover-card": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.1",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",
    "@tanstack/react-query": "^5.28.4",
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^9.4.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0",
    "embla-carousel-react": "^8.3.0",
    "express": "^4.18.2",
    "input-otp": "^1.2.4",
    "jose": "^5.2.3",
    "lucide-react": "^0.446.0",
    "multer": "^1.4.5-lts.1",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.53.0",
    "react-resizable-panels": "^2.1.3",
    "react-router-dom": "^6.22.0",
    "recharts": "^2.12.7",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.2",
    "vaul": "^0.9.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/better-sqlite3": "^7.6.9",
    "@types/cookie-parser": "^1.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.6.2",
    "@types/react": "^18.2.22",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.15",
    "concurrently": "^8.2.2",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "eslint": "^8.49.0",
    "postcss": "^8.4.30",
    "tailwindcss": "^3.3.3",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.2.2",
    "vite": "^5.1.0"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3847',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 3: Create tsconfig.json (base)**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 4: Create tsconfig.node.json (for Electron + Express)**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "dist-electron",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@server/*": ["server/*"],
      "@electron/*": ["electron/*"]
    }
  },
  "include": ["electron/**/*.ts", "server/**/*.ts"]
}
```

- [ ] **Step 5: Create tsconfig.web.json (for React frontend)**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

- [ ] **Step 6: Create electron-builder.yml**

```yaml
appId: com.elcofre.app
productName: El Cofre
directories:
  output: release
files:
  - dist/**/*
  - dist-electron/**/*
  - server/**/*.js
  - "!node_modules/.cache"
extraResources:
  - from: "warehouse.db"
    to: "warehouse.db"
win:
  target:
    - target: nsis
      arch:
        - x64
  icon: build/icon.ico
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  installerIcon: build/icon.ico
mac:
  target:
    - target: dmg
      arch:
        - x64
        - arm64
  icon: build/icon.icns
  category: public.app-category.business
dmg:
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications
```

- [ ] **Step 7: Create src/index.html**

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>El Cofre - Warehouse Management</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create minimal src/main.tsx entry**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 9: Create minimal src/App.tsx placeholder**

```tsx
export default function App() {
  return <div>El Cofre - Migration in progress</div>;
}
```

- [ ] **Step 10: Create minimal electron/main.ts**

```typescript
import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
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
```

- [ ] **Step 11: Create minimal electron/preload.ts**

```typescript
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
```

- [ ] **Step 12: Install dependencies and verify build**

Run:
```bash
npm install
npx tsc -p tsconfig.node.json --noEmit
npx vite build
```

Expected: No errors. `dist/` folder created with built frontend. `dist-electron/` would have compiled Electron files.

- [ ] **Step 13: Commit scaffold**

```bash
git add -A
git commit -m "feat: scaffold Electron + Vite + Express project structure"
```

---

## Phase 2: Express Server

### Task 2: Database module for Express

**Files:**
- Create: `server/db.ts`

- [ ] **Step 1: Create server/db.ts**

This is a near-copy of `lib/db.ts` adapted for Express (no ESM import.meta):

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

function getDbPath(): string {
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), 'warehouse.db');
  }
  // In production, use the app's user data directory
  return path.join(app.getPath('userData'), 'warehouse.db');
}

const DB_PATH = getDbPath();
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'your-secure-encryption-key';

let db: Database.Database;

try {
  db = new Database(DB_PATH);
  db.pragma(`key = '${ENCRYPTION_KEY}'`);
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('superadmin', 'admin', 'controller')) NOT NULL,
      lastLogin TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      employee_id INTEGER,
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      salary REAL,
      hire_date TEXT DEFAULT CURRENT_TIMESTAMP,
      contractor_id INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY(contractor_id) REFERENCES contractors(id)
    );

    CREATE TABLE IF NOT EXISTS employee_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      payment_amount REAL NOT NULL,
      payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
      payment_period_start TEXT NOT NULL,
      payment_period_end TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      quantity INTEGER NOT NULL DEFAULT 0,
      inboundPrice REAL NOT NULL,
      outboundPrice REAL NOT NULL,
      supplier TEXT,
      commissionPercentage REAL NOT NULL DEFAULT 0,
      lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP,
      sku TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS receiving_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_per_unit REAL NOT NULL,
      date_received TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS sales_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      service_id INTEGER,
      quantity INTEGER,
      inbound_price_per_unit REAL,
      outbound_price_per_unit REAL,
      total_value REAL NOT NULL,
      net_profit REAL NOT NULL,
      contractor_id INTEGER,
      contractor_earnings REAL,
      date_sold TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(service_id) REFERENCES services(id),
      FOREIGN KEY(contractor_id) REFERENCES contractors(id)
    );

    CREATE TABLE IF NOT EXISTS returns_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      return_amount REAL NOT NULL,
      date_returned TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS contractors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location_fee_percentage REAL NOT NULL,
      accumulated_commission REAL NOT NULL DEFAULT 0,
      start_date TEXT DEFAULT CURRENT_TIMESTAMP,
      isActive INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      base_price REAL NOT NULL,
      commission_percentage REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS services_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      contractor_id INTEGER,
      client_name TEXT,
      price_charged REAL NOT NULL,
      business_earnings REAL NOT NULL,
      contractor_earnings REAL NOT NULL,
      date_performed TEXT DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY(service_id) REFERENCES services(id),
      FOREIGN KEY(contractor_id) REFERENCES contractors(id)
    );

    CREATE TABLE IF NOT EXISTS contractor_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contractor_id INTEGER NOT NULL,
      sale_id INTEGER NOT NULL,
      contractor_earnings REAL NOT NULL,
      business_earnings REAL NOT NULL,
      payment_date TEXT NOT NULL,
      FOREIGN KEY(contractor_id) REFERENCES contractors(id),
      FOREIGN KEY(sale_id) REFERENCES sales_history(id)
    );

    CREATE TABLE IF NOT EXISTS business_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      taxId TEXT NOT NULL DEFAULT '',
      defaultCommission REAL NOT NULL DEFAULT 0,
      defaultLocationFee REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL DEFAULT 'system' CHECK(theme IN ('light', 'dark', 'system')),
      language TEXT NOT NULL DEFAULT 'es' CHECK(language IN (
        'en', 'es', 'ru', 'fr', 'zh', 'hi', 'bn', 'ar', 'pt', 'ur',
        'sw', 'id', 'fa', 'ha', 'pa', 'ta', 'tr', 'yo', 'ig', 'am',
        'vi', 'th', 'ms', 'so', 'ku', 'zu', 'xh', 'si', 'ne', 'tl'
      ))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      notes TEXT,
      created_by INTEGER NOT NULL,
      contractor_id INTEGER,
      employee_id INTEGER,
      client_name TEXT,
      service_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id),
      FOREIGN KEY(contractor_id) REFERENCES contractors(id),
      FOREIGN KEY(employee_id) REFERENCES employees(id),
      FOREIGN KEY(service_id) REFERENCES services(id)
    );

    INSERT OR IGNORE INTO system_settings (id) VALUES (1);
  `);
} catch (error) {
  console.error('Database initialization error:', error);
  process.exit(1);
}

export default db;
```

- [ ] **Step 2: Commit**

```bash
git add server/db.ts
git commit -m "feat: add Express database module with full schema"
```

---

### Task 3: Express server entry + auth middleware

**Files:**
- Create: `server/index.ts`
- Create: `server/middleware/auth.ts`

- [ ] **Step 1: Create server/middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import db from '../db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(res: Response, userId: number, role: string): Promise<string> {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(JWT_SECRET);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours in ms
  });

  return token;
}

export async function verifyTokenFromCookie(cookieToken: string): Promise<{ userId: number; role: string }> {
  if (!cookieToken) {
    throw new Error('Missing token');
  }
  const verified = await jwtVerify(cookieToken, JWT_SECRET);
  return verified.payload as { userId: number; role: string };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = await verifyTokenFromCookie(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function checkFirstRun(): Promise<boolean> {
  const result = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  return result.count === 0;
}

export async function createSuperAdmin(username: string, password: string): Promise<void> {
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) {
    throw new Error('Username already exists');
  }
  const hashedPassword = await hashPassword(password);
  db.prepare('INSERT INTO users (username, password, role, isActive) VALUES (?, ?, ?, 1)')
    .run(username, hashedPassword, 'superadmin');
}
```

- [ ] **Step 2: Create server/index.ts**

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

// Import route modules
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
      // Port taken, try next
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
```

- [ ] **Step 3: Commit**

```bash
git add server/index.ts server/middleware/auth.ts
git commit -m "feat: add Express server entry and auth middleware"
```

---

### Task 4: Auth routes (login, logout, me, check-setup, setup)

**Files:**
- Create: `server/routes/auth.ts`

- [ ] **Step 1: Create server/routes/auth.ts**

```typescript
import { Router } from 'express';
import { z } from 'zod';
import db from '../db';
import {
  verifyPassword,
  createToken,
  verifyTokenFromCookie,
  checkFirstRun,
  createSuperAdmin,
} from '../middleware/auth';

const router = Router();

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = z.object({
      username: z.string(),
      password: z.string(),
    }).parse(req.body);

    const user = db.prepare(
      'SELECT id, password, role, isActive FROM users WHERE username = ?'
    ).get(username) as { id: number; password: string; role: string; isActive: number } | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'inactiveUserError' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    db.prepare('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    await createToken(res, user.id, user.role);

    return res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /api/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  return res.json({ success: true });
});

// GET /api/me
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = await verifyTokenFromCookie(token);
    const user = db.prepare(
      'SELECT id, username, role, lastLogin FROM users WHERE id = ?'
    ).get(payload.userId) as any;

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /api/check-setup
router.get('/check-setup', async (_req, res) => {
  try {
    const isFirstRun = await checkFirstRun();
    return res.json({ isFirstRun });
  } catch (error) {
    console.error('Check setup error:', error);
    return res.status(500).json({ error: 'Failed to check setup status' });
  }
});

// POST /api/setup
router.post('/setup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const isFirstRun = await checkFirstRun();
    if (!isFirstRun) {
      return res.status(400).json({ error: 'Setup already completed' });
    }

    await createSuperAdmin(username, password);
    return res.json({ success: true });
  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({ error: 'Failed to complete setup' });
  }
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add server/routes/auth.ts
git commit -m "feat: add auth Express routes (login, logout, me, setup)"
```

---

### Task 5: Product routes

**Files:**
- Create: `server/routes/products.ts`

- [ ] **Step 1: Create server/routes/products.ts**

```typescript
import { Router } from 'express';
import { z } from 'zod';
import db from '../db';
import { requireAuth, verifyTokenFromCookie } from '../middleware/auth';

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  inboundPrice: z.number().min(0),
  outboundPrice: z.number().min(0),
  supplier: z.string().optional(),
  commissionPercentage: z.number().min(0).max(100),
  quantity: z.number().min(0),
});

// GET /api/products
router.get('/', (_req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY name').all();
    return res.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products
router.post('/', (req, res) => {
  try {
    const data = productSchema.parse(req.body);

    db.transaction(() => {
      const result = db.prepare(
        `INSERT INTO products (name, sku, inboundPrice, outboundPrice, supplier, commissionPercentage, quantity, lastUpdated)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      ).run(data.name, data.sku, data.inboundPrice, data.outboundPrice, data.supplier || '', data.commissionPercentage, data.quantity);

      if (data.quantity > 0) {
        db.prepare(
          `INSERT INTO receiving_history (product_id, quantity, price_per_unit, date_received)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(result.lastInsertRowid, data.quantity, data.inboundPrice);
      }
    })();

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create product:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid product data', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// PATCH /api/products/:id
router.patch('/:id', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = await verifyTokenFromCookie(token);
    if (payload.role !== 'admin' && payload.role !== 'superadmin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { name, inboundPrice, outboundPrice, supplier, commissionPercentage } = req.body;

    db.prepare(
      `UPDATE products SET name = ?, inboundPrice = ?, outboundPrice = ?, supplier = ?, commissionPercentage = ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(name, inboundPrice, outboundPrice, supplier || '', commissionPercentage, req.params.id);

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update product:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add server/routes/products.ts
git commit -m "feat: add product Express routes (CRUD)"
```

---

### Task 6: Service routes

**Files:**
- Create: `server/routes/services.ts`

- [ ] **Step 1: Create server/routes/services.ts**

```typescript
import { Router } from 'express';
import { z } from 'zod';
import db from '../db';

const router = Router();

// GET /api/services
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const services = db.prepare('SELECT * FROM services ORDER BY name LIMIT ? OFFSET ?').all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };

    return res.json({ services, total: total.count });
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// POST /api/services
router.post('/', (req, res) => {
  try {
    const data = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      base_price: z.number().min(0),
      commission_percentage: z.number().min(0).max(100),
    }).parse(req.body);

    db.prepare(
      'INSERT INTO services (name, description, base_price, commission_percentage) VALUES (?, ?, ?, ?)'
    ).run(data.name, data.description || '', data.base_price, data.commission_percentage);

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create service:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid service data', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create service' });
  }
});

// DELETE /api/services/:id
router.delete('/:id', (req, res) => {
  try {
    const history = db.prepare('SELECT COUNT(*) as count FROM services_history WHERE service_id = ?').get(req.params.id) as { count: number };
    if (history.count > 0) {
      return res.status(400).json({ error: 'Cannot delete service with history' });
    }

    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete service:', error);
    return res.status(500).json({ error: 'Failed to delete service' });
  }
});

// GET /api/services/:id/history
router.get('/:id/history', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const history = db.prepare(
      `SELECT sh.*, c.name as contractor_name
       FROM services_history sh
       LEFT JOIN contractors c ON sh.contractor_id = c.id
       WHERE sh.service_id = ?
       ORDER BY sh.date_performed DESC
       LIMIT ? OFFSET ?`
    ).all(req.params.id, limit, offset);

    const total = db.prepare(
      'SELECT COUNT(*) as count FROM services_history WHERE service_id = ?'
    ).get(req.params.id) as { count: number };

    return res.json({ history, total: total.count });
  } catch (error) {
    console.error('Failed to fetch service history:', error);
    return res.status(500).json({ error: 'Failed to fetch service history' });
  }
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add server/routes/services.ts
git commit -m "feat: add service Express routes"
```

---

### Task 7: Sales routes

**Files:**
- Create: `server/routes/sales.ts`

- [ ] **Step 1: Create server/routes/sales.ts**

```typescript
import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/sales
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const sales = db.prepare(
      `SELECT
        s.id, s.date_sold,
        COALESCE(p.name, srv.name) as item_name,
        CASE WHEN p.id IS NOT NULL THEN 'Product' ELSE 'Service' END as type,
        s.quantity, s.total_value, s.net_profit
       FROM sales_history s
       LEFT JOIN products p ON s.product_id = p.id
       LEFT JOIN services srv ON s.service_id = srv.id
       ORDER BY s.date_sold DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM sales_history').get() as { count: number };
    return res.json({ sales, total: total.count });
  } catch (error) {
    console.error('Failed to fetch sales:', error);
    return res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// POST /api/sales
router.post('/', (req, res) => {
  try {
    const { products, services } = req.body;
    const contractorId = services.find((s: any) => s.contractorId)?.contractorId;

    db.transaction(() => {
      let totalContractorEarnings = 0;

      for (const item of products) {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId) as any;
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.quantity < item.quantity) throw new Error(`Insufficient stock for product: ${product.name}`);

        let contractorEarnings = 0;
        if (contractorId && product.commissionPercentage > 0) {
          contractorEarnings = product.outboundPrice * item.quantity * (product.commissionPercentage / 100);
          totalContractorEarnings += contractorEarnings;
        }

        db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?').run(item.quantity, item.productId);

        db.prepare(
          `INSERT INTO sales_history (product_id, quantity, inbound_price_per_unit, outbound_price_per_unit, total_value, net_profit, contractor_id, contractor_earnings, date_sold)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(
          item.productId, item.quantity, product.inboundPrice, product.outboundPrice,
          product.outboundPrice * item.quantity,
          (product.outboundPrice - product.inboundPrice) * item.quantity,
          contractorId, contractorEarnings
        );
      }

      for (const item of services) {
        const service = db.prepare('SELECT * FROM services WHERE id = ?').get(item.serviceId) as any;
        if (!service) throw new Error(`Service not found: ${item.serviceId}`);

        const totalValue = service.base_price;
        let businessEarnings = totalValue;
        let contractorEarnings = 0;

        if (item.contractorId) {
          const contractor = db.prepare('SELECT location_fee_percentage FROM contractors WHERE id = ?').get(item.contractorId) as any;
          if (contractor) {
            const locationFee = totalValue * (contractor.location_fee_percentage / 100);
            contractorEarnings = totalValue - locationFee;
            businessEarnings = locationFee;
            totalContractorEarnings += contractorEarnings;
          }
        }

        db.prepare(
          `INSERT INTO sales_history (service_id, contractor_id, total_value, net_profit, contractor_earnings, date_sold)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(item.serviceId, item.contractorId || null, totalValue, businessEarnings, contractorEarnings);

        db.prepare(
          `INSERT INTO services_history (service_id, contractor_id, price_charged, business_earnings, contractor_earnings, date_performed)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(item.serviceId, item.contractorId || null, totalValue, businessEarnings, contractorEarnings);
      }

      if (contractorId && totalContractorEarnings > 0) {
        db.prepare('UPDATE contractors SET accumulated_commission = accumulated_commission + ? WHERE id = ?')
          .run(totalContractorEarnings, contractorId);
      }
    })();

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create sale:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/sales/products
router.get('/products', (_req, res) => {
  try {
    const products = db.prepare(
      `SELECT DISTINCT p.id, p.name
       FROM products p
       INNER JOIN sales_history sh ON p.id = sh.product_id
       ORDER BY p.name`
    ).all();
    return res.json(products);
  } catch (error) {
    console.error('Failed to fetch sold products:', error);
    return res.status(500).json({ error: 'Failed to fetch sold products' });
  }
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add server/routes/sales.ts
git commit -m "feat: add sales Express routes with transaction support"
```

---

### Task 8: Employee routes

**Files:**
- Create: `server/routes/employees.ts`

- [ ] **Step 1: Create server/routes/employees.ts**

Migrate GET, POST from `app/api/employees/route.ts` and PATCH, DELETE from `app/api/employees/[id]/route.ts`:

```typescript
import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/employees
router.get('/', (_req, res) => {
  try {
    const employees = db.prepare(
      `SELECT e.*, c.name as contractor_name, c.id as contractor_id
       FROM employees e
       LEFT JOIN contractors c ON e.contractor_id = c.id
       ORDER BY e.name`
    ).all();
    return res.json(employees);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST /api/employees
router.post('/', (req, res) => {
  try {
    const { name, position, salary } = req.body;

    db.transaction(() => {
      // Create contractor with 100% location fee
      const contractorResult = db.prepare(
        'INSERT INTO contractors (name, location_fee_percentage, isActive) VALUES (?, 100, 1)'
      ).run(name);

      db.prepare(
        'INSERT INTO employees (name, position, salary, contractor_id, is_active) VALUES (?, ?, ?, ?, 1)'
      ).run(name, position, salary || 0, contractorResult.lastInsertRowid);
    })();

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create employee:', error);
    return res.status(500).json({ error: 'Failed to create employee' });
  }
});

// GET /api/employees/:id
router.get('/:id', (req, res) => {
  try {
    const employee = db.prepare(
      `SELECT e.*, c.name as contractor_name
       FROM employees e
       LEFT JOIN contractors c ON e.contractor_id = c.id
       WHERE e.id = ?`
    ).get(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    return res.json(employee);
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    return res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// PATCH /api/employees/:id
router.patch('/:id', (req, res) => {
  try {
    const { name, position, salary, is_active } = req.body;

    if (is_active === 0) {
      const pendingPayments = db.prepare(
        `SELECT COUNT(*) as count FROM employee_payments
         WHERE employee_id = ? AND payment_date > datetime('now', '-30 days')`
      ).get(req.params.id) as { count: number };

      if (pendingPayments.count > 0) {
        return res.status(400).json({ error: 'Cannot deactivate employee with recent payments' });
      }
    }

    db.prepare(
      'UPDATE employees SET name = ?, position = ?, salary = ?, is_active = ? WHERE id = ?'
    ).run(name, position, salary, is_active, req.params.id);

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update employee:', error);
    return res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', (req, res) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id) as any;
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    db.transaction(() => {
      if (employee.contractor_id) {
        db.prepare('DELETE FROM contractors WHERE id = ?').run(employee.contractor_id);
      }
      db.prepare('DELETE FROM users WHERE employee_id = ?').run(req.params.id);
      db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
    })();

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete employee:', error);
    return res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add server/routes/employees.ts
git commit -m "feat: add employee Express routes"
```

---

### Task 9: Contractor routes

**Files:**
- Create: `server/routes/contractors.ts`

- [ ] **Step 1: Create server/routes/contractors.ts**

```typescript
import { Router } from 'express';
import { z } from 'zod';
import db from '../db';

const router = Router();

// GET /api/contractors
router.get('/', (_req, res) => {
  try {
    const contractors = db.prepare('SELECT * FROM contractors ORDER BY name').all();
    return res.json(contractors);
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
    return res.status(500).json({ error: 'Failed to fetch contractors' });
  }
});

// POST /api/contractors
router.post('/', (req, res) => {
  try {
    const { name, location_fee_percentage } = req.body;

    const existing = db.prepare('SELECT id FROM contractors WHERE name = ?').get(name);
    if (existing) return res.status(400).json({ error: 'Contractor name already exists' });

    db.prepare(
      'INSERT INTO contractors (name, location_fee_percentage, isActive) VALUES (?, ?, 1)'
    ).run(name, location_fee_percentage);

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create contractor:', error);
    return res.status(500).json({ error: 'Failed to create contractor' });
  }
});

// GET /api/contractors/:id
router.get('/:id', (req, res) => {
  try {
    const contractor = db.prepare('SELECT * FROM contractors WHERE id = ?').get(req.params.id);
    if (!contractor) return res.status(404).json({ error: 'Contractor not found' });
    return res.json(contractor);
  } catch (error) {
    console.error('Failed to fetch contractor:', error);
    return res.status(500).json({ error: 'Failed to fetch contractor' });
  }
});

// PATCH /api/contractors/:id
router.patch('/:id', (req, res) => {
  try {
    const { location_fee_percentage } = req.body;
    db.prepare('UPDATE contractors SET location_fee_percentage = ? WHERE id = ?')
      .run(location_fee_percentage, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update contractor:', error);
    return res.status(500).json({ error: 'Failed to update contractor' });
  }
});

// DELETE /api/contractors/:id
router.delete('/:id', (req, res) => {
  try {
    const hasServices = db.prepare(
      'SELECT COUNT(*) as count FROM services_history WHERE contractor_id = ?'
    ).get(req.params.id) as { count: number };

    const hasSales = db.prepare(
      'SELECT COUNT(*) as count FROM sales_history WHERE contractor_id = ?'
    ).get(req.params.id) as { count: number };

    if (hasServices.count > 0 || hasSales.count > 0) {
      return res.status(400).json({ error: 'Cannot delete contractor with history' });
    }

    db.prepare('DELETE FROM contractors WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete contractor:', error);
    return res.status(500).json({ error: 'Failed to delete contractor' });
  }
});

// GET /api/contractors/:id/earnings
router.get('/:id/earnings', (req, res) => {
  try {
    const serviceEarnings = db.prepare(
      'SELECT COALESCE(SUM(contractor_earnings), 0) as total FROM services_history WHERE contractor_id = ?'
    ).get(req.params.id) as { total: number };

    const productEarnings = db.prepare(
      'SELECT COALESCE(SUM(contractor_earnings), 0) as total FROM sales_history WHERE contractor_id = ? AND product_id IS NOT NULL'
    ).get(req.params.id) as { total: number };

    return res.json({
      serviceEarnings: serviceEarnings.total,
      productEarnings: productEarnings.total,
      totalEarnings: serviceEarnings.total + productEarnings.total,
    });
  } catch (error) {
    console.error('Failed to fetch contractor earnings:', error);
    return res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// GET /api/contractors/:id/services
router.get('/:id/services', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const services = db.prepare(
      `SELECT sh.*, s.name as service_name
       FROM services_history sh
       JOIN services s ON sh.service_id = s.id
       WHERE sh.contractor_id = ?
       ORDER BY sh.date_performed DESC
       LIMIT ? OFFSET ?`
    ).all(req.params.id, limit, offset);

    const total = db.prepare(
      'SELECT COUNT(*) as count FROM services_history WHERE contractor_id = ?'
    ).get(req.params.id) as { count: number };

    return res.json({ services, total: total.count });
  } catch (error) {
    console.error('Failed to fetch contractor services:', error);
    return res.status(500).json({ error: 'Failed to fetch contractor services' });
  }
});

// GET /api/contractors/:id/unpaid-sales
router.get('/:id/unpaid-sales', (req, res) => {
  try {
    const unpaidServices = db.prepare(
      `SELECT sh.id, s.name, sh.contractor_earnings, sh.business_earnings, sh.date_performed, 'service' as type
       FROM services_history sh
       JOIN services s ON sh.service_id = s.id
       WHERE sh.contractor_id = ?
       AND sh.id NOT IN (SELECT sale_id FROM contractor_payments WHERE contractor_id = ?)
       ORDER BY sh.date_performed DESC`
    ).all(req.params.id, req.params.id);

    const unpaidProducts = db.prepare(
      `SELECT sh.id, p.name, sh.contractor_earnings, sh.total_value as business_earnings, sh.date_sold as date_performed, 'product' as type
       FROM sales_history sh
       JOIN products p ON sh.product_id = p.id
       WHERE sh.contractor_id = ?
       AND sh.contractor_earnings > 0
       AND sh.id NOT IN (SELECT sale_id FROM contractor_payments WHERE contractor_id = ?)
       ORDER BY sh.date_sold DESC`
    ).all(req.params.id, req.params.id);

    return res.json([...unpaidServices, ...unpaidProducts]);
  } catch (error) {
    console.error('Failed to fetch unpaid sales:', error);
    return res.status(500).json({ error: 'Failed to fetch unpaid sales' });
  }
});

// PATCH /api/contractors/:id/status
router.patch('/:id/status', (req, res) => {
  try {
    const { isActive } = z.object({ isActive: z.number() }).parse(req.body);
    db.prepare('UPDATE contractors SET isActive = ? WHERE id = ?').run(isActive, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update contractor status:', error);
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add server/routes/contractors.ts
git commit -m "feat: add contractor Express routes with earnings and unpaid sales"
```

---

### Task 10: Payment, appointment, settings, metrics, backup, user, inventory routes

**Files:**
- Create: `server/routes/payments.ts`
- Create: `server/routes/appointments.ts`
- Create: `server/routes/settings.ts`
- Create: `server/routes/metrics.ts`
- Create: `server/routes/backup.ts`
- Create: `server/routes/users.ts`
- Create: `server/routes/inventory.ts`

- [ ] **Step 1: Create server/routes/payments.ts**

```typescript
import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/payments/employee
router.get('/employee', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const payments = db.prepare(
      `SELECT ep.*, e.name as employee_name
       FROM employee_payments ep
       JOIN employees e ON ep.employee_id = e.id
       ORDER BY ep.payment_date DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM employee_payments').get() as { count: number };
    return res.json({ payments, total: total.count });
  } catch (error) {
    console.error('Failed to fetch employee payments:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST /api/payments/employee
router.post('/employee', (req, res) => {
  try {
    const { employee_id, payment_amount, payment_period_start, payment_period_end, notes } = req.body;

    db.prepare(
      `INSERT INTO employee_payments (employee_id, payment_amount, payment_period_start, payment_period_end, notes)
       VALUES (?, ?, ?, ?, ?)`
    ).run(employee_id, payment_amount, payment_period_start, payment_period_end, notes || '');

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create employee payment:', error);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

// GET /api/payments/contractor
router.get('/contractor', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const payments = db.prepare(
      `SELECT cp.*, c.name as contractor_name,
       COALESCE(p.name, s.name) as item_name
       FROM contractor_payments cp
       JOIN contractors c ON cp.contractor_id = c.id
       JOIN sales_history sh ON cp.sale_id = sh.id
       LEFT JOIN products p ON sh.product_id = p.id
       LEFT JOIN services s ON sh.service_id = s.id
       ORDER BY cp.payment_date DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM contractor_payments').get() as { count: number };
    return res.json({ payments, total: total.count });
  } catch (error) {
    console.error('Failed to fetch contractor payments:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST /api/payments/contractor
router.post('/contractor', (req, res) => {
  try {
    const { contractor_id, sales } = req.body;

    db.transaction(() => {
      for (const sale of sales) {
        db.prepare(
          `INSERT INTO contractor_payments (contractor_id, sale_id, contractor_earnings, business_earnings, payment_date)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).run(contractor_id, sale.id, sale.contractor_earnings, sale.business_earnings);
      }

      db.prepare('UPDATE contractors SET accumulated_commission = 0 WHERE id = ?').run(contractor_id);
    })();

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create contractor payment:', error);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

export default router;
```

- [ ] **Step 2: Create server/routes/appointments.ts**

```typescript
import { Router } from 'express';
import db from '../db';
import { verifyTokenFromCookie } from '../middleware/auth';

const router = Router();

// GET /api/appointments
router.get('/', (req, res) => {
  try {
    const { start, end, contractor_id, employee_id } = req.query;
    let query = `SELECT a.*, u.username as created_by_name,
                 c.name as contractor_name, e.name as employee_name,
                 s.name as service_name
                 FROM appointments a
                 LEFT JOIN users u ON a.created_by = u.id
                 LEFT JOIN contractors c ON a.contractor_id = c.id
                 LEFT JOIN employees e ON a.employee_id = e.id
                 LEFT JOIN services s ON a.service_id = s.id WHERE 1=1`;
    const params: any[] = [];

    if (start && end) {
      query += ' AND a.start_time >= ? AND a.end_time <= ?';
      params.push(start, end);
    }
    if (contractor_id) {
      query += ' AND a.contractor_id = ?';
      params.push(contractor_id);
    }
    if (employee_id) {
      query += ' AND a.employee_id = ?';
      params.push(employee_id);
    }

    query += ' ORDER BY a.start_time ASC';
    const appointments = db.prepare(query).all(...params);
    return res.json(appointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST /api/appointments
router.post('/', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = await verifyTokenFromCookie(token);

    const { title, start_time, end_time, notes, contractor_id, employee_id, client_name, service_id } = req.body;

    // Check for overlapping appointments
    const overlap = db.prepare(
      `SELECT COUNT(*) as count FROM appointments
       WHERE ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))
       AND (contractor_id = ? OR employee_id = ?)`
    ).get(end_time, start_time, end_time, start_time, contractor_id || -1, employee_id || -1) as { count: number };

    if (overlap.count > 0) {
      return res.status(400).json({ error: 'Time slot overlaps with existing appointment' });
    }

    db.prepare(
      `INSERT INTO appointments (title, start_time, end_time, notes, created_by, contractor_id, employee_id, client_name, service_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(title, start_time, end_time, notes || '', payload.userId, contractor_id || null, employee_id || null, client_name || '', service_id || null);

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PATCH /api/appointments/:id
router.patch('/:id', (req, res) => {
  try {
    const { title, start_time, end_time, notes, contractor_id, employee_id, client_name, service_id } = req.body;
    db.prepare(
      `UPDATE appointments SET title = ?, start_time = ?, end_time = ?, notes = ?,
       contractor_id = ?, employee_id = ?, client_name = ?, service_id = ? WHERE id = ?`
    ).run(title, start_time, end_time, notes || '', contractor_id || null, employee_id || null, client_name || '', service_id || null, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete appointment:', error);
    return res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
```

- [ ] **Step 3: Create server/routes/settings.ts**

```typescript
import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/settings/business
router.get('/business', (_req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM business_settings WHERE id = 1').get();
    return res.json(settings || {});
  } catch (error) {
    console.error('Failed to fetch business settings:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings/business
router.put('/business', (req, res) => {
  try {
    const { name, address, phone, email, taxId, defaultCommission, defaultLocationFee, notes } = req.body;

    db.prepare(
      `INSERT INTO business_settings (id, name, address, phone, email, taxId, defaultCommission, defaultLocationFee, notes)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
       name = ?, address = ?, phone = ?, email = ?, taxId = ?, defaultCommission = ?, defaultLocationFee = ?, notes = ?`
    ).run(
      name || '', address || '', phone || '', email || '', taxId || '', defaultCommission || 0, defaultLocationFee || 0, notes || '',
      name || '', address || '', phone || '', email || '', taxId || '', defaultCommission || 0, defaultLocationFee || 0, notes || ''
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update business settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// GET /api/settings/system
router.get('/system', (_req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();
    return res.json(settings || { theme: 'system', language: 'es' });
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings/system
router.put('/system', (req, res) => {
  try {
    const { theme, language } = req.body;
    db.prepare('UPDATE system_settings SET theme = ?, language = ? WHERE id = 1').run(theme, language);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update system settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
```

- [ ] **Step 4: Create server/routes/metrics.ts**

```typescript
import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/metrics
router.get('/', (_req, res) => {
  try {
    const inventory = db.prepare(
      `SELECT SUM(quantity * inboundPrice) as inventoryValue,
              SUM(quantity * outboundPrice) as potentialValue
       FROM products`
    ).get() as any;

    const sales = db.prepare(
      'SELECT SUM(total_value) as totalSales, SUM(net_profit) as netProfit FROM sales_history'
    ).get() as any;

    const returns = db.prepare(
      'SELECT SUM(quantity * return_amount) as totalReturns FROM returns_history'
    ).get() as any;

    return res.json({
      inventoryValue: inventory.inventoryValue || 0,
      potentialValue: inventory.potentialValue || 0,
      totalSales: sales.totalSales || 0,
      netProfit: sales.netProfit || 0,
      totalReturns: returns.totalReturns || 0,
    });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
```

- [ ] **Step 5: Create server/routes/backup.ts**

```typescript
import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import db from '../db';

const router = Router();
const upload = multer({ dest: 'temp/' });

// POST /api/backup (download backup)
router.post('/', (_req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);
    const dbPath = path.join(process.cwd(), 'warehouse.db');
    fs.copyFileSync(dbPath, backupPath);

    const backupData = fs.readFileSync(backupPath);
    fs.unlinkSync(backupPath);
    if (fs.readdirSync(backupDir).length === 0) fs.rmdirSync(backupDir);

    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${timestamp}.sqlite"`);
    return res.send(backupData);
  } catch (error) {
    console.error('Failed to create backup:', error);
    return res.status(500).json({ error: 'Failed to create backup' });
  }
});

// POST /api/backup/restore
router.post('/restore', upload.single('backup'), (req, res) => {
  const tempPath = req.file?.path;
  try {
    if (!req.file || !req.file.originalname.endsWith('.sqlite')) {
      if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return res.status(400).json({ error: 'Invalid file format. Only .sqlite files are allowed' });
    }

    // Verify backup is valid SQLite
    const tempDb = new Database(tempPath!);
    const tables = tempDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];

    const requiredTables = [
      'users', 'employees', 'employee_payments', 'products', 'receiving_history',
      'sales_history', 'returns_history', 'contractors', 'services', 'services_history',
      'contractor_payments', 'business_settings', 'system_settings',
    ];

    const missing = requiredTables.filter((t) => !tables.find((row) => row.name === t));
    if (missing.length > 0) {
      tempDb.close();
      throw new Error(`Invalid backup file: Missing tables: ${missing.join(', ')}`);
    }

    tempDb.close();
    db.close();

    const dbPath = path.join(process.cwd(), 'warehouse.db');
    fs.copyFileSync(tempPath!, dbPath);

    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    return res.json({ success: true });
  } catch (error) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error('Failed to restore backup:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to restore backup' });
  }
});

export default router;
```

- [ ] **Step 6: Create server/routes/users.ts**

```typescript
import { Router } from 'express';
import db from '../db';
import { hashPassword } from '../middleware/auth';

const router = Router();

// GET /api/users
router.get('/', (_req, res) => {
  try {
    const users = db.prepare(
      `SELECT u.id, u.username, u.role, u.isActive, u.lastLogin, u.employee_id, e.name as employee_name
       FROM users u
       LEFT JOIN employees e ON u.employee_id = e.id
       WHERE u.role != 'superadmin'
       ORDER BY u.username`
    ).all();
    return res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { username, password, role, employee_name, employee_position, employee_salary } = req.body;

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await hashPassword(password);

    db.transaction(() => {
      // Create contractor
      const contractorResult = db.prepare(
        'INSERT INTO contractors (name, location_fee_percentage, isActive) VALUES (?, 100, 1)'
      ).run(employee_name);

      // Create employee
      const employeeResult = db.prepare(
        'INSERT INTO employees (name, position, salary, contractor_id, is_active) VALUES (?, ?, ?, ?, 1)'
      ).run(employee_name, employee_position || 'General', employee_salary || 0, contractorResult.lastInsertRowid);

      // Create user
      db.prepare(
        'INSERT INTO users (username, password, role, isActive, employee_id) VALUES (?, ?, ?, 1, ?)'
      ).run(username, hashedPassword, role, employeeResult.lastInsertRowid);
    })();

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to create user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot delete superadmin' });

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PATCH /api/users/:id/status
router.patch('/:id/status', (req, res) => {
  try {
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot modify superadmin' });

    const { isActive } = req.body;
    db.prepare('UPDATE users SET isActive = ? WHERE id = ?').run(isActive, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update user status:', error);
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
```

- [ ] **Step 7: Create server/routes/inventory.ts**

```typescript
import { Router } from 'express';
import db from '../db';

const router = Router();

// GET /api/inventory
router.get('/', (req, res) => {
  try {
    const search = req.query.search as string || '';
    const sortBy = req.query.sortBy as string || 'name';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const sortColumns: Record<string, string> = {
      name: 'name',
      sku: 'sku',
      quantity: 'quantity',
      lastUpdated: 'lastUpdated',
    };
    const sortCol = sortColumns[sortBy] || 'name';

    let query = 'SELECT * FROM products';
    const params: any[] = [];

    if (search) {
      query += ' WHERE name LIKE ? OR sku LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY ${sortCol} ${sortBy === 'quantity' ? 'DESC' : 'ASC'} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const products = db.prepare(query).all(...params);

    let countQuery = 'SELECT COUNT(*) as count FROM products';
    const countParams: any[] = [];
    if (search) {
      countQuery += ' WHERE name LIKE ? OR sku LIKE ?';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const total = db.prepare(countQuery).get(...countParams) as { count: number };

    return res.json({ products, total: total.count });
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// POST /api/receive
router.post('/receive', (req, res) => {
  try {
    const { product_id, quantity, price_per_unit } = req.body;

    db.transaction(() => {
      db.prepare(
        'INSERT INTO receiving_history (product_id, quantity, price_per_unit) VALUES (?, ?, ?)'
      ).run(product_id, quantity, price_per_unit);

      db.prepare(
        'UPDATE products SET quantity = quantity + ?, inboundPrice = ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(quantity, price_per_unit, product_id);
    })();

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to receive product:', error);
    return res.status(500).json({ error: 'Failed to receive product' });
  }
});

// GET /api/inventory/receive-history (mapped from GET /api/receive)
router.get('/receive-history', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const history = db.prepare(
      `SELECT rh.*, p.name as product_name, p.sku
       FROM receiving_history rh
       JOIN products p ON rh.product_id = p.id
       ORDER BY rh.date_received DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM receiving_history').get() as { count: number };
    return res.json({ history, total: total.count });
  } catch (error) {
    console.error('Failed to fetch receive history:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/inventory/returns (mapped from POST /api/returns)
router.post('/returns', (req, res) => {
  try {
    const { product_id, quantity, return_amount } = req.body;

    db.transaction(() => {
      db.prepare(
        'INSERT INTO returns_history (product_id, quantity, return_amount) VALUES (?, ?, ?)'
      ).run(product_id, quantity, return_amount);

      db.prepare(
        'UPDATE products SET quantity = quantity + ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(quantity, product_id);
    })();

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to process return:', error);
    return res.status(500).json({ error: 'Failed to process return' });
  }
});

// GET /api/inventory/return-history (mapped from GET /api/returns)
router.get('/return-history', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const history = db.prepare(
      `SELECT rh.*, p.name as product_name
       FROM returns_history rh
       JOIN products p ON rh.product_id = p.id
       ORDER BY rh.date_returned DESC
       LIMIT ? OFFSET ?`
    ).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM returns_history').get() as { count: number };
    return res.json({ history, total: total.count });
  } catch (error) {
    console.error('Failed to fetch return history:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
```

- [ ] **Step 8: Commit all remaining routes**

```bash
git add server/routes/
git commit -m "feat: add all remaining Express routes (payments, appointments, settings, metrics, backup, users, inventory)"
```

---

## Phase 3: React Frontend Migration

### Task 11: Copy existing components, hooks, i18n, and styles

**Files:**
- Copy: `components/` → `src/components/`
- Copy: `hooks/` → `src/hooks/`
- Copy: `lib/i18n/` → `src/lib/i18n/`
- Copy: `lib/utils.ts` → `src/lib/utils.ts`
- Copy: `lib/utils/` → `src/lib/utils/`
- Copy: `app/globals.css` → `src/globals.css`
- Copy: `tailwind.config.ts` → `tailwind.config.ts` (update content paths)
- Copy: `postcss.config.js` → `postcss.config.js`
- Copy: `components.json` → `components.json` (update paths)

- [ ] **Step 1: Copy files**

```bash
mkdir -p src/components src/hooks src/lib/i18n src/lib/utils
cp -r components/* src/components/
cp -r hooks/* src/hooks/
cp -r lib/i18n/* src/lib/i18n/
cp lib/utils.ts src/lib/utils.ts
cp -r lib/utils/* src/lib/utils/
cp app/globals.css src/globals.css
```

- [ ] **Step 2: Update tailwind.config.ts content paths**

Change the `content` array to:

```typescript
content: [
  "./src/**/*.{ts,tsx}",
],
```

- [ ] **Step 3: Update components.json aliases**

Update paths from `@/components` to point to `src/components`, etc. The `@` alias already resolves to `src/` via vite.config.ts.

- [ ] **Step 4: Remove next-themes dependency from language-provider and use-translations**

The `LanguageProvider` uses `useQuery` which stays the same. The `ThemeProvider` was from `next-themes` — replace with a simple React context-based theme provider or keep `next-themes` (it works outside Next.js too).

- [ ] **Step 5: Commit**

```bash
git add src/components/ src/hooks/ src/lib/ src/globals.css tailwind.config.ts postcss.config.js components.json
git commit -m "feat: copy existing components, hooks, i18n, and styles to src/"
```

---

### Task 12: React Router setup + Providers + App shell

**Files:**
- Modify: `src/App.tsx`
- Create: `src/providers.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create src/providers.tsx**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/lib/i18n/language-provider';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Create src/App.tsx with React Router**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from './providers';
import { Toaster } from 'sonner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Setup from './pages/Setup';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Receive from './pages/Receive';
import Returns from './pages/Returns';
import Services from './pages/Services';
import Schedule from './pages/Schedule';
import Contractors from './pages/Contractors';
import Employees from './pages/Employees';
import Payments from './pages/Payments';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="receive" element={<Receive />} />
            <Route path="returns" element={<Returns />} />
            <Route path="services" element={<Services />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="contractors" element={<Contractors />} />
            <Route path="employees" element={<Employees />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" closeButton />
    </Providers>
  );
}
```

- [ ] **Step 3: Update src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/providers.tsx src/main.tsx
git commit -m "feat: add React Router setup with all routes and providers"
```

---

### Task 13: Migrate page components (Next.js → React Router)

**Files:**
- Create: `src/pages/Home.tsx`
- Create: `src/pages/Login.tsx`
- Create: `src/pages/Setup.tsx`
- Create: `src/pages/DashboardLayout.tsx`
- Create: `src/pages/Dashboard.tsx`
- Create: `src/pages/Inventory.tsx`
- Create: `src/pages/Receive.tsx`
- Create: `src/pages/Returns.tsx`
- Create: `src/pages/Services.tsx`
- Create: `src/pages/Schedule.tsx`
- Create: `src/pages/Contractors.tsx`
- Create: `src/pages/Employees.tsx`
- Create: `src/pages/Payments.tsx`
- Create: `src/pages/Settings.tsx`

The migration pattern for all pages is:
1. Remove `"use client"` directive (not needed in Vite)
2. Replace `import { useRouter } from 'next/navigation'` → `import { useNavigate } from 'react-router-dom'`
3. Replace `router.push('/path')` → `navigate('/path')`
4. Replace `import Link from 'next/link'` → `import { Link } from 'react-router-dom'`
5. Replace `usePathname()` → `useLocation().pathname`
6. In DashboardLayout: replace `{children}` → `<Outlet />`

- [ ] **Step 1: Create src/pages/Home.tsx**

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['checkSetup'],
    queryFn: async () => {
      const response = await fetch('/api/check-setup');
      if (!response.ok) throw new Error('Failed to check setup status');
      return response.json();
    },
  });

  useEffect(() => {
    if (!isLoading) {
      if (isError || (data && data.isFirstRun)) {
        navigate('/setup');
      } else {
        navigate('/login');
      }
    }
  }, [data, isLoading, isError, navigate]);

  return null;
}
```

- [ ] **Step 2: Create src/pages/Login.tsx**

Copy from `app/login/page.tsx` with these changes:
- Remove `"use client"`
- `import { useNavigate } from 'react-router-dom'` instead of `useRouter`
- `const navigate = useNavigate()` instead of `const router = useRouter()`
- `navigate('/dashboard')` instead of `router.push('/dashboard')`

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputWithEye } from '@/components/ui/input-with-eye';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.error === 'inactiveUserError') throw new Error(t('inactiveUserError'));
        throw new Error(t('error'));
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Package className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('signIn')} El Cofre
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('username')}
              </label>
              <div className="mt-1">
                <input id="username" name="username" type="text" required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
            <InputWithEye id="password" name="password" required label={t('password')} />
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('signingIn') : t('signIn')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create src/pages/Setup.tsx**

Same migration pattern as Login — swap Next.js router for React Router. Copy from `app/setup/page.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { InputWithEye } from '@/components/ui/input-with-eye';
import { Button } from '@/components/ui/button';
import { Warehouse } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';

export default function Setup() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [error, setError] = useState('');

  const { data: setupCheck, isLoading: checkingSetup } = useQuery({
    queryKey: ['checkSetup'],
    queryFn: async () => {
      const response = await fetch('/api/check-setup');
      if (!response.ok) throw new Error('Failed to check setup status');
      return response.json();
    },
  });

  useEffect(() => {
    if (!checkingSetup && setupCheck && !setupCheck.isFirstRun) {
      navigate('/login', { replace: true });
    }
  }, [setupCheck, checkingSetup, navigate]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('error'));
      }
      return response.json();
    },
    onSuccess: () => navigate('/login'),
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    mutate({ username, password });
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center">
        <div className="text-center">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center"><Warehouse className="h-12 w-12 text-blue-600" /></div>
        <div className="flex items-center justify-center mt-6">
          <h2 className="text-center text-3xl font-extrabold text-pink-500">EL</h2>
          <h2 className="text-center text-3xl font-extrabold text-blue-500">COFRE</h2>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('username')}</label>
              <div className="mt-1">
                <input id="username" name="username" type="text" required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
            <InputWithEye id="password" name="password" required label={t('password')} />
            <InputWithEye id="confirmPassword" name="confirmPassword" required label={t('confirmPassword')} />
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t('creating') : t('createAccount')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create src/pages/DashboardLayout.tsx**

Key change: replace `{children}` with `<Outlet />` from React Router, and swap `Link`/`usePathname` for React Router equivalents:

```tsx
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PackageSearch, PackagePlus, RotateCcw, Settings, Wallet,
  Wrench, Users, Briefcase, ChevronLeft, ChevronRight, LogOut, CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from '@/lib/i18n/use-translations';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function NavItem({ href, icon, label, isCollapsed }: { href: string; icon: React.ReactNode; label: string; isCollapsed: boolean }) {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  return (
    <Link to={href}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white dark:text-gray-400 dark:hover:text-gray-50',
        isActive ? 'bg-slate-700 text-white' : '',
        isCollapsed ? 'justify-center' : ''
      )}>
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { t } = useTranslations();
  const navigate = useNavigate();

  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: t('dashboard') },
    isAdmin && { href: '/dashboard/receive', icon: <PackagePlus className="h-5 w-5" />, label: t('receive') },
    { href: '/dashboard/inventory', icon: <PackageSearch className="h-5 w-5" />, label: t('inventory') },
    { href: '/dashboard/returns', icon: <RotateCcw className="h-5 w-5" />, label: t('returns') },
    { href: '/dashboard/services', icon: <Wrench className="h-5 w-5" />, label: t('services') },
    { href: '/dashboard/schedule', icon: <CalendarDays className="h-5 w-5" />, label: t('schedule') },
    isAdmin && { href: '/dashboard/contractors', icon: <Briefcase className="h-5 w-5" />, label: t('contractors') },
    isAdmin && { href: '/dashboard/employees', icon: <Users className="h-5 w-5" />, label: t('employees') },
    isAdmin && { href: '/dashboard/payments', icon: <Wallet className="h-5 w-5" />, label: t('payments') },
    isAdmin && { href: '/dashboard/settings', icon: <Settings className="h-5 w-5" />, label: t('settings') },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[];

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className={cn('flex flex-col border-r bg-slate-800 text-white transition-all duration-300', isCollapsed ? 'w-16' : 'w-64')}>
        <div className="flex h-14 items-center border-b border-slate-700 px-3 justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <h2 className="text-lg font-bold text-pink-500">EL</h2>
              <h2 className="text-lg font-bold text-blue-300">COFRE</h2>
            </div>
          )}
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} isCollapsed={isCollapsed} />
          ))}
        </nav>
        <div className="border-t border-slate-700 p-2">
          <Button variant="ghost" className={cn('w-full justify-start gap-2 text-white hover:bg-slate-700', isCollapsed && 'justify-center')} onClick={() => setIsLogoutDialogOpen(true)}>
            <LogOut className="h-5 w-4" />
            {!isCollapsed && <span>{t('logout')}</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmLogout')}</AlertDialogTitle>
            <AlertDialogDescription>{t('logoutMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{t('logout')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

- [ ] **Step 5: Create remaining dashboard page components**

For each of these pages, the migration is mechanical — copy from `app/dashboard/<page>/page.tsx`, remove `"use client"`, and no router changes needed (they don't use Next.js routing internally):

- `src/pages/Dashboard.tsx` ← from `app/dashboard/page.tsx`
- `src/pages/Inventory.tsx` ← from `app/dashboard/inventory/page.tsx`
- `src/pages/Receive.tsx` ← from `app/dashboard/receive/page.tsx`
- `src/pages/Returns.tsx` ← from `app/dashboard/returns/page.tsx`
- `src/pages/Services.tsx` ← from `app/dashboard/services/page.tsx`
- `src/pages/Schedule.tsx` ← from `app/dashboard/schedule/page.tsx`
- `src/pages/Contractors.tsx` ← from `app/dashboard/contractors/page.tsx`
- `src/pages/Employees.tsx` ← from `app/dashboard/employees/page.tsx`
- `src/pages/Payments.tsx` ← from `app/dashboard/payments/page.tsx`
- `src/pages/Settings.tsx` ← from `app/dashboard/settings/page.tsx`

For each file: remove `"use client"` and change any `import { useRouter } from 'next/navigation'` to `import { useNavigate } from 'react-router-dom'`. Most of these pages don't use the router at all — they only render components.

- [ ] **Step 6: Commit**

```bash
git add src/pages/
git commit -m "feat: migrate all page components from Next.js to React Router"
```

---

### Task 14: Update useAuth hook and API URL references

**Files:**
- Modify: `src/hooks/use-auth.ts`

- [ ] **Step 1: Verify use-auth.ts works without Next.js**

The hook uses `useQuery` to fetch `/api/me` — this works as-is since we're proxying `/api` to Express in dev. No changes needed unless it imports from `next/`.

- [ ] **Step 2: Search for any remaining Next.js imports across src/**

```bash
grep -r "next/" src/ --include="*.tsx" --include="*.ts" | grep -v node_modules
```

Fix any found imports:
- `next/navigation` → `react-router-dom`
- `next/link` → `react-router-dom`
- `next/font/google` → use CSS `@import` for Inter font in `globals.css` instead

- [ ] **Step 3: Add Inter font to src/globals.css**

Add at the top of `src/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

Note: For offline use, bundle the Inter font files locally instead of using Google Fonts CDN. Download the woff2 files and use `@font-face` declarations.

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "fix: remove all Next.js imports, add Inter font locally"
```

---

## Phase 4: Electron Integration

### Task 15: Full Electron main process with Express server startup

**Files:**
- Modify: `electron/main.ts`

- [ ] **Step 1: Update electron/main.ts to start Express server**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add electron/main.ts
git commit -m "feat: integrate Express server startup into Electron main process"
```

---

### Task 16: Verify full dev workflow

- [ ] **Step 1: Start the frontend dev server**

```bash
npm run dev:frontend
```

Expected: Vite starts on http://localhost:5173

- [ ] **Step 2: In a second terminal, start Electron**

```bash
npm run dev:electron
```

Expected: Electron window opens, loads localhost:5173, Express API accessible via proxy

- [ ] **Step 3: Test the full flow**

1. Open http://localhost:5173 in browser
2. Should redirect to /setup (if fresh DB) or /login
3. Create an admin account or log in
4. Navigate through dashboard pages
5. Try creating a product, viewing inventory, etc.

- [ ] **Step 4: Fix any issues found and commit**

```bash
git add -A
git commit -m "fix: resolve integration issues from dev workflow testing"
```

---

### Task 17: Build and packaging verification

- [ ] **Step 1: Build the frontend**

```bash
npm run build
```

Expected: `dist/` folder with bundled React app. `dist-electron/` with compiled Electron + Express.

- [ ] **Step 2: Test production mode locally**

```bash
NODE_ENV=production npx electron .
```

Expected: Electron window opens, Express serves both API and static frontend on port 3847.

- [ ] **Step 3: Package for macOS (your dev machine)**

```bash
npm run package:mac
```

Expected: `release/` directory with `.dmg` file.

- [ ] **Step 4: Package for Windows**

```bash
npm run package:win
```

Expected: `release/` directory with `.exe` installer. (Cross-compilation from macOS may require Wine or a CI setup — note if it fails.)

- [ ] **Step 5: Commit any build config fixes**

```bash
git add -A
git commit -m "fix: finalize build and packaging configuration"
```

---

## Phase 5: Cleanup

### Task 18: Remove Next.js files and dependencies

- [ ] **Step 1: Remove old Next.js app directory and config**

```bash
rm -rf app/
rm middleware.ts
rm next.config.js
rm -rf .next/
```

- [ ] **Step 2: Remove old lib/ and hooks/ directories (now in src/)**

```bash
rm -rf lib/
rm -rf hooks/
rm -rf components/
```

- [ ] **Step 3: Update .gitignore**

Add:
```
dist/
dist-electron/
release/
temp/
*.dmg
*.exe
```

- [ ] **Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove Next.js files, update gitignore for Electron build"
```

---

## API Route Mapping Reference

For the engineer migrating frontend `fetch()` calls — if any API paths changed:

| Old Next.js Path | New Express Path | Notes |
|---|---|---|
| `POST /api/backup` | `POST /api/backup` | Same |
| `POST /api/backup/restore` | `POST /api/backup/restore` | Same |
| `GET /api/receive` | `GET /api/inventory/receive-history` | Path changed |
| `POST /api/receive` | `POST /api/inventory/receive` | Path changed |
| `GET /api/returns` | `GET /api/inventory/return-history` | Path changed |
| `POST /api/returns` | `POST /api/inventory/returns` | Path changed |
| All other routes | Same path | No changes |

**Important:** Update the corresponding frontend components (`receive-form.tsx`, `receive-history.tsx`, `return-form.tsx`, `return-history.tsx`) to use the new paths. Alternatively, keep the old paths by adding them as aliases in `server/index.ts`.
