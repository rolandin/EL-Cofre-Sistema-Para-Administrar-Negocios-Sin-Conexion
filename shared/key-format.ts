import crypto from 'crypto';

export interface KeyPayload {
  machineId: string;
  type: '6month' | 'lifetime';
  expiresAt: string | null;  // ISO date string, null for lifetime
  issuedAt: string;          // ISO date string
  keyId: string;             // unique ID for single-use enforcement
}

// Custom base32 alphabet (32 chars): excludes 1/I/L (visually ambiguous) and O (looks like 0).
// Keeps 0 (unambiguous since O is excluded) and U. Exactly 32 characters for 5-bit encoding.
const ALPHABET = '023456789ABCDEFGHJKMNPQRSTUVWXYZ';

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
  return encoded.match(/.{1,4}/g)?.join('-') || encoded;
}

function unformatKey(key: string): string {
  return key.replace(/-/g, '').toUpperCase();
}

export function encodeKey(payload: KeyPayload, privateKeyPem: string): string {
  const payloadJson = JSON.stringify(payload);
  const payloadBuffer = Buffer.from(payloadJson, 'utf-8');

  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const signature = crypto.sign(null, payloadBuffer as unknown as Uint8Array, privateKey);

  // Combine: [2-byte payload length][payload][signature]
  const lenBuf = Buffer.alloc(2);
  lenBuf.writeUInt16BE(payloadBuffer.length);
  const combined = Buffer.concat([lenBuf, payloadBuffer, signature] as unknown as Uint8Array[]);

  return formatKey(toBase32(combined));
}

export function decodeKey(key: string, publicKeyPem: string): KeyPayload {
  const combined = fromBase32(unformatKey(key));

  const payloadLen = combined.readUInt16BE(0);
  const payloadBuffer = combined.subarray(2, 2 + payloadLen);
  const signature = combined.subarray(2 + payloadLen);

  const publicKey = crypto.createPublicKey(publicKeyPem);
  const isValid = crypto.verify(null, payloadBuffer as unknown as Uint8Array, publicKey, signature as unknown as Uint8Array);
  if (!isValid) {
    throw new Error('Invalid key signature');
  }

  return JSON.parse(payloadBuffer.toString('utf-8')) as KeyPayload;
}

export function generateMachineCode(cpuId: string, motherboardSerial: string, macAddress: string): string {
  const raw = `${cpuId}|${motherboardSerial}|${macAddress}`;
  const hash = crypto.createHash('sha256').update(raw).digest();
  const short = toBase32(hash.subarray(0, 6));
  return `COFRE-${short.substring(0, 4)}-${short.substring(4, 8)}`;
}
