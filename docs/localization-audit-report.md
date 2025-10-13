# Localization Audit Report
**Date:** 2025-01-XX
**Status:** 🔴 Needs Significant Work

## Executive Summary

**Current Localization Coverage:** ~15%
- Only 5 of ~40 pages implement i18n
- Many hardcoded English strings, especially "optimization" vs "optimisation"
- LocaleSelector is properly implemented and visible in Navigation ✅
- Core infrastructure is solid (i18n config, locale service, hooks) ✅

## Spelling Differences Critical for UX

### AU/GB English (with 's'):
- Optimisation, personalised, analyse, recognise, organise, specialise

### US/CA English (with 'z'):
- Optimization, personalized, analyze, recognize, organize, specialize

## Current State Analysis

### ✅ Fully Localized Pages
1. **AssessmentResults** - Comprehensive i18n implementation
2. **Index (Homepage)** - Hero section and main content
3. **MyGoals** - Goals management interface
4. **Nutrition** - Just implemented (nutrition.*) 
5. **Pillars** - Pillar descriptions and navigation
6. **Navigation** - All menu items and labels

### 🟡 Partially Localized
- None identified (pages either have it or don't)

### 🔴 Not Localized (High Priority)
1. **Dashboard** - Main user hub with hardcoded "analysis", "personalized"
2. **Settings** - Profile, notifications, privacy settings
3. **BrainAssessment** - Cognitive assessment with many "optimization" instances
4. **LISResults** - Longevity assessment results
5. **DailyScoreResults** - Daily tracking results
6. **FAQ** - All content is hardcoded

### 🔴 Not Localized (Medium Priority)
7. **About** - Company information
8. **AdvisoryBoard** - Team profiles
9. **GuestLISResults** - Guest assessment results
10. **LongevityMindsetQuiz** - Quiz content
11. **Sleep** - Sleep tracking/optimization
12. **ProgressTracking** - User progress displays
13. **Reports** - Report generation
14. **Coaching** - Coaching interface
15. **Shop** - E-commerce interface

### 🔴 Not Localized (Lower Priority)
- BiohackingToolkit, Therapies, Supplements, WearableIntegrations
- SevenDayPlan, Symptoms, SymptomAssessment, SymptomTrends
- MyProtocol, ProtocolBuilderDialog
- Onboarding, Auth
- Upgrade

## Critical Issues Found

### Issue #1: Inconsistent Spelling
**Severity:** HIGH
**Impact:** Users in AU/GB see US English spellings everywhere
**Locations:** 70+ instances of "Optimization" across 16 files

### Issue #2: LocaleSelector Works But Has No Effect
**Severity:** HIGH
**Impact:** Users can change locale but 85% of content doesn't respond
**Root Cause:** Most components don't use useTranslation()

### Issue #3: Hardcoded Medical/Health Terms
**Severity:** MEDIUM
**Impact:** Professional terminology not adapting to regional preferences
**Examples:** "analyze", "personalized recommendations", "optimized"

## Locale Service & Infrastructure Status

### ✅ Working Components
1. **i18n Configuration** (`src/i18n/config.ts`)
   - Proper setup with fallback to en-AU
   - Language detection working
   - Resource loading functional

2. **LocaleSelector Component** (`src/components/LocaleSelector.tsx`)
   - Visible in navigation (desktop & mobile)
   - Updates user profile with locale
   - Sets currency and measurement system
   - Proper integration with useAuth

3. **Locale Service** (`src/services/localeService.ts`)
   - IP geolocation detection
   - User locale persistence in Supabase
   - Country-specific defaults (currency, measurements, timezone)

4. **useLocale Hook** (`src/hooks/useLocale.tsx`)
   - Currency formatting
   - Temperature conversion (F/C)
   - Weight conversion (lbs/kg)
   - Height conversion (ft/cm)

### ⚠️ Areas Needing Attention
1. **Translation Files Coverage**
   - en-US.json: ~260 keys
   - en-GB.json: ~260 keys (recently added nutrition)
   - en-AU.json: ~260 keys (recently added nutrition)
   - en-CA.json: ~260 keys
   - **Need to add:** ~500+ more keys for remaining pages

2. **useLocale Hook Integration**
   - Currently not used in many numeric displays
   - Currency formatting not consistently applied
   - Measurement conversions not applied in health data displays

## Recommended Action Plan

### Phase 1: Critical UX Fixes (Immediate)
1. ✅ Fix Nutrition page (DONE)
2. Add i18n to Dashboard (highest traffic page)
3. Add i18n to Settings (user profiles)
4. Add i18n to BrainAssessment (many "optimization" instances)

### Phase 2: Core User Journey (This Sprint)
5. LISResults, DailyScoreResults
6. FAQ (high visibility)
7. About, AdvisoryBoard (brand pages)

### Phase 3: Secondary Features (Next Sprint)
8. Sleep, ProgressTracking, Reports
9. Coaching, Shop
10. Remaining toolkit pages

### Phase 4: Polish & Edge Cases
11. Onboarding, Auth flows
12. ProtocolBuilder, SevenDayPlan
13. Guest flows
14. Error messages and toasts

## Translation Key Structure Best Practices

### Naming Convention
```
page.section.element
dashboard.welcome.title
dashboard.welcome.subtitle
assessment.results.excellent.title
```

### Grouping Strategy
- Common: Shared across all pages (save, cancel, loading, etc.)
- Navigation: Menu items and labels
- Page-specific: One key group per major page
- Components: Reusable component strings

## Testing Checklist
- [ ] Switch locale in navigation
- [ ] Verify Dashboard shows correct spelling
- [ ] Check Settings page displays localized text
- [ ] Verify currency formats correctly (£, $, AUD, CAD)
- [ ] Test measurement conversions (kg/lbs, cm/ft, C/F)
- [ ] Confirm date formats follow locale conventions
- [ ] Check mobile navigation locale selector works
- [ ] Verify user profile saves locale preference
- [ ] Test page reload preserves locale choice

## Metrics to Track
- Translation coverage: Currently ~15%, target 95%+
- Hardcoded strings: Currently ~500+, target <50
- Pages with i18n: Currently 6/40, target 38+/40
- User locale selection: Track in analytics
- Locale satisfaction: Add to user surveys

## Next Steps
1. Get approval for Phase 1 work
2. Create translation keys for Dashboard, Settings, BrainAssessment
3. Implement i18n in those pages
4. Test thoroughly with locale switching
5. Move to Phase 2

## Notes
- All new features MUST include i18n from day one
- PRs should be rejected if they add hardcoded user-facing strings
- Consider hiring native speakers for AU/GB English review
- Add linter rule to catch hardcoded strings (future)
