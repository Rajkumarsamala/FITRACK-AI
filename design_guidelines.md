# Fitness Tracker - UI/UX Fix Guidelines

## Design Approach
**System-Based**: Material Design principles with Tailwind CSS implementation, focusing on consistency, proper spacing, and responsive grid layouts.

## Core Layout System

**Container Standard**
- All pages: `max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8`
- Consistent container across landing, onboarding, and dashboard

**Spacing Primitives**
- Primary gaps: `gap-6`, `gap-8` for grids
- Section spacing: `mt-16 lg:mt-20` between major sections
- Card padding: `p-6 lg:p-8`
- Form spacing: `margin-top: 1rem` between rows

## Typography Hierarchy

**Strict Enforcement**
- H1: Largest (`text-5xl lg:text-6xl`)
- H2: Medium-large (`text-2xl lg:text-3xl`)
- H3: Card titles (smaller than H1/H2)
- Body: Standard text
- Rule: H1 must always be larger than card titles and H2

## Landing Page Specifications

**Features Grid**
- Container: `container mx-auto px-4 md:px-6 lg:px-8 max-w-[1200px]`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch`
- Cards must form straight baselines with uniform 32px gaps

**Feature Cards (Normalized)**
- Classes: `h-full m-0 p-8 rounded-2xl flex flex-col justify-between`
- Icon wrapper: `relative mb-4`
- **Forbidden**: Negative margins, absolute positioning, translate transforms
- "Lose Weight & Get Fit" and "Gain Weight & Build Muscle" must be identical in width/height/structure

**CTA Section**
- "Ready to Start?" appears in separate section BELOW features
- Spacing: `mt-16 lg:mt-20` (no overlap with features)

## Onboarding/Profile Page

**Single-Page Compact Layout**
- All fields visible on one page (no multi-step)
- Fields: Full Name, Age, Gender (buttons), Height (cm), Current Weight (kg), Target Weight (kg), Activity Level (5 levels with descriptions)
- Grid: `grid gap-6 lg:gap-8 lg:grid-cols-12`
- Left column (`lg:col-span-8`): All form fields
- Right column (`lg:col-span-4`): Profile Summary, then Pro Tips below

**Pro Tips Behavior**
- NOT sticky/fixed
- Scrolls naturally
- Appears LAST in right column

**Spacing Reduction**
- Form row spacing: `margin-top: 1rem`
- Card padding: `p-6 lg:p-8`

## Dashboard & Other Pages

**Consistency Rules**
- All cards: Same padding, border-radius, shadow
- Even gaps between rows/columns
- No element touches container edges
- Uniform spacing throughout

## Tailwind Configuration

**Content Paths**
```
content: ["./index.html","./src/**/*.{ts,tsx,js,jsx,html}"]
```

**Safelist (Prevent Purge)**
```
["container","max-w-[1200px]","grid","lg:grid-cols-12","gap-8","p-6","lg:p-8","space-y-6","text-5xl","lg:text-6xl","text-2xl","lg:text-3xl"]
```

## Responsive Requirements

**Zoom Compatibility**
- Must work at 100%, 80%, and 125% zoom on desktop
- Maintain proper spacing and readability at all zoom levels

## Component Standards

**Cards**
- Radius: `rounded-2xl`
- Padding: `p-6 lg:p-8`
- Consistent shadow treatment
- Full height in grids: `h-full`

**Buttons**
- Gender selection: Button format
- Activity levels: Button format with descriptions

## Images
No specific image requirements - focus on layout, spacing, and typography execution.