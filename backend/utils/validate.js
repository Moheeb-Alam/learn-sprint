'use strict';

const { services } = require('../data/services');
const { BUDGETS, OTHER_SERVICE } = require('../data/options');

const SERVICES_BY_ID = new Map([...services, OTHER_SERVICE].map((s) => [s.id, s.title]));
const BUDGETS_BY_VALUE = new Map(BUDGETS.map((b) => [b.value, b.label]));

const LIMITS = { nameMin: 2, nameMax: 80, emailMax: 254, messageMin: 20, messageMax: 2000 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{7,25}$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const stripMarkup = (s) => s.replace(/<[^>]*>/g, '').replace(/[<>]/g, '');

/** Single-line text: no control characters, no markup, whitespace collapsed. */
function cleanLine(value) {
  if (typeof value !== 'string') return '';
  return stripMarkup(value.normalize('NFKC').replace(CONTROL_CHARS, '')).replace(/\s+/g, ' ').trim();
}

/** Multi-line text: keeps line breaks (max one blank line), removes markup and control characters. */
function cleanText(value) {
  if (typeof value !== 'string') return '';
  return stripMarkup(value.normalize('NFKC').replace(/\r\n?/g, '\n').replace(CONTROL_CHARS, ''))
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Validate and sanitize a contact-form payload.
 * @returns {{ valid: boolean, errors: Record<string,string>, data: object }}
 */
function validateContact(body) {
  const input = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const errors = {};

  const name = cleanLine(input.name);
  if (name.length < LIMITS.nameMin) errors.name = 'Enter your full name (at least 2 characters).';
  else if (name.length > LIMITS.nameMax) errors.name = `Name must be ${LIMITS.nameMax} characters or fewer.`;

  const email = cleanLine(input.email).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > LIMITS.emailMax) {
    errors.email = 'Enter a valid email address, like name@example.com.';
  }

  const phone = cleanLine(input.phone);
  if (phone) {
    const digits = phone.replace(/\D/g, '').length;
    if (!PHONE_RE.test(phone) || digits < 7 || digits > 15) {
      errors.phone = 'Enter a valid phone number, for example +92 300 1234567, or leave it blank.';
    }
  }

  const serviceId = cleanLine(input.service);
  if (!SERVICES_BY_ID.has(serviceId)) errors.service = 'Choose the service you need.';

  const budgetValue = cleanLine(input.budget);
  if (!BUDGETS_BY_VALUE.has(budgetValue)) errors.budget = 'Choose a budget range.';

  const message = cleanText(input.message);
  if (message.length < LIMITS.messageMin) {
    errors.message = 'Describe your project in at least 20 characters so we can give a useful reply.';
  } else if (message.length > LIMITS.messageMax) {
    errors.message = `Project description must be ${LIMITS.messageMax} characters or fewer.`;
  }

  const valid = Object.keys(errors).length === 0;
  return {
    valid,
    errors,
    data: valid
      ? {
          name,
          email,
          phone,
          service: SERVICES_BY_ID.get(serviceId),
          budget: BUDGETS_BY_VALUE.get(budgetValue),
          message,
        }
      : {},
  };
}

module.exports = { validateContact, cleanLine, cleanText, LIMITS };
