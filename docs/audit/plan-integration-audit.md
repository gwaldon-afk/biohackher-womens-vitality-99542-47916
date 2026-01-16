# Plan Integration Audit

## How Protocols Feed Today Plan

- **Source of items**: `protocols` + `protocol_items`
  - Active protocols are loaded via `useProtocols`.
  - Items are filtered by `is_active` and `included_in_plan !== false`.
  - Evidence: `src/hooks/useDailyPlan.tsx`.
- **Plan construction**:
  - Items are grouped by type (supplement/exercise/therapy/habit/diet) and time-of-day.
  - Evidence: `src/hooks/useDailyPlan.tsx`.
- **Completions**:
  - Uses `protocol_item_completions` to track day-by-day completion.
  - Evidence: `src/hooks/useDailyPlan.tsx`, `src/queries/protocolQueries.ts`, `src/components/today/UnifiedDailyChecklist.tsx`.

## Multiple Protocols Stacking

- The plan merges items from all active protocols.
- A warning log is emitted if multiple active protocols are found.
  - Evidence: `src/hooks/useDailyPlan.tsx` (`console.warn`).
- There is no explicit priority/weighting logic across protocols beyond item type grouping.
  - Status: **Partial** (items stack, but ordering/priority is limited).

## Effect of Additional Assessments

- Additional assessments generate recommendations which can be accepted into protocols.
  - Evidence: `protocol_recommendations` table, results pages.
- The plan becomes more specific only when additional protocol items are added and included in the plan.
  - There is no automatic multi-assessment consolidation into plan items.

## Daily Check-in Relationship

- Daily check-ins are stored in `daily_checkins` and can tailor the Today plan UI.
  - Evidence: `supabase/migrations/20260116103000_daily_checkins_and_settings.sql`, `src/components/today/UnifiedDailyChecklist.tsx`.
- Daily check-ins do not change protocol provenance; they only modify plan rendering for the day.

## Summary

- **Protocols → Today Plan** is implemented via `included_in_plan` and `is_active`.
- **Stacking** works but lacks deduplication or priority logic at the plan level.
- **Additional assessments** only affect plan if their recommendations are accepted into protocols.
