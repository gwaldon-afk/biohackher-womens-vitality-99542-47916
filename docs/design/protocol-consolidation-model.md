# Protocol Consolidation Model (Rules-First, Deterministic)

This model defines a deterministic, explainable consolidation layer that operates above assessments, protocol recommendations, plans, and daily check-ins. It is rules-first and AI-free, with explicit design for future AI augmentation without breaking determinism.

## Inputs

- Full and micro assessments (LIS, nutrition, hormone, symptom, pillar)
- Assessment-specific analysis summaries
- Assessment-specific protocol recommendations
- Daily check-in modifiers (intensity, focus, constraints)
- User-selected active protocols

## Goals

- Preserve assessment → protocol provenance
- Prevent protocol duplication
- Allow protocols to strengthen, weaken, or remain unchanged as new data arrives
- Support confidence weighting without AI
- Keep outputs deterministic and explainable

## Protocol Identity Rules

Identity is defined at the **protocol item** level for deduplication:

- **Primary identity key**: `normalized_name + item_type`
  - `normalized_name`: lowercase, trim, collapse whitespace, remove non-semantic punctuation
  - `item_type`: supplement, habit, diet, exercise, therapy
- **Secondary qualifiers** (used only when conflict occurs):
  - dosage form (if available)
  - timing (if available)
  - frequency (if available)

Identity is **not** based on assessment type; the same item from multiple assessments is treated as a single item with multiple sources.

## Consolidation Rules

All rules are deterministic and ordered. Later rules only apply if earlier rules do not resolve the item.

1) **Merge** (default)
   - If an incoming item matches an existing item by identity key, merge provenance and increase confidence.

2) **Reinforce**
   - If the same item appears in 2+ distinct assessment types within 90 days, mark as reinforced.
   - Reinforced items move higher in plan ordering (but do not increase total plan volume).

3) **Suppress**
   - If a daily check-in modifier indicates a constraint (e.g., low energy or injury), suppress high-intensity items temporarily.
   - Suppression is **temporary** (for the day), not destructive to protocol storage.

4) **Defer**
   - If a new item conflicts with a user-deactivated item or a prior “excluded” tag, defer it and surface it as optional.

5) **Introduce**
   - If an item is new (no identity match), add it with its source assessment provenance.

## Confidence Model (Rules-First)

Confidence is a **deterministic score** based on:

- **Count of distinct assessment sources** (1, 2, 3+)
- **Recency** (higher weight for last 30 days)
- **Consistency** (if the item appears in the latest assessment of a type)

Example scoring (deterministic):

- Base confidence = 1.0
- +0.5 for each additional assessment type beyond the first
- +0.5 if item appears in the most recent assessment of its type
- +0.25 if item reappears within 30 days
- Cap at 3.0

Confidence affects ordering and emphasis, not item existence.

## Conflict Resolution Rules

Conflicts are resolved in this order:

1) **Safety/Constraint override**
   - Daily check-in constraints (e.g., avoid impact) override intensity-related items for the day.

2) **User choice**
   - User deactivated or excluded items remain excluded even if new assessments suggest them.

3) **Reinforcement**
   - If two items conflict (e.g., “high-intensity interval training” vs “recovery walk”), favor the item with higher confidence and more recent assessments.

4) **Defer weaker item**
   - Lower confidence item is deferred (optional), not deleted.

## What the User Sees vs Internal Logic

**User-facing:**

- A consolidated protocol list (no duplicates).
- “Why this is included” explanation at item level (sources + reinforcement).
- Temporary plan adjustments based on daily check-ins (tone: supportive, non-clinical).

**Internal only:**

- Confidence score and calculation
- Detailed conflict resolution steps
- Suppressed vs deferred markers

## Future AI Augmentation (Safe)

AI can propose candidate items or reorder recommendations, but:

- The rules-first consolidation remains the source of truth.
- AI suggestions are “inputs” that must pass identity, conflict, and confidence rules.
- Deterministic output must remain identical given identical inputs.
