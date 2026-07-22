# IronForge API

Express + Prisma + Postgres backend for the IronForge CrossFit app. Persists
what used to live only in the browser's `localStorage`: user accounts, the
onboarding profile, and exercise-completion progress. Also implements the
full schema requested in [the original issue](../../../issues/1) — including
`MembershipPlan`/`Membership` and `PaymentRecord` — see **Known gaps** below
for what's actually wired up vs. what's schema-only.

## Setup

```bash
# 1. Start Postgres
docker compose up -d          # from the repo root

# 2. Install dependencies
cd server
npm install
cp .env.example .env          # defaults already match docker-compose.yml

# 3. Apply migrations and generate the Prisma Client
npx prisma migrate deploy
npx prisma generate

# 4. Seed the database (admin user, membership plans, all 4 workout programmes)
npm run seed

# 5. Run the API
npm run dev                   # http://localhost:4000
```

Seeded admin login: `admin@ironforge.dev` / `changeme123` — change this
before deploying anywhere real.

## Testing

```bash
npm run test              # unit tests — validation schemas + JWT auth, no DB needed
npm run test:integration  # full DB integration suite — needs steps 1-4 above done first
```

## API overview

| Route | Auth | Notes |
|---|---|---|
| `POST /api/auth/register` | — | |
| `POST /api/auth/login` | — | |
| `GET/PUT /api/profile` | ✓ | replaces the old `localStorage` onboarding data |
| `GET /api/progress` | ✓ | `{ completedExerciseIds: string[] }` |
| `PUT /api/progress/toggle` | ✓ | replaces the old `localStorage` progress map |
| `GET /api/workouts/:goalKey` | — | seeded programme content, keyed by goal |
| `GET /api/memberships/plans` | — | plan catalogue |
| `GET/POST /api/memberships/me` | ✓ | see Known gaps |
| `GET /api/payments` | ✓ | see Known gaps |

## Known gaps

The issue asked for `memberships`/`payment_records` tables, which are in the
schema and reachable via the API — but there's no actual product behind
them yet:

- **No frontend UI** for choosing a plan or viewing payment history.
- **No real payment provider.** `POST /api/memberships/me` just marks a
  membership "active" directly — there's no Stripe/checkout flow. Don't use
  this for anything real without adding one.
- **`PaymentRecord` is read-only** — nothing writes to it yet.

These exist to match the schema the issue described and to be a reasonable
starting point, not because the app has a billing feature today.

## A note on how this was built

This backend was developed and schema-tested in a sandboxed environment that
could reach a local Postgres instance but **could not reach
`binaries.prisma.sh`** to download Prisma's CLI engine binaries. That means:

- `prisma/migrations/.../migration.sql` was **hand-written** to match the
  schema, then verified by applying it directly to a live Postgres database
  (all 9 tables created with correct constraints/indexes) — but never
  through `prisma migrate dev` itself.
- `npm run test` (validation + auth unit tests, no DB) **was run and
  passes**.
- `npm run test:integration` (full request/response flow against a real DB)
  **was written and reviewed but not executed**, since it needs a generated
  Prisma Client.

Run `npx prisma migrate deploy && npx prisma generate && npm run
test:integration` yourself once you have normal network access — that will
be the first real end-to-end run of the Prisma-dependent code path.
