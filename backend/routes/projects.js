'use strict';

const express = require('express');
const { categories, projects } = require('../data/projects');

const router = express.Router();

// GET /api/projects            -> all projects
// GET /api/projects?category=x -> only one category
router.get('/', (req, res) => {
  const { category } = req.query;
  let data = projects;

  if (category !== undefined) {
    if (typeof category !== 'string' || !categories.some((c) => c.id === category)) {
      return res.status(400).json({
        success: false,
        message: `Unknown category. Use one of: ${categories.map((c) => c.id).join(', ')}.`,
      });
    }
    data = projects.filter((p) => p.category === category);
  }

  res.set('Cache-Control', 'public, max-age=300');
  return res.json({ success: true, count: data.length, categories, data });
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
  res.set('Cache-Control', 'public, max-age=300');
  return res.json({ success: true, data: project });
});

module.exports = router;
