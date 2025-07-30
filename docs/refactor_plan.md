# Refactor Plan: Breaking Down 500+ Line Files

This plan addresses the oversized files in the codebase, eliminating duplication and creating a maintainable architecture while preserving all external behavior defined in the Business Requirements document.

## 1. Current Pain Points

### Oversized Files Audit

| File Path | LOC | Primary Issues | Growth Reasons |
|-----------|-----|----------------|----------------|
| `src/components/Screens/DashboardScreen.ts` | 2106 | • Figma-style inline CSS (76 occurrences)<br>• Multiple screen management<br>• Gesture + animation + content logic | UI complexity, feature accumulation |
| `src/components/Screens/OrganizationScreen.ts` | 1816 | • Duplicate product data (lines 45-104)<br>• Extensive inline styling<br>• Mixed DOM + business logic | Figma design coupling |
| `src/services/ContentManager.ts` | 1286 | • Hardcoded UI components<br>• Mixed content generation<br>• Inline CSS strings | Content-specific logic accumulation |
| `src/components/Screens/SearchResultScreen.ts` | 1185 | • Figma header duplication<br>• Filter bar coupling<br>• Inline styling patterns | Search feature expansion |
| `src/components/Dashboard/AdviceGrid.ts` | 1054 | • 75 CSS occurrences<br>• Hardcoded grid items<br>• Mixed layout + data logic | Figma design requirements |
| `src/components/Screens/CheckoutScreen.ts` | 1024 | • Form generation repetition<br>• Payment logic mixing<br>• Style object patterns | Payment feature complexity |
| `src/components/Cards/OrganizationCard.ts` | 748 | • Advertiser/non-advertiser duplication<br>• Inline styling (21 occurrences) | Card variant requirements |
| `src/components/Screens/SuggestScreen.ts` | 648 | • Search suggestion hardcoding<br>• Header pattern duplication | Search UX enhancement |
| `src/components/Content/ProductCarousel.ts` | 603 | • Product data duplication<br>• Carousel styling patterns | Product display features |
| `src/components/Search/SearchFilters.ts` | 589 | • Filter option hardcoding<br>• Style object repetition | Filter functionality growth |
| `src/components/Search/SearchBar.ts` | 553 | • State management mixing<br>• Event handler patterns | Search interaction complexity |
| `src/components/Search/SearchSuggestions.ts` | 540 | • Suggestion rendering patterns<br>• Type-specific logic mixing | Search suggestion features |
| `src/components/Screens/CartScreen.ts` | 543 | • Cart item rendering duplication<br>• Action bar patterns | Shopping cart complexity |
| `src/components/Dashboard/DashboardComponents.ts` | 520 | • Component factory patterns<br>• Styling duplication | Dashboard feature accumulation |

### Detected Duplication Patterns

1. **Product Data**: Same product arrays in `OrganizationScreen.ts:45-104`, `ShopScreen.ts:46-104`, `CartService.ts:239-330`
2. **Inline CSS**: 267 `cssText` occurrences across 16 files, especially header/layout patterns  
3. **Header Components**: Similar header creation in `DashboardScreen.ts:899-943`, `SearchResultScreen`, `SuggestScreen`
4. **Style Assignment**: 262 `Object.assign` calls for element styling across 18 files
5. **Create Methods**: `createHeader`, `createContent`, `createLayout` patterns in 13 screen files

## 2. Target Module Structure

### New Architecture Overview

```
src/
├── components/
│   ├── screens/           # Screen coordinators (200-400 LOC max)
│   │   ├── DashboardScreen/
│   │   │   ├── index.ts
│   │   │   ├── DashboardScreen.ts      # Main coordinator (~300 LOC)
│   │   │   ├── DashboardHeader.ts      # Header component (~150 LOC)  
│   │   │   ├── DashboardContent.ts     # Content area (~200 LOC)
│   │   │   └── DashboardGestures.ts    # Gesture handling (~180 LOC)
│   │   ├── OrganizationScreen/
│   │   │   ├── index.ts
│   │   │   ├── OrganizationScreen.ts   # Main coordinator (~250 LOC)
│   │   │   ├── OrganizationHeader.ts   # Header component (~120 LOC)
│   │   │   ├── OrganizationTabs.ts     # Tab management (~200 LOC)
│   │   │   └── OrganizationActions.ts  # Action buttons (~150 LOC)
│   │   └── [other screens follow same pattern]
│   ├── shared/            # Reusable UI components
│   │   ├── headers/
│   │   │   ├── BaseHeader.ts           # Common header logic (~200 LOC)
│   │   │   ├── SearchHeader.ts         # Search-specific header (~150 LOC)
│   │   │   └── BackHeader.ts           # Back navigation header (~100 LOC)
│   │   ├── layouts/
│   │   │   ├── BottomsheetLayout.ts    # Layout wrapper (~180 LOC)
│   │   │   ├── ScrollableContent.ts    # Scrollable container (~120 LOC)
│   │   │   └── ActionBarLayout.ts      # Action bar positioning (~100 LOC)
│   │   ├── forms/
│   │   │   ├── FormField.ts            # Generic form field (~150 LOC)
│   │   │   ├── FormSection.ts          # Form section wrapper (~100 LOC)  
│   │   │   └── FormValidation.ts       # Form validation logic (~200 LOC)
│   │   └── cards/
│   │       ├── BaseCard.ts             # Card base class (~180 LOC)
│   │       └── InteractiveCard.ts      # Clickable card logic (~150 LOC)
├── data/
│   ├── products/
│   │   ├── ProductRepository.ts        # Product data access (~200 LOC)
│   │   ├── MockProducts.ts             # Sample product data (~150 LOC)
│   │   └── ProductTypes.ts             # Product type definitions (~100 LOC)
│   ├── suggestions/
│   │   ├── SuggestionRepository.ts     # Suggestion data (~150 LOC)
│   │   └── MockSuggestions.ts          # Sample suggestions (~100 LOC)
│   └── advice/
│       ├── AdviceRepository.ts         # Advice data access (~120 LOC)
│       └── MockAdvice.ts               # Sample advice data (~80 LOC)
├── styles/
│   ├── components/
│   │   ├── HeaderStyles.ts             # Header styling utilities (~150 LOC)
│   │   ├── CardStyles.ts               # Card styling utilities (~200 LOC)
│   │   ├── FormStyles.ts               # Form styling utilities (~180 LOC)
│   │   └── LayoutStyles.ts             # Layout styling utilities (~220 LOC)
│   ├── utils/
│   │   ├── StyleBuilder.ts             # CSS-in-JS builder (~200 LOC)
│   │   ├── DesignTokens.ts             # Design system tokens (~150 LOC)
│   │   └── ResponsiveUtils.ts          # Responsive helpers (~100 LOC)
│   └── themes/
│       ├── FigmaTheme.ts               # Figma design tokens (~180 LOC)
│       └── BaseTheme.ts                # Base theme system (~120 LOC)
├── services/
│   ├── content/
│   │   ├── ContentManager.ts           # Main content management (~400 LOC)
│   │   ├── ContentRepository.ts        # Content data access (~200 LOC)
│   │   ├── ContentRenderer.ts          # Content rendering (~250 LOC)
│   │   └── ContentTypes.ts             # Content type definitions (~100 LOC)
│   ├── navigation/
│   │   ├── ScreenNavigator.ts          # Navigation coordination (~300 LOC)
│   │   ├── NavigationHistory.ts        # History management (~180 LOC)
│   │   └── NavigationUtils.ts          # Navigation utilities (~120 LOC)
│   └── ui/
│       ├── bottomsheet/
│       │   ├── BottomsheetCoordinator.ts # Bottomsheet management (~250 LOC)
│       │   ├── GestureHandler.ts        # Gesture processing (~200 LOC)
│       │   ├── AnimationController.ts   # Animation management (~180 LOC)
│       │   └── StateManager.ts          # State transitions (~150 LOC)
│       └── interaction/
│           ├── TouchHandler.ts          # Touch event processing (~200 LOC)
│           ├── KeyboardHandler.ts       # Keyboard interaction (~150 LOC)
│           └── FocusManager.ts          # Focus management (~120 LOC)
└── utils/
    ├── dom/
    │   ├── ElementFactory.ts           # DOM element creation (~200 LOC)
    │   ├── StyleApplicator.ts          # Style application (~180 LOC)
    │   └── EventManager.ts             # Event handling (~220 LOC)
    ├── formatting/
    │   ├── PriceFormatter.ts           # Price formatting (~100 LOC)
    │   ├── DateFormatter.ts            # Date formatting (~80 LOC)
    │   └── TextFormatter.ts            # Text formatting (~120 LOC)
    └── validation/
        ├── FormValidator.ts            # Form validation (~250 LOC)
        ├── InputValidator.ts           # Input validation (~180 LOC)
        └── ValidationRules.ts          # Validation rules (~200 LOC)
```

### Module Responsibility Matrix

| Module Type | Max LOC | Responsibilities | Dependencies |
|-------------|---------|------------------|-------------|
| **Screen Coordinators** | 400 | Screen lifecycle, service orchestration, high-level event handling | Services, shared components |
| **Shared Components** | 200 | Reusable UI patterns, consistent styling, common interactions | Style utils, DOM utils |
| **Data Repositories** | 200 | Data access, caching, type conversion | Types, utils |
| **Style Modules** | 250 | CSS-in-JS generation, theme application, responsive logic | Design tokens |
| **Service Modules** | 400 | Business logic, state management, external integrations | Data repositories, utils |
| **Utility Modules** | 250 | Pure functions, helpers, formatters, validators | Types only |

## 3. DRY Opportunities

### A. Product Data Consolidation

**Current Duplication:**
- `OrganizationScreen.ts:45-104` - 8 product objects (59 lines)
- `ShopScreen.ts:46-104` - Same 8 products (58 lines) 
- `CartService.ts:239-330` - Same 8 products (91 lines)

**Extraction Target:**
```typescript
// src/data/products/MockProducts.ts
export const SPORTS_CLOTHING_PRODUCTS: Product[] = [
  // Consolidated product definitions
];

// src/data/products/ProductRepository.ts  
export class ProductRepository {
  getSportsClothing(): Product[] { return SPORTS_CLOTHING_PRODUCTS; }
  getByCategory(category: string): Product[] { /* filter logic */ }
  getById(id: string): Product | undefined { /* find logic */ }
}
```

### B. Style Utilities Extraction

**Current Duplication:**
- Header styles: `DashboardScreen.ts:1367-1646`, `SearchResultScreen.ts:200-350`, `SuggestScreen.ts:150-250`
- Card styles: `OrganizationCard.ts:100-300`, `AdviceGrid.ts:200-400`
- Layout styles: 262 `Object.assign` calls across 18 files

**Extraction Target:**
```typescript
// src/styles/utils/StyleBuilder.ts
export class StyleBuilder {
  static header(variant: 'dashboard' | 'search' | 'suggest'): CSSStyleDeclaration { }
  static card(variant: 'organization' | 'advice' | 'product'): CSSStyleDeclaration { }
  static layout(type: 'bottomsheet' | 'scroll' | 'action-bar'): CSSStyleDeclaration { }
}

// src/styles/components/HeaderStyles.ts  
export const HeaderStyles = {
  dashboard: () => ({ /* CSS properties */ }),
  search: () => ({ /* CSS properties */ }),
  suggest: () => ({ /* CSS properties */ }),
};
```

### C. Content Generation Patterns

**Current Duplication:**
- Suggestion rendering: `ContentManager.ts:34-200`, `SuggestScreen.ts:100-300`
- Form field creation: `CheckoutScreen.ts:200-600`, repeated patterns
- Filter creation: `SearchFilters.ts:50-300`, `FilterBarManager.ts`

**Extraction Target:**
```typescript  
// src/components/shared/forms/FormField.ts
export class FormField {
  static create(config: FieldConfig): HTMLElement { }
  static section(title: string, fields: HTMLElement[]): HTMLElement { }
}

// src/utils/dom/ElementFactory.ts
export class ElementFactory {
  static suggestion(item: SuggestionItem): HTMLElement { }
  static filter(option: FilterOption): HTMLElement { }
  static card(data: CardData, variant: CardVariant): HTMLElement { }
}
```

### D. Header Component Patterns

**Current Duplication:**
- Drag handle creation: 13 files with similar patterns
- Search input styling: `DashboardScreen.ts:914-943`, `SuggestScreen.ts:200-300`
- Close button patterns: Multiple screen files

**Extraction Target:**
```typescript
// src/components/shared/headers/BaseHeader.ts
export abstract class BaseHeader {
  protected createDragHandle(): HTMLElement { }
  protected createCloseButton(onClose: () => void): HTMLElement { }
  abstract render(): HTMLElement;
}

// src/components/shared/headers/SearchHeader.ts
export class SearchHeader extends BaseHeader {
  constructor(config: SearchHeaderConfig) { }
  render(): HTMLElement { }
}
```

## 4. Migration Strategy

### Phase 1: Utility Extraction (Week 1)
**Goal:** Extract shared utilities without changing screen behavior

**Step 1.1: Product Data Consolidation (0.5 days)**
- Create `src/data/products/MockProducts.ts` with consolidated product data
- Create `src/data/products/ProductRepository.ts` with data access methods
- Update imports in `OrganizationScreen`, `ShopScreen`, `CartService`
- **Test checkpoint:** Verify product display unchanged in all screens

**Step 1.2: Style Utilities Creation (1 day)**  
- Create `src/styles/utils/StyleBuilder.ts` with common style patterns
- Create `src/styles/components/HeaderStyles.ts`, `CardStyles.ts`, `FormStyles.ts`
- **Test checkpoint:** Style regression tests for key components

**Step 1.3: DOM Utilities Extraction (0.5 days)**
- Create `src/utils/dom/ElementFactory.ts` with element creation helpers
- Create `src/utils/formatting/` modules for price, date, text formatting
- **Test checkpoint:** Formatting output verification

### Phase 2: Shared Component Creation (Week 2)
**Goal:** Build reusable components from duplicated patterns

**Step 2.1: Header Components (1 day)**
- Create `src/components/shared/headers/BaseHeader.ts`
- Create specific header variants: `SearchHeader.ts`, `BackHeader.ts`
- Update 3 largest screen files to use new headers
- **Test checkpoint:** Header interaction tests

**Step 2.2: Form Components (1 day)**
- Create `src/components/shared/forms/FormField.ts`
- Create `src/components/shared/forms/FormSection.ts`
- Update `CheckoutScreen.ts` to use new form components
- **Test checkpoint:** Form validation and submission tests

**Step 2.3: Card Components (0.5 days)**
- Create `src/components/shared/cards/BaseCard.ts`
- Update `OrganizationCard.ts` and `AdviceGrid.ts` to extend base
- **Test checkpoint:** Card interaction and styling tests

### Phase 3: Screen Refactoring (Weeks 3-4)
**Goal:** Break down oversized screen files using extracted components

**Step 3.1: DashboardScreen Split (2 days)**
- Create `src/components/screens/DashboardScreen/` folder structure
- Split into: `DashboardScreen.ts`, `DashboardHeader.ts`, `DashboardContent.ts`, `DashboardGestures.ts`
- Maintain public API compatibility with barrel export `index.ts`
- **Test checkpoint:** Dashboard functionality end-to-end tests

**Step 3.2: OrganizationScreen Split (1.5 days)**
- Create `src/components/screens/OrganizationScreen/` folder
- Split into: `OrganizationScreen.ts`, `OrganizationHeader.ts`, `OrganizationTabs.ts`, `OrganizationActions.ts`
- **Test checkpoint:** Organization screen navigation tests

**Step 3.3: Remaining Large Screens (2 days)**
- Apply same pattern to `SearchResultScreen`, `CheckoutScreen`, `SuggestScreen`
- Focus on extracting specific UI patterns into shared components
- **Test checkpoint:** Cross-screen navigation flow tests

### Phase 4: Service Optimization (Week 5)
**Goal:** Optimize service layer architecture

**Step 4.1: ContentManager Split (1 day)**  
- Create `src/services/content/` folder structure
- Split into: `ContentManager.ts`, `ContentRepository.ts`, `ContentRenderer.ts`
- **Test checkpoint:** Content rendering consistency tests

**Step 4.2: Navigation Service Refinement (1 day)**
- Extract navigation utilities from `SearchFlowManager.ts`
- Create `src/services/navigation/NavigationHistory.ts`
- **Test checkpoint:** Navigation history and back button tests

**Step 4.3: Bottomsheet Service Split (1 day)**
- Split bottomsheet services into focused modules
- Create `src/services/ui/bottomsheet/` structure
- **Test checkpoint:** Bottomsheet gesture and animation tests

### Phase 5: Testing & Documentation (Week 6)
**Goal:** Comprehensive testing and documentation update

**Step 5.1: Unit Test Addition (2 days)**
- Add unit tests for all extracted utilities and components
- Ensure 80%+ coverage for new modules
- **Test checkpoint:** Full test suite passes

**Step 5.2: Integration Testing (1 day)**
- End-to-end testing of complete user flows
- Performance regression testing
- **Test checkpoint:** Performance benchmarks maintained

**Step 5.3: Documentation Update (1 day)**
- Update README with new architecture
- Document component APIs and usage examples
- Update business requirements document if needed

## 5. Risk & Rollback

### High-Risk Areas

**A. Circular Import Dependencies**
- **Risk:** New module structure creates import cycles
- **Detection:** TypeScript compilation errors, dependency analysis tools
- **Mitigation:** 
  - Use dependency injection for services
  - Create clear layered architecture (utils → components → screens → services)
  - Regular `madge --circular` checks during development

**B. CSS-in-JS Side Effects**
- **Risk:** Style extraction changes visual appearance
- **Detection:** Visual regression testing, pixel-perfect comparisons
- **Mitigation:**
  - Comprehensive style snapshot tests
  - CSS-in-JS style object comparison utilities
  - Figma design verification checkpoints

**C. Event Handler Order Changes**
- **Risk:** DOM element creation order affects event bubbling
- **Detection:** E2E interaction tests, event simulation
- **Mitigation:**
  - Explicit event handling order documentation
  - Event delegation patterns where possible
  - Integration tests for complex interactions

**D. State Management Side Effects**
- **Risk:** Service splitting affects shared state consistency
- **Detection:** State mutation tracking, service integration tests
- **Mitigation:**
  - Immutable state update patterns
  - Service boundary documentation
  - State flow integration tests

### Rollback Procedures

**Phase-Level Rollback:**
1. **Git Branch Strategy:** Each phase in separate feature branch
2. **Checkpoint Commits:** Commit after each successful test checkpoint
3. **Rollback Command:** `git revert --no-commit <phase-start-commit>..<phase-end-commit>`

**Component-Level Rollback:**
1. **Temporary Re-exports:** Keep old component exports until full migration
2. **Gradual Deprecation:** Mark old imports as `@deprecated` with migration timeline
3. **Fallback Imports:** Barrel exports that route to either old or new implementation

**Emergency Rollback Plan:**
1. **Feature Flags:** Environment variables to toggle between old/new implementations
2. **Compatibility Layer:** Adapter pattern for API differences
3. **Quick Revert:** Script to revert all refactor changes in < 10 minutes

### Risk Detection Tools

```bash
# Circular dependency detection
npx madge --circular --extensions ts src/

# Bundle size analysis
npx webpack-bundle-analyzer dist/stats.json

# Performance regression detection  
npm run build && npm run test:performance:compare

# Visual regression testing
npm run test:visual:compare-baseline
```

## 6. Timeline & Effort

### Resource Requirements
- **Primary Developer:** 1 senior developer (full-time)
- **Code Reviewer:** 1 tech lead (25% time for reviews)
- **QA Support:** 1 QA engineer (50% time for testing)

### Detailed Schedule

| Phase | Duration | Effort (Person-Days) | Key Deliverables | Dependencies |
|-------|----------|---------------------|------------------|-------------|
| **Phase 1: Utility Extraction** | 5 days | 2.0 | • Product data consolidation<br>• Style utilities<br>• DOM utilities | None |
| **Phase 2: Shared Components** | 7 days | 3.0 | • Header components<br>• Form components<br>• Card components | Phase 1 complete |
| **Phase 3: Screen Refactoring** | 10 days | 5.5 | • DashboardScreen split<br>• OrganizationScreen split<br>• Other large screens | Phase 2 complete |
| **Phase 4: Service Optimization** | 5 days | 3.0 | • ContentManager split<br>• Navigation refinement<br>• Bottomsheet split | Phase 3 complete |
| **Phase 5: Testing & Docs** | 4 days | 2.5 | • Unit tests<br>• Integration tests<br>• Documentation | All phases complete |

### **Total Timeline: 6 weeks (31 days)**
### **Total Effort: 16 person-days**

### Critical Path Dependencies
1. **Utility extraction must complete before component creation**
2. **Shared components must exist before screen refactoring**
3. **Screen refactoring must complete before service optimization**
4. **All code changes must complete before comprehensive testing**

### Milestone Checkpoints
- **Week 1:** Utilities extracted, style consistency verified
- **Week 2:** Shared components created, reusability proven  
- **Week 4:** Large screens refactored, maintainability improved
- **Week 5:** Services optimized, architecture cleaned
- **Week 6:** Testing complete, documentation updated

### Risk Buffer
- **10% time buffer** included in each phase for unexpected issues
- **Parallel work opportunities:** Documentation can start during Phase 4
- **Scope reduction options:** Non-critical screens can be deferred if timeline pressure

---

## Success Criteria

✅ **All files under 500 lines of code**  
✅ **Zero behavior changes (verified by existing test suite)**  
✅ **Improved maintainability metrics (cyclomatic complexity, coupling)**  
✅ **Faster development velocity for new features**  
✅ **Clear separation of concerns and single responsibility**

## Post-Refactor Benefits

1. **Developer Productivity:** New features can reuse 70%+ existing components
2. **Code Quality:** Consistent patterns, better testability, clearer ownership
3. **Performance:** Smaller bundle chunks, tree-shaking opportunities
4. **Maintainability:** Bug fixes isolated to specific modules, easier debugging
5. **Team Velocity:** Multiple developers can work on different screens simultaneously