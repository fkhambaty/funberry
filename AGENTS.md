# FunBerry Kids — notes for an AI agent working in this repo

Read [`ARCHITECTURE.md`](ARCHITECTURE.md) first if you are on a new computer. It is the map of hosting, DNS, database, payments, and the failures that look like bugs. This file is the editing contract.

FunBerry Kids is an **educational games website (and Expo app)** for children roughly **ages 5–8**. It is **not** a marketplace, LMS, or homework grader. Parents create an account, add child profiles, and kids play short EVS (Environmental Studies) mini-games in themed “worlds.” Live site: <https://funberrykids.in> and <https://www.funberrykids.in> (both HTTP 200 on 13 Oct 2026; do not change DNS unless one stops answering). Support: `hello@funberrykids.in`.

The brand name and tagline live in [`packages/config/src/brand.ts`](packages/config/src/brand.ts). Change them there, not in random screens.

## What this product is

- A **village of learning zones**: 15 ICSE Class 2 EVS themes plus a Computer Studies exam world.
- Two surfaces: **kid play** (`/play`) and **parent dashboard** (`/dashboard`).
- Progress = stars, best scores, coaching-style reports for parents.
- **Premium** unlocks most games; free accounts play a slice of each EVS world. **Computer Lab is fully free** (every folder and game).
- Optional **Learning Packs**: a parent photographs textbook pages, OCR + a **rules engine** (not an LLM) turn text into games. Read [`docs/LEARNING_PACKS.md`](docs/LEARNING_PACKS.md) before changing this pipeline.

## What this product is not

- Not Okavo / FORMA / a software marketplace. That repo is unrelated even if the same human owns it.
- Not a school SIS. No attendance, no teacher gradebook, no “AI tutor that chats with the child.”
- Not a claim that we copied any publisher’s textbook. Games are **theme-aligned**; see [`docs/SYLLABUS_ALIGNMENT.md`](docs/SYLLABUS_ALIGNMENT.md).
- Stripe / RevenueCat copy in `packages/config` is **placeholder**. **Live web payments are Razorpay INR** (₹99/week, ₹349/month) on the Cloudflare worker. Checkout shows the name FKTech because FunBerry Kids and Data For Dummies share the FKTech EdTech Razorpay account. Okavo requires a separate marketplace merchant.

## Who uses which UI

| Audience | Routes | Allowed to see |
|----------|--------|----------------|
| **Child** | `/play` | Worlds, games, stars, kid-facing copy. No billing, no email, no PIN digits in the game UI. |
| **Parent** | `/login`, `/signup`, `/dashboard`, `/dashboard/progress`, `/dashboard/packs`, `/pricing` | Children, reports, coupons, Razorpay upgrade, PIN lock / timer. |
| **Admin** | `/admin` | Owner emails only: fakhruddinkhambaty@gmail.com and fktiindia@gmail.com. The worker promotes those emails on signup, verify, and sign-in. |
| **Anonymous** | `/`, `/pricing`, `/privacy`, `/terms` | Marketing. Home is SSR; play/dashboard are client-heavy. |

Kid “Home” on `/play` stays inside the play SPA (worlds or child picker). The parent home is `/dashboard`. Do not send a child to the dashboard without a parent PIN gate.

## Layout

```
funberry/
├── apps/web/              # Next.js 15 — the website
├── apps/mobile/           # Expo — auth/home exist; in-app game player is still a placeholder
├── packages/config/       # Brand, zones, pricing (runtime source of truth for zone metadata)
├── packages/ui/           # Shared kid UI
├── packages/game-engine/  # Templates, EVS game data, lesson rules engine, Pixi labs
├── packages/supabase/     # Account client. Calls the Cloudflare worker.
├── cloudflare/worker/     # FunBerry account API
├── cloudflare/d1/         # SQLite schema for that API
└── supabase/migrations/   # Old Postgres. Do not apply this for new accounts.
```

**Runtime sources of truth (easy to get wrong):**

- Zones kids see come from `@funberry/config` (`packages/config/src/zones.ts`).
- Games kids play come from `@funberry/game-engine` (`packages/game-engine/src/games/evs/`).
- Accounts, children, and stars come from the Cloudflare worker `https://funberry-api.fkhambaty.workers.dev`. Read `ARCHITECTURE.md` before changing login.

Game UIs load **on demand** via `loadGameTemplate()` so PixiJS is not in the play-shell bundle. Do not re-export every template from `packages/game-engine/src/index.ts`.

## Environments

| Environment | Notes |
|-------------|--------|
| **Production** | Cloudflare D1 database `funberry`. Site `www.funberrykids.in`. Accounts, coupons, and Razorpay state live there. |
| **Local web** | `npm run dev:web` → `http://localhost:3000`. Copy [`apps/web/.env.example`](apps/web/.env.example) to `apps/web/.env.local`. |
| **Local mobile** | `npm run dev:mobile`. Uses `EXPO_PUBLIC_SUPABASE_*`. |

Never commit `.env`, `.env.local`, or service-role keys. The browser client **must not** hardcode a fallback anon JWT; URL + anon key come from env.

The website does not use a Supabase URL or service-role key. Razorpay secrets live on the worker, not in the Next.js app.

## Auth, PIN, and money

- Web session is a bearer token in `localStorage` key `funberry_session`. The worker checks ownership. There is no row-level security.
- Parent **PIN** is hashed on the worker. Parent APIs return `pin_set` and never the PIN. Lock screen, timer, settings, and the play-to-parent exit call `POST /v1/pin/verify`. A plaintext PIN already in D1 is hashed on the next signed-in request and then cleared. Do not print PINs in logs or kid UI.
- **Stars:** `POST /v1/progress` credits only the increase over that child's previous best for the game, then sets `total_stars` to the sum of those bests. A repeat of the same score adds nothing. Never add a client-only star counter as source of truth.
- **Payments:** amounts and plan IDs live on the worker. The browser must not tell the server “charge ₹X.” Checkout signature and webhook HMAC are checked on the worker. The dummy account (`dummy` / `dummy`, PIN `1234`) stays on lifetime access and must never open a real charge. The dashboard stops before Razorpay and shows “Demo account: no charge”; the worker returns that same phrase with HTTP 403. Stripe webhook routes are stubs — do not market Stripe as live.
- **Coupons:** create, list, and redeem only through the worker. One redemption per account. A code can expire and can have a redemption cap.

## Data you must not leak

- Other families’ children: the leaderboard route shows “Star learner” for every child except the caller’s own. Do not return other children’s names.
- Child photos may still be **base64 in `children.photo_url`**. Do not dump those into public pages or logs.
- Learning-pack page text is stored in D1 for that parent. Page photos are not uploaded.

## Ground rules (product honesty)

- **Do not invent social proof** (user counts, school logos, “used in N cities”) unless it is real and already on the site.
- **Do not claim a feature that is off.** Mobile games, Stripe, offline mode, and “AI that writes lessons” are not live product promises.
- **Do not expand Learning Packs before measuring their evidence gate.** Run the documented 10-page trust test first; automated OCR/game counts do not prove factual correctness.
- **Kid copy stays kind and simple.** Parent copy can be more precise. Never show developer jargon (RLS, JWT, RPC) on `/play`.
- **Prices** live in [`packages/config/src/pricing.ts`](packages/config/src/pricing.ts). Play-side free/premium split is also in `PlayContent` (`FREE_GAME_FRACTION`). If those disagree, fix both; do not hardcode rupees in a random button.
- Prefer a worker check that the child belongs to the signed-in parent for anything a hostile account could abuse (stars, other kids’ rows, coupons).

## How to run and check work

```bash
npm install
npm run dev:web          # website
npm run typecheck        # all workspaces
npm run build --workspace=@funberry/web
npx playwright install chromium
npm run test:responsive  # phone, tablet, and desktop smoke tests
```

Typecheck the web app with the workspace script (`tsc --noEmit` in `apps/web`). `npm run typecheck` also typechecks the Expo app. After UI changes, exercise the real flow in the browser: landing → signup/login → add child → `/play` → finish a game → parent dashboard/report. A single screenshot is not enough.

`npm run test:responsive` needs a fresh web build, then Playwright starts that build. It covers `/`, `/pricing`, `/privacy`, `/terms`, auth pages, `/admin`, `/dashboard`, `/dashboard/progress`, `/dashboard/packs`, and `/play` at `390x667`, `390x844`, `393x852`, `768x1024`, `820x1180`, `1024x768`, and `1440x900`. Signed-out visits to dashboard, progress, packs, and play must land on `/login`. The dummy login then opens the child picker, one game of every template (including a touch), the parent PIN, and a checkout that stops before Razorpay. Full-height layout uses `100vh` and then `100dvh`. The game shell scrolls; bubble, star, and Pixi arenas stay clipped.

If you add a Postgres function or policy, add a migration under `supabase/migrations/` with the next number. Apply it on the hosted project or local `supabase` — shipping SQL in git without applying it does nothing.

## Common tasks (where to edit)

| Change | Place |
|--------|--------|
| Zone name, order, free vs locked | `packages/config/src/zones.ts` |
| New/edited EVS games | `packages/game-engine/src/games/evs/` |
| Computer exam sections and source coverage | `docs/COMPUTER_EXAM_WORLD.md` first |
| New game **type** / template | `packages/game-engine/src/templates/` **and** `loadGameTemplate.ts` |
| Learning Pack OCR, generation, review or evaluation | `docs/LEARNING_PACKS.md` first |
| Parent report logic | `packages/supabase/src/coachingReport.ts` |
| Data access | `packages/supabase/src/hooks.ts` |
| Marketing landing | `apps/web/app/HomeContent.tsx` |
| Play SPA | `apps/web/app/(play)/play/PlayContent.tsx` |

## Checking permissions

The worker checks that the signed-in parent owns the child, and that admin routes belong to an owner email. Hiding a button is not security. Compare what that session can read with what is in D1. If those differ, fix the worker, not only the React tree.
