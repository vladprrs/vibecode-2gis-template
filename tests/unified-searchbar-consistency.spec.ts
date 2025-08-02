import { test, expect } from '@playwright/test';

/**
 * Unified Search Bar Consistency Tests
 * Validates that search bars have consistent styling and visual elements across all screens
 */

test.describe('Unified Search Bar Consistency', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the application to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.search-bar-container', { timeout: 10000 });
  });

  test('Dashboard search bar has unified styling', async ({ page }) => {
    // Get search bar container
    const searchBar = page.locator('.search-bar-container');
    await expect(searchBar).toBeVisible();

    // Verify unified background and styling
    const searchBarStyles = await searchBar.evaluate(el => {
      const computedStyles = window.getComputedStyle(el);
      return {
        background: computedStyles.background,
        borderRadius: computedStyles.borderRadius,
        height: computedStyles.height,
        padding: computedStyles.padding,
        border: computedStyles.border,
      };
    });

    // Unified gray background across all screens
    expect(searchBarStyles.background).toContain('rgba(20, 20, 20, 0.09)');
    expect(searchBarStyles.height).toBe('40px');
    expect(searchBarStyles.borderRadius).toBe('8px');
    expect(searchBarStyles.padding).toBe('10px 8px');
    expect(searchBarStyles.border).toContain('1px solid transparent');

    // Check unified search icon (best from Suggest screen)
    const searchIcon = searchBar.locator('.search-icon');
    await expect(searchIcon).toBeVisible();

    const searchIconStyles = await searchIcon.evaluate(el => {
      const computedStyles = window.getComputedStyle(el);
      return {
        width: computedStyles.width,
        height: computedStyles.height,
        marginRight: computedStyles.marginRight,
        opacity: computedStyles.opacity,
      };
    });

    expect(searchIconStyles.width).toBe('20px');
    expect(searchIconStyles.height).toBe('20px');
    expect(searchIconStyles.marginRight).toBe('12px');
    expect(searchIconStyles.opacity).toBe('0.6');
  });

  test('Suggest screen search bar maintains unified styling', async ({ page }) => {
    // Navigate to suggest screen
    await page.click('.search-bar-container');
    await page.waitForSelector('.search-bar-container', { timeout: 5000 });

    const searchBar = page.locator('.search-bar-container');
    await expect(searchBar).toBeVisible();

    // Verify same unified styling as Dashboard
    const searchBarStyles = await searchBar.evaluate(el => {
      const computedStyles = window.getComputedStyle(el);
      return {
        background: computedStyles.background,
        borderRadius: computedStyles.borderRadius,
        height: computedStyles.height,
        padding: computedStyles.padding,
        border: computedStyles.border,
      };
    });

    // Same unified gray background
    expect(searchBarStyles.background).toContain('rgba(20, 20, 20, 0.09)');
    expect(searchBarStyles.height).toBe('40px');
    expect(searchBarStyles.borderRadius).toBe('8px');
    expect(searchBarStyles.padding).toBe('10px 8px');
    expect(searchBarStyles.border).toContain('1px solid transparent');

    // Check unified search icon
    const searchIcon = searchBar.locator('.search-icon');
    await expect(searchIcon).toBeVisible();

    // Check unified clear button (when text is present)
    const searchInput = page.locator('input[type="text"]');
    if (await searchInput.inputValue()) {
      const clearButton = searchBar.locator('.search-clear-button');

      const clearButtonStyles = await clearButton.evaluate(el => {
        const computedStyles = window.getComputedStyle(el);
        return {
          width: computedStyles.width,
          height: computedStyles.height,
          marginLeft: computedStyles.marginLeft,
          borderRadius: computedStyles.borderRadius,
        };
      });

      expect(clearButtonStyles.width).toBe('24px');
      expect(clearButtonStyles.height).toBe('24px');
      expect(clearButtonStyles.marginLeft).toBe('8px');
      expect(clearButtonStyles.borderRadius).toBe('50%');
    }
  });

  test('SearchResult screen search bar maintains unified styling', async ({ page }) => {
    // Navigate to search results
    await page.click('.search-bar-container');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'фитнес');
    await page.press('input[type="text"]', 'Enter');

    // Wait for search results screen
    await page.waitForSelector('.search-bar-container', { timeout: 5000 });

    const searchBar = page.locator('.search-bar-container');
    await expect(searchBar).toBeVisible();

    // Verify same unified styling as other screens
    const searchBarStyles = await searchBar.evaluate(el => {
      const computedStyles = window.getComputedStyle(el);
      return {
        background: computedStyles.background,
        borderRadius: computedStyles.borderRadius,
        height: computedStyles.height,
        padding: computedStyles.padding,
        border: computedStyles.border,
      };
    });

    // Same unified gray background (not white anymore)
    expect(searchBarStyles.background).toContain('rgba(20, 20, 20, 0.09)');
    expect(searchBarStyles.height).toBe('40px');
    expect(searchBarStyles.borderRadius).toBe('8px');
    expect(searchBarStyles.padding).toBe('10px 8px');
    expect(searchBarStyles.border).toContain('1px solid transparent');

    // Check unified search icon
    const searchIcon = searchBar.locator('.search-icon');
    await expect(searchIcon).toBeVisible();

    // Check unified clear button (should be visible with query text)
    const clearButton = searchBar.locator('.search-clear-button');
    await expect(clearButton).toBeVisible();

    const clearButtonStyles = await clearButton.evaluate(el => {
      const computedStyles = window.getComputedStyle(el);
      return {
        width: computedStyles.width,
        height: computedStyles.height,
        marginLeft: computedStyles.marginLeft,
        borderRadius: computedStyles.borderRadius,
      };
    });

    expect(clearButtonStyles.width).toBe('24px');
    expect(clearButtonStyles.height).toBe('24px');
    expect(clearButtonStyles.marginLeft).toBe('8px');
    expect(clearButtonStyles.borderRadius).toBe('50%');
  });

  test('Search icons are consistent across all screens', async ({ page }) => {
    const screenSearchIconStyles = [];

    // Test Dashboard screen search icon
    const dashboardSearchIcon = page.locator('.search-icon');
    await expect(dashboardSearchIcon).toBeVisible();

    const dashboardIconStyles = await dashboardSearchIcon.evaluate(el => {
      const computedStyles = window.getComputedStyle(el);
      const svg = el.querySelector('svg');
      return {
        width: computedStyles.width,
        height: computedStyles.height,
        opacity: computedStyles.opacity,
        svgViewBox: svg?.getAttribute('viewBox'),
        svgWidth: svg?.getAttribute('width'),
        svgHeight: svg?.getAttribute('height'),
      };
    });
    screenSearchIconStyles.push(dashboardIconStyles);

    // Navigate to Suggest screen and test search icon
    await page.click('.search-bar-container');
    await page.waitForSelector('.search-icon', { timeout: 5000 });

    const suggestSearchIcon = page.locator('.search-icon');
    const suggestIconStyles = await suggestSearchIcon.evaluate(el => {
      const computedStyles = window.getComputedStyle(el);
      const svg = el.querySelector('svg');
      return {
        width: computedStyles.width,
        height: computedStyles.height,
        opacity: computedStyles.opacity,
        svgViewBox: svg?.getAttribute('viewBox'),
        svgWidth: svg?.getAttribute('width'),
        svgHeight: svg?.getAttribute('height'),
      };
    });
    screenSearchIconStyles.push(suggestIconStyles);

    // Navigate to SearchResult screen and test search icon
    await page.fill('input[type="text"]', 'фитнес');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForSelector('.search-icon', { timeout: 5000 });

    const searchResultSearchIcon = page.locator('.search-icon');
    const searchResultIconStyles = await searchResultSearchIcon.evaluate(el => {
      const computedStyles = window.getComputedStyle(el);
      const svg = el.querySelector('svg');
      return {
        width: computedStyles.width,
        height: computedStyles.height,
        opacity: computedStyles.opacity,
        svgViewBox: svg?.getAttribute('viewBox'),
        svgWidth: svg?.getAttribute('width'),
        svgHeight: svg?.getAttribute('height'),
      };
    });
    screenSearchIconStyles.push(searchResultIconStyles);

    // Verify all search icons are identical (unified)
    const [dashboard, suggest, searchResult] = screenSearchIconStyles;

    expect(dashboard.width).toBe(suggest.width);
    expect(suggest.width).toBe(searchResult.width);

    expect(dashboard.height).toBe(suggest.height);
    expect(suggest.height).toBe(searchResult.height);

    expect(dashboard.opacity).toBe(suggest.opacity);
    expect(suggest.opacity).toBe(searchResult.opacity);

    expect(dashboard.svgViewBox).toBe(suggest.svgViewBox);
    expect(suggest.svgViewBox).toBe(searchResult.svgViewBox);

    expect(dashboard.svgWidth).toBe(suggest.svgWidth);
    expect(suggest.svgWidth).toBe(searchResult.svgWidth);

    expect(dashboard.svgHeight).toBe(suggest.svgHeight);
    expect(suggest.svgHeight).toBe(searchResult.svgHeight);

    // Verify unified values
    expect(dashboard.width).toBe('20px');
    expect(dashboard.height).toBe('20px');
    expect(dashboard.opacity).toBe('0.6');
    expect(dashboard.svgViewBox).toBe('0 0 20 20');
    expect(dashboard.svgWidth).toBe('20');
    expect(dashboard.svgHeight).toBe('20');
  });

  test('Clear buttons are consistent across applicable screens', async ({ page }) => {
    // Navigate to suggest screen where clear button is visible
    await page.click('.search-bar-container');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'test');

    // Wait for clear button to appear
    await page.waitForSelector('.search-clear-button', { state: 'visible', timeout: 5000 });

    const suggestClearButton = page.locator('.search-clear-button');
    const suggestClearStyles = await suggestClearButton.evaluate(el => {
      const computedStyles = window.getComputedStyle(el);
      const svg = el.querySelector('svg');
      return {
        width: computedStyles.width,
        height: computedStyles.height,
        marginLeft: computedStyles.marginLeft,
        borderRadius: computedStyles.borderRadius,
        svgViewBox: svg?.getAttribute('viewBox'),
        svgWidth: svg?.getAttribute('width'),
        svgHeight: svg?.getAttribute('height'),
      };
    });

    // Navigate to SearchResult screen
    await page.press('input[type="text"]', 'Enter');
    await page.waitForSelector('.search-clear-button', { state: 'visible', timeout: 5000 });

    const searchResultClearButton = page.locator('.search-clear-button');
    const searchResultClearStyles = await searchResultClearButton.evaluate(el => {
      const computedStyles = window.getComputedStyle(el);
      const svg = el.querySelector('svg');
      return {
        width: computedStyles.width,
        height: computedStyles.height,
        marginLeft: computedStyles.marginLeft,
        borderRadius: computedStyles.borderRadius,
        svgViewBox: svg?.getAttribute('viewBox'),
        svgWidth: svg?.getAttribute('width'),
        svgHeight: svg?.getAttribute('height'),
      };
    });

    // Verify clear buttons are identical (unified)
    expect(suggestClearStyles.width).toBe(searchResultClearStyles.width);
    expect(suggestClearStyles.height).toBe(searchResultClearStyles.height);
    expect(suggestClearStyles.marginLeft).toBe(searchResultClearStyles.marginLeft);
    expect(suggestClearStyles.borderRadius).toBe(searchResultClearStyles.borderRadius);
    expect(suggestClearStyles.svgViewBox).toBe(searchResultClearStyles.svgViewBox);
    expect(suggestClearStyles.svgWidth).toBe(searchResultClearStyles.svgWidth);
    expect(suggestClearStyles.svgHeight).toBe(searchResultClearStyles.svgHeight);

    // Verify unified values (best from SearchResult screen)
    expect(suggestClearStyles.width).toBe('24px');
    expect(suggestClearStyles.height).toBe('24px');
    expect(suggestClearStyles.marginLeft).toBe('8px');
    expect(suggestClearStyles.borderRadius).toBe('50%');
    expect(suggestClearStyles.svgViewBox).toBe('0 0 16 16');
    expect(suggestClearStyles.svgWidth).toBe('16');
    expect(suggestClearStyles.svgHeight).toBe('16');
  });

  test('Background colors are unified across all screens', async ({ page }) => {
    const screenBackgrounds = [];

    // Test Dashboard background
    const dashboardSearchBar = page.locator('.search-bar-container');
    const dashboardBg = await dashboardSearchBar.evaluate(el => {
      return window.getComputedStyle(el).background;
    });
    screenBackgrounds.push(dashboardBg);

    // Navigate to Suggest screen and test background
    await page.click('.search-bar-container');
    await page.waitForSelector('.search-bar-container', { timeout: 5000 });

    const suggestSearchBar = page.locator('.search-bar-container');
    const suggestBg = await suggestSearchBar.evaluate(el => {
      return window.getComputedStyle(el).background;
    });
    screenBackgrounds.push(suggestBg);

    // Navigate to SearchResult screen and test background
    await page.fill('input[type="text"]', 'фитнес');
    await page.press('input[type="text"]', 'Enter');
    await page.waitForSelector('.search-bar-container', { timeout: 5000 });

    const searchResultSearchBar = page.locator('.search-bar-container');
    const searchResultBg = await searchResultSearchBar.evaluate(el => {
      return window.getComputedStyle(el).background;
    });
    screenBackgrounds.push(searchResultBg);

    // Verify all backgrounds are identical (unified gray)
    const [dashboard, suggest, searchResult] = screenBackgrounds;

    expect(dashboard).toBe(suggest);
    expect(suggest).toBe(searchResult);

    // All should have unified gray background
    expect(dashboard).toContain('rgba(20, 20, 20, 0.09)');
    expect(suggest).toContain('rgba(20, 20, 20, 0.09)');
    expect(searchResult).toContain('rgba(20, 20, 20, 0.09)');
  });
});
