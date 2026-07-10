# Deploy Maison to Vercel — Quick Start Guide

A condensed, copy-paste reference for taking this TanStack Start + Turso + R2 project from local to a live Vercel URL.

---

## Prerequisites

- A Vercel account (free Hobby tier works) — [vercel.com](https://vercel.com)
- A Turso database (free tier: 9 GB, 500 dbs) — [turso.tech](https://turso.tech)
- Node.js 18+ / npm 10+
- Project pushed to a GitHub repo

---

## 1. Set up Turso

```bash
npm install -g @libsql/cli
libsql login
libsql db create maison
libsql db shell maison
```

Copy your database URL:
```bash
libsql db show maison --url
```

Generate an auth token:
```bash
libsql db tokens maison
```

Save both values — you'll paste them into Vercel.

---

## 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework Preset: **Vercel auto-detects Nitro** — accept defaults
4. Build command: `npm run build`
5. Output directory: Vercel uses the generated `.vercel/output` automatically
6. Click **Deploy** (initial deploy will fail until env vars are added — that's normal)

---

## 3. Add Environment Variables

Do this in the dashboard: **Project Settings → Environment Variables**, OR run the CLI below.

### Required

| Key | Value |
|-----|-------|
| `TURSO_DATABASE_URL` | `libsql://maison-<your-cluster>.turso.io` |
| `TURSO_AUTH_TOKEN` | Token from step 1 |
| `ADMIN_TOKEN` | Any strong password you choose |

### Optional (only for R2 image uploads)

| Key | Value |
|-----|-------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_BUCKET_NAME` | Your R2 bucket name |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_PUBLIC_DOMAIN` | `https://images.yourdomain.com` |

### CLI method (optional)

```bash
npx vercel link
npx vercel env add TURSO_DATABASE_URL
npx vercel env add TURSO_AUTH_TOKEN
npx vercel env add ADMIN_TOKEN
```

---

## 4. Redeploy

After adding env vars, trigger a fresh deploy (settings only apply to new deployments):

```bash
npx vercel --prod
```

Or push any commit to your `main` branch — Vercel auto-deploys.

---

## 5. Verify

Visit your Vercel URL and hit the debug endpoint to confirm all vars are wired:

```
https://your-project.vercel.app/api/debug-env
```

You should see masked values like `"TURSO_DATABASE_URL": "lib...io"` instead of `"(not set)"`.

---

## How env vars work on Vercel

Unlike Cloudflare (which injects vars via a special `env` object), Vercel exposes them through the standard Node.js `process.env`. The codebase reads them directly — no bridging, no patching, no middleware.

---

## Local Development

Create a `.env` file in the project root (already gitignored):

```env
TURSO_DATABASE_URL=libsql://maison-xxx.turso.io
TURSO_AUTH_TOKEN=ey...
ADMIN_TOKEN=your-local-admin-pass
```

Then:

```bash
npm install
npm run dev
```

---

## Troubleshooting

**"TURSO_DATABASE_URL is not set"** — env vars weren't redeployed. Push a commit or run `npx vercel --prod`.

**Build fails locally but works on Vercel** — local node version differs. Use Node 18+.

**Env vars show on Production but not Preview** — in Vercel each environment (Production / Preview / Development) has its own vars. Add to all three, or check the environment tab.

**Images don't upload** — R2 is optional. Without R2 keys, the upload feature gracefully degrades; add the five `R2_*` vars to enable it.

---

## Tech Stack

- **Framework:** TanStack Start (React)
- **Build:** Vite + Nitro (vercel preset)
- **DB:** Turso (libSQL)
- **Storage:** Cloudflare R2 (optional)
- **Runtime:** Node.js 22.x on Vercel Serverless

---

## Commands Cheat Sheet

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (emits `.vercel/`) |
| `npm run lint` | Lint check |
| `npx vercel --prod` | Deploy to production |
| `npx vercel env add KEY` | Add env var from CLI |

---

Done. Your store is live.