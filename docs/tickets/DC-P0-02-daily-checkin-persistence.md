# DC-P0-02 — Daily Check-in Persistence

Objective:
Persist Daily Check-in results per day for logged-in users, with safe fallback for guests if needed.

In scope:
- Daily check-in storage model and access functions
- Per-day lookup by user and date

Out of scope:
- UI changes
- Tailoring logic

Acceptance criteria:
- Check-in can be saved and retrieved for a specific date
- Skip state is stored and prevents re-prompting that day
- No PII beyond necessary check-in answers and timestamps

Implementation notes:
- Files likely touched: `src/lib/checkin/*`, `src/hooks/*`, Supabase SQL/migrations
- Constraint: Use existing Supabase patterns if available
- Constraint: Guests should not write to server tables

Manual verification checklist:
- Submit check-in and refresh: data persists for today
- Skip today: no re-prompt on same date
- Next day: check-in shows again

Risks / edge cases:
- Timezone boundaries (date rollover)
- Duplicate rows for same date/user
- Offline/localStorage fallback conflicts
