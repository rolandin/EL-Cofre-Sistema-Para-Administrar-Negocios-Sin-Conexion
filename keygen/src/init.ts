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
