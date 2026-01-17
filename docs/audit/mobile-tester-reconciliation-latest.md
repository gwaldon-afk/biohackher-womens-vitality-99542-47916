# Mobile Tester Reconciliation (Latest)

Date/time: 2026-01-17T00:00:00 (local)
Branch: staging
Commit: 61cb17772045db44090e22bace984cc450269969

## Summary Status Table
| Requirement | Status |
| --- | --- |
| 1.1 Mobile-First Design | Not Done |
| 1.2 Simplified Visual Language | Not Done |
| 2.1 Persistent Bottom Navigation | Partial |
| 3.1 Guest Assessment Access | Partial |
| 3.2 Registration Value Exchange | Partial |
| 4.1 Saving Assessment Results | Partial |
| 4.2 Unified Results Access | Not Done |
| 5.1 Protocol Visibility | Partial |
| 5.2 Daily Plan Integration | Done |
| 6.1 Assessment Completion Rules | Partial |
| 6.2 Clear Progress Feedback | Partial |
| 7.1 Visible Loading & Transition States | Partial |
| 8. Priorities Tracking | Informational |

---

## 1. Overall Mobile Experience

### 1.1 Mobile-First Design
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| Simplify layouts. Reduce cognitive load per screen. Prioritise readability and scannability on mobile. | Not Done | No mobile-specific simplification pass found. Existing UI uses general layouts across pages (e.g., `src/pages/Index.tsx`, `src/pages/MyDailyPlan.tsx`). | No explicit mobile-first layout refactor detected. Existing tickets cover this gap. | Open `/today`, `/nutrition`, `/profile` on mobile; verify one-hand usability and content density. |

### 1.2 Simplified Visual Language
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| Use more images, icons, and symbols. Reduce reliance on long blocks of text. Break content into smaller visual sections. | Not Done | No dedicated visual-language system introduced beyond existing components (e.g., `src/components/ui/*`). | No centralized visual system or iconography pass detected. Existing ticket covers this gap. | Inspect key screens for visual anchors and icon support; compare to current product direction. |

---

## 2. Navigation

### 2.1 Persistent Bottom Navigation
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| Always-visible floating bottom navigation. Navigation items: Home, My Plan, My Nutrition, My Profile. | Partial | `src/components/MobileBottomNav.tsx` renders items; `src/components/layout/Shell.tsx` shows nav on `app` shell routes. | Bottom nav only appears for routes with `meta.shell === "app"`; assessments and marketing are not covered. Home points to `/plan-home` (auth-gated). | On mobile, visit `/today`, `/nutrition`, `/profile` (logged in) and confirm nav visibility + routing. Confirm guest does not see nav on public pages. |

---

## 3. Registration, Guest Access & Entitlements

### 3.1 Guest Assessment Access
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| Guests can complete one full assessment without registering; guests receive score, analysis, explanation. Guests cannot access protocols, 7-day plans, ongoing tracking. | Partial | Gate: `src/hooks/useGuestAssessmentGate.tsx`, UI: `src/components/onboarding/GuestAssessmentGate.tsx`. Guest hormone flow persists results in `src/pages/hormone-compass/HormoneCompassAssessment.tsx` and rehydrates in `src/pages/hormone-compass/HormoneCompassResults.tsx`. | Guest flow requires runtime verification across LIS/Nutrition/Hormone. Protocol gating is enforced via auth routes in `src/App.tsx` (e.g., `/today`, `/my-protocol`, `/protocol-library`, `/7-day-plan/:pillar`). | Logged out: complete LIS/Nutrition/Hormone → results visible. Attempt `/today`, `/my-protocol`, `/protocol-library`, `/7-day-plan/body` → redirect to `/auth`. |

### 3.2 Registration Value Exchange
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| Registration unlocks protocols, personalised 7-day plan, saved results and tracking. Transition guest → registered should feel seamless (no re-completion). | Partial | Guest migration for LIS/Nutrition in `src/pages/Auth.tsx` (RPC `claim_guest_lis_assessment`, `claim_guest_nutrition_assessment`). | No explicit guest-to-registered migration for Hormone results found; seamless transition depends on LIS/Nutrition paths. | Complete LIS/Nutrition as guest → sign up via CTA → confirm results persist in account without redoing assessment. Hormone flow requires verification. |

---

## 4. Data Persistence & Results Handling

### 4.1 Saving Assessment Results
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| All completed assessments must be saved. Results should be accessible later. Guest results should be temporarily saved. | Partial | LIS guest rehydration via RPC and session ID in `src/pages/LISResults.tsx`. Nutrition guest rehydration via RPC in `src/pages/longevity-nutrition/LongevityNutritionResults.tsx`. Hormone guest localStorage in `src/pages/hormone-compass/HormoneCompassAssessment.tsx` and `src/pages/hormone-compass/HormoneCompassResults.tsx`. | Registered history coverage varies by assessment; guest persistence is session/localStorage-based and needs runtime confirmation. | Complete each assessment; refresh results and reopen results URL for guest; confirm data persists. |

### 4.2 Unified Results Access
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| A single place to view assessment results, scores, analysis summaries. | Not Done | `src/pages/AssessmentHistory.tsx` loads only `symptom_assessments`; no unified hub for LIS/Nutrition/Hormone. | Existing ticket tracks a unified results hub. | Visit `/assessment-history` and verify it does not list LIS/Nutrition/Hormone. |

---

## 5. Protocols & Plans

### 5.1 Protocol Visibility
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| Protocols visible after registration and clearly map to daily actions. | Partial | Protocol actions feed into Today plan in `src/hooks/useDailyPlan.tsx`; protocol items are shown in `src/pages/MyProtocol.tsx`. | Mapping is functional but clarity of “why/what/how often” depends on UI and copy; needs runtime verification. | Logged in: open `/my-protocol` and verify protocol items + frequency, then `/today` reflects selected protocols. |

### 5.2 Daily Plan Integration
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| Selected protocols feed into a daily plan; daily plan actionable and checkable; completion state saved. | Done | `src/hooks/useDailyPlan.tsx` builds actions from active protocols; `src/components/today/UnifiedDailyChecklist.tsx` renders actions and completion handling. | Completion persistence uses protocol completions and nutrition action services; verify across devices. | Logged in: complete a plan item → refresh `/today` and confirm completion persisted. |

---

## 6. Assessment UX & Validation

### 6.1 Assessment Completion Rules
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| Mandatory questions enforced; sliders/inputs stable on mobile. | Partial | Hormone: answer required in `src/pages/hormone-compass/HormoneCompassAssessment.tsx`. LIS: `isCurrentQuestionAnswered()` gating in `src/pages/GuestLISAssessment.tsx`. | Nutrition required-field enforcement not clearly visible in code review; needs runtime verification. | Attempt to submit each assessment with missing required answers; confirm blocked with validation. |

### 6.2 Clear Progress Feedback
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| Show progress indicators during assessments. | Partial | LIS progress header in `src/pages/GuestLISAssessment.tsx`; Nutrition progress in `src/pages/longevity-nutrition/LongevityNutritionAssessment.tsx`; Hormone progress in `src/pages/hormone-compass/HormoneCompassAssessment.tsx`. | Other assessments (symptom, brain) not confirmed. | Run LIS/Nutrition/Hormone and verify progress displays; spot-check other assessments. |

---

## 7. Error Handling & Feedback

### 7.1 Visible Loading & Transition States
| Requirement (exact wording) | Status | Evidence in code | Notes / gaps / assumptions | Manual verification steps |
| --- | --- | --- | --- | --- |
| Never return a blank screen during loading or redirects. | Partial | `src/components/ProtectedRoute.tsx` shows redirect UI; however `return null` still exists in multiple page-level components (e.g., `src/pages/hormone-compass/HormoneCompassResults.tsx`, `src/pages/WeeklyPlan.tsx`, `src/pages/Pillars.tsx`). | Some null returns may still produce blank screens in edge cases. Existing ticket tracks removals. | Navigate directly to results pages and empty data routes; ensure a visible fallback is shown. |

---

## 8. Summary of Priorities
- P0: Bottom nav visibility, no blank screens, guest entitlements, assessment persistence.
- P1: Simplify layouts and visuals, unified results.
- P2: Progress polish and micro-interactions.

---

## Regression Hotspots (Top 5)
1) Auth gating for assessment routes (`src/App.tsx`, `src/components/ProtectedRoute.tsx`).
2) Guest gate enforcement and localStorage state (`src/hooks/useGuestAssessmentGate.tsx`).
3) Hormone guest results persistence (`src/pages/hormone-compass/HormoneCompassAssessment.tsx`, `HormoneCompassResults.tsx`).
4) Bottom nav visibility and route meta (`src/components/MobileBottomNav.tsx`, `src/navigation/routeMeta.ts`).
5) Profile completeness loop (`src/components/RequireHealthProfile.tsx`, `src/pages/CompleteHealthProfile.tsx`).

## Smoke Test Script (5 minutes)
Mobile:
1) Logged out: `/` → tap Hormone → confirm assessment loads and completes.
2) Logged out: open `/today` → redirect to `/auth`.
3) Logged in: `/today` → bottom nav visible; open `/my-protocol` and verify items.

Desktop:
1) Logged out: `/longevity-nutrition` → complete and reach results.
2) Logged in: `/assessment-history` → review list; confirm only symptom assessments.
3) Logged in: `/today` → complete one plan item and refresh.
