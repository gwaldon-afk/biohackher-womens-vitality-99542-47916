# DC-P1-01 — AI Modifiers Contract Stub

Objective:
Add an AI-ready contract stub for plan modifiers without provider lock-in.

In scope:
- Types for plan modifiers
- Stub function signature returning modifiers

Out of scope:
- Calling any AI provider
- Model prompting and inference

Acceptance criteria:
- Contract types defined and exported
- Stub function returns rules-based modifiers
- Build passes without external dependencies

Implementation notes:
- Files likely touched: `src/lib/checkin/aiPlanModifiers.ts`, `src/lib/checkin/types.ts`
- Constraint: No network calls or secrets

Manual verification checklist:
- Stub function compiles
- No runtime errors when invoked

Risks / edge cases:
- Type drift between rules and AI outputs
