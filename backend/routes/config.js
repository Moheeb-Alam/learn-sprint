'use strict';

const express = require('express');
const config = require('../config');

const router = express.Router();

// GET /api/config — public, non-secret details for the footer and contact section.
router.get('/', (req, res) => {
  const social = Object.fromEntries(Object.entries(config.company.social).filter(([, url]) => /^https?:\/\//i.test(url)));
  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    success: true,
    data: { name: config.company.name, email: config.company.email, phone: config.company.phone, social },
  });
});

module.exports = router;
