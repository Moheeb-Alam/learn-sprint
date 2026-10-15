'use strict';
// End-to-end check of a RUNNING server.  Usage:  npm start   (in one terminal)
//                                                 npm run smoke   (in another)
// Or against a deployment:  BASE_URL=https://your-site.vercel.app npm run smoke
const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
let failed = 0;

async function check(name, fn) {
  try { await fn(); console.log(`  PASS  ${name}`); }
  catch (e) { failed++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
}
const eq = (a, b, msg) => { if (a !== b) throw new Error(`${msg || 'expected'}: got ${a}, wanted ${b}`); };
const post = (body) => fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

(async () => {
  console.log(`Smoke test against ${base}\n`);

  for (const p of ['/', '/css/styles.css', '/js/main.js', '/favicon.svg', '/robots.txt', '/sitemap.xml'])
    await check(`GET ${p} -> 200`, async () => eq((await fetch(base + p)).status, 200));

  await check('GET /does-not-exist -> 404', async () => eq((await fetch(base + '/does-not-exist')).status, 404));
  await check('GET /api/health', async () => eq((await (await fetch(`${base}/api/health`)).json()).status, 'ok'));
  await check('GET /api/services returns 9 services', async () => { const j = await (await fetch(`${base}/api/services`)).json(); eq(j.data.length, 9); });
  await check('GET /api/projects returns demo projects', async () => { const j = await (await fetch(`${base}/api/projects`)).json(); if (!j.data.length || !j.data.every((p) => p.demo)) throw new Error('bad data'); });
  await check('GET /api/projects?category=ai filters', async () => { const j = await (await fetch(`${base}/api/projects?category=ai`)).json(); if (!j.data.every((p) => p.category === 'ai')) throw new Error('not filtered'); });
  await check('GET /api/projects?category=nope -> 400', async () => eq((await fetch(`${base}/api/projects?category=nope`)).status, 400));
  await check('POST /api/contact invalid -> 422', async () => { const r = await post({ name: '', email: 'x' }); eq(r.status, 422); if (!(await r.json()).errors.email) throw new Error('no email error'); });
  await check('POST /api/contact valid -> 201', async () => {
    const r = await post({ name: 'Smoke Test', email: 'smoke@example.com', phone: '', service: 'seo', budget: 'not-sure', message: 'This is an automated smoke-test enquiry from the test script.' });
    eq(r.status, 201); eq((await r.json()).success, true);
  });
  await check('POST /api/contact bad JSON -> 400', async () => eq((await fetch(`${base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' })).status, 400));

  console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
  process.exit(failed ? 1 : 0);
})();
