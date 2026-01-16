# P0-01 — Bottom Navigation Matches Spec

Priority: P0
Status: Open

Problem:
Bottom navigation exists but does not match required items or labels and is not visible on all primary screens.

Goal:
Always-visible bottom navigation on all primary app screens with items:
- Home
- My Plan (Today)
- My Nutrition
- My Profile

Current State:
- Items: Today / Toolkit / Nutrition / Progress / Profile
- Rendered only inside app shell routes

Files:
- src/components/MobileBottomNav.tsx
- src/components/layout/Shell.tsx
- src/App.tsx

Tasks:
- Update nav labels to match spec
- Ensure “My Plan” routes to /today
- Ensure nav is visible on all primary screens
- Confirm safe-area handling on iOS

Acceptance Criteria:
- Nav visible on all primary screens
- Labels match spec
- No content hidden behind nav
