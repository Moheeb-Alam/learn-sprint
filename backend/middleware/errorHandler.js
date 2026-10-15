'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');

const notFoundPage = path.join(config.paths.frontend, '404.html');

/** 404 for anything not matched earlier. API paths get JSON, everything else the 404 page. */
function notFound(req, res) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Not found.' });
  }
  res.status(404);
  if (req.accepts('html') && fs.existsSync(notFoundPage)) return res.sendFile(notFoundPage);
  return res.type('text/plain').send('Page not found.');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Malformed JSON, oversized body, etc. (raised by express.json)
  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) {
    const tooLarge = err.type === 'entity.too.large';
    return res.status(tooLarge ? 413 : 400).json({
      success: false,
      message: tooLarge ? 'The request is too large.' : 'The request body is not valid JSON.',
    });
  }

  console.error('[error]', err && err.stack ? err.stack : err);
  const body = { success: false, message: 'Something went wrong on our side. Please try again shortly.' };
  if (!config.isProd && err && err.message) body.detail = err.message;
  return res.status(500).json(body);
}

module.exports = { notFound, errorHandler };
