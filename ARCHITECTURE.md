# FunBerry Kids — architecture guide

Written 12 October 2026 so a different AI on a different computer can work without this chat.

Read this file, then `AGENTS.md`. `AGENTS.md` is the editing contract (what not to claim, where prices live, how stars and PIN work). This file is the map of the running system.

## What it is

FunBerry Kids is a learning-games site for children about 5–8, aligned with ICSE Class 2 EVS, plus a Computer Studies world. Parents create an account, add child profiles, and children play short games. Live brand: **FunBerry Kids**. Support: `hello@funberrykids.in`.

It is not Okavo and it is not Data For Dummies.

## Live addresses

| Surface | Address | Status on 12 Oct 2026 |
|---------|---------|------------------------|
| Website (www) | https://www.funberrykids.in | HTTP 200. This is the address to use. |
| Apex domain | https://funberrykids.in | Timed out from this network. DNS `A` is `76.76.21.21`. `www` is a CNAME to `cname.vercel-dns.com` and works. |
| Vercel default | https://funberry-web.vercel.app | HTTP 200. Same app. |
| GitHub | https://github.com/fkhambaty/funberry | Source of truth. |

The apex domain needs a GoDaddy DNS change so it follows Vercel the same way `www` does (CNAME or ANAME to `cname.vercel-dns.com`). GoDaddy's API keys are created at https://developer.godaddy.com/keys. Do not invent a DNS record.

## How a request moves

```
Browser
  → Vercel (Next.js 15 app in apps/web)
      → marketing pages are server-rendered
      → /play and /dashboard are client-heavy
      → /api/razorpay/* still expects the old Supabase session
  → Cloudflare Worker https://funberry-api.fkhambaty.workers.dev
      → D1 database funberry (e0bf4f89-c29d-4c0d-9674-b5977847e7d1)
      → parent accounts, children, stars, packs
  → Razorpay for INR subscriptions is not moved yet
```

Mobile (`apps/mobile`, Expo) has auth and a home screen. The in-app game player is not the live product. Do not promise it.

## Repository map

```
apps/web                 Next.js site. Vercel builds this workspace.
apps/mobile              Expo app. Not the live game player.
packages/config          Brand, zones, prices. Change the name only in brand.ts.
packages/game-engine     Game templates and EVS content. Loaded on demand.
packages/supabase        Account client. Talks to the Cloudflare worker, not Supabase.
cloudflare/worker        FunBerry account API.
cloudflare/d1            SQLite schema for that API.
packages/ui              Shared components.
supabase/migrations      Postgres, RLS, RPCs. Shipping SQL in git does nothing until it is applied.
docs/                    Learning packs, syllabus alignment, computer exam world.
```

Zones children see come from `packages/config`. Games they play come from `packages/game-engine`. The Supabase `zones` and `games` tables are seeded and are not what `/play` reads.

## Routes

| Who | Path |
|-----|------|
| Anyone | `/`, `/pricing`, `/privacy`, `/terms` |
| Parent | `/login`, `/signup`, `/dashboard`, `/dashboard/progress`, `/dashboard/packs` |
| Child | `/play` |
| Owner | `/admin` (allowlisted emails) |
| Server | `/api/razorpay/subscription`, `/api/razorpay/webhook`, `/api/cron/keepalive` |

Stripe routes exist and are not the live payment path. Live web payments are Razorpay, in INR.

## Data and auth

Accounts, children, stars, unlocks, rewards, learning-pack text, and coaching reports live in Cloudflare D1 database `funberry` (`e0bf4f89-c29d-4c0d-9674-b5977847e7d1`). The browser calls `https://funberry-api.fkhambaty.workers.dev`. The session token is stored in the browser. Passwords are hashed. The worker checks that a parent only reads their own children.

Signup logs the parent in and opens the dashboard. There is no confirmation email. The parent PIN is still compared in the browser. Do not log it.

Old Supabase project ref `tkuakihsswzhrcrqcqel` is no longer the account database. Do not point new login code back at it. Razorpay checkout, coupons, and the admin pages still call Supabase and will fail until those routes move to the worker. That move needs the Razorpay secret, which is not in the repo.

Zones children see come from `packages/config`. Games they play come from `packages/game-engine`. There is no zones or games table in D1.

## Payments

Amounts and plan ids are decided on the server. The browser must not say "charge this many rupees." The Razorpay webhook must verify the signature. Prices live in `packages/config/src/pricing.ts`.

## Local run

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
npm run dev:web          # http://localhost:3000
npm run typecheck
npm run build --workspace=@funberry/web
```

Never commit `.env`, `.env.local`, or a service-role key.

## What not to get wrong

- Do not invent user counts, school logos, or city claims.
- Do not market Stripe, offline mode, or an AI that writes lessons. Learning Packs use OCR plus rules, not a lesson-writing model. Read `docs/LEARNING_PACKS.md` before changing that pipeline.
- A daily Vercel cron (`/api/cron/keepalive`) was added to poke Supabase. Supabase's free tier still pauses or removes idle projects, and a cron cannot revive a deleted project. The replacement database is a separate decision, recorded in the owner's notes, not something to start inside a random edit.
- Resume headers and job-search files do not belong in this repo.
