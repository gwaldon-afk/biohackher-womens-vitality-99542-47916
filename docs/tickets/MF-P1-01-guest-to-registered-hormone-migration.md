# MF-P1-01 — Guest-to-Registered Hormone Results Migration

## Problem
Guests can complete the Hormone assessment and see results, but there is no confirmed migration path that preserves those results after sign-up. This breaks the “seamless transition” requirement.

## Scope
### In scope
- Preserve guest Hormone assessment results after registration.
- Link guest result data to the newly created user account on sign-up.
- Keep one-free-assessment gate behavior intact.

### Out of scope
- Changes to Hormone assessment scoring or content.
- New protocol features or plan changes.
- UI redesign beyond confirmation/CTA messaging.

## Acceptance Criteria
- A guest who completes Hormone assessment and then signs up sees their Hormone results without redoing the assessment.
- Guest storage is cleared only after successful migration.
- If migration fails, the user sees a clear error and does not lose access to the guest result.

## Manual Verification Steps
1) Logged out: complete Hormone assessment → reach results.
2) Click sign-up CTA on results page → complete registration.
3) After registration, navigate to Hormone results → data is present and matches guest run.
4) Refresh results page → data persists.

## Files Likely Impacted
- `src/pages/Auth.tsx` (guest migration / claim logic)
- `src/pages/hormone-compass/HormoneCompassAssessment.tsx`
- `src/pages/hormone-compass/HormoneCompassResults.tsx`
- Supabase RPC or table for guest hormone assessments (if needed)

## Risk Notes
- Incorrect migration could overwrite existing user assessments.
- Guest storage cleanup must be conditional on successful migration.
