'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ls-contact-'));
const { handleContact } = require('../backend/routes/contact');

const valid = { name: 'Sam Lee', email: 'sam@example.com', phone: '', service: 'seo', budget: 'not-sure', message: 'Please help us improve our search rankings.' };
const mockRes = () => ({ code: 200, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });
const mockReq = (body, json = true) => ({ body, is: () => json });
const file = () => path.join(process.env.DATA_DIR, 'enquiries.json');

test('valid enquiry -> 201 and saved to disk', async () => {
  const res = mockRes();
  await handleContact(mockReq(valid), res, assert.ifError);
  assert.equal(res.code, 201);
  assert.equal(res.body.success, true);
  const rows = JSON.parse(fs.readFileSync(file(), 'utf8'));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].service, 'SEO');
  assert.ok(rows[0].id && rows[0].createdAt);
});

test('invalid enquiry -> 422 with field errors, nothing saved', async () => {
  const res = mockRes();
  await handleContact(mockReq({ ...valid, email: 'bad' }), res, assert.ifError);
  assert.equal(res.code, 422);
  assert.ok(res.body.errors.email);
  assert.equal(JSON.parse(fs.readFileSync(file(), 'utf8')).length, 1);
});

test('honeypot -> fake success, nothing saved', async () => {
  const res = mockRes();
  await handleContact(mockReq({ ...valid, website: 'http://spam.example' }), res, assert.ifError);
  assert.equal(res.code, 201);
  assert.equal(JSON.parse(fs.readFileSync(file(), 'utf8')).length, 1);
});

test('non-JSON content type -> 415', async () => {
  const res = mockRes();
  await handleContact(mockReq(valid, false), res, assert.ifError);
  assert.equal(res.code, 415);
});
