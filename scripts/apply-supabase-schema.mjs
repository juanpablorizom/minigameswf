import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { Client } from 'pg';

async function loadEnvFromFile() {
  if (process.env.SUPABASE_DB_URL) {
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

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error('Missing SUPABASE_DB_URL.');
  process.exit(1);
}

const schemaPath = new URL('../supabase/schema.sql', import.meta.url);
const sql = await readFile(schemaPath, 'utf8');
const client = new Client({
  connectionString,
  connectionTimeoutMillis: 8000,
  query_timeout: 15000,
  statement_timeout: 15000,
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  console.log('Connecting to Supabase database...');
  await client.connect();
  console.log('Connected. Applying schema...');
  await client.query(sql);
  console.log('Schema applied successfully.');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  if (/timeout expired/i.test(message)) {
    console.error('Database connection timed out. This usually means network access to the Supabase Postgres host is blocked or not reachable from this machine.');
  } else if (/ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|ETIMEDOUT/i.test(message)) {
    console.error(`Database connection failed: ${message}`);
  } else {
    console.error(`Schema import failed: ${message}`);
  }

  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
