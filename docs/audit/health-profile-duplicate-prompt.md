# Health Profile Duplicate Prompt Audit

Date: 2026-01-22

## Trigger A (Assessment start)
- **File:** `src/pages/GuestLISAssessment.tsx`
- **Route:** `/guest-lis-assessment`
- **Condition:** `showBaseline` is `true`, baseline step renders before questions.

## Trigger B (Later prompt)
- **File:** `src/components/RequireHealthProfile.tsx` → `src/pages/CompleteHealthProfile.tsx`
- **Route:** Any route wrapped by `RequireHealthProfile` (e.g. `/today`, `/nutrition`, plan routes, protocols)
- **Condition:** `isProfileComplete()` returns `false` and redirects to `/complete-profile?returnTo=...`

## Why “activity level” is considered missing
- `RequireHealthProfile` default `requiredFields` includes `activity_level`.
- `CompleteHealthProfile` uses `activity_level` and labels its submit as “Confirm & Continue.”
- If `activity_level` is not saved (or save fails), `isProfileComplete()` returns `false` and the second prompt appears.
