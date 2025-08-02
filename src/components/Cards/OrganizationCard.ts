import { Organization } from '../../types';
import {
  BaseCard,
  BaseCardConfig,
  CardSize as BaseCardSize,
  CardVariant,
} from '../Shared/cards/BaseCard';

/**
 * Organization card size mapping to BaseCard sizes
 */
export enum CardSize {
  /** Компактная карточка - только основная информация */
  COMPACT = 'compact',
  /** Стандартная карточка - с описанием */
  STANDARD = 'standard',
  /** Полная карточка - со всей информацией */
  FULL = 'full',
}

/**
 * Organization card configuration
 */
interface OrganizationCardInternalConfig extends Omit<BaseCardConfig, 'size'> {
  /** Данные организации */
  organization: Organization;
  /** Размер карточки (internal BaseCard size) */
  size?: BaseCardSize;
  /** Показывать ли фото */
  showPhoto?: boolean;
  /** Показывать ли рейтинг и отзывы */
  showRating?: boolean;
  /** Показывать ли расстояние */
  showDistance?: boolean;
  /** Показывать ли время работы */
  showWorkingHours?: boolean;
  /** Показывать ли категорию */
  showCategory?: boolean;
  /** Показывать ли описание */
  showDescription?: boolean;
  /** Обработчики событий */
  onOrganizationClick?: (organization: Organization) => void;
  onPhotoClick?: (organization: Organization) => void;
  onCallClick?: (organization: Organization) => void;
}

// Legacy props interface for backward compatibility
export interface OrganizationCardProps {
  /** Данные организации */
  organization: Organization;
  /** Размер карточки */
  size?: CardSize;
  /** Показывать ли фото */
  showPhoto?: boolean;
  /** Показывать ли рейтинг и отзывы */
  showRating?: boolean;
  /** Показывать ли расстояние */
  showDistance?: boolean;
  /** Показывать ли время работы */
  showWorkingHours?: boolean;
  /** Показывать ли категорию */
  showCategory?: boolean;
  /** Показывать ли описание */
  showDescription?: boolean;
  /** CSS класс */
  className?: string;
  /** Обработчики событий */
  onClick?: (organization: Organization) => void;
  onPhotoClick?: (organization: Organization) => void;
  onCallClick?: (organization: Organization) => void;
}

/**
 * Organization card component extending BaseCard
 * Eliminates duplication by reusing BaseCard's infrastructure
 */
export class OrganizationCard extends BaseCard {
  private organizationConfig: OrganizationCardInternalConfig;
  private photoElement?: HTMLElement;

  constructor(containerElement: HTMLElement, props: OrganizationCardProps) {
    // Map legacy props to new config
    const config: OrganizationCardInternalConfig = {
      container: containerElement,
      variant: CardVariant.ELEVATED,
      size: OrganizationCard.mapCardSize(props.size || CardSize.STANDARD),
      clickable: true,
      enableHover: true,
      className: props.className,
      onClick: () => props.onClick?.(props.organization),
      organization: props.organization,
      showPhoto: props.showPhoto ?? true,
      showRating: props.showRating ?? true,
      showDistance: props.showDistance ?? true,
      showWorkingHours: props.showWorkingHours ?? true,
      showCategory: props.showCategory ?? true,
      showDescription: props.showDescription ?? true,
      onOrganizationClick: props.onClick,
      onPhotoClick: props.onPhotoClick,
      onCallClick: props.onCallClick,
    };

    super(config);
    this.organizationConfig = config;
  }

  /**
   * Map OrganizationCard sizes to BaseCard sizes
   */
  private static mapCardSize(size: CardSize): BaseCardSize {
    switch (size) {
      case CardSize.COMPACT:
        return BaseCardSize.SMALL;
      case CardSize.STANDARD:
        return BaseCardSize.MEDIUM;
      case CardSize.FULL:
        return BaseCardSize.LARGE;
      default:
        return BaseCardSize.MEDIUM;
    }
  }

  /**
   * Get current card size in our CardSize enum
   */
  private getCurrentCardSize(): CardSize {
    switch (this.organizationConfig.size) {
      case BaseCardSize.SMALL:
        return CardSize.COMPACT;
      case BaseCardSize.LARGE:
        return CardSize.FULL;
      case BaseCardSize.MEDIUM:
      default:
        return CardSize.STANDARD;
    }
  }

  /**
   * Create organization-specific card content (implements BaseCard abstract method)
   */
  protected createCardContent(): void {
    const { organization } = this.organizationConfig;

    // Create photo if enabled
    if (this.organizationConfig.showPhoto) {
      this.createOrganizationPhoto();
    }

    // Organization title and category
    this.createOrganizationHeader();

    // Rating and reviews section
    if (this.organizationConfig.showRating && (organization.rating || organization.reviewsCount)) {
      this.createRatingSection();
    }

    // Address and distance
    this.createAddressSection();

    // Description (for larger cards)
    if (
      this.organizationConfig.showDescription &&
      organization.description &&
      this.getCurrentCardSize() !== CardSize.COMPACT
    ) {
      this.createDescriptionSection();
    }

    // Working hours (for full cards)
    if (
      this.organizationConfig.showWorkingHours &&
      organization.workingHours &&
      this.getCurrentCardSize() === CardSize.FULL
    ) {
      this.createWorkingHoursSection();
    }

    // Contact actions (for full cards)
    if (organization.phone && this.getCurrentCardSize() === CardSize.FULL) {
      this.createContactActions();
    }
  }

  /**
   * Create organization photo section
   */
  private createOrganizationPhoto(): void {
    const { organization } = this.organizationConfig;
    const photoHeight = this.getPhotoHeight();

    if (organization.photoUrl) {
      this.photoElement = this.createImage(
        organization.photoUrl,
        organization.name,
        `${photoHeight}/200`
      );
    } else {
      // Create placeholder for organizations without photos
      this.photoElement = document.createElement('div');
      Object.assign(this.photoElement.style, {
        height: photoHeight,
        backgroundColor: '#F5F5F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999999',
        marginBottom: '12px',
        borderRadius: '8px',
      });

      this.photoElement.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 26h24V10H4v16ZM6 6h20v2H6V6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M10 16h12M10 20h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    }

    // Add advertiser badge if needed
    if (organization.isAdvertiser && this.photoElement) {
      this.addAdvertiserBadge();
    }

    if (this.photoElement) {
      this.contentContainer.appendChild(this.photoElement);
    }
  }

  /**
   * Get photo height based on card size
   */
  private getPhotoHeight(): string {
    const currentSize = this.getCurrentCardSize();
    switch (currentSize) {
      case CardSize.COMPACT:
        return '80px';
      case CardSize.STANDARD:
        return '120px';
      case CardSize.FULL:
        return '160px';
      default:
        return '120px';
    }
  }

  /**
   * Create organization header with title and category
   */
  private createOrganizationHeader(): void {
    const { organization } = this.organizationConfig;

    // Use BaseCard's createHeader method
    const header = this.createHeader(
      organization.name,
      this.organizationConfig.showCategory ? organization.category : undefined
    );

    this.contentContainer.appendChild(header);
  }

  /**
   * Create rating and reviews section
   */
  private createRatingSection(): void {
    const { organization } = this.organizationConfig;

    const ratingContainer = document.createElement('div');
    Object.assign(ratingContainer.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
    });

    // Rating stars and number
    if (organization.rating) {
      const starsElement = this.createStars(organization.rating);
      ratingContainer.appendChild(starsElement);

      const ratingText = document.createElement('span');
      Object.assign(ratingText.style, {
        fontSize: '14px',
        fontWeight: '500',
        color: '#333333',
      });
      ratingText.textContent = organization.rating.toFixed(1);
      ratingContainer.appendChild(ratingText);
    }

    // Reviews count
    if (organization.reviewsCount) {
      const reviewsText = document.createElement('span');
      Object.assign(reviewsText.style, {
        fontSize: '14px',
        color: '#666666',
      });
      reviewsText.textContent = `${organization.reviewsCount} отзывов`;
      ratingContainer.appendChild(reviewsText);
    }

    this.contentContainer.appendChild(ratingContainer);
  }

  /**
   * Add advertiser badge to photo
   */
  private addAdvertiserBadge(): void {
    if (!this.photoElement) return;

    // Use BaseCard's createBadge method
    const badge = this.createBadge('Реклама', '#FF6D00');
    Object.assign(badge.style, {
      position: 'absolute',
      top: '8px',
      right: '8px',
    });

    this.photoElement.style.position = 'relative';
    this.photoElement.appendChild(badge);
  }

  /**
   * Create address section with location icon
   */
  private createAddressSection(): void {
    const { organization } = this.organizationConfig;

    const addressContainer = document.createElement('div');
    Object.assign(addressContainer.style, {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      marginBottom: '8px',
    });

    // Location icon
    const locationIcon = document.createElement('div');
    Object.assign(locationIcon.style, {
      width: '16px',
      height: '16px',
      marginTop: '2px',
      flexShrink: '0',
      color: '#666666',
    });

    locationIcon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 0C5.2 0 3 2.2 3 5c0 4.2 5 11 5 11s5-6.8 5-11c0-2.8-2.2-5-5-5Z" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="8" cy="5" r="2" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    `;

    // Address text with distance
    const addressText = document.createElement('div');
    Object.assign(addressText.style, {
      flex: '1',
      fontSize: '14px',
      color: '#666666',
      lineHeight: '1.4',
    });

    let addressContent = organization.address;
    if (this.organizationConfig.showDistance && organization.distance) {
      const distanceText =
        organization.distance < 1000
          ? `${organization.distance} м`
          : `${(organization.distance / 1000).toFixed(1)} км`;
      addressContent += ` • ${distanceText}`;
    }
    addressText.textContent = addressContent;

    addressContainer.appendChild(locationIcon);
    addressContainer.appendChild(addressText);
    this.contentContainer.appendChild(addressContainer);
  }

  /**
   * Create description section
   */
  private createDescriptionSection(): void {
    const { organization } = this.organizationConfig;

    if (!organization.description) return;

    const description = document.createElement('p');
    Object.assign(description.style, {
      margin: '0 0 12px 0',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
      color: '#6B7280',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      display: '-webkit-box',
      WebkitLineClamp: this.getCurrentCardSize() === CardSize.FULL ? '3' : '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    });

    description.textContent = organization.description;
    this.contentContainer.appendChild(description);
  }

  /**
   * Create working hours section
   */
  private createWorkingHoursSection(): void {
    const { organization } = this.organizationConfig;

    if (!organization.workingHours) return;

    const workingHours = document.createElement('div');
    Object.assign(workingHours.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '12px',
    });

    // Clock icon
    const clockIcon = document.createElement('div');
    Object.assign(clockIcon.style, {
      width: '16px',
      height: '16px',
      color: '#666666',
    });

    clockIcon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 4v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;

    const hoursText = document.createElement('span');
    Object.assign(hoursText.style, {
      fontSize: '14px',
      color: '#666666',
    });
    hoursText.textContent = organization.workingHours;

    workingHours.appendChild(clockIcon);
    workingHours.appendChild(hoursText);
    this.contentContainer.appendChild(workingHours);
  }

  /**
   * Create contact actions section
   */
  private createContactActions(): void {
    const { organization } = this.organizationConfig;

    if (!organization.phone) return;

    // Use BaseCard's createFooter method
    const actions = [
      {
        label: 'Позвонить',
        onClick: () => this.organizationConfig.onCallClick?.(organization),
        primary: false,
      },
    ];

    const footer = this.createFooter(actions);
    this.contentContainer.appendChild(footer);
  }

  /**
   * Create star rating visualization
   */
  private createStars(rating: number): HTMLElement {
    const starsContainer = document.createElement('div');
    Object.assign(starsContainer.style, {
      display: 'flex',
      gap: '2px',
    });

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('div');
      Object.assign(star.style, {
        width: '12px',
        height: '12px',
        color: i <= rating ? '#FFA726' : '#E0E0E0',
      });

      star.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 0l1.545 3.832L12 4.618 8.727 7.382l.818 4.618L6 9.798 2.455 12l.818-4.618L0 4.618l4.455-.786L6 0Z"/>
        </svg>
      `;

      starsContainer.appendChild(star);
    }

    return starsContainer;
  }

  /**
   * Public API methods for backward compatibility and external usage
   */

  /**
   * Update organization data
   */
  public updateOrganization(organization: Organization): void {
    this.organizationConfig.organization = organization;
    this.createContent(); // BaseCard method to recreate content
  }

  /**
   * Get current organization data
   */
  public getOrganization(): Organization {
    return this.organizationConfig.organization;
  }

  /**
   * Update component properties (for backward compatibility)
   */
  public updateProps(newProps: Partial<OrganizationCardProps>): void {
    // Map new props to config and update
    const configUpdates: Partial<OrganizationCardInternalConfig> = {
      organization: newProps.organization || this.organizationConfig.organization,
      showPhoto: newProps.showPhoto ?? this.organizationConfig.showPhoto,
      showRating: newProps.showRating ?? this.organizationConfig.showRating,
      showDistance: newProps.showDistance ?? this.organizationConfig.showDistance,
      showWorkingHours: newProps.showWorkingHours ?? this.organizationConfig.showWorkingHours,
      showCategory: newProps.showCategory ?? this.organizationConfig.showCategory,
      showDescription: newProps.showDescription ?? this.organizationConfig.showDescription,
      onOrganizationClick: newProps.onClick || this.organizationConfig.onOrganizationClick,
      onPhotoClick: newProps.onPhotoClick || this.organizationConfig.onPhotoClick,
      onCallClick: newProps.onCallClick || this.organizationConfig.onCallClick,
    };

    if (newProps.size) {
      configUpdates.size = OrganizationCard.mapCardSize(newProps.size);
    }

    if (newProps.className) {
      configUpdates.className = newProps.className;
    }

    this.organizationConfig = { ...this.organizationConfig, ...configUpdates };
    this.updateConfig(configUpdates); // BaseCard method
  }
}

/**
 * Factory for creating OrganizationCard instances
 */
export class OrganizationCardFactory {
  /**
   * Create a standard organization card
   */
  static create(containerElement: HTMLElement, props: OrganizationCardProps): OrganizationCard {
    return new OrganizationCard(containerElement, props);
  }

  /**
   * Create a compact organization card
   */
  static createCompact(
    containerElement: HTMLElement,
    organization: Organization,
    onClick?: (organization: Organization) => void
  ): OrganizationCard {
    return new OrganizationCard(containerElement, {
      organization,
      size: CardSize.COMPACT,
      showPhoto: false,
      showDescription: false,
      showWorkingHours: false,
      onClick,
    });
  }

  /**
   * Create a standard organization card
   */
  static createStandard(
    containerElement: HTMLElement,
    organization: Organization,
    onClick?: (organization: Organization) => void
  ): OrganizationCard {
    return new OrganizationCard(containerElement, {
      organization,
      size: CardSize.STANDARD,
      showPhoto: true,
      showDescription: true,
      showWorkingHours: false,
      onClick,
    });
  }

  /**
   * Create a full organization card with all features
   */
  static createFull(
    containerElement: HTMLElement,
    organization: Organization,
    onClick?: (organization: Organization) => void
  ): OrganizationCard {
    return new OrganizationCard(containerElement, {
      organization,
      size: CardSize.FULL,
      showPhoto: true,
      showDescription: true,
      showWorkingHours: true,
      onClick,
    });
  }
}
