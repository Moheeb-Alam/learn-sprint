'use strict';

require('dotenv').config();
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const isVercel = Boolean(process.env.VERCEL);
const env = process.env.NODE_ENV || 'development';

const int = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const str = (value, fallback = '') => (typeof value === 'string' && value.trim() ? value.trim() : fallback);

const config = {
  root,
  env,
  isProd: env === 'production' || isVercel,
  isVercel,
  port: int(process.env.PORT, 3000),
  siteUrl: str(process.env.SITE_URL, 'http://localhost:3000').replace(/\/+$/, ''),
  trustProxy: isVercel || process.env.TRUST_PROXY === '1',

  paths: {
    frontend: path.join(root, 'frontend'),
    public: path.join(root, 'public'),
    data: str(process.env.DATA_DIR, isVercel ? '/tmp/learnsprint' : path.join(root, 'backend', 'storage')),
  },

  storage: {
    driver: str(process.env.STORAGE_DRIVER, 'file').toLowerCase(),
    supabaseUrl: str(process.env.SUPABASE_URL),
    supabaseKey: str(process.env.SUPABASE_SERVICE_KEY),
    supabaseTable: str(process.env.SUPABASE_TABLE, 'enquiries'),
  },

  rateLimit: {
    windowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: int(process.env.RATE_LIMIT_MAX, 100),
    contactWindowMs: int(process.env.CONTACT_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
    contactMax: int(process.env.CONTACT_RATE_LIMIT_MAX, 5),
  },

  adminToken: str(process.env.ADMIN_TOKEN),

  // Public, non-secret details that the frontend may display.
  company: {
    name: 'LearnSprint.ink',
    email: str(process.env.COMPANY_EMAIL, 'hello@learnsprint.ink'),
    phone: str(process.env.COMPANY_PHONE),
    social: {
      linkedin: str(process.env.SOCIAL_LINKEDIN),
      github: str(process.env.SOCIAL_GITHUB),
      x: str(process.env.SOCIAL_X),
      facebook: str(process.env.SOCIAL_FACEBOOK),
    },
  },
};

module.exports = config;
