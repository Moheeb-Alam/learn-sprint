'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateContact } = require('../backend/utils/validate');

const good = {
  name: 'Ayesha Khan',
  email: 'Ayesha@Example.com',
  phone: '+92 300 1234567',
  service: 'website-development',
  budget: '500-1000',
  message: 'We need a new website for our school with an online admissions form.',
};

test('accepts a valid enquiry and normalises it', () => {
  const r = validateContact(good);
  assert.equal(r.valid, true);
  assert.equal(r.data.email, 'ayesha@example.com');
  assert.equal(r.data.service, 'Website Development');
  assert.equal(r.data.budget, '$500 – $1,000');
});

test('phone is optional', () => {
  assert.equal(validateContact({ ...good, phone: '' }).valid, true);
});

test('rejects missing / invalid fields with per-field messages', () => {
  const r = validateContact({ name: 'A', email: 'nope', phone: 'abc', service: 'x', budget: 'y', message: 'short' });
  assert.equal(r.valid, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['budget', 'email', 'message', 'name', 'phone', 'service']);
});

test('strips HTML and control characters', () => {
  const r = validateContact({ ...good, name: '<b>Sam</b>\u0000 <script>alert(1)</script>Lee', message: good.message + ' <img src=x onerror=alert(1)>' });
  assert.equal(r.valid, true);
  assert.ok(!/[<>]/.test(r.data.name + r.data.message));
  assert.ok(!r.data.name.includes('\u0000'));
});

test('newlines in single-line fields cannot inject headers', () => {
  const r = validateContact({ ...good, name: 'Sam\r\nBcc: evil@example.com' });
  assert.ok(!/[\r\n]/.test(r.data.name));
});

test('rejects non-string and oversized values', () => {
  assert.equal(validateContact({ ...good, name: { $gt: '' } }).valid, false);
  assert.equal(validateContact({ ...good, message: 'x'.repeat(2001) }).valid, false);
  assert.equal(validateContact(null).valid, false);
  assert.equal(validateContact([]).valid, false);
});
