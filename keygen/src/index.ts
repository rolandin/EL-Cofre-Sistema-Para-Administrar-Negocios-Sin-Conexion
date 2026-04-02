#!/usr/bin/env node
import { Command } from 'commander';
import { initKeys, getPublicKey } from './init';
import { generateKey } from './generate';

const program = new Command();

program
  .name('cofre')
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
  .requiredOption('--type <type>', 'Key type: 6month, 1year, or lifetime')
  .action((opts) => {
    const type = opts.type as '6month' | '1year' | 'lifetime';
    if (type !== '6month' && type !== '1year' && type !== 'lifetime') {
      console.error('Error: --type must be "6month", "1year", or "lifetime"');
      process.exit(1);
    }

    const { key, payload } = generateKey(opts.machine, type);

    const typeLabels: Record<string, string> = { '6month': '6-month', '1year': '1-year', 'lifetime': 'Lifetime' };

    console.log('');
    console.log('Key generated:');
    console.log(`  Machine:    ${payload.machineId}`);
    console.log(`  Type:       ${typeLabels[type]}`);
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
