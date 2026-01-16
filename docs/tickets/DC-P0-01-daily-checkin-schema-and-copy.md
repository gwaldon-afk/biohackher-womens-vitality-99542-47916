# DC-P0-01 — Daily Check-in Schema and Copy

Objective:
Define the Daily Check-in schema source and lock approved UI copy strings for implementation.

In scope:
- Schema location and versioning requirements
- Approved UI copy strings (verbatim)

Out of scope:
- UI components
- Persistence
- Tailoring logic

Acceptance criteria:
- Approved copy block included verbatim
- Schema location and version noted
- No additional copy is invented in this ticket

Implementation notes:
- Files likely touched: `docs/daily-checkin-schema.json`, `src/i18n/*` (future)
- Constraint: Use copy strings verbatim; no edits
- Constraint: Schema version must remain `1.0.0`

Manual verification checklist:
- Confirm copy block matches the approved strings exactly
- Confirm schema file exists and is referenced

Risks / edge cases:
- Accidental copy edits or truncation
- Schema version mismatch

Approved copy strings (verbatim):
{
  "checkin.welcome.title": "Quick check-in",
  "checkin.welcome.body": "Before we get started, let’s do a quick check-in so I can tailor today’s plan for you.",
  "checkin.welcome.primary": "Tailor my plan",
  "checkin.welcome.secondary": "Skip today",
  "checkin.welcome.disable": "Turn off daily check-in",
  "checkin.welcome.time_hint": "Takes about 30 seconds",

  "checkin.q1.prompt": "How are you feeling today?",
  "checkin.q1.options.great": "😄 Feeling great",
  "checkin.q1.options.good": "🙂 Pretty good",
  "checkin.q1.options.okay": "😐 Okay",
  "checkin.q1.options.flat": "😕 A bit flat",
  "checkin.q1.options.rough": "😣 Rough day",
  "checkin.q1.helper": "No backstory needed — just how it feels right now.",

  "checkin.q2.prompt": "How did you sleep?",
  "checkin.q2.options.great": "Slept great",
  "checkin.q2.options.ok": "It was okay",
  "checkin.q2.options.poor": "Not great",
  "checkin.q2.subprompt": "Roughly how many hours?",
  "checkin.q2.subhelper": "Just a rough guess is fine.",

  "checkin.q3.prompt": "How stressed do you feel right now?",
  "checkin.q3.options.low": "Low",
  "checkin.q3.options.medium": "Medium",
  "checkin.q3.options.high": "High",
  "checkin.q3.helper": "This helps me pace today.",

  "checkin.q4.prompt": "How’s your energy right now?",
  "checkin.q4.options.low": "Low",
  "checkin.q4.options.medium": "Medium",
  "checkin.q4.options.high": "High",
  "checkin.q4.helper": "We’ll match the plan to what you’ve got.",

  "checkin.q5.prompt": "Anything you want me to consider today?",
  "checkin.q5.placeholder": "Period day 1, sore knee, big meeting, headache…",
  "checkin.q5.helper": "Totally optional.",

  "checkin.q6.prompt": "Anything relevant today?",
  "checkin.q6.options.period": "Period / PMS",
  "checkin.q6.options.headache": "Headache",
  "checkin.q6.options.injury": "Sore / injured",
  "checkin.q6.options.travel": "Travel / jet lag",
  "checkin.q6.options.late_night": "Late night",
  "checkin.q6.options.big_work_day": "Big work day",
  "checkin.q6.options.bloat": "Feeling bloated",

  "checkin.confirm.title": "Got it 💛",
  "checkin.confirm.body": "I’ll use this to tailor today’s plan — keeping things supportive, realistic, and in sync with how you’re feeling.",
  "checkin.confirm.primary": "Show my plan",

  "today.tailored.badge": "Tailored for today",
  "today.tailored.tooltip": "Based on your check-in",

  "checkin.skip.toast": "No worries — today’s plan is ready when you are.",
  "checkin.disable.toast": "Daily check-in turned off. You can re-enable this anytime in settings.",
  "checkin.enable.toast": "Daily check-in turned back on.",

  "checkin.fallback.title": "Let’s reset",
  "checkin.fallback.body": "We couldn’t load your check-in, but your plan is still available.",
  "checkin.fallback.primary": "Show today’s plan"
}
