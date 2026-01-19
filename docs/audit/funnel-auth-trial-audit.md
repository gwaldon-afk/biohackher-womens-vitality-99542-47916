# Funnel Auth/Trial Audit

Date: 2026-01-19

## Auth gating overview

### Guest-accessible routes (no login)
- Marketing/browse: `/`, `/about`, `/pillars`, `/pillars-display`, `/biohacking-toolkit`, `/sleep`, `/coaching`, `/research-evidence`, `/lis2-research`, `/faq` (via redirect), `/shop`, `/plan-home`.
- Assessments (guest allowed):
  - `/guest-lis-assessment`
  - `/longevity-nutrition`
  - `/hormone-compass/assessment`
- Results (guest allowed):
  - `/lis-results`
  - `/longevity-nutrition/results`
  - `/hormone-compass/results`

### Auth-only routes
- `/today`
- `/my-protocol`
- `/protocol-library`
- `/7-day-plan/*`
- `/profile`
- `/settings`
- `/nutrition`, `/nutrition/meal-plan`
- `/exercise/setup`
- `/my-goals/*`, `/goals/*`
- `/energy-loop/*`
- `/master-dashboard`, `/dashboard-main`

### Trial-required (after refactor)
- Full protocol details in assessment results (LIS/Nutrition/Hormone).
- `/my-protocol` (full protocol details).
- `/protocol-library` (full protocol catalog).
- `/today` daily plan + tracking.
- `/plans/28-day`, `/plans/90-day`, `/plans/weekly`, `/7-day-plan/*`.

## Trial / entitlements representation
- Supabase `user_subscriptions` with:
  - `subscription_tier` enum: `guest | registered | subscribed | premium`
  - `subscription_status` enum: `active | trialing | canceled | expired`
  - `trial_start_date`, `trial_end_date`
- `useSubscription` reads `user_subscriptions`.
- `subscription_tier_limits` used for feature limits.

## Where credit card is requested
- `/upgrade` opens Stripe purchase links (see `src/pages/Upgrade.tsx`).
- Registration and login do not request card details.

## Where trial auto-started (pre-refactor)
- `useSubscription.ensureSubscriptionExists` inserted `trialing` rows with trial dates on first fetch.
- `useGoals.ensureSubscriptionExists` inserted `trialing` rows when creating goals.

## Gaps vs desired behavior (pre-refactor)
- Trial auto-started on registration/login instead of explicit opt-in.
- Nutrition results showed full protocol details for guests.
- Logged-in users without trial still had access to full protocol details and plan screens.
- Guest results CTAs and post-login trial CTAs did not follow the required copy.

## Post-refactor intent
- Trial activation is explicit via the “Start 7-day free trial” CTA; no auto-start on registration.
- Guest results show score + initial analysis with locked protocol preview and registration CTA.
