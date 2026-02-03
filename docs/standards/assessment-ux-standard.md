# Assessment UX Standard

## Purpose
Create a consistent, trust-first UX for subjective health self-reporting across all assessments and Daily Check-in flows. The goal is to keep responses neutral, reduce cognitive load, and avoid implying "right" or "wrong" answers.

## Principles
- Neutral framing: avoid UI elements that signal “better” or “worse” answers.
- Immediate feedback: selections update state instantly with no validation lag.
- Conversational flow: one action advances the user when appropriate.
- Mobile-first: layouts and interactions optimized for small screens.
- Results are never blocked by persistence: showing results must not depend on background saves.

## Approved Question Types and Interaction Rules

### 1) Single-choice questions (radio-style)
- Selection immediately updates state and auto-advances to the next question.
- No separate Continue/Next button for the question screen.
- Provide a Back button for navigation.
- All options must have equal visual weight (no value-laden styling, gradients, or progress cues).

### 2) Multi-select questions
- Tap toggles selection on/off.
- Continue button appears only when minimum required selections are met.
- Clear guidance shown (e.g. “Select up to 3”) using existing copy.

### 3) Slider-based questions
- Slider updates must be instant (no debounce).
- Continue button required.
- Use neutral label feedback only (e.g. min/max labels already in copy).
- Avoid numeric “score” callouts or good/bad indicators.

### 4) Free-text questions
- Always optional.
- Continue button required.
- Never block progression if empty.

## Time Estimates
- Remove all dynamic per-question time estimates.
- Add one static estimate at the start of each assessment:
  “Takes about 6–8 minutes. You can pause anytime.”
- Do not recalculate or update this mid-flow.

## State and Error Handling
- No two-step “select → continue” for single-choice questions.
- No “Please select an option” errors after a valid tap.
- State updates are synchronous and immediate.
- Results must never be blocked by profile persistence failures.

## Daily Check-in Alignment
- Single-choice questions behave as immediate selections (no extra confirmation).
- Sliders remain sliders with Continue/Submit.
- Free-text remains optional.
- No raw scores or tags surfaced on Today after completion.
- Keep existing questions, order, and modifiers unchanged.

## Explicit Anti-patterns
- Per-option progress bars, percentages, or value “scores”.
- Color-coded answer quality (green/yellow/red).
- Forced Continue buttons for single-choice questions.
- Dynamic time estimates per question.
- Blocking results on background save failures.

## Regression Checklist (run before merging assessment changes)
- Single-choice auto-advances and has Back.
- Multi-select requires Continue only after valid selection count.
- Slider updates instantly; no numeric scoring callouts.
- Free-text optional and never blocks progression.
- No per-option scoring visuals.
- Static time estimate present once at assessment start.
- Results display regardless of profile save state.
- Daily Check-in flow unchanged in logic and outputs.

## Do Not Change Without Design Review
- Question ordering, branching, or wording.
- Scoring or algorithm inputs/outputs.
- Persistence or analytics logic.
- Any copy not explicitly approved in this standard.
