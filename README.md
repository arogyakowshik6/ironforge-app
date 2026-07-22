<!-- Hey its Darren -->
# IronForge CrossFit — Personalised Fitness & Diet Plan System

A Vue 3 + TypeScript app that turns a 12-question onboarding flow into a personalised
training and nutrition programme: TDEE/BMI calculation, macro targets, and a full
7-day workout + diet plan across four goals (Weight Loss, Bulking, Cutting, Shredding).

## Backend (`server/`)

The frontend works standalone (localStorage-only, guest mode) or connected to
the API in `server/` for persistent, per-user accounts — closes
[issue #1](../../issues/1). See **[server/README.md](server/README.md)** for
full setup (Docker Compose Postgres, Prisma, migrations, seeding) and an
honest note on what was and wasn't executable in the environment this was
built in.

Quick version:

```bash
docker compose up -d          # from the repo root — starts Postgres
cd server
npm install && cp .env.example .env
npx prisma generate && npx prisma migrate deploy
npm run seed
npm run dev          # API on :4000
```

Then in the frontend, copy `.env.example` to `.env` (defaults already point
at `localhost:4000`) and sign in from the app's "Sign in" link. Without a
running API, the app degrades gracefully to local-only mode — nothing breaks.

## Testing

Unit tests cover the calculation logic (`useCalculator.ts`) — BMR/TDEE formulas,
activity multipliers, per-goal calorie deltas, and macro math.

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

## Accessibility

- Full keyboard navigation through the onboarding wizard; focus moves to each
  new step's heading so screen readers announce progress
- `aria-current="step"` on the step indicator, `role="progressbar"` with
  `aria-valuenow` on all progress bars
- Exercise check-off buttons use `aria-pressed` + descriptive `aria-label`s
- Decorative SVGs (icons, gauge) are `aria-hidden` since the same info is
  always available as text nearby
- Focus moves to the main landmark on every route change
- All motion (particles, Ken Burns zoom, celebration burst) respects
  `prefers-reduced-motion`

## Stack

- **Vue 3** (Composition API, `<script setup>`)
- **TypeScript**
- **Vite**
- **Pinia** — profile + exercise-completion state, persisted to `localStorage` and synced to the API when signed in
- **Vue Router** — onboarding → dashboard → day detail → diet plan → sign in, with page transitions
- Self-hosted fonts via `@fontsource` (Anton, Space Grotesk, Space Mono — no Google Fonts CDN request)
- Custom design system (no UI framework) — see `src/style.css` for tokens

## Interactive / visual features

- **Exercise check-off tracking** — tap any exercise to mark it done; progress bars roll up per day and across the whole week (persisted locally); completing a day triggers a brief ember-burst celebration
- Animated calorie gauge (sweeps in on load) and count-up numbers
- Ambient ember particle background (canvas, respects `prefers-reduced-motion`)
- Scroll-reveal animations on section entry (`v-reveal` directive)
- Page transitions between routes
- Hero photography (free-license Unsplash, equipment/environment shots) + custom
  line-art equipment icons on the goal-selection cards

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## How the calculations work

- **BMR**: Mifflin-St Jeor equation, using age, gender, height and current weight.
- **TDEE**: BMR × activity multiplier, derived from days-available-per-week and gym
  experience (more training days / more experience → higher multiplier).
- **Calorie target**: TDEE + a goal-specific delta (e.g. −500 kcal for Weight Loss,
  +400 kcal for Bulking), matching the deficit/surplus ranges in the source spec.
- **Macros**: protein set by g/kg bodyweight per goal (from the spec's "general rule"
  for each programme), fat set by a derived g/kg ratio, carbs fill the remainder of
  the calorie target.

These are estimates for demonstration purposes — the app includes the same safety
notice as the source spec: consult a healthcare professional before starting a new
programme.

## Project structure

```
src/
  types.ts                  # shared TypeScript interfaces
  composables/
    useCalculator.ts        # BMR/TDEE/macro calculation logic
  stores/
    profile.ts               # Pinia store (user profile + derived results, API sync)
    auth.ts                  # Pinia store (JWT session, login/register/restore)
  lib/
    api.ts                    # fetch wrapper for the server/ API
  data/
    programmes.json          # structured workout/diet content (4 programmes x 7 days)
  views/
    OnboardingView.vue       # 6-step onboarding wizard (12 data points)
    AuthView.vue              # sign in / register (optional — app works without it)
    DashboardView.vue        # calorie gauge, macro split, week overview
    DayView.vue               # per-day workout detail
    DietView.vue               # meal plan, foods to avoid, snacks/supplements
  components/
    GaugeChart.vue            # radial calorie-vs-TDEE gauge (signature visual)
    MacroBars.vue              # protein/carb/fat breakdown

server/                      # Express + Prisma + Postgres API — see server/README.md
```

## Notes

`programmes.json` was generated from a source content spec by a small parsing
script (not included in the shipped app) rather than hand-transcribed, to keep
the four full programmes accurate and consistent.
