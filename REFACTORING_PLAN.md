# DashboardScreen.ts Refactoring Plan

## Current State Analysis

**DashboardScreen.ts** contains 2646 lines of code and combines multiple functional blocks:

### Main Functional Blocks:
1. **Map Management** (MapGL integration)
2. **Bottomsheet Management** (gestures, animations, states)
3. **UI Components** (headers, search, content)
4. **Screen Navigation** (Dashboard, Suggest, Search Result)
5. **Content Management** (creating different content types)
6. **Event Handling** (clicks, gestures, search)

## Refactoring Goals

1. **Separation of Concerns** - each component should be responsible for one area
2. **Improved Readability** - code should be clear and structured
3. **Easier Testing** - isolated components are easier to test
4. **Reusability** - components should be modular
5. **UI/UX Preservation** - appearance and behavior should not change

## Refactoring Stages

### Stage 1: Extract MapManager (lines ~100-300)
**Goal**: Create a separate service for map management

**Components to create**:
- `src/services/MapManager.ts` - MapGL map management
- `src/components/Map/MapContainer.ts` - map container

**Functionality to move**:
- `createMapContainer()`
- `waitForMapGL()`
- `createRealMap()`
- `createFallbackMap()`
- `addTemporaryMarker()`
- `centerMoscow()`
- `testRandomMarkers()`

**Expected result**: DashboardScreen no longer knows about map implementation details

---

### Stage 2: Extract BottomsheetGestureManager (lines ~800-1200)
**Goal**: Create a separate manager for bottomsheet gestures and animations

**Components to create**:
- `src/services/BottomsheetGestureManager.ts` - gesture management
- `src/services/BottomsheetAnimationManager.ts` - animation management

**Functionality to move**:
- `setupBottomsheetEventListeners()`
- `handleWheel()`
- `handleScrollTouchStart/Move/End()`
- `snapToNearestState()`
- `animateToHeight()`
- `cubicBezierEasing()`

**Expected result**: DashboardScreen delegates gesture management to specialized service

---

### Stage 3: Extract HeaderManager (lines ~1300-1800)
**Goal**: Create a separate manager for header management

**Components to create**:
- `src/services/HeaderManager.ts` - header management
- `src/components/Header/SearchHeader.ts` - search header component
- `src/components/Header/SuggestHeader.ts` - suggest header component
- `src/components/Header/ResultsHeader.ts` - results header component

**Functionality to move**:
- `createFigmaHeader()`
- `updateHeaderForSuggest()`
- `updateHeaderForDashboard()`
- `updateHeaderForSearchResult()`
- `handleSearchFieldClick()`

**Expected result**: DashboardScreen doesn't know about header rendering details

---

### Stage 4: Extract ContentManager (lines ~1800-2200)
**Goal**: Create a separate manager for content management

**Components to create**:
- `src/services/ContentManager.ts` - content management
- `src/components/Content/SuggestContent.ts` - suggest content
- `src/components/Content/ResultsContent.ts` - results content
- `src/components/Content/DashboardContent.ts` - dashboard content

**Functionality to move**:
- `updateContentForSuggest()`
- `updateContentForDashboard()`
- `updateContentForSearchResult()`
- `createSuggestionRow()`
- `createResultsContent()`
- `createResultCard()`

**Expected result**: DashboardScreen delegates content creation to specialized components

---

### Stage 5: Extract FilterBarManager (lines ~2200-2400)
**Goal**: Create a separate manager for filters

**Components to create**:
- `src/services/FilterBarManager.ts` - filter management
- `src/components/Filter/FilterBar.ts` - filter component

**Functionality to move**:
- `createBottomFilterBar()`
- `createFilterBar()`
- `cleanupFixedFilterBar()`

**Expected result**: DashboardScreen doesn't know about filter implementation details

---

### Stage 6: Extract PromoBannerManager (lines ~400-600)
**Goal**: Create a separate manager for promo banners

**Components to create**:
- `src/services/PromoBannerManager.ts` - banner management
- `src/components/Promo/PromoBanner.ts` - promo banner component
- `src/components/Promo/PromoBannerSmall.ts` - small banner component

**Functionality to move**:
- `createPromoBanner()`
- `createPromoBannerSmall()`

**Expected result**: DashboardScreen delegates banner creation to specialized components

---

### Stage 7: Refactor Main DashboardScreen Class
**Goal**: Simplify main class to coordinator

**Changes**:
- Remove duplicated code
- Keep only coordination between components
- Simplify public methods
- Improve typing

**Expected result**: DashboardScreen becomes a lightweight coordinator (~200-300 lines)

---

## Refactoring Principles

### 1. Gradual Approach
- Each stage should be independent
- Code should work after each stage
- Testing at each stage

### 2. Interface Preservation
- DashboardScreen public methods don't change
- External API remains compatible
- UI/UX doesn't change

### 3. Dependency Inversion
- DashboardScreen depends on abstractions (interfaces)
- Concrete implementations are injected
- Easy testing and component replacement

### 4. Single Responsibility
- Each class is responsible for one area
- Clear boundaries between components
- Minimal dependencies

## Structure After Refactoring

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── DashboardScreen.ts (coordinator, ~300 lines)
│   │   └── DashboardContent.ts
│   ├── Header/
│   │   ├── SearchHeader.ts
│   │   ├── SuggestHeader.ts
│   │   └── ResultsHeader.ts
│   ├── Content/
│   │   ├── SuggestContent.ts
│   │   ├── ResultsContent.ts
│   │   └── DashboardContent.ts
│   ├── Filter/
│   │   └── FilterBar.ts
│   ├── Promo/
│   │   ├── PromoBanner.ts
│   │   └── PromoBannerSmall.ts
│   └── Map/
│       └── MapContainer.ts
├── services/
│   ├── MapManager.ts
│   ├── BottomsheetGestureManager.ts
│   ├── BottomsheetAnimationManager.ts
│   ├── HeaderManager.ts
│   ├── ContentManager.ts
│   ├── FilterBarManager.ts
│   └── PromoBannerManager.ts
└── types/
    ├── map.ts
    ├── header.ts
    ├── content.ts
    └── filter.ts
```

## Success Criteria

1. **File Size**: No file exceeds 500 lines
2. **Testability**: Each component can be tested in isolation
3. **Readability**: Code is clear and well-documented
4. **Performance**: No performance degradation
5. **Compatibility**: Existing code continues to work

## Risks and Mitigation

### Risks:
- Complexity of coordination between components
- Potential performance issues
- Difficulty debugging distributed code

### Mitigation:
- Thorough testing at each stage
- Using TypeScript for type safety
- Documenting interfaces
- Gradual implementation of changes

## Timeline

- **Stages 1-2**: 2-3 days
- **Stages 3-4**: 3-4 days  
- **Stages 5-6**: 2-3 days
- **Stage 7**: 1-2 days
- **Testing and final polish**: 2-3 days

**Total time**: 10-15 days

## Next Steps

1. Start with Stage 1 (MapManager)
2. Create basic service structure
3. Gradually move functionality
4. Test at each stage
5. Document changes 