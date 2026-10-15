'use strict';

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');

/* ---------- File driver (local development / servers with a persistent disk) ---------- */
function createFileDriver(dir) {
  const file = path.join(dir, 'enquiries.json');
  let queue = Promise.resolve(); // serialise writes so concurrent requests cannot corrupt the file

  async function read() {
    try {
      const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err; // unreadable/corrupt file: fail loudly rather than overwrite it
    }
  }

  async function write(rows) {
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 2), 'utf8');
    await fs.rename(tmp, file);
  }

  return {
    name: 'file',
    save(record) {
      const run = queue.then(async () => {
        const rows = await read();
        rows.push(record);
        await write(rows);
      });
      queue = run.catch(() => {});
      return run;
    },
    async list(limit) {
      const rows = await read();
      return rows.slice(-limit).reverse();
    },
  };
}

/* ---------- Supabase driver (REST API, no extra dependency) ---------- */
function createSupabaseDriver({ url, key, table }) {
  const base = `${url.replace(/\/+$/, '')}/rest/v1/${encodeURIComponent(table)}`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  async function call(target, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(target, { ...options, signal: controller.signal });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Supabase responded ${res.status}: ${text.slice(0, 200)}`);
      }
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    name: 'supabase',
    async save(record) {
      await call(base, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({
          id: record.id,
          created_at: record.createdAt,
          name: record.name,
          email: record.email,
          phone: record.phone || null,
          service: record.service,
          budget: record.budget,
          message: record.message,
        }),
      });
    },
    async list(limit) {
      const res = await call(`${base}?select=*&order=created_at.desc&limit=${Number(limit) || 50}`, { headers });
      return res.json();
    },
  };
}

/* ---------- Selection ---------- */
let driver;

function getStorage() {
  if (driver) return driver;
  const { driver: choice, supabaseUrl, supabaseKey, supabaseTable } = config.storage;

  if (choice === 'supabase') {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('STORAGE_DRIVER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_KEY.');
    }
    driver = createSupabaseDriver({ url: supabaseUrl, key: supabaseKey, table: supabaseTable });
  } else if (choice === 'file') {
    driver = createFileDriver(config.paths.data);
  } else {
    throw new Error(`Unknown STORAGE_DRIVER "${choice}". Use "file" or "supabase".`);
  }
  return driver;
}

/** Test helper: forget the cached driver. */
function resetStorage() {
  driver = undefined;
}

async function saveEnquiry(data) {
  const record = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data };
  await getStorage().save(record);
  return record;
}

async function listEnquiries(limit = 50) {
  return getStorage().list(Math.min(Math.max(Number(limit) || 50, 1), 200));
}

module.exports = { saveEnquiry, listEnquiries, getStorage, resetStorage, createFileDriver, createSupabaseDriver };
