/**
 * Global Bottom Action Bar Overlay Service
 * Manages a single fixed overlay that sits above the bottomsheet
 * Always visible at viewport bottom when shown, regardless of sheet position
 */

export interface ActionBarConfig {
  /** Left side content (e.g., cart info) */
  leftContent?: HTMLElement;
  /** Right side content (e.g., buttons) */
  rightContent?: HTMLElement;
  /** Full width content (e.g., single button) */
  fullWidthContent?: HTMLElement;
  /** Custom CSS class for the bar */
  className?: string;
}

/**
 * Global singleton service for managing the bottom action bar overlay
 */
export class GlobalBottomActionBar {
  private static instance: GlobalBottomActionBar | null = null;
  private overlay: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;
  private isVisible: boolean = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): GlobalBottomActionBar {
    if (!GlobalBottomActionBar.instance) {
      GlobalBottomActionBar.instance = new GlobalBottomActionBar();
    }
    return GlobalBottomActionBar.instance;
  }

  /**
   * Initialize the global overlay (should be called once on app startup)
   */
  initialize(): void {
    if (this.overlay) {
      return; // Already initialized
    }

    this.createOverlay();
    this.attachToDOM();
  }

  /**
   * Show the action bar with given content
   */
  show(config: ActionBarConfig): void {
    if (!this.overlay || !this.contentContainer) {
      console.warn('GlobalBottomActionBar not initialized');
      return;
    }

    // Update content
    this.updateContent(config);

    // Show the overlay
    this.overlay.style.display = 'block';
    this.isVisible = true;

    // Apply custom class if provided
    if (config.className) {
      this.overlay.className = `global-bottom-action-bar ${config.className}`;
    } else {
      this.overlay.className = 'global-bottom-action-bar';
    }
  }

  /**
   * Hide the action bar completely
   */
  hide(): void {
    if (!this.overlay) {
      return;
    }

    this.overlay.style.display = 'none';
    this.isVisible = false;

    // Clear content
    if (this.contentContainer) {
      this.contentContainer.innerHTML = '';
    }
  }

  /**
   * Check if the action bar is currently visible
   */
  getVisibility(): boolean {
    return this.isVisible;
  }

  /**
   * Update content without changing visibility
   */
  updateContent(config: ActionBarConfig): void {
    if (!this.contentContainer) {
      return;
    }

    // Clear existing content
    this.contentContainer.innerHTML = '';

    if (config.fullWidthContent) {
      // Single full-width element (e.g., checkout button)
      Object.assign(this.contentContainer.style, {
        justifyContent: 'center',
      });
      this.contentContainer.appendChild(config.fullWidthContent);
    } else {
      // Left and right content layout
      Object.assign(this.contentContainer.style, {
        justifyContent: 'space-between',
      });

      if (config.leftContent) {
        this.contentContainer.appendChild(config.leftContent);
      }

      if (config.rightContent) {
        this.contentContainer.appendChild(config.rightContent);
      }
    }
  }

  /**
   * Destroy the overlay (cleanup)
   */
  destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    this.contentContainer = null;
    this.isVisible = false;
    GlobalBottomActionBar.instance = null;
  }

  /**
   * Create the overlay DOM element
   */
  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'global-bottom-action-bar';

    // Fixed positioning above bottomsheet
    Object.assign(this.overlay.style, {
      position: 'fixed',
      left: '0',
      right: '0',
      bottom: '0',
      zIndex: '1000', // Above bottomsheet (500-999), below modals (1000+)
      backgroundColor: '#ffffff',
      borderTop: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08)',
      display: 'none', // Hidden by default
      pointerEvents: 'auto', // Allow interaction with bar content
    });

    // Create content container
    this.contentContainer = document.createElement('div');
    Object.assign(this.contentContainer.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '16px',
      paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', // Safe area support
      minHeight: '72px',
      boxSizing: 'border-box',
      width: '100%',
    });

    this.overlay.appendChild(this.contentContainer);
  }

  /**
   * Attach overlay to document body
   */
  private attachToDOM(): void {
    if (this.overlay) {
      document.body.appendChild(this.overlay);
    }
  }

  /**
   * Utility method: Create cart info content
   */
  static createCartInfo(itemCount: string, totalPrice: string): HTMLElement {
    const cartInfo = document.createElement('div');
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
   * Utility method: Create action button
   */
  static createButton(
    text: string,
    onClick: () => void,
    style: 'primary' | 'secondary' = 'primary'
  ): HTMLElement {
    const button = document.createElement('button');
    button.className = style === 'primary' ? 'shop-order-button' : 'shop-secondary-button';
    button.textContent = text;

    // Ensure consistent button styling
    if (style === 'primary') {
      Object.assign(button.style, {
        backgroundColor: '#8B5CF6',
        color: '#ffffff',
        minWidth: '120px',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'SB Sans Text',
      });
    }

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });

    return button;
  }
}

// Export convenience instance
export const globalBottomActionBar = GlobalBottomActionBar.getInstance();
