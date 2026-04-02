import crypto from 'crypto';
import { encodeKey, KeyPayload } from '../../shared/key-format';
import { getPrivateKey } from './init';

export function generateKey(machineId: string, type: '6month' | 'lifetime'): { key: string; payload: KeyPayload } {
  const now = new Date();
  let expiresAt: string | null = null;

  if (type === '6month') {
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 6);
    expiresAt = expiry.toISOString().split('T')[0];
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
