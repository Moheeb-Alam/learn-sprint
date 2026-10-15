'use strict';

const express = require('express');
const { services } = require('../data/services');

const router = express.Router();

// GET /api/services
router.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ success: true, count: services.length, data: services });
});

// GET /api/services/:id
router.get('/:id', (req, res) => {
  const service = services.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
  res.set('Cache-Control', 'public, max-age=300');
  return res.json({ success: true, data: service });
});

module.exports = router;
