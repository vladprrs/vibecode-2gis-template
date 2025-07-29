# API Reference

## 📚 Core Classes

### DashboardScreen

Main application screen that combines 2GIS map with interactive bottomsheet.

#### Constructor
```typescript
constructor(props: DashboardScreenProps)
```

#### Props Interface
```typescript
interface DashboardScreenProps {
  container: HTMLElement;
  searchFlowManager: SearchFlowManager;
  bottomsheetManager: BottomsheetManager;
  mapSyncService?: MapSyncService;
  mapApiKey?: string;
  className?: string;
  onSearchFocus?: () => void;
  onStoryClick?: (storyId: string) => void;
  onMetaItemClick?: (itemId: string) => void;
}
```

#### Methods

##### `activate(): void`
Shows the screen and makes it interactive.

```typescript
dashboardScreen.activate();
```

##### `deactivate(): void`
Hides the screen and pauses interactions.

```typescript
dashboardScreen.deactivate();
```

##### `snapToState(state: BottomsheetState): void`
Changes bottomsheet to specified state.

```typescript
import { BottomsheetState } from '@/types';

dashboardScreen.snapToState(BottomsheetState.FULLSCREEN);
```

##### `centerMoscow(): void`
Centers map view on Moscow coordinates.

```typescript
dashboardScreen.centerMoscow();
```

##### `testRandomMarkers(): void`
Adds 5 random markers to the map for testing.

```typescript
dashboardScreen.testRandomMarkers();
```

##### `destroy(): void`
Cleans up resources and event listeners.

```typescript
dashboardScreen.destroy();
```

#### Factory Methods

##### `DashboardScreenFactory.create(props: DashboardScreenProps): DashboardScreen`
Creates dashboard screen with custom configuration.

```typescript
import { DashboardScreenFactory } from '@/components/Screens';

const screen = DashboardScreenFactory.create({
  container: document.getElementById('app')!,
  searchFlowManager,
  bottomsheetManager,
  mapApiKey: 'your-api-key'
});
```

##### `DashboardScreenFactory.createDefault(container, searchFlowManager, bottomsheetManager, mapApiKey?): DashboardScreen`
Creates dashboard screen with default settings.

```typescript
const screen = DashboardScreenFactory.createDefault(
  container,
  searchFlowManager,
  bottomsheetManager,
  'your-api-key'
);
```

---

### SearchFlowManager

Manages navigation between screens and search state.

#### Constructor
```typescript
constructor(
  initialScreen: ScreenType = ScreenType.DASHBOARD,
  events: Partial<NavigationEvents> = {}
)
```

#### Properties
```typescript
currentScreen: ScreenType;           // Current active screen
searchContext: SearchContext;        // Search state and results
navigationHistory: ScreenType[];     // Navigation history stack
```

#### Navigation Methods

##### `goToSuggest(): void`
Navigate to search suggestions screen.

```typescript
searchFlowManager.goToSuggest();
```

##### `goToSearchResults(query: string, filters?: SearchFilters): void`
Navigate to search results with query and optional filters.

```typescript
searchFlowManager.goToSearchResults('кафе', { 
  category: 'food',
  distance: 1000 
});
```

##### `goToOrganization(organization: Organization): void`
Navigate to organization details screen.

```typescript
const organization = searchContext.results[0];
searchFlowManager.goToOrganization(organization);
```

##### `goBack(): void`
Navigate to previous screen in history.

```typescript
searchFlowManager.goBack();
```

##### `goToDashboard(): void`
Navigate to main dashboard screen and clear search context.

```typescript
searchFlowManager.goToDashboard();
```

#### Search Methods

##### `updateQuery(query: string): void`
Update current search query.

```typescript
searchFlowManager.updateQuery('новый запрос');
```

##### `updateFilters(filters: Partial<SearchFilters>): void`
Update search filters.

```typescript
searchFlowManager.updateFilters({
  category: 'restaurants',
  priceRange: 'medium'
});
```

##### `addToHistory(query: string): void`
Add query to search history.

```typescript
searchFlowManager.addToHistory('кафе рядом');
```

##### `clearHistory(): void`
Clear search history.

```typescript
searchFlowManager.clearHistory();
```

##### `selectSuggestion(suggestion: SearchSuggestion, position: number): void`
Handle suggestion selection.

```typescript
const suggestion = {
  id: '1',
  text: 'кафе',
  type: 'popular',
  subtitle: 'Популярный запрос'
};
searchFlowManager.selectSuggestion(suggestion, 0);
```

#### Event Methods

##### `onScreenChange(callback: (screen: ScreenType) => void): () => void`
Subscribe to screen changes. Returns unsubscribe function.

```typescript
const unsubscribe = searchFlowManager.onScreenChange((screen) => {
  console.log(`Current screen: ${screen}`);
});

// Later...
unsubscribe();
```

#### State Methods

##### `isLoading(): boolean`
Check if search is in progress.

```typescript
if (searchFlowManager.isLoading()) {
  showSpinner();
}
```

##### `getCurrentError(): string | undefined`
Get current error message.

```typescript
const error = searchFlowManager.getCurrentError();
if (error) {
  showErrorMessage(error);
}
```

---

### BottomsheetManager

Manages bottomsheet state transitions and gestures.

#### Constructor
```typescript
constructor(
  initialState: BottomsheetState = BottomsheetState.DEFAULT,
  config: Partial<BottomsheetConfig> = {}
)
```

#### Methods

##### `snapToState(state: BottomsheetState): void`
Animate bottomsheet to specified state.

```typescript
import { BottomsheetState } from '@/types';

bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);
```

##### `getCurrentState(): BottomsheetStateInfo`
Get current bottomsheet state information.

```typescript
const stateInfo = bottomsheetManager.getCurrentState();
console.log(`State: ${stateInfo.currentState}, Height: ${stateInfo.height}px`);
```

##### `getScrollState(): ScrollState | null`
Get current scroll state information.

```typescript
const scrollState = bottomsheetManager.getScrollState();
if (scrollState?.canScrollContent) {
  enableContentScroll();
}
```

##### `onStateChange(callback: (state: BottomsheetState) => void): () => void`
Subscribe to state changes.

```typescript
const unsubscribe = bottomsheetManager.onStateChange((newState) => {
  console.log(`Bottomsheet state: ${newState}`);
});
```

##### `destroy(): void`
Clean up resources and event listeners.

```typescript
bottomsheetManager.destroy();
```

---

### BottomsheetContainer

Low-level bottomsheet component with drag gestures.

#### Constructor
```typescript
constructor(
  element: HTMLElement,
  props: BottomsheetContainerProps
)
```

#### Props Interface
```typescript
interface BottomsheetContainerProps {
  config: BottomsheetConfig;
  events: BottomsheetEvents;
  screenHeight?: number;
}

interface BottomsheetConfig {
  state: BottomsheetState;
  snapPoints: number[];        // Height percentages: [0.2, 0.5, 0.9, 0.95]
  isDraggable: boolean;
  hasScrollableContent: boolean;
}

interface BottomsheetEvents {
  onStateChange?: (newState: BottomsheetState) => void;
  onDragStart?: (height: number) => void;
  onDrag?: (height: number, progress: number) => void;
  onDragEnd?: (startHeight: number, endHeight: number) => void;
}
```

#### Methods

##### `setContent(elements: HTMLElement[]): void`
Set bottomsheet content elements.

```typescript
const contentElements = [headerEl, bodyEl, footerEl];
bottomsheetContainer.setContent(contentElements);
```

##### `snapToState(state: BottomsheetState): void`
Animate to specified state.

```typescript
bottomsheetContainer.snapToState(BottomsheetState.SMALL);
```

##### `getCurrentState(): BottomsheetStateInfo`
Get current state information.

```typescript
const { currentState, height, progress } = bottomsheetContainer.getCurrentState();
```

##### `destroy(): void`
Clean up component.

```typescript
bottomsheetContainer.destroy();
```

---

### SearchBar

Interactive search input component.

#### Constructor
```typescript
constructor(
  container: HTMLElement,
  props: SearchBarProps
)
```

#### Props Interface
```typescript
interface SearchBarProps {
  placeholder?: string;
  state: SearchBarState;
  showSearchIcon?: boolean;
  onFocus?: () => void;
  onChange?: (query: string) => void;
  onClear?: () => void;
}

enum SearchBarState {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  FOCUSED = 'focused'
}
```

#### Methods

##### `setState(state: SearchBarState): void`
Change search bar visual state.

```typescript
import { SearchBarState } from '@/components/Search';

searchBar.setState(SearchBarState.FOCUSED);
```

##### `setValue(value: string): void`
Set search input value.

```typescript
searchBar.setValue('кафе в москве');
```

##### `getValue(): string`
Get current input value.

```typescript
const query = searchBar.getValue();
```

##### `focus(): void`
Focus the search input.

```typescript
searchBar.focus();
```

##### `blur(): void`
Remove focus from search input.

```typescript
searchBar.blur();
```

##### `destroy(): void`
Clean up component.

```typescript
searchBar.destroy();
```

---

### OrganizationCard

Card component for displaying organization information.

#### Constructor
```typescript
constructor(
  container: HTMLElement,
  organization: Organization,
  props: OrganizationCardProps
)
```

#### Props Interface
```typescript
interface OrganizationCardProps {
  showRating?: boolean;
  showDistance?: boolean;
  showAddress?: boolean;
  onClick?: (organization: Organization) => void;
  onCallClick?: (phone: string) => void;
  onRouteClick?: (coordinates: [number, number]) => void;
}
```

#### Methods

##### `updateOrganization(organization: Organization): void`
Update card with new organization data.

```typescript
const updatedOrg = {...organization, rating: 4.8};
organizationCard.updateOrganization(updatedOrg);
```

##### `highlight(): void`
Visually highlight the card.

```typescript
organizationCard.highlight();
```

##### `removeHighlight(): void`
Remove visual highlighting.

```typescript
organizationCard.removeHighlight();
```

##### `destroy(): void`
Clean up component.

```typescript
organizationCard.destroy();
```

---

## 🔧 Type Definitions

### Screen Types
```typescript
enum ScreenType {
  DASHBOARD = 'dashboard',
  SUGGEST = 'suggest', 
  SEARCH_RESULT = 'search_result',
  ORGANIZATION = 'organization'
}
```

### Bottomsheet Types
```typescript
enum BottomsheetState {
  SMALL = 'small',              // 20% height
  DEFAULT = 'default',          // 55% height
  FULLSCREEN = 'fullscreen',    // 90% height
  FULLSCREEN_SCROLL = 'fullscreen_scroll'  // 95% height
}

interface BottomsheetStateInfo {
  currentState: BottomsheetState;
  height: number;               // Current height in pixels
  progress: number;             // Animation progress 0-1
}

interface ScrollState {
  canScrollContent: boolean;    // Whether content scrolling is enabled
  scrollTop: number;           // Current scroll position
  scrollHeight: number;        // Total scrollable height
}
```

### Search Types
```typescript
interface SearchContext {
  query: string;
  filters: SearchFilters;
  results: Organization[];
  suggestions: SearchSuggestion[];
  selectedOrganization?: Organization;
  searchHistory: string[];
  isLoading: boolean;
  error?: string;
}

interface SearchFilters {
  category?: string;
  priceRange?: 'low' | 'medium' | 'high';
  rating?: number;
  distance?: number;
  isOpen?: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'history' | 'popular' | 'category' | 'address' | 'organization';
  subtitle?: string;
  organizationId?: string;
}

interface Organization {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  isAdvertiser: boolean;
  rating?: number;
  reviewsCount?: number;
  category?: string;
  description?: string;
  phone?: string;
  website?: string;
  workingHours?: string;
  photos?: string[];
}
```

### Event Types
```typescript
interface NavigationEvents {
  onScreenChange?: (
    fromScreen: ScreenType, 
    toScreen: ScreenType, 
    context: SearchContext
  ) => void;
  onSearchInitiated?: (query: string, source: string) => void;
  onSuggestionSelected?: (suggestion: SearchSuggestion, position: number) => void;
  onOrganizationSelected?: (organization: Organization, position: number) => void;
  onFilterApplied?: (filters: SearchFilters) => void;
}
```

---

## 🚀 Usage Examples

### Complete Application Setup
```typescript
import { 
  DashboardScreenFactory,
  SearchFlowManager,
  BottomsheetManager,
  ScreenType
} from '@/components';

// Initialize managers
const searchFlowManager = new SearchFlowManager(ScreenType.DASHBOARD, {
  onScreenChange: (from, to, context) => {
    console.log(`Navigation: ${from} → ${to}`);
    console.log('Search context:', context);
  },
  onSearchInitiated: (query, source) => {
    console.log(`Search initiated: "${query}" from ${source}`);
  }
});

const bottomsheetManager = new BottomsheetManager();

// Create dashboard screen
const container = document.getElementById('app')!;
const dashboardScreen = DashboardScreenFactory.createDefault(
  container,
  searchFlowManager,
  bottomsheetManager,
  process.env.VITE_MAPGL_KEY
);

// Listen to bottomsheet changes
bottomsheetManager.onStateChange((state) => {
  console.log(`Bottomsheet state: ${state}`);
});

// Navigate programmatically
searchFlowManager.goToSuggest();
```

### Custom Search Implementation
```typescript
// Create custom search flow
const customSearchFlow = new SearchFlowManager(ScreenType.DASHBOARD, {
  onSearchInitiated: async (query, source) => {
    // Custom search logic
    try {
      const results = await fetch(`/api/search?q=${query}`);
      const organizations = await results.json();
      
      // Update search context
      customSearchFlow.searchContext = {
        ...customSearchFlow.searchContext,
        results: organizations,
        isLoading: false
      };
    } catch (error) {
      customSearchFlow.searchContext = {
        ...customSearchFlow.searchContext,
        error: 'Search failed',
        isLoading: false
      };
    }
  }
});
```

### Advanced Bottomsheet Control
```typescript
// Create bottomsheet with custom configuration
const bottomsheetManager = new BottomsheetManager(
  BottomsheetState.SMALL,
  {
    snapPoints: [0.15, 0.4, 0.85, 0.95],  // Custom snap points
    isDraggable: true,
    hasScrollableContent: true
  }
);

// React to state changes
bottomsheetManager.onStateChange((state) => {
  switch (state) {
    case BottomsheetState.SMALL:
      hideMapControls();
      break;
    case BottomsheetState.FULLSCREEN:
      showFullContent();
      break;
  }
});

// Programmatic control
setTimeout(() => {
  bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);
}, 2000);
```

---

## 📝 Notes

- All methods that modify state are **synchronous** except for API calls
- Event callbacks are called **after** state changes complete
- Memory cleanup is **automatic** when calling `destroy()` methods
- TypeScript **strict mode** is enabled - all types are required
- Component lifecycle follows **create → use → destroy** pattern

For more examples and advanced usage, see the demo files in `/test/` directory.