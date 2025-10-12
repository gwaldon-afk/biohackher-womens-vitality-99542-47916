# i18n Implementation Guide

## Overview
This document outlines the i18n (internationalization) implementation strategy for maintaining AU English consistency across the application.

## Architecture

### Single Source of Truth
All user-facing text is stored in locale files under `src/i18n/locales/`:
- `en-AU.json` - Australian English (DEFAULT)
- `en-GB.json` - British English
- `en-US.json` - American English  
- `en-CA.json` - Canadian English

### Configuration
The i18n system is configured in `src/i18n/config.ts`:
```typescript
fallbackLng: 'en-AU',
lng: 'en-AU', // Set AU English as default
```

## Implementation Pattern

### 1. Import useTranslation Hook
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  // ...
}
```

### 2. Replace Hardcoded Strings
❌ **WRONG - Hardcoded text:**
```typescript
<h1>What Your Results Mean</h1>
<p>Your assessment indicates significant challenges...</p>
```

✅ **CORRECT - Using i18n:**
```typescript
<h1>{t('assessmentResults.whatResultsMean')}</h1>
<p>{t('assessmentResults.categoryDescriptions.poor', { assessmentName })}</p>
```

### 3. Dynamic Content with Variables
Use template strings in locale files:
```json
{
  "categoryDescriptions": {
    "poor": "Your assessment indicates significant challenges with {{assessmentName}}..."
  }
}
```

Then pass variables:
```typescript
{t('assessmentResults.categoryDescriptions.poor', { 
  assessmentName: assessmentName.toLowerCase() 
})}
```

## Locale File Structure

### Key Naming Convention
Use dot notation for nested structure:
```json
{
  "assessmentResults": {
    "whatResultsMean": "What Your Results Mean",
    "categories": {
      "excellent": "Excellent",
      "good": "Good"
    },
    "recommendations": {
      "memory": {
        "title": "Enhance Memory Function",
        "description": "Try cognitive exercises..."
      }
    }
  }
}
```

## Spelling Differences by Locale

### AU/GB English (en-AU.json, en-GB.json)
- personalised
- optimise
- whilst
- towards
- colour
- behavioural
- journalling

### US/CA English (en-US.json, en-CA.json)
- personalized
- optimize
- while
- toward
- color
- behavioral
- journaling

## Completed Implementations

### ✅ AssessmentResults.tsx
Fully i18n enabled with all text externalized:
- Score category labels and descriptions
- Detailed analysis sections
- Personalized action plan recommendations
- Toolkit and product sections
- Guest user CTA
- Next steps navigation

## Implementation Checklist

When adding new features or pages:
1. [ ] Import `useTranslation` hook
2. [ ] Add all text strings to locale files (ALL 4 locales)
3. [ ] Use `t()` function for ALL user-facing text
4. [ ] Test with different locales to ensure proper rendering
5. [ ] Verify spelling matches locale conventions

## Anti-Patterns to Avoid

### ❌ DON'T hardcode text in JSX
```typescript
<Button>Save Changes</Button>
```

### ❌ DON'T use string concatenation
```typescript
const message = "You scored " + score + " points";
```

### ❌ DON'T mix hardcoded and i18n text
```typescript
<p>{t('results')}: {score} points</p> // "points" is hardcoded
```

### ✅ DO use i18n for everything
```typescript
<Button>{t('common.save')}</Button>
<p>{t('assessment.scoreMessage', { score })}</p>
```

## Benefits

1. **Consistency**: Single source ensures AU English stays consistent
2. **Maintainability**: Update text in one place, reflected everywhere
3. **Scalability**: Easy to add new locales or update existing ones
4. **No Regressions**: Changes to locale files don't affect code logic
5. **Type Safety**: Missing translation keys are caught at build time

## Next Steps

Pages that still need i18n implementation:
- [ ] Index.tsx
- [ ] Pillars.tsx  
- [ ] Dashboard.tsx
- [ ] Other assessment pages
- [ ] Settings pages
- [ ] Shop pages

## Maintenance

When updating text:
1. Update the primary locale file (en-AU.json)
2. Update corresponding text in other locale files with appropriate spelling
3. Test changes in both dev and production
4. Clear browser localStorage if language preference issues occur

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- Project locale files: `src/i18n/locales/`
- Configuration: `src/i18n/config.ts`
