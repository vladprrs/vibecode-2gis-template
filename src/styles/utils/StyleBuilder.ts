/**
 * CSS-in-JS style builder utility
 * Centralizes common styling patterns to eliminate duplication
 */

export interface StyleObject {
  [key: string]: string | number;
}

/**
 * Main StyleBuilder class for creating consistent CSS-in-JS styles
 */
export class StyleBuilder {
  /**
   * Create a CSS text string from style object
   */
  static toCSSText(styles: StyleObject): string {
    return Object.entries(styles)
      .map(([property, value]) => {
        // Convert camelCase to kebab-case
        const cssProperty = property.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
        return `${cssProperty}: ${value}`;
      })
      .join(';\n      ') + ';';
  }

  /**
   * Container styles for different layout types
   */
  static container(variant: 'dashboard' | 'bottomsheet' | 'content' | 'scrollable'): StyleObject {
    const base: StyleObject = {
      position: 'relative',
      width: '100%',
    };

    switch (variant) {
      case 'dashboard':
        return {
          ...base,
          width: '375px',
          maxWidth: '100%',
          height: '100vh',
          background: '#F1F1F1',
          overflow: 'hidden',
          margin: '0 auto',
        };

      case 'bottomsheet':
        return {
          ...base,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderRadius: '16px 16px 0 0',
          background: '#FFF',
          position: 'absolute',
          left: '0',
          bottom: '0',
          transformOrigin: 'top center',
          transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
          zIndex: '1000',
        };

      case 'content':
        return {
          ...base,
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '0',
          overflow: 'hidden',
        };

      case 'scrollable':
        return {
          ...base,
          flex: '1',
          overflowY: 'auto',
          backgroundColor: '#F1F1F1',
        };

      default:
        return base;
    }
  }

  /**
   * Header styles for different screen types
   */
  static header(variant: 'dashboard' | 'search' | 'suggest' | 'organization'): StyleObject {
    const base: StyleObject = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignSelf: 'stretch',
      borderRadius: '16px 16px 0 0',
      position: 'relative',
    };

    switch (variant) {
      case 'dashboard':
        return {
          ...base,
          padding: '16px 0 8px 0',
          background: '#FFF',
        };

      case 'search':
      case 'suggest':
        return {
          ...base,
          padding: '16px 0 8px 0',
          background: 'rgba(255, 255, 255, 0.70)',
          backdropFilter: 'blur(20px)',
        };

      case 'organization':
        return {
          ...base,
          padding: '0',
          background: '#FFF',
        };

      default:
        return base;
    }
  }

  /**
   * Drag handle styles
   */
  static dragHandle(): StyleObject {
    return {
      display: 'flex',
      height: '20px',
      paddingBottom: '6px',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      alignSelf: 'stretch',
      position: 'relative',
    };
  }

  /**
   * Drag handle bar styles
   */
  static dragHandleBar(): StyleObject {
    return {
      width: '40px',
      height: '4px',
      flexShrink: '0',
      borderRadius: '6px',
      background: 'rgba(137, 137, 137, 0.25)',
      cursor: 'grab',
    };
  }

  /**
   * Button styles for different variants
   */
  static button(variant: 'primary' | 'secondary' | 'close' | 'icon'): StyleObject {
    const base: StyleObject = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    };

    switch (variant) {
      case 'primary':
        return {
          ...base,
          padding: '12px 24px',
          borderRadius: '8px',
          background: '#1BA136',
          color: '#FFF',
          fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
          fontWeight: '500',
          fontSize: '15px',
          lineHeight: '20px',
        };

      case 'secondary':
        return {
          ...base,
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(20, 20, 20, 0.06)',
          color: '#141414',
          fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
          fontWeight: '500',
          fontSize: '15px',
          lineHeight: '20px',
        };

      case 'close':
        return {
          ...base,
          padding: '8px',
          borderRadius: '8px',
          background: 'rgba(20, 20, 20, 0.06)',
          width: '40px',
          height: '40px',
        };

      case 'icon':
        return {
          ...base,
          width: '24px',
          height: '24px',
          background: 'transparent',
        };

      default:
        return base;
    }
  }

  /**
   * Card styles for different types
   */
  static card(variant: 'organization' | 'product' | 'advice' | 'promo'): StyleObject {
    const base: StyleObject = {
      display: 'flex',
      borderRadius: '12px',
      background: '#FFF',
      position: 'relative',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    };

    switch (variant) {
      case 'organization':
        return {
          ...base,
          flexDirection: 'column',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        };

      case 'product':
        return {
          ...base,
          flexDirection: 'column',
          padding: '12px',
          border: '0.5px solid rgba(137, 137, 137, 0.30)',
        };

      case 'advice':
        return {
          ...base,
          flexDirection: 'column',
          padding: '16px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
        };

      case 'promo':
        return {
          ...base,
          alignItems: 'flex-start',
          border: '0.5px solid rgba(137, 137, 137, 0.30)',
          overflow: 'hidden',
        };

      default:
        return base;
    }
  }

  /**
   * Form field styles
   */
  static formField(): StyleObject {
    return {
      display: 'flex',
      height: '40px',
      padding: '10px 8px',
      alignItems: 'center',
      alignSelf: 'stretch',
      borderRadius: '8px',
      background: 'rgba(20, 20, 20, 0.09)',
      border: 'none',
      outline: 'none',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      lineHeight: '20px',
      letterSpacing: '-0.3px',
    };
  }

  /**
   * Text styles for different hierarchies
   */
  static text(variant: 'title' | 'subtitle' | 'body' | 'caption'): StyleObject {
    const base: StyleObject = {
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      margin: '0',
    };

    switch (variant) {
      case 'title':
        return {
          ...base,
          fontWeight: '600',
          fontSize: '19px',
          lineHeight: '24px',
          color: '#141414',
        };

      case 'subtitle':
        return {
          ...base,
          fontWeight: '500',
          fontSize: '16px',
          lineHeight: '20px',
          color: '#141414',
        };

      case 'body':
        return {
          ...base,
          fontWeight: '400',
          fontSize: '14px',
          lineHeight: '18px',
          color: '#141414',
        };

      case 'caption':
        return {
          ...base,
          fontWeight: '400',
          fontSize: '12px',
          lineHeight: '16px',
          color: '#898989',
        };

      default:
        return base;
    }
  }

  /**
   * Layout spacing utilities
   */
  static spacing(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): StyleObject {
    const spacingMap = {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    };

    return {
      padding: spacingMap[size],
    };
  }

  /**
   * Flexbox utilities
   */
  static flex(
    direction: 'row' | 'column' = 'row',
    justify: 'flex-start' | 'center' | 'flex-end' | 'space-between' = 'flex-start',
    align: 'flex-start' | 'center' | 'flex-end' | 'stretch' = 'flex-start'
  ): StyleObject {
    return {
      display: 'flex',
      flexDirection: direction,
      justifyContent: justify,
      alignItems: align,
    };
  }

  /**
   * Position utilities
   */
  static position(
    type: 'relative' | 'absolute' | 'fixed',
    coords?: { top?: string; left?: string; right?: string; bottom?: string }
  ): StyleObject {
    const base: StyleObject = {
      position: type,
    };

    if (coords) {
      Object.assign(base, coords);
    }

    return base;
  }

  /**
   * Apply styles to an element using cssText
   */
  static apply(element: HTMLElement, styles: StyleObject): void {
    element.style.cssText = this.toCSSText(styles);
  }

  /**
   * Merge multiple style objects
   */
  static merge(...styles: StyleObject[]): StyleObject {
    return Object.assign({}, ...styles);
  }
}