# Components Documentation

## 📋 Overview

This document describes the component architecture and individual components in the 2GIS template application.

## 🏗️ Component Architecture

### Component Organization
```
src/components/
├── Screens/              # Main application screens
│   ├── DashboardScreen.ts
│   ├── SearchResultScreen.ts
│   ├── SuggestScreen.ts
│   ├── OrganizationScreen.ts
│   ├── ShopScreen.ts
│   └── CartScreen.ts
├── Bottomsheet/          # Bottomsheet components
│   ├── BottomsheetContainer.ts
│   ├── BottomsheetHeader.ts
│   └── BottomsheetContent.ts
├── Search/               # Search components
│   ├── SearchBar.ts
│   ├── SearchFilters.ts
│   └── SearchSuggestions.ts
├── Cards/                # Card components
│   └── OrganizationCard.ts
├── Dashboard/            # Dashboard components
│   ├── ButtonRow.ts
│   ├── StoriesCarousel.ts
│   └── AdviceGrid.ts
├── Filter/               # Filter components
│   └── FilterBar.ts
├── Map/                  # Map components
│   ├── MapContainer.ts
│   └── MapGLComponent.ts
├── Organization/         # Organization components
│   └── TabBar.ts
└── Content/              # Content components
    ├── DashboardContent.ts
    ├── ResultsContent.ts
    └── SuggestContent.ts
```

## 🔧 Core Components

### DashboardScreen

**Purpose**: Main application screen with map and bottomsheet
**Location**: `src/components/Screens/DashboardScreen.ts`

#### Features
- 2GIS MapGL integration
- Interactive bottomsheet with multiple states
- Screen state management
- Event handling and coordination

#### Props Interface
```typescript
interface DashboardScreenProps {
  container: HTMLElement;
  searchFlowManager: SearchFlowManager;
  bottomsheetManager: BottomsheetManager;
  filterBarManager: FilterBarManager;
  cartService: CartService;
  mapManager: MapManager;
  className?: string;
  onSearchFocus?: () => void;
  onStoryClick?: (storyId: string) => void;
  onMetaItemClick?: (itemId: string) => void;
}
```

#### Methods
```typescript
class DashboardScreen {
  activate(): void
  deactivate(): void
  snapToState(state: BottomsheetState): void
  handleScreenChange(from: ScreenType, to: ScreenType, context: SearchContext): void
  centerMoscow(): void
  testRandomMarkers(): void
  destroy(): void
}
```

#### Usage Example
```typescript
import { DashboardScreenFactory } from '@/components/Screens';

const dashboardScreen = DashboardScreenFactory.createDefault(
  container,
  searchFlowManager,
  bottomsheetManager,
  filterBarManager,
  cartService,
  mapManager
);

// Activate the screen
dashboardScreen.activate();

// Change bottomsheet state
dashboardScreen.snapToState(BottomsheetState.FULLSCREEN);
```

### BottomsheetContainer

**Purpose**: Low-level bottomsheet component with drag gestures
**Location**: `src/components/Bottomsheet/BottomsheetContainer.ts`

#### Features
- Drag gesture handling
- Snap point calculations
- Smooth animations
- Content management

#### Props Interface
```typescript
interface BottomsheetContainerProps {
  config: BottomsheetConfig;
  events: BottomsheetEvents;
  screenHeight?: number;
}
```

#### Methods
```typescript
class BottomsheetContainer {
  setContent(elements: HTMLElement[]): void
  snapToState(state: BottomsheetState): void
  getCurrentState(): BottomsheetStateData
  destroy(): void
}
```

### SearchBar

**Purpose**: Interactive search input component
**Location**: `src/components/Search/SearchBar.ts`

#### Features
- Search input handling
- State management (inactive/active/focused)
- Event emission
- Auto-complete integration

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
```typescript
class SearchBar {
  setState(state: SearchBarState): void
  setValue(value: string): void
  getValue(): string
  focus(): void
  blur(): void
  destroy(): void
}
```

### OrganizationCard

**Purpose**: Card component for displaying organization information
**Location**: `src/components/Cards/OrganizationCard.ts`

#### Features
- Organization data display
- Rating and review information
- Contact actions (call, route)
- Advertiser highlighting

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
```typescript
class OrganizationCard {
  updateOrganization(organization: Organization): void
  highlight(): void
  removeHighlight(): void
  destroy(): void
}
```

### ButtonRow

**Purpose**: Row of action buttons for dashboard
**Location**: `src/components/Dashboard/ButtonRow.ts`

#### Features
- Quick action buttons
- Icon and text support
- Touch-friendly design
- Event handling

#### Props Interface
```typescript
interface ButtonRowProps {
  items: ButtonRowItem[];
  onItemClick?: (item: ButtonRowItem) => void;
}

interface ButtonRowItem {
  id: string;
  text: string;
  iconSrc?: string;
  onClick?: () => void;
}
```

### StoriesCarousel

**Purpose**: Carousel component for stories/features
**Location**: `src/components/Dashboard/StoriesCarousel.ts`

#### Features
- Horizontal scrolling
- Story item display
- Touch gestures
- Auto-play support

#### Props Interface
```typescript
interface StoriesCarouselProps {
  stories: StoryItem[];
  onStoryClick?: (storyId: string) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

interface StoryItem {
  id: string;
  title: string;
  imageUrl?: string;
  isViewed: boolean;
}
```

## 🎨 Styling Components

### CSS Architecture
```css
/* Component-specific styles */
.dashboard-screen {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.bottomsheet-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 16px;
}

.organization-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Responsive Design
```css
/* Mobile-first approach */
@media (max-width: 375px) {
  .dashboard-screen {
    max-width: 375px;
  }
  
  .bottomsheet-container {
    border-radius: 12px 12px 0 0;
  }
}

/* Tablet and desktop */
@media (min-width: 768px) {
  .dashboard-screen {
    max-width: 768px;
    margin: 0 auto;
  }
}
```

## 🔄 Component Communication

### Event-Driven Architecture
```typescript
// Parent component coordinates child components
class DashboardScreen {
  private createSearchBar(): void {
    this.searchBar = new SearchBar(searchContainer, {
      onFocus: () => {
        // Coordinate with search flow manager
        this.props.searchFlowManager.goToSuggest();
        
        // Coordinate with bottomsheet manager
        this.props.bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);
        
        // Notify parent
        this.props.onSearchFocus?.();
      },
      onChange: (query) => {
        this.props.searchFlowManager.updateQuery(query);
      }
    });
  }
}
```

### Service Integration
```typescript
// Components integrate with services
class OrganizationCard {
  constructor(container: HTMLElement, organization: Organization, props: OrganizationCardProps) {
    this.container = container;
    this.organization = organization;
    this.props = props;
    
    this.render();
    this.bindEvents();
  }
  
  private bindEvents(): void {
    this.container.addEventListener('click', () => {
      this.props.onClick?.(this.organization);
    });
    
    const callButton = this.container.querySelector('.call-button');
    callButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.props.onCallClick?.(this.organization.phone!);
    });
  }
}
```

## 🧪 Component Testing

### Unit Testing
```typescript
describe('SearchBar', () => {
  let container: HTMLElement;
  let searchBar: SearchBar;
  
  beforeEach(() => {
    container = document.createElement('div');
    searchBar = new SearchBar(container, {
      placeholder: 'Search...',
      state: SearchBarState.INACTIVE,
      onFocus: jest.fn(),
      onChange: jest.fn()
    });
  });
  
  it('should render search input', () => {
    const input = container.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.placeholder).toBe('Search...');
  });
  
  it('should handle focus events', () => {
    const input = container.querySelector('input') as HTMLInputElement;
    input.focus();
    
    expect(searchBar.props.onFocus).toHaveBeenCalled();
  });
});
```

### Integration Testing
```typescript
describe('DashboardScreen Integration', () => {
  let container: HTMLElement;
  let searchFlowManager: SearchFlowManager;
  let bottomsheetManager: BottomsheetManager;
  let dashboardScreen: DashboardScreen;
  
  beforeEach(async () => {
    container = document.createElement('div');
    searchFlowManager = new SearchFlowManager();
    bottomsheetManager = new BottomsheetManager();
    
    dashboardScreen = DashboardScreenFactory.createDefault(
      container,
      searchFlowManager,
      bottomsheetManager,
      new FilterBarManager(),
      new CartService(),
      new MapManager({ mapApiKey: 'test-key' })
    );
    
    await dashboardScreen.initialize();
  });
  
  it('should coordinate search and bottomsheet', () => {
    // Simulate search focus
    const searchBar = container.querySelector('.search-bar input') as HTMLInputElement;
    searchBar.focus();
    
    // Verify navigation occurred
    expect(searchFlowManager.currentScreen).toBe(ScreenType.SUGGEST);
    
    // Verify bottomsheet state changed
    const state = bottomsheetManager.getCurrentState();
    expect(state.currentState).toBe(BottomsheetState.FULLSCREEN);
  });
});
```

## 🔧 Component Configuration

### Default Configurations
```typescript
const DEFAULT_COMPONENT_CONFIG = {
  searchBar: {
    placeholder: 'Поиск',
    showSearchIcon: true,
    debounceDelay: 300
  },
  organizationCard: {
    showRating: true,
    showDistance: true,
    showAddress: true,
    maxTitleLength: 50
  },
  bottomsheet: {
    snapPoints: [0.2, 0.55, 0.9, 0.95],
    animationDuration: 300,
    dragThreshold: 10
  },
  storiesCarousel: {
    autoPlay: true,
    autoPlayInterval: 5000,
    showIndicators: true
  }
};
```

### Customization
```typescript
// Custom component styling
const customSearchBar = new SearchBar(container, {
  placeholder: 'Custom placeholder',
  state: SearchBarState.ACTIVE,
  customStyles: {
    backgroundColor: '#f0f0f0',
    borderRadius: '12px'
  }
});

// Custom event handling
const customOrganizationCard = new OrganizationCard(container, organization, {
  showRating: false,
  showDistance: false,
  onClick: (org) => {
    analytics.track('card_click', { organizationId: org.id });
    searchFlowManager.goToOrganization(org);
  }
});
```

## 📊 Performance Optimization

### Lazy Loading
```typescript
// Load components only when needed
class LazyComponentLoader {
  private loadedComponents = new Map<string, any>();
  
  async loadComponent(name: string): Promise<any> {
    if (this.loadedComponents.has(name)) {
      return this.loadedComponents.get(name);
    }
    
    const component = await import(`@/components/${name}`);
    this.loadedComponents.set(name, component);
    return component;
  }
}
```

### Memory Management
```typescript
class ComponentWithCleanup {
  private eventListeners: Array<() => void> = [];
  private childComponents: Array<{ destroy: () => void }> = [];
  
  destroy(): void {
    // Clean up event listeners
    this.eventListeners.forEach(cleanup => cleanup());
    this.eventListeners = [];
    
    // Clean up child components
    this.childComponents.forEach(child => child.destroy());
    this.childComponents = [];
    
    // Remove DOM elements
    this.element.remove();
  }
}
```

### Virtual Scrolling
```typescript
// For large lists of components
class VirtualScroller {
  private visibleComponents: Map<number, Component> = new Map();
  private container: HTMLElement;
  private itemHeight: number;
  
  renderVisibleItems(startIndex: number, endIndex: number): void {
    // Only render visible items
    for (let i = startIndex; i <= endIndex; i++) {
      if (!this.visibleComponents.has(i)) {
        const component = this.createComponent(i);
        this.visibleComponents.set(i, component);
      }
    }
    
    // Remove off-screen components
    this.visibleComponents.forEach((component, index) => {
      if (index < startIndex || index > endIndex) {
        component.destroy();
        this.visibleComponents.delete(index);
      }
    });
  }
}
```

## 🔄 Future Enhancements

### Planned Component Features
- **Rich Media Support** - Video and 360° photo components
- **Social Integration** - Share and social proof components
- **Personalization** - User preference components
- **Offline Support** - Cached data components
- **Accessibility** - Screen reader and keyboard navigation support

### Technical Improvements
- **Web Components** - Custom element support
- **Shadow DOM** - Style encapsulation
- **Intersection Observer** - Performance optimization
- **Resize Observer** - Responsive behavior
- **Performance Monitoring** - Real-time metrics

---

This component system provides a flexible and extensible foundation for building interactive 2GIS applications with excellent user experience. 