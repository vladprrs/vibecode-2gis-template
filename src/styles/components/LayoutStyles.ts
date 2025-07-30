import { StyleBuilder, StyleObject } from '../utils/StyleBuilder';

/**
 * Layout-specific styling utilities
 * Consolidates layout patterns from screens and components
 */
export class LayoutStyles {
  /**
   * Bottomsheet layout styles for different configurations
   */
  static bottomsheet(state: 'small' | 'default' | 'fullscreen' | 'fullscreen_scroll'): {
    container: StyleObject;
    dragArea: StyleObject;
    content: StyleObject;
    actionBar?: StyleObject;
  } {
    const heightMap = {
      small: '20vh',
      default: '55vh',
      fullscreen: '90vh',
      fullscreen_scroll: '100vh',
    };

    return {
      container: {
        ...StyleBuilder.container('bottomsheet'),
        height: heightMap[state],
        ...(state === 'fullscreen_scroll' && {
          height: '100vh',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }),
      },
      dragArea: {
        ...StyleBuilder.dragHandle(),
        paddingTop: '16px',
        paddingBottom: '6px',
        flexShrink: '0',
      },
      content: {
        ...StyleBuilder.container('content'),
        ...(state === 'fullscreen_scroll' && {
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 80px)',
        }),
      },
      ...(state !== 'small' && {
        actionBar: {
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          zIndex: '1001',
          background: '#FFF',
          borderRadius: '16px 16px 0 0',
          padding: '16px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        },
      }),
    };
  }

  /**
   * Grid layout styles for different content types
   */
  static grid(
    variant: 'products' | 'advice' | 'stories' | 'categories',
    columns?: number
  ): StyleObject {
    const base: StyleObject = {
      display: 'grid',
      gap: '12px',
      width: '100%',
    };

    switch (variant) {
      case 'products':
        return {
          ...base,
          gridTemplateColumns: `repeat(${columns || 2}, 1fr)`,
          padding: '16px',
        };

      case 'advice':
        return {
          ...base,
          gridTemplateColumns: 'repeat(auto-fill, minmax(156px, 1fr))',
          gridAutoRows: 'min-content',
          padding: '0 16px',
        };

      case 'stories':
        return {
          ...base,
          gridTemplateColumns: 'repeat(auto-fill, 80px)',
          gridAutoRows: '100px',
          gap: '12px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          padding: '0 16px',
        };

      case 'categories':
        return {
          ...base,
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          padding: '16px',
        };

      default:
        return base;
    }
  }

  /**
   * Flexbox layouts for common patterns
   */
  static flexLayout(
    variant: 'header' | 'navigation' | 'action-row' | 'form-section' | 'card-content'
  ): StyleObject {
    const base = StyleBuilder.flex();

    switch (variant) {
      case 'header':
        return {
          ...base,
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          minHeight: '60px',
        };

      case 'navigation':
        return {
          ...base,
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '12px 0',
          borderTop: '1px solid rgba(137, 137, 137, 0.2)',
        };

      case 'action-row':
        return {
          ...base,
          gap: '12px',
          padding: '16px',
        };

      case 'form-section':
        return {
          ...StyleBuilder.flex('column'),
          gap: '16px',
          padding: '20px 16px',
        };

      case 'card-content':
        return {
          ...StyleBuilder.flex('column'),
          gap: '8px',
          flex: '1',
        };

      default:
        return base;
    }
  }

  /**
   * Scrollable content layouts
   */
  static scrollable(
    variant: 'vertical' | 'horizontal' | 'both' = 'vertical'
  ): StyleObject {
    const base: StyleObject = {
      ...StyleBuilder.container('scrollable'),
    };

    switch (variant) {
      case 'vertical':
        return {
          ...base,
          overflowY: 'auto',
          overflowX: 'hidden',
        };

      case 'horizontal':
        return {
          ...base,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'row',
        };

      case 'both':
        return {
          ...base,
          overflow: 'auto',
        };

      default:
        return base;
    }
  }

  /**
   * Section layouts with consistent spacing
   */
  static section(hasHeader: boolean = true): {
    container: StyleObject;
    header?: StyleObject;
    content: StyleObject;
  } {
    return {
      container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        marginBottom: '24px',
      },
      ...(hasHeader && {
        header: {
          ...StyleBuilder.text('title'),
          marginBottom: '12px',
          paddingLeft: '16px',
          paddingRight: '16px',
        },
      }),
      content: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      },
    };
  }

  /**
   * Filter bar layout
   */
  static filterBar(): {
    container: StyleObject;
    scrollContainer: StyleObject;
    filterButton: StyleObject;
    activeFilterButton: StyleObject;
    counter: StyleObject;
  } {
    return {
      container: {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '999',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(137, 137, 137, 0.2)',
        padding: '12px 0',
      },
      scrollContainer: {
        display: 'flex',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        gap: '8px',
        padding: '0 16px',
      },
      filterButton: {
        ...StyleBuilder.button('secondary'),
        flexShrink: '0',
        height: '32px',
        padding: '6px 12px',
        fontSize: '14px',
      },
      activeFilterButton: {
        ...StyleBuilder.button('secondary'),
        flexShrink: '0',
        height: '32px',
        padding: '6px 12px',
        fontSize: '14px',
        background: '#1BA136',
        color: '#FFF',
      },
      counter: {
        display: 'flex',
        width: '16px',
        height: '16px',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px',
        background: '#1BA136',
        color: '#FFF',
        fontSize: '11px',
        fontWeight: '500',
        marginRight: '4px',
      },
    };
  }

  /**
   * Apply bottomsheet layout to DOM elements
   */
  static applyBottomsheetLayout(
    container: HTMLElement,
    dragArea: HTMLElement,
    content: HTMLElement,
    state: 'small' | 'default' | 'fullscreen' | 'fullscreen_scroll'
  ): void {
    const styles = this.bottomsheet(state);
    StyleBuilder.apply(container, styles.container);
    StyleBuilder.apply(dragArea, styles.dragArea);
    StyleBuilder.apply(content, styles.content);
  }

  /**
   * Apply grid layout to container
   */
  static applyGrid(
    container: HTMLElement,
    variant: 'products' | 'advice' | 'stories' | 'categories',
    columns?: number
  ): void {
    const styles = this.grid(variant, columns);
    StyleBuilder.apply(container, styles);
  }

  /**
   * Create responsive breakpoints
   */
  static responsive(
    mobile: StyleObject,
    tablet?: StyleObject,
    desktop?: StyleObject
  ): StyleObject {
    // For now, return mobile styles
    // In a full implementation, this would handle media queries
    return mobile;
  }

  /**
   * Safe area utilities for different devices
   */
  static safeArea(position: 'top' | 'bottom' | 'both' = 'bottom'): StyleObject {
    const styles: StyleObject = {};

    if (position === 'top' || position === 'both') {
      styles.paddingTop = 'env(safe-area-inset-top)';
    }

    if (position === 'bottom' || position === 'both') {
      styles.paddingBottom = 'env(safe-area-inset-bottom)';
    }

    return styles;
  }
}