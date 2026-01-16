# Biohack Her App  
## Consolidated Mobile Tester Feedback & Fix Requirements

**Purpose**  
This document consolidates feedback gathered from mobile testers of the Biohack Her app and translates it into clear, actionable requirements for design, UX, data handling, and access control. It is intended to act as a source of truth for validating implementation against user expectations.

---

## 1. Overall Mobile Experience

### 1.1 Mobile-First Design
**Issue**
- The app does not feel mobile-first.
- Pages feel too complex compared to competitor apps (e.g. Ovum).

**Requirements**
- Simplify layouts.
- Reduce cognitive load per screen.
- Prioritise readability and scannability on mobile.

**Acceptance Criteria**
- Core screens are usable with one hand.
- No horizontal scrolling.
- Content hierarchy is clear at a glance.

---

### 1.2 Simplified Visual Language
**Issue**
- Pages feel text-heavy and dense.

**Requirements**
- Use more images, icons, and symbols.
- Reduce reliance on long blocks of text.
- Break content into smaller visual sections.

**Acceptance Criteria**
- Each screen has a clear visual anchor.
- Icons/images are used to guide navigation and comprehension.

---

## 2. Navigation

### 2.1 Persistent Bottom Navigation
**Issue**
- Users get lost navigating between sections.
- Navigation controls disappear on scroll.

**Requirements**
- Always-visible floating bottom navigation.
- Navigation items:
  - Home
  - My Plan (goes directly to Today’s Plan)
  - My Nutrition
  - My Profile

**Acceptance Criteria**
- Bottom navigation is visible on all primary screens.
- Navigation works consistently across iOS and Android.
- “My Plan” always opens today’s actionable plan.

---

## 3. Registration, Guest Access & Entitlements

### 3.1 Guest Assessment Access
**Issue**
- Users are forced to register too early.
- Guests do not always receive full assessment insights.

**Requirements**
- Guests can complete **one full assessment** without registering.
- Guests receive:
  - Score
  - Analysis
  - Explanation of what the result means

**Restrictions**
- Guests **cannot** access:
  - Protocols
  - 7-day plans
  - Ongoing tracking

**Acceptance Criteria**
- Guest completes one assessment end-to-end.
- Results and analysis are visible immediately.
- Clear CTA explains what registration unlocks.

---

### 3.2 Registration Value Exchange
**Issue**
- Value of registration is not always clear.

**Requirements**
- Registration unlocks:
  - Protocols
  - Personalised 7-day plan
  - Saved results and tracking
- The transition from guest → registered should feel seamless.

**Acceptance Criteria**
- Upon registration, previously completed guest assessment is recognised.
- No need to re-complete the assessment after registering.

---

## 4. Data Persistence & Results Handling

### 4.1 Saving Assessment Results
**Issue**
- Testers were asked to repeat assessments.
- Results did not appear to be saved reliably.

**Requirements**
- All completed assessments must be saved.
- Results should be accessible later.

**Guest Handling**
- Guest results should be temporarily saved (e.g. session or short-term storage).
- If a guest returns or registers shortly after, results should still be available.

**Acceptance Criteria**
- Registered users can see historical assessments.
- Guests returning within a defined window see prior results.
- Users are never forced to repeat an assessment unintentionally.

---

### 4.2 Unified Results Access
**Issue**
- Results feel fragmented across the app.

**Requirements**
- A single place to view:
  - Assessment results
  - Scores
  - Analysis summaries

**Acceptance Criteria**
- Users can clearly find past results.
- Results are labelled by assessment type and date.

---

## 5. Protocols & Plans

### 5.1 Protocol Visibility
**Issue**
- Users can see recommendations but not always how they translate into action.

**Requirements**
- Protocols should be visible after registration.
- Protocols should clearly map to daily actions.

**Acceptance Criteria**
- Each protocol explains:
  - What to do
  - Why it matters
  - How often it should be done

---

### 5.2 Daily Plan Integration
**Issue**
- Plans and protocols feel disconnected.

**Requirements**
- Selected protocols feed into a daily plan.
- Daily plan should be actionable and checkable.

**Acceptance Criteria**
- Today’s Plan reflects selected protocols.
- Users can mark actions as completed.
- Completion state is saved.

---

## 6. Assessment UX & Validation

### 6.1 Assessment Completion Rules
**Issue**
- Users could skip questions or submit incomplete assessments.

**Requirements**
- Mandatory questions must be enforced.
- Sliders and inputs must be stable and responsive on mobile.

**Acceptance Criteria**
- Assessment cannot be submitted with missing required inputs.
- Sliders work smoothly on mobile devices.

---

### 6.2 Clear Progress Feedback
**Issue**
- Users are unsure how far through an assessment they are.

**Requirements**
- Show progress indicators during assessments.

**Acceptance Criteria**
- Users always know:
  - How many questions remain
  - When they are nearing completion

---

## 7. Error Handling & Feedback

### 7.1 Visible Loading & Transition States
**Issue**
- Blank screens occurred during navigation or redirects.

**Requirements**
- Never return a blank screen during loading or redirects.
- Always show a visible state (e.g. “Loading…”, “Redirecting…”).

**Acceptance Criteria**
- No `return null` during navigation flows.
- Users always see feedback while the app transitions.

---

## 8. Summary of Priorities

### P0 – Must Fix
- Persistent bottom navigation
- No blank screens during navigation
- Assessment result persistence
- Clear guest vs registered entitlements

### P1 – Should Fix
- Simplified mobile layouts
- Improved use of visuals
- Unified results access

### P2 – Nice to Have
- Additional polish on progress indicators
- Enhanced visual cues and micro-interactions

---

**Status**
This document is intended to be used for reconciliation against the current codebase to confirm:
- What is fully implemented
- What is partially implemented
- What remains outstanding

No assumptions should be made without validating against the repository.
