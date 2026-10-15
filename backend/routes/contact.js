'use strict';

const express = require('express');
const config = require('../config');
const { validateContact } = require('../utils/validate');
const { saveEnquiry } = require('../utils/storage');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const contactLimiter = createRateLimiter({
  windowMs: config.rateLimit.contactWindowMs,
  max: config.rateLimit.contactMax,
  message: 'You have sent several enquiries recently. Please wait a while before sending another, or email us directly.',
});

const SUCCESS_MESSAGE = 'Thank you! Your enquiry has been received and we will reply to your email address.';

/** Exported separately so it can be unit-tested without Express. */
async function handleContact(req, res, next) {
  try {
    if (typeof req.is === 'function' && !req.is('application/json')) {
      return res.status(415).json({ success: false, message: 'Send the form as application/json.' });
    }

    const body = req.body || {};

    // Honeypot: real visitors never see or fill this field. Pretend success, save nothing.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return res.status(201).json({ success: true, message: SUCCESS_MESSAGE });
    }

    const { valid, errors, data } = validateContact(body);
    if (!valid) {
      return res.status(422).json({ success: false, message: 'Please correct the highlighted fields.', errors });
    }

    try {
      await saveEnquiry(data);
    } catch (err) {
      console.error('[contact] could not save enquiry:', err.message);
      return res.status(500).json({
        success: false,
        message: `We could not save your enquiry. Please try again, or email ${config.company.email}.`,
      });
    }

    return res.status(201).json({ success: true, message: SUCCESS_MESSAGE });
  } catch (err) {
    return next(err);
  }
}

// POST /api/contact
router.post('/', contactLimiter, handleContact);

module.exports = router;
module.exports.handleContact = handleContact;
module.exports.contactLimiter = contactLimiter;
