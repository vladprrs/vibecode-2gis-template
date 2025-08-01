# Test Coverage Plan for 2GIS Application

## 1. Goals
- Ensure all critical user flows are covered by automated tests
- Minimize risk of regressions after refactoring and new features
- Achieve high confidence in product quality before releases

## 2. Test Types

### 2.1. End-to-End (E2E) Tests (Playwright)
- Cover main user scenarios from UI perspective
- Simulate real user actions in browser
- Validate navigation, data flow, and UI consistency

### 2.2. Integration Tests
- Cover interaction between modules (e.g., services + components)
- Test business logic in realistic but controlled environment

### 2.3. Unit Tests
- Cover pure functions, utilities, and isolated business logic
- Fast feedback for low-level code

### 2.4. Visual Regression Tests
- Ensure UI consistency across screens and after changes
- Use screenshot comparison for critical UI elements

## 3. Coverage Matrix

| Feature/Screen         | E2E | Integration | Unit | Visual |
|-----------------------|-----|-------------|------|--------|
| DashboardScreen       |  X  |      X      |  X   |   X    |
| SuggestScreen         |  X  |      X      |  X   |   X    |
| SearchResultScreen    |  X  |      X      |  X   |   X    |
| OrganizationScreen    |  X  |      X      |  X   |   X    |
| ShopScreen            |  X  |      X      |  X   |   X    |
| CartScreen            |  X  |      X      |  X   |   X    |
| CheckoutScreen        |  X  |      X      |  X   |   X    |
| Search/Filters        |  X  |      X      |  X   |   X    |
| CartService           |     |      X      |  X   |        |
| CheckoutService       |     |      X      |  X   |        |
| ContentManager        |     |      X      |  X   |        |
| Map/MapSyncService    |  X  |      X      |  X   |   X    |
| UI Consistency        |  X  |             |      |   X    |
| Error Handling        |  X  |      X      |  X   |        |

## 4. E2E Test Scenarios (Playwright)
- Application loads without errors
- Navigation between all main screens
- Search and suggestions work as expected
- Adding/removing items from cart
- Checkout process (with validation)
- Organization details view
- Shop browsing and filtering
- UI elements (headers, search bar, buttons) are consistent
- Error and edge case handling (404, empty states, etc.)

## 5. Integration Test Scenarios
- CartService + UI: cart updates reflected in UI
- CheckoutService + UI: order state updates
- ContentManager: correct content for each screen
- Map/MapSyncService: map state sync with UI

## 6. Unit Test Focus
- Utilities: formatting, validation, helpers
- Business logic in services (CartService, CheckoutService, etc.)
- Reducers/selectors if present

## 7. Visual Regression
- Screenshots for all main screens (Dashboard, Suggest, SearchResult, Organization, Shop, Cart, Checkout)
- Key UI components: headers, search bar, action buttons
- Compare with baseline after each change

## 8. Coverage Criteria
- 100% of critical user flows covered by E2E
- 80%+ statements/branches for business logic (unit/integration)
- All main screens have visual baseline
- All bugfixes and new features require corresponding tests

## 9. Priorities
1. Smoke tests for all screens and flows
2. Cart and checkout business logic
3. Search and navigation
4. UI consistency and visual regression
5. Edge cases and error handling

## 10. Automation & CI
- All tests run on CI for every PR and before release
- Test reports and coverage published automatically
- Visual diffs reviewed for every UI change

---

_This plan is a living document and should be updated as the product evolves._