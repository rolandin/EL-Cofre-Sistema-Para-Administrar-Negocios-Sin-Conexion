import fs from 'fs';
import path from 'path';
import { decodeKey, KeyPayload } from '../../shared/key-format';
import db from '../../server/db';

function loadPublicKey(): string {
  const paths = [
    path.join(__dirname, 'public.key'),
    path.join(__dirname, '../../electron/license/public.key'),
    path.join(process.cwd(), 'electron/license/public.key'),
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      if (!content.includes('PLACEHOLDER')) return content;
    }
  }
  return '';
}

const publicKeyPem = loadPublicKey();

export type LicenseStatus =
  | { status: 'no_license' }
  | { status: 'valid'; expiresAt: string | null; keyType: string; daysRemaining: number | null }
  | { status: 'grace_period'; expiresAt: string; daysOverdue: number; keyType: string }
  | { status: 'expired' }
  | { status: 'clock_tampered' }
  | { status: 'invalid' };

export function checkLicense(machineId: string): LicenseStatus {
  const license = db.prepare('SELECT * FROM license_info WHERE id = 1').get() as any;

  if (!license) return { status: 'no_license' };

  if (license.machineId !== machineId) return { status: 'invalid' };

  // Clock tampering check
  const now = new Date();
  const lastSeen = new Date(license.lastSeen);
  const hoursDiff = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < -24) return { status: 'clock_tampered' };

  // Update lastSeen
  db.prepare('UPDATE license_info SET lastSeen = ? WHERE id = 1').run(now.toISOString());

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
    if (!publicKeyPem) {
      return { success: false, error: 'System configuration error. Contact support.' };
    }

    const payload: KeyPayload = decodeKey(key, publicKeyPem);

    if (payload.machineId !== machineId) {
      return { success: false, error: 'Key is not valid for this machine.' };
    }

    const usedKey = db.prepare('SELECT keyId FROM used_keys WHERE keyId = ?').get(payload.keyId);
    if (usedKey) {
      return { success: false, error: 'This key has already been used.' };
    }

    const now = new Date().toISOString();

    db.transaction(() => {
      db.prepare('DELETE FROM license_info WHERE id = 1').run();
      db.prepare(
        `INSERT INTO license_info (id, machineId, keyPayload, keyType, activatedAt, expiresAt, lastSeen)
         VALUES (1, ?, ?, ?, ?, ?, ?)`
      ).run(machineId, key, payload.type, now, payload.expiresAt, now);

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
