#!/usr/bin/env node
// Applies all pending SQL migrations to your Supabase project.
// Usage: npm run migrate
//
// Requires SUPABASE_ACCESS_TOKEN in .env.local
// Get one at: https://supabase.com/dashboard/account/tokens

const fs   = require('fs');
const path = require('path');

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
    });
}

// ── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ACCESS_TOKEN   = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_URL)   { console.error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local'); process.exit(1); }
if (!ACCESS_TOKEN)   { console.error('Missing SUPABASE_ACCESS_TOKEN in .env.local\nGet one at: https://supabase.com/dashboard/account/tokens'); process.exit(1); }

// Extract project ref from URL: https://<ref>.supabase.co
const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
const API_URL    = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

// ── Helpers ──────────────────────────────────────────────────────────────────
async function runSQL(sql) {
  const res = await fetch(API_URL, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function ensureMigrationsTable() {
  await runSQL(`
    create table if not exists public._migrations (
      id         serial primary key,
      filename   text not null unique,
      applied_at timestamptz default now() not null
    );
  `);
}

async function getApplied() {
  const rows = await runSQL(`select filename from public._migrations order by id;`);
  return new Set(rows.map((r) => r.filename));
}

async function markApplied(filename) {
  await runSQL(`insert into public._migrations (filename) values ('${filename}');`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  console.log(`\nConnecting to project: ${projectRef}\n`);

  await ensureMigrationsTable();
  const applied = await getApplied();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ✓ ${file} (already applied)`);
      continue;
    }

    process.stdout.write(`  → ${file} ... `);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await runSQL(sql);
    await markApplied(file);
    console.log('done');
    ran++;
  }

  console.log(ran === 0 ? '\nAll migrations already applied.' : `\n${ran} migration(s) applied.`);
})().catch((err) => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
