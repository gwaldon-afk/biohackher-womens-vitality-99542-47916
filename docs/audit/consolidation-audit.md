# Multi-Assessment Consolidation Audit

## Current Consolidation Mechanisms

### 1) Cross-assessment analysis (edge function)

- **Function**: `supabase/functions/analyze-cross-assessments/index.ts`
- **Inputs**:
  - Latest LIS baseline from `daily_scores`
  - Latest nutrition assessment from `longevity_nutrition_assessments`
  - Latest hormone stage from `hormone_compass_stages`
  - Up to 5 symptom assessments from `symptom_assessments`
  - Up to 10 pillar completions from `user_assessment_completions`
  - Optional `trigger_assessment` (for provenance of the trigger)
- **Outputs**:
  - Returns structured JSON analysis to caller.
  - Writes insights to `user_insights` table (not protocol-structured).
- **Usage**:
  - Invoked in `src/pages/SymptomAssessment.tsx`, `src/pages/LongevityNutritionAssessment.tsx`, `src/pages/hormone-compass/HormoneCompassAssessment.tsx`, `src/pages/GuestLISAssessment.tsx`, and `src/components/profile/ConsolidatedInsightsCard.tsx`.
- **Status**: **Partial**
  - Consolidated analysis exists and is generated, but it is not explicitly connected to protocol generation or plan personalization.

### 2) Unified assessments view

- **View**: `public.unified_assessments`
  - Source: `supabase/migrations/20260113082124_8e4939f8-12cc-4d00-92f4-76a0214eced9.sql`
  - Combines `user_assessment_completions` and a subset of `symptom_assessments` (only `energy-levels`).
- **Status**: **Partial**
  - This view does not include all assessment types, nor does it consolidate protocols or plans.

## Protocol Consolidation and Deduplication

- **Deduplication exists only when inserting protocol items**:
  - `filterDuplicateItems` checks existing items by name + item_type across active protocols.
  - Evidence: `src/utils/protocolDuplicateCheck.ts`, `src/services/protocolRecommendationService.ts`.
- **No explicit “merge protocols across assessments” routine**:
  - No stored procedure or client logic merges recommendations from multiple assessments into a consolidated protocol.
- **Status**: **Not implemented** for multi-assessment protocol consolidation.

## Traceability to Source Assessments

Traceability exists at the protocol/recommendation level:

- `protocol_recommendations` has `source_assessment_id` + `source_type`.
  - Evidence: `supabase/migrations/20251112014045_5539cc24-4ec4-42a0-8e9e-14ad1824475e.sql`.
- `protocols` have `source_recommendation_id` + `source_type`.
  - Evidence: same migration.

