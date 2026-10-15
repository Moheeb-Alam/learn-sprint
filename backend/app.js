'use strict';

const express = require('express');
const config = require('./config');
const { securityHeaders } = require('./middleware/security');
const { createRateLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', 1); // correct client IPs behind Vercel / proxies

app.use(securityHeaders);

/* ---------- API ---------- */
const apiLimiter = createRateLimiter({ windowMs: config.rateLimit.windowMs, max: config.rateLimit.max });

app.use('/api', apiLimiter);
app.use('/api', express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/config', require('./routes/config'));
app.use('/api/services', require('./routes/services'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

/* ---------- SEO files (built from SITE_URL so they are right on any domain) ---------- */
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `  <url>\n    <loc>${config.siteUrl}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n` +
      `</urlset>\n`
  );
});

/* ---------- Static files ---------- */
const staticOptions = { maxAge: config.isProd ? '1d' : 0, etag: true };
app.use(express.static(config.paths.public, staticOptions)); // images, favicon, og image
app.use(express.static(config.paths.frontend, staticOptions)); // index.html, css, js

/* ---------- Fallbacks ---------- */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
