/**
 * Shared BottomActionBar component for Shop, Cart, and Checkout screens
 * Provides consistent positioning and safe-area handling
 */

export interface BottomActionBarProps {
  /** Container element to append the action bar to */
  container: HTMLElement;
  /** CSS class name for the action bar */
  className?: string;
  /** Whether the bar should be visible */
  visible?: boolean;
}

export interface BottomActionBarContent {
  /** Left side content (e.g., cart info) */
  leftContent?: HTMLElement;
  /** Right side content (e.g., buttons) */
  rightContent?: HTMLElement;
  /** Full width content (e.g., single button) */
  fullWidthContent?: HTMLElement;
}

/**
 * Shared BottomActionBar component with consistent positioning and safe-area handling
 */
export class BottomActionBar {
  private element: HTMLElement;
  private contentContainer: HTMLElement;
  private props: BottomActionBarProps;

  constructor(props: BottomActionBarProps) {
    this.props = props;
    this.element = this.createElement();
    this.contentContainer = this.createContentContainer();
    this.setupLayout();
    
    if (props.container) {
      props.container.appendChild(this.element);
    }
  }

  /**
   * Create the main action bar element
   */
  private createElement(): HTMLElement {
    const actionBar = document.createElement('div');
    actionBar.className = this.props.className || 'shop-bottom-action-bar';
    
    // Ensure consistent positioning
    Object.assign(actionBar.style, {
      flexShrink: '0',
      backgroundColor: '#ffffff',
      borderTop: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08)',
      zIndex: '10',
    });

    return actionBar;
  }

  /**
   * Create the content container with proper padding and safe-area handling
   */
  private createContentContainer(): HTMLElement {
    const content = document.createElement('div');
    content.className = 'shop-action-bar-content';
    
    Object.assign(content.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '16px',
      paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', // iOS safe area
      minHeight: '72px', // Consistent minimum height
      boxSizing: 'border-box',
    });

    return content;
  }

  /**
   * Setup the layout structure
   */
  private setupLayout(): void {
    this.element.appendChild(this.contentContainer);
  }

  /**
   * Update the content of the action bar
   */
  setContent(content: BottomActionBarContent): void {
    // Clear existing content
    this.contentContainer.innerHTML = '';

    if (content.fullWidthContent) {
      // Single full-width element (e.g., checkout button)
      Object.assign(this.contentContainer.style, {
        justifyContent: 'center',
      });
      this.contentContainer.appendChild(content.fullWidthContent);
    } else {
      // Left and right content layout
      Object.assign(this.contentContainer.style, {
        justifyContent: 'space-between',
      });

      if (content.leftContent) {
        this.contentContainer.appendChild(content.leftContent);
      }

      if (content.rightContent) {
        this.contentContainer.appendChild(content.rightContent);
      }
    }
  }

  /**
   * Show the action bar
   */
  show(): void {
    this.element.style.display = 'block';
    this.props.visible = true;
  }

  /**
   * Hide the action bar completely
   */
  hide(): void {
    this.element.style.display = 'none';
    this.props.visible = false;
  }

  /**
   * Get the action bar element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Get the content container element
   */
  getContentContainer(): HTMLElement {
    return this.contentContainer;
  }

  /**
   * Check if the action bar is visible
   */
  isVisible(): boolean {
    return this.props.visible !== false;
  }

  /**
   * Destroy the action bar and clean up
   */
  destroy(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Update the action bar height calculation for scrollable content padding
   */
  getHeight(): number {
    return this.element.getBoundingClientRect().height;
  }

  /**
   * Create cart info content for Shop and Cart screens
   */
  static createCartInfo(itemCount: string, totalPrice: string): HTMLElement {
    const cartInfo = document.createElement('div');
    cartInfo.className = 'shop-cart-info';
    
    Object.assign(cartInfo.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    });

    // Item count
    const countElement = document.createElement('div');
    countElement.className = 'shop-cart-count';
    countElement.textContent = itemCount;
    cartInfo.appendChild(countElement);

    // Total price
    const totalElement = document.createElement('div');
    totalElement.className = 'shop-cart-total';
    totalElement.textContent = totalPrice;
    cartInfo.appendChild(totalElement);

    return cartInfo;
  }

  /**
   * Create action button for action bars
   */
  static createButton(text: string, onClick: () => void, style: 'primary' | 'secondary' = 'primary'): HTMLElement {
    const button = document.createElement('button');
    button.className = style === 'primary' ? 'shop-order-button' : 'shop-secondary-button';
    button.textContent = text;

    // Ensure consistent button styling
    if (style === 'primary') {
      Object.assign(button.style, {
        backgroundColor: '#8B5CF6',
        color: '#ffffff',
        minWidth: '120px',
      });
    }

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });

    return button;
  }
}