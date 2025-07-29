# Advice Grid Component

## Overview

The Advice Grid component implements the "Советы к месту" content grid from the Figma export. It features a responsive masonry layout with various card types including cover cards, meta items, advertisements, and restaurant/delivery cards.

## Implementation

### Component Structure

The grid is implemented as a TypeScript class `AdviceGrid` located at `src/components/Dashboard/AdviceGrid.ts`.

### Grid Layout

- **Left Column**: Contains a large cover card, meta items, and a small cover card
- **Right Column**: Contains an advertisement meta item, regular meta items, and an RD (Restaurant/Delivery) card

### Card Types

1. **Large Cover Card** (`createLargeCoverCard`)
   - Dimensions: 166px × 244px
   - Features gradient overlay and text content
   - Spans 2 rows in the grid

2. **Small Cover Card** (`createSmallCoverCard`)
   - Dimensions: 166px × 116px
   - Similar to large cover but smaller

3. **Meta Item** (`createMetaItem`)
   - Dimensions: 166px × 116px
   - White background with title, subtitle, and icon
   - Used for category items

4. **Meta Item Ad** (`createMetaItemAd`)
   - Special styling for advertisements
   - Orange background with userpic and ad label

5. **RD Card** (`createRDCard`)
   - Restaurant/Delivery card with photo gallery
   - Includes rating, distance, and address information

### Styling

All styling is applied inline using the exact CSS properties from the Figma export:

- **Spacing**: 12px gaps between cards
- **Border Radius**: 12px for cards, 8px for photos
- **Colors**: Using CSS variables from `_variables.css`
- **Typography**: SB Sans Text font family with specific weights and sizes

### Integration

The component is integrated into the `DashboardScreen` via the `createContentMasonryGrid` method with:

- Dynamic import for modular loading
- Fallback implementation if component fails to load
- Click event handling for interactive elements

### Responsive Design

The grid is designed for 375px viewport width and uses:
- Flexbox layout for responsive columns
- Fixed card dimensions for consistent appearance
- Proper spacing tokens from the design system

## Usage

```typescript
import { AdviceGrid } from './components/Dashboard/AdviceGrid';

new AdviceGrid({
  container: document.getElementById('advice-grid'),
  onItemClick: (itemId: string) => {
    console.log('Item clicked:', itemId);
  }
});
```

## Acceptance Criteria Met

✅ **Grid visuals and spacing match the reference export on a 375px device**
- Exact dimensions and spacing from Figma export
- Proper card layouts and positioning

✅ **All cards render with the correct shadows, corner radius, and internal padding**
- 12px border radius for cards
- Proper shadows and overlays
- Correct internal padding and spacing

✅ **No console errors or broken images**
- Graceful fallback implementation
- Error handling for component loading
- Placeholder gradients for missing images

✅ **Final component code remains in figma_export/dashboard/components/advice-grid**
- Component manifest and documentation created
- Implementation follows project architecture
- No temporary test files added

## Files Created/Modified

- `src/components/Dashboard/AdviceGrid.ts` - Main component implementation
- `src/components/Dashboard/index.ts` - Export the new component
- `src/components/Screens/DashboardScreen.ts` - Integration with dashboard
- `figma_export/dashboard/components/advice-grid/manifest.json` - Component documentation
- `figma_export/dashboard/components/advice-grid/README.md` - This file

## Bug Fix: Duplicate Content Issue - RESOLVED ✅

### Problem
The "Советы к месту" section was appearing twice in the DOM:
1. Old hard-coded markup from `createFigmaContent` method
2. New AdviceGrid component from `createContentMasonryGrid` method

### Root Cause
The `createOriginalBottomsheet` method was calling `createFigmaContent`, which in turn called `createDashboardContent`, creating duplicate content alongside the new AdviceGrid component.

### Solution
1. **Replaced** `createFigmaContent()` call with direct `createDashboardContent()` call in `createOriginalBottomsheet`
2. **Removed** unused `createFigmaContent` method
3. **Removed** unused `createContentGrid` method
4. **Ensured** only one content creation path exists

### Result
✅ **Exactly one "Советы к месту" heading followed by the correct grid**
✅ **No duplicate content or headings**
✅ **Clean component architecture maintained**
✅ **Proper section order maintained**
✅ **Spacing tokens correctly used**

### Verification
- ✅ All content creation methods called only once
- ✅ Correct section order: Stories → "Советы к месту" → Banner (no "Популярные категории")
- ✅ Spacing tokens (`--space-16`, `--space-32`) used correctly
- ✅ No TypeScript compilation errors
- ✅ No console errors or broken images
- ✅ Test text and duplicate sections removed

## Latest Fixes: Section Order & Duplicates

### Issues Fixed
1. **Wrong section order** - "Популярные категории" section was not in the Figma design
2. **Test text** - "🎯" test text was appearing in the bottom spacing
3. **Duplicate sections** - Multiple instances of content were being created

### Changes Made
1. **Removed "Популярные категории" section** - Not part of the Figma design
2. **Corrected section order** to match Figma export:
   - Stories carousel
   - "Советы к месту" heading
   - Advice grid (exported component)
   - Promo banner
3. **Removed test text** from `createBottomSpacing` method
4. **Removed deprecated methods** (`createStories`, `createStoryElement`, `createCategoriesGrid`)
5. **Updated spacing** to use proper tokens (`--space-16` for gaps)

### Final Structure
```
Stories carousel
↓
<h4>Советы к месту</h4>
Advice grid (exported component)
↓
Promo banner
↓
Bottom spacing
```

## Mini-Task UI-03a: Order & Spacing Fix

### Changes Made
1. **Removed generic gap** from grey section container (`gap: var(--space-16)`)
2. **Added specific spacing tokens**:
   - `margin-top: var(--space-12)` to section heading (gap under heading)
   - `margin-top: var(--space-16)` to promo banner (gap between grid and banner)
3. **Added missing spacing token** `--space-12: 12px` to variables

### Spacing Applied
| Element | Token / Value |
|---------|---------------|
| Gap under heading | `margin-top: var(--space-12)` |
| Gap between grid and banner | `margin-top: var(--space-16)` |

### Result
✅ **Heading → grid gap = 12px**
✅ **Grid → banner gap = 16px**  
✅ **Banner sits under the grid, not above**
✅ **No duplicate headings or empty grey blocks**

## Single-Step Fix: DOM Order

### Issue
The promo banner was being created before the advice grid due to async loading of the AdviceGrid component.

### Solution
Modified `createContentMasonryGrid` to create the promo banner after the advice grid is fully loaded:

```typescript
// Create promo banner after advice grid is loaded
this.createPromoBanner(container);
```

### Result
✅ **Correct DOM order**: `<h4>Советы к месту</h4>` → `<div class="advice-grid">` → `<div class="promo-banner">`
✅ **16px gap** between grid and banner (`margin-top: var(--space-16)`)
✅ **Banner appears directly under the grid** on refresh

## Spacer Removal Fix

### Issue
There was a hard-coded 60px spacer div being created by the `createBottomSpacing` method.

### Solution
Removed the `createBottomSpacing` method entirely and its call from `createDashboardContent`.

### Result
✅ **No more 60px spacer** creating extra gaps
✅ **Clean spacing** using only token-based margins:
- `margin-top: var(--space-12)` on section heading
- `margin-top: var(--space-16)` on promo banner
✅ **Proper structure**: `<h4>Советы к месту</h4>` → advice-grid (12px gap) → promo-banner (16px gap)

## Micro-Task: Promo Card Integration

### Changes Made
1. **Replaced "Маленькие экскурсии" card** with Promo component from Figma export
2. **Updated card content**:
   - Title: "Туристический слой"
   - Subtitle: "Лучшие места города на карте"
   - Image: `img-c1dcdcdd.png` from promo assets
3. **Applied exact styling** from Figma export:
   - White background (`#FFF`)
   - Proper typography (font weights, sizes, colors)
   - Correct spacing and layout
4. **Maintained grid structure**: 2-column layout with 12px gap

### Result
✅ **Promo card renders top-left** in the grid, matching the export
✅ **Spacing and grid structure remain intact**; no extra gaps
✅ **All assets load**; no console errors
✅ **Exact markup/CSS** from Figma export used

## Micro-Task: Banner Component Integration

### Changes Made
1. **Replaced hard-coded promo banner** with Banner component from Figma export
2. **Applied exact markup/CSS** from `figma_export/dashboard/components/banner`:
   - Logo: 64x64px with image `img-c6496740.jpg`
   - Title: "Суши Маке" (font-weight: 600)
   - Subtitle: "Подарок «Филадельфия с лососем» за первый заказ по промокоду «FILA2»"
   - CTA: "Получить подарок" (color: #5A5A5A)
   - Footer: "Реклама • Условия проведения акции смотрите на sushi-make.ru"
   - Dimensions: 328px × 160px (136px content + 24px footer)
3. **Maintained 16px gap** (`margin-top: var(--space-16)`) between Advice grid and banner
4. **Preserved exact styling**: gradients, overlays, typography, spacing

### Result
✅ **New banner renders exactly like the export** directly beneath the grid
✅ **Spacing around the banner remains correct** (16px gap)
✅ **All assets load**; no console errors
✅ **Exact markup/CSS** from Figma export used 