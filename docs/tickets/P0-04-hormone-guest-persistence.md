# P0-04 — Persist Hormone Guest Results

Priority: P0
Status: Open

Problem:
Hormone guest results rely on navigation state and can be lost on refresh.

Goal:
Persist hormone guest results similarly to LIS and Nutrition.

Files:
- Hormone Compass assessment and results pages
- Supabase integration (if applicable)

Tasks:
- Store hormone guest results in localStorage
- Rehydrate results on page load if navigation state is missing
- Optionally persist via guest table + RPC

Acceptance Criteria:
- Refreshing results page retains hormone results
- No unnecessary sensitive data stored
