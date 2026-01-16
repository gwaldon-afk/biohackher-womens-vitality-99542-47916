# My Protocols Audit

## Data Sources

- **Protocols list**: `protocols` table
  - Hook: `src/hooks/useProtocols.tsx` (`supabase.from('protocols')`).
- **Protocol items**: `protocol_items` table
  - Hook: `useProtocols.fetchProtocolItems`.
- **Recommendations**: `protocol_recommendations` table
  - Used in `src/pages/MyProtocol.tsx` and other result pages to create protocols.

## Duplicate Protocols / Items

- **Deduplication**:
  - Duplicate detection is implemented for protocol items, not protocols.
  - Uses `filterDuplicateItems` (name + item_type) across active protocols.
  - Evidence: `src/utils/protocolDuplicateCheck.ts`, `src/services/protocolRecommendationService.ts`.
- **Potential duplicates**:
  - If two protocols exist with overlapping items, duplicate prevention may skip inserts for the second protocol.

## Protocol Provenance

Traceability exists at the data level, but is not surfaced in UI:

- `protocols.source_recommendation_id` and `protocols.source_type`
  - Evidence: `supabase/migrations/20251112014045_5539cc24-4ec4-42a0-8e9e-14ad1824475e.sql`.
- Protocol creation in results pages sets `source_recommendation_id` and `source_type`.
  - Evidence: `src/pages/LISResults.tsx`, `src/pages/AssessmentResults.tsx`, `src/pages/hormone-compass/HormoneCompassResults.tsx`.

## Activation / Deactivation

- Protocols can be marked active/inactive (`is_active`).
  - Evidence: `src/hooks/useProtocols.tsx` (update protocol).
- `useDailyPlan` warns when multiple active protocols exist and merges items from all active protocols.
  - Evidence: `src/hooks/useDailyPlan.tsx`.

## Connection to Today Plan

- Plan items are filtered by `included_in_plan` and `is_active`.
  - Evidence: `src/hooks/useDailyPlan.tsx`, `src/hooks/useWeeklyPlan.tsx`.
- Users can toggle `included_in_plan` from a protocol management view:
  - Component: `src/components/profile/MasterProtocolSheet.tsx`
  - This writes to `protocol_items.included_in_plan`.

## Summary

- **Data exists** for protocols, items, and recommendation provenance.
- **Deduplication** is implemented at item insertion time.
- **UI visibility** of provenance and cross-assessment provenance is limited (not surfaced).
- **Plan linking** is present via `included_in_plan`.
