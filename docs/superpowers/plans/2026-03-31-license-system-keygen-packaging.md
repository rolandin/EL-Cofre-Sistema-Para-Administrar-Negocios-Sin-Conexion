# License Key System + Key Generator CLI + Cleanup + Packaging

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add offline Ed25519 license key system to El Cofre, build the `cofre-keygen` CLI tool, clean up old Next.js files, and verify Electron packaging works.

**Architecture:** Machine hardware IDs are hashed into short codes. The keygen CLI signs license payloads with an Ed25519 private key. The app validates signatures with the embedded public key. License state lives in SQLite. Clock tampering is detected via monotonic `lastSeen` timestamps.

**Tech Stack:** Node.js `crypto` (Ed25519 via `crypto.sign`/`crypto.verify`), `systeminformation` (hardware IDs), `base32-encode`/`base32-decode`, `commander` (CLI), better-sqlite3

**Spec:** `docs/superpowers/specs/2026-03-31-electron-migration-license-system-design.md`

---

## File Structure

```
# New files (license system in app)
electron/license/machine-id.ts      — Generate machine code from hardware
electron/license/validator.ts        — Verify key signatures, decode payloads
electron/license/clock-guard.ts      — Detect clock tampering
server/routes/license.ts             — API endpoints for activation + status
src/pages/Activation.tsx             — License key entry UI
src/components/settings/license-settings.tsx — License tab in Settings

# New files (keygen CLI)
keygen/package.json                  — Standalone package with own deps
keygen/tsconfig.json                 — TypeScript config for keygen
keygen/src/index.ts                  — CLI entry (commander)
keygen/src/generate.ts               — Key generation + signing logic
keygen/src/init.ts                   — Ed25519 key pair generation

# Shared format (used by both keygen and validator)
shared/key-format.ts                 — Payload encoding/decoding + base32

# Modified files
server/db.ts                         — Add license_info + used_keys tables
electron/main.ts                     — Add license check before window load
src/App.tsx                          — Add /activation route
src/pages/Settings.tsx               — Add License tab
src/pages/DashboardLayout.tsx        — Add license expiry warning banner
electron-builder.yml                 — Exclude keygen/ from app bundle
.gitignore                           — Add keygen/keys/
```

---

## Phase 1: Shared Key Format

### Task 1: Create shared key encoding/decoding module

**Files:**
- Create: `shared/key-format.ts`

This module is used by both the app (validator) and the keygen CLI. It defines the payload structure and base32 encoding.

- [ ] **Step 1: Install base32 dependency**

```bash
npm install base32-encode base32-decode
npm install -D @types/base32-encode @types/base32-decode
```

Note: If typed versions don't exist, we'll create a simple `shared/base32.d.ts` declaration.

- [ ] **Step 2: Create shared/key-format.ts**

```typescript
import crypto from 'crypto';

export interface KeyPayload {
  machineId: string;
  type: '6month' | 'lifetime';
  expiresAt: string | null;  // ISO date string, null for lifetime
  issuedAt: string;          // ISO date string
  keyId: string;             // unique ID for single-use enforcement
}

// Custom base32 alphabet: no 0/O, 1/I/L to avoid ambiguity when typing
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

function toBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let result = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += ALPHABET[(value >>> bits) & 0x1f];
    }
  }
  if (bits > 0) {
    result += ALPHABET[(value << (5 - bits)) & 0x1f];
  }
  return result;
}

function fromBase32(str: string): Buffer {
  const cleanStr = str.replace(/-/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of cleanStr) {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1) throw new Error(`Invalid base32 character: ${char}`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

function formatKey(encoded: string): string {
  // Group into blocks of 4: XXXX-XXXX-XXXX-...
  return encoded.match(/.{1,4}/g)?.join('-') || encoded;
}

function unformatKey(key: string): string {
  return key.replace(/-/g, '').toUpperCase();
}

export function encodeKey(payload: KeyPayload, privateKeyPem: string): string {
  const payloadJson = JSON.stringify(payload);
  const payloadBuffer = Buffer.from(payloadJson, 'utf-8');

  // Sign with Ed25519
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const signature = crypto.sign(null, payloadBuffer, privateKey);

  // Combine: [2-byte payload length][payload][signature]
  const lenBuf = Buffer.alloc(2);
  lenBuf.writeUInt16BE(payloadBuffer.length);
  const combined = Buffer.concat([lenBuf, payloadBuffer, signature]);

  return formatKey(toBase32(combined));
}

export function decodeKey(key: string, publicKeyPem: string): KeyPayload {
  const combined = fromBase32(unformatKey(key));

  // Extract payload length
  const payloadLen = combined.readUInt16BE(0);
  const payloadBuffer = combined.subarray(2, 2 + payloadLen);
  const signature = combined.subarray(2 + payloadLen);

  // Verify signature with Ed25519 public key
  const publicKey = crypto.createPublicKey(publicKeyPem);
  const isValid = crypto.verify(null, payloadBuffer, publicKey, signature);
  if (!isValid) {
    throw new Error('Invalid key signature');
  }

  const payload = JSON.parse(payloadBuffer.toString('utf-8')) as KeyPayload;
  return payload;
}

export function generateMachineCode(cpuId: string, motherboardSerial: string, macAddress: string): string {
  const raw = `${cpuId}|${motherboardSerial}|${macAddress}`;
  const hash = crypto.createHash('sha256').update(raw).digest();
  // Take first 6 bytes, encode to base32, format as COFRE-XXXX-XXXX
  const short = toBase32(hash.subarray(0, 6));
  return `COFRE-${short.substring(0, 4)}-${short.substring(4, 8)}`;
}
```

- [ ] **Step 3: Add shared/ to both tsconfig files**

In `tsconfig.node.json`, add `"shared/**/*.ts"` to the `include` array:
```json
"include": ["electron/**/*.ts", "server/**/*.ts", "shared/**/*.ts"]
```

- [ ] **Step 4: Verify compilation**

```bash
npx tsc -p tsconfig.node.json --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add shared/ tsconfig.node.json package.json package-lock.json
git commit -m "feat: add shared key format module with Ed25519 signing and base32 encoding"
```

---

## Phase 2: Key Generator CLI

### Task 2: Create keygen CLI tool

**Files:**
- Create: `keygen/package.json`
- Create: `keygen/tsconfig.json`
- Create: `keygen/src/index.ts`
- Create: `keygen/src/init.ts`
- Create: `keygen/src/generate.ts`

- [ ] **Step 1: Create keygen/package.json**

```json
{
  "name": "cofre-keygen",
  "version": "1.0.0",
  "private": true,
  "bin": {
    "cofre-keygen": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.6.2",
    "typescript": "^5.2.2"
  }
}
```

- [ ] **Step 2: Create keygen/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": ".",
    "baseUrl": ".",
    "resolveJsonModule": true
  },
  "include": ["src/**/*.ts", "../shared/**/*.ts"]
}
```

- [ ] **Step 3: Create keygen/src/init.ts**

```typescript
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

const KEYGEN_DIR = path.join(os.homedir(), '.cofre-keygen');

export function initKeys(force: boolean = false): void {
  if (!fs.existsSync(KEYGEN_DIR)) {
    fs.mkdirSync(KEYGEN_DIR, { recursive: true });
  }

  const privatePath = path.join(KEYGEN_DIR, 'private.key');
  const publicPath = path.join(KEYGEN_DIR, 'public.key');

  if (fs.existsSync(privatePath) && !force) {
    console.error('Key pair already exists. Use --force to overwrite.');
    console.error(`  Private: ${privatePath}`);
    console.error(`  Public:  ${publicPath}`);
    process.exit(1);
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  fs.writeFileSync(privatePath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicPath, publicKey, { mode: 0o644 });

  console.log('Key pair generated:');
  console.log(`  Private key: ${privatePath}  (KEEP SECRET, BACK UP)`);
  console.log(`  Public key:  ${publicPath}  (embed in El Cofre app before building)`);
}

export function getPrivateKey(): string {
  const privatePath = path.join(os.homedir(), '.cofre-keygen', 'private.key');
  if (!fs.existsSync(privatePath)) {
    console.error('No key pair found. Run: cofre-keygen init');
    process.exit(1);
  }
  return fs.readFileSync(privatePath, 'utf-8');
}

export function getPublicKey(): string {
  const publicPath = path.join(os.homedir(), '.cofre-keygen', 'public.key');
  if (!fs.existsSync(publicPath)) {
    console.error('No key pair found. Run: cofre-keygen init');
    process.exit(1);
  }
  return fs.readFileSync(publicPath, 'utf-8');
}
```

- [ ] **Step 4: Create keygen/src/generate.ts**

```typescript
import crypto from 'crypto';
import { encodeKey, KeyPayload } from '../../shared/key-format';
import { getPrivateKey } from './init';

export function generateKey(machineId: string, type: '6month' | 'lifetime'): { key: string; payload: KeyPayload } {
  const now = new Date();
  let expiresAt: string | null = null;

  if (type === '6month') {
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 6);
    expiresAt = expiry.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  const payload: KeyPayload = {
    machineId,
    type,
    expiresAt,
    issuedAt: now.toISOString().split('T')[0],
    keyId: crypto.randomUUID(),
  };

  const privateKeyPem = getPrivateKey();
  const key = encodeKey(payload, privateKeyPem);

  return { key, payload };
}
```

- [ ] **Step 5: Create keygen/src/index.ts**

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { initKeys, getPublicKey } from './init';
import { generateKey } from './generate';

const program = new Command();

program
  .name('cofre-keygen')
  .description('License key generator for El Cofre')
  .version('1.0.0');

program
  .command('init')
  .description('Generate Ed25519 key pair for signing license keys')
  .option('--force', 'Overwrite existing key pair')
  .action((opts) => {
    initKeys(opts.force);
  });

program
  .command('generate')
  .description('Generate a license key for a specific machine')
  .requiredOption('--machine <code>', 'Machine code (e.g., COFRE-A7X9-M3K2)')
  .requiredOption('--type <type>', 'Key type: 6month or lifetime')
  .action((opts) => {
    const type = opts.type as '6month' | 'lifetime';
    if (type !== '6month' && type !== 'lifetime') {
      console.error('Error: --type must be "6month" or "lifetime"');
      process.exit(1);
    }

    const { key, payload } = generateKey(opts.machine, type);

    console.log('');
    console.log('Key generated:');
    console.log(`  Machine:    ${payload.machineId}`);
    console.log(`  Type:       ${type === '6month' ? '6-month' : 'Lifetime'}`);
    console.log(`  Issued:     ${payload.issuedAt}`);
    console.log(`  Expires:    ${payload.expiresAt || 'Never'}`);
    console.log(`  Key:        ${key}`);
    console.log('');
  });

program
  .command('public-key')
  .description('Print the public key (for embedding in the app)')
  .action(() => {
    console.log(getPublicKey());
  });

program.parse();
```

- [ ] **Step 6: Install keygen dependencies and build**

```bash
cd keygen && npm install && npm run build && cd ..
```

Expected: `keygen/dist/` created with compiled JS.

- [ ] **Step 7: Test the keygen CLI**

```bash
# Initialize key pair
node keygen/dist/src/index.js init

# Generate a test key
node keygen/dist/src/index.js generate --machine COFRE-TEST-ABCD --type 6month

# Print public key
node keygen/dist/src/index.js public-key
```

Expected: Key pair created in `~/.cofre-keygen/`, test key generated and printed, public key printed.

- [ ] **Step 8: Update .gitignore**

Add to `.gitignore`:
```
# keygen private keys (never commit)
keygen/keys/
```

- [ ] **Step 9: Commit**

```bash
git add keygen/ shared/ .gitignore
git commit -m "feat: add cofre-keygen CLI tool for license key generation"
```

---

## Phase 3: License Validation in App

### Task 3: Add license tables to database

**Files:**
- Modify: `server/db.ts`

- [ ] **Step 1: Add license_info and used_keys tables to server/db.ts**

Add these two CREATE TABLE statements at the end of the existing `db.exec()` block, before the `INSERT OR IGNORE INTO system_settings` line:

```sql
    CREATE TABLE IF NOT EXISTS license_info (
      id INTEGER PRIMARY KEY DEFAULT 1,
      machineId TEXT NOT NULL,
      keyPayload TEXT NOT NULL,
      keyType TEXT NOT NULL CHECK(keyType IN ('6month', 'lifetime')),
      activatedAt TEXT NOT NULL,
      expiresAt TEXT,
      lastSeen TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS used_keys (
      keyId TEXT PRIMARY KEY,
      activatedAt TEXT NOT NULL
    );
```

- [ ] **Step 2: Verify compilation**

```bash
npx tsc -p tsconfig.node.json --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add server/db.ts
git commit -m "feat: add license_info and used_keys tables to database schema"
```

---

### Task 4: Machine ID generation

**Files:**
- Create: `electron/license/machine-id.ts`

- [ ] **Step 1: Install systeminformation**

```bash
npm install systeminformation
```

- [ ] **Step 2: Create electron/license/machine-id.ts**

```typescript
import si from 'systeminformation';
import { generateMachineCode } from '../../shared/key-format';

let cachedMachineCode: string | null = null;

export async function getMachineCode(): Promise<string> {
  if (cachedMachineCode) return cachedMachineCode;

  const [cpu, system, network] = await Promise.all([
    si.cpu(),
    si.system(),
    si.networkInterfaces(),
  ]);

  const cpuId = cpu.brand + cpu.manufacturer + cpu.cores;
  const motherboardSerial = system.serial || system.uuid || 'unknown';

  // Use the first non-internal network interface MAC address
  const interfaces = Array.isArray(network) ? network : [network];
  const macAddress = interfaces.find(
    (iface: any) => !iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00'
  )?.mac || 'unknown';

  cachedMachineCode = generateMachineCode(cpuId, motherboardSerial, macAddress);
  return cachedMachineCode;
}
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc -p tsconfig.node.json --noEmit
```

- [ ] **Step 4: Test machine code generation**

```bash
npx tsc -p tsconfig.node.json && node -e "
const { getMachineCode } = require('./dist-electron/electron/license/machine-id.js');
getMachineCode().then(code => { console.log('Machine Code:', code); process.exit(0); });
"
```

Expected: Prints something like `Machine Code: COFRE-XXXX-XXXX`

- [ ] **Step 5: Commit**

```bash
git add electron/license/machine-id.ts package.json package-lock.json
git commit -m "feat: add machine ID generation from hardware identifiers"
```

---

### Task 5: License validator and clock guard

**Files:**
- Create: `electron/license/validator.ts`
- Create: `electron/license/clock-guard.ts`
- Create: `electron/license/public.key` (placeholder — replaced by real key after `cofre-keygen init`)

- [ ] **Step 1: Create electron/license/public.key placeholder**

```
-----BEGIN PUBLIC KEY-----
PLACEHOLDER - Run: cofre-keygen init && cofre-keygen public-key
Then paste the output here before building for production.
-----END PUBLIC KEY-----
```

- [ ] **Step 2: Create electron/license/validator.ts**

```typescript
import fs from 'fs';
import path from 'path';
import { decodeKey, KeyPayload } from '../../shared/key-format';
import db from '../../server/db';

// Load public key from file (embedded in app at build time)
const PUBLIC_KEY_PATH = path.join(__dirname, '../../electron/license/public.key');
let publicKeyPem: string;

try {
  // In compiled form, __dirname is dist-electron/electron/license/
  // Try multiple paths to find the public key
  const paths = [
    path.join(__dirname, 'public.key'),           // dist-electron/electron/license/
    path.join(__dirname, '../../electron/license/public.key'), // from dist-electron
    path.join(process.cwd(), 'electron/license/public.key'),  // from project root
  ];

  publicKeyPem = '';
  for (const p of paths) {
    if (fs.existsSync(p)) {
      publicKeyPem = fs.readFileSync(p, 'utf-8');
      break;
    }
  }

  if (!publicKeyPem || publicKeyPem.includes('PLACEHOLDER')) {
    console.warn('WARNING: No valid public key found. License validation will fail.');
  }
} catch {
  console.warn('WARNING: Could not load public key.');
  publicKeyPem = '';
}

export type LicenseStatus =
  | { status: 'no_license' }
  | { status: 'valid'; expiresAt: string | null; keyType: string; daysRemaining: number | null }
  | { status: 'grace_period'; expiresAt: string; daysOverdue: number; keyType: string }
  | { status: 'expired' }
  | { status: 'clock_tampered' }
  | { status: 'invalid' };

export function checkLicense(machineId: string): LicenseStatus {
  const license = db.prepare('SELECT * FROM license_info WHERE id = 1').get() as any;

  if (!license) {
    return { status: 'no_license' };
  }

  // Verify machine ID matches
  if (license.machineId !== machineId) {
    return { status: 'invalid' };
  }

  // Check clock tampering
  const now = new Date();
  const lastSeen = new Date(license.lastSeen);
  const hoursDiff = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < -24) {
    return { status: 'clock_tampered' };
  }

  // Update lastSeen
  db.prepare('UPDATE license_info SET lastSeen = ? WHERE id = 1')
    .run(now.toISOString());

  // Check expiration
  if (license.keyType === 'lifetime' || !license.expiresAt) {
    return { status: 'valid', expiresAt: null, keyType: license.keyType, daysRemaining: null };
  }

  const expiresAt = new Date(license.expiresAt);
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining > 0) {
    return { status: 'valid', expiresAt: license.expiresAt, keyType: license.keyType, daysRemaining };
  }

  const daysOverdue = Math.abs(daysRemaining);

  if (daysOverdue <= 15) {
    return { status: 'grace_period', expiresAt: license.expiresAt, daysOverdue, keyType: license.keyType };
  }

  return { status: 'expired' };
}

export function activateKey(key: string, machineId: string): { success: boolean; error?: string } {
  try {
    if (!publicKeyPem || publicKeyPem.includes('PLACEHOLDER')) {
      return { success: false, error: 'System configuration error. Contact support.' };
    }

    // Decode and verify signature
    const payload: KeyPayload = decodeKey(key, publicKeyPem);

    // Check machine ID
    if (payload.machineId !== machineId) {
      return { success: false, error: 'Key is not valid for this machine.' };
    }

    // Check single-use
    const usedKey = db.prepare('SELECT keyId FROM used_keys WHERE keyId = ?').get(payload.keyId);
    if (usedKey) {
      return { success: false, error: 'This key has already been used.' };
    }

    // Activate
    const now = new Date().toISOString();

    db.transaction(() => {
      // Upsert license_info
      db.prepare('DELETE FROM license_info WHERE id = 1').run();
      db.prepare(
        `INSERT INTO license_info (id, machineId, keyPayload, keyType, activatedAt, expiresAt, lastSeen)
         VALUES (1, ?, ?, ?, ?, ?, ?)`
      ).run(machineId, key, payload.type, now, payload.expiresAt, now);

      // Record key as used
      db.prepare('INSERT INTO used_keys (keyId, activatedAt) VALUES (?, ?)').run(payload.keyId, now);
    })();

    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Invalid key';
    if (msg === 'Invalid key signature') {
      return { success: false, error: 'Invalid license key.' };
    }
    return { success: false, error: msg };
  }
}

export function getLicenseInfo(): any {
  return db.prepare('SELECT * FROM license_info WHERE id = 1').get() || null;
}
```

- [ ] **Step 3: Create electron/license/clock-guard.ts**

```typescript
import db from '../../server/db';

/**
 * Update lastSeen timestamp. Called on every app launch.
 * Returns false if clock tampering is detected.
 */
export function updateLastSeen(): boolean {
  const license = db.prepare('SELECT lastSeen FROM license_info WHERE id = 1').get() as any;

  if (!license) return true; // No license yet, nothing to guard

  const now = new Date();
  const lastSeen = new Date(license.lastSeen);
  const hoursDiff = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < -24) {
    // Clock went backward by more than 24 hours
    return false;
  }

  db.prepare('UPDATE license_info SET lastSeen = ? WHERE id = 1').run(now.toISOString());
  return true;
}
```

- [ ] **Step 4: Verify compilation**

```bash
npx tsc -p tsconfig.node.json --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add electron/license/
git commit -m "feat: add license validator, clock guard, and public key placeholder"
```

---

### Task 6: License API routes

**Files:**
- Create: `server/routes/license.ts`
- Modify: `server/index.ts`

- [ ] **Step 1: Create server/routes/license.ts**

```typescript
import { Router } from 'express';
import { checkLicense, activateKey, getLicenseInfo } from '../../electron/license/validator';
import { getMachineCode } from '../../electron/license/machine-id';

const router = Router();

// GET /api/license/status
router.get('/status', async (_req, res) => {
  try {
    const machineId = await getMachineCode();
    const status = checkLicense(machineId);
    const info = getLicenseInfo();

    return res.json({
      ...status,
      machineId,
      license: info ? {
        keyType: info.keyType,
        activatedAt: info.activatedAt,
        expiresAt: info.expiresAt,
      } : null,
    });
  } catch (error) {
    console.error('License status error:', error);
    return res.status(500).json({ error: 'Failed to check license status' });
  }
});

// POST /api/license/activate
router.post('/activate', async (req, res) => {
  try {
    const { key } = req.body;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'License key is required' });
    }

    const machineId = await getMachineCode();
    const result = activateKey(key.trim(), machineId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Activation error:', error);
    return res.status(500).json({ error: 'Failed to activate license' });
  }
});

// GET /api/license/machine-code
router.get('/machine-code', async (_req, res) => {
  try {
    const machineId = await getMachineCode();
    return res.json({ machineId });
  } catch (error) {
    console.error('Machine code error:', error);
    return res.status(500).json({ error: 'Failed to get machine code' });
  }
});

export default router;
```

- [ ] **Step 2: Add license routes to server/index.ts**

Add the import at the top with the other route imports:
```typescript
import licenseRoutes from './routes/license';
```

Add the mount after the other `app.use` lines:
```typescript
app.use('/api/license', licenseRoutes);
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc -p tsconfig.node.json --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add server/routes/license.ts server/index.ts
git commit -m "feat: add license API routes (status, activate, machine-code)"
```

---

## Phase 4: Frontend — Activation Screen + License Settings

### Task 7: Activation page

**Files:**
- Create: `src/pages/Activation.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create src/pages/Activation.tsx**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Shield, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Activation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: licenseStatus, isLoading } = useQuery({
    queryKey: ['licenseStatus'],
    queryFn: async () => {
      const res = await fetch('/api/license/status');
      if (!res.ok) throw new Error('Failed to check license');
      return res.json();
    },
  });

  const { mutate: activate, isPending } = useMutation({
    mutationFn: async (licenseKey: string) => {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Activation failed');
      return data;
    },
    onSuccess: () => {
      toast.success('License activated successfully!');
      queryClient.invalidateQueries({ queryKey: ['licenseStatus'] });
      navigate('/');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleCopy = async () => {
    if (licenseStatus?.machineId) {
      await navigator.clipboard.writeText(licenseStatus.machineId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    activate(key);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-extrabold text-pink-500">EL</h1>
            <h1 className="text-3xl font-extrabold text-blue-500">COFRE</h1>
          </div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">License Activation</p>
        </div>

        <Card className="p-6 space-y-6">
          {/* Machine Code Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Your Machine Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-md px-4 py-3 font-mono text-lg text-center tracking-wider">
                {licenseStatus?.machineId || '...'}
              </div>
              <Button variant="outline" size="icon" onClick={handleCopy} title="Copy machine code">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Share this code with your provider to receive a license key.
            </p>
          </div>

          {/* License Key Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Enter License Key
              </label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                className="font-mono text-center tracking-wider"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending || !key.trim()}>
              {isPending ? 'Activating...' : 'Activate License'}
            </Button>
          </form>

          {/* Status Messages */}
          {licenseStatus?.status === 'clock_tampered' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-300">
              System date error detected. Please correct your system clock and contact support.
            </div>
          )}
          {licenseStatus?.status === 'expired' && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3 text-sm text-orange-700 dark:text-orange-300">
              Your license has expired. Please enter a new license key to continue.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add /activation route to src/App.tsx**

Add the import at the top:
```typescript
import Activation from './pages/Activation';
```

Add the route after the `/setup` route:
```tsx
<Route path="/activation" element={<Activation />} />
```

- [ ] **Step 3: Update src/pages/Home.tsx to check license**

Replace the Home page to check license status first, then setup status:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const navigate = useNavigate();

  const { data: licenseData, isLoading: licenseLoading } = useQuery({
    queryKey: ['licenseStatus'],
    queryFn: async () => {
      const res = await fetch('/api/license/status');
      if (!res.ok) throw new Error('Failed to check license');
      return res.json();
    },
  });

  const { data: setupData, isLoading: setupLoading } = useQuery({
    queryKey: ['checkSetup'],
    queryFn: async () => {
      const response = await fetch('/api/check-setup');
      if (!response.ok) throw new Error('Failed to check setup status');
      return response.json();
    },
    enabled: !!licenseData && licenseData.status !== 'no_license' && licenseData.status !== 'expired' && licenseData.status !== 'clock_tampered',
  });

  useEffect(() => {
    if (licenseLoading) return;

    // No license or fully expired or tampered -> activation screen
    if (!licenseData || licenseData.status === 'no_license' || licenseData.status === 'expired' || licenseData.status === 'clock_tampered' || licenseData.status === 'invalid') {
      navigate('/activation');
      return;
    }

    // License valid or in grace period -> check setup
    if (setupLoading) return;
    if (setupData?.isFirstRun) {
      navigate('/setup');
    } else {
      navigate('/login');
    }
  }, [licenseData, licenseLoading, setupData, setupLoading, navigate]);

  return null;
}
```

- [ ] **Step 4: Verify frontend builds**

```bash
npx vite build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Activation.tsx src/pages/Home.tsx src/App.tsx
git commit -m "feat: add Activation page and license check in app routing"
```

---

### Task 8: License Settings tab

**Files:**
- Create: `src/components/settings/license-settings.tsx`
- Modify: `src/pages/Settings.tsx`

- [ ] **Step 1: Create src/components/settings/license-settings.tsx**

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function LicenseSettings() {
  const queryClient = useQueryClient();
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ['licenseStatus'],
    queryFn: async () => {
      const res = await fetch('/api/license/status');
      if (!res.ok) throw new Error('Failed to check license');
      return res.json();
    },
  });

  const { mutate: activate, isPending } = useMutation({
    mutationFn: async (licenseKey: string) => {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Activation failed');
      return data;
    },
    onSuccess: () => {
      toast.success('License key updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['licenseStatus'] });
      setKey('');
      setShowKeyInput(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleCopy = async () => {
    if (status?.machineId) {
      await navigator.clipboard.writeText(status.machineId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;
    switch (status.status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'grace_period':
        return <Badge className="bg-orange-100 text-orange-800">Grace Period</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">License Information</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Machine Code */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Machine Code</p>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded font-mono text-sm">
                {status?.machineId || '...'}
              </code>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            {getStatusBadge()}
          </div>

          {/* License Type */}
          <div>
            <p className="text-sm text-gray-500 mb-1">License Type</p>
            <p className="font-medium">
              {status?.license?.keyType === 'lifetime' ? 'Lifetime' : status?.license?.keyType === '6month' ? '6-Month' : 'N/A'}
            </p>
          </div>

          {/* Expiration */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Expires</p>
            <p className="font-medium">
              {status?.license?.expiresAt || 'Never'}
            </p>
          </div>

          {/* Days Remaining */}
          {status?.daysRemaining !== undefined && status?.daysRemaining !== null && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Days Remaining</p>
              <p className={`font-medium ${status.daysRemaining <= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                {status.daysRemaining}
              </p>
            </div>
          )}

          {/* Grace Period Warning */}
          {status?.status === 'grace_period' && (
            <div className="col-span-2">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3 text-sm text-orange-700 dark:text-orange-300">
                License expired {status.daysOverdue} day(s) ago. You have {15 - status.daysOverdue} day(s) remaining before lockout.
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Enter New Key */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Renew License</h3>
        {showKeyInput ? (
          <form onSubmit={(e) => { e.preventDefault(); if (key.trim()) activate(key); }} className="space-y-4">
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
              className="font-mono tracking-wider"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending || !key.trim()}>
                {isPending ? 'Activating...' : 'Activate Key'}
              </Button>
              <Button variant="outline" onClick={() => { setShowKeyInput(false); setKey(''); }}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setShowKeyInput(true)}>Enter New Key</Button>
        )}
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Add License tab to Settings page**

Modify `src/pages/Settings.tsx` — add the import:
```typescript
import { LicenseSettings } from "@/components/settings/license-settings";
```

Add a new TabsTrigger and TabsContent. After the `system` TabsTrigger, add:
```tsx
<TabsTrigger value="license">License</TabsTrigger>
```

After the `system` TabsContent, add:
```tsx
<TabsContent value="license">
  <LicenseSettings />
</TabsContent>
```

- [ ] **Step 3: Verify frontend builds**

```bash
npx vite build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/settings/license-settings.tsx src/pages/Settings.tsx
git commit -m "feat: add License Settings tab with status display and renewal"
```

---

### Task 9: License expiry warning banner in dashboard

**Files:**
- Modify: `src/pages/DashboardLayout.tsx`

- [ ] **Step 1: Add license warning banner to DashboardLayout**

Add this import at the top of `src/pages/DashboardLayout.tsx`:
```typescript
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
```

Inside the `DashboardLayout` component function, add this query:
```typescript
const { data: licenseStatus } = useQuery({
  queryKey: ['licenseStatus'],
  queryFn: async () => {
    const res = await fetch('/api/license/status');
    if (!res.ok) throw new Error('Failed');
    return res.json();
  },
  refetchInterval: 60 * 60 * 1000, // Check every hour
});
```

Then add this banner right above the `<Outlet />` inside the `<main>` tag, before `<div className="container mx-auto p-6">`:

```tsx
{licenseStatus?.status === 'grace_period' && (
  <div className="bg-orange-500 text-white px-4 py-2 text-sm flex items-center gap-2">
    <AlertTriangle className="h-4 w-4" />
    <span>
      License expired. {15 - licenseStatus.daysOverdue} day(s) remaining before lockout.
      Contact your provider to renew.
    </span>
  </div>
)}
{licenseStatus?.status === 'valid' && licenseStatus?.daysRemaining !== null && licenseStatus.daysRemaining <= 15 && (
  <div className="bg-yellow-500 text-white px-4 py-2 text-sm flex items-center gap-2">
    <AlertTriangle className="h-4 w-4" />
    <span>
      License expires in {licenseStatus.daysRemaining} day(s). Contact your provider to renew.
    </span>
  </div>
)}
```

- [ ] **Step 2: Verify frontend builds**

```bash
npx vite build
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/DashboardLayout.tsx
git commit -m "feat: add license expiry warning banner in dashboard"
```

---

## Phase 5: Cleanup + Packaging

### Task 10: Remove old Next.js files

**Files:**
- Delete: `app/` directory
- Delete: `middleware.ts`
- Delete: `next.config.js`
- Delete: `lib/` directory (now in `src/lib/`)
- Delete: `hooks/` directory (now in `src/hooks/`)
- Delete: `components/` directory (now in `src/components/`)
- Delete: `pnpm-lock.yaml`

- [ ] **Step 1: Remove old directories and files**

```bash
rm -rf app/
rm -rf lib/
rm -rf hooks/
rm -rf components/
rm -f middleware.ts
rm -f next.config.js
rm -f pnpm-lock.yaml
rm -rf .next/
```

- [ ] **Step 2: Verify nothing broke**

```bash
npx tsc -p tsconfig.node.json --noEmit
npx vite build
```

Expected: Both pass. The old files were duplicates — the new ones are in `src/` and `server/`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old Next.js files (app/, lib/, hooks/, components/, middleware.ts, next.config.js)"
```

---

### Task 11: Verify Electron packaging

**Files:**
- Modify: `electron-builder.yml` (exclude keygen/)
- Create: `build/` directory with placeholder icons

- [ ] **Step 1: Update electron-builder.yml to exclude keygen**

Add `keygen/` to the files exclusion. The full `files` section becomes:

```yaml
files:
  - dist/**/*
  - dist-electron/**/*
  - "!node_modules/.cache"
  - "!keygen/**/*"
```

- [ ] **Step 2: Create placeholder icons**

```bash
mkdir -p build
# Create a minimal placeholder icon (1x1 pixel PNG)
# In production, replace with actual El Cofre icon
node -e "
const fs = require('fs');
// Minimal 1x1 PNG
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('build/icon.png', png);
console.log('Created placeholder icon');
"
```

- [ ] **Step 3: Build the full project**

```bash
npm run build
```

Expected: `dist/` has frontend, `dist-electron/` has compiled backend + electron.

- [ ] **Step 4: Test macOS packaging**

```bash
npm run package:mac
```

Expected: `release/` directory with a `.dmg` file (or at least the build process starts — it may need the actual `.icns` icon file, in which case just note this for later).

- [ ] **Step 5: Commit**

```bash
git add electron-builder.yml build/
git commit -m "chore: configure packaging, add placeholder icons, exclude keygen from bundle"
```

---

### Task 12: End-to-end smoke test

This task verifies the full flow works: keygen generates a key → app validates it.

- [ ] **Step 1: Build everything**

```bash
npx tsc -p tsconfig.node.json
npx vite build
cd keygen && npm run build && cd ..
```

- [ ] **Step 2: Initialize keygen key pair**

```bash
node keygen/dist/src/index.js init --force
```

- [ ] **Step 3: Embed the public key in the app**

```bash
node keygen/dist/src/index.js public-key > electron/license/public.key
```

- [ ] **Step 4: Rebuild the server (so it picks up the real public key)**

```bash
npx tsc -p tsconfig.node.json
```

- [ ] **Step 5: Get the machine code**

```bash
node -e "
const { getMachineCode } = require('./dist-electron/electron/license/machine-id.js');
getMachineCode().then(code => { console.log(code); process.exit(0); });
"
```

Note the output (e.g., `COFRE-XXXX-XXXX`).

- [ ] **Step 6: Generate a key for this machine**

```bash
node keygen/dist/src/index.js generate --machine COFRE-XXXX-XXXX --type 6month
```

Replace `COFRE-XXXX-XXXX` with the actual machine code from Step 5. Note the generated key.

- [ ] **Step 7: Test activation via API**

```bash
node -e "
const { startServer } = require('./dist-electron/server/index.js');
startServer(3860).then(async (port) => {
  // Test activation
  const res = await fetch('http://127.0.0.1:' + port + '/api/license/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'THE-KEY-FROM-STEP-6' }),
  });
  console.log('Activation:', await res.json());

  // Check status
  const status = await fetch('http://127.0.0.1:' + port + '/api/license/status');
  console.log('Status:', await status.json());

  process.exit(0);
});
"
```

Replace `THE-KEY-FROM-STEP-6` with the actual key.

Expected: `{ success: true }` for activation, and status shows `valid` with correct expiration.

- [ ] **Step 8: Commit the embedded public key**

```bash
git add electron/license/public.key
git commit -m "feat: embed Ed25519 public key for license validation"
```
