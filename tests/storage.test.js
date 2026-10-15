'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createFileDriver } = require('../backend/utils/storage');

test('file driver saves concurrently without losing records', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ls-'));
  const driver = createFileDriver(dir);
  await Promise.all(Array.from({ length: 25 }, (_, i) => driver.save({ id: String(i), name: `n${i}` })));
  const rows = JSON.parse(fs.readFileSync(path.join(dir, 'enquiries.json'), 'utf8'));
  assert.equal(rows.length, 25);
  assert.equal((await driver.list(5)).length, 5);
});

test('file driver refuses to overwrite a corrupt file', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ls-'));
  fs.writeFileSync(path.join(dir, 'enquiries.json'), '{not json');
  await assert.rejects(createFileDriver(dir).save({ id: '1' }));
  assert.equal(fs.readFileSync(path.join(dir, 'enquiries.json'), 'utf8'), '{not json');
});
