/**
 * Компоненты Dashboard на основе Figma экспорта
 */

// Export ButtonRow component
export { ButtonRow } from './ButtonRow';
export type { ButtonRowItem, ButtonRowProps } from './ButtonRow';

// Export StoriesCarousel component
export { StoriesCarousel } from './StoriesCarousel';
export type { StoriesCarouselProps } from './StoriesCarousel';

export interface StoryItem {
  id: string;
  title: string;
  imageUrl: string;
  isViewed: boolean;
}

export interface MetaItem {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'text' | 'image' | 'category';
  iconSrc?: string;
  isAd?: boolean;
}

export interface CoverItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  size: 'big' | 'default';
}

export interface ButtonItem {
  id: string;
  text: string;
  icon?: string;
  type: 'icon' | 'icon-text' | 'text';
}

/**
 * Компонент Stories - горизонтальный список историй
 */
export class StoriesComponent {
  private container: HTMLElement;
  private stories: StoryItem[];
  private onStoryClick?: (storyId: string) => void;

  constructor(
    container: HTMLElement, 
    stories: StoryItem[], 
    onStoryClick?: (storyId: string) => void
  ) {
    this.container = container;
    this.stories = stories;
    this.onStoryClick = onStoryClick;
    this.render();
  }

  private render(): void {
    this.container.className = 'stories-section';
    
    const storiesContainer = document.createElement('div');
    storiesContainer.className = 'stories-container';
    
    this.stories.forEach(story => {
      const storyElement = this.createStoryElement(story);
      storiesContainer.appendChild(storyElement);
    });
    
    this.container.appendChild(storiesContainer);
  }

  private createStoryElement(story: StoryItem): HTMLElement {
    const storyItem = document.createElement('div');
    storyItem.className = 'story-item';
    storyItem.addEventListener('click', () => this.onStoryClick?.(story.id));
    
    const cover = document.createElement('div');
    cover.className = 'story-cover';
    
    const image = document.createElement('img');
    image.src = story.imageUrl;
    image.alt = story.title;
    image.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
    `;
    
    cover.appendChild(image);
    storyItem.appendChild(cover);
    
    return storyItem;
  }

  public updateStories(stories: StoryItem[]): void {
    this.stories = stories;
    this.container.innerHTML = '';
    this.render();
  }
}

/**
 * Компонент ButtonRow - горизонтальный ряд кнопок
 */
export class ButtonRowComponent {
  private container: HTMLElement;
  private buttons: ButtonItem[];
  private onButtonClick?: (buttonId: string) => void;

  constructor(
    container: HTMLElement,
    buttons: ButtonItem[],
    onButtonClick?: (buttonId: string) => void
  ) {
    this.container = container;
    this.buttons = buttons;
    this.onButtonClick = onButtonClick;
    this.render();
  }

  private render(): void {
    this.container.className = 'buttons-row';
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-row-container';
    
    this.buttons.forEach(button => {
      const buttonElement = this.createButtonElement(button);
      buttonsContainer.appendChild(buttonElement);
    });
    
    this.container.appendChild(buttonsContainer);
  }

  private createButtonElement(button: ButtonItem): HTMLElement {
    const buttonEl = document.createElement('button');
    buttonEl.className = 'smart-button';
    buttonEl.addEventListener('click', () => this.onButtonClick?.(button.id));
    
    if (button.icon && (button.type === 'icon' || button.type === 'icon-text')) {
      const icon = document.createElement('span');
      icon.textContent = button.icon;
      icon.style.marginRight = button.type === 'icon-text' ? '6px' : '0';
      buttonEl.appendChild(icon);
    }
    
    if (button.type === 'text' || button.type === 'icon-text') {
      const text = document.createElement('span');
      text.className = 'smart-button-text';
      text.textContent = button.text;
      buttonEl.appendChild(text);
    }
    
    return buttonEl;
  }

  public updateButtons(buttons: ButtonItem[]): void {
    this.buttons = buttons;
    this.container.innerHTML = '';
    this.render();
  }
}

/**
 * Компонент MetaItems - список мета-элементов
 */
export class MetaItemsComponent {
  private container: HTMLElement;
  private items: MetaItem[];
  private onItemClick?: (itemId: string) => void;

  constructor(
    container: HTMLElement,
    items: MetaItem[],
    onItemClick?: (itemId: string) => void
  ) {
    this.container = container;
    this.items = items;
    this.onItemClick = onItemClick;
    this.render();
  }

  private render(): void {
    this.container.className = 'meta-items-container';
    
    this.items.forEach(item => {
      const itemElement = this.createMetaItemElement(item);
      this.container.appendChild(itemElement);
    });
  }

  private createMetaItemElement(item: MetaItem): HTMLElement {
    const metaItem = document.createElement('div');
    metaItem.className = `meta-item ${item.isAd ? 'meta-item-ad' : ''}`;
    metaItem.addEventListener('click', () => this.onItemClick?.(item.id));
    
    const content = document.createElement('div');
    content.className = 'meta-item-content';
    
    const title = document.createElement('div');
    title.className = 'meta-item-title';
    title.textContent = item.title;
    
    const subtitle = document.createElement('div');
    subtitle.className = 'meta-item-subtitle';
    subtitle.textContent = item.subtitle;
    
    content.appendChild(title);
    content.appendChild(subtitle);
    
    const icon = document.createElement('div');
    icon.className = 'meta-item-icon';
    
    if (item.iconType === 'text') {
      icon.textContent = item.title.charAt(0);
    } else if (item.iconType === 'image' && item.iconSrc) {
      const img = document.createElement('img');
      img.src = item.iconSrc;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
      `;
      icon.appendChild(img);
    } else {
      icon.innerHTML = '📍';
    }
    
    if (item.isAd) {
      metaItem.appendChild(icon);
      metaItem.appendChild(content);
    } else {
      metaItem.appendChild(content);
      metaItem.appendChild(icon);
    }
    
    return metaItem;
  }

  public updateItems(items: MetaItem[]): void {
    this.items = items;
    this.container.innerHTML = '';
    this.render();
  }
}

/**
 * Компонент CoverCard - карточка с обложкой
 */
export class CoverCardComponent {
  private container: HTMLElement;
  private cover: CoverItem;
  private onCoverClick?: (coverId: string) => void;

  constructor(
    container: HTMLElement,
    cover: CoverItem,
    onCoverClick?: (coverId: string) => void
  ) {
    this.container = container;
    this.cover = cover;
    this.onCoverClick = onCoverClick;
    this.render();
  }

  private render(): void {
    const card = document.createElement('div');
    card.className = `cover-card ${this.cover.size === 'big' ? 'cover-card-big' : 'cover-card-small'}`;
    card.addEventListener('click', () => this.onCoverClick?.(this.cover.id));
    
    const image = document.createElement('img');
    image.src = this.cover.imageUrl;
    image.alt = this.cover.title;
    image.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    
    const overlay = document.createElement('div');
    overlay.className = 'cover-overlay';
    
    const title = document.createElement('div');
    title.className = 'cover-title';
    title.textContent = this.cover.title;
    
    const subtitle = document.createElement('div');
    subtitle.className = 'cover-subtitle';
    subtitle.textContent = this.cover.subtitle;
    
    overlay.appendChild(title);
    overlay.appendChild(subtitle);
    
    card.appendChild(image);
    card.appendChild(overlay);
    this.container.appendChild(card);
  }

  public updateCover(cover: CoverItem): void {
    this.cover = cover;
    this.container.innerHTML = '';
    this.render();
  }
}

/**
 * Компонент SearchHeader - заголовок с поиском и драггером
 */
export class SearchHeaderComponent {
  private container: HTMLElement;
  private placeholder: string;
  private onSearchClick?: () => void;
  private onDragStart?: (event: MouseEvent | TouchEvent) => void;

  constructor(
    container: HTMLElement,
    options: {
      placeholder?: string;
      onSearchClick?: () => void;
      onDragStart?: (event: MouseEvent | TouchEvent) => void;
    } = {}
  ) {
    this.container = container;
    this.placeholder = options.placeholder || 'Поиск в Москве';
    this.onSearchClick = options.onSearchClick;
    this.onDragStart = options.onDragStart;
    this.render();
  }

  private render(): void {
    this.container.className = 'bottomsheet-header';
    
    // Драггер
    const dragger = document.createElement('div');
    dragger.className = 'dragger';
    
    const draggerHandle = document.createElement('div');
    draggerHandle.className = 'dragger-handle';
    
    if (this.onDragStart) {
      draggerHandle.addEventListener('mousedown', this.onDragStart);
      draggerHandle.addEventListener('touchstart', this.onDragStart, { passive: false });
    }
    
    dragger.appendChild(draggerHandle);
    
    // Поисковая панель
    const navBar = document.createElement('div');
    navBar.className = 'search-nav-bar';
    
    const navContent = document.createElement('div');
    navContent.className = 'search-nav-content';
    
    const searchFieldContainer = document.createElement('div');
    searchFieldContainer.className = 'search-field-container';
    
    const searchField = document.createElement('div');
    searchField.className = 'search-field';
    if (this.onSearchClick) {
      searchField.addEventListener('click', this.onSearchClick);
    }
    
    // Иконка поиска
    const searchIcon = document.createElement('div');
    searchIcon.className = 'search-icon';
    searchIcon.innerHTML = this.getSearchIconSVG();
    
    // Плейсхолдер
    const placeholder = document.createElement('div');
    placeholder.className = 'search-placeholder';
    placeholder.textContent = this.placeholder;
    
    // Иконка помощника
    const assistantIcon = document.createElement('div');
    assistantIcon.className = 'search-icon';
    assistantIcon.innerHTML = this.getAssistantIconHTML();
    
    searchField.appendChild(searchIcon);
    searchField.appendChild(placeholder);
    searchField.appendChild(assistantIcon);
    
    searchFieldContainer.appendChild(searchField);
    navContent.appendChild(searchFieldContainer);
    navBar.appendChild(navContent);
    
    this.container.appendChild(dragger);
    this.container.appendChild(navBar);
  }

  private getSearchIconSVG(): string {
    return `
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
        <path d="M8.5 15.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM15.5 15.5l-3.87-3.87" 
              stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  private getAssistantIconHTML(): string {
    return `
      <div style="width: 24px; height: 24px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 12px;">🤖</span>
      </div>
    `;
  }

  public updatePlaceholder(placeholder: string): void {
    this.placeholder = placeholder;
    const placeholderElement = this.container.querySelector('.search-placeholder');
    if (placeholderElement) {
      placeholderElement.textContent = placeholder;
    }
  }
}

/**
 * Компонент SectionHeader - заголовок секции
 */
export class SectionHeaderComponent {
  private container: HTMLElement;
  private title: string;

  constructor(container: HTMLElement, title: string) {
    this.container = container;
    this.title = title;
    this.render();
  }

  private render(): void {
    this.container.className = 'section-header';
    
    const titleElement = document.createElement('h2');
    titleElement.className = 'section-title';
    titleElement.textContent = this.title;
    
    this.container.appendChild(titleElement);
  }

  public updateTitle(title: string): void {
    this.title = title;
    const titleElement = this.container.querySelector('.section-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }
}

/**
 * Компонент Banner - рекламный баннер
 */
export class BannerComponent {
  private container: HTMLElement;
  private bannerData: {
    id: string;
    title: string;
    description: string;
    actionText: string;
    logoColor?: string;
    onAction?: () => void;
  };

  constructor(
    container: HTMLElement,
    bannerData: {
      id: string;
      title: string;
      description: string;
      actionText: string;
      logoColor?: string;
      onAction?: () => void;
    }
  ) {
    this.container = container;
    this.bannerData = bannerData;
    this.render();
  }

  private render(): void {
    const banner = document.createElement('div');
    banner.className = 'banner-small';
    
    const logo = document.createElement('div');
    logo.className = 'banner-logo';
    if (this.bannerData.logoColor) {
      logo.style.background = this.bannerData.logoColor;
    }
    
    const content = document.createElement('div');
    content.className = 'banner-content';
    
    const title = document.createElement('div');
    title.className = 'banner-title';
    title.textContent = this.bannerData.title;
    
    const description = document.createElement('div');
    description.className = 'banner-description';
    description.textContent = this.bannerData.description;
    
    const action = document.createElement('div');
    action.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      color: var(--text-icons-accent-brand);
      margin-top: 8px;
      cursor: pointer;
    `;
    action.textContent = this.bannerData.actionText;
    
    if (this.bannerData.onAction) {
      action.addEventListener('click', this.bannerData.onAction);
    }
    
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(action);
    
    banner.appendChild(logo);
    banner.appendChild(content);
    this.container.appendChild(banner);
  }
} 