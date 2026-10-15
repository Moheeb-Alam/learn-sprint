'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'frontend', 'index.html'), 'utf8');
const { BUDGETS } = require('../backend/data/options');
const { services } = require('../backend/data/services');
const { projects, categories } = require('../backend/data/projects');

test('HTML budget options match the server list', () => {
  const block = html.match(/<select id="budget"[\s\S]*?<\/select>/)[0];
  const values = [...block.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(values, BUDGETS.map((b) => b.value));
});

test('every in-page link has a matching id', () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const dynamic = new Set(services.map((s) => `service-${s.id}`)); // rendered by JS
  const broken = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).filter((id) => !ids.has(id) && !dynamic.has(id));
  assert.deepEqual(broken, []);
});

test('service ids are unique and project data is consistent', () => {
  assert.equal(new Set(services.map((s) => s.id)).size, services.length);
  const cats = new Set(categories.map((c) => c.id));
  for (const p of projects) {
    assert.ok(cats.has(p.category), `${p.id} category`);
    assert.ok(p.demo === true, `${p.id} must be flagged as demo`);
    assert.ok(fs.existsSync(path.join(root, 'public', p.image)), `${p.id} image exists`);
  }
});

test('the nine required services are present', () => {
  assert.equal(services.length, 9);
});

test('no secrets in frontend files', () => {
  for (const f of ['js/main.js', 'js/api.js', 'index.html']) {
    const text = fs.readFileSync(path.join(root, 'frontend', f), 'utf8');
    assert.ok(!/SERVICE_KEY|ADMIN_TOKEN|supabase/i.test(text), f);
  }
});
