import { StyleBuilder, StyleObject } from '../utils/StyleBuilder';

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
   * Common search icon SVG
   */
  static getSearchIconSVG(): string {
    return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="#898989" stroke-width="1.5"/>
      <path d="m21 21-4.35-4.35" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  /**
   * Common close icon SVG
   */
  static getCloseIconSVG(): string {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
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