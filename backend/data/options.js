'use strict';

// Budget ranges offered on the contact form.
// Keep in sync with the <option> values in frontend/index.html (tests/site.test.js checks this).
const BUDGETS = [
  { value: 'under-500', label: 'Under $500' },
  { value: '500-1000', label: '$500 – $1,000' },
  { value: '1000-3000', label: '$1,000 – $3,000' },
  { value: '3000-10000', label: '$3,000 – $10,000' },
  { value: '10000-plus', label: '$10,000 or more' },
  { value: 'not-sure', label: 'Not sure yet' },
];

const OTHER_SERVICE = { id: 'other', title: 'Other / not sure yet' };

module.exports = { BUDGETS, OTHER_SERVICE };
