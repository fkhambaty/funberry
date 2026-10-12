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
      → /api/razorpay/* and /api/cron/keepalive run on Vercel
  → Supabase project tkuakihsswzhrcrqcqel
      → Auth (email session in the browser)
      → Postgres + row-level security
      → Storage for learning-pack uploads
  → Razorpay for INR subscriptions
```

Mobile (`apps/mobile`, Expo) has auth and a home screen. The in-app game player is not the live product. Do not promise it.

## Repository map

```
apps/web                 Next.js site. Vercel builds this workspace.
apps/mobile              Expo app. Not the live game player.
packages/config          Brand, zones, prices. Change the name only in brand.ts.
packages/game-engine     Game templates and EVS content. Loaded on demand.
packages/supabase        Browser client and data hooks.
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

- Supabase project ref: `tkuakihsswzhrcrqcqel`
- API settings: https://supabase.com/dashboard/project/tkuakihsswzhrcrqcqel/settings/api
- Browser uses the anon key. The service-role key stays on the server (admin, webhooks, coupons).
- Row-level security is the real permission check. Hiding a button is not.
- Parent PIN is compared in the client today. Do not log it.
- Stars go through the `increment_stars` database function, which may credit only that parent's child.
- On 12 Oct 2026 the auth health URL for this project did not return a healthy response, and from this computer the hostname did not resolve. That matches a free Supabase project that has been paused or removed. `/play` then sits on blank loading skeletons, because the child list never arrives. The play screen now stops waiting after 8 seconds and shows a retry. That does not bring the database back.

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
