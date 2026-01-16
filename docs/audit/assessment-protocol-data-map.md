# Assessment → Protocol → Plan Data Map

This document maps the current data model for assessments, protocols, plans, and daily check-ins, with code evidence from migrations and core hooks.

## Assessments and Related Tables

- `public.assessments`, `public.assessment_questions`, `public.assessment_question_options`
  - Source: `supabase/migrations/20251010020111_78bc72c8-0010-44ec-9d53-77c6ade4d781.sql`
  - Purpose: Assessment definitions and scoring options (public read).
- `public.symptom_assessments`
  - Source: `supabase/migrations/20250926212149_fd964434-45c3-457e-8ea2-2fb725ec10cc.sql`
  - Purpose: Symptom-specific assessments (answers, scores, recommendations).
- `public.user_assessment_completions`
  - Source: `supabase/migrations/20250928071459_4b121ce2-355d-4605-af8a-9d0921ca7a70.sql`
  - Purpose: Pillar/micro completion tracking; unique by user + assessment_id (latest completion).
- `public.longevity_nutrition_assessments`
  - Source: `supabase/migrations/20251116235926_1906c780-2a98-4a49-b0c7-48fb578d5b90.sql`
  - Purpose: Full nutrition assessment (demographics + nutrition sections + score).
- `public.hormone_compass_stages`
  - Source: renamed from `menopause_stages` (`supabase/migrations/20251017023219_2b419788-ed8d-4110-b190-ed8ce791652a.sql` and `supabase/migrations/20251028011422_b04fcebc-2da9-4af5-9edf-7be6f38e5f8f.sql`)
  - Purpose: Hormone Compass stage result + indicators.
- `public.daily_scores`
  - Used as LIS baseline storage; queried in consolidation logic (see `supabase/functions/analyze-cross-assessments/index.ts`).
- `public.assessment_ai_insights`
  - Source: `supabase/migrations/20251029044151_c647ed3b-ab1c-4242-a8b2-eb63ed153f07.sql`
  - Purpose: Store AI analysis outputs for assessment results.
- `public.unified_assessments` view
  - Source: `supabase/migrations/20260113082124_8e4939f8-12cc-4d00-92f4-76a0214eced9.sql`
  - Purpose: Consolidated view across `user_assessment_completions` and a subset of symptom assessments (only `energy-levels`).

## Protocols and Related Tables

- `public.protocols`
  - Created as `user_protocols` then renamed to `protocols`
  - Source: `supabase/migrations/20251002073510_6dfc7527-9b76-4af3-ae17-9917ed981851.sql` and rename `supabase/migrations/20251023024721_d2957ad4-e955-42ab-a7b7-2ad801808fa1.sql`
  - Tracks user protocols, active flags, start/end dates.
- `public.protocol_items`
  - Source: `supabase/migrations/20251002073510_6dfc7527-9b76-4af3-ae17-9917ed981851.sql`
  - Items within protocols (habit, supplement, diet, exercise, therapy).
  - `included_in_plan` flag added later (`supabase/migrations/20251211045017_1a136ad5-1292-4f10-ac58-6cc90f21e88a.sql`).
- `public.protocol_item_completions`
  - Source: `supabase/migrations/20251019045755_4a7e07e2-8b9e-4046-9e5d-0daa31791b65.sql`
  - Per-day completion tracking.
- `public.protocol_recommendations`
  - Source: `supabase/migrations/20251112014045_5539cc24-4ec4-42a0-8e9e-14ad1824475e.sql`
  - Stores generated recommendations per assessment (source_assessment_id + source_type).
- Protocol provenance fields on `protocols`
  - Source: same migration above (adds `source_recommendation_id`, `source_type`).
- Protocol research linkage
  - Source: `supabase/migrations/20251101074649_0d6cc9bf-f748-40f2-8f7c-209decd8e1cc.sql`
  - `protocol_versions`, `protocol_research_links`.

## Plans and Daily Actions

- Today plan and weekly plan are derived from active protocol items
  - `useDailyPlan` and `useWeeklyPlan` pull items from `protocols` + `protocol_items` where `is_active` and `included_in_plan`.
  - Evidence: `src/hooks/useDailyPlan.tsx`, `src/hooks/useWeeklyPlan.tsx`.
- Protocol item completions are recorded in `protocol_item_completions`
  - Evidence: `src/components/today/UnifiedDailyChecklist.tsx`.
- Plan selection into Today/90-day plan uses `included_in_plan`
  - Evidence: `src/components/profile/MasterProtocolSheet.tsx`.

## Daily Check-ins

- `public.daily_checkins`
  - Source: `supabase/migrations/20260116103000_daily_checkins_and_settings.sql`
  - Stores subjective daily check-ins (mood/sleep/stress/energy).
- `public.user_checkin_settings`
  - Source: same migration
  - Stores enable/disable flag and optional question config.
- Storage helpers
  - Evidence: `src/lib/checkin/checkinStorage.ts`.

## Notes and Assumptions

- “Micro-assessments” appear to map to `symptom_assessments` and `user_assessment_completions` (pillar or symptom subsets). There is no explicit “micro” table.
- The consolidation view `unified_assessments` currently includes only `energy-levels` from `symptom_assessments`.
