import { icon, hydrateIcons } from './icons.js';
import { getServices, getProjects, getConfig, sendContact } from './api.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Tiny element builder. Uses textContent only, so API data is never parsed as HTML. */
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value; // only used with trusted, static icon markup
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of [].concat(children)) {
    if (child) node.append(child.nodeType ? child : document.createTextNode(child));
  }
  return node;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ Navigation */
function initNav() {
  const toggle = $('.nav-toggle');
  const nav = $('#primary-nav');
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });

  // Highlight the link of the section currently in view
  const links = $$('.nav a[href^="#"]:not(.btn)');
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.remove('is-active'));
      const link = byId.get(entry.target.id);
      if (link) link.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) observer.observe(s); });
}

/* ------------------------------------------------------------------ Hero animation */
function initHero() {
  const build = $('.build');
  if (!build) return;
  let stage = 1;
  const set = (n) => { stage = n; build.dataset.stage = String(n); };
  if (reducedMotion) return set(6);
  let timer = setInterval(() => set(stage === 6 ? 1 : stage + 1), 1800);
  document.addEventListener('visibilitychange', () => {
    clearInterval(timer);
    if (!document.hidden) timer = setInterval(() => set(stage === 6 ? 1 : stage + 1), 1800);
  });
}

/* ------------------------------------------------------------------ Services */
let services = [];

function renderServices(list) {
  const grid = $('#services-grid');
  grid.replaceChildren(
    ...list.map((s) =>
      el('article', { class: 'service', id: `service-${s.id}` }, [
        el('div', { class: 'service__icon', html: icon(s.icon, 24) }),
        el('h3', { text: s.title }),
        el('p', { text: s.summary }),
        el('ul', {}, s.features.map((f) => el('li', { html: icon('check', 18) }, [el('span', { text: f })]))),
      ])
    )
  );
}

function fillServiceSelect(list) {
  const select = $('#service');
  const other = select.querySelector('option[value="other"]');
  list.forEach((s) => select.insertBefore(el('option', { value: s.id, text: s.title }), other));
}

function showError(container, message, retry) {
  container.replaceChildren(
    el('div', { class: 'error-box', role: 'alert' }, [
      message + ' ',
      el('button', { type: 'button', text: 'Try again' }),
    ])
  );
  container.querySelector('button').addEventListener('click', retry);
}

async function loadServices() {
  const grid = $('#services-grid');
  try {
    services = (await getServices()).data;
    renderServices(services);
    if (!$('#service option[value="website-development"]')) fillServiceSelect(services);
    // If the page was opened with #service-… in the URL, jump there now the cards exist
    if (location.hash.startsWith('#service-')) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  } catch (err) {
    showError(grid, 'We could not load the services list.', loadServices);
  }
}

/* ------------------------------------------------------------------ Portfolio */
let projects = [];
let categories = [];
let activeCategory = 'all';

const CATEGORY_TO_SERVICE = {
  websites: 'website-development',
  'web-apps': 'custom-web-applications',
  ecommerce: 'ecommerce-development',
  education: 'school-management-systems',
  ai: 'ai-chatbots',
};

function renderFilters() {
  const wrap = $('#project-filters');
  const all = [{ id: 'all', label: 'All' }, ...categories];
  wrap.replaceChildren(
    ...all.map((c) => {
      const btn = el('button', { type: 'button', class: 'filter', 'data-category': c.id, 'aria-pressed': String(c.id === activeCategory), text: c.label });
      btn.addEventListener('click', () => {
        activeCategory = c.id;
        $$('.filter', wrap).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        renderProjects();
      });
      return btn;
    })
  );
}

function renderProjects() {
  const grid = $('#projects-grid');
  const labelFor = (id) => (categories.find((c) => c.id === id) || {}).label || id;
  const visible = projects.filter((p) => activeCategory === 'all' || p.category === activeCategory);

  grid.replaceChildren(
    ...visible.map((p) => {
      const link = el('a', { class: 'project__link', href: '#contact', text: 'Request something similar' });
      link.addEventListener('click', () => prefillContact({
        service: CATEGORY_TO_SERVICE[p.category],
        message: `I'd like something similar to the demonstration project "${p.title}". `,
      }));
      return el('article', { class: 'project' }, [
        el('div', { class: 'project__media' }, [
          el('img', { src: p.image, alt: p.imageAlt || p.title, width: 800, height: 500, loading: 'lazy', decoding: 'async' }),
          p.demo ? el('span', { class: 'badge', text: 'Demonstration project' }) : null,
        ]),
        el('div', { class: 'project__body' }, [
          el('p', { class: 'project__cat', text: labelFor(p.category) }),
          el('h3', { text: p.title }),
          el('p', { text: p.description }),
          el('ul', { class: 'tags', 'aria-label': 'Technologies' }, p.technologies.map((t) => el('li', { text: t }))),
          link,
        ]),
      ]);
    })
  );
}

async function loadProjects() {
  const grid = $('#projects-grid');
  try {
    const res = await getProjects();
    projects = res.data;
    categories = res.categories;
    renderFilters();
    renderProjects();
  } catch (err) {
    showError(grid, 'We could not load the portfolio.', loadProjects);
  }
}

/* ------------------------------------------------------------------ Process */
const STEPS = [
  { name: 'Discovery', text: 'We learn about your goals, your audience and what is not working today, so we solve the right problem.', points: ['A short call or message exchange', 'Questions about goals, users and content', 'A list of must-have and nice-to-have features'], out: 'A shared understanding of the project.' },
  { name: 'Planning', text: 'We turn what we learned into a clear scope, a timeline and a written quote.', points: ['Page and feature list', 'Technology and hosting recommendation', 'Timeline with review points'], out: 'A written proposal and quote.' },
  { name: 'Design', text: 'We shape the look and structure before any code is written, so changes are cheap to make.', points: ['Layout and navigation plan', 'Colours, typography and components', 'Mobile and desktop views'], out: 'Designs for your review and approval.' },
  { name: 'Development', text: 'We build the approved design with clean, documented code and show progress as we go.', points: ['Frontend and backend built together', 'Database and integrations', 'Regular progress updates'], out: 'A working version you can try.' },
  { name: 'Testing', text: 'We test features, forms and layouts on real devices and browsers and fix what we find.', points: ['Functional and form testing', 'Mobile, tablet and desktop checks', 'Security and performance review'], out: 'A tested, reviewed build.' },
  { name: 'Launch', text: 'We deploy to your hosting, connect your domain and stay close during the first days live.', points: ['Deployment and domain setup', 'Final checks on the live site', 'Handover and documentation'], out: 'Your live project, plus support if you need it.' },
];

function initProcess() {
  const tabs = $('#process-tabs');
  const panel = $('#process-panel');
  const buttons = STEPS.map((s, i) =>
    el('button', { type: 'button', role: 'tab', class: 'process__tab', id: `step-tab-${i}`, 'aria-selected': 'false', 'aria-controls': 'process-panel', tabindex: '-1' }, [el('span', { text: String(i + 1) }), s.name])
  );
  tabs.replaceChildren(...buttons);

  const select = (i, focus = false) => {
    const s = STEPS[i];
    buttons.forEach((b, j) => { b.setAttribute('aria-selected', String(j === i)); b.tabIndex = j === i ? 0 : -1; });
    panel.setAttribute('aria-labelledby', `step-tab-${i}`);
    panel.replaceChildren(
      el('h3', { text: `${i + 1}. ${s.name}` }),
      el('p', { text: s.text }),
      el('ul', {}, s.points.map((p) => el('li', { html: icon('check', 18) }, [el('span', { text: p })]))),
      el('p', { class: 'deliver' }, [el('strong', { text: 'You receive: ' }), s.out])
    );
    if (focus) buttons[i].focus();
  };

  buttons.forEach((b, i) => b.addEventListener('click', () => select(i)));
  tabs.addEventListener('keydown', (e) => {
    const current = buttons.findIndex((b) => b.getAttribute('aria-selected') === 'true');
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) { e.preventDefault(); select((current + keys[e.key] + buttons.length) % buttons.length, true); }
    if (e.key === 'Home') { e.preventDefault(); select(0, true); }
    if (e.key === 'End') { e.preventDefault(); select(buttons.length - 1, true); }
  });
  select(0);
}

/* ------------------------------------------------------------------ Contact form */
const form = $('#contact-form');
const statusBox = $('#form-status');
let lastPrefill = '';

function prefillContact({ service, message }) {
  if (service && $(`#service option[value="${service}"]`)) $('#service').value = service;
  const box = $('#message');
  if (message && (box.value.trim() === '' || box.value === lastPrefill)) {
    box.value = message;
    lastPrefill = message;
    updateCounter();
  }
}

function initPackages() {
  $$('[data-package]').forEach((a) =>
    a.addEventListener('click', () => prefillContact({
      service: a.dataset.service,
      message: `I'd like a quote for the ${a.dataset.package} package. `,
    }))
  );
}

function updateCounter() {
  $('#message-count').textContent = `${$('#message').value.length} / 2000`;
}

const RULES = {
  name: (v) => (v.trim().length < 2 ? 'Enter your full name (at least 2 characters).' : ''),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@example.com.'),
  phone: (v) => { const t = v.trim(); if (!t) return ''; const d = t.replace(/\D/g, '').length; return /^\+?[\d\s().-]{7,25}$/.test(t) && d >= 7 && d <= 15 ? '' : 'Enter a valid phone number, for example +92 300 1234567, or leave it blank.'; },
  service: (v) => (v ? '' : 'Choose the service you need.'),
  budget: (v) => (v ? '' : 'Choose a budget range.'),
  message: (v) => (v.trim().length < 20 ? 'Describe your project in at least 20 characters so we can give a useful reply.' : ''),
};

function setFieldError(name, message) {
  const input = form.elements[name];
  const out = $(`#err-${name}`);
  if (!input || !out) return;
  out.textContent = message || '';
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

function showStatus(type, message) {
  statusBox.className = `form__status is-${type}`;
  statusBox.textContent = message;
}

function setSubmitting(busy) {
  const btn = $('#submit-btn');
  btn.disabled = busy;
  btn.replaceChildren(busy ? el('span', { class: 'spinner', 'aria-hidden': 'true' }) : '', el('span', { class: 'btn__label', text: busy ? 'Sending…' : 'Send enquiry' }));
}

function initForm() {
  $('#message').addEventListener('input', updateCounter);
  Object.keys(RULES).forEach((name) => {
    const input = form.elements[name];
    input.addEventListener('blur', () => setFieldError(name, RULES[name](input.value)));
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid')) setFieldError(name, RULES[name](input.value)); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusBox.className = 'form__status';
    statusBox.textContent = '';

    let firstInvalid = null;
    for (const name of Object.keys(RULES)) {
      const msg = RULES[name](form.elements[name].value);
      setFieldError(name, msg);
      if (msg && !firstInvalid) firstInvalid = form.elements[name];
    }
    if (firstInvalid) {
      showStatus('error', 'Please correct the highlighted fields and try again.');
      firstInvalid.focus();
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    setSubmitting(true);
    try {
      const res = await sendContact(payload);
      form.reset();
      lastPrefill = '';
      updateCounter();
      Object.keys(RULES).forEach((n) => setFieldError(n, ''));
      showStatus('success', res.message);
      statusBox.focus();
    } catch (err) {
      Object.entries(err.errors || {}).forEach(([field, msg]) => setFieldError(field, msg));
      showStatus('error', err.message);
      const firstServerError = Object.keys(err.errors || {})[0];
      if (firstServerError && form.elements[firstServerError]) form.elements[firstServerError].focus();
    } finally {
      setSubmitting(false);
    }
  });
}

/* ------------------------------------------------------------------ Company details & footer */
const SOCIAL_LABELS = { linkedin: 'LinkedIn', github: 'GitHub', x: 'X', facebook: 'Facebook' };

async function loadCompany() {
  try {
    const { data } = await getConfig();
    if (data.email) {
      ['#contact-email', '#footer-email'].forEach((sel) => {
        const a = $(sel);
        a.href = `mailto:${data.email}`;
        a.textContent = data.email;
      });
    }
    if (data.phone) {
      const tel = data.phone.replace(/[^\d+]/g, '');
      $('#contact-details').append(el('li', { html: icon('call', 20) }, [el('a', { href: `tel:${tel}`, text: data.phone })]));
      $('#footer-contact').prepend(el('li', {}, [el('a', { href: `tel:${tel}`, text: data.phone })]));
    }
    const social = $('#social-links');
    Object.entries(data.social || {}).forEach(([key, url]) => {
      social.append(el('li', {}, [el('a', { href: url, target: '_blank', rel: 'noopener noreferrer', text: SOCIAL_LABELS[key] || key })]));
    });
  } catch {
    /* The static fallback details in the HTML stay in place. */
  }
}

/* ------------------------------------------------------------------ Init */
hydrateIcons();
$('#year').textContent = new Date().getFullYear();
initNav();
initHero();
initProcess();
initPackages();
initForm();
loadServices();
loadProjects();
loadCompany();
