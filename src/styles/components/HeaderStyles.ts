import { StyleBuilder, StyleObject } from '../utils/StyleBuilder';

/**
 * Unified header constants for consistent layout across all screens
 */
export const UNIFIED_HEADER_STYLES = {
  // Base header container - consistent across all screens
  BASE_HEADER: `
    display: flex;
    padding: 16px 0 8px 0;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    border-radius: 16px 16px 0 0;
    background: rgba(255, 255, 255, 0.70);
    backdrop-filter: blur(20px);
    position: relative;
  `,

  // Drag section - consistent across all screens
  DRAG_SECTION: `
    display: flex;
    height: 0;
    padding-bottom: 6px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    align-self: stretch;
    position: relative;
  `,

  // Drag handle - consistent across all screens
  DRAG_HANDLE: `
    width: 40px;
    height: 4px;
    flex-shrink: 0;
    border-radius: 6px;
    background: rgba(20, 20, 20, 0.09);
    position: relative;
  `,

  // Search bar container - consistent across all screens
  SEARCH_BAR_CONTAINER: `
    display: flex;
    padding: 0 16px;
    align-items: flex-start;
    gap: 12px;
    flex: 1 0 0;
    align-self: stretch;
    position: relative;
  `,

  // Unified search input container - consistent across all screens
  SEARCH_INPUT_UNIFIED: `
    display: flex;
    height: 40px;
    padding: 10px 8px;
    align-items: center;
    align-self: stretch;
    border-radius: 8px;
    background: rgba(20, 20, 20, 0.09);
    border: 1px solid transparent;
    position: relative;
    transition: all 0.2s ease;
    gap: 4px;
    flex: 1 0 0;
  `,

  // Unified search icon - best from Suggest screen
  SEARCH_ICON_UNIFIED: `
    width: 20px;
    height: 20px;
    margin-right: 12px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  `,

  // Unified clear button - best from SearchResult screen
  CLEAR_BUTTON_UNIFIED: `
    width: 24px;
    height: 24px;
    margin-left: 8px;
    border: none;
    background-color: transparent;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.2s ease, transform 0.1s ease;
    flex-shrink: 0;
  `,

  // Legacy search input containers by screen type (kept for backward compatibility)
  SEARCH_INPUT: {
    DASHBOARD: `
      display: flex;
      height: 40px;
      padding: 10px 8px;
      align-items: center;
      align-self: stretch;
      border-radius: 8px;
      background: rgba(20, 20, 20, 0.09);
      border: 1px solid transparent;
      position: relative;
      transition: all 0.2s ease;
      gap: 4px;
      cursor: pointer;
      flex: 1 0 0;
    `,
    SUGGEST: `
      display: flex;
      height: 40px;
      padding: 10px 8px;
      align-items: center;
      align-self: stretch;
      border-radius: 8px;
      background: rgba(20, 20, 20, 0.09);
      border: 1px solid transparent;
      position: relative;
      transition: all 0.2s ease;
      gap: 4px;
      flex: 1 0 0;
    `,
    SEARCH_RESULT: `
      display: flex;
      height: 40px;
      padding: 10px 8px;
      align-items: center;
      align-self: stretch;
      border-radius: 8px;
      background: rgba(20, 20, 20, 0.09);
      border: 1px solid transparent;
      position: relative;
      transition: all 0.2s ease;
      gap: 4px;
      flex: 1 0 0;
    `,
  },

  // Filters panel styling for search result screen
  FILTERS_PANEL: `
    display: flex;
    padding: 8px 16px 0 16px;
    align-items: flex-start;
    align-self: stretch;
    position: relative;
    background: transparent;
    border-top: 1px solid rgba(137, 137, 137, 0.15);
    margin-top: 8px;
  `,
} as const;

/**
 * Header-specific styling utilities
 * Consolidates header patterns from DashboardScreen, SearchResultScreen, SuggestScreen
 */
export class HeaderStyles {
  /**
   * Create complete dashboard header with search field
   */
  static dashboard(): {
    container: StyleObject;
    dragger: StyleObject;
    searchContainer: StyleObject;
    searchField: StyleObject;
    searchIcon: StyleObject;
    searchPlaceholder: StyleObject;
  } {
    return {
      container: StyleBuilder.header('dashboard'),
      dragger: StyleBuilder.dragHandle(),
      searchContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        position: 'relative',
      },
      searchField: {
        display: 'flex',
        padding: '0 16px',
        alignItems: 'flex-start',
        gap: '12px',
        flex: '1 0 0',
        position: 'relative',
      },
      searchIcon: {
        width: '19px',
        height: '19px',
        flexShrink: '0',
      },
      searchPlaceholder: {
        ...StyleBuilder.text('body'),
        color: '#898989',
        flex: '1',
      },
    };
  }

  /**
   * Create search result header with query display
   */
  static searchResult(query: string = ''): {
    container: StyleObject;
    dragHandle: StyleObject;
    navBar: StyleObject;
    searchField: StyleObject;
    queryText: StyleObject;
    closeButton: StyleObject;
  } {
    return {
      container: StyleBuilder.header('search'),
      dragHandle: StyleBuilder.dragHandleBar(),
      navBar: {
        display: 'flex',
        padding: '0 16px',
        alignItems: 'flex-start',
        gap: '12px',
        flex: '1 0 0',
        position: 'relative',
      },
      searchField: {
        display: 'flex',
        height: '40px',
        padding: '10px 8px',
        alignItems: 'center',
        alignSelf: 'stretch',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 1)',
        border: '1px solid rgba(137, 137, 137, 0.30)',
        position: 'relative',
        gap: '4px',
        flex: '1 0 0',
      },
      queryText: {
        ...StyleBuilder.text('body'),
        color: '#141414',
        flex: '1',
      },
      closeButton: StyleBuilder.button('close'),
    };
  }

  /**
   * Create suggest screen header with active search input
   */
  static suggest(): {
    container: StyleObject;
    dragHandle: StyleObject;
    navBar: StyleObject;
    textField: StyleObject;
    searchInput: StyleObject;
    clearButton: StyleObject;
    closeButton: StyleObject;
  } {
    return {
      container: StyleBuilder.header('suggest'),
      dragHandle: StyleBuilder.dragHandleBar(),
      navBar: {
        display: 'flex',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        position: 'relative',
      },
      textField: {
        display: 'flex',
        height: '40px',
        padding: '10px 8px',
        alignItems: 'center',
        alignSelf: 'stretch',
        borderRadius: '8px',
        background: 'rgba(20, 20, 20, 0.09)',
        position: 'relative',
        gap: '4px',
        flex: '1 0 0',
      },
      searchInput: {
        ...StyleBuilder.text('body'),
        color: '#898989',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        padding: '0',
        margin: '0',
        flex: '1',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      clearButton: {
        display: 'flex',
        width: '24px',
        height: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: '0',
        cursor: 'pointer',
      },
      closeButton: StyleBuilder.button('close'),
    };
  }

  /**
   * Create organization header with back button
   */
  static organization(): {
    container: StyleObject;
    backButton: StyleObject;
    title: StyleObject;
    actions: StyleObject;
  } {
    return {
      container: {
        ...StyleBuilder.header('organization'),
        ...StyleBuilder.flex('row', 'space-between', 'center'),
        padding: '16px',
      },
      backButton: {
        ...StyleBuilder.button('icon'),
        marginRight: '12px',
      },
      title: StyleBuilder.text('title'),
      actions: {
        ...StyleBuilder.flex('row', 'flex-end', 'center'),
        gap: '8px',
      },
    };
  }

  /**
   * Unified search icon SVG - improved visual design from legacy Suggest screen
   */
  static getUnifiedSearchIconSVG(): string {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/>
      <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  /**
   * Unified clear button SVG - optimized from SearchResult screen
   */
  static getUnifiedClearButtonSVG(): string {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4 4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  /**
   * Common search icon SVG (legacy)
   */
  static getSearchIconSVG(): string {
    return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="#898989" stroke-width="1.5"/>
      <path d="m21 21-4.35-4.35" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  /**
   * Common close icon SVG (legacy)
   */
  static getCloseIconSVG(): string {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  /**
   * Create unified header structure for all screens
   */
  static createUnifiedHeader(): {
    container: HTMLElement;
    dragSection: HTMLElement;
    searchBarContainer: HTMLElement;
  } {
    const container = document.createElement('div');
    container.className = 'bottomsheet-header';
    container.style.cssText = UNIFIED_HEADER_STYLES.BASE_HEADER;

    const dragSection = document.createElement('div');
    dragSection.style.cssText = UNIFIED_HEADER_STYLES.DRAG_SECTION;

    const dragHandle = document.createElement('div');
    dragHandle.style.cssText = UNIFIED_HEADER_STYLES.DRAG_HANDLE;
    dragSection.appendChild(dragHandle);

    const searchBarContainer = document.createElement('div');
    searchBarContainer.style.cssText = UNIFIED_HEADER_STYLES.SEARCH_BAR_CONTAINER;

    container.appendChild(dragSection);
    container.appendChild(searchBarContainer);

    return { container, dragSection, searchBarContainer };
  }

  /**
   * Apply unified search input styles - same across all screens
   */
  static applyUnifiedSearchInputStyles(searchContainer: HTMLElement): void {
    if (searchContainer) {
      searchContainer.style.cssText = UNIFIED_HEADER_STYLES.SEARCH_INPUT_UNIFIED;
    }
  }

  /**
   * Apply unified search icon styles
   */
  static applyUnifiedSearchIconStyles(searchIcon: HTMLElement): void {
    if (searchIcon) {
      searchIcon.style.cssText = UNIFIED_HEADER_STYLES.SEARCH_ICON_UNIFIED;
      searchIcon.innerHTML = this.getUnifiedSearchIconSVG();
    }
  }

  /**
   * Apply unified clear button styles
   */
  static applyUnifiedClearButtonStyles(clearButton: HTMLElement): void {
    if (clearButton) {
      clearButton.style.cssText = UNIFIED_HEADER_STYLES.CLEAR_BUTTON_UNIFIED;
      clearButton.innerHTML = this.getUnifiedClearButtonSVG();

      // Add hover effects
      clearButton.addEventListener('mouseenter', () => {
        clearButton.style.opacity = '1';
        clearButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
      });

      clearButton.addEventListener('mouseleave', () => {
        clearButton.style.opacity = '0.6';
        clearButton.style.backgroundColor = 'transparent';
      });

      clearButton.addEventListener('mousedown', () => {
        clearButton.style.transform = 'scale(0.9)';
      });

      clearButton.addEventListener('mouseup', () => {
        clearButton.style.transform = 'scale(1)';
      });
    }
  }

  /**
   * Apply unified search input styles based on screen type (legacy method)
   */
  static applyUnifiedSearchInputStylesByType(
    searchContainer: HTMLElement,
    screenType: 'DASHBOARD' | 'SUGGEST' | 'SEARCH_RESULT'
  ): void {
    if (searchContainer) {
      searchContainer.style.cssText = UNIFIED_HEADER_STYLES.SEARCH_INPUT[screenType];
    }
  }

  /**
   * Apply complete header styles to DOM elements
   */
  static applyDashboardHeader(
    container: HTMLElement,
    searchField: HTMLElement,
    placeholder?: HTMLElement
  ): void {
    const styles = this.dashboard();
    StyleBuilder.apply(container, styles.container);
    StyleBuilder.apply(searchField, styles.searchField);
    if (placeholder) {
      StyleBuilder.apply(placeholder, styles.searchPlaceholder);
    }
  }

  /**
   * Apply search result header styles to DOM elements
   */
  static applySearchResultHeader(
    container: HTMLElement,
    queryElement: HTMLElement,
    closeButton: HTMLElement,
    query: string = ''
  ): void {
    const styles = this.searchResult(query);
    StyleBuilder.apply(container, styles.container);
    StyleBuilder.apply(queryElement, styles.queryText);
    StyleBuilder.apply(closeButton, styles.closeButton);
    if (queryElement.textContent !== query) {
      queryElement.textContent = query;
    }
  }
}
