# TypeScript Types Documentation

## 📋 Overview

This document describes the TypeScript type definitions used throughout the 2GIS template application.

## 🏗️ Type Structure

### Type Organization
```
src/types/
├── index.ts              # Main type exports
├── navigation.ts         # Navigation and search types
├── bottomsheet.ts        # Bottomsheet state types
└── map.ts               # Map-related types
```

## 🔧 Core Types

### Navigation Types

#### ScreenType
```typescript
enum ScreenType {
  DASHBOARD = 'dashboard',
  SUGGEST = 'suggest',
  SEARCH_RESULT = 'search_result',
  ORGANIZATION = 'organization',
  SHOP = 'shop',
  CART = 'cart'
}
```

#### SearchContext
```typescript
interface SearchContext {
  query: string;
  filters: SearchFilters;
  results: Organization[];
  suggestions: SearchSuggestion[];
  selectedOrganization?: Organization;
  selectedShop?: Shop;
  searchHistory: string[];
  isLoading: boolean;
  error?: string;
}
```

#### SearchFilters
```typescript
interface SearchFilters {
  categories?: string[];
  ratingFrom?: number;
  distance?: number;
  openNow?: boolean;
  withReviews?: boolean;
  advertisersOnly?: boolean;
  sortBy?: 'relevance' | 'distance' | 'rating' | 'reviews';
}
```

#### Organization
```typescript
interface Organization {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  isAdvertiser: boolean;
  rating?: number;
  reviewsCount?: number;
  category: string;
  description?: string;
  phone?: string;
  workingHours?: string;
  photoUrl?: string;
  distance?: number;
}
```

#### SearchSuggestion
```typescript
interface SearchSuggestion {
  id: string;
  text: string;
  type: 'history' | 'popular' | 'organization' | 'address' | 'category';
  subtitle?: string;
  coordinates?: [number, number];
  organizationId?: string;
}
```

### Bottomsheet Types

#### BottomsheetState
```typescript
enum BottomsheetState {
  SMALL = 'small',              // 20% height
  DEFAULT = 'default',          // 55% height
  FULLSCREEN = 'fullscreen',    // 90% height
  FULLSCREEN_SCROLL = 'fullscreen_scroll'  // 95% height
}
```

#### BottomsheetConfig
```typescript
interface BottomsheetConfig {
  state: BottomsheetState;
  snapPoints: number[];        // Height percentages: [0.2, 0.5, 0.9, 0.95]
  isDraggable: boolean;
  hasScrollableContent: boolean;
  minHeight?: number;
  maxHeight?: number;
}
```

#### BottomsheetStateData
```typescript
interface BottomsheetStateData {
  currentState: BottomsheetState;
  height: number;               // Current height in pixels
  isDragging: boolean;          // Whether currently dragging
  isAnimating: boolean;         // Whether animating
  openProgress: number;         // Animation progress 0-1
}
```

#### BottomsheetEvents
```typescript
interface BottomsheetEvents {
  onStateChange?: (fromState: BottomsheetState, toState: BottomsheetState) => void;
  onDragStart?: (height: number) => void;
  onDrag?: (height: number, progress: number) => void;
  onDragEnd?: (startHeight: number, endHeight: number) => void;
  onSnapToState?: (targetState: BottomsheetState) => void;
}
```

### Cart Types

#### CartItem
```typescript
interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}
```

#### CartState
```typescript
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: Date;
}
```

#### Product
```typescript
interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  badges?: string[];
  quantity?: number;
}
```

#### Shop
```typescript
interface Shop {
  organizationId: string;
  name: string;
  categories: ProductCategory[];
  products: Product[];
  cartTotal?: number;
  cartItemsCount?: number;
}
```

#### ProductCategory
```typescript
interface ProductCategory {
  id: string;
  name: string;
  count: number;
  products: Product[];
}
```

### Event Types

#### NavigationEvents
```typescript
interface NavigationEvents {
  onScreenChange?: (from: ScreenType, to: ScreenType, context: SearchContext) => void;
  onSearchInitiated?: (query: string, source: string) => void;
  onSuggestionSelected?: (suggestion: SearchSuggestion, position: number) => void;
  onOrganizationSelected?: (organization: Organization, position: number) => void;
  onFilterApplied?: (filters: SearchFilters) => void;
}
```

#### CartEvents
```typescript
interface CartEvents {
  onCartUpdated?: (state: CartState) => void;
  onItemAdded?: (item: CartItem) => void;
  onItemRemoved?: (productId: string) => void;
  onQuantityChanged?: (productId: string, newQuantity: number) => void;
}
```

### Service Interface Types

#### SearchFlowManager
```typescript
interface SearchFlowManager {
  currentScreen: ScreenType;
  searchContext: SearchContext;
  navigationHistory: ScreenType[];

  // Navigation methods
  goToSuggest(): void;
  goToSearchResults(query: string, filters?: SearchFilters): void;
  goToOrganization(organization: Organization): void;
  goToShop(shop: Shop): void;
  goToCart(): void;
  goBack(): void;
  goToDashboard(): void;

  // Search methods
  updateQuery(query: string): void;
  updateFilters(filters: Partial<SearchFilters>): void;
  addToHistory(query: string): void;
  clearHistory(): void;
}
```

## 🎯 Type Usage Examples

### Component Props
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

### Service Configuration
```typescript
interface BottomsheetManagerConfig {
  initialConfig: BottomsheetConfig;
  events?: Partial<BottomsheetEvents>;
  screenHeight?: number;
}

interface CartServiceConfig {
  events?: Partial<CartEvents>;
  enablePersistence?: boolean;
  maxItems?: number;
}
```

### Event Handlers
```typescript
type ScreenChangeHandler = (from: ScreenType, to: ScreenType, context: SearchContext) => void;
type SearchInitiatedHandler = (query: string, source: string) => void;
type CartUpdateHandler = (state: CartState) => void;
type BottomsheetStateChangeHandler = (fromState: BottomsheetState, toState: BottomsheetState) => void;
```

## 🔧 Type Utilities

### Partial Types
```typescript
// Make all properties optional
type PartialSearchFilters = Partial<SearchFilters>;

// Make specific properties required
type RequiredOrganization = Required<Pick<Organization, 'id' | 'name' | 'coordinates'>>;
```

### Union Types
```typescript
// Multiple possible states
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Multiple possible actions
type CartAction = 
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };
```

### Generic Types
```typescript
// Generic event handler
type EventHandler<T> = (data: T) => void;

// Generic service interface
interface Service<T> {
  getState(): T;
  subscribe(callback: EventHandler<T>): () => void;
  destroy(): void;
}
```

## 🧪 Type Testing

### Type Assertions
```typescript
// Type guards
function isOrganization(obj: any): obj is Organization {
  return obj && 
         typeof obj.id === 'string' &&
         typeof obj.name === 'string' &&
         Array.isArray(obj.coordinates) &&
         obj.coordinates.length === 2;
}

// Type assertions
function assertSearchContext(context: any): asserts context is SearchContext {
  if (!context || typeof context.query !== 'string') {
    throw new Error('Invalid SearchContext');
  }
}
```

### Mock Types
```typescript
// Mock data types
type MockOrganization = Omit<Organization, 'id'> & { id: string };
type MockProduct = Omit<Product, 'price'> & { price: number };

// Test utility types
type TestSearchContext = SearchContext & {
  testData?: any;
};
```

## 📊 Type Safety Features

### Strict Type Checking
```typescript
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Exhaustive Type Checking
```typescript
// Ensure all cases are handled
function handleScreenType(screen: ScreenType): string {
  switch (screen) {
    case ScreenType.DASHBOARD:
      return 'Dashboard';
    case ScreenType.SUGGEST:
      return 'Suggest';
    case ScreenType.SEARCH_RESULT:
      return 'Search Result';
    case ScreenType.ORGANIZATION:
      return 'Organization';
    case ScreenType.SHOP:
      return 'Shop';
    case ScreenType.CART:
      return 'Cart';
    default:
      // This ensures all cases are handled
      const exhaustiveCheck: never = screen;
      throw new Error(`Unhandled screen type: ${exhaustiveCheck}`);
  }
}
```

## 🔄 Type Evolution

### Backward Compatibility
```typescript
// Versioned types for API compatibility
interface SearchFiltersV1 {
  category?: string;
  distance?: number;
}

interface SearchFiltersV2 extends SearchFiltersV1 {
  categories?: string[];
  ratingFrom?: number;
  openNow?: boolean;
}

// Type migration utilities
function migrateSearchFilters(v1: SearchFiltersV1): SearchFiltersV2 {
  return {
    ...v1,
    categories: v1.category ? [v1.category] : undefined,
    ratingFrom: undefined,
    openNow: undefined
  };
}
```

### Future Type Enhancements
```typescript
// Planned type improvements
interface EnhancedOrganization extends Organization {
  // Rich media support
  photos: Photo[];
  videos: Video[];
  
  // Social features
  socialLinks: SocialLinks;
  userReviews: UserReview[];
  
  // Real-time data
  currentStatus: 'open' | 'closed' | 'temporarily_closed';
  waitTime?: number;
  
  // Accessibility
  accessibility: AccessibilityInfo;
}

interface Photo {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

interface Video {
  id: string;
  url: string;
  thumbnail: string;
  duration: number;
}

interface SocialLinks {
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

interface UserReview {
  id: string;
  userId: string;
  rating: number;
  text: string;
  date: Date;
  photos?: Photo[];
}

interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  hearingAssistance: boolean;
  visualAssistance: boolean;
  serviceAnimals: boolean;
}
```

## 📝 Best Practices

### Type Naming Conventions
```typescript
// Use PascalCase for interfaces and types
interface UserProfile { }
type UserStatus = 'active' | 'inactive';

// Use camelCase for properties
interface ApiResponse {
  data: any;
  statusCode: number;
  message: string;
}

// Use UPPER_SNAKE_CASE for constants
const DEFAULT_CONFIG = {
  maxItems: 100,
  timeout: 5000
};
```

### Documentation
```typescript
/**
 * Represents a shopping cart item with product and quantity information
 */
interface CartItem {
  /** The product being purchased */
  product: Product;
  
  /** Quantity of the product in cart */
  quantity: number;
  
  /** When the item was added to cart */
  addedAt: Date;
}
```

### Type Guards
```typescript
// Use type guards for runtime type checking
function isValidOrganization(obj: any): obj is Organization {
  return obj &&
         typeof obj.id === 'string' &&
         typeof obj.name === 'string' &&
         typeof obj.address === 'string' &&
         Array.isArray(obj.coordinates) &&
         obj.coordinates.length === 2 &&
         typeof obj.coordinates[0] === 'number' &&
         typeof obj.coordinates[1] === 'number';
}
```

---

This type system provides comprehensive type safety and excellent developer experience for building robust 2GIS applications. 