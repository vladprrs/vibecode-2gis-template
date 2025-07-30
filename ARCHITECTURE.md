# Architecture Guide

## 🏗️ System Overview

VibeCode 2GIS Template follows a **modular component-based architecture** with clear separation of concerns. The system is built around TypeScript classes that handle specific aspects of the application.

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Layer                         │
├─────────────────────────────────────────────────────────┤
│  main.ts (Entry Point)                                  │
│  ├── App Class                                          │
│  └── Global Error Handlers                              │
├─────────────────────────────────────────────────────────┤
│                   Screen Layer                           │
│  ├── DashboardScreen (Primary)                          │
│  ├── SearchResultScreen                                 │
│  ├── SuggestScreen                                      │
│  ├── OrganizationScreen                                 │
│  ├── ShopScreen                                         │
│  └── CartScreen                                         │
├─────────────────────────────────────────────────────────┤
│                 Component Layer                          │
│  ├── Bottomsheet/                                       │
│  │   ├── BottomsheetContainer                           │
│  │   ├── BottomsheetHeader                              │
│  │   └── BottomsheetContent                             │
│  ├── Search/                                            │
│  │   ├── SearchBar                                      │
│  │   ├── SearchFilters                                  │
│  │   └── SearchSuggestions                              │
│  ├── Cards/                                             │
│  │   └── OrganizationCard                               │
│  ├── Dashboard/                                         │
│  │   ├── ButtonRow                                      │
│  │   ├── StoriesCarousel                                │
│  │   └── AdviceGrid                                     │
│  ├── Filter/                                            │
│  │   └── FilterBar                                      │
│  ├── Map/                                               │
│  │   ├── MapContainer                                   │
│  │   └── MapGLComponent                                 │
│  └── Organization/                                      │
│      └── TabBar                                         │
├─────────────────────────────────────────────────────────┤
│                 Service Layer                            │
│  ├── SearchFlowManager (Navigation)                     │
│  ├── BottomsheetManager (State)                         │
│  ├── BottomsheetScrollManager (Scroll)                  │
│  ├── BottomsheetGestureManager (Gestures)               │
│  ├── BottomsheetAnimationManager (Animations)           │
│  ├── ContentManager (Content Management)                │
│  ├── FilterBarManager (Filter UI)                       │
│  ├── CartService (Shopping Cart)                        │
│  ├── MapManager (Map Integration)                       │
│  └── MapSyncService (Map-UI Sync)                       │
├─────────────────────────────────────────────────────────┤
│                   Type Layer                             │
│  ├── bottomsheet.ts                                     │
│  ├── navigation.ts                                      │
│  ├── map.ts                                             │
│  └── index.ts                                           │
├─────────────────────────────────────────────────────────┤
│                External Dependencies                     │
│  ├── 2GIS MapGL API                                     │
│  ├── Vite Build System                                  │
│  └── TypeScript Compiler                                │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Core Principles

### 1. Single Responsibility
Each class has one clear purpose:
- **DashboardScreen** - Renders main UI with map and coordinates all components
- **SearchFlowManager** - Handles navigation logic and search state
- **BottomsheetManager** - Manages bottomsheet states and transitions
- **ContentManager** - Manages dynamic content for different screens
- **CartService** - Handles shopping cart state and operations
- **MapSyncService** - Synchronizes map with UI state

### 2. Dependency Injection
Components receive dependencies through constructors:
```typescript
class DashboardScreen {
  constructor(props: DashboardScreenProps) {
    this.searchFlowManager = props.searchFlowManager;
    this.bottomsheetManager = props.bottomsheetManager;
    this.filterBarManager = props.filterBarManager;
    this.cartService = props.cartService;
    this.mapManager = props.mapManager;
  }
}
```

### 3. Event-Driven Communication
Components communicate through events, not direct calls:
```typescript
// Service publishes events
searchFlowManager.onScreenChange((screen) => {
  dashboardScreen.handleScreenChange(screen);
});

// Components react to events
bottomsheetManager.onStateChange((state) => {
  mapSyncService.adjustViewport(state);
});
```

### 4. Immutable State
State updates create new objects rather than mutating existing ones:
```typescript
// ❌ Avoid mutation
this.searchContext.query = newQuery;

// ✅ Create new state
this.searchContext = {
  ...this.searchContext,
  query: newQuery
};
```

## 🔧 Component Architecture

### Screen Components

#### DashboardScreen
**Purpose**: Main application screen combining map and bottomsheet
**Location**: `src/components/Screens/DashboardScreen.ts`

```typescript
class DashboardScreen {
  // Dependencies
  private props: DashboardScreenProps;
  private mapManager: MapManager;
  
  // Child components
  private bottomsheetContainer?: BottomsheetContainer;
  private searchBar?: SearchBar;
  private filterBarManager: FilterBarManager;
  private cartService: CartService;
  
  // Lifecycle
  async initialize(): Promise<void>
  destroy(): void
  
  // Public interface
  activate(): void
  deactivate(): void
  snapToState(state: BottomsheetState): void
  handleScreenChange(from: ScreenType, to: ScreenType, context: SearchContext): void
}
```

**Responsibilities**:
- Map initialization and 2GIS MapGL integration
- Bottomsheet creation and configuration
- Screen state management (Dashboard/Suggest/SearchResult/Organization/Shop/Cart)
- Event handling for user interactions
- Component lifecycle management

**Data Flow**:
```
User Input → DashboardScreen → Services → State Update → UI Rerender
```

#### Other Screens
- **SearchResultScreen** - Displays search results with filters
- **SuggestScreen** - Shows search suggestions and history
- **OrganizationScreen** - Detailed organization information
- **ShopScreen** - Product catalog and shopping interface
- **CartScreen** - Shopping cart management

### Service Architecture

#### SearchFlowManager
**Purpose**: Navigation between screens and search state management
**Location**: `src/services/SearchFlowManager.ts`

```typescript
class SearchFlowManager implements ISearchFlowManager {
  // State
  public currentScreen: ScreenType;
  public searchContext: SearchContext;
  public navigationHistory: ScreenType[];
  
  // Navigation
  goToSuggest(): void
  goToSearchResults(query: string, filters?: SearchFilters): void
  goToOrganization(organization: Organization): void
  goToShop(shop: Shop): void
  goToCart(): void
  goBack(): void
  goToDashboard(): void
  
  // Search
  updateQuery(query: string): void
  updateFilters(filters: Partial<SearchFilters>): void
  selectSuggestion(suggestion: SearchSuggestion, position: number): void
}
```

**State Management Pattern**:
```typescript
// 1. Receive action
goToSearchResults(query: string, filters?: SearchFilters): void {
  // 2. Update state
  this.updateQuery(query);
  this.addToHistory(query);
  
  // 3. Navigate
  this.navigateToScreen(ScreenType.SEARCH_RESULT);
  
  // 4. Trigger side effects
  this.performSearch(query, this.searchContext.filters);
  
  // 5. Emit events
  this.events.onSearchInitiated?.(query, 'search_bar');
}
```

#### BottomsheetManager
**Purpose**: Bottomsheet state transitions and gesture handling
**Location**: `src/services/BottomsheetManager.ts`

```typescript
class BottomsheetManager {
  // State
  private currentState: BottomsheetState;
  private config: BottomsheetConfig;
  
  // State management
  snapToState(state: BottomsheetState): Promise<void>
  getCurrentState(): BottomsheetStateData
  startDrag(startY: number): void
  handleDrag(deltaY: number): void
  endDrag(velocity: number, currentHeight: number): Promise<void>
  
  // Events
  onStateChange(callback: (state: BottomsheetState) => void): () => void
}
```

**State Machine**:
```
SMALL ←→ DEFAULT ←→ FULLSCREEN ←→ FULLSCREEN_SCROLL
  ↑         ↑           ↑              ↑
 20%       55%         90%            95%
```

#### ContentManager
**Purpose**: Dynamic content management for different screen states
**Location**: `src/services/ContentManager.ts`

```typescript
class ContentManager {
  // Content management
  updateContentForSuggest(contentContainer: HTMLElement): void
  updateContentForDashboard(contentContainer: HTMLElement): void
  updateContentForSearchResult(contentContainer: HTMLElement, context: SearchContext): void
  updateContentForOrganization(contentContainer: HTMLElement, organization: Organization): void
}
```

#### CartService
**Purpose**: Shopping cart state management
**Location**: `src/services/CartService.ts`

```typescript
class CartService {
  // Cart operations
  addToCart(product: Product, quantity?: number): void
  removeFromCart(productId: string): void
  updateQuantity(productId: string, newQuantity: number): void
  clearCart(): void
  
  // State queries
  getState(): CartState
  getProductQuantity(productId: string): number
  isInCart(productId: string): boolean
  
  // Events
  subscribe(callback: (state: CartState) => void): () => void
}
```

### Component Hierarchy

```
DashboardScreen
├── MapComponent (2GIS MapGL)
├── BottomsheetContainer
│   ├── BottomsheetHeader
│   │   └── SearchBar
│   └── BottomsheetContent
│       ├── ButtonRow
│       ├── StoriesCarousel
│       ├── ContentGrid
│       └── ScrollableContent
├── FilterBarManager
└── CartService
```

## 🔄 Data Flow Patterns

### 1. User Interaction Flow
```
User Click → Component Event → Service Method → State Update → UI Rerender
```

Example - Search initiation:
```typescript
// 1. User clicks search bar
searchBar.addEventListener('focus', () => {
  // 2. Component handles event
  this.props.onSearchFocus?.();
});

// 3. Screen receives event
onSearchFocus: () => {
  // 4. Service method called
  this.searchFlowManager.goToSuggest();
}

// 5. Service updates state and navigation
goToSuggest(): void {
  this.navigateToScreen(ScreenType.SUGGEST);
  this.loadSuggestions();
}
```

### 2. State Synchronization Flow
```
Service State Change → Event Emission → Component Reaction → UI Update
```

Example - Bottomsheet state change:
```typescript
// 1. Service state changes
bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);

// 2. Event emitted
this.events.onStateChange?.(newState);

// 3. Components react
mapSyncService.adjustMapViewport(newState);
dashboardScreen.updateLayoutForState(newState);

// 4. UI updates
this.element.style.transform = `translateY(${newHeight}px)`;
```

### 3. Async Operation Flow
```
User Action → Loading State → API Call → Success/Error → UI Update
```

Example - Search execution:
```typescript
// 1. User action triggers search
goToSearchResults(query: string): void {
  // 2. Set loading state
  this.searchContext = { ...this.searchContext, isLoading: true };
  
  // 3. Async operation
  this.performSearch(query, filters);
}

// 4. Async method
private async performSearch(query: string, filters: SearchFilters): Promise<void> {
  try {
    // 5. API call
    const results = await this.fetchSearchResults(query, filters);
    
    // 6. Success state
    this.searchContext = {
      ...this.searchContext,
      results,
      isLoading: false
    };
  } catch (error) {
    // 7. Error state  
    this.searchContext = {
      ...this.searchContext,
      isLoading: false,
      error: error.message
    };
  }
}
```

## 🏭 Factory Pattern Usage

### DashboardScreenFactory
Creates screen instances with proper dependency injection:

```typescript
export class DashboardScreenFactory {
  static create(props: DashboardScreenProps): DashboardScreen {
    return new DashboardScreen(props);
  }
  
  static createDefault(
    container: HTMLElement,
    searchFlowManager: SearchFlowManager,
    bottomsheetManager: BottomsheetManager,
    filterBarManager: FilterBarManager,
    cartService: CartService,
    mapManager: MapManager
  ): DashboardScreen {
    return new DashboardScreen({
      container,
      searchFlowManager,
      bottomsheetManager,
      filterBarManager,
      cartService,
      mapManager
    });
  }
}
```

**Benefits**:
- Consistent object creation
- Default configuration management
- Dependency injection setup
- Testing flexibility

## 🎭 Event System Architecture

### Event Types
```typescript
interface NavigationEvents {
  onScreenChange?: (from: ScreenType, to: ScreenType, context: SearchContext) => void;
  onSearchInitiated?: (query: string, source: string) => void;
  onSuggestionSelected?: (suggestion: SearchSuggestion, position: number) => void;
  onOrganizationSelected?: (organization: Organization, position: number) => void;
  onFilterApplied?: (filters: SearchFilters) => void;
}

interface BottomsheetEvents {
  onStateChange?: (fromState: BottomsheetState, toState: BottomsheetState) => void;
  onDragStart?: (height: number) => void;
  onDrag?: (height: number, progress: number) => void;
  onDragEnd?: (startHeight: number, endHeight: number) => void;
  onSnapToState?: (targetState: BottomsheetState) => void;
}

interface CartEvents {
  onCartUpdated?: (state: CartState) => void;
  onItemAdded?: (item: CartItem) => void;
  onItemRemoved?: (productId: string) => void;
  onQuantityChanged?: (productId: string, newQuantity: number) => void;
}
```

### Event Subscription Pattern
```typescript
class ServiceWithEvents {
  private callbacks: Array<(data: any) => void> = [];
  
  // Subscribe method returns unsubscribe function
  onEvent(callback: (data: any) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
  
  // Emit events to all subscribers
  private emit(data: any): void {
    this.callbacks.forEach(callback => callback(data));
  }
}
```

## 🗺️ Map Integration Architecture

### MapManager Integration Pattern
```typescript
class DashboardScreen {
  private async createRealMap(container: HTMLElement): Promise<void> {
    // 1. Use MapManager for initialization
    await this.mapManager.initialize(container);
    
    // 2. Setup event handlers
    this.mapManager.on('click', this.handleMapClick.bind(this));
    this.mapManager.on('styleload', this.handleMapReady.bind(this));
    
    // 3. Add initial markers
    this.mapManager.addTestMarkers();
  }
  
  private createFallbackMap(container: HTMLElement): void {
    // Graceful degradation when MapGL unavailable
    container.innerHTML = `<div class="map-fallback">...</div>`;
  }
}
```

### Map-UI Synchronization
```typescript
class MapSyncService {
  adjustMapViewport(bottomsheetHeight: number): void {
    if (!this.mapComponent) return;
    
    // Calculate available map area
    const availableHeight = window.innerHeight - bottomsheetHeight;
    const mapCenter = this.calculateOptimalCenter(availableHeight);
    
    // Update map view
    this.mapComponent.setCenter(mapCenter);
    this.mapComponent.setBounds(this.calculateBounds(availableHeight));
  }
}
```

## 🧩 Component Composition

### Composition over Inheritance
Components are composed rather than inherited:

```typescript
class DashboardScreen {
  // Composed components
  private bottomsheetContainer?: BottomsheetContainer;
  private bottomsheetHeader?: BottomsheetHeader;
  private bottomsheetContent?: BottomsheetContent;
  private searchBar?: SearchBar;
  private filterBarManager: FilterBarManager;
  private cartService: CartService;
  
  private createBottomsheet(): void {
    // Create container
    this.bottomsheetContainer = new BottomsheetContainer(element, props);
    
    // Create and add header
    this.bottomsheetHeader = new BottomsheetHeader(headerElement, headerProps);
    
    // Create and add content
    this.bottomsheetContent = new BottomsheetContent(contentElement, contentProps);
    
    // Create and add search bar
    this.searchBar = new SearchBar(searchContainer, searchProps);
  }
}
```

### Component Communication
```typescript
// Parent coordinates child components
class DashboardScreen {
  private createBottomsheetHeader(): void {
    this.bottomsheetHeader = new BottomsheetHeader(headerElement, {
      onSearchFocus: () => {
        // Coordinate with search flow manager
        this.props.searchFlowManager.goToSuggest();
        
        // Coordinate with bottomsheet manager
        this.props.bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);
        
        // Notify parent
        this.props.onSearchFocus?.();
      }
    });
  }
}
```

## 🔧 Configuration Architecture

### Centralized Configuration
```typescript
// src/config/mapgl.ts
export const MapGLConfig = {
  defaultCenter: [37.620393, 55.75396] as [number, number],
  defaultZoom: 12,
  apiKey: process.env.VITE_MAPGL_KEY || 'demo-key'
};

// src/config/bottomsheet.ts
export const BottomsheetConfig = {
  snapPoints: [0.2, 0.55, 0.9, 0.95],
  animationDuration: 300,
  dragThreshold: 10
};
```

### Environment-Based Configuration
```typescript
// Development vs Production settings
const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  apiKey: process.env.VITE_MAPGL_KEY,
  debugMode: process.env.NODE_ENV === 'development',
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
};
```

## 🧪 Testing Architecture

### Component Testing Strategy
```typescript
// Test component in isolation
describe('DashboardScreen', () => {
  let container: HTMLElement;
  let searchFlowManager: SearchFlowManager;
  let bottomsheetManager: BottomsheetManager;
  let filterBarManager: FilterBarManager;
  let cartService: CartService;
  let mapManager: MapManager;
  
  beforeEach(() => {
    container = document.createElement('div');
    searchFlowManager = new SearchFlowManager();
    bottomsheetManager = new BottomsheetManager();
    filterBarManager = new FilterBarManager();
    cartService = new CartService();
    mapManager = new MapManager({ mapApiKey: 'test-key' });
  });
  
  it('should initialize with map and bottomsheet', async () => {
    const screen = new DashboardScreen({
      container,
      searchFlowManager,
      bottomsheetManager,
      filterBarManager,
      cartService,
      mapManager
    });
    
    await screen.initialize();
    
    expect(container.querySelector('.dashboard-map')).toBeTruthy();
    expect(container.querySelector('.dashboard-bottomsheet')).toBeTruthy();
  });
});
```

### Service Testing Strategy
```typescript
// Test service logic without UI
describe('SearchFlowManager', () => {
  let searchFlowManager: SearchFlowManager;
  
  beforeEach(() => {
    searchFlowManager = new SearchFlowManager();
  });
  
  it('should navigate to suggest screen', () => {
    searchFlowManager.goToSuggest();
    
    expect(searchFlowManager.currentScreen).toBe(ScreenType.SUGGEST);
    expect(searchFlowManager.navigationHistory).toContain(ScreenType.SUGGEST);
  });
});
```

## 📈 Performance Considerations

### Lazy Loading
```typescript
// Load components only when needed
class SearchFlowManager {
  private async loadSuggestScreen(): Promise<void> {
    if (!this.suggestScreen) {
      const { SuggestScreen } = await import('@/components/Screens/SuggestScreen');
      this.suggestScreen = new SuggestScreen(this.container, this.props);
    }
  }
}
```

### Memory Management
```typescript
class ComponentWithCleanup {
  private eventListeners: Array<() => void> = [];
  
  destroy(): void {
    // Clean up event listeners
    this.eventListeners.forEach(cleanup => cleanup());
    this.eventListeners = [];
    
    // Clean up child components
    this.childComponents.forEach(child => child.destroy());
    
    // Remove DOM elements
    this.element.remove();
  }
}
```

### Debounced Operations
```typescript
class SearchBar {
  private searchDebounce: number | null = null;
  
  private handleInput(value: string): void {
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    
    this.searchDebounce = window.setTimeout(() => {
      this.props.onChange?.(value);
    }, 300);
  }
}
```

## 🔄 Future Architecture Considerations

### Scalability Patterns
- **Plugin Architecture** - For extending functionality
- **Module Federation** - For micro-frontend architecture
- **Service Workers** - For offline functionality
- **Web Workers** - For heavy computations

### State Management Evolution
- **Redux/Zustand** - For complex state management
- **RxJS** - For reactive programming patterns
- **GraphQL** - For efficient data fetching
- **WebSocket** - For real-time updates

---

This architecture provides a solid foundation for building scalable 2GIS applications while maintaining clean separation of concerns and testability.