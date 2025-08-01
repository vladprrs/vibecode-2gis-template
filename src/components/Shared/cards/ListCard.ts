import { BaseCard, BaseCardConfig } from './BaseCard';

/**
 * List card item configuration
 */
export interface ListCardItem {
  /** Item ID */
  id: string;
  /** Item icon */
  icon?: string;
  /** Item title */
  title: string;
  /** Item subtitle */
  subtitle?: string;
  /** Item badge */
  badge?: string;
  /** Badge color */
  badgeColor?: string;
  /** Whether item has chevron */
  hasChevron?: boolean;
  /** Item click handler */
  onClick?: (item: ListCardItem) => void;
}

/**
 * List card configuration
 */
export interface ListCardConfig extends BaseCardConfig {
  /** Card title */
  title?: string;
  /** List items */
  items: ListCardItem[];
  /** Show dividers between items */
  showDividers?: boolean;
  /** Item padding */
  itemPadding?: string;
}

/**
 * List card component
 * Card that displays a list of items, similar to checkout screen sections
 */
export class ListCard extends BaseCard {
  private listConfig: ListCardConfig;
  private itemsContainer!: HTMLElement;

  constructor(config: ListCardConfig) {
    super(config);
    this.listConfig = { showDividers: true, itemPadding: '12px 0', ...config };
  }

  protected createCardContent(): void {
    // Create title if provided
    if (this.listConfig.title) {
      const title = document.createElement('h3');
      Object.assign(title.style, {
        margin: '0 0 16px 0',
        fontSize: '17px',
        fontWeight: '600',
        lineHeight: '22px',
        letterSpacing: '-0.43px',
        color: '#141414',
        fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      });
      title.textContent = this.listConfig.title;
      this.contentContainer.appendChild(title);
    }

    // Create items container
    this.itemsContainer = document.createElement('div');
    Object.assign(this.itemsContainer.style, {
      display: 'flex',
      flexDirection: 'column',
    });
    this.contentContainer.appendChild(this.itemsContainer);

    // Create list items
    this.createListItems();
  }

  /**
   * Create list items
   */
  private createListItems(): void {
    this.itemsContainer.innerHTML = '';

    this.listConfig.items.forEach((item, index) => {
      const itemElement = this.createListItem(item);
      this.itemsContainer.appendChild(itemElement);

      // Add divider if not last item and dividers enabled
      if (this.listConfig.showDividers && index < this.listConfig.items.length - 1) {
        const divider = this.createDivider();
        this.itemsContainer.appendChild(divider);
      }
    });
  }

  /**
   * Create a single list item
   */
  private createListItem(item: ListCardItem): HTMLElement {
    const itemElement = document.createElement('div');
    Object.assign(itemElement.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: this.listConfig.itemPadding || '12px 0',
      cursor: item.onClick ? 'pointer' : 'default',
      transition: 'background-color 0.2s ease',
    });

    // Add click handler
    if (item.onClick) {
      itemElement.addEventListener('click', e => {
        e.stopPropagation(); // Prevent card click event
        item.onClick!(item);
      });

      // Hover effect
      itemElement.addEventListener('mouseenter', () => {
        itemElement.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
      });

      itemElement.addEventListener('mouseleave', () => {
        itemElement.style.backgroundColor = 'transparent';
      });
    }

    // Icon (if provided)
    if (item.icon) {
      const iconElement = document.createElement('div');
      Object.assign(iconElement.style, {
        width: '20px',
        height: '20px',
        flexShrink: '0',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
      iconElement.textContent = item.icon;
      itemElement.appendChild(iconElement);
    }

    // Content
    const contentElement = document.createElement('div');
    Object.assign(contentElement.style, {
      flex: '1',
      minWidth: '0',
    });

    // Title
    const titleElement = document.createElement('div');
    Object.assign(titleElement.style, {
      fontSize: '15px',
      fontWeight: '500',
      lineHeight: '20px',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      marginBottom: item.subtitle ? '2px' : '0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
    titleElement.textContent = item.title;
    contentElement.appendChild(titleElement);

    // Subtitle (if provided)
    if (item.subtitle) {
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
      subtitleElement.textContent = item.subtitle;
      contentElement.appendChild(subtitleElement);
    }

    itemElement.appendChild(contentElement);

    // Badge (if provided)
    if (item.badge) {
      const badgeElement = document.createElement('div');
      Object.assign(badgeElement.style, {
        fontSize: '15px',
        fontWeight: '500',
        color: item.badgeColor || '#10B981',
        fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
        flexShrink: '0',
      });
      badgeElement.textContent = item.badge;
      itemElement.appendChild(badgeElement);
    }

    // Chevron (if enabled)
    if (item.hasChevron) {
      const chevronElement = document.createElement('div');
      Object.assign(chevronElement.style, {
        width: '20px',
        height: '20px',
        flexShrink: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#898989',
      });
      chevronElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      itemElement.appendChild(chevronElement);
    }

    return itemElement;
  }

  /**
   * Create divider between items
   */
  private createDivider(): HTMLElement {
    const divider = document.createElement('div');
    Object.assign(divider.style, {
      height: '1px',
      backgroundColor: 'rgba(137, 137, 137, 0.15)',
      margin: '0',
    });
    return divider;
  }

  /**
   * Add item to the list
   */
  public addItem(item: ListCardItem): void {
    this.listConfig.items.push(item);
    this.createListItems();
  }

  /**
   * Remove item from the list
   */
  public removeItem(itemId: string): void {
    this.listConfig.items = this.listConfig.items.filter(item => item.id !== itemId);
    this.createListItems();
  }

  /**
   * Update item in the list
   */
  public updateItem(itemId: string, updates: Partial<ListCardItem>): void {
    const itemIndex = this.listConfig.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      this.listConfig.items[itemIndex] = { ...this.listConfig.items[itemIndex], ...updates };
      this.createListItems();
    }
  }

  /**
   * Clear all items
   */
  public clearItems(): void {
    this.listConfig.items = [];
    this.createListItems();
  }

  /**
   * Set new items
   */
  public setItems(items: ListCardItem[]): void {
    this.listConfig.items = items;
    this.createListItems();
  }

  /**
   * Get all items
   */
  public getItems(): ListCardItem[] {
    return this.listConfig.items;
  }

  /**
   * Update list card configuration
   */
  public updateListConfig(newConfig: Partial<ListCardConfig>): void {
    this.listConfig = { ...this.listConfig, ...newConfig };
    this.updateConfig(newConfig);
  }
}
