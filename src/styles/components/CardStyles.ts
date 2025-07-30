import { StyleBuilder, StyleObject } from '../utils/StyleBuilder';

/**
 * Card-specific styling utilities
 * Consolidates card patterns from OrganizationCard, AdviceGrid, product cards
 */
export class CardStyles {
  /**
   * Organization card styles (for search results and lists)
   */
  static organization(isAdvertiser: boolean = false): {
    container: StyleObject;
    image: StyleObject;
    content: StyleObject;
    title: StyleObject;
    subtitle: StyleObject;
    rating: StyleObject;
    badge?: StyleObject;
  } {
    return {
      container: {
        ...StyleBuilder.card('organization'),
        ...(isAdvertiser && {
          border: '1px solid #1BA136',
          boxShadow: '0 2px 12px rgba(27, 161, 54, 0.15)',
        }),
      },
      image: {
        width: '60px',
        height: '60px',
        borderRadius: '8px',
        objectFit: 'cover',
        flexShrink: '0',
        marginRight: '12px',
      },
      content: {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      },
      title: {
        ...StyleBuilder.text('subtitle'),
        fontWeight: '600',
        marginBottom: '2px',
      },
      subtitle: {
        ...StyleBuilder.text('body'),
        color: '#898989',
        marginBottom: '4px',
      },
      rating: {
        ...StyleBuilder.text('caption'),
        color: '#1BA136',
        fontWeight: '500',
      },
      ...(isAdvertiser && {
        badge: {
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#1BA136',
          color: '#FFF',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '500',
        },
      }),
    };
  }

  /**
   * Product card styles
   */
  static product(): {
    container: StyleObject;
    image: StyleObject;
    content: StyleObject;
    title: StyleObject;
    price: StyleObject;
    badge: StyleObject;
    addButton: StyleObject;
    quantityControls: StyleObject;
  } {
    return {
      container: {
        ...StyleBuilder.card('product'),
        width: '160px',
        height: '220px',
      },
      image: {
        width: '100%',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '8px',
        marginBottom: '8px',
      },
      content: {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
      title: {
        ...StyleBuilder.text('body'),
        fontWeight: '500',
        lineHeight: '16px',
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: '2',
        WebkitBoxOrient: 'vertical',
      },
      price: {
        ...StyleBuilder.text('subtitle'),
        fontWeight: '600',
        color: '#141414',
        marginBottom: '8px',
      },
      badge: {
        position: 'absolute',
        top: '8px',
        left: '8px',
        background: 'rgba(27, 161, 54, 0.9)',
        color: '#FFF',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: '500',
      },
      addButton: {
        ...StyleBuilder.button('primary'),
        height: '32px',
        fontSize: '12px',
        padding: '8px 12px',
      },
      quantityControls: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '32px',
        background: '#F5F5F5',
        borderRadius: '6px',
        padding: '4px',
      },
    };
  }

  /**
   * Advice grid card styles
   */
  static advice(size: 'small' | 'medium' | 'large' = 'medium'): {
    container: StyleObject;
    image: StyleObject;
    content: StyleObject;
    title: StyleObject;
    description: StyleObject;
  } {
    const sizeMap = {
      small: { width: '156px', height: '120px' },
      medium: { width: '156px', height: '160px' },
      large: { width: '100%', height: '180px' },
    };

    return {
      container: {
        ...StyleBuilder.card('advice'),
        ...sizeMap[size],
        overflow: 'hidden',
      },
      image: {
        width: '100%',
        height: '80px',
        objectFit: 'cover',
        marginBottom: '12px',
      },
      content: {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
      },
      title: {
        ...StyleBuilder.text('body'),
        fontWeight: '600',
        marginBottom: '4px',
        lineHeight: '18px',
      },
      description: {
        ...StyleBuilder.text('caption'),
        lineHeight: '14px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: size === 'large' ? '3' : '2',
        WebkitBoxOrient: 'vertical',
      },
    };
  }

  /**
   * Promo banner card styles
   */
  static promoBanner(): {
    container: StyleObject;
    logoContainer: StyleObject;
    logo: StyleObject;
    textContent: StyleObject;
    title: StyleObject;
    subtitle: StyleObject;
    cta: StyleObject;
    footer: StyleObject;
  } {
    return {
      container: {
        ...StyleBuilder.card('promo'),
        height: '136px',
        marginTop: '16px',
      },
      logoContainer: {
        display: 'flex',
        height: '136px',
        padding: '12px 0 12px 16px',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '10px',
        position: 'relative',
      },
      logo: {
        width: '64px',
        height: '64px',
        borderRadius: '32px',
        border: '0.5px solid rgba(137, 137, 137, 0.30)',
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
        position: 'relative',
      },
      textContent: {
        display: 'flex',
        padding: '0 16px 0 12px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: '1 0 0',
        position: 'relative',
      },
      title: {
        ...StyleBuilder.text('subtitle'),
        fontWeight: '600',
        marginTop: '14px',
        marginBottom: '4px',
      },
      subtitle: {
        ...StyleBuilder.text('body'),
        color: '#141414',
        marginBottom: '6px',
      },
      cta: {
        ...StyleBuilder.text('body'),
        color: '#5A5A5A',
        fontWeight: '500',
        cursor: 'pointer',
      },
      footer: {
        ...StyleBuilder.text('caption'),
        color: '#B8B8B8',
        fontSize: '11px',
        lineHeight: '14px',
        padding: '7px 4px 1px 4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    };
  }

  /**
   * Apply organization card styles to DOM elements
   */
  static applyOrganizationCard(
    container: HTMLElement,
    image: HTMLElement,
    title: HTMLElement,
    subtitle: HTMLElement,
    isAdvertiser: boolean = false
  ): void {
    const styles = this.organization(isAdvertiser);
    StyleBuilder.apply(container, styles.container);
    StyleBuilder.apply(image, styles.image);
    StyleBuilder.apply(title, styles.title);
    StyleBuilder.apply(subtitle, styles.subtitle);
  }

  /**
   * Apply product card styles to DOM elements
   */
  static applyProductCard(
    container: HTMLElement,
    image: HTMLElement,
    title: HTMLElement,
    price: HTMLElement,
    button: HTMLElement
  ): void {
    const styles = this.product();
    StyleBuilder.apply(container, styles.container);
    StyleBuilder.apply(image, styles.image);
    StyleBuilder.apply(title, styles.title);
    StyleBuilder.apply(price, styles.price);
    StyleBuilder.apply(button, styles.addButton);
  }

  /**
   * Create hover effects for cards
   */
  static addHoverEffects(element: HTMLElement): void {
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'translateY(-2px)';
      element.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'translateY(0)';
      element.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    });
  }
}