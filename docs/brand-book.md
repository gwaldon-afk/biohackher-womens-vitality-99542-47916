# Biohackher Brand Book

## Brand Overview

**Mission:** Empowering women to beat ageing through biohacking

**Tagline:** Live well longer

**Positioning:** Women's longevity optimization platform targeting ages 25-80 across all hormone health life stages (cycling, pregnancy, perimenopause, postmenopause). This is not a menopause-specific solution but a comprehensive women's health platform.

**Target Audience:** Women aged 25-80 who are proactive about their health, interested in evidence-based wellness solutions, and seeking to optimize their healthspan and reverse biological aging.

---

## Visual Identity

### Brand Colors

The Biohackher color palette is warm, sophisticated, and approachable:

#### Primary Colors

**STONE** (Primary Neutral)
- HEX: `#E7DFD7`
- RGB: 231, 223, 215
- CMYK: 9, 9, 12, 0
- Usage: Primary background color, neutral surfaces, calm foundation

**PEACH** (Primary Accent)
- HEX: `#F8C5AC`
- RGB: 248, 197, 172
- CMYK: 0, 26, 26, 9
- Usage: Primary accent, CTAs, highlights, brand moments

**BLACK** (Text & Contrast)
- HEX: `#000000`
- RGB: 0, 0, 0
- CMYK: 0, 0, 0, 100
- Usage: Text, high contrast elements, emphasis

#### Color Usage Guidelines

- **STONE** provides the warm, calming foundation for the brand
- **PEACH** adds energy and warmth without being aggressive
- **BLACK** creates necessary contrast and readability
- Always ensure WCAG AA contrast ratios for accessibility
- Use STONE for large background areas
- Reserve PEACH for key brand moments, CTAs, and highlights
- Use BLACK for primary text and important UI elements

---

### Typography

#### Primary Typeface: **Albra**

- Usage: Headlines, hero text, brand statements
- Weights available: Multiple weights for hierarchy
- Characteristics: Modern, elegant, feminine without being delicate

#### Secondary Typeface: **AVENIR**

- Usage: Body text, UI elements, descriptions
- Weights available: Multiple weights (Light, Book, Medium, Heavy)
- Characteristics: Clean, highly readable, professional

#### Typography Hierarchy

1. **Hero Headlines** - Albra, large scale (5xl-7xl)
2. **Section Headlines** - Albra, medium scale (2xl-4xl)
3. **Subsections** - AVENIR Heavy/Medium
4. **Body Text** - AVENIR Book/Regular
5. **Small Text** - AVENIR Light

---

### Logo

#### Logo Variations

Three primary logo variations are available for different contexts:

**Logo Master** (`biohackher-logo-master.png`)
- Clean wordmark on transparent/white background
- Usage: Print materials, light backgrounds, formal contexts
- Format: PNG with transparency

**Logo OnColour** (`biohackher-logo-web.png`)
- Wordmark with peach background and "LIVE WELL LONGER" tagline
- Usage: Primary web logo, hero sections, marketing materials
- Format: PNG with background

**Logo OnBlack** (`biohackher-logo-on-black.png`)
- White version for dark backgrounds
- Usage: Dark mode, photography backgrounds, contrast situations
- Format: PNG with transparency

#### Logo Usage Guidelines

- Maintain clear space around logo (minimum 20px on web)
- Never distort or stretch the logo
- Never add effects (shadows, gradients, outlines) to the logo
- Minimum display size: 120px width for web
- Always use provided logo files - never recreate the logo

#### Logo Asset Locations

All logo variations are stored in: `src/assets/logos/`

---

## Brand Pillars

The Biohackher platform is built on four foundational pillars that guide our approach to women's longevity:

### 1. BEAUTY
External radiance as a reflection of internal health. Addresses skin health, collagen, anti-aging visible markers, and aesthetic longevity.

### 2. BRAIN
Cognitive performance, mental clarity, focus, memory, and neuroplasticity. Addresses brain health optimization and cognitive longevity.

### 3. BODY
Physical vitality, strength, metabolic health, inflammation management, and functional movement. Addresses physical longevity and healthspan.

### 4. BALANCE
Hormonal harmony, stress management, emotional wellbeing, and life integration. Addresses hormonal health across all life stages and holistic wellness.

---

## Brand Voice & Tone

### Voice Characteristics

**Empowering** - We believe women are capable, informed, and in control of their health decisions

**Science-Backed** - Every recommendation is grounded in research and evidence

**Supportive** - We meet users where they are without judgment

**Direct** - Clear, actionable guidance without fluff

**Conversational** - Warm and approachable while maintaining expertise

### Tone Guidelines

- Use second person ("you," "your") to personalize
- Avoid medical jargon unless explained
- Balance warmth with professional authority
- Use transition phrases and empathy markers
- Avoid patronizing or oversimplified language
- Position women as strong, capable, and informed

### What We Say

✅ "Live well longer"
✅ "Empowering women to beat ageing through biohacking"
✅ "Hormone health at every stage"
✅ "Evidence-based wellness for women"
✅ "Your personalized longevity plan"

### What We Don't Say

❌ "Anti-aging secrets"
❌ "Turn back the clock"
❌ "Menopause cure"
❌ "Quick fixes"
❌ "Miracle solutions"

---

## Product Categories

Biohackher products align with the four brand pillars:

### BEAUTY
- Skin Regenerator (Collagen, Turmeric, Vitamin C, Ashwagandha)
- Vegan, Gluten Free, GMO Free formulations

### BRAIN
- Age-Defender formulations
- Cognitive support supplements

### BODY
- Inflammation Fighter formulations
- Physical vitality support

### BALANCE
- Hormone support formulations
- Stress and emotional wellbeing support

All products should emphasize:
- Premium, plant-based ingredients
- Clean formulations (Vegan, Gluten Free, GMO Free where applicable)
- Evidence-based ingredient selection
- Transparent sourcing

---

## Design System

### Spacing
- Base unit: 4px
- Common spacing: 8px, 16px, 24px, 32px, 48px, 64px

### Border Radius
- Small elements: 8px
- Cards: 12px-16px
- Hero elements: 24px
- Circular elements: 50% or 9999px

### Shadows
- Subtle: `shadow-sm`
- Standard: `shadow-md`
- Elevated: `shadow-lg`
- Hero: `shadow-2xl`

### Gradients
- Primary gradient: `from-primary/10 via-secondary/5 to-background`
- Brand accents: Use PEACH with transparency (10-30%)
- Borders: `border-primary/20` to `border-primary/30`

---

## Implementation Notes

### Design System Files
- Color tokens: `src/index.css` (HSL format required)
- Tailwind config: `tailwind.config.ts`
- All colors must use semantic tokens from design system

### Logo Implementation
```tsx
import brandLogo from "@/assets/logos/biohackher-logo-web.png";
```

### Brand Color Usage in Code
Use semantic tokens from the design system rather than direct color codes:
- STONE maps to background/muted tones
- PEACH maps to primary/accent colors
- BLACK maps to foreground/text colors

---

## Contact & Resources

**Brand Assets Location:** `src/assets/logos/`

**Documentation Location:** `docs/brand-book.md`

**Custom Knowledge:** Core brand colors and guidelines stored in project Custom Knowledge for AI assistant access

---

*Last Updated: November 2024*
*Version: 1.0*
