# Gap Analysis + Ticket-Ready Recommendations

## What Works

- Individual assessment storage exists for LIS, Hormone, Nutrition, and Symptom assessments.
- Protocol recommendations are stored with assessment provenance (`source_assessment_id`, `source_type`).
- Protocol items are selectable into plans via `included_in_plan`.
- Deduplication exists for protocol item insertion (name + type).
- Cross-assessment analysis exists via `analyze-cross-assessments` edge function (returns consolidated insights and writes to `user_insights`).

## What Doesn’t Work (or is Partial)

- No UI to isolate protocols or plan items by assessment source after creation.
- Multi-assessment protocol consolidation and dedup beyond insert-time checks are not implemented.
- No explicit “longitudinal plan enrichment” logic; plans only reflect selected protocol items.
- Export/clinical summary is not implemented (no download or share flows).
- Unified assessments view is partial (includes only energy-levels symptom).

## Prioritized Gaps

### P0 (Must)

1) **Protocol provenance visibility**
   - Users cannot see which assessment generated a protocol or protocol item.

2) **Export / clinical summary**
   - No mechanism to export assessment history or protocols for clinical sharing.

### P1 (Should)

1) **Multi-assessment protocol consolidation**
   - Merge protocols across assessments with deduplication and traceability.

2) **Assessment-specific protocol filtering**
   - Ability to filter protocols and plan items by source assessment.

### P2 (Nice to Have)

1) **Enhanced longitudinal enrichment**
   - Use multiple assessments to adjust plan intensity/priority beyond static protocol items.

## Ticket-Ready Recommendations

### Ticket 1 — Show Protocol Provenance in UI (P0)

- **Objective**: Display assessment source for protocols and protocol items.
- **Acceptance Criteria**:
  - Protocol list shows source assessment type and date.
  - Protocol item list includes “Derived from” label or badge.
  - For items without provenance, show “Manual / Custom”.

### Ticket 2 — Export Clinical Summary (P0)

- **Objective**: Enable export of assessment history, protocols, and daily check-ins.
- **Acceptance Criteria**:
  - Users can export PDF or CSV containing:
    - Assessment history (type, date, score)
    - Active protocols and items
    - Daily check-in trends (last 30 days)
  - Export is downloadable and printable.

### Ticket 3 — Consolidated Protocol Builder (P1)

- **Objective**: Build a consolidated protocol from multiple assessments.
- **Acceptance Criteria**:
  - Deduplicate items by name + type across assessments.
  - Preserve provenance of each item (list contributing assessments).
  - User can accept/reject items before applying.

### Ticket 4 — Assessment-Scoped Protocol Views (P1)

- **Objective**: Filter protocols and plan items by source assessment.
- **Acceptance Criteria**:
  - Filter UI allows selection of assessment source.
  - Plan view reflects selected assessment filter.

### Ticket 5 — Longitudinal Plan Enrichment (P2)

- **Objective**: Enrich Today Plan based on multiple assessments.
- **Acceptance Criteria**:
  - When multiple assessments exist, plan prioritizes items with higher impact scores.
  - Clear rationale shown in plan header or info block.

