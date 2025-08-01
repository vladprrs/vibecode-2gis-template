# Technical Refactoring Details

## Phase 1: Remove Unused Files

### 1.1 Remove main-minimal.ts

**Check before removal:**
```bash
# Ensure file is not imported
grep -r "main-minimal" src/
grep -r "main-minimal" index.html
```

**Commands to execute:**
```bash
# Remove file
rm src/main-minimal.ts

# Check that application still works
npm run dev
```

### 1.2 Clean Empty Directories

**Check contents:**
```bash
# Check directory contents
ls -la src/components/Screens/SearchResultScreen/
```

**Remove:**
```bash
# Remove empty directory
rm -rf src/components/Screens/SearchResultScreen/
```

### 1.3 Check Unused Imports

```bash
# Run TypeScript check
npx tsc --noEmit

# Run ESLint for unused variables
npx eslint . --ext .ts --rule 'no-unused-vars: error'
```

## Phase 2: ContentManager Refactoring

### 2.1 Method Usage Analysis

**Check method calls:**
```bash
# Find all ContentManager method calls
grep -r "updateContentForSuggest" src/
grep -r "updateContentForDashboard" src/
grep -r "updateContentForOrganization" src/
grep -r "updateContentForSearchResult" src/
```

### 2.2 ContentManager Simplification

**New ContentManager structure:**
```typescript
// src/services/ContentManager.ts
import { SearchContext, SearchFlowManager } from '../types';
import { CartService } from './CartService';

export class ContentManager {
  private searchFlowManager: SearchFlowManager;
  private cartService?: CartService;

  constructor(searchFlowManager: SearchFlowManager, cartService?: CartService) {
    this.searchFlowManager = searchFlowManager;
    this.cartService = cartService;
  }

  // Only used method
  updateContentForSearchResult(contentContainer: HTMLElement, context: SearchContext): void {
    // Keep existing logic
  }

  // Remove all other methods:
  // - updateContentForSuggest()
  // - updateContentForDashboard()
  // - updateContentForOrganization()
}
```

## Phase 3: Remove Deprecated Code

### 3.1 DashboardScreen

**Find deprecated method:**
```bash
grep -n "showSuggestContent" src/components/Screens/DashboardScreen.ts
```

**Remove method:**
```typescript
// Remove this method completely
private showSuggestContent(): void {
  // DEPRECATED - use showSuggestScreen instead
}
```

### 3.2 ProductRepository

**Find deprecated method:**
```bash
grep -n "getSampleProducts" src/data/products/ProductRepository.ts
```

**Remove method and update calls:**
```typescript
// Remove method
getSampleProducts(): Product[] {
  return this.getSportsClothing();
}

// Find all calls and replace with getSportsClothing()
grep -r "getSampleProducts" src/
```

### 3.3 CartService

**Find deprecated method:**
```bash
grep -n "getSampleProducts" src/services/CartService.ts
```

**Remove method:**
```typescript
// Remove method
getSampleProducts(): Product[] {
  return getProductRepository().getSportsClothing();
}
```

## Phase 4: Console.log Cleanup

### 4.1 Find All console.log

```bash
# Find all console.log in project
grep -r "console\.log" src/ | wc -l

# Find files with most console.log
grep -r "console\.log" src/ | cut -d: -f1 | sort | uniq -c | sort -nr
```

### 4.2 Replace with Proper Levels

**Replacement criteria:**
- `console.log` → `console.warn` (for important events)
- `console.log` → remove (for debug messages)
- `console.log` → `console.error` (for errors)

**Replacement examples:**
```typescript
// Before
console.log('Product clicked:', product.title);

// After
console.warn('Product clicked:', product.title);

// Before
console.log('✅ Dashboard initialized successfully');

// After
console.warn('Dashboard initialized successfully');
```

### 4.3 Files to Clean

**Cleanup priority:**
1. `src/main.ts` (15+ console.log)
2. `src/services/ContentManager.ts` (7 console.log)
3. `src/components/Screens/DashboardScreen.ts` (10+ console.log)
4. `src/services/MapSyncService.ts` (8 console.log)
5. Other files

## Phase 5: Import Optimization

### 5.1 Check Unused Imports

```bash
# TypeScript check
npx tsc --noEmit

# ESLint check
npx eslint . --ext .ts --rule 'no-unused-vars: error'

# Find unused imports
npx eslint . --ext .ts --rule 'no-unused-vars: error' --format=compact
```

### 5.2 Clean index.ts Files

**src/components/Screens/index.ts:**
```typescript
// Check which exports are actually used
export { DashboardScreen, DashboardScreenFactory } from './DashboardScreen';
export { OrganizationScreen } from './OrganizationScreen';
export { SearchResultScreen } from './SearchResultScreen';
export { SuggestScreen } from './SuggestScreen';
export { ShopScreen } from './ShopScreen';
export type { ShopScreenProps } from './ShopScreen';
export { CartScreen } from './CartScreen';
export type { CartScreenProps } from './CartScreen';
export { CheckoutScreen } from './CheckoutScreen';
export type { CheckoutScreenProps } from './CheckoutScreen';
```

## Phase 6: Testing

### 6.1 Playwright Tests

Use the MCP Playwright server, target the project running on port 8080, and always check which versions of screens and components you're working with.


### Code Quality
```bash
# ESLint
npx eslint . --ext .ts

# TypeScript check
npx tsc --noEmit

# Prettier
npx prettier --check .
```

## Checklist for Each Phase

### Phase 1 ✅
- [ ] main-minimal.ts removed
- [ ] Empty SearchResultScreen directory removed
- [ ] No TypeScript errors
- [ ] Application starts

### Phase 2 ✅
- [ ] ContentManager simplified
- [ ] Unused methods removed
- [ ] updateContentForSearchResult works
- [ ] No console errors

### Phase 3 ✅
- [ ] showSuggestContent removed
- [ ] getSampleProducts removed from ProductRepository
- [ ] getSampleProducts removed from CartService
- [ ] All calls updated

### Phase 4 ✅
- [ ] console.log replaced with console.warn/error
- [ ] Debug console.log removed
- [ ] Console.log count reduced by 80%
- [ ] No console errors

### Phase 5 ✅
- [ ] No unused imports
- [ ] index.ts files cleaned
- [ ] ESLint shows no errors
- [ ] TypeScript compiles without errors

### Phase 6 ✅
- [ ] All Playwright tests pass
- [ ] Bundle size decreased
- [ ] Performance not degraded
- [ ] All functions work correctly 