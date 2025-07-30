import { BottomsheetState, ScreenType, SearchContext } from '../../types';

import {
  BottomsheetAnimationManager,
  BottomsheetGestureManager,
  BottomsheetManager,
  CartService,
  CheckoutService,
  ContentManager,
  FilterBarManager,
  MapManager,
  MapSyncService,
  SearchFlowManager,
} from '../../services';

import {
  BottomsheetContainer,
  BottomsheetContainerProps,
  BottomsheetContent,
  BottomsheetHeader,
} from '../Bottomsheet';
import { SearchBar, SearchBarState } from '../Search';
import { OrganizationScreen } from './OrganizationScreen';
import { ShopScreen } from './ShopScreen';
import { CartScreen } from './CartScreen';
import { CheckoutScreen } from './CheckoutScreen';
import { ButtonRow, ButtonRowItem, StoriesCarousel } from '../Dashboard';

/**
 * Пропсы для DashboardScreen
 */
export interface DashboardScreenProps {
  /** Контейнер для монтирования экрана */
  container: HTMLElement;
  /** Менеджер поискового флоу */
  searchFlowManager: SearchFlowManager;
  /** Менеджер шторки */
  bottomsheetManager: BottomsheetManager;
  /** Менеджер панели фильтров */
  filterBarManager: FilterBarManager;
  /** Сервис корзины */
  cartService: CartService;
  /** Сервис оформления заказа */
  checkoutService: CheckoutService;
  /** Сервис синхронизации карты */
  mapSyncService?: MapSyncService;
  /** Менеджер карты */
  mapManager: MapManager;
  /** CSS класс */
  className?: string;
  /** Обработчики событий */
  onSearchFocus?: () => void;
  onStoryClick?: (storyId: string) => void;
  onMetaItemClick?: (itemId: string) => void;
}

/**
 * Элемент истории для отображения
 */
interface StoryItem {
  id: string;
  title: string;
  imageUrl?: string;
  isViewed: boolean;
}

/**
 * Элемент meta-item
 */
interface MetaItem {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'emoji' | 'image' | 'svg';
  iconSrc?: string;
  isAd?: boolean;
}

/**
 * Покрытие с изображением
 */
interface CoverItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  gradientColor?: string;
}

/**
 * Элемент кнопки
 */
interface ButtonItem {
  id: string;
  text: string;
  iconSrc?: string;
  onClick?: () => void;
}

/**
 * Единый экран дашборда с модульной архитектурой
 * Объединяет лучшие части всех версий в соответствии с оригинальной архитектурой
 */
export class DashboardScreen {
  private props: DashboardScreenProps;
  private element: HTMLElement;
  private mapManager: MapManager;

  // Компоненты
  private bottomsheetContainer?: BottomsheetContainer;
  private bottomsheetHeader?: BottomsheetHeader;
  private bottomsheetContent?: BottomsheetContent;
  private searchBar?: SearchBar;
  private filterBarManager: FilterBarManager;

  // Оригинальные параметры bottomsheet
  private bottomsheetElement?: HTMLElement;
  private currentState: string = 'default';
  private currentHeight?: number;
  private isDragging: boolean = false;
  private dragStartY: number = 0;

  private gestureManager?: BottomsheetGestureManager;
  private animationManager?: BottomsheetAnimationManager;

  // Content management
  private currentScreen: ScreenType = ScreenType.DASHBOARD;
  private contentManager: ContentManager;
  private organizationScreen?: OrganizationScreen;
  private shopScreen?: ShopScreen;
  private cartScreen?: CartScreen;
  private checkoutScreen?: CheckoutScreen;

  // Filter bar management
  private fixedFilterBar?: HTMLElement;

  constructor(props: DashboardScreenProps) {
    this.props = props;
    this.element = props.container;
    this.mapManager = props.mapManager;
    this.contentManager = new ContentManager(this.props.searchFlowManager);
    this.filterBarManager = props.filterBarManager;
    this.initialize();
  }

  /**
   * Инициализация экрана
   */
  private async initialize(): Promise<void> {
    this.setupElement();
    await this.props.mapManager.createMapContainer(this.element);
    this.createBottomsheet();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    this.element.className = `dashboard-screen ${this.props.className || ''}`.trim();
    this.element.style.cssText = `
      width: 375px;
      max-width: 100%;
      height: 100vh;
      background: #F1F1F1;
      position: relative;
      overflow: hidden;
      margin: 0 auto;
    `;
  }

  /**
   * Создание контейнера карты с MapGL
   */

  /**
   * Создание fallback карты
   */
  private createFallbackMap(container: HTMLElement): void {
    container.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #E8F4F8 0%, #D4E8F0 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #666;
      ">
        <div class="map-placeholder-icon" style="
          font-size: 48px;
          margin-bottom: 16px;
        ">🗺️</div>
        <div>Карта недоступна</div>
        <div style="font-size: 12px; margin-top: 8px;">
          MapGL API не загрузился
        </div>
      </div>
    `;
  }

  /**
   * Создание шторки с точным поведением оригинала
   */
  private createBottomsheet(): void {
    this.createOriginalBottomsheet();
    if (this.bottomsheetElement) {
      this.animationManager = new BottomsheetAnimationManager();
      this.gestureManager = new BottomsheetGestureManager({
        element: this.bottomsheetElement,
        bottomsheetManager: this.props.bottomsheetManager,
        animationManager: this.animationManager,
        getCurrentHeight: () => this.currentHeight,
        setHeight: (h: number) => this.setBottomsheetHeight(h),
        onStateChange: (s: string) => {
          this.currentState = s;
        },
      });
      this.gestureManager.setupBottomsheetEventListeners();
    }
  }

  /**
   * Создание шторки с оригинальным поведением
   */
  private createOriginalBottomsheet(): void {
    this.bottomsheetElement = document.createElement('div');
    this.bottomsheetElement.className = 'dashboard-bottomsheet bs-default';

    // Set fixed height and use transform for positioning
    const screenHeight = window.innerHeight;
    this.bottomsheetElement.style.cssText = `
      display: flex;
      width: 375px;
      max-width: 100%;
      height: 100vh;
      flex-direction: column;
      align-items: flex-start;
      border-radius: 16px 16px 0 0;
      background: #FFF;
      position: absolute;
      left: 0;
      bottom: 0;
      transform-origin: top center;
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
      z-index: 1000;
    `;

    // Инициализируем текущую высоту
    this.currentHeight = screenHeight * 0.55; // default состояние

    this.updateBottomsheetHeight();
    this.createFigmaHeader();

    // Create content container
    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.style.cssText = `
      flex: 1;
      width: 100%;
      overflow-y: auto;
      padding-top: 16px;
    `;

    // Add the new dashboard content
    this.createDashboardContent(content);

    this.bottomsheetElement.appendChild(content);
    this.element.appendChild(this.bottomsheetElement);
  }

  /**
   * Создание заголовка шторки
   */

  /**
   * Создание контента дашборда с точным соответствием Figma
   */
  private createDashboardContent(container: HTMLElement): void {
    // 1. Quick action buttons (horizontal row) - stays in white area
    this.createQuickActionButtons(container);

    // 2. Create grey section container for everything from Stories downward
    const greySectionContainer = document.createElement('div');
    greySectionContainer.className = 'dashboard-grey-section';
    greySectionContainer.style.cssText = `
      display: flex;
      padding: var(--space-16) 16px 60px 16px;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      background: var(--color-surface-section);
      position: relative;
      width: 100%;
    `;

    // 3. Stories carousel
    this.createStoriesCarousel(greySectionContainer);

    // 4. "Вам может пригодиться" heading
    this.createSectionHeading(greySectionContainer, 'Вам может пригодиться');

    // 5. Content masonry grid (AdviceGrid component) and promo banner
    this.createContentMasonryGrid(greySectionContainer);

    // Add the grey section to the main container
    container.appendChild(greySectionContainer);
  }

  /**
   * Создание горизонтального ряда быстрых действий
   */
  private createQuickActionButtons(container: HTMLElement): void {
    const buttonRowContainer = document.createElement('div');
    buttonRowContainer.style.cssText = `
      padding: 0;
      margin: 0 0 var(--space-32) 0;
      height: 40px;
      position: relative;
    `;

    // Button row items based on Figma export
    const buttonItems: ButtonRowItem[] = [
      {
        id: 'bookmark',
        text: 'В путь',
        iconSrc: '/assets/images/bookmark.svg',
        type: 'icon',
      },
      {
        id: 'home',
        text: 'Домой',
        iconSrc: '/assets/images/home.svg',
        type: 'icon',
      },
      {
        id: 'work',
        text: 'На работу',
        iconSrc: '/assets/images/work.svg',
        type: 'icon',
      },
    ];

    // Create ButtonRow component
    new ButtonRow({
      container: buttonRowContainer,
      items: buttonItems,
      onButtonClick: (buttonId: string) => {
        console.log('Button clicked:', buttonId);
        // Handle button clicks here
      },
    });

    container.appendChild(buttonRowContainer);
  }

  /**
   * Создание карусели историй
   */
  private createStoriesCarousel(container: HTMLElement): void {
    const storiesContainer = document.createElement('div');
    storiesContainer.className = 'stories-section';

    // Create StoriesCarousel component
    new StoriesCarousel({
      container: storiesContainer,
      onStoryClick: (storyId: string) => {
        console.log('Story clicked:', storyId);
        this.props.onStoryClick?.(storyId);
      },
    });

    container.appendChild(storiesContainer);
  }

  /**
   * Создание заголовка секции
   */
  private createSectionHeading(container: HTMLElement, title: string): void {
    const heading = document.createElement('div');
    heading.className = 'section-header';
    heading.style.cssText = `
      margin-top: var(--space-12);
      padding-bottom: 12px;
      justify-content: center;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const titleElement = document.createElement('h4');
    titleElement.className = 'section-title';
    titleElement.style.cssText = `
      font-family: 'SB Sans Text', -apple-system, Roboto, Helvetica, sans-serif;
      font-size: 19px;
      font-weight: 600;
      line-height: 24px;
      color: var(--color-text-primary);
      margin: 0;
      flex: 1 0 0;
    `;
    titleElement.textContent = title;

    heading.appendChild(titleElement);
    container.appendChild(heading);
  }

  /**
   * Создание масонри сетки контента
   */
  private createContentMasonryGrid(container: HTMLElement): void {
    // Use the new AdviceGrid component directly
    import('./../Dashboard/AdviceGrid')
      .then(({ AdviceGrid }) => {
        new AdviceGrid({
          container,
          onItemClick: (itemId: string) => {
            console.log('Advice item clicked:', itemId);
            this.props.onMetaItemClick?.(itemId);
          },
        });

        // Create promo banner after advice grid is loaded
        this.createPromoBanner(container);
      })
      .catch(error => {
        console.error('Failed to load AdviceGrid component:', error);
        // Create a simple placeholder if component fails to load
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
        padding: 20px;
        text-align: center;
        color: #666;
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      `;
        placeholder.textContent = 'Советы к месту - компонент загружается...';
        container.appendChild(placeholder);

        // Create promo banner after placeholder
        this.createPromoBanner(container);
      });
  }

  // createCategoriesGrid method removed - not part of the Figma design

  /**
   * Создание промо баннера
   */
  private createPromoBanner(container: HTMLElement): void {
    const banner = document.createElement('div');
    banner.className = 'promo-banner';
    banner.style.cssText = `
      margin-top: var(--space-16);
      display: flex;
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      position: relative;
      height: 160px;
    `;

    // Content container
    const content = document.createElement('div');
    content.style.cssText = `
      height: 136px;
      align-self: stretch;
      border-radius: 12px;
      border: 0.5px solid rgba(137, 137, 137, 0.30);
      position: relative;
    `;

    // Banner small container
    const bannerSmall = document.createElement('div');
    bannerSmall.style.cssText = `
      display: flex;
      width: 100%;
      align-items: flex-start;
      border-radius: 12px;
      background: #FFF;
      position: absolute;
      left: 0px;
      top: 0px;
      height: 136px;
    `;

    // Logo container
    const logoContainer = document.createElement('div');
    logoContainer.style.cssText = `
      display: flex;
      height: 136px;
      padding: 12px 0 12px 16px;
      justify-content: center;
      align-items: flex-start;
      gap: 10px;
      position: relative;
    `;

    const logo = document.createElement('div');
    logo.style.cssText = `
      width: 64px;
      height: 64px;
      border-radius: 32px;
      border: 0.5px solid rgba(137, 137, 137, 0.30);
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
      position: relative;
    `;

    // Text content
    const textContent = document.createElement('div');
    textContent.style.cssText = `
      display: flex;
      padding: 0 16px 0 12px;
      flex-direction: column;
      align-items: flex-start;
      flex: 1 0 0;
      position: relative;
    `;

    // Title
    const title = document.createElement('div');
    title.style.cssText = `
      display: flex;
      padding: 14px 0 4px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const titleText = document.createElement('div');
    titleText.style.cssText = `
      flex: 1 0 0;
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 600;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.24px;
    `;
    titleText.textContent = 'Фитнес Хаус';

    // Subtitle
    const subtitle = document.createElement('div');
    subtitle.style.cssText = `
      display: flex;
      padding-bottom: 4px;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const subtitleText = document.createElement('div');
    subtitleText.style.cssText = `
      flex: 1 0 0;
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
    `;
    subtitleText.textContent =
      'Скидка 20% на спортивную одежду при покупке абонемента на 3 месяца!';

    // CTA button
    const ctaButton = document.createElement('div');
    ctaButton.style.cssText = `
      display: flex;
      padding: 6px 0 16px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const ctaText = document.createElement('div');
    ctaText.style.cssText = `
      color: #5A5A5A;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 500;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
    `;
    ctaText.textContent = 'Получить скидку';

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      display: flex;
      padding: 0 4px;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      align-self: stretch;
      position: relative;
    `;

    const footerText = document.createElement('div');
    footerText.style.cssText = `
      display: flex;
      padding: 7px 0 1px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const footerTextContent = document.createElement('div');
    footerTextContent.style.cssText = `
      height: 16px;
      flex: 1 0 0;
      overflow: hidden;
      color: #B8B8B8;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 11px;
      line-height: 14px;
      letter-spacing: -0.176px;
    `;
    footerTextContent.textContent =
      'Реклама • Условия проведения акции смотрите на fitness-house.ru';

    // Assemble the banner
    title.appendChild(titleText);
    subtitle.appendChild(subtitleText);
    ctaButton.appendChild(ctaText);
    textContent.appendChild(title);
    textContent.appendChild(subtitle);
    textContent.appendChild(ctaButton);
    logoContainer.appendChild(logo);
    bannerSmall.appendChild(logoContainer);
    bannerSmall.appendChild(textContent);
    content.appendChild(bannerSmall);
    footerText.appendChild(footerTextContent);
    footer.appendChild(footerText);
    banner.appendChild(content);
    banner.appendChild(footer);
    container.appendChild(banner);
  }

  // createBottomSpacing method removed - no longer needed

  // createStories and createStoryElement methods removed - using StoriesCarousel component instead

  // createContentGrid method removed - replaced by AdviceGrid component

  /**
   * Создание элемента meta-item
   */
  private createMetaItemElement(item: MetaItem): HTMLElement {
    const itemEl = document.createElement('div');
    itemEl.className = 'figma-meta-item';
    itemEl.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s;
      position: relative;
    `;

    if (item.isAd) {
      const adBadge = document.createElement('div');
      adBadge.textContent = 'реклама';
      adBadge.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 10px;
        color: #999;
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 4px;
      `;
      itemEl.appendChild(adBadge);
    }

    const icon = document.createElement('div');
    icon.textContent = item.iconSrc || '📍';
    icon.style.cssText = `
      font-size: 24px;
      margin-bottom: 8px;
    `;
    itemEl.appendChild(icon);

    const title = document.createElement('div');
    title.textContent = item.title;
    title.style.cssText = `
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
    `;
    itemEl.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = item.subtitle;
    subtitle.style.cssText = `
      font-size: 12px;
      color: #666;
    `;
    itemEl.appendChild(subtitle);

    itemEl.addEventListener('click', () => {
      this.props.onMetaItemClick?.(item.id);
    });

    return itemEl;
  }

  /**
   * Вспомогательные методы
   */
  private getHeightForState(state: string): number {
    switch (state) {
      case 'small':
        return 0.2;
      case 'default':
        return 0.55;
      case 'fullscreen':
        return 0.9;
      case 'fullscreen_scroll':
        return 1.0;
      default:
        return 0.55;
    }
  }

  private addTemporaryMarker(coordinates: [number, number]): void {
    const map = this.mapManager.getMapInstance();
    if (!map) return;

    const marker = new (window as any).mapgl.Marker(map, {
      coordinates,
      icon: {
        type: 'circle',
        size: 8,
        color: '#FF0000',
      },
    });

    // Убираем маркер через 3 секунды
    setTimeout(() => {
      marker.destroy();
    }, 3000);
  }

  /**
   * Публичные методы для управления экраном
   */
  public activate(): void {
    this.element.style.display = 'block';
  }

  public deactivate(): void {
    this.element.style.display = 'none';
  }

  public snapToState(state: BottomsheetState): void {
    this.currentState = state.toString();

    const screenHeight = window.innerHeight;
    const heights = {
      small: screenHeight * 0.2,
      default: screenHeight * 0.55,
      fullscreen: screenHeight * 0.9,
      fullscreen_scroll: screenHeight * 1.0,
    };

    const targetHeight = heights[this.currentState as keyof typeof heights];
    if (targetHeight && this.currentHeight !== undefined && this.animationManager) {
      this.animationManager.animateToHeight(this.currentHeight, targetHeight, h =>
        this.setBottomsheetHeight(h)
      );
    }

    // Also update the original bottomsheet container if it exists
    this.bottomsheetContainer?.snapToState(state);
  }

  public centerMoscow(): void {
    const map = this.mapManager.getMapInstance();
    map?.setCenter([37.620393, 55.75396]);
    map?.setZoom(12);
  }

  public testRandomMarkers(): void {
    const map = this.mapManager.getMapInstance();
    if (!map) return;

    const moscowBounds = {
      minLng: 37.3,
      maxLng: 37.9,
      minLat: 55.5,
      maxLat: 55.9,
    };

    for (let i = 0; i < 5; i++) {
      const lng = moscowBounds.minLng + Math.random() * (moscowBounds.maxLng - moscowBounds.minLng);
      const lat = moscowBounds.minLat + Math.random() * (moscowBounds.maxLat - moscowBounds.minLat);

      setTimeout(() => {
        this.addTemporaryMarker([lng, lat]);
      }, i * 500);
    }
  }

  public destroy(): void {
    this.mapManager.destroy();
    this.bottomsheetContainer?.destroy();
    this.bottomsheetHeader?.destroy();
    this.bottomsheetContent?.destroy();
    this.searchBar?.destroy();
    this.filterBarManager.hide();

    // Clean up organization screen if it exists
    if (this.organizationScreen) {
      this.organizationScreen.destroy();
      this.organizationScreen = undefined;
    }

    // Clean up shop screen if it exists
    if (this.shopScreen) {
      this.shopScreen.destroy();
      this.shopScreen = undefined;
    }

    // Clean up cart screen if it exists
    if (this.cartScreen) {
      this.cartScreen.destroy();
      this.cartScreen = undefined;
    }

    // Clean up checkout screen if it exists
    if (this.checkoutScreen) {
      this.checkoutScreen.destroy();
      this.checkoutScreen = undefined;
    }
  }

  /**
   * Методы для работы с оригинальным bottomsheet
   */
  private updateBottomsheetHeight(): void {
    if (!this.bottomsheetElement) return;

    const screenHeight = window.innerHeight;
    const heights = {
      small: screenHeight * 0.2,
      default: screenHeight * 0.55,
      fullscreen: screenHeight * 0.9,
      'fullscreen-scroll': screenHeight * 1.0,
    };

    const height = heights[this.currentState as keyof typeof heights];
    this.setBottomsheetHeight(height);
  }

  private setBottomsheetHeight(height: number): void {
    if (!this.bottomsheetElement) return;

    const screenHeight = window.innerHeight;
    const minHeight = screenHeight * 0.15;
    const maxHeight = screenHeight * 1.0;

    const clampedHeight = Math.max(minHeight, Math.min(maxHeight, height));

    // Calculate translateY to show only the desired height
    // Bottom edge stays at screen bottom, top edge moves
    const translateY = screenHeight - clampedHeight;

    this.currentHeight = clampedHeight;
    this.bottomsheetElement.style.transform = `translateY(${translateY}px)`;

    this.updateScrollBehaviorByHeight(clampedHeight);
  }

  private updateScrollBehaviorByHeight(height: number): void {
    if (!this.bottomsheetElement) return;

    const screenHeight = window.innerHeight;
    const scrollableThreshold = screenHeight * 0.92;

    const contentContainer = this.bottomsheetElement.querySelector(
      '.dashboard-content'
    ) as HTMLElement;
    if (contentContainer) {
      if (height > scrollableThreshold) {
        contentContainer.style.overflowY = 'auto';
        contentContainer.style.maxHeight = `${height - 120}px`; // Учитываем высоту заголовка
      } else {
        contentContainer.style.overflowY = 'hidden';
        contentContainer.style.maxHeight = 'none';
      }
    }
  }

  private createFigmaHeader(): void {
    if (!this.bottomsheetElement) return;

    const header = document.createElement('div');
    header.className = 'bottomsheet-header';

    // Dragger
    const dragger = document.createElement('div');
    dragger.className = 'dragger';
    const draggerHandle = document.createElement('div');
    draggerHandle.className = 'dragger-handle';
    dragger.appendChild(draggerHandle);

    // Search bar
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-nav-bar';
    searchContainer.innerHTML = `
      <div class="search-nav-content">
        <div class="search-field-container">
          <div class="search-field">
            <div class="search-icon">
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M8.5 15.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM15.5 15.5l-3.87-3.87" 
                      stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="search-placeholder">Поиск в Москве</div>
          </div>
        </div>
      </div>
    `;

    // Add click handler to search field
    const searchField = searchContainer.querySelector('.search-field') as HTMLElement;
    if (searchField) {
      searchField.style.cursor = 'pointer';
      searchField.addEventListener('click', () => {
        this.handleSearchFieldClick();
      });
    }

    header.appendChild(dragger);
    header.appendChild(searchContainer);
    this.bottomsheetElement.appendChild(header);
  }

  /**
   * Обработка клика по поисковому полю
   */
  private handleSearchFieldClick(): void {
    // Navigate to SuggestScreen
    this.props.searchFlowManager.goToSuggest();

    // Call onSearchFocus callback if provided
    this.props.onSearchFocus?.();
  }

  /**
   * Handle screen changes from SearchFlowManager
   */
  public handleScreenChange(from: ScreenType, to: ScreenType, context: SearchContext): void {
    console.log(`📱 DashboardScreen handling navigation: ${from} → ${to}`);

    // Hide filter bar when leaving search result screen
    if (from === ScreenType.SEARCH_RESULT && to !== ScreenType.SEARCH_RESULT) {
      this.filterBarManager.hide();
    }

    switch (to) {
      case ScreenType.SUGGEST:
        this.showSuggestContent();
        break;
      case ScreenType.DASHBOARD:
        this.showDashboardContent();
        break;
      case ScreenType.SEARCH_RESULT:
        this.showSearchResultContent(context);
        break;
      case ScreenType.ORGANIZATION:
        this.showOrganizationContent(context);
        break;
      case ScreenType.SHOP:
        this.showShopContent(context);
        break;
      case ScreenType.CART:
        this.showCartContent();
        break;
      case ScreenType.CHECKOUT:
        this.showCheckoutContent();
        break;
    }

    this.currentScreen = to;
  }

  /**
   * Show suggest content in the bottomsheet
   */
  private showSuggestContent(): void {
    if (!this.bottomsheetElement) return;

    // First snap to fullscreen using both managers
    this.props.bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);
    this.snapToState(BottomsheetState.FULLSCREEN);

    // Update header to suggest state
    this.updateHeaderForSuggest();

    // Update content to suggest content
    const contentContainer = this.bottomsheetElement?.querySelector(
      '.dashboard-content'
    ) as HTMLElement;
    if (contentContainer) {
      this.contentManager.updateContentForSuggest(contentContainer);
    }
  }

  /**
   * Show dashboard content in the bottomsheet
   */
  private showDashboardContent(): void {
    if (!this.bottomsheetElement) return;

    // Snap to default height
    this.props.bottomsheetManager.snapToState(BottomsheetState.DEFAULT);

    // Update header to dashboard state
    this.updateHeaderForDashboard();

    // Update content to dashboard content
    const contentContainer = this.bottomsheetElement?.querySelector(
      '.dashboard-content'
    ) as HTMLElement;
    if (contentContainer) {
      this.contentManager.updateContentForDashboard(contentContainer);
    }
  }

  /**
   * Show search result content in the bottomsheet
   */
  private showSearchResultContent(context: SearchContext): void {
    if (!this.bottomsheetElement) return;

    // Snap to fullscreen
    this.props.bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);
    this.snapToState(BottomsheetState.FULLSCREEN);

    // Update header to search result state
    this.updateHeaderForSearchResult(context);

    // Update content to search result content
    const contentContainer = this.bottomsheetElement?.querySelector(
      '.dashboard-content'
    ) as HTMLElement;
    if (contentContainer) {
      this.contentManager.updateContentForSearchResult(contentContainer, context);
      this.filterBarManager.show();
    }
  }

  /**
   * Show organization content in the bottomsheet
   */
  private showOrganizationContent(context: SearchContext): void {
    if (!this.bottomsheetElement || !context.selectedOrganization) return;

    // Clean up any existing organization screen
    if (this.organizationScreen) {
      this.organizationScreen.destroy();
      this.organizationScreen = undefined;
    }

    // Replace bottomsheet content while preserving gesture handling
    this.replaceBottomsheetContent((container: HTMLElement) => {
      // Create the organization screen in the content container
      this.organizationScreen = new OrganizationScreen({
        container: container,
        searchFlowManager: this.props.searchFlowManager,
        bottomsheetManager: this.props.bottomsheetManager,
        mapSyncService: this.props.mapSyncService,
        organization: context.selectedOrganization!,
        previousScrollPosition: this.props.searchFlowManager.getSavedScrollPosition?.(
          ScreenType.SEARCH_RESULT
        ),
        onBack: () => {
          // Clean up organization screen when going back
          if (this.organizationScreen) {
            this.organizationScreen.destroy();
            this.organizationScreen = undefined;
          }
          // Restore the original dashboard content
          this.restoreDashboardBottomsheet();
        },
      });

      // Activate the organization screen
      this.organizationScreen.activate();
    });
  }

  /**
   * Show shop content in the bottomsheet
   */
  private showShopContent(context: SearchContext): void {
    if (!this.bottomsheetElement || !context.selectedShop) return;

    // Clean up any existing shop screen
    if (this.shopScreen) {
      this.shopScreen.destroy();
      this.shopScreen = undefined;
    }

    // Replace bottomsheet content while preserving gesture handling
    this.replaceBottomsheetContent((container: HTMLElement) => {
      // Create the shop screen in the content container
      this.shopScreen = new ShopScreen({
        container: container,
        searchFlowManager: this.props.searchFlowManager,
        bottomsheetManager: this.props.bottomsheetManager,
        mapSyncService: this.props.mapSyncService,
        cartService: this.props.cartService,
        previousScrollPosition: this.props.searchFlowManager.getSavedScrollPosition?.(
          ScreenType.ORGANIZATION
        ),
        onBack: () => {
          // Clean up shop screen when going back
          if (this.shopScreen) {
            this.shopScreen.destroy();
            this.shopScreen = undefined;
          }
          // Go back to organization screen instead of dashboard
          this.props.searchFlowManager.goBack();
        },
        onCartClick: () => {
          // Navigate to cart screen
          this.props.searchFlowManager.goToCart();
        },
      });

      // Activate the shop screen
      this.shopScreen.activate();
    });

    // Snap to fullscreen for shop screen (90%), or use saved state if returning
    const savedState = this.props.searchFlowManager.getSavedBottomsheetState?.(ScreenType.SHOP);
    const targetState = savedState || BottomsheetState.FULLSCREEN;
    this.props.bottomsheetManager.snapToState(targetState);
    this.snapToState(targetState);
  }

  /**
   * Show cart content in the bottomsheet
   */
  private showCartContent(): void {
    if (!this.bottomsheetElement) return;

    // Clean up any existing cart screen
    if (this.cartScreen) {
      this.cartScreen.destroy();
      this.cartScreen = undefined;
    }

    // Replace bottomsheet content while preserving gesture handling
    this.replaceBottomsheetContent((container: HTMLElement) => {
      // Create the cart screen in the content container
      this.cartScreen = new CartScreen({
        container: container,
        searchFlowManager: this.props.searchFlowManager,
        bottomsheetManager: this.props.bottomsheetManager,
        mapSyncService: this.props.mapSyncService,
        cartService: this.props.cartService,
        previousScrollPosition: this.props.searchFlowManager.getSavedScrollPosition?.(
          ScreenType.SHOP
        ),
        onBack: () => {
          // Clean up cart screen when going back
          if (this.cartScreen) {
            this.cartScreen.destroy();
            this.cartScreen = undefined;
          }
          // Go back to shop screen
          this.props.searchFlowManager.goBack();
        },
        onOrderClick: cartState => {
          console.log('Order clicked from cart:', cartState);
          // TODO: Implement order functionality
        },
      });

      // Activate the cart screen
      this.cartScreen.activate();
    });

    // Snap to fullscreen for cart screen (90%), or use saved state if returning
    const savedState = this.props.searchFlowManager.getSavedBottomsheetState?.(ScreenType.CART);
    const targetState = savedState || BottomsheetState.FULLSCREEN;
    this.props.bottomsheetManager.snapToState(targetState);
    this.snapToState(targetState);
  }

  /**
   * Show checkout content in the bottomsheet
   */
  private showCheckoutContent(): void {
    if (!this.bottomsheetElement) return;

    // Clean up any existing checkout screen
    if (this.checkoutScreen) {
      this.checkoutScreen.destroy();
      this.checkoutScreen = undefined;
    }

    // Replace bottomsheet content while preserving gesture handling
    this.replaceBottomsheetContent((container: HTMLElement) => {
      // Create the checkout screen in the content container
      this.checkoutScreen = new CheckoutScreen({
        container: container,
        searchFlowManager: this.props.searchFlowManager,
        bottomsheetManager: this.props.bottomsheetManager,
        mapSyncService: this.props.mapSyncService,
        cartService: this.props.cartService,
        checkoutService: this.props.checkoutService,
        previousScrollPosition: this.props.searchFlowManager.getSavedScrollPosition?.(
          ScreenType.CART
        ),
        onClose: () => {
          // Clean up checkout screen when closing
          if (this.checkoutScreen) {
            this.checkoutScreen.destroy();
            this.checkoutScreen = undefined;
          }
          // Go back to cart screen
          this.props.searchFlowManager.goBack();
        },
        onProcessPayment: checkoutState => {
          console.log('Payment processing:', checkoutState);
          // TODO: Implement payment processing
        },
      });

      // Activate the checkout screen
      this.checkoutScreen.activate();
    });

    // Snap to fullscreen for checkout (90%), or use saved state if returning
    const savedState = this.props.searchFlowManager.getSavedBottomsheetState?.(ScreenType.CHECKOUT);
    const targetState = savedState || BottomsheetState.FULLSCREEN;
    this.props.bottomsheetManager.snapToState(targetState);
    this.snapToState(targetState);
  }

  /**
   * Replace bottomsheet content while preserving structure and gesture handling
   */
  private replaceBottomsheetContent(contentCreator: (container: HTMLElement) => void): void {
    if (!this.bottomsheetElement) return;

    // Clear the entire bottomsheet content
    this.bottomsheetElement.innerHTML = '';

    // Create a wrapper for drag-handle at the top
    const dragHandle = document.createElement('div');
    dragHandle.className = 'bottomsheet-drag-handle-area';
    dragHandle.style.cssText = `
      display: flex;
      height: 20px;
      padding: 16px 0 6px 0;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      align-self: stretch;
      position: relative;
      flex-shrink: 0;
    `;

    const dragger = document.createElement('div');
    dragger.className = 'bottomsheet-drag-handle';
    dragger.style.cssText = `
      width: 40px;
      height: 4px;
      flex-shrink: 0;
      border-radius: 6px;
      background: rgba(137, 137, 137, 0.25);
      cursor: grab;
    `;

    dragHandle.appendChild(dragger);
    this.bottomsheetElement.appendChild(dragHandle);

    // Create content container that fills remaining space
    const contentContainer = document.createElement('div');
    contentContainer.className = 'bottomsheet-content-area';
    contentContainer.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      pointer-events: auto;
    `;

    this.bottomsheetElement.appendChild(contentContainer);

    // Let the content creator populate the container
    contentCreator(contentContainer);

    // Re-setup gesture handling on the drag handle
    if (this.gestureManager) {
      this.gestureManager.setupBottomsheetEventListeners();
    }
  }

  /**
   * Restore the original dashboard bottomsheet content
   */
  private restoreDashboardBottomsheet(): void {
    if (!this.bottomsheetElement) return;

    // Clear the bottomsheet
    this.bottomsheetElement.innerHTML = '';

    // Recreate the original Figma header and content
    this.createFigmaHeader();

    // Create content container
    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    `;

    this.bottomsheetElement.appendChild(content);

    // Restore dashboard content based on current screen
    switch (this.currentScreen) {
      case ScreenType.DASHBOARD:
        this.showDashboardContent();
        break;
      case ScreenType.SEARCH_RESULT:
        this.showSearchResultContent(this.props.searchFlowManager.searchContext);
        break;
      case ScreenType.SUGGEST:
        this.showSuggestContent();
        break;
      default:
        this.showDashboardContent();
        break;
    }
  }

  /**
   * Update header for suggest screen (pixel-perfect Figma match)
   */
  private updateHeaderForSuggest(): void {
    const header = this.bottomsheetElement?.querySelector('.bottomsheet-header') as HTMLElement;
    if (!header) return;

    // Clear existing header and apply exact Figma CSS structure
    header.innerHTML = '';
    header.className = 'inline-element-1';

    // Apply header styles from Figma CSS - exact match
    header.style.cssText = `
      display: flex;
      padding: 16px 0 8px 0;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      border-radius: 16px 16px 0 0;
      background: rgba(255, 255, 255, 0.70);
      backdrop-filter: blur(20px);
      position: relative;
    `;

    // Drag handle section (inline-element-2)
    const dragSection = document.createElement('div');
    dragSection.className = 'inline-element-2';
    dragSection.style.cssText = `
      display: flex;
      height: 0;
      padding-bottom: 6px;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      align-self: stretch;
      position: relative;
    `;

    // Drag handle (inline-element-3)
    const dragHandle = document.createElement('div');
    dragHandle.className = 'inline-element-3';
    dragHandle.style.cssText = `
      width: 40px;
      height: 4px;
      flex-shrink: 0;
      border-radius: 6px;
      background: rgba(20, 20, 20, 0.09);
      position: relative;
    `;
    dragSection.appendChild(dragHandle);

    // Nav bar (inline-element-4)
    const navBar = document.createElement('div');
    navBar.className = 'inline-element-4';
    navBar.style.cssText = `
      display: flex;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    // Nav bar inner (inline-element-5)
    const navBarInner = document.createElement('div');
    navBarInner.className = 'inline-element-5';
    navBarInner.style.cssText = `
      display: flex;
      padding: 0 16px;
      align-items: flex-start;
      gap: 12px;
      flex: 1 0 0;
      position: relative;
    `;

    // Header (text field container - inline-element-6)
    const headerContainer = document.createElement('div');
    headerContainer.className = 'inline-element-6';
    headerContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1 0 0;
      position: relative;
    `;

    // Text field (inline-element-7)
    const textField = document.createElement('div');
    textField.className = 'inline-element-7';
    textField.style.cssText = `
      display: flex;
      height: 40px;
      padding: 10px 8px;
      align-items: center;
      align-self: stretch;
      border-radius: 8px;
      background: rgba(20, 20, 20, 0.09);
      position: relative;
      gap: 4px;
    `;

    // Search icon position (inline-element-8)
    const searchIconPosition = document.createElement('div');
    searchIconPosition.className = 'inline-element-8';
    searchIconPosition.style.cssText = `
      display: flex;
      width: 20px;
      height: 20px;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    `;

    // Search icon (inline-element-10)
    const searchIcon = document.createElement('div');
    searchIcon.className = 'inline-element-10';
    searchIcon.innerHTML = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#898989" stroke-width="1.5"/><path d="m21 21-4.35-4.35" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    searchIcon.style.cssText = `
      width: 19px;
      height: 19px;
      flex-shrink: 0;
    `;

    searchIconPosition.appendChild(searchIcon);

    // Cursor line (inline-element-11)
    const cursorLine = document.createElement('div');
    cursorLine.className = 'inline-element-11';
    cursorLine.style.cssText = `
      width: 2px;
      height: 20px;
      border-radius: 1px;
      background: #1BA136;
      flex-shrink: 0;
    `;

    // Create input element for functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.value = 'ме';
    searchInput.style.cssText = `
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 15px;
      font-style: normal;
      line-height: 20px;
      letter-spacing: -0.3px;
      border: none;
      outline: none;
      background: transparent;
      padding: 0;
      margin: 0;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;

    // Clear icon container (fixed width to prevent overflow)
    const clearIconContainer = document.createElement('div');
    clearIconContainer.className = 'inline-element-15';
    clearIconContainer.style.cssText = `
      display: flex;
      width: 24px;
      height: 20px;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      cursor: pointer;
    `;

    // Clear icon color (inline-element-16)
    const clearIconColor = document.createElement('div');
    clearIconColor.className = 'inline-element-16';
    clearIconColor.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    clearIconColor.style.cssText = `
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    `;

    clearIconContainer.appendChild(clearIconColor);

    // Assemble text field in proper order
    textField.appendChild(searchIconPosition);
    textField.appendChild(cursorLine);
    textField.appendChild(searchInput);
    textField.appendChild(clearIconContainer);

    headerContainer.appendChild(textField);
    navBarInner.appendChild(headerContainer);

    // Action right - close button (inline-element-17)
    const actionRight = document.createElement('div');
    actionRight.className = 'inline-element-17';
    actionRight.style.cssText = `
      display: flex;
      align-items: flex-start;
      border-radius: 8px;
      position: relative;
      cursor: pointer;
    `;

    // Button (inline-element-18)
    const button = document.createElement('div');
    button.className = 'inline-element-18';
    button.style.cssText = `
      display: flex;
      padding: 8px;
      justify-content: center;
      align-items: center;
      background: rgba(20, 20, 20, 0.06);
      position: relative;
      border-radius: 8px;
    `;

    // Icon position close (inline-element-19)
    const iconPositionClose = document.createElement('div');
    iconPositionClose.className = 'inline-element-19';
    iconPositionClose.style.cssText = `
      display: flex;
      width: 24px;
      height: 24px;
      justify-content: center;
      align-items: center;
      position: relative;
    `;

    // Close icon container (inline-element-20)
    const closeIconContainer = document.createElement('div');
    closeIconContainer.className = 'inline-element-20';
    closeIconContainer.style.cssText = `
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      position: absolute;
      left: 0px;
      top: 0px;
    `;

    // Close icon color (inline-element-21)
    const closeIconColor = document.createElement('div');
    closeIconColor.className = 'inline-element-21';
    closeIconColor.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    closeIconColor.style.cssText = `
      width: 13px;
      height: 13px;
      flex-shrink: 0;
      fill: #141414;
      position: absolute;
      left: 5px;
      top: 5px;
    `;

    closeIconContainer.appendChild(closeIconColor);
    iconPositionClose.appendChild(closeIconContainer);
    button.appendChild(iconPositionClose);
    actionRight.appendChild(button);
    navBarInner.appendChild(actionRight);

    navBar.appendChild(navBarInner);

    // Assemble header
    header.appendChild(dragSection);
    header.appendChild(navBar);

    // Event listeners
    actionRight.addEventListener('click', () => {
      this.props.searchFlowManager.goToDashboard();
    });

    clearIconContainer.addEventListener('click', e => {
      e.stopPropagation();
      searchInput.value = '';
      searchInput.focus();
    });

    // Add Enter key handler
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          this.props.searchFlowManager.goToSearchResults(query);
        }
      }
    });

    // Focus the search input
    setTimeout(() => searchInput.focus(), 100);
  }

  /**
   * Update header for dashboard screen
   */
  private updateHeaderForDashboard(): void {
    const header = this.bottomsheetElement?.querySelector('.bottomsheet-header') as HTMLElement;
    if (!header) return;

    // Clear existing header
    header.innerHTML = '';

    // Create dashboard header with clickable search field
    const dragger = document.createElement('div');
    dragger.className = 'dragger';
    const draggerHandle = document.createElement('div');
    draggerHandle.className = 'dragger-handle';
    dragger.appendChild(draggerHandle);

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-nav-bar';
    searchContainer.innerHTML = `
      <div class="search-nav-content">
        <div class="search-field-container">
          <div class="search-field">
            <div class="search-icon">
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M8.5 15.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM15.5 15.5l-3.87-3.87" 
                      stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="search-placeholder">Поиск в Москве</div>
          </div>
        </div>
      </div>
    `;

    // Add click handler to search field
    const searchField = searchContainer.querySelector('.search-field') as HTMLElement;
    if (searchField) {
      searchField.style.cursor = 'pointer';
      searchField.addEventListener('click', () => {
        this.handleSearchFieldClick();
      });
    }

    header.appendChild(dragger);
    header.appendChild(searchContainer);
  }

  /**
   * Update header for search result screen (based on Figma design)
   */
  private updateHeaderForSearchResult(context: SearchContext): void {
    const header = this.bottomsheetElement?.querySelector('.bottomsheet-header') as HTMLElement;
    if (!header) return;

    // Clear existing header
    header.innerHTML = '';
    header.className = 'inline-element-1';

    // Apply header styles from Figma - search result header
    header.style.cssText = `
      display: flex;
      padding: 16px 0 8px 0;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      border-radius: 16px 16px 0 0;
      background: rgba(255, 255, 255, 0.70);
      backdrop-filter: blur(20px);
      position: relative;
    `;

    // Drag handle section
    const dragSection = document.createElement('div');
    dragSection.className = 'inline-element-3';
    dragSection.style.cssText = `
      display: flex;
      height: 0;
      padding-bottom: 6px;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      align-self: stretch;
      position: relative;
    `;

    const dragHandle = document.createElement('div');
    dragHandle.className = 'inline-element-4';
    dragHandle.style.cssText = `
      width: 40px;
      height: 4px;
      flex-shrink: 0;
      border-radius: 6px;
      background: rgba(20, 20, 20, 0.09);
      position: relative;
    `;
    dragSection.appendChild(dragHandle);

    // Nav bar section
    const navBar = document.createElement('div');
    navBar.className = 'inline-element-5';
    navBar.style.cssText = `
      display: flex;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const navBarInner = document.createElement('div');
    navBarInner.className = 'inline-element-6';
    navBarInner.style.cssText = `
      display: flex;
      padding: 0 16px;
      align-items: flex-start;
      gap: 12px;
      flex: 1 0 0;
      position: relative;
    `;

    // Search field container
    const searchFieldContainer = document.createElement('div');
    searchFieldContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1 0 0;
      position: relative;
    `;

    const searchField = document.createElement('div');
    searchField.style.cssText = `
      display: flex;
      height: 40px;
      padding: 10px 8px;
      align-items: center;
      align-self: stretch;
      border-radius: 8px;
      background: rgba(255, 255, 255, 1);
      border: 1px solid rgba(137, 137, 137, 0.30);
      position: relative;
      gap: 4px;
    `;

    const searchIcon = document.createElement('div');
    searchIcon.innerHTML = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#898989" stroke-width="1.5"/><path d="m21 21-4.35-4.35" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    searchIcon.style.cssText = `
      width: 19px;
      height: 19px;
      flex-shrink: 0;
    `;

    const queryText = document.createElement('span');
    queryText.textContent = context.query || 'Автосервис';
    queryText.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 15px;
      font-style: normal;
      line-height: 20px;
      letter-spacing: -0.3px;
      flex: 1;
    `;

    const salutIcon = document.createElement('div');
    salutIcon.innerHTML = `<div style="width: 24px; height: 24px; background: #F5353C; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">S</div>`;
    salutIcon.style.cssText = `
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    `;

    searchField.appendChild(searchIcon);
    searchField.appendChild(queryText);
    searchField.appendChild(salutIcon);
    searchFieldContainer.appendChild(searchField);
    navBarInner.appendChild(searchFieldContainer);

    const closeButton = document.createElement('div');
    closeButton.className = 'inline-element-17';
    closeButton.style.cssText = `
      display: flex;
      align-items: flex-start;
      border-radius: 8px;
      cursor: pointer;
    `;

    const closeButtonInner = document.createElement('div');
    closeButtonInner.className = 'inline-element-18';
    closeButtonInner.style.cssText = `
      display: flex;
      padding: 8px;
      justify-content: center;
      align-items: center;
      background: rgba(20, 20, 20, 0.06);
      border-radius: 8px;
    `;

    const closeIcon = document.createElement('div');
    closeIcon.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    closeIcon.style.cssText = `
      width: 13px;
      height: 13px;
    `;

    closeButtonInner.appendChild(closeIcon);
    closeButton.appendChild(closeButtonInner);
    navBarInner.appendChild(closeButton);
    navBar.appendChild(navBarInner);

    header.appendChild(dragSection);
    header.appendChild(navBar);

    closeButton.addEventListener('click', () => {
      this.props.searchFlowManager.goToDashboard();
    });
  }

  private createBottomFilterBar(container: HTMLElement): void {
    this.cleanupFixedFilterBar();

    const filterBarWrapper = document.createElement('div');
    filterBarWrapper.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: #FFF;
      border-radius: 16px 16px 0 0;
      padding: 16px;
      padding-bottom: calc(16px + env(safe-area-inset-bottom));
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    `;

    this.createFilterBar(filterBarWrapper);

    this.fixedFilterBar = filterBarWrapper;

    document.body.appendChild(filterBarWrapper);
  }

  private cleanupFixedFilterBar(): void {
    if (this.fixedFilterBar && this.fixedFilterBar.parentNode) {
      this.fixedFilterBar.parentNode.removeChild(this.fixedFilterBar);
      this.fixedFilterBar = undefined;
    }
  }

  private createFilterBar(container: HTMLElement): void {
    const filterBar = document.createElement('div');
    filterBar.className = 'inline-element-1';
    filterBar.style.cssText = `
      display: flex;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'inline-element-2';
    filtersContainer.style.cssText = `
      display: flex;
      padding: 0 16px;
      align-items: flex-start;
      gap: 8px;
      flex: 1 0 0;
      position: relative;
      overflow-x: auto;
    `;

    const filters = [
      { text: '8', hasCounter: true },
      { text: 'Рядом', hasCounter: false },
      { text: 'Открыто', hasCounter: false },
      { text: 'Доставка', hasCounter: false },
    ];

    filters.forEach(filter => {
      const filterButton = document.createElement('div');
      filterButton.style.cssText = `
        display: flex;
        height: 40px;
        padding: 8px 12px;
        justify-content: center;
        align-items: center;
        gap: 4px;
        border-radius: 8px;
        background: rgba(20, 20, 20, 0.06);
        cursor: pointer;
        flex-shrink: 0;
      `;

      if (filter.hasCounter) {
        const counter = document.createElement('div');
        counter.style.cssText = `
          display: flex;
          width: 16px;
          height: 16px;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          background: #1BA136;
        `;

        const counterText = document.createElement('span');
        counterText.textContent = filter.text;
        counterText.style.cssText = `
          color: #FFF;
          font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
          font-weight: 500;
          font-size: 13px;
          line-height: 16px;
          letter-spacing: -0.234px;
        `;

        counter.appendChild(counterText);
        filterButton.appendChild(counter);
      } else {
        const text = document.createElement('span');
        text.textContent = filter.text;
        text.style.cssText = `
          color: #141414;
          font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
          font-weight: 500;
          font-size: 15px;
          line-height: 20px;
          letter-spacing: -0.3px;
        `;

        filterButton.appendChild(text);
      }

      filtersContainer.appendChild(filterButton);
    });

    filterBar.appendChild(filtersContainer);
    container.appendChild(filterBar);
  }

  /**
   * Create small promo banner (like in Figma)
   */
  private createPromoBannerSmall(): HTMLElement {
    const banner = document.createElement('div');
    banner.style.cssText = `
      display: flex;
      margin: 16px;
      align-items: flex-start;
      align-self: stretch;
      border-radius: 12px;
      background: #FFF;
      border: 0.5px solid rgba(137, 137, 137, 0.30);
      overflow: hidden;
    `;

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      width: 80px;
      height: 80px;
              background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      flex-shrink: 0;
    `;

    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
      display: flex;
      padding: 12px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      flex: 1 0 0;
      gap: 4px;
    `;

    const title = document.createElement('h4');
    title.textContent = 'Фитнес Хаус';
    title.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 600;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.24px;
      margin: 0;
    `;

    const description = document.createElement('p');
    description.textContent = 'Скидка 20% на спортивную одежду при покупке абонемента на 3 месяца!';
    description.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
      margin: 0;
    `;

    const ctaText = document.createElement('p');
    ctaText.textContent = 'Получить скидку';
    ctaText.style.cssText = `
      color: #1BA136;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 500;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
      margin: 0;
      cursor: pointer;
    `;

    contentContainer.appendChild(title);
    contentContainer.appendChild(description);
    contentContainer.appendChild(ctaText);

    banner.appendChild(imageContainer);
    banner.appendChild(contentContainer);

    return banner;
  }
}

/**
 * Фабрика для создания DashboardScreen
 */
export class DashboardScreenFactory {
  /**
   * Создание экрана дашборда
   */
  static create(props: DashboardScreenProps): DashboardScreen {
    return new DashboardScreen(props);
  }

  /**
   * Создание экрана с настройками по умолчанию
   */
  static createDefault(
    container: HTMLElement,
    searchFlowManager: SearchFlowManager,
    bottomsheetManager: BottomsheetManager,
    filterBarManager: FilterBarManager,
    cartService: CartService,
    checkoutService: CheckoutService,
    mapManager: MapManager
  ): DashboardScreen {
    return new DashboardScreen({
      container,
      searchFlowManager,
      bottomsheetManager,
      filterBarManager,
      cartService,
      checkoutService,
      mapManager,
    });
  }
}
