# Testing Documentation

## 📋 Overview

This document describes the testing strategy and implementation for the 2GIS template application.

## 🧪 Testing Strategy

### Testing Pyramid
```
┌─────────────────────────────────────┐
│              E2E Tests              │
│         (Few, Critical Paths)      │
├─────────────────────────────────────┤
│           Integration Tests         │
│        (Service Interactions)       │
├─────────────────────────────────────┤
│            Unit Tests               │
│      (Many, Individual Units)      │
└─────────────────────────────────────┘
```

### Test Types
- **Unit Tests** - Individual components and services
- **Integration Tests** - Service interactions and data flow
- **E2E Tests** - Complete user workflows
- **Performance Tests** - Load and stress testing

## 🔧 Testing Setup

### Test Configuration
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Test Setup
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';

// Mock 2GIS MapGL
global.mapgl = {
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    setCenter: jest.fn(),
    setZoom: jest.fn(),
    addMarker: jest.fn(),
    removeMarker: jest.fn()
  }))
};

// Mock environment variables
process.env.VITE_MAPGL_KEY = 'test-key';

// Mock window methods
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 800
});

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 375
});
```

## 🧪 Unit Testing

### Component Testing

#### DashboardScreen Tests
```typescript
// src/components/Screens/__tests__/DashboardScreen.test.ts
import { DashboardScreen, DashboardScreenFactory } from '../DashboardScreen';
import { SearchFlowManager } from '@/services/SearchFlowManager';
import { BottomsheetManager } from '@/services/BottomsheetManager';
import { FilterBarManager } from '@/services/FilterBarManager';
import { CartService } from '@/services/CartService';
import { MapManager } from '@/services/MapManager';
import { ScreenType, BottomsheetState } from '@/types';

describe('DashboardScreen', () => {
  let container: HTMLElement;
  let searchFlowManager: SearchFlowManager;
  let bottomsheetManager: BottomsheetManager;
  let filterBarManager: FilterBarManager;
  let cartService: CartService;
  let mapManager: MapManager;
  let dashboardScreen: DashboardScreen;

  beforeEach(async () => {
    container = document.createElement('div');
    searchFlowManager = new SearchFlowManager();
    bottomsheetManager = new BottomsheetManager({
      state: BottomsheetState.DEFAULT,
      snapPoints: [0.2, 0.55, 0.9, 0.95],
      isDraggable: true,
      hasScrollableContent: true
    });
    filterBarManager = new FilterBarManager();
    cartService = new CartService();
    mapManager = new MapManager({ mapApiKey: 'test-key' });

    dashboardScreen = DashboardScreenFactory.createDefault(
      container,
      searchFlowManager,
      bottomsheetManager,
      filterBarManager,
      cartService,
      mapManager
    );

    await dashboardScreen.initialize();
  });

  afterEach(() => {
    dashboardScreen.destroy();
  });

  it('should initialize with map and bottomsheet', () => {
    expect(container.querySelector('.dashboard-map')).toBeTruthy();
    expect(container.querySelector('.dashboard-bottomsheet')).toBeTruthy();
  });

  it('should handle screen changes', () => {
    const mockContext = { query: 'test', filters: {}, results: [], suggestions: [], searchHistory: [], isLoading: false };
    
    dashboardScreen.handleScreenChange(ScreenType.DASHBOARD, ScreenType.SUGGEST, mockContext);
    
    expect(container.querySelector('.suggest-content')).toBeTruthy();
  });

  it('should change bottomsheet state', async () => {
    await dashboardScreen.snapToState(BottomsheetState.FULLSCREEN);
    
    const state = bottomsheetManager.getCurrentState();
    expect(state.currentState).toBe(BottomsheetState.FULLSCREEN);
  });

  it('should center map on Moscow', () => {
    dashboardScreen.centerMoscow();
    
    expect(mapManager.setCenter).toHaveBeenCalledWith([37.620393, 55.75396]);
  });
});
```

#### SearchBar Tests
```typescript
// src/components/Search/__tests__/SearchBar.test.ts
import { SearchBar, SearchBarState } from '../SearchBar';

describe('SearchBar', () => {
  let container: HTMLElement;
  let searchBar: SearchBar;
  let onFocus: jest.Mock;
  let onChange: jest.Mock;
  let onClear: jest.Mock;

  beforeEach(() => {
    container = document.createElement('div');
    onFocus = jest.fn();
    onChange = jest.fn();
    onClear = jest.fn();

    searchBar = new SearchBar(container, {
      placeholder: 'Search...',
      state: SearchBarState.INACTIVE,
      onFocus,
      onChange,
      onClear
    });
  });

  afterEach(() => {
    searchBar.destroy();
  });

  it('should render search input', () => {
    const input = container.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.placeholder).toBe('Search...');
  });

  it('should handle focus events', () => {
    const input = container.querySelector('input') as HTMLInputElement;
    input.focus();
    
    expect(onFocus).toHaveBeenCalled();
  });

  it('should handle input changes', () => {
    const input = container.querySelector('input') as HTMLInputElement;
    input.value = 'test query';
    input.dispatchEvent(new Event('input'));
    
    expect(onChange).toHaveBeenCalledWith('test query');
  });

  it('should change state', () => {
    searchBar.setState(SearchBarState.FOCUSED);
    
    const input = container.querySelector('input');
    expect(input?.classList.contains('search-bar--focused')).toBe(true);
  });

  it('should set and get value', () => {
    searchBar.setValue('test value');
    expect(searchBar.getValue()).toBe('test value');
  });
});
```

### Service Testing

#### SearchFlowManager Tests
```typescript
// src/services/__tests__/SearchFlowManager.test.ts
import { SearchFlowManager } from '../SearchFlowManager';
import { ScreenType, SearchFilters } from '@/types';

describe('SearchFlowManager', () => {
  let searchManager: SearchFlowManager;
  let onScreenChange: jest.Mock;
  let onSearchInitiated: jest.Mock;

  beforeEach(() => {
    onScreenChange = jest.fn();
    onSearchInitiated = jest.fn();

    searchManager = new SearchFlowManager(ScreenType.DASHBOARD, {
      onScreenChange,
      onSearchInitiated
    });
  });

  it('should initialize with default screen', () => {
    expect(searchManager.currentScreen).toBe(ScreenType.DASHBOARD);
  });

  it('should navigate to suggest screen', () => {
    searchManager.goToSuggest();
    
    expect(searchManager.currentScreen).toBe(ScreenType.SUGGEST);
    expect(searchManager.navigationHistory).toContain(ScreenType.SUGGEST);
  });

  it('should navigate to search results', () => {
    const filters: SearchFilters = { category: 'food', distance: 1000 };
    
    searchManager.goToSearchResults('кафе', filters);
    
    expect(searchManager.currentScreen).toBe(ScreenType.SEARCH_RESULT);
    expect(searchManager.searchContext.query).toBe('кафе');
    expect(searchManager.searchContext.filters).toEqual(filters);
    expect(onSearchInitiated).toHaveBeenCalledWith('кафе', 'search_bar');
  });

  it('should navigate to organization', () => {
    const organization = {
      id: '1',
      name: 'Test Org',
      address: 'Test Address',
      coordinates: [37.620393, 55.75396],
      isAdvertiser: false,
      category: 'test'
    };
    
    searchManager.goToOrganization(organization);
    
    expect(searchManager.currentScreen).toBe(ScreenType.ORGANIZATION);
    expect(searchManager.searchContext.selectedOrganization).toEqual(organization);
  });

  it('should update search query', () => {
    searchManager.updateQuery('new query');
    
    expect(searchManager.searchContext.query).toBe('new query');
  });

  it('should update filters', () => {
    const filters: Partial<SearchFilters> = { category: 'food' };
    
    searchManager.updateFilters(filters);
    
    expect(searchManager.searchContext.filters.category).toBe('food');
  });

  it('should add to history', () => {
    searchManager.addToHistory('test query');
    
    expect(searchManager.searchContext.searchHistory).toContain('test query');
  });

  it('should clear history', () => {
    searchManager.addToHistory('query 1');
    searchManager.addToHistory('query 2');
    searchManager.clearHistory();
    
    expect(searchManager.searchContext.searchHistory).toHaveLength(0);
  });

  it('should go back', () => {
    searchManager.goToSuggest();
    searchManager.goToSearchResults('test');
    searchManager.goBack();
    
    expect(searchManager.currentScreen).toBe(ScreenType.SUGGEST);
  });
});
```

#### BottomsheetManager Tests
```typescript
// src/services/__tests__/BottomsheetManager.test.ts
import { BottomsheetManager } from '../BottomsheetManager';
import { BottomsheetState } from '@/types';

describe('BottomsheetManager', () => {
  let bottomsheetManager: BottomsheetManager;
  let onStateChange: jest.Mock;

  beforeEach(() => {
    onStateChange = jest.fn();

    bottomsheetManager = new BottomsheetManager({
      state: BottomsheetState.DEFAULT,
      snapPoints: [0.2, 0.55, 0.9, 0.95],
      isDraggable: true,
      hasScrollableContent: true
    }, {
      onStateChange
    });
  });

  it('should initialize with default state', () => {
    const state = bottomsheetManager.getCurrentState();
    expect(state.currentState).toBe(BottomsheetState.DEFAULT);
  });

  it('should snap to different states', async () => {
    await bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);
    
    const state = bottomsheetManager.getCurrentState();
    expect(state.currentState).toBe(BottomsheetState.FULLSCREEN);
    expect(onStateChange).toHaveBeenCalledWith(BottomsheetState.DEFAULT, BottomsheetState.FULLSCREEN);
  });

  it('should handle drag gestures', () => {
    bottomsheetManager.startDrag(100);
    
    const state = bottomsheetManager.getCurrentState();
    expect(state.isDragging).toBe(true);
  });

  it('should calculate height for state', () => {
    const height = bottomsheetManager.getHeightForState(BottomsheetState.SMALL);
    expect(height).toBe(window.innerHeight * 0.2);
  });

  it('should get snap points', () => {
    const snapPoints = bottomsheetManager.getSnapPoints();
    expect(snapPoints).toEqual([0.2, 0.55, 0.9, 0.95]);
  });
});
```

#### CartService Tests
```typescript
// src/services/__tests__/CartService.test.ts
import { CartService } from '../CartService';
import { Product } from '@/types';

describe('CartService', () => {
  let cartService: CartService;
  let onCartUpdated: jest.Mock;
  let onItemAdded: jest.Mock;

  beforeEach(() => {
    onCartUpdated = jest.fn();
    onItemAdded = jest.fn();

    cartService = new CartService({
      onCartUpdated,
      onItemAdded
    });
  });

  it('should initialize with empty cart', () => {
    const state = cartService.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.totalPrice).toBe(0);
  });

  it('should add product to cart', () => {
    const product: Product = {
      id: '1',
      title: 'Test Product',
      price: 100
    };

    cartService.addToCart(product, 2);

    const state = cartService.getState();
    expect(state.items).toHaveLength(1);
    expect(state.totalItems).toBe(2);
    expect(state.totalPrice).toBe(200);
    expect(onItemAdded).toHaveBeenCalled();
    expect(onCartUpdated).toHaveBeenCalled();
  });

  it('should increase quantity for existing product', () => {
    const product: Product = {
      id: '1',
      title: 'Test Product',
      price: 100
    };

    cartService.addToCart(product, 1);
    cartService.addToCart(product, 2);

    const state = cartService.getState();
    expect(state.totalItems).toBe(3);
    expect(state.totalPrice).toBe(300);
  });

  it('should remove product from cart', () => {
    const product: Product = {
      id: '1',
      title: 'Test Product',
      price: 100
    };

    cartService.addToCart(product, 1);
    cartService.removeFromCart('1');

    const state = cartService.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.totalPrice).toBe(0);
  });

  it('should update product quantity', () => {
    const product: Product = {
      id: '1',
      title: 'Test Product',
      price: 100
    };

    cartService.addToCart(product, 1);
    cartService.updateQuantity('1', 3);

    const state = cartService.getState();
    expect(state.totalItems).toBe(3);
    expect(state.totalPrice).toBe(300);
  });

  it('should check if product is in cart', () => {
    const product: Product = {
      id: '1',
      title: 'Test Product',
      price: 100
    };

    expect(cartService.isInCart('1')).toBe(false);
    
    cartService.addToCart(product, 1);
    
    expect(cartService.isInCart('1')).toBe(true);
  });

  it('should get product quantity', () => {
    const product: Product = {
      id: '1',
      title: 'Test Product',
      price: 100
    };

    cartService.addToCart(product, 2);
    
    expect(cartService.getProductQuantity('1')).toBe(2);
  });

  it('should clear cart', () => {
    const product: Product = {
      id: '1',
      title: 'Test Product',
      price: 100
    };

    cartService.addToCart(product, 1);
    cartService.clearCart();

    const state = cartService.getState();
    expect(state.items).toHaveLength(0);
    expect(state.totalItems).toBe(0);
    expect(state.totalPrice).toBe(0);
  });

  it('should subscribe to cart changes', () => {
    const callback = jest.fn();
    const unsubscribe = cartService.subscribe(callback);

    const product: Product = {
      id: '1',
      title: 'Test Product',
      price: 100
    };

    cartService.addToCart(product, 1);
    
    expect(callback).toHaveBeenCalled();
    
    unsubscribe();
    cartService.addToCart(product, 1);
    
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

## 🔗 Integration Testing

### Service Integration Tests
```typescript
// src/test/integration/SearchFlow.test.ts
import { SearchFlowManager } from '@/services/SearchFlowManager';
import { BottomsheetManager } from '@/services/BottomsheetManager';
import { ContentManager } from '@/services/ContentManager';
import { ScreenType, BottomsheetState } from '@/types';

describe('Search Flow Integration', () => {
  let searchManager: SearchFlowManager;
  let bottomsheetManager: BottomsheetManager;
  let contentManager: ContentManager;

  beforeEach(() => {
    searchManager = new SearchFlowManager();
    bottomsheetManager = new BottomsheetManager({
      state: BottomsheetState.DEFAULT,
      snapPoints: [0.2, 0.55, 0.9, 0.95],
      isDraggable: true,
      hasScrollableContent: true
    });
    contentManager = new ContentManager(searchManager);
  });

  it('should coordinate search and bottomsheet states', async () => {
    // Start search
    searchManager.goToSuggest();
    
    expect(searchManager.currentScreen).toBe(ScreenType.SUGGEST);
    
    // Perform search
    searchManager.goToSearchResults('кафе');
    
    expect(searchManager.currentScreen).toBe(ScreenType.SEARCH_RESULT);
    expect(searchManager.searchContext.query).toBe('кафе');
  });

  it('should handle organization selection', () => {
    const organization = {
      id: '1',
      name: 'Test Organization',
      address: 'Test Address',
      coordinates: [37.620393, 55.75396],
      isAdvertiser: false,
      category: 'test'
    };

    searchManager.goToSearchResults('test');
    searchManager.goToOrganization(organization);

    expect(searchManager.currentScreen).toBe(ScreenType.ORGANIZATION);
    expect(searchManager.searchContext.selectedOrganization).toEqual(organization);
  });
});
```

### Component Integration Tests
```typescript
// src/test/integration/DashboardIntegration.test.ts
import { DashboardScreenFactory } from '@/components/Screens/DashboardScreen';
import { SearchFlowManager } from '@/services/SearchFlowManager';
import { BottomsheetManager } from '@/services/BottomsheetManager';
import { FilterBarManager } from '@/services/FilterBarManager';
import { CartService } from '@/services/CartService';
import { MapManager } from '@/services/MapManager';
import { ScreenType, BottomsheetState } from '@/types';

describe('Dashboard Integration', () => {
  let container: HTMLElement;
  let searchManager: SearchFlowManager;
  let bottomsheetManager: BottomsheetManager;
  let filterBarManager: FilterBarManager;
  let cartService: CartService;
  let mapManager: MapManager;
  let dashboardScreen: DashboardScreen;

  beforeEach(async () => {
    container = document.createElement('div');
    searchManager = new SearchFlowManager();
    bottomsheetManager = new BottomsheetManager({
      state: BottomsheetState.DEFAULT,
      snapPoints: [0.2, 0.55, 0.9, 0.95],
      isDraggable: true,
      hasScrollableContent: true
    });
    filterBarManager = new FilterBarManager();
    cartService = new CartService();
    mapManager = new MapManager({ mapApiKey: 'test-key' });

    dashboardScreen = DashboardScreenFactory.createDefault(
      container,
      searchManager,
      bottomsheetManager,
      filterBarManager,
      cartService,
      mapManager
    );

    await dashboardScreen.initialize();
  });

  afterEach(() => {
    dashboardScreen.destroy();
  });

  it('should coordinate search focus and bottomsheet state', () => {
    // Simulate search focus
    const searchBar = container.querySelector('.search-bar input') as HTMLInputElement;
    searchBar.focus();

    // Verify navigation occurred
    expect(searchManager.currentScreen).toBe(ScreenType.SUGGEST);

    // Verify bottomsheet state changed
    const state = bottomsheetManager.getCurrentState();
    expect(state.currentState).toBe(BottomsheetState.FULLSCREEN);
  });

  it('should handle organization card clicks', () => {
    const organization = {
      id: '1',
      name: 'Test Organization',
      address: 'Test Address',
      coordinates: [37.620393, 55.75396],
      isAdvertiser: false,
      category: 'test'
    };

    // Simulate organization card click
    const card = container.querySelector('.organization-card') as HTMLElement;
    card.click();

    expect(searchManager.currentScreen).toBe(ScreenType.ORGANIZATION);
  });
});
```

## 🌐 E2E Testing

### Playwright Setup
```typescript
// e2e/tests/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should load dashboard with map', async ({ page }) => {
    // Check if map is loaded
    await expect(page.locator('.dashboard-map')).toBeVisible();
    
    // Check if bottomsheet is present
    await expect(page.locator('.dashboard-bottomsheet')).toBeVisible();
  });

  test('should handle search flow', async ({ page }) => {
    // Click search bar
    await page.click('.search-bar input');
    
    // Verify suggest screen
    await expect(page.locator('.suggest-content')).toBeVisible();
    
    // Type search query
    await page.fill('.search-bar input', 'кафе');
    await page.press('.search-bar input', 'Enter');
    
    // Verify search results
    await expect(page.locator('.search-results')).toBeVisible();
  });

  test('should handle bottomsheet interactions', async ({ page }) => {
    // Drag bottomsheet to fullscreen
    const bottomsheet = page.locator('.dashboard-bottomsheet');
    await bottomsheet.dragTo(page.locator('body'), {
      targetPosition: { x: 200, y: 100 }
    });
    
    // Verify fullscreen state
    await expect(page.locator('.bottomsheet--fullscreen')).toBeVisible();
  });

  test('should handle organization selection', async ({ page }) => {
    // Navigate to search results
    await page.click('.search-bar input');
    await page.fill('.search-bar input', 'ресторан');
    await page.press('.search-bar input', 'Enter');
    
    // Click on organization card
    await page.click('.organization-card');
    
    // Verify organization details
    await expect(page.locator('.organization-details')).toBeVisible();
  });
});
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 📊 Performance Testing

### Load Testing
```typescript
// src/test/performance/LoadTest.ts
import { chromium } from 'playwright';

describe('Performance Tests', () => {
  test('should handle multiple concurrent users', async () => {
    const browsers = [];
    const pagePromises = [];

    // Create multiple browser instances
    for (let i = 0; i < 10; i++) {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      browsers.push(browser);
      pagePromises.push(
        page.goto('http://localhost:8080').then(() => {
          return page.waitForSelector('.dashboard-map');
        })
      );
    }

    // Wait for all pages to load
    await Promise.all(pagePromises);

    // Measure performance
    const startTime = Date.now();
    await Promise.all(pagePromises);
    const endTime = Date.now();

    console.log(`Average load time: ${(endTime - startTime) / 10}ms`);

    // Cleanup
    await Promise.all(browsers.map(browser => browser.close()));
  });
});
```

### Memory Leak Testing
```typescript
// src/test/performance/MemoryTest.ts
describe('Memory Tests', () => {
  test('should not leak memory during navigation', async () => {
    const { page } = await setupBrowser();
    
    const initialMemory = await getMemoryUsage();
    
    // Perform multiple navigation cycles
    for (let i = 0; i < 10; i++) {
      await page.click('.search-bar input');
      await page.fill('.search-bar input', `test ${i}`);
      await page.press('.search-bar input', 'Enter');
      await page.click('.organization-card');
      await page.click('.back-button');
    }
    
    const finalMemory = await getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be minimal (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});

async function getMemoryUsage(): Promise<number> {
  const performance = await page.evaluate(() => {
    return (performance as any).memory?.usedJSHeapSize || 0;
  });
  return performance;
}
```

## 🔧 Test Utilities

### Mock Data
```typescript
// src/test/utils/mockData.ts
export const mockOrganizations = [
  {
    id: '1',
    name: 'Coffee Shop',
    address: 'Moscow, Tverskaya st. 1',
    coordinates: [37.620393, 55.75396],
    isAdvertiser: true,
    rating: 4.5,
    reviewsCount: 128,
    category: 'Cafe',
    phone: '+7 (495) 123-45-67'
  },
  {
    id: '2',
    name: 'Restaurant',
    address: 'Moscow, Arbat st. 10',
    coordinates: [37.590393, 55.74996],
    isAdvertiser: false,
    rating: 4.2,
    reviewsCount: 89,
    category: 'Restaurant',
    phone: '+7 (495) 987-65-43'
  }
];

export const mockProducts = [
  {
    id: '1',
    title: 'Coffee',
    price: 150,
    description: 'Fresh brewed coffee',
    imageUrl: '/images/coffee.jpg'
  },
  {
    id: '2',
    title: 'Cake',
    price: 200,
    description: 'Delicious cake',
    imageUrl: '/images/cake.jpg'
  }
];

export const mockSearchSuggestions = [
  {
    id: '1',
    text: 'кафе',
    type: 'popular' as const,
    subtitle: 'Популярный запрос'
  },
  {
    id: '2',
    text: 'ресторан',
    type: 'popular' as const,
    subtitle: 'Популярный запрос'
  }
];
```

### Test Helpers
```typescript
// src/test/utils/testHelpers.ts
export async function waitForElement(selector: string, timeout = 5000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

export function createMockEvent(type: string, data?: any): Event {
  return new CustomEvent(type, { detail: data });
}

export function simulateUserInteraction(element: Element, eventType: string): void {
  const event = new Event(eventType, { bubbles: true });
  element.dispatchEvent(event);
}
```

## 📈 Coverage Reporting

### Coverage Configuration
```typescript
// jest.config.js
module.exports = {
  // ... other config
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/index.ts',
    '!src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/components/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage'
};
```

### Coverage Scripts
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "jest --testPathPattern=performance"
  }
}
```

---

This testing documentation provides comprehensive guidance for implementing and maintaining a robust testing strategy for the 2GIS template application. 