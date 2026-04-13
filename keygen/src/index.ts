#!/usr/bin/env node
import { Command } from 'commander';
import { initKeys, getPublicKey } from './init';
import { generateKey } from './generate';

const program = new Command();

program
  .name('cofre')
  .description(`License key generator for El Cofre

Generates cryptographically-signed license keys tied to specific machines.
Used by operators to activate the El Cofre software on client computers.

Typical workflow:
  1. cofre init                                    (first time only)
  2. cofre public-key > electron/license/public.key (embed in app, first time)
  3. cofre generate --machine <code> --type <type>  (for each client visit)`)
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
  .requiredOption('--machine <code>', 'Machine code from the client app (e.g., COFRE-A7X9-M3K2)')
  .requiredOption('--type <type>', 'Duration: 6month (6 months), 1year (12 months), or lifetime (never expires)')
  .addHelpText('after', `
Examples:
  $ cofre generate --machine COFRE-A7X9-M3K2 --type 6month
  $ cofre generate --machine COFRE-A7X9-M3K2 --type 1year
  $ cofre generate --machine COFRE-A7X9-M3K2 --type lifetime

How it works:
  1. The client's app shows a Machine Code on the Activation screen
  2. You run this command with that code and the desired duration
  3. Copy the generated key and give it to the client
  4. The client pastes it into the Activation screen to unlock the app

Notes:
  - Each key can only be used once
  - Keys are tied to the specific machine they were generated for
  - 6month/1year keys have a 15-day grace period after expiration
  - Lifetime keys never expire
`)
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
