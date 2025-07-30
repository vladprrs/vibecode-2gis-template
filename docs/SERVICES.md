# Services Documentation

## 📋 Overview

This document describes the service layer architecture and individual services in the 2GIS template application.

## 🏗️ Service Architecture

### Service Layer Structure
```
src/services/
├── SearchFlowManager.ts           # Navigation & search state
├── BottomsheetManager.ts          # Bottomsheet state management
├── BottomsheetScrollManager.ts    # Scroll behavior
├── BottomsheetGestureManager.ts   # Touch gestures
├── BottomsheetAnimationManager.ts # Animations
├── ContentManager.ts              # Dynamic content
├── FilterBarManager.ts            # Filter UI
├── CartService.ts                 # Shopping cart
├── MapManager.ts                  # Map operations
├── MapSyncService.ts              # Map-UI sync
└── index.ts                       # Service exports
```

## 🔧 Core Services

### SearchFlowManager

**Purpose**: Navigation between screens and search state management
**Location**: `src/services/SearchFlowManager.ts`

#### Key Features
- Screen navigation (Dashboard → Suggest → SearchResult → Organization → Shop → Cart)
- Search context management
- History tracking
- Event-driven architecture

#### Methods
```typescript
class SearchFlowManager {
  // Navigation
  goToSuggest(): void
  goToSearchResults(query: string, filters?: SearchFilters): void
  goToOrganization(organization: Organization): void
  goToShop(shop: Shop): void
  goToCart(): void
  goBack(): void
  goToDashboard(): void
  
  // Search state
  updateQuery(query: string): void
  updateFilters(filters: Partial<SearchFilters>): void
  addToHistory(query: string): void
  clearHistory(): void
  
  // Events
  onScreenChange(callback: (screen: ScreenType) => void): () => void
}
```

#### Usage Example
```typescript
import { SearchFlowManager, ScreenType } from '@/services';

const searchManager = new SearchFlowManager(ScreenType.DASHBOARD, {
  onScreenChange: (from, to, context) => {
    console.log(`Navigation: ${from} → ${to}`);
  },
  onSearchInitiated: (query, source) => {
    console.log(`Search: "${query}" from ${source}`);
  }
});

// Navigate to search suggestions
searchManager.goToSuggest();

// Perform search with filters
searchManager.goToSearchResults('кафе', {
  category: 'food',
  distance: 1000,
  openNow: true
});
```

### BottomsheetManager

**Purpose**: Bottomsheet state transitions and gesture handling
**Location**: `src/services/BottomsheetManager.ts`

#### Key Features
- State management (SMALL, DEFAULT, FULLSCREEN, FULLSCREEN_SCROLL)
- Promise-based animations
- Gesture handling
- Snap point calculations

#### Methods
```typescript
class BottomsheetManager {
  // State management
  snapToState(state: BottomsheetState): Promise<void>
  getCurrentState(): BottomsheetStateData
  startDrag(startY: number): void
  handleDrag(deltaY: number): void
  endDrag(velocity: number, currentHeight: number): Promise<void>
  
  // Events
  onStateChange(callback: (fromState: BottomsheetState, toState: BottomsheetState) => void): () => void
}
```

#### Usage Example
```typescript
import { BottomsheetManager, BottomsheetState } from '@/services';

const bottomsheetManager = new BottomsheetManager({
  state: BottomsheetState.DEFAULT,
  snapPoints: [0.2, 0.55, 0.9, 0.95],
  isDraggable: true,
  hasScrollableContent: true
});

// Animate to fullscreen
await bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);

// Listen to state changes
bottomsheetManager.onStateChange((fromState, toState) => {
  console.log(`Bottomsheet: ${fromState} → ${toState}`);
});
```

### CartService

**Purpose**: Shopping cart state management
**Location**: `src/services/CartService.ts`

#### Key Features
- Product management (add/remove/update quantity)
- Immutable state updates
- Event-driven architecture
- Cart persistence

#### Methods
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

#### Usage Example
```typescript
import { CartService } from '@/services';

const cartService = new CartService({
  onCartUpdated: (state) => {
    updateCartBadge(state.totalItems);
    updateCartTotal(state.totalPrice);
  },
  onItemAdded: (item) => {
    showNotification(`Added ${item.product.title} to cart`);
  }
});

// Add product to cart
const product = { id: '1', title: 'Coffee', price: 150 };
cartService.addToCart(product, 2);

// Get cart state
const cartState = cartService.getState();
console.log(`Cart has ${cartState.totalItems} items`);

// Subscribe to changes
const unsubscribe = cartService.subscribe((state) => {
  updateCartUI(state);
});
```

### ContentManager

**Purpose**: Dynamic content management for different screen states
**Location**: `src/services/ContentManager.ts`

#### Key Features
- Screen-specific content rendering
- Suggestion management
- Search result display
- Organization details content

#### Methods
```typescript
class ContentManager {
  // Content updates
  updateContentForSuggest(contentContainer: HTMLElement): void
  updateContentForDashboard(contentContainer: HTMLElement): void
  updateContentForSearchResult(contentContainer: HTMLElement, context: SearchContext): void
  updateContentForOrganization(contentContainer: HTMLElement, organization: Organization): void
}
```

#### Usage Example
```typescript
import { ContentManager } from '@/services';

const contentManager = new ContentManager(searchFlowManager);

// Update content for different screens
contentManager.updateContentForSuggest(container);
contentManager.updateContentForSearchResult(container, searchContext);
contentManager.updateContentForOrganization(container, organization);
```

### MapManager

**Purpose**: 2GIS MapGL integration and operations
**Location**: `src/services/MapManager.ts`

#### Key Features
- Map initialization
- Marker management
- Viewport control
- Graceful fallback handling

#### Methods
```typescript
class MapManager {
  // Map operations
  initialize(container: HTMLElement): Promise<void>
  addMarker(coordinates: [number, number], options?: MarkerOptions): void
  removeMarker(markerId: string): void
  centerOn(coordinates: [number, number]): void
  setZoom(level: number): void
  
  // Events
  on('click', callback: (event: MapClickEvent) => void): void
  on('markerClick', callback: (marker: Marker) => void): void
}
```

#### Usage Example
```typescript
import { MapManager } from '@/services';

const mapManager = new MapManager({
  mapApiKey: process.env.VITE_MAPGL_KEY
});

// Initialize map
await mapManager.initialize(container);

// Add markers
mapManager.addMarker([37.620393, 55.75396], {
  title: 'Moscow Center',
  color: '#ff0000'
});

// Handle map events
mapManager.on('click', (event) => {
  console.log('Map clicked at:', event.coordinates);
});
```

## 🔄 Event System

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

## 🧪 Testing Services

### Service Testing Strategy
```typescript
describe('SearchFlowManager', () => {
  let searchManager: SearchFlowManager;
  
  beforeEach(() => {
    searchManager = new SearchFlowManager();
  });
  
  it('should navigate to suggest screen', () => {
    searchManager.goToSuggest();
    
    expect(searchManager.currentScreen).toBe(ScreenType.SUGGEST);
    expect(searchManager.navigationHistory).toContain(ScreenType.SUGGEST);
  });
  
  it('should update search context', () => {
    searchManager.updateQuery('кафе');
    
    expect(searchManager.searchContext.query).toBe('кафе');
  });
});
```

### Mock Services
```typescript
class MockCartService extends CartService {
  private mockState: CartState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    lastUpdated: new Date()
  };
  
  getState(): CartState {
    return this.mockState;
  }
  
  addToCart(product: Product, quantity: number = 1): void {
    // Mock implementation
    this.mockState = {
      ...this.mockState,
      items: [...this.mockState.items, { product, quantity, addedAt: new Date() }],
      totalItems: this.mockState.totalItems + quantity,
      totalPrice: this.mockState.totalPrice + (product.price * quantity)
    };
  }
}
```

## 🔧 Configuration

### Service Configuration
```typescript
// Default service configurations
const DEFAULT_SERVICE_CONFIG = {
  searchFlow: {
    initialScreen: ScreenType.DASHBOARD,
    enableHistory: true,
    maxHistoryItems: 10
  },
  bottomsheet: {
    snapPoints: [0.2, 0.55, 0.9, 0.95],
    animationDuration: 300,
    dragThreshold: 10
  },
  cart: {
    enablePersistence: true,
    maxItems: 100,
    autoSave: true
  },
  map: {
    defaultCenter: [37.620393, 55.75396],
    defaultZoom: 12,
    enableMarkers: true
  }
};
```

### Environment-Based Configuration
```typescript
const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  apiKey: process.env.VITE_MAPGL_KEY,
  debugMode: process.env.NODE_ENV === 'development',
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
};
```

## 📊 Performance Considerations

### Memory Management
```typescript
class ServiceWithCleanup {
  private eventListeners: Array<() => void> = [];
  
  destroy(): void {
    // Clean up event listeners
    this.eventListeners.forEach(cleanup => cleanup());
    this.eventListeners = [];
    
    // Clean up child services
    this.childServices.forEach(service => service.destroy());
  }
}
```

### Debounced Operations
```typescript
class SearchService {
  private searchDebounce: number | null = null;
  
  private handleSearch(query: string): void {
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    
    this.searchDebounce = window.setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }
}
```

## 🔄 Future Enhancements

### Planned Service Improvements
- **State Persistence** - Local storage integration
- **Offline Support** - Service worker integration
- **Real-time Updates** - WebSocket integration
- **Analytics Integration** - Event tracking service
- **Caching Strategy** - Intelligent data caching

### Technical Improvements
- **Service Workers** - Background processing
- **Web Workers** - Heavy computations
- **IndexedDB** - Local data storage
- **Push Notifications** - Real-time updates

---

This service layer provides a robust foundation for building scalable 2GIS applications with clean separation of concerns and testability. 