# Business Requirements (Reverse-Engineered from Code)

This document captures the business requirements implicitly implemented in the 2GIS template application codebase. It serves as the baseline for refactoring and regression testing.

## 1. Functional Flows

### Core User Journey: Dashboard → Search → Organization → Shop → Cart → Checkout

**Dashboard Screen (Entry Point)**
- Default bottomsheet at 55% height with search bar, stories carousel, and advice grid
- User clicks search bar → triggers navigation to Suggest screen
- Quick action buttons (В путь, Домой, На работу) provide navigation shortcuts
- Stories carousel displays promotional content with viewed/unviewed states
- "Вам может пригодиться" section with advice grid and promo banner

**Search Flow**
- Dashboard search click → `SearchFlowManager.goToSuggest()` → Suggest screen
- Suggest screen at 90% height with active search input and suggestions
- User types query + Enter → `SearchFlowManager.goToSearchResults()` → SearchResult screen
- Search result screen at 90% height with results list and fixed filter bar
- User clicks organization card → `SearchFlowManager.goToOrganization()` → Organization screen

**Organization & Shopping Flow**
- Organization screen displays details, can navigate to Shop screen via shop button
- Shop screen shows product catalog with categories and cart functionality  
- Cart management through `CartService` with quantity controls and subtotal
- Cart screen accessible via global action bar or direct navigation
- Checkout screen handles delivery options, promo codes, and loyalty points

**Navigation & State Persistence**
- `SearchFlowManager` maintains navigation history and allows `goBack()` operations
- Scroll positions and bottomsheet states saved per screen for return navigation
- Search context (query, filters, results) persists across screen transitions
- Filter bar shows/hides based on screen type (visible only on SearchResult)

### Side Effects & Integrations

**Map Synchronization** 
- `MapSyncService` synchronizes 2GIS MapGL viewport with search results
- Organization selection updates map markers and center position
- Graceful fallback to placeholder when MapGL API unavailable

**Cart & Shopping**
- Products added to cart trigger global action bar display
- Cart state persists across navigation with quantity and total calculations
- Product pricing in Russian rubles with localized formatting
- Cart badge shows item count on relevant screens

## 2. Screen Contracts

### Dashboard Screen
- **Default snap point**: 55% (DEFAULT state)
- **Visible components**: Search bar, stories carousel, advice grid, promo banner
- **Required data**: None (static content + stories data)
- **Events emitted**: Search focus, story clicks, meta item clicks
- **Navigation triggers**: Search bar click → Suggest

### Suggest Screen  
- **Default snap point**: 90% (FULLSCREEN state)
- **Visible components**: Active search input, search suggestions list, close button
- **Required data**: Search suggestions from `SearchContext.suggestions`
- **Events emitted**: Query input, suggestion selection, close action
- **Navigation triggers**: Enter key → SearchResult, Close → Dashboard

### SearchResult Screen
- **Default snap point**: 90% (FULLSCREEN state) 
- **Visible components**: Search header, results list, filter bar (fixed overlay)
- **Required data**: `SearchContext.results`, `SearchContext.query`
- **Events emitted**: Organization selection, filter changes
- **Navigation triggers**: Organization card click → Organization, Close → Dashboard

### Organization Screen
- **Default snap point**: 90% (FULLSCREEN state)
- **Visible components**: Organization details, tab bar, shop button, contact info
- **Required data**: `SearchContext.selectedOrganization`
- **Events emitted**: Shop navigation, contact interactions, tab switches  
- **Navigation triggers**: Shop button → Shop, Back → SearchResult

### Shop Screen
- **Default snap point**: 90% (FULLSCREEN state)
- **Visible components**: Product grid, categories, add to cart buttons, action bar
- **Required data**: `SearchContext.selectedShop`, product catalog
- **Events emitted**: Product add to cart, cart navigation
- **Navigation triggers**: Cart button → Cart, Back → Organization

### Cart Screen
- **Default snap point**: 90% (FULLSCREEN state)
- **Visible components**: Cart items, quantity controls, subtotal, order button
- **Required data**: `CartService` state
- **Events emitted**: Quantity changes, item removal, order placement
- **Navigation triggers**: Order button → Checkout, Back → Shop

### Checkout Screen
- **Default snap point**: 90% (FULLSCREEN state)
- **Visible components**: Delivery form, promo code, loyalty toggle, payment button
- **Required data**: `CartService` state, `CheckoutService` state  
- **Events emitted**: Form changes, payment processing
- **Navigation triggers**: Close → Cart, Payment → completion (TBD)

## 3. Shared Services & State

### SearchFlowManager (`src/services/SearchFlowManager.ts`)
- **Purpose**: Central navigation controller for screen transitions
- **Key methods**: `goToSuggest()`, `goToSearchResults()`, `goToOrganization()`, `goToShop()`, `goToCart()`, `goBack()`
- **State**: Current screen, navigation history, search context, scroll positions
- **Singleton**: One instance per application, passed to all screens

### CartService (`src/services/CartService.ts`)
- **Purpose**: Shopping cart state management with persistence
- **Key methods**: `addToCart()`, `updateQuantity()`, `removeFromCart()`, `getState()`
- **State**: Items map, quantities, pricing, formatted totals
- **Events**: Cart updates, item changes for UI synchronization
- **Business rules**: Quantity > 0, price calculations, item count formatting

### BottomsheetManager (`src/services/BottomsheetManager.ts`)
- **Purpose**: Bottomsheet height and gesture management
- **Key methods**: `snapToState()`, `startDrag()`, `endDrag()`, `getHeightForState()`  
- **State**: Current state, animation status, drag status
- **Snap points**: 20% (SMALL), 55% (DEFAULT), 90% (FULLSCREEN), 100% (FULLSCREEN_SCROLL)

### ContentManager (`src/services/ContentManager.ts`)
- **Purpose**: Dynamic content rendering for different screen states
- **Key methods**: `updateContentForDashboard()`, `updateContentForSuggest()`, `updateContentForSearchResult()`
- **Dependencies**: SearchFlowManager, CartService for state-driven content

### CheckoutService (`src/services/CheckoutService.ts`)
- **Purpose**: Order checkout and payment state management
- **Key methods**: `setPromoCode()`, `toggleLoyalty()`, `setSelectedDate()`, `recalculateTotal()`
- **State**: Delivery details, promo codes, loyalty points, total calculations

### GlobalBottomActionBar (`src/services/GlobalBottomActionBar.ts`)
- **Purpose**: Singleton overlay for cart/action buttons across screens
- **Pattern**: Global singleton positioned at viewport bottom
- **Visibility**: Shows when cart has items, hides when empty

## 4. Business Rules & Edge Cases

### Cart Management
- **Quantity limits**: No upper limit enforced in code (potential issue)
- **Price calculations**: `price * quantity` with Russian ruble formatting (`toLocaleString('ru-RU')`)
- **Item persistence**: Cart state exportable/importable for session management
- **Empty cart**: Action bar hidden, cart screen shows empty state

### Search & Navigation
- **Query validation**: Trimmed, non-empty queries required for search execution
- **History limit**: Maximum 10 search queries in history (`searchHistory.slice(0, 10)`)
- **Back navigation**: Maintains stack with scroll position restoration after 100ms delay
- **Duplicate prevention**: Search history removes duplicates before adding new queries

### Bottomsheet Behavior
- **Height constraints**: Minimum 15% of screen height, maximum 100%
- **Scroll behavior**: Auto scroll enabled only when height > 92% of screen
- **Gesture thresholds**: 500px/s velocity for snap direction, 50px minimum distance
- **State transitions**: 300ms duration with cubic-bezier easing

### Payment & Checkout  
- **Loyalty discount**: Fixed 85 ruble discount when enabled
- **Delivery pricing**: Fixed rates (implementation not visible in analyzed code)
- **Promo code validation**: Applied but validation logic not implemented
- **Form requirements**: Recipient name, phone, address, delivery date

### Map Integration
- **Fallback handling**: Graceful degradation with placeholder when MapGL unavailable
- **Marker management**: Temporary markers auto-removed after 3 seconds
- **Coordinate format**: `[longitude, latitude]` array format for 2GIS MapGL
- **Default location**: Moscow center (55.75396, 37.620393) with zoom level 12

## 5. Non-Functional Constraints

### Performance Requirements
- **Animation duration**: 300ms for bottomsheet transitions
- **Smooth scroll**: FPS maintained during bottomsheet gestures  
- **Async operations**: Map initialization, search API calls non-blocking
- **Memory management**: Proper cleanup with `destroy()` methods on all components

### Responsive Design
- **Fixed width**: 375px max-width container design
- **Height adaptation**: Bottomsheet percentages adapt to screen height changes
- **Safe area**: Checkout screen uses `env(safe-area-inset-bottom)` padding
- **Viewport scaling**: All measurements relative to window.innerHeight

### Accessibility & UX
- **Focus management**: Search input auto-focused on Suggest screen
- **Touch targets**: Minimum 40px touch areas for buttons
- **Visual feedback**: Hover states, loading states, error states
- **Keyboard support**: Enter key submits search queries

### Browser & Device Support
- **ES2022 features**: Modern JavaScript with optional chaining, async/await
- **CSS properties**: Custom properties, backdrop-filter, CSS Grid/Flexbox
- **Touch events**: Gesture handling for mobile devices
- **Font support**: SB Sans Text with fallbacks to system fonts

## 6. Open Questions / Ambiguities

### Implementation Gaps
- **Payment processing**: `onProcessPayment` callback exists but implementation missing
- **Search API**: Mock implementations in `SearchFlowManager.fetchSearchResults()`
- **Real product data**: Static product arrays in `CartService.getSampleProducts()`
- **Promo code validation**: Input accepted but validation logic not implemented

### Business Logic Uncertainties  
- **Quantity limits**: No maximum quantity enforcement - could lead to UX issues
- **Price precision**: No handling of fractional prices or currency conversion
- **Delivery zones**: No geographic validation for delivery addresses
- **Loyalty points**: Fixed discount vs. percentage-based unclear from code

### Technical Debt
- **Error handling**: Limited error boundaries and user-facing error messages
- **State persistence**: Local storage strategy not implemented for cart/checkout
- **Performance optimization**: No lazy loading or virtual scrolling for large lists
- **Analytics**: Event tracking callbacks present but implementation missing

### Figma Design Sync
- **Pixel-perfect matching**: Extensive inline CSS suggests tight design coupling
- **Responsive breakpoints**: Fixed 375px width may not scale to larger screens
- **Design token system**: CSS variables used inconsistently across components
- **Component reusability**: Heavy duplication in Figma-matched styling code

### Missing Features
- **User authentication**: No login/logout flows or user state management
- **Offline support**: No service worker or offline cart persistence
- **Push notifications**: No notification system for order updates
- **Multi-language**: Russian hardcoded, no i18n framework detected

---

**Total Implementation Completeness**: ~70% - Core flows functional, payment/backend integration pending

**Risk Areas**: Payment processing, data persistence, error handling, scalability

**Next Steps**: Implement missing payment flow, add comprehensive error handling, establish backend API contracts