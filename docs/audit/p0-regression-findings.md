# P0 Regression Findings — Nav, Guest, Profile

## Root Causes
- Guest navigation forced into auth because multiple non-gated routes were wrapped in `ProtectedRoute` (including `/plan-home` and other non-assessment pages).
- Activity level values from nutrition/onboarding flows used legacy strings (`active`, `moderate`, `athlete`) that violate the `user_health_profile.activity_level` DB constraint, causing profile upserts to fail and triggering repeated profile confirmation.
- Profile save failures in assessment flows blocked progress (returning early on profile save errors).

## Routes Affected
- Guest browse / navigation: `/plan-home`, `/nutrition`, `/dashboard-main`, `/insights-detail`, `/nutrition-scan`, `/mood-checkin`, `/quick-log`
- Guest assessment access: `/hormone-compass/assessment`, `/hormone-compass/results`
- Tracking gated: `/progress`, `/assessment-history`, `/symptom-trends`, `/reports`, `/analytics`, `/achievements`

## Fixes Applied
- Un-gated non-assessment browse routes and hormone guest assessment routes; kept gates for plans, protocols, and tracking.
- Normalized activity level values before `user_health_profile` upserts to satisfy DB constraints.
- Made profile save errors non-blocking in assessment flows so users still reach results.
- Home nav uses `/` for guests and `/plan-home` for signed-in users.

## Manual Verification Steps
### Guest (logged out)
1) Visit `/` and browse without redirect.
2) Open `/plan-home` and `/nutrition` — confirm no auth redirect.
3) Start one assessment: `/guest-lis-assessment` or `/longevity-nutrition` or `/hormone-compass/assessment` → complete and view results.
4) Attempt `/my-protocol` or `/7-day-plan/body` → confirm redirect to `/auth` with visible loading.

### Registered user
1) Sign in → should land on intended page without loop to `/complete-profile` if profile is complete.
2) Update activity level (choose “very active”) → save succeeds and persists after refresh.
3) Bottom nav visible on `/plan-home`, `/today`, `/nutrition`, `/profile`; Home goes to `/plan-home`.
