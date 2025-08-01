/**
 * Card variants for different use cases
 */
export enum CardVariant {
  /** Standard card with border and white background */
  STANDARD = 'standard',
  /** Elevated card with shadow */
  ELEVATED = 'elevated',
  /** Filled card with background color */
  FILLED = 'filled',
  /** Outlined card with border only */
  OUTLINED = 'outlined',
  /** Flat card without border or shadow */
  FLAT = 'flat',
}

/**
 * Card sizes
 */
export enum CardSize {
  /** Small card - compact layout */
  SMALL = 'small',
  /** Medium card - standard layout */
  MEDIUM = 'medium',
  /** Large card - expanded layout */
  LARGE = 'large',
}

/**
 * Card configuration
 */
export interface BaseCardConfig {
  /** Card variant */
  variant?: CardVariant;
  /** Card size */
  size?: CardSize;
  /** CSS class */
  className?: string;
  /** Container element */
  container: HTMLElement;
  /** Enable hover effects */
  enableHover?: boolean;
  /** Enable click interaction */
  clickable?: boolean;
  /** Border radius */
  borderRadius?: string;
  /** Background color */
  backgroundColor?: string;
  /** Custom padding */
  padding?: string;
  /** Event callbacks */
  onClick?: () => void;
  onHover?: (isHovering: boolean) => void;
}

/**
 * Base card component
 * Provides consistent styling and behavior for all card types
 */
export abstract class BaseCard {
  protected element: HTMLElement;
  protected config: BaseCardConfig;
  protected contentContainer!: HTMLElement;

  constructor(config: BaseCardConfig) {
    this.config = {
      variant: CardVariant.STANDARD,
      size: CardSize.MEDIUM,
      enableHover: true,
      clickable: false,
      borderRadius: '12px',
      ...config,
    };
    this.element = config.container;
    this.initialize();
  }

  /**
   * Initialize the card
   */
  protected initialize(): void {
    this.setupElement();
    this.createContent();
    this.setupEventListeners();
  }

  /**
   * Setup base element styles
   */
  protected setupElement(): void {
    this.element.innerHTML = '';

    // Base styles
    Object.assign(this.element.style, {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      borderRadius: this.config.borderRadius,
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    });

    // Apply variant styles
    this.applyVariantStyles();

    // Apply size styles
    this.applySizeStyles();

    // Add custom class
    if (this.config.className) {
      this.element.className = this.config.className;
    }

    // Make clickable if needed
    if (this.config.clickable) {
      this.element.style.cursor = 'pointer';
    }
  }

  /**
   * Apply variant-specific styles
   */
  protected applyVariantStyles(): void {
    switch (this.config.variant) {
      case CardVariant.STANDARD:
        Object.assign(this.element.style, {
          backgroundColor: this.config.backgroundColor || '#ffffff',
          border: '1px solid #F0F0F0',
          boxShadow: 'none',
        });
        break;

      case CardVariant.ELEVATED:
        Object.assign(this.element.style, {
          backgroundColor: this.config.backgroundColor || '#ffffff',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        });
        break;

      case CardVariant.FILLED:
        Object.assign(this.element.style, {
          backgroundColor: this.config.backgroundColor || '#F9FAFB',
          border: 'none',
          boxShadow: 'none',
        });
        break;

      case CardVariant.OUTLINED:
        Object.assign(this.element.style, {
          backgroundColor: 'transparent',
          border: '1px solid #E5E7EB',
          boxShadow: 'none',
        });
        break;

      case CardVariant.FLAT:
        Object.assign(this.element.style, {
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
        });
        break;
    }
  }

  /**
   * Apply size-specific styles
   */
  protected applySizeStyles(): void {
    switch (this.config.size) {
      case CardSize.SMALL:
        this.element.style.padding = this.config.padding || '12px';
        break;
      case CardSize.MEDIUM:
        this.element.style.padding = this.config.padding || '16px';
        break;
      case CardSize.LARGE:
        this.element.style.padding = this.config.padding || '24px';
        break;
    }
  }

  /**
   * Create card content - implemented by subclasses
   */
  protected createContent(): void {
    this.contentContainer = document.createElement('div');
    Object.assign(this.contentContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      minHeight: '0',
    });
    this.element.appendChild(this.contentContainer);

    // Call abstract method for specific content
    this.createCardContent();
  }

  /**
   * Create specific card content - implemented by subclasses
   */
  protected abstract createCardContent(): void;

  /**
   * Setup event listeners
   */
  protected setupEventListeners(): void {
    // Click handler
    if (this.config.onClick) {
      this.element.addEventListener('click', this.config.onClick);
    }

    // Hover effects
    if (this.config.enableHover) {
      this.element.addEventListener('mouseenter', () => {
        this.onHoverStart();
        if (this.config.onHover) {
          this.config.onHover(true);
        }
      });

      this.element.addEventListener('mouseleave', () => {
        this.onHoverEnd();
        if (this.config.onHover) {
          this.config.onHover(false);
        }
      });
    }
  }

  /**
   * Handle hover start
   */
  protected onHoverStart(): void {
    if (this.config.clickable) {
      switch (this.config.variant) {
        case CardVariant.STANDARD:
        case CardVariant.OUTLINED:
          this.element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          this.element.style.transform = 'translateY(-2px)';
          break;
        case CardVariant.ELEVATED:
          this.element.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
          this.element.style.transform = 'translateY(-2px)';
          break;
        case CardVariant.FILLED:
          this.element.style.backgroundColor = '#F3F4F6';
          break;
      }
    }
  }

  /**
   * Handle hover end
   */
  protected onHoverEnd(): void {
    if (this.config.clickable) {
      this.element.style.transform = 'translateY(0)';

      switch (this.config.variant) {
        case CardVariant.STANDARD:
        case CardVariant.OUTLINED:
          this.element.style.boxShadow = 'none';
          break;
        case CardVariant.ELEVATED:
          this.element.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
          break;
        case CardVariant.FILLED:
          this.element.style.backgroundColor = this.config.backgroundColor || '#F9FAFB';
          break;
      }
    }
  }

  /**
   * Create a card header
   */
  protected createHeader(title: string, subtitle?: string, icon?: string): HTMLElement {
    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '12px',
    });

    // Icon (if provided)
    if (icon) {
      const iconElement = document.createElement('div');
      Object.assign(iconElement.style, {
        width: '24px',
        height: '24px',
        flexShrink: '0',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
      iconElement.textContent = icon;
      header.appendChild(iconElement);
    }

    // Text content
    const textContainer = document.createElement('div');
    Object.assign(textContainer.style, {
      flex: '1',
      minWidth: '0',
    });

    // Title
    const titleElement = document.createElement('h3');
    Object.assign(titleElement.style, {
      margin: '0 0 4px 0',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '20px',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
    titleElement.textContent = title;
    textContainer.appendChild(titleElement);

    // Subtitle (if provided)
    if (subtitle) {
      const subtitleElement = document.createElement('p');
      Object.assign(subtitleElement.style, {
        margin: '0',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '18px',
        color: '#898989',
        fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      });
      subtitleElement.textContent = subtitle;
      textContainer.appendChild(subtitleElement);
    }

    header.appendChild(textContainer);
    return header;
  }

  /**
   * Create a card image
   */
  protected createImage(src: string, alt: string, aspectRatio?: string): HTMLElement {
    const imageContainer = document.createElement('div');
    Object.assign(imageContainer.style, {
      position: 'relative',
      width: '100%',
      aspectRatio: aspectRatio || '16/9',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#F5F5F5',
      marginBottom: '12px',
    });

    const image = document.createElement('img');
    Object.assign(image.style, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    });
    image.src = src;
    image.alt = alt;
    imageContainer.appendChild(image);

    return imageContainer;
  }

  /**
   * Create a card footer with actions
   */
  protected createFooter(
    actions: Array<{ label: string; onClick: () => void; primary?: boolean }>
  ): HTMLElement {
    const footer = document.createElement('div');
    Object.assign(footer.style, {
      display: 'flex',
      gap: '8px',
      marginTop: 'auto',
      paddingTop: '12px',
    });

    actions.forEach(action => {
      const button = document.createElement('button');
      Object.assign(button.style, {
        padding: '8px 16px',
        borderRadius: '6px',
        border: action.primary ? 'none' : '1px solid #E5E7EB',
        backgroundColor: action.primary ? '#8B5CF6' : 'transparent',
        color: action.primary ? '#ffffff' : '#374151',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flex: actions.length === 1 ? '1' : 'auto',
      });

      button.textContent = action.label;
      button.addEventListener('click', e => {
        e.stopPropagation(); // Prevent card click event
        action.onClick();
      });

      // Hover effects
      button.addEventListener('mouseenter', () => {
        if (action.primary) {
          button.style.backgroundColor = '#7C3AED';
        } else {
          button.style.backgroundColor = '#F9FAFB';
        }
      });

      button.addEventListener('mouseleave', () => {
        if (action.primary) {
          button.style.backgroundColor = '#8B5CF6';
        } else {
          button.style.backgroundColor = 'transparent';
        }
      });

      footer.appendChild(button);
    });

    return footer;
  }

  /**
   * Create a badge element
   */
  protected createBadge(text: string, color: string = '#10B981'): HTMLElement {
    const badge = document.createElement('div');
    Object.assign(badge.style, {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: `${color}1A`, // 10% opacity
      color: color,
      fontSize: '12px',
      fontWeight: '500',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      whiteSpace: 'nowrap',
    });
    badge.textContent = text;
    return badge;
  }

  /**
   * Update card configuration
   */
  public updateConfig(newConfig: Partial<BaseCardConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setupElement();
    this.createContent();
  }

  /**
   * Destroy the card
   */
  public destroy(): void {
    this.element.innerHTML = '';
  }

  /**
   * Get the root element
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Get the content container
   */
  public getContentContainer(): HTMLElement {
    return this.contentContainer;
  }
}
