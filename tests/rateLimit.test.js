'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createRateLimiter } = require('../backend/middleware/rateLimit');

function mockRes() {
  return { headers: {}, code: 200, body: null, set(k, v) { this.headers[k] = v; return this; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } };
}

test('blocks after max requests and sets Retry-After', () => {
  const limit = createRateLimiter({ windowMs: 60000, max: 3 });
  const req = { ip: '1.2.3.4' };
  let passed = 0;
  for (let i = 0; i < 3; i++) limit(req, mockRes(), () => passed++);
  const res = mockRes();
  limit(req, res, () => passed++);
  assert.equal(passed, 3);
  assert.equal(res.code, 429);
  assert.ok(res.headers['Retry-After']);
});

test('tracks clients separately', () => {
  const limit = createRateLimiter({ windowMs: 60000, max: 1 });
  let passed = 0;
  limit({ ip: 'a' }, mockRes(), () => passed++);
  limit({ ip: 'b' }, mockRes(), () => passed++);
  assert.equal(passed, 2);
});
