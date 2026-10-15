# LearnSprint.ink

A complete company website for **LearnSprint.ink**: a vanilla HTML/CSS/JS frontend served by a Node.js + Express backend with a working contact form, REST endpoints, validation, rate limiting and persistent storage.

```
learnsprint-ink/
├── frontend/              HTML, CSS and JavaScript for the site (index.html, 404.html, css/, js/)
├── public/                Static assets: favicon, project images, social-share image
├── backend/
│   ├── config/            Environment-based configuration
│   ├── routes/            contact, services, projects, config, admin
│   ├── middleware/        security headers, rate limiter, error handling
│   ├── utils/             validation/sanitisation and storage (file or Supabase)
│   ├── data/              services, portfolio projects and form option lists
│   ├── storage/           enquiries.json is written here locally (git-ignored)
│   ├── app.js             Express app (exported, used by both local server and Vercel)
│   └── server.js          Starts the app locally
├── api/index.js           Vercel serverless entry point
├── scripts/               smoke test + asset generator
├── tests/                 Unit tests (node:test)
├── vercel.json            Vercel configuration
├── .env.example           Template for environment variables
└── package.json
```

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/services` | The nine services (`/api/services/:id` for one) |
| GET | `/api/projects` | Portfolio projects (`?category=ai` to filter, `/api/projects/:id` for one) |
| POST | `/api/contact` | Validate and save an enquiry (JSON body) |
| GET | `/api/config` | Public company details shown in the footer |
| GET | `/api/health` | Health check |
| GET | `/api/admin/enquiries` | List saved enquiries (needs `Authorization: Bearer <ADMIN_TOKEN>`; disabled until you set one) |

---

## 1. Install Node.js and dependencies

1. Download the **LTS** version of Node.js from <https://nodejs.org> (version 18 or newer) and install it.
2. Open a terminal and confirm: `node -v` and `npm -v` both print a version.
3. Unzip the project, then in the project folder run:

```bash
npm install
```

## 2. Run locally in VS Code

1. Install [VS Code](https://code.visualstudio.com), then **File → Open Folder…** and choose the project folder.
2. Open the integrated terminal (**Terminal → New Terminal**).
3. Create your environment file (see step 3), then start the server:

```bash
npm start          # normal start
npm run dev        # restarts automatically when you edit backend files
```

4. Open <http://localhost:3000>. Stop the server with `Ctrl + C`.

## 3. Configure environment variables and storage

Copy the template and edit it:

```bash
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

Never commit `.env`. It is already listed in `.gitignore`. The most important settings:

| Variable | What it does |
|---|---|
| `SITE_URL` | Your public URL (used in `sitemap.xml` and `robots.txt`) |
| `STORAGE_DRIVER` | `file` (default) or `supabase` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Only for `supabase`. **Secret, server-side only.** |
| `ADMIN_TOKEN` | Optional. Lets you read saved enquiries via the admin endpoint |
| `COMPANY_EMAIL`, `COMPANY_PHONE`, `SOCIAL_*` | Contact details and social links shown in the footer (blank = hidden) |
| `CONTACT_RATE_LIMIT_MAX` | Enquiries allowed per IP per window (default 5 per hour) |

### Option A: file storage (local development)
Nothing to set up. Each enquiry is appended to `backend/storage/enquiries.json`. This file holds personal data and is git-ignored. It is **not suitable for Vercel**, because serverless functions have no persistent disk.

### Option B: Supabase (recommended for Vercel)
1. Create a free project at <https://supabase.com>.
2. Open **SQL Editor** and run:

```sql
create table enquiries (
  id         uuid primary key,
  created_at timestamptz not null default now(),
  name       text not null,
  email      text not null,
  phone      text,
  service    text not null,
  budget     text not null,
  message    text not null
);
alter table enquiries enable row level security;  -- no public policies: only the server key can read/write
```

3. In **Project Settings → API**, copy the **Project URL** and the **service_role** key.
4. Put them in `.env`:

```
STORAGE_DRIVER=supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

View enquiries in Supabase under **Table Editor → enquiries**.

### Reading enquiries
- File storage: open `backend/storage/enquiries.json`.
- Or set `ADMIN_TOKEN` and call:
  ```bash
  curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/admin/enquiries
  ```

## 4. Test everything

**Automated tests** (validation, sanitising, storage, rate limiting, link and data checks):

```bash
npm test
```

**Endpoint smoke test** (start the server in one terminal, run this in another):

```bash
npm run smoke
# or against a live site:  BASE_URL=https://your-site.vercel.app npm run smoke
```

> The smoke test submits one test enquiry, which you can delete afterwards.

**Manual checklist**
- [ ] Every nav link scrolls to its section; the mobile menu opens and closes (also with Esc)
- [ ] Hero buttons: *Get a Quote* → contact form, *Explore Our Services* → services
- [ ] Portfolio filters change the visible projects; each card shows a *Demonstration project* badge
- [ ] Process steps change when clicked (and with arrow keys)
- [ ] FAQ items open and close
- [ ] Pricing *Request a Quote* buttons jump to the form and pre-select a service
- [ ] Submit the form empty → field errors appear. Submit it correctly → green success message and a new record in storage
- [ ] Open <http://localhost:3000/api/services> and <http://localhost:3000/api/projects> in the browser
- [ ] Open <http://localhost:3000/nothing-here> → the 404 page
- [ ] Resize the browser (or use DevTools device mode) to check mobile and tablet layouts

## 5. Upload to GitHub

1. Install Git from <https://git-scm.com/downloads>, then set your identity once:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```
2. Create an account at <https://github.com>, click **New repository**, name it (for example `learnsprint-ink`), choose Public or Private, and **do not** tick "Add a README" (the project already has one). Click **Create repository**.
3. In the project folder (VS Code terminal):
   ```bash
   git init
   git add .
   git status            # check that .env and node_modules are NOT listed
   git commit -m "Initial commit: LearnSprint.ink website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/learnsprint-ink.git
   git push -u origin main
   ```
4. When asked to sign in, use the browser prompt, or a Personal Access Token (GitHub → Settings → Developer settings → Personal access tokens) as the password.

Prefer a visual tool? Use **GitHub Desktop** → *Add local repository* → *Publish repository*.

Later updates: `git add . && git commit -m "Describe change" && git push`.

## 6. Deploy to Vercel (frontend + backend together)

The project is already set up for Vercel: `api/index.js` exports the Express app, and `vercel.json` sends every request to it, so one deployment serves both the website and the `/api` endpoints.

1. Make sure the code is on GitHub (step 5) and you have a Supabase project (step 3, Option B).
2. Sign in at <https://vercel.com> with your GitHub account.
3. Click **Add New… → Project**, then **Import** your `learnsprint-ink` repository.
4. Settings: **Framework Preset: Other**. Leave Build Command and Output Directory empty.
5. Open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `SITE_URL` | `https://learnsprint.ink` (or your `*.vercel.app` URL at first) |
   | `STORAGE_DRIVER` | `supabase` |
   | `SUPABASE_URL` | your Supabase project URL |
   | `SUPABASE_SERVICE_KEY` | your service_role key |
   | `ADMIN_TOKEN` | a long random string (optional) |
   | `COMPANY_EMAIL` | your public contact email |

6. Click **Deploy**. When it finishes, open the URL Vercel gives you and run:
   ```bash
   BASE_URL=https://your-project.vercel.app npm run smoke
   ```
7. **Custom domain:** in the project go to **Settings → Domains**, add `learnsprint.ink` and `www.learnsprint.ink`, and create the DNS records Vercel shows at your domain registrar. HTTPS is automatic.
8. Every `git push` to `main` redeploys automatically.

**CLI alternative:** `npm i -g vercel`, then `vercel` (preview) and `vercel --prod` (production).

### Other hosts
Because it is a standard Express app, it also runs on Render, Railway, Fly.io or any VPS: `npm install`, set the same environment variables, start with `npm start`. On a host with a persistent disk, `STORAGE_DRIVER=file` works.

---

## Things to review before going live

- **Contact email.** The site defaults to `hello@learnsprint.ink`. Set `COMPANY_EMAIL` to a mailbox you actually monitor.
- **Budget ranges** are in USD. To change them, edit `backend/data/options.js` **and** the `<option>` list in `frontend/index.html` (`npm test` checks they match).
- **Portfolio** entries are demonstrations (marked `demo: true`). Add real case studies in `backend/data/projects.js`.
- **Testimonials** are labelled samples. Replace them in `frontend/index.html` when you have real reviews.
- **FAQ and process copy** describe typical practice. Make sure it matches how you really work (payment terms, ownership, timelines).
- **Rate limiting** is in-memory. On Vercel each serverless instance counts separately, so it is basic protection. For stricter limits use Vercel Firewall or a Redis-backed limiter.
- **Notifications.** Enquiries are stored but you are not emailed automatically. Check Supabase, or extend `backend/routes/contact.js` with an email service.
- **Privacy.** The form stores personal data; add a privacy policy page appropriate to your region.
- Canonical and social-image URLs in `frontend/index.html` assume `https://learnsprint.ink/`.
