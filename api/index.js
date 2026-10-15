'use strict';

// Vercel entry point: exports the Express app as a serverless function.
// vercel.json rewrites every request to this file, so Express serves
// both the static site and the /api routes.
module.exports = require('../backend/app');
