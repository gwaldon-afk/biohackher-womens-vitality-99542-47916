# Evidence Architecture Touchpoints

Date: 2026-01-19

## Where evidence is referenced

### UI surfaces
- `src/pages/ResearchEvidence.tsx` renders the Research Evidence Library from `src/data/researchEvidence.ts`.
- `src/pages/LIS2Research.tsx` presents LIS 2.0 research foundations using an inline array.
- `src/components/StatisticsBar.tsx` displays evidence citations pulled from i18n strings.
- `src/components/today/ExerciseSnacksCard.tsx` references Exercise Snacks research summary (citations in `src/data/exerciseSnacksProtocol.ts`).
- `src/pages/Coaching.tsx` uses `getResearchByStage` from `src/data/cycleCoachingResearch.ts`.
- `src/components/LongevityFoodInsights.tsx` renders `longevityFoodInsights` and `longevityEatingPrinciples` from `src/data/longevityFoodResearch.ts`.
- `src/pages/FAQ.tsx` lists general research foundations (Blue Zones, Framingham, UK Biobank, etc) with no citations.

### Data modules and evidence registries
- `src/data/researchEvidence.ts` holds the largest curated evidence list with DOI/PMID fields.
- `src/data/cycleCoachingResearch.ts` holds stage-specific evidence for menstrual and menopause coaching.
- `src/data/longevityFoodResearch.ts` holds food-specific evidence summaries (no DOI/PMID).
- `src/data/exerciseSnacksProtocol.ts` includes protocol-level citations and per-exercise research strings.
- `src/data/evidenceBasedProtocols.ts` includes evidence sources as free-text (books/guidelines).
- `src/data/evidenceMapping.ts` provides evidence summaries without citations, used by `ScienceBackedIcon` and protocol cards.
- `src/data/biohackingStatsEvidence.ts` and `src/data/womenResearchGapCitations.ts` appear unused in runtime UI.

### Supabase data model
- `research_studies` table + policies exist; `useEvidence` and `researchService` query it.
- `researchImportService` references `src/data/researchEvidence.ts` for imports.
- Edge functions (`populate-research`, `sync-research-delta`, `compile-research`) target PubMed integration.
- `protocol_research_links` and `research_citations` fields exist in types but are not surfaced in the app routes audited here.

## Centralization status
- Evidence is spread across multiple data files, UI pages, and i18n strings.
- No single canonical registry is used for all evidence references.
- Several evidence sources are duplicated (e.g., cycle coaching and researchEvidence overlap).

## Duplication and implicit references
- Duplicate citations appear across researchEvidence, cycleCoachingResearch, biohackingStatsEvidence, and i18n marketing claims.
- `evidenceMapping.ts` and `longevityEatingPrinciples` contain evidence statements without explicit citations.
- HormoneCompass scoring references population norms without a citation in `src/data/hormoneCompassAssessment.ts`.

## Where evidence should exist but does not
- Evidence-based protocol sources (protein, HIIT, supplements) lack study-level citations.
- Meal templates and toolkit protocols have no visible evidence linkage in repo.
- FAQ and marketing claims are not tied to DOI/PMID or specific sources.
