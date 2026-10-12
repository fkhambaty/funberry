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
  → Cloudflare Worker https://funberry-api.fkhambaty.workers.dev
      → D1 database funberry (e0bf4f89-c29d-4c0d-9674-b5977847e7d1)
      → parent accounts, children, stars, packs, coupons, admin
      → Razorpay subscriptions on the shared FKTech account
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
| Owner | `/admin` (owner emails only) |
| Worker | `/v1/payments/razorpay/subscription`, `/confirm`, `/cancel`, `/v1/payments/razorpay/webhook`, `/v1/coupons/redeem`, `/v1/admin/*` |

Stripe route stubs exist and are not the live payment path. Live web payments are Razorpay, in INR, on the worker.

## Data and auth

Accounts, children, stars, unlocks, rewards, learning-pack text, and coaching reports live in Cloudflare D1 database `funberry` (`e0bf4f89-c29d-4c0d-9674-b5977847e7d1`). The browser calls `https://funberry-api.fkhambaty.workers.dev`. The session token is stored in the browser. Passwords are hashed. The worker checks that a parent only reads their own children.

Signup emails a 6-digit code. The parent cannot sign in until `/signup` accepts that code. `/forgot-password` emails a reset code. Codes expire after 15 minutes and allow 5 tries. Email goes through Resend: worker secret `RESEND_API_KEY`, sender `MAIL_FROM` in `cloudflare/worker/wrangler.toml`. Without the secret, signup and reset return 503 on purpose.

The browser may only call servers listed in `connect-src` in `apps/web/vercel.json`. The worker address must stay in that list or every login fails.

Test login: username `dummy`, password `dummy`, parent PIN `1234`, one child "Test Kid". It is an ordinary parent account and is not on the admin list.

The parent PIN is still compared in the browser. Do not log it.

Old Supabase project ref `tkuakihsswzhrcrqcqel` is no longer the account database. Do not point new login, coupon, admin, or payment code back at it. The website does not call that host.

Zones children see come from `packages/config`. Games they play come from `packages/game-engine`. There is no zones or games table in D1.

## Payments

FunBerry, Data For Dummies, and Okavo share one FKTech Razorpay account. FunBerry only acts on subscriptions whose notes say `product: funberry`. Plan ids and the publishable key id are worker vars. The key secret and the FunBerry webhook secret are worker secrets. Prices live in `packages/config/src/pricing.ts`. The browser must not say "charge this many rupees."

1. A signed-in parent asks the worker for `weekly` (52 cycles, ₹99) or `monthly` (12 cycles, ₹349). The worker reuses a still-`created` subscription for that parent and plan from the last 15 minutes. It refuses when premium is already active, and the dummy account never reaches Razorpay.
2. Checkout.js opens with `name: FKTech` so the payer sees FKTech. The description says FunBerry Kids Premium and the price. If Razorpay reports a website mismatch, the parent is sent to that subscription's hosted `short_url`. Coming back to the dashboard makes the worker re-read the subscription and grant premium only when Razorpay says `active` or `authenticated` and the subscription belongs to that parent.
3. The confirm call checks `HMAC_SHA256(key_secret, payment_id + '|' + subscription_id)` before that grant. It is safe to repeat.
4. When `/v1/parent` sees a stored Razorpay subscription whose expiry has passed, it fetches the subscription again and either extends premium or sets the account back to free for `cancelled`, `halted`, `completed`, or `expired`.
5. Parents can turn off auto-renew from the dashboard. That calls Razorpay cancel with `cancel_at_cycle_end: 1`. Premium stays until the period already paid.
6. `POST /v1/payments/razorpay/webhook` is a backup. Register `https://funberry-api.fkhambaty.workers.dev/v1/payments/razorpay/webhook` in the Razorpay dashboard for this FunBerry webhook secret, with events `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.halted`, and `subscription.completed`. Delivery is ignored when the event id was already stored.

Coupons and `/admin` also live on the worker. Owner emails `fakhruddinkhambaty@gmail.com` and `fktiindia@gmail.com` are promoted to admin when they sign up, verify, or sign in. Coupon codes grant premium days, with an optional expiry, a redemption cap, and one redemption per account.

## Local run

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
npm run dev:web          # http://localhost:3000
npm run typecheck
npm run build --workspace=@funberry/web
```

Never commit `.env`, `.env.local`, or a service-role key.

## Design system

The look is a berry-and-sky meadow with tactile press controls, sized for ages 5–8. Change the palette in one place and let the surfaces inherit it.

| Piece | Where | What it owns |
|-------|--------|----------------|
| Color ramps | `packages/config/src/colors.ts` | Berry, leaf, sky, sunshine, ink, cream, paper. Brand hex values live here. |
| Tailwind names | `apps/web/tailwind.config.ts` | The same ramps as utility classes (`bg-berry-500`, `text-ink-700`, `min-h-tap`). |
| Tokens and chrome | `apps/web/app/globals.css` | CSS variables, focus rings, reduced motion, page washes (`.fb-app`, `.fb-marketing`, `.fb-auth`, `.fb-parent`, `.fb-kid-who`, `.fb-kid-world`, `.fb-admin`), tactile buttons (`.fb-cta`, `.kid-glass-btn`), cards (`.glass-card`, `.fb-plan`, `.fb-modal`), fields (`.fb-field`), and the game frame (`.fb-play-canvas`, `.fb-track`). |
| Shared controls | `packages/ui/src` | `KidButton`, `KidCard`, `KidModal`, `ZoneCard`, `GameResultScreen`, `ProgressBar`, `StarRating`, `ParentalGate`, `AvatarPicker`, plus presentational `AuthStage`, `Notice`, and `TextField`. These do not own account state. |
| Game chrome | `packages/game-engine/src/components/GameShell.tsx` | Header, star chip, progress track, and the shared play frame around every template. Templates keep their own logic and load through `loadGameTemplate()`. |

Rules for a visual edit:

- Keep the mascot and the berry/sky/leaf/sunshine palette. Do not introduce a second brand color as the primary.
- Kid tap targets stay at least 48px, and primary kid actions aim for 64px. Focus rings stay visible. `prefers-reduced-motion` already collapses animation.
- Do not move PIN checks, timers, star writes, pack generation, premium gates, or Razorpay into a presentation component.
- Parent copy can be precise. Kid copy stays short and kind. Do not add user counts, school logos, or claims about Stripe, offline play, or an AI that writes lessons.

## What not to get wrong

- Do not invent user counts, school logos, or city claims.
- Do not market Stripe, offline mode, or an AI that writes lessons. Learning Packs use OCR plus rules, not a lesson-writing model. Read `docs/LEARNING_PACKS.md` before changing that pipeline.
- The old Vercel cron that poked Supabase is gone. Accounts live on D1, so that ping had nothing left to keep awake.
- Resume headers and job-search files do not belong in this repo.
