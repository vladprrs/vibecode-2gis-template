import { BaseCard, BaseCardConfig, CardSize, CardVariant } from './BaseCard';

/**
 * Content card configuration
 */
export interface ContentCardConfig extends BaseCardConfig {
  /** Card title */
  title: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card description */
  description?: string;
  /** Card image URL */
  imageUrl?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Card icon */
  icon?: string;
  /** Badge text */
  badge?: string;
  /** Badge color */
  badgeColor?: string;
  /** Card actions */
  actions?: Array<{ label: string; onClick: () => void; primary?: boolean }>;
}

/**
 * Content card component
 * General-purpose card for displaying content with title, description, image, and actions
 */
export class ContentCard extends BaseCard {
  private contentConfig: ContentCardConfig;

  constructor(config: ContentCardConfig) {
    super(config);
    this.contentConfig = config;
  }

  protected createCardContent(): void {
    // Create image if provided
    if (this.contentConfig.imageUrl) {
      const image = this.createImage(
        this.contentConfig.imageUrl,
        this.contentConfig.imageAlt || this.contentConfig.title
      );
      this.contentContainer.appendChild(image);
    }

    // Create header with title and subtitle
    const header = this.createHeader(
      this.contentConfig.title,
      this.contentConfig.subtitle,
      this.contentConfig.icon
    );
    this.contentContainer.appendChild(header);

    // Create badge if provided
    if (this.contentConfig.badge) {
      const badge = this.createBadge(this.contentConfig.badge, this.contentConfig.badgeColor);
      Object.assign(badge.style, {
        marginBottom: '8px',
      });
      this.contentContainer.appendChild(badge);
    }

    // Create description if provided
    if (this.contentConfig.description) {
      const description = document.createElement('p');
      Object.assign(description.style, {
        margin: '0 0 12px 0',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '20px',
        color: '#6B7280',
        fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      });
      description.textContent = this.contentConfig.description;
      this.contentContainer.appendChild(description);
    }

    // Create actions if provided
    if (this.contentConfig.actions && this.contentConfig.actions.length > 0) {
      const footer = this.createFooter(this.contentConfig.actions);
      this.contentContainer.appendChild(footer);
    }
  }

  /**
   * Update content card configuration
   */
  public updateContentConfig(newConfig: Partial<ContentCardConfig>): void {
    this.contentConfig = { ...this.contentConfig, ...newConfig };
    this.updateConfig(newConfig);
  }

  /**
   * Update card title
   */
  public setTitle(title: string): void {
    this.contentConfig.title = title;
    this.createContent();
  }

  /**
   * Update card description
   */
  public setDescription(description: string): void {
    this.contentConfig.description = description;
    this.createContent();
  }

  /**
   * Update card image
   */
  public setImage(imageUrl: string, imageAlt?: string): void {
    this.contentConfig.imageUrl = imageUrl;
    this.contentConfig.imageAlt = imageAlt;
    this.createContent();
  }

  /**
   * Update card badge
   */
  public setBadge(badge: string, color?: string): void {
    this.contentConfig.badge = badge;
    this.contentConfig.badgeColor = color;
    this.createContent();
  }
}
