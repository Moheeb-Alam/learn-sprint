'use strict';

const crypto = require('crypto');
const express = require('express');
const config = require('../config');
const { listEnquiries } = require('../utils/storage');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const adminLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many attempts. Try again later.',
});

const digest = (value) => crypto.createHash('sha256').update(String(value)).digest();

function requireAdmin(req, res, next) {
  // Disabled entirely until ADMIN_TOKEN is set — the route then looks like any other 404.
  if (!config.adminToken) return res.status(404).json({ success: false, message: 'Not found.' });

  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !crypto.timingSafeEqual(digest(token), digest(config.adminToken))) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
  return next();
}

// GET /api/admin/enquiries?limit=50   (Authorization: Bearer <ADMIN_TOKEN>)
router.get('/enquiries', adminLimiter, requireAdmin, async (req, res, next) => {
  try {
    const data = await listEnquiries(req.query.limit);
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
