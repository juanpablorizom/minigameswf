import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { Client } from 'pg';

async function loadEnvFromFile() {
  if (process.env.INSFORGE_DATABASE_URL) {
    return;
  }

  try {
    const envPath = new URL('../.env', import.meta.url);
    const envFile = await readFile(envPath, 'utf8');

    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {}
}

await loadEnvFromFile();

const connectionString = process.env.INSFORGE_DATABASE_URL;

if (!connectionString) {
  console.error('Missing INSFORGE_DATABASE_URL.');
  process.exit(1);
}

const schemaPath = new URL('../insforge/schema.sql', import.meta.url);
const sql = await readFile(schemaPath, 'utf8');
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  await client.connect();
  await client.query(sql);
  console.log('Schema applied successfully.');
} finally {
  await client.end().catch(() => {});
}
