# El Cofre — Electron Migration + License Key System Design

**Date:** 2026-03-31
**Status:** Approved

---

## 1. Overview

Migrate El Cofre from a Next.js web app to an Electron desktop application targeting Windows and macOS. Add an offline license key system with 6-month and lifetime keys, tied to machine hardware IDs, using Ed25519 asymmetric cryptography.

### Goals

- Compile into installable `.exe` (Windows) and `.dmg` (macOS)
- Offline license system — no internet required for activation or validation
- Keys tied to specific machines, single-use, cryptographically signed
- 15-day grace period after expiration, then full lockout
- Clock tampering detection
- Separate CLI tool for key generation (operator/admin side only)

---

## 2. Architecture

```
+-------------------------------------------------------+
|                    ELECTRON SHELL                      |
|                                                        |
|  +----------------+          +----------------------+  |
|  |  Main Process  |          |   Renderer Process   |  |
|  |                |          |                      |  |
|  |  Express API   |<--HTTP-->|   React Frontend     |  |
|  |  (local port)  |          |   (static build)     |  |
|  |                |          |                      |  |
|  |  SQLite DB     |          |   React Router       |  |
|  |  License Mgr   |          |   TailwindCSS        |  |
|  |  Clock Guard   |          |   shadcn/ui          |  |
|  +----------------+          +----------------------+  |
|                                                        |
|  +----------------------------------------------------+|
|  |  License Gate                                       ||
|  |  - Checks on app launch                            ||
|  |  - 15-day grace period after expiry                ||
|  |  - Full lockout after grace                        ||
|  |  - Clock tampering detection                       ||
|  +----------------------------------------------------+|
+-------------------------------------------------------+

+-------------------------------------------------------+
|              SEPARATE CLI TOOL (admin side)            |
|                                                        |
|  cofre-keygen                                          |
|  - Holds Ed25519 PRIVATE key                          |
|  - Takes machine code + key type                      |
|  - Outputs signed activation key                      |
+-------------------------------------------------------+
```

### Key Decisions

- Express runs on a random local port inside Electron (not exposed to network)
- React frontend is a static build loaded by Electron's BrowserWindow
- All 35 existing API routes migrate to Express routes (nearly 1:1 translation)
- SQLite stays as-is with better-sqlite3 — no database migration needed
- License validation happens at app startup in the main process, before anything loads
- Vite replaces Next.js for frontend bundling
- electron-builder handles packaging for Windows (.exe) and macOS (.dmg)

---

## 3. License Key System

### 3.1 Key Exchange Flow (Offline)

1. App displays a **Machine Code** on the activation screen (derived from hardware ID)
2. Operator visits client, reads the Machine Code from the screen
3. Operator (or admin) enters the Machine Code into the `cofre-keygen` CLI
4. CLI generates a signed key containing: machine ID, expiration, key type
5. Operator types the key into the client's machine
6. App validates: signature, machine ID match, expiration, single-use — activates if all pass

### 3.2 Machine Code Generation

- Derived from: CPU ID + motherboard serial + MAC address
- Hashed into a short readable code: `COFRE-XXXX-XXXX`
- Displayed on the activation screen so operators can read it aloud

### 3.3 Key Payload

The following data is encoded into each key:

```json
{
  "machineId": "COFRE-A7X9-M3K2",
  "type": "6month | lifetime",
  "expiresAt": "2026-09-30",
  "issuedAt": "2026-03-31",
  "keyId": "unique-random-id"
}
```

- Payload is signed with Ed25519 private key (admin side only)
- App verifies signature using embedded public key
- Key format: base32 encoded, grouped as `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`
- Base32 avoids ambiguous characters (0/O, 1/l/I) to minimize typing errors

### 3.4 Validation on App Launch

```
1. Read license record from DB
2. If no license -> show activation screen
3. If license exists:
   a. Check signature (public key) -> invalid? -> lockout
   b. Check machineId matches this machine -> mismatch? -> lockout
   c. Check expiresAt vs current date:
      - Valid -> proceed to app
      - Expired < 15 days -> show warning banner, app works
      - Expired > 15 days -> full lockout, activation screen only
   d. Check clock tampering:
      - Load "last_seen" date from DB
      - If current date < last_seen by >24hrs -> lockout
      - Otherwise update last_seen to current date
```

### 3.5 Single-Use Enforcement

- Each key has a unique `keyId`
- On activation, `keyId` is stored in a `used_keys` table in the database
- If the same key is entered again, it is rejected ("Key already used")

### 3.6 Clock Tampering Detection

- Every app launch saves current date as `lastSeen` in the license record
- If current date is more than 24 hours behind `lastSeen`, the app locks out
- This prevents users from setting the system clock backward to extend the license
- Message shown: "System date error detected. Contact support."

### 3.7 Cryptographic Security (Ed25519 Asymmetric)

- **Private key**: held only by admin, used in `cofre-keygen` to sign keys
- **Public key**: embedded in the El Cofre app, used to verify key signatures
- Even if someone extracts the public key from the .exe, they cannot forge valid keys
- The private key must be backed up securely — losing it means inability to generate new keys

### 3.8 New Database Tables

```sql
CREATE TABLE license_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  machineId TEXT NOT NULL,
  keyPayload TEXT NOT NULL,
  keyType TEXT NOT NULL,          -- '6month' or 'lifetime'
  activatedAt TEXT NOT NULL,
  expiresAt TEXT,                 -- NULL for lifetime
  lastSeen TEXT NOT NULL
);

CREATE TABLE used_keys (
  keyId TEXT PRIMARY KEY,
  activatedAt TEXT NOT NULL
);
```

---

## 4. App Lifecycle

### 4.1 First Install (Fresh)

1. User installs `.exe` / `.dmg` and opens app
2. **Activation Screen** — shows Machine Code, asks for license key
3. Operator generates key via CLI, types it in
4. Key validated — app proceeds to **Setup Screen** (create admin account)
5. Admin account created — redirected to **Login** then **Dashboard**

### 4.2 Reinstall / Restore

1. User reinstalls El Cofre on the same machine
2. Activation Screen — same Machine Code (hardware unchanged)
3. Operator enters a NEW key (old one is single-use, can't reuse)
4. App opens — operator navigates to Settings > Restore Backup
5. Loads `warehouse.db` from USB — all data restored

### 4.3 Daily Launch

- License valid and not expired: Dashboard loads normally
- Expired < 15 days: Dashboard loads with warning banner ("License expires in X days")
- Expired > 15 days: Full lockout — only activation screen with Machine Code visible
- Clock tampered: Lockout with "System date error" message

### 4.4 Key Renewal (Every 6 Months)

1. Operator visits client
2. Opens Settings > License tab
3. Views: Machine Code, license status, expiration date, days remaining
4. Enters new key — validated — expiration updated
5. Old key remains in `used_keys` table, new key takes effect

### 4.5 License Tab in Settings

Displays:
- Machine Code (copyable)
- License type (6-month / Lifetime)
- Expiration date
- Days remaining
- Status (Active / Grace Period / Expired)
- "Enter New Key" button

---

## 5. Migration Strategy (Next.js to Electron + Express + React)

### 5.1 Project Structure

```
el-cofre/
├── electron/
│   ├── main.ts              # Electron main process entry
│   ├── license/
│   │   ├── machine-id.ts    # Hardware ID generation
│   │   ├── validator.ts     # Key signature verification (PUBLIC key)
│   │   └── clock-guard.ts   # Tampering detection + last_seen
│   └── preload.ts           # Secure bridge to renderer
│
├── server/
│   ├── index.ts             # Express app setup
│   ├── routes/
│   │   ├── auth.ts          # login, logout, me, setup, check-setup
│   │   ├── products.ts      # products CRUD
│   │   ├── services.ts      # services CRUD
│   │   ├── sales.ts         # sales history + create
│   │   ├── employees.ts     # employees CRUD
│   │   ├── contractors.ts   # contractors CRUD + earnings
│   │   ├── payments.ts      # employee + contractor payments
│   │   ├── appointments.ts  # schedule CRUD
│   │   ├── settings.ts      # business + system settings
│   │   ├── backup.ts        # backup + restore
│   │   ├── metrics.ts       # dashboard metrics
│   │   └── license.ts       # activation endpoint
│   ├── middleware/
│   │   └── auth.ts          # JWT verification middleware
│   └── db.ts                # SQLite connection (same as current lib/db.ts)
│
├── src/                     # React frontend (migrated from app/)
│   ├── pages/               # Route components (React Router)
│   │   ├── Login.tsx
│   │   ├── Setup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Inventory.tsx
│   │   ├── Receive.tsx
│   │   ├── Services.tsx
│   │   ├── Sales.tsx
│   │   ├── Employees.tsx
│   │   ├── Contractors.tsx
│   │   ├── Payments.tsx
│   │   ├── Returns.tsx
│   │   ├── Schedule.tsx
│   │   ├── Settings.tsx
│   │   └── Activation.tsx   # NEW — license key entry screen
│   ├── components/          # Existing components (mostly unchanged)
│   ├── hooks/               # Existing hooks (mostly unchanged)
│   ├── lib/                 # Utilities, i18n
│   └── App.tsx              # React Router setup
│
├── keygen/                  # Separate CLI tool (admin side only)
│   ├── index.ts             # CLI entry point
│   ├── generate.ts          # Key generation + Ed25519 signing
│   └── keys/
│       └── private.key      # Ed25519 PRIVATE key (NEVER shipped)
│
├── package.json
├── vite.config.ts           # Frontend build config
└── electron-builder.yml     # Packaging config (exe + dmg)
```

### 5.2 Migration Mapping

| Current (Next.js) | New Location | Effort |
|---|---|---|
| `app/api/*` (35 routes) | `server/routes/*` (12 files) | Moderate — grouped by domain, same logic |
| `app/dashboard/*` (11 pages) | `src/pages/*` | Low — same JSX, swap Next router for React Router |
| `components/*` (71 files) | `src/components/*` | Minimal — nearly copy-paste |
| `hooks/*` (2 files) | `src/hooks/*` | Copy-paste |
| `lib/db.ts` | `server/db.ts` | Copy-paste |
| `lib/auth.ts` | `server/middleware/auth.ts` | Minor tweaks |
| `lib/i18n/*` | `src/lib/i18n/*` | Copy-paste |
| `middleware.ts` | `server/middleware/auth.ts` + React Router guards | Moderate |
| Next.js routing | React Router in `App.tsx` | Moderate |

### 5.3 New Components (don't exist today)

- `electron/` — Electron main process, license system, machine ID
- `src/pages/Activation.tsx` — license key entry UI
- `server/routes/license.ts` — activation API endpoint
- `keygen/` — private CLI tool for key generation
- `vite.config.ts` — replaces Next.js build system
- `electron-builder.yml` — packaging configuration for .exe and .dmg

---

## 6. Development Workflow

### Day-to-Day Development

```
Terminal 1:  npm run dev:frontend
             -> React dev server with hot reload (Vite, localhost:5173)

Terminal 2:  npm run dev:electron
             -> Launches Electron window pointing to localhost:5173
             -> Express API starts inside Electron
             -> Auto-restarts on backend changes
```

Development feels identical to web development. Edit files in VS Code, save, see changes instantly via hot reload. The Electron window is essentially Chrome.

### Building for Distribution

```bash
npm run build            # Builds React frontend + bundles Express
npm run package:win      # -> dist/ElCofre-Setup-1.0.0.exe
npm run package:mac      # -> dist/ElCofre-1.0.0.dmg
```

### Updates for Clients

Operators carry the new installer on USB. Client reinstalls the app, then restores their database backup through Settings > Restore Backup. Data is preserved across reinstalls.

---

## 7. Key Generator CLI (cofre-keygen)

### Setup

```bash
# First-time: generate Ed25519 key pair
cofre-keygen init
# -> ~/.cofre-keygen/private.key  (KEEP SECRET, BACK UP)
# -> ~/.cofre-keygen/public.key   (embed in El Cofre app before building)
```

### Usage

```bash
# Generate 6-month key
cofre-keygen generate --machine COFRE-A7X9-M3K2 --type 6month

# Generate lifetime key
cofre-keygen generate --machine COFRE-A7X9-M3K2 --type lifetime
```

### Output

```
Key generated:
  Machine:    COFRE-A7X9-M3K2
  Type:       6-month
  Issued:     2026-03-31
  Expires:    2026-09-30
  Key:        LK7X-M9PA-QW3R-T5YU-8H2N-VB4D
```

### Internal Process

1. Build payload: `{ machineId, type, expiresAt, issuedAt, keyId }`
2. Sign payload with Ed25519 private key
3. Encode payload + signature into base32
4. Format as `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`

### Security

- Private key never leaves admin machine
- Public key is embedded in app source before building
- If private key is lost, new keys cannot be generated — must be backed up securely
