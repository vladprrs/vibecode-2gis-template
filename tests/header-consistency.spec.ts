import { test, expect } from '@playwright/test';

/**
 * Header Consistency Tests
 * Validates that headers are visually consistent across all screens
 */

test.describe('Header Layout Consistency', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.dashboard-screen', { timeout: 10000 });
  });

  test('Dashboard header has correct structure and styling', async ({ page }) => {
    // Check header container exists and has correct class
    const header = page.locator('.bottomsheet-header');
    await expect(header).toBeVisible();
    
    // Check drag handle exists
    const dragHandle = header.locator('div').first();
    await expect(dragHandle).toBeVisible();
    
    // Check search bar container exists
    const searchBarContainer = header.locator('div').nth(1);
    await expect(searchBarContainer).toBeVisible();
    
    // Verify header padding and structure
    const headerStyles = await header.evaluate((el) => {
      const computedStyles = window.getComputedStyle(el);
      return {
        display: computedStyles.display,
        flexDirection: computedStyles.flexDirection,
        padding: computedStyles.padding,
        borderRadius: computedStyles.borderRadius,
        background: computedStyles.background,
      };
    });
    
    expect(headerStyles.display).toBe('flex');
    expect(headerStyles.flexDirection).toBe('column');
    expect(headerStyles.padding).toContain('16px');
    expect(headerStyles.borderRadius).toContain('16px');
  });

  test('Suggest screen header maintains consistency', async ({ page }) => {
    // Navigate to suggest screen by clicking on search bar
    await page.click('.search-bar-container');
    
    // Wait for navigation to complete
    await page.waitForSelector('.bottomsheet-header', { timeout: 5000 });
    
    // Check header structure is consistent
    const header = page.locator('.bottomsheet-header');
    await expect(header).toBeVisible();
    
    // Verify same header structure as dashboard
    const headerStyles = await header.evaluate((el) => {
      const computedStyles = window.getComputedStyle(el);
      return {
        display: computedStyles.display,
        flexDirection: computedStyles.flexDirection,
        padding: computedStyles.padding,
        borderRadius: computedStyles.borderRadius,
        background: computedStyles.background,
      };
    });
    
    expect(headerStyles.display).toBe('flex');
    expect(headerStyles.flexDirection).toBe('column');
    expect(headerStyles.padding).toContain('16px');
    expect(headerStyles.borderRadius).toContain('16px');
    
    // Check drag handle exists
    const dragHandle = header.locator('div').first();
    await expect(dragHandle).toBeVisible();
    
    // Check search input is active/focused
    const searchInput = page.locator('input[type=\"text\"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();
  });

  test('SearchResult screen header maintains consistency', async ({ page }) => {
    // Navigate to search results
    await page.click('.search-bar-container');
    await page.waitForSelector('input[type=\"text\"]', { timeout: 5000 });
    await page.fill('input[type=\"text\"]', 'test query');
    await page.press('input[type=\"text\"]', 'Enter');
    
    // Wait for search results screen
    await page.waitForSelector('.bottomsheet-header', { timeout: 5000 });
    
    // Check header structure is consistent
    const header = page.locator('.bottomsheet-header');
    await expect(header).toBeVisible();
    
    // Verify same header structure as other screens
    const headerStyles = await header.evaluate((el) => {
      const computedStyles = window.getComputedStyle(el);
      return {
        display: computedStyles.display,
        flexDirection: computedStyles.flexDirection,
        padding: computedStyles.padding,
        borderRadius: computedStyles.borderRadius,
        background: computedStyles.background,
      };
    });
    
    expect(headerStyles.display).toBe('flex');
    expect(headerStyles.flexDirection).toBe('column');
    expect(headerStyles.padding).toContain('16px');
    expect(headerStyles.borderRadius).toContain('16px');
    
    // Check drag handle exists
    const dragHandle = header.locator('div').first();
    await expect(dragHandle).toBeVisible();
    
    // Check search bar with filled query exists
    const searchContainer = page.locator('.search-bar-container');
    await expect(searchContainer).toBeVisible();
    
    // Check filters panel exists and is properly positioned
    const filtersPanel = header.locator('.search-filters, [class*=\"filter\"]').first();
    if (await filtersPanel.count() > 0) {
      await expect(filtersPanel).toBeVisible();
    }
  });

  test('Header elements have consistent dimensions across screens', async ({ page }) => {
    // Test Dashboard header dimensions
    const dashboardHeaderDimensions = await page.locator('.bottomsheet-header').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const computedStyles = window.getComputedStyle(el);
      return {
        height: rect.height,
        padding: computedStyles.padding,
        dragHandle: {
          width: el.querySelector('div')?.getBoundingClientRect().width,
          height: el.querySelector('div')?.getBoundingClientRect().height,
        }
      };
    });
    
    // Navigate to suggest screen
    await page.click('.search-bar-container');
    await page.waitForSelector('.bottomsheet-header', { timeout: 5000 });
    
    const suggestHeaderDimensions = await page.locator('.bottomsheet-header').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const computedStyles = window.getComputedStyle(el);
      return {
        height: rect.height,
        padding: computedStyles.padding,
        dragHandle: {
          width: el.querySelector('div')?.getBoundingClientRect().width,
          height: el.querySelector('div')?.getBoundingClientRect().height,
        }
      };
    });
    
    // Compare header consistency (allow some tolerance for content differences)
    expect(dashboardHeaderDimensions.padding).toBe(suggestHeaderDimensions.padding);
    expect(dashboardHeaderDimensions.dragHandle.width).toBe(suggestHeaderDimensions.dragHandle.width);
    expect(dashboardHeaderDimensions.dragHandle.height).toBe(suggestHeaderDimensions.dragHandle.height);
  });

  test('Search bar containers have correct styling based on screen type', async ({ page }) => {
    // Test Dashboard search bar (inactive state)
    const dashboardSearchBar = page.locator('.search-bar-container');
    await expect(dashboardSearchBar).toBeVisible();
    
    const dashboardStyles = await dashboardSearchBar.evaluate((el) => {
      const computedStyles = window.getComputedStyle(el);
      return {
        background: computedStyles.background,
        border: computedStyles.border,
        height: computedStyles.height,
        borderRadius: computedStyles.borderRadius,
      };
    });
    
    // Dashboard should have gray background
    expect(dashboardStyles.background).toContain('rgba(20, 20, 20, 0.09)');
    expect(dashboardStyles.height).toBe('40px');
    expect(dashboardStyles.borderRadius).toBe('8px');
    
    // Navigate to suggest screen
    await page.click('.search-bar-container');
    await page.waitForSelector('.search-bar-container', { timeout: 5000 });
    
    const suggestStyles = await page.locator('.search-bar-container').evaluate((el) => {
      const computedStyles = window.getComputedStyle(el);
      return {
        background: computedStyles.background,
        border: computedStyles.border,
        height: computedStyles.height,
        borderRadius: computedStyles.borderRadius,
      };
    });
    
    // Suggest should have gray background (same as dashboard for inactive)
    expect(suggestStyles.background).toContain('rgba(20, 20, 20, 0.09)');
    expect(suggestStyles.height).toBe('40px');
    expect(suggestStyles.borderRadius).toBe('8px');
    
    // Navigate to search results
    const searchInput = page.locator('input[type=\"text\"]');
    await searchInput.fill('test query');
    await searchInput.press('Enter');
    await page.waitForSelector('.search-bar-container', { timeout: 5000 });
    
    const searchResultStyles = await page.locator('.search-bar-container').evaluate((el) => {
      const computedStyles = window.getComputedStyle(el);
      return {
        background: computedStyles.background,
        border: computedStyles.border,
        height: computedStyles.height,
        borderRadius: computedStyles.borderRadius,
      };
    });
    
    // Search result should have white background with border
    expect(searchResultStyles.background).toContain('rgba(255, 255, 255, 1)');
    expect(searchResultStyles.border).toContain('rgba(137, 137, 137, 0.3)');
    expect(searchResultStyles.height).toBe('40px');
    expect(searchResultStyles.borderRadius).toBe('8px');
  });

  test('Headers are positioned correctly at the top of bottomsheet', async ({ page }) => {
    // Check dashboard header position
    const headerPosition = await page.locator('.bottomsheet-header').evaluate((el) => {
      const parentRect = el.parentElement?.getBoundingClientRect();
      const headerRect = el.getBoundingClientRect();
      return {
        isFirstChild: el === el.parentElement?.firstElementChild,
        topOffset: headerRect.top - (parentRect?.top || 0),
      };
    });
    
    // Header should be the first child and positioned at the top
    expect(headerPosition.isFirstChild).toBe(true);
    expect(headerPosition.topOffset).toBeLessThanOrEqual(5); // Allow small tolerance
    
    // Test other screens maintain correct positioning
    await page.click('.search-bar-container');
    await page.waitForSelector('.bottomsheet-header', { timeout: 5000 });
    
    const suggestHeaderPosition = await page.locator('.bottomsheet-header').evaluate((el) => {
      const parentRect = el.parentElement?.getBoundingClientRect();
      const headerRect = el.getBoundingClientRect();
      return {
        isFirstChild: el === el.parentElement?.firstElementChild,
        topOffset: headerRect.top - (parentRect?.top || 0),
      };
    });
    
    expect(suggestHeaderPosition.isFirstChild).toBe(true);
    expect(suggestHeaderPosition.topOffset).toBeLessThanOrEqual(5);
  });
});