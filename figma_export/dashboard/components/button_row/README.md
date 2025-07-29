# ButtonRow Component

## Overview
The ButtonRow component is a horizontal quick-action row that sits directly below the search bar on the Dashboard screen. It provides users with quick access to common actions like bookmarking, navigation home, and work directions.

## Implementation Details

### Source Files
- **Component**: `src/components/Dashboard/ButtonRow.ts`
- **Integration**: `src/components/Screens/DashboardScreen.ts`
- **Assets**: `src/assets/images/` (bookmark.svg, home.svg, work.svg)

### Features
- ✅ Horizontal scrolling with snap behavior
- ✅ Icons load correctly via @/assets alias
- ✅ Matches Figma export design exactly
- ✅ Compact 40px height buttons with proper sizing
- ✅ Red "45 мин" badge for Home button (rgba(245,55,60,1)) - INSIDE button
- ✅ Yellow "45 мин" badge for Work button (rgba(239,167,1,1)) - INSIDE button
- ✅ No text display in row (only icons + badges)
- ✅ Badges positioned inside buttons, not floating above
- ✅ Responsive on 375px device width
- ✅ No 404 errors for assets
- ✅ Smooth interaction and hover effects
- ✅ 16px vertical gap between search bar and button row (using --space-16 token)

### Button Types
1. **Icon-only**: Bookmark button ("В путь")
2. **Icon + Badge**: Home button with red "45 мин" badge
3. **Icon + Badge**: Work button with yellow "45 мин" badge

### CSS Classes
- `.buttons-row`: Main container with padding and positioning
- `.buttons-row-container`: Scrollable container with gap and snap behavior (width: 704px)
- `.smart-button`: Individual button with background and border-radius
- `.button-content`: Button content wrapper with padding (10px 9px) and gap (5px)
- `.icon-container`: Icon wrapper with positioning (23px × 20px)
- `.icon-wrapper`: Icon container with absolute positioning (24px × 24px)
- `.button-badge`: Badge element for time indicators (position: relative, inside button content)
- `.badge-container`: Container for badge with flex layout and gap

### Usage
```typescript
import { ButtonRow, ButtonRowItem } from '../Dashboard';

const buttonItems: ButtonRowItem[] = [
  {
    id: 'bookmark',
    text: 'В путь',
    iconSrc: '@/assets/images/bookmark.svg',
    type: 'icon'
  },
  {
    id: 'home',
    text: 'Домой', 
    iconSrc: '@/assets/images/home.svg',
    type: 'icon'
  },
  {
    id: 'work',
    text: 'На работу',
    iconSrc: '@/assets/images/work.svg',
    type: 'icon'
  }
];

new ButtonRow({
  container: element,
  items: buttonItems,
  onButtonClick: (buttonId) => {
    console.log('Button clicked:', buttonId);
  }
});
```

## Acceptance Criteria Status

- ✅ **Reference markup and styles**: Uses exact Figma export structure
- ✅ **Dashboard integration**: Integrated into DashboardScreen in all sheet states
- ✅ **Horizontal scrolling**: Smooth scroll with snap behavior
- ✅ **Asset loading**: Icons load via @/assets alias with fallbacks
- ✅ **375px compatibility**: Tested and verified
- ✅ **No 404s**: All assets load correctly
- ✅ **16px vertical gap**: Between search bar and button row using --space-16 token

## Testing
- **Simple Test**: `test/button-row-simple.html`
- **Acceptance Test**: `test/button-row-acceptance.html`
- **Integration Test**: Dashboard screen with ButtonRow component

## Assets
Copied from Figma export to `src/assets/images/`:
- `bookmark.svg` - Bookmark icon
- `home.svg` - Home icon  
- `work.svg` - Work icon

All assets are served correctly via Vite's asset handling and @/assets alias. 