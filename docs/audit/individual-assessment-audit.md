# Individual Assessment Audit

This audit checks whether each assessment can be viewed in isolation, including its analysis and protocols derived from that assessment only. Evidence is based on code references (routes, components, queries).

## LIS (Longevity Impact Score)

- **Route/UI**: `/lis-results` (page `src/pages/LISResults.tsx`)
- **Data**:
  - Reads LIS scores from `daily_scores` (used in consolidation and LIS results flow).
  - Protocol recommendations stored in `protocol_recommendations` with `source_type = 'lis'`.
- **Protocols from LIS only**:
  - `LISResults` creates a protocol using `source_recommendation_id` with `source_type = 'lis'`.
  - Evidence: `src/pages/LISResults.tsx`, `supabase/migrations/20251112014045_5539cc24-4ec4-42a0-8e9e-14ad1824475e.sql`.
- **Coupling/leakage**:
  - Protocol items can be deduped across protocols when added, which may suppress LIS items if duplicates exist.
  - Evidence: `src/utils/protocolDuplicateCheck.ts`.
- **Status**: **Partial**
  - LIS analysis and LIS-only protocols exist, but UI does not provide a strict “show only protocols from LIS” filter once items are merged into an active protocol.

## Symptom Assessment (Assessment A)

Example: Symptom assessment results at `/assessment-results/:symptomId`.

- **Route/UI**: `src/pages/AssessmentResults.tsx`
- **Data**:
  - `symptom_assessments` table stores answers, scores, recommendations.
  - `protocol_recommendations` created with `source_type = 'symptom'`.
- **Protocols from Symptom only**:
  - Protocols are created from selected recommendation items.
  - Deduplication can remove items that already exist.
  - Evidence: `src/pages/AssessmentResults.tsx`, `src/utils/protocolDuplicateCheck.ts`.
- **Status**: **Partial**
  - Individual symptom results are viewable.
  - After protocol creation, there is no strict “show only symptom-derived protocol items” filter in the UI.

## Hormone Compass (Assessment B)

- **Route/UI**: `/hormone-compass/results` (page `src/pages/hormone-compass/HormoneCompassResults.tsx`)
- **Data**:
  - Results stored in `hormone_compass_stages` (renamed from `menopause_stages`).
  - Protocol recommendations stored in `protocol_recommendations` with `source_type = 'hormone_compass'`.
- **Protocols from Hormone only**:
  - Creates a protocol with `source_recommendation_id` set.
  - Evidence: `src/pages/hormone-compass/HormoneCompassResults.tsx`.
- **Status**: **Partial**
  - Individual assessment results and recommendations exist.
  - No UI to isolate protocol items strictly to Hormone Compass once merged.

## Longevity Nutrition Assessment

- **Route/UI**: `/nutrition/results` (page `src/pages/longevity-nutrition/LongevityNutritionResults.tsx`)
- **Data**:
  - `longevity_nutrition_assessments` table stores full response data and score.
  - Protocol recommendations stored in `protocol_recommendations` with `source_type = 'nutrition'` in code (check usage).
- **Protocols from Nutrition only**:
  - Protocol creation uses `protocol_recommendations` flow; duplicates removed.
  - Evidence: `src/pages/longevity-nutrition/LongevityNutritionResults.tsx`.
- **Status**: **Partial**
  - Nutrition results are viewable, but protocol isolation by source is not clearly exposed in UI.

## Pillar / Micro Assessments

- **Route/UI**:
  - `AssessmentHistoryTab` aggregates multiple sources (LIS, hormone, symptom, nutrition, pillar).
  - Evidence: `src/components/profile/AssessmentHistoryTab.tsx`.
- **Data**:
  - `user_assessment_completions` stores per-assessment pillar completions (unique user + assessment_id).
  - Evidence: `supabase/migrations/20250928071459_4b121ce2-355d-4605-af8a-9d0921ca7a70.sql`.
- **Consistency**:
  - Pillar assessments are mixed with other assessment types in UI history lists.
  - There is no unified mechanism for analysis per pillar completion beyond score/metadata.
- **Status**: **Partial**
  - Completion records exist but isolation of analysis is limited.

## Summary

- Individual assessment views exist for LIS, Hormone, Nutrition, and Symptoms.
- Protocols can be created from each assessment via `protocol_recommendations`, but the UI does not enforce a strict “Assessment A only” view after protocol items are merged into the active protocol set.
