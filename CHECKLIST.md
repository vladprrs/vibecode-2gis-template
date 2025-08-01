# 2GIS Refactoring Checklist

## ✅ Phase 1: Remove Unused Files
- [ ] `src/main-minimal.ts` removed
- [ ] Empty `src/components/Screens/SearchResultScreen/` directory removed
- [ ] No TypeScript errors
- [ ] Application starts without errors

## ✅ Phase 2: ContentManager Refactoring
- [x] `updateContentForSuggest()` method removed
- [x] `updateContentForDashboard()` method removed
- [x] `updateContentForOrganization()` method removed
- [x] Only `updateContentForSearchResult()` kept
- [x] Search results functionality verified

## ✅ Phase 3: Remove Deprecated Code
- [x] `showSuggestContent()` removed from DashboardScreen
- [x] `getSampleProducts()` removed from ProductRepository
- [x] `getSampleProducts()` removed from CartService
- [x] All deprecated method calls updated
- [x] No deprecated warnings in console

## ✅ Phase 4: Console.log Cleanup
- [x] `src/main.ts` cleaned (15+ console.log)
- [x] `src/services/ContentManager.ts` cleaned (7 console.log)
- [x] `src/components/Screens/DashboardScreen.ts` cleaned (10+ console.log)
- [x] `src/services/MapSyncService.ts` cleaned (8 console.log)
- [x] Other files cleaned
- [x] Console.log count reduced by 80%

## ✅ Phase 5: Import Optimization
- [ ] Unused imports removed
- [ ] index.ts files cleaned
- [ ] ESLint shows no errors
- [ ] TypeScript compiles without errors
- [ ] Bundle size decreased

## ✅ Phase 6: Testing
- [ ] DashboardScreen works
- [ ] SuggestScreen works
- [ ] SearchResultScreen works
- [ ] OrganizationScreen works
- [ ] ShopScreen works
- [ ] CartScreen works
- [ ] CheckoutScreen works
- [ ] All Playwright tests pass
- [ ] Performance not degraded

## 🎯 Success Criteria
- [ ] All screens load without errors
- [ ] Navigation between screens works
- [ ] Adding to cart functions
- [ ] Checkout process works
- [ ] Bundle size decreased by 10-15%
- [ ] No deprecated warnings
- [ ] Console.log count reduced by 80%

## 📊 Before/After Metrics
| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Code size | ~50,000 lines | ? | -10-15% |
| console.log | 50+ | 0 | -80% |
| Deprecated methods | 5+ | 0 | 0 |
| Unused files | 3+ | 0 | 0 |
| Bundle size | ? | ? | -10-15% |

## 🚨 Risks and Mitigation
- [ ] Refactoring branch created
- [ ] Additional tests configured
- [ ] Current state backup created
- [ ] Each phase tested separately
- [ ] Rollback to previous state possible

## 📝 Documentation
- [ ] README.md updated
- [ ] REFACTORING_PLAN.md created
- [ ] TECHNICAL_DETAILS.md created
- [ ] CHECKLIST.md created
- [ ] All changes documented 