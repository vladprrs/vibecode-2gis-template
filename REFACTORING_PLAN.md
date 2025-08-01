# 2GIS Application Refactoring Plan

## Problem Overview

The application was developed by multiple developers, which led to:
- Duplication of components and logic
- Accumulation of unused code
- Complexity in understanding architecture
- Issues during refactoring (changes don't apply due to use of old components)

## Current State Analysis

### ✅ Working Components (verified via Playwright)

| Component | Status | Functionality |
|-----------|--------|---------------|
| DashboardScreen | ✅ Working | Main screen with navigation |
| SuggestScreen | ✅ Working | Search and suggestions |
| SearchResultScreen | ✅ Working | Search results |
| OrganizationScreen | ✅ Working | Organization details |
| ShopScreen | ✅ Working | Product catalog |
| CartScreen | ✅ Working | Shopping cart |
| CheckoutScreen | ✅ Working | Order checkout |

### ❌ Problem Areas

#### 1. Unused Files
- `src/main-minimal.ts` - completely unused
- `src/components/Screens/SearchResultScreen/` - empty directory
- Multiple unused methods in ContentManager

#### 2. Deprecated Code
```typescript
// DashboardScreen.ts:1069
/**
 * Show suggest content in the bottomsheet (DEPRECATED - use showSuggestScreen instead)
 */
private showSuggestContent(): void

// ContentManager.ts - unused methods
updateContentForSuggest()
updateContentForDashboard() 
updateContentForOrganization()

// ProductRepository.ts:155
/**
 * @deprecated Use getSportsClothing() instead
 */
getSampleProducts(): Product[]
```

#### 3. Duplication
- 50+ console.log statements
- Method duplication in ProductRepository
- Repeated logic in Screen components

## Detailed Refactoring Plan

### Phase 1: Remove Unused Files (Priority: High)

#### 1.1 Remove main-minimal.ts
```bash
# Remove file
rm src/main-minimal.ts
```

**Justification**: File is not imported anywhere in the project, is legacy code.

#### 1.2 Clean Empty Directories
```bash
# Remove empty directory
rm -rf src/components/Screens/SearchResultScreen/
```

**Justification**: Directory is empty, contains no functionality.

#### 1.3 Check Unused Imports
```bash
# Find unused imports
npx tsc --noEmit
```

### Phase 2: ContentManager Refactoring (Priority: High)

#### 2.1 Method Usage Analysis
```typescript
// Only this method is used:
updateContentForSearchResult(contentContainer: HTMLElement, context: SearchContext)

// Unused methods to remove:
updateContentForSuggest()
updateContentForDashboard()
updateContentForOrganization()
```

#### 2.2 ContentManager Simplification
```typescript
// New minimal ContentManager
export class ContentManager {
  private searchFlowManager: SearchFlowManager;
  private cartService?: CartService;

  constructor(searchFlowManager: SearchFlowManager, cartService?: CartService) {
    this.searchFlowManager = searchFlowManager;
    this.cartService = cartService;
  }

  // Keep only the used method
  updateContentForSearchResult(contentContainer: HTMLElement, context: SearchContext): void {
    // Existing logic
  }
}
```

### Phase 3: Remove Deprecated Code (Priority: Medium)

#### 3.1 DashboardScreen
```typescript
// Remove method
private showSuggestContent(): void {
  // DEPRECATED - use showSuggestScreen instead
}

// Keep only
private showSuggestScreen(): void {
  // Active implementation
}
```

#### 3.2 ProductRepository
```typescript
// Remove deprecated method
getSampleProducts(): Product[] {
  return this.getSportsClothing();
}

// Update all calls to
getSportsClothing()
```

#### 3.3 CartService
```typescript
// Remove deprecated method
getSampleProducts(): Product[] {
  return getProductRepository().getSportsClothing();
}
```

### Phase 4: Console.log Cleanup (Priority: Low)

#### 4.1 Replace with Proper Logging Levels
```typescript
// Replace
console.log('Product clicked:', product.title);

// With
console.warn('Product clicked:', product.title);
// or remove if not critical
```

#### 4.2 Files to Clean
- `src/main.ts` (15+ console.log)
- `src/services/ContentManager.ts` (7 console.log)
- `src/components/Screens/*.ts` (20+ console.log)
- `src/services/MapSyncService.ts` (8 console.log)

### Phase 5: Import Optimization (Priority: Medium)

#### 5.1 Check Unused Imports
```bash
# Find unused imports
npx eslint . --ext .ts --rule 'no-unused-vars: error'
```

#### 5.2 Clean index.ts Files
```typescript
// src/components/Screens/index.ts
// Remove unused exports
export { DashboardScreen, DashboardScreenFactory } from './DashboardScreen';
export { OrganizationScreen } from './OrganizationScreen';
// Remove unused exports
```

### Phase 6: Testing (Priority: Critical)

#### 6.1 Playwright Tests for Each Screen
```typescript
// Navigation test
test('Dashboard navigation', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Check all main screens
});

// Cart test
test('Cart functionality', async ({ page }) => {
  // Add item to cart
  // Check checkout process
});
```

#### 6.2 Success Criteria
- ✅ All screens load without errors
- ✅ Navigation between screens works
- ✅ Adding to cart functions
- ✅ Checkout process works
- ✅ Bundle size decreased
- ✅ No deprecated warnings

## Execution Order

### Week 1: Preparation and Safety
1. **Day 1-2**: Create refactoring branch
2. **Day 3-4**: Set up additional tests
3. **Day 5**: Backup current state

### Week 2: Main Refactoring
1. **Day 1**: Phase 1 - Remove unused files
2. **Day 2**: Phase 2 - ContentManager refactoring
3. **Day 3**: Phase 3 - Remove deprecated code
4. **Day 4**: Phase 4 - Console.log cleanup
5. **Day 5**: Phase 5 - Import optimization

### Week 3: Testing and Finalization
1. **Day 1-2**: Phase 6 - Complete testing
2. **Day 3**: Fix found issues
3. **Day 4**: Final verification
4. **Day 5**: Document changes

## Risks and Mitigation

### Risks
1. **Loss of functionality**: Code removal may break the application
2. **Regressions**: Changes may affect other components
3. **Time**: Refactoring may take longer than planned

### Mitigation
1. **Phased execution**: Each phase is tested separately
2. **Automated tests**: Playwright tests to verify functionality
3. **Rollback**: Ability to rollback to previous state
4. **Documentation**: Detailed description of each change

## Success Metrics

### Before Refactoring
- Codebase size: ~50,000 lines
- Console.log count: 50+
- Deprecated methods: 5+
- Unused files: 3+

### After Refactoring (goals)
- Code size reduction: 10-15%
- Remove all deprecated methods
- Clean all unused files
- Reduce console.log count by 80%

## Conclusion

This plan provides a systematic approach to refactoring with minimal risks. Each phase includes testing to ensure functionality preservation.

**Decision criteria**: All Playwright tests must pass successfully after each phase.

**Verification method**: Automated testing via Playwright for all main user scenarios. 