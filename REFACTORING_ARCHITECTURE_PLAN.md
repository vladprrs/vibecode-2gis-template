# 2GIS Template - Architecture Refactoring Plan

## Executive Summary

This document outlines a comprehensive refactoring plan to address critical
architectural issues in the 2GIS Template codebase. The analysis identified
**~40% code duplication**, fragmented service architecture, and numerous unused
components that complicate maintenance and scalability.

**Key Metrics:**

- **Lines of Code to Remove:** ~1,200+ lines
- **Components to Consolidate:** 8 major duplications
- **Services to Simplify:** 4 bottomsheet managers → 1 service
- **Expected Development Speed Increase:** 30-40%

## Critical Issues Identified

### 1. Major Code Duplication (High Priority)

#### Card Components Duplication

```
OrganizationCard.ts (749 lines) ←→ BaseCard.ts + ContentCard.ts
├── Duplicate: Sizing logic (CardSize enums)
├── Duplicate: Hover effects and animations
├── Duplicate: Badge creation and styling
├── Duplicate: Header/image/footer generation
└── Impact: 3x maintenance overhead, inconsistent UX
```

#### Search Component Fragmentation

```
SearchBar.ts (721 lines) ←→ SearchHeader.ts ←→ DashboardHeader.ts
├── Duplicate: Input field creation and styling
├── Duplicate: Clear button logic and animations
├── Duplicate: Focus/blur state management
├── Duplicate: Keyboard event handling
└── Impact: 3 different search experiences
```

#### Filter System Redundancy

```
FilterBar.ts ←→ SearchFilters.ts
├── Shared: Filter item rendering
├── Shared: Horizontal scroll behavior
├── Shared: Active state management
└── Impact: Inconsistent filter UX patterns
```

### 2. Unused/Dead Code (Medium Priority)

#### Minimal Components

- `DashboardContent.ts` - 6 lines, only wraps HTMLElement
- Multiple `index.ts` files with unused exports
- Service managers with <30% method utilization

#### Over-Engineered Architecture

```
Bottomsheet Management (4 separate classes):
├── BottomsheetManager.ts
├── BottomsheetAnimationManager.ts
├── BottomsheetGestureManager.ts
└── BottomsheetScrollManager.ts
```

### 3. Service Layer Issues (High Priority)

#### Tight Coupling Problems

- Services directly instantiate dependencies
- Hard-coded service references throughout codebase
- Difficult to test and mock behaviors

#### Inconsistent Patterns

- Mixed factory vs direct instantiation
- Inconsistent event handling (callbacks/promises/direct calls)
- No standardized state management approach

## Refactoring Plan

### Phase 1: Critical Duplication Resolution (2-3 weeks)

#### 1.1 Consolidate Card Components

**Goal:** Eliminate OrganizationCard duplication

**Actions:**

```typescript
// Before: OrganizationCard reimplements everything
class OrganizationCard {
  // 749 lines of duplicate logic
}

// After: Extend BaseCard with organization-specific logic
class OrganizationCard extends BaseCard {
  constructor(config: OrganizationCardConfig) {
    super({
      ...config,
      variant: CardVariant.ELEVATED,
      clickable: true,
    });
  }

  protected createCardContent(): void {
    // Only organization-specific rendering
    this.createOrganizationInfo();
    this.createRatingSection();
    this.createContactActions();
  }
}
```

**Files to Modify:**

- `src/components/Cards/OrganizationCard.ts` - Rewrite as BaseCard extension
- `src/components/Screens/SearchResultScreen.ts` - Update usage
- `src/components/Screens/OrganizationScreen.ts` - Update usage

**Expected Outcome:** -600 lines, consistent card behavior

#### 1.2 Standardize Search Components

**Goal:** Single SearchBar implementation across all screens

**Actions:**

```typescript
// Replace SearchHeader with SearchBar configuration
const searchHeader = SearchBarFactory.createSearchResult(container, query, () =>
  this.searchFlowManager.goBack()
);

// Replace DashboardHeader search with SearchBar
const dashboardSearch = SearchBarFactory.createDashboard(container, () =>
  this.searchFlowManager.goToSuggest()
);
```

**Files to Modify:**

- `src/components/Shared/headers/SearchHeader.ts` - Remove duplicate search
  logic
- `src/components/Shared/headers/DashboardHeader.ts` - Use SearchBar component
- `src/components/Screens/SearchResultScreen.ts` - Update header usage
- `src/components/Screens/DashboardScreen.ts` - Update header usage

**Expected Outcome:** -400 lines, consistent search UX

#### 1.3 Unify Filter Components

**Goal:** Single filter system implementation

**Actions:**

```typescript
// Choose SearchFilters as primary, extend FilterBar functionality
class UnifiedFilterBar extends SearchFilters {
  static createSimple(
    container: HTMLElement,
    items: FilterItem[]
  ): UnifiedFilterBar {
    return new UnifiedFilterBar(container, {
      availableFilters: items,
      showActiveCount: false,
      showClearAll: false,
    });
  }
}
```

**Files to Modify:**

- `src/components/Filter/FilterBar.ts` - Remove or convert to factory method
- `src/components/Search/SearchFilters.ts` - Extend with simple filter
  capability
- `src/components/Screens/SearchResultScreen.ts` - Update filter usage

**Expected Outcome:** -150 lines, unified filter behavior

### Phase 2: Service Layer Simplification (2 weeks)

#### 2.1 Consolidate Bottomsheet Services

**Goal:** Single BottomsheetService with clear responsibilities

**Actions:**

```typescript
class BottomsheetService {
  private animationEngine: AnimationEngine;
  private gestureHandler: GestureHandler;
  private scrollManager: ScrollManager;

  constructor(element: HTMLElement, config: BottomsheetConfig) {
    this.animationEngine = new AnimationEngine(config.animations);
    this.gestureHandler = new GestureHandler(
      element,
      this.handleGesture.bind(this)
    );
    this.scrollManager = new ScrollManager(element, config.scrollable);
  }

  // Public API remains the same, internal complexity hidden
  snapToState(state: BottomsheetState): Promise<void> {
    /* ... */
  }
  onGesture(gesture: GestureEvent): void {
    /* ... */
  }
}
```

**Files to Modify:**

- Create `src/services/BottomsheetService.ts` - Consolidated implementation
- Update `src/main.ts` - Use single service
- Remove 4 separate bottomsheet manager files

**Expected Outcome:** -300 lines, clearer API, easier testing

#### 2.2 Implement Dependency Injection

**Goal:** Decouple services for better testability

**Actions:**

```typescript
// Service Registry Pattern
class ServiceRegistry {
  private services = new Map<string, any>();

  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  get<T>(key: string): T {
    return this.services.get(key);
  }
}

// Updated service constructors
class SearchFlowManager {
  constructor(
    private navigationService: NavigationService,
    private bottomsheetService: BottomsheetService,
    private analyticsService: AnalyticsService
  ) {}
}
```

**Files to Modify:**

- Create `src/services/ServiceRegistry.ts`
- Update `src/main.ts` - Setup service dependencies
- Update all service constructors - Accept dependencies

**Expected Outcome:** Improved testability, clearer dependencies

### Phase 3: Dead Code Elimination (1 week)

#### 3.1 Remove Minimal Components

**Actions:**

- Delete `src/components/Content/DashboardContent.ts`
- Remove unused `index.ts` exports
- Eliminate empty wrapper components

**Files to Remove:**

- `src/components/Content/DashboardContent.ts`
- Unused exports from various `index.ts` files

**Expected Outcome:** -200 lines, cleaner structure

#### 3.2 Component Usage Audit

**Actions:**

```bash
# Find unused exports
grep -r "export.*class" src/ | while read line; do
  class_name=$(echo $line | sed 's/.*class \([A-Za-z0-9_]*\).*/\1/')
  usage_count=$(grep -r "import.*$class_name" src/ | wc -l)
  if [ $usage_count -eq 0 ]; then
    echo "Unused: $class_name in $line"
  fi
done
```

**Expected Outcome:** Identify and remove 5-10 unused components

### Phase 4: Architecture Improvements (2 weeks)

#### 4.1 Standardize Event System

**Goal:** Consistent event handling across components

**Actions:**

```typescript
interface ComponentEventSystem {
  subscribe<T>(event: string, handler: (data: T) => void): () => void;
  emit<T>(event: string, data: T): void;
  unsubscribeAll(): void;
}

class BaseComponent implements ComponentEventSystem {
  private eventHandlers = new Map<string, Function[]>();

  subscribe<T>(event: string, handler: (data: T) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);

    return () => this.unsubscribe(event, handler);
  }

  emit<T>(event: string, data: T): void {
    this.eventHandlers.get(event)?.forEach(handler => handler(data));
  }
}
```

**Implementation:**

- Update all components to extend BaseComponent
- Replace callback props with event subscriptions
- Standardize event naming conventions

#### 4.2 Implement State Management Pattern

**Goal:** Predictable state updates across components

**Actions:**

```typescript
class ComponentState<T> {
  private state: T;
  private listeners: Array<(state: T) => void> = [];

  constructor(initialState: T) {
    this.state = initialState;
  }

  get(): T {
    return { ...this.state };
  }

  update(updater: (current: T) => Partial<T>): void {
    const updates = updater(this.state);
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}
```

**Implementation:**

- Create state management utilities
- Update services to use consistent state pattern
- Add state debugging capabilities

## Implementation Timeline

### Week 1-2: Critical Duplication (Phase 1.1-1.2)

- [ ] Rewrite OrganizationCard as BaseCard extension
- [ ] Update SearchHeader to use SearchBar
- [ ] Update DashboardHeader to use SearchBar
- [ ] Test search functionality across all screens

### Week 3: Filter Unification (Phase 1.3)

- [ ] Consolidate filter components
- [ ] Update SearchResultScreen filter usage
- [ ] Test filter behavior consistency

### Week 4-5: Service Simplification (Phase 2.1-2.2)

- [ ] Create consolidated BottomsheetService
- [ ] Implement ServiceRegistry
- [ ] Update service dependencies
- [ ] Add service unit tests

### Week 6: Dead Code Removal (Phase 3)

- [ ] Remove minimal components
- [ ] Audit and remove unused exports
- [ ] Clean up component structure

### Week 7-8: Architecture Improvements (Phase 4)

- [ ] Implement event system
- [ ] Add state management pattern
- [ ] Update components to use new patterns
- [ ] Add comprehensive testing

## Risk Mitigation

### High Risk: Breaking Changes

**Risk:** Search behavior changes affect user experience **Mitigation:**

- Implement feature flags for gradual rollout
- Maintain backward compatibility during transition
- Comprehensive testing of search flows

### Medium Risk: Service Dependencies

**Risk:** Service refactoring breaks component interactions **Mitigation:**

- Implement changes incrementally
- Maintain public API compatibility
- Add integration tests for service interactions

### Low Risk: Dead Code Removal

**Risk:** Remove actually used code **Mitigation:**

- Use automated tools to verify usage
- Code review all deletions
- Maintain git history for easy rollback

## Success Metrics

### Code Quality Metrics

- **Lines of Code:** Reduce by 1,200+ lines (20-25% reduction)
- **Cyclomatic Complexity:** Reduce average complexity by 30%
- **Component Duplication:** Eliminate 8 major duplications
- **Test Coverage:** Increase to 80%+ for refactored components

### Performance Metrics

- **Bundle Size:** Reduce by 15-20% through dead code elimination
- **Development Speed:** 30-40% faster feature development
- **Bug Resolution:** 50% faster due to single source of truth

### Maintainability Metrics

- **Component Reusability:** 90% of UI patterns use shared components
- **API Consistency:** 100% of services use standard patterns
- **Documentation Coverage:** Complete API documentation for all services

## Validation Plan

### Phase 1 Validation

- [ ] All screens render correctly with new components
- [ ] Search functionality works identically to before
- [ ] No visual regressions in card displays
- [ ] Filter behavior remains consistent

### Phase 2 Validation

- [ ] Bottomsheet animations work smoothly
- [ ] Service dependencies resolve correctly
- [ ] No memory leaks in service lifecycle
- [ ] Performance benchmarks meet targets

### Phase 3 Validation

- [ ] No broken imports after dead code removal
- [ ] Bundle size reduced as expected
- [ ] No runtime errors in production build

### Phase 4 Validation

- [ ] Event system works across all components
- [ ] State management provides predictable updates
- [ ] New architecture supports easy feature additions

## Conclusion

This refactoring plan addresses the core architectural issues while minimizing
risk through incremental implementation. The expected 40% code reduction and
improved maintainability will significantly enhance development velocity and
code quality.

The plan prioritizes high-impact changes first (duplication elimination)
followed by structural improvements (service layer) and cleanup (dead code
removal). This approach ensures immediate benefits while building towards a more
maintainable architecture.

Success of this refactoring will be measured not just in lines of code removed,
but in improved developer experience, faster feature delivery, and reduced bug
resolution time.
