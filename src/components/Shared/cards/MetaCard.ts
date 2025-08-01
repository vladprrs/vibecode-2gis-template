import { BaseCard, BaseCardConfig, CardVariant } from './BaseCard';

/**
 * Meta card configuration for advice grid style components
 */
export interface MetaCardConfig extends BaseCardConfig {
  /** Card title */
  title: string;
  /** Card subtitle/count */
  subtitle: string;
  /** Card icon/emoji */
  icon: string;
  /** Card type for different layouts */
  cardType?: 'small' | 'large' | 'cover';
  /** Background image URL for cover cards */
  backgroundImage?: string;
  /** Text color for cover cards */
  textColor?: string;
  /** Enable gradient overlay for cover cards */
  enableGradient?: boolean;
}

/**
 * Meta card component
 * Used for advice grid items, category cards, and other meta information cards
 */
export class MetaCard extends BaseCard {
  private metaConfig: MetaCardConfig;

  constructor(config: MetaCardConfig) {
    super({
      ...config,
      variant: config.cardType === 'cover' ? CardVariant.FLAT : CardVariant.STANDARD,
      clickable: true,
      enableHover: true,
    });
    this.metaConfig = { cardType: 'small', textColor: '#141414', enableGradient: true, ...config };
  }

  protected createCardContent(): void {
    switch (this.metaConfig.cardType) {
      case 'large':
        this.createLargeCoverCard();
        break;
      case 'cover':
        this.createSmallCoverCard();
        break;
      default:
        this.createMetaItem();
        break;
    }
  }

  /**
   * Create small meta item (default style)
   */
  private createMetaItem(): void {
    // Setup container styles for meta item
    Object.assign(this.element.style, {
      padding: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid rgba(137, 137, 137, 0.15)',
      borderRadius: '12px',
    });

    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    });

    // Icon
    const iconElement = document.createElement('div');
    Object.assign(iconElement.style, {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      flexShrink: '0',
    });
    iconElement.textContent = this.metaConfig.icon;
    container.appendChild(iconElement);

    // Text content
    const textContent = document.createElement('div');
    Object.assign(textContent.style, {
      flex: '1',
      minWidth: '0',
    });

    // Title
    const titleElement = document.createElement('div');
    Object.assign(titleElement.style, {
      fontSize: '15px',
      fontWeight: '500',
      lineHeight: '20px',
      color: this.metaConfig.textColor,
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      marginBottom: '2px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
    titleElement.textContent = this.metaConfig.title;
    textContent.appendChild(titleElement);

    // Subtitle
    const subtitleElement = document.createElement('div');
    Object.assign(subtitleElement.style, {
      fontSize: '13px',
      fontWeight: '400',
      lineHeight: '16px',
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
    subtitleElement.textContent = this.metaConfig.subtitle;
    textContent.appendChild(subtitleElement);

    container.appendChild(textContent);
    this.contentContainer.appendChild(container);
  }

  /**
   * Create large cover card
   */
  private createLargeCoverCard(): void {
    // Setup container styles for large cover card
    Object.assign(this.element.style, {
      height: '177px',
      backgroundColor: this.metaConfig.backgroundImage ? 'transparent' : '#8B5CF6',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-end',
      padding: '16px',
    });

    // Background image if provided
    if (this.metaConfig.backgroundImage) {
      Object.assign(this.element.style, {
        backgroundImage: `url(${this.metaConfig.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      });
    }

    // Gradient overlay if enabled
    if (this.metaConfig.enableGradient) {
      const overlay = document.createElement('div');
      Object.assign(overlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)',
        pointerEvents: 'none',
      });
      this.element.appendChild(overlay);
    }

    // Content container
    const content = document.createElement('div');
    Object.assign(content.style, {
      position: 'relative',
      zIndex: '1',
      color: this.metaConfig.textColor || '#ffffff',
    });

    // Icon
    const iconElement = document.createElement('div');
    Object.assign(iconElement.style, {
      fontSize: '24px',
      marginBottom: '8px',
    });
    iconElement.textContent = this.metaConfig.icon;
    content.appendChild(iconElement);

    // Title
    const titleElement = document.createElement('h3');
    Object.assign(titleElement.style, {
      margin: '0 0 4px 0',
      fontSize: '17px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.43px',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
    });
    titleElement.textContent = this.metaConfig.title;
    content.appendChild(titleElement);

    // Subtitle
    const subtitleElement = document.createElement('p');
    Object.assign(subtitleElement.style, {
      margin: '0',
      fontSize: '13px',
      fontWeight: '400',
      lineHeight: '16px',
      opacity: '0.8',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
    });
    subtitleElement.textContent = this.metaConfig.subtitle;
    content.appendChild(subtitleElement);

    this.element.appendChild(content);
  }

  /**
   * Create small cover card
   */
  private createSmallCoverCard(): void {
    // Setup container styles for small cover card
    Object.assign(this.element.style, {
      height: '95px',
      backgroundColor: this.metaConfig.backgroundImage ? 'transparent' : '#10B981',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-end',
      padding: '12px',
    });

    // Background image if provided
    if (this.metaConfig.backgroundImage) {
      Object.assign(this.element.style, {
        backgroundImage: `url(${this.metaConfig.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      });
    }

    // Gradient overlay if enabled
    if (this.metaConfig.enableGradient) {
      const overlay = document.createElement('div');
      Object.assign(overlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%)',
        pointerEvents: 'none',
      });
      this.element.appendChild(overlay);
    }

    // Content container
    const content = document.createElement('div');
    Object.assign(content.style, {
      position: 'relative',
      zIndex: '1',
      color: this.metaConfig.textColor || '#ffffff',
    });

    // Icon
    const iconElement = document.createElement('div');
    Object.assign(iconElement.style, {
      fontSize: '20px',
      marginBottom: '4px',
    });
    iconElement.textContent = this.metaConfig.icon;
    content.appendChild(iconElement);

    // Title
    const titleElement = document.createElement('h4');
    Object.assign(titleElement.style, {
      margin: '0 0 2px 0',
      fontSize: '15px',
      fontWeight: '600',
      lineHeight: '20px',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
    });
    titleElement.textContent = this.metaConfig.title;
    content.appendChild(titleElement);

    // Subtitle
    const subtitleElement = document.createElement('p');
    Object.assign(subtitleElement.style, {
      margin: '0',
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '15px',
      opacity: '0.8',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
    });
    subtitleElement.textContent = this.metaConfig.subtitle;
    content.appendChild(subtitleElement);

    this.element.appendChild(content);
  }

  /**
   * Update meta card configuration
   */
  public updateMetaConfig(newConfig: Partial<MetaCardConfig>): void {
    this.metaConfig = { ...this.metaConfig, ...newConfig };
    this.updateConfig(newConfig);
  }

  /**
   * Update card icon
   */
  public setIcon(icon: string): void {
    this.metaConfig.icon = icon;
    this.createContent();
  }

  /**
   * Update card title
   */
  public setTitle(title: string): void {
    this.metaConfig.title = title;
    this.createContent();
  }

  /**
   * Update card subtitle
   */
  public setSubtitle(subtitle: string): void {
    this.metaConfig.subtitle = subtitle;
    this.createContent();
  }

  /**
   * Update background image for cover cards
   */
  public setBackgroundImage(imageUrl: string): void {
    this.metaConfig.backgroundImage = imageUrl;
    this.createContent();
  }
}
