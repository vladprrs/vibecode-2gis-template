import { ScreenType, BottomsheetState, SearchContext } from '../../types';
import {
  SearchFlowManager,
  BottomsheetManager,
  MapSyncService,
  BottomsheetGestureManager,
  BottomsheetAnimationManager
} from '../../services';
import { 
  BottomsheetContainer, 
  BottomsheetHeader, 
  BottomsheetContent,
  BottomsheetContainerProps 
} from '../Bottomsheet';
import { SearchBar, SearchBarState } from '../Search';
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
  /** Сервис синхронизации карты */
  mapSyncService?: MapSyncService;
  /** 2GIS MapGL API ключ */
  mapApiKey?: string;
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
  private mapComponent: any;
  
  // Компоненты
  private bottomsheetContainer?: BottomsheetContainer;
  private bottomsheetHeader?: BottomsheetHeader;
  private bottomsheetContent?: BottomsheetContent;
  private searchBar?: SearchBar;
  private fixedFilterBar?: HTMLElement;
  
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
  private dashboardContent?: HTMLElement;
  private suggestContent?: HTMLElement;

  constructor(props: DashboardScreenProps) {
    this.props = props;
    this.element = props.container;
    this.initialize();
  }

  /**
   * Инициализация экрана
   */
  private async initialize(): Promise<void> {
    this.setupElement();
    await this.createMapContainer();
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
  private async createMapContainer(): Promise<void> {
    const mapContainer = document.createElement('div');
    mapContainer.className = 'dashboard-map';
    mapContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 375px;
      max-width: 100%;
      height: 100%;
      z-index: 1;
    `;
    this.element.appendChild(mapContainer);

    try {
      
      await this.waitForMapGL();
      await this.createRealMap(mapContainer);
      
    } catch (error) {
      console.error('Map loading error:', error);
      
      this.createFallbackMap(mapContainer);
    }
  }

  /**
   * Ожидание загрузки MapGL API
   */
  private async waitForMapGL(): Promise<any> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkMapGL = () => {
        attempts++;
        if ((window as any).mapgl && (window as any).mapgl.Map) {
          console.log(`✅ MapGL API v1 загружен (попытка ${attempts})`);
          resolve((window as any).mapgl);
        } else if (attempts >= maxAttempts) {
          reject(new Error('MapGL API v1 не загрузился'));
        } else {
          setTimeout(checkMapGL, 200);
        }
      };
      checkMapGL();
    });
  }

  /**
   * Создание настоящей карты 2GIS
   */
  private async createRealMap(container: HTMLElement): Promise<void> {
    const mapId = `mapgl-container-${Date.now()}`;
    container.id = mapId;

    this.mapComponent = new (window as any).mapgl.Map(mapId, {
      center: [37.620393, 55.75396],
      zoom: 12,
      key: this.props.mapApiKey || 'bfa6ee5b-5e88-44f0-b4ad-394e819f26fc'
    });

    await new Promise<void>((resolve) => {
      let resolved = false;
      this.mapComponent.on('styleload', () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      });
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 5000);
    });

    this.mapComponent.on('click', (event: any) => {
      
      this.addTemporaryMarker([event.lngLat.lng, event.lngLat.lat]);
    });
  }

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
        }
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
    this.bottomsheetElement.style.cssText = `
      display: flex;
      width: 375px;
      max-width: 100%;
      flex-direction: column;
      align-items: flex-start;
      border-radius: 16px 16px 0 0;
      background: #FFF;
      position: absolute;
      left: 0;
      bottom: 0;
      transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
      z-index: 1000;
    `;
    
    // Инициализируем текущую высоту
    const screenHeight = window.innerHeight;
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
    
    // 4. "Советы к месту" heading
    this.createSectionHeading(greySectionContainer, 'Советы к месту');
    
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
        type: 'icon'
      },
      {
        id: 'home',
        text: 'Домой',
        iconSrc: '/assets/images/home.svg',
        type: 'icon'
      },
      {
        id: 'work',
        text: 'На работу',
        iconSrc: '/assets/images/work.svg',
        type: 'icon'
      }
    ];

    // Create ButtonRow component
    new ButtonRow({
      container: buttonRowContainer,
      items: buttonItems,
      onButtonClick: (buttonId: string) => {
        console.log('Button clicked:', buttonId);
        // Handle button clicks here
      }
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
      }
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
    import('./../Dashboard/AdviceGrid').then(({ AdviceGrid }) => {
      new AdviceGrid({
        container,
        onItemClick: (itemId: string) => {
          console.log('Advice item clicked:', itemId);
          this.props.onMetaItemClick?.(itemId);
        }
      });
      
      // Create promo banner after advice grid is loaded
      this.createPromoBanner(container);
    }).catch(error => {
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
    titleText.textContent = 'Суши Маке';

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
    subtitleText.textContent = 'Подарок «Филадельфия с лососем» за первый заказ по промокоду «FILA2»';

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
    ctaText.textContent = 'Получить подарок';



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
    footerTextContent.textContent = 'Реклама • Условия проведения акции смотрите на sushi-make.ru';

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
      case 'small': return 0.2;
      case 'default': return 0.55;
      case 'fullscreen': return 0.9;
      case 'fullscreen_scroll': return 0.95;
      default: return 0.55;
    }
  }

  private addTemporaryMarker(coordinates: [number, number]): void {
    if (!this.mapComponent) return;
    
    // Добавляем временный маркер на карту
    const marker = new (window as any).mapgl.Marker(this.mapComponent, {
      coordinates,
      icon: {
        type: 'circle',
        size: 8,
        color: '#FF0000'
      }
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
      'small': screenHeight * 0.2,
      'default': screenHeight * 0.55,
      'fullscreen': screenHeight * 0.9,
      'fullscreen_scroll': screenHeight * 0.95
    };
    
    const targetHeight = heights[this.currentState as keyof typeof heights];
    if (
      targetHeight &&
      this.currentHeight !== undefined &&
      this.animationManager
    ) {
      this.animationManager.animateToHeight(
        this.currentHeight,
        targetHeight,
        (h) => this.setBottomsheetHeight(h)
      );
    }
    
    // Also update the original bottomsheet container if it exists
    this.bottomsheetContainer?.snapToState(state);
  }

  public centerMoscow(): void {
    this.mapComponent?.setCenter([37.620393, 55.75396]);
    this.mapComponent?.setZoom(12);
  }

  public testRandomMarkers(): void {
    if (!this.mapComponent) return;
    
    const moscowBounds = {
      minLng: 37.3, maxLng: 37.9,
      minLat: 55.5, maxLat: 55.9
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
    if (this.mapComponent) {
      this.mapComponent.destroy();
    }
    this.bottomsheetContainer?.destroy();
    this.bottomsheetHeader?.destroy();
    this.bottomsheetContent?.destroy();
    this.searchBar?.destroy();
    this.cleanupFixedFilterBar();
  }

  /**
   * Методы для работы с оригинальным bottomsheet
   */
  private updateBottomsheetHeight(): void {
    if (!this.bottomsheetElement) return;
    
    const screenHeight = window.innerHeight;
    const heights = {
      'small': screenHeight * 0.2,
      'default': screenHeight * 0.55,
      'fullscreen': screenHeight * 0.9,
      'fullscreen-scroll': screenHeight * 0.95
    };
    
    const height = heights[this.currentState as keyof typeof heights];
    this.setBottomsheetHeight(height);
  }

  private setBottomsheetHeight(height: number): void {
    if (!this.bottomsheetElement) return;
    
    const screenHeight = window.innerHeight;
    const minHeight = screenHeight * 0.15;
    const maxHeight = screenHeight * 0.95;
    
    const clampedHeight = Math.max(minHeight, Math.min(maxHeight, height));
    
    this.currentHeight = clampedHeight;
    this.bottomsheetElement.style.height = `${clampedHeight}px`;
    
    this.updateScrollBehaviorByHeight(clampedHeight);
  }

  private updateScrollBehaviorByHeight(height: number): void {
    if (!this.bottomsheetElement) return;
    
    const screenHeight = window.innerHeight;
    const scrollableThreshold = screenHeight * 0.92;
    
    const contentContainer = this.bottomsheetElement.querySelector('.dashboard-content') as HTMLElement;
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
    
    // Clean up fixed filter bar when leaving search result screen
    if (from === ScreenType.SEARCH_RESULT && to !== ScreenType.SEARCH_RESULT) {
      this.cleanupFixedFilterBar();
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
        // Handle organization screen
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
    this.updateContentForSuggest();
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
    this.updateContentForDashboard();
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
    this.updateContentForSearchResult(context);
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
    
    clearIconContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      searchInput.value = '';
      searchInput.focus();
    });
    
    // Add Enter key handler
    searchInput.addEventListener('keydown', (e) => {
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
   * Update content for suggest screen (based on Figma design)
   */
  private updateContentForSuggest(): void {
    const contentContainer = this.bottomsheetElement?.querySelector('.dashboard-content') as HTMLElement;
    if (!contentContainer) return;
    
    // Store current dashboard content if not already stored
    if (!this.dashboardContent) {
      this.dashboardContent = contentContainer.cloneNode(true) as HTMLElement;
    }
    
    // Clear current content
    contentContainer.innerHTML = '';
    
    // Apply content container styles from Figma
    contentContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      background: rgba(0, 0, 0, 0.00);
      box-shadow: 0 -0.5px 0 0 rgba(137, 137, 137, 0.30) inset;
      position: relative;
      padding: 0;
      margin: 0;
      overflow-y: auto;
    `;
    
    // Create suggestions rows based on Figma
    const suggestions = [
      {
        type: 'home',
        title: 'Дом',
        subtitle: ['Красный проспект, 49', '5 км'],
        hasSubtitle: true,
        icon: 'home'
      },
      {
        type: 'search',
        title: 'Мебель',
        subtitle: [],
        hasSubtitle: false,
        icon: 'search'
      },
      {
        type: 'branch',
        title: 'МЕСТО, инвест-апарты',
        subtitle: ['Красный проспект, 49'],
        hasSubtitle: true,
        icon: 'building'
      },
      {
        type: 'category',
        title: 'Мечети',
        subtitle: ['6 филиалов', 'Место для намаза'],
        hasSubtitle: true,
        icon: 'category'
      },
      {
        type: 'category',
        title: 'Боулинг',
        subtitle: ['6 филиалов', 'Места отдыха'],
        hasSubtitle: true,
        icon: 'category'
      },
      {
        type: 'category',
        title: 'Аквапарки/Водные аттракционы',
        subtitle: ['6 филиалов', 'Места отдыха'],
        hasSubtitle: true,
        icon: 'category'
      },
      {
        type: 'category',
        title: 'Газпромнефть азс',
        subtitle: [],
        hasSubtitle: false,
        icon: 'category'
      },
      {
        type: 'category',
        title: 'Гостиницы',
        subtitle: ['222 филиала'],
        hasSubtitle: true,
        icon: 'category'
      },
      {
        type: 'category',
        title: 'Грильница, сеть ресторанов вкусной…',
        subtitle: ['22 филиала'],
        hasSubtitle: true,
        icon: 'category'
      },
      {
        type: 'transport',
        title: '12, автобус',
        subtitle: ['Александра Чистякова — Дюканова'],
        hasSubtitle: true,
        icon: 'bus'
      },
      {
        type: 'transport',
        title: 'Площадь Калинина, остановка',
        subtitle: ['Новосибирск'],
        hasSubtitle: true,
        icon: 'bus'
      },
      {
        type: 'metro',
        title: 'Октябрьская',
        subtitle: ['Ленинская линия', '5 км'],
        hasSubtitle: true,
        icon: 'metro'
      }
    ];
    
    suggestions.forEach((suggestion, index) => {
      const suggestionRow = this.createSuggestionRow(suggestion, index === suggestions.length - 1);
      contentContainer.appendChild(suggestionRow);
    });
  }

  /**
   * Create a suggestion row based on Figma design
   */
  private createSuggestionRow(suggestion: any, isLast: boolean): HTMLElement {
    const row = document.createElement('div');
    row.style.cssText = `
      display: flex;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;
    
    const contentRow = document.createElement('div');
    contentRow.style.cssText = `
      display: flex;
      padding-left: 16px;
      align-items: flex-start;
      gap: 12px;
      flex: 1 0 0;
      position: relative;
      padding-top: 16px;
      padding-bottom: 16px;
      ${!isLast ? 'border-bottom: 0.5px solid rgba(137, 137, 137, 0.30);' : ''}
      cursor: pointer;
    `;
    
    // Icon container
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      width: 24px;
      height: 24px;
      position: relative;
      margin-top: -2px;
    `;
    
    // Icon based on type
    let iconSvg = '';
    switch (suggestion.icon) {
      case 'home':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="9,22 9,12 15,12 15,22" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'search':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="#898989" stroke-width="1.5"/>
          <path d="m21 21-4.35-4.35" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'building':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'category':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#898989" stroke-width="1.5"/>
          <path d="M12 6v6l4 2" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'bus':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M8 6v6M16 6v6M4 15l4-9 8 0 4 9-4 2-8 0-4-2z" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'metro':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#898989" stroke-width="1.5"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="9" y1="9" x2="9.01" y2="9" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="15" y1="9" x2="15.01" y2="9" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      default:
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#898989" stroke-width="1.5"/>
        </svg>`;
    }
    
    iconContainer.innerHTML = iconSvg;
    
    // Content container
    const textContent = document.createElement('div');
    textContent.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1 0 0;
      position: relative;
    `;
    
    // Title
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;
    
    const title = document.createElement('div');
    title.style.cssText = `
      flex: 1 0 0;
      font-family: 'SB Sans Text', -apple-system, Roboto, Helvetica, sans-serif;
      font-style: normal;
      font-weight: ${suggestion.type === 'home' ? '500' : '400'};
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.24px;
      color: #141414;
      position: relative;
    `;
    
    // Highlight search term in title
    if (suggestion.title.toLowerCase().includes('ме')) {
      const parts = suggestion.title.split(/(ме|МЕ)/gi);
      title.innerHTML = parts.map((part: string) => 
        part.toLowerCase() === 'ме' || part === 'МЕ' 
          ? `<span style="font-weight: 500;">${part}</span>` 
          : part
      ).join('');
    } else {
      title.textContent = suggestion.title;
    }
    
    titleContainer.appendChild(title);
    textContent.appendChild(titleContainer);
    
    // Subtitle (if exists)
    if (suggestion.hasSubtitle && suggestion.subtitle.length > 0) {
      const subtitleContainer = document.createElement('div');
      subtitleContainer.style.cssText = `
        display: flex;
        align-items: flex-start;
        align-self: stretch;
        position: relative;
        gap: 4px;
      `;
      
      suggestion.subtitle.forEach((subtitleText: string, index: number) => {
        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
          font-family: 'SB Sans Text', -apple-system, Roboto, Helvetica, sans-serif;
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 18px;
          letter-spacing: -0.28px;
          color: #898989;
          position: relative;
        `;
        subtitle.textContent = subtitleText;
        subtitleContainer.appendChild(subtitle);
        
        // Add dot separator between subtitle parts
        if (index < suggestion.subtitle.length - 1) {
          const separator = document.createElement('div');
          separator.style.cssText = `
            color: #898989;
            font-size: 14px;
            line-height: 18px;
          `;
          separator.textContent = '•';
          subtitleContainer.appendChild(separator);
        }
      });
      
      textContent.appendChild(subtitleContainer);
    }
    
    // Add click handler
    contentRow.addEventListener('click', () => {
      console.log('Suggestion clicked:', suggestion.title);
      this.props.searchFlowManager.goToSearchResults(suggestion.title);
    });
    
    // Hover effects
    contentRow.addEventListener('mouseenter', () => {
      contentRow.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
    });
    
    contentRow.addEventListener('mouseleave', () => {
      contentRow.style.backgroundColor = 'transparent';
    });
    
    contentRow.appendChild(iconContainer);
    contentRow.appendChild(textContent);
    row.appendChild(contentRow);
    
    return row;
  }

  /**
   * Update content for dashboard screen
   */
  private updateContentForDashboard(): void {
    const contentContainer = this.bottomsheetElement?.querySelector('.dashboard-content');
    if (!contentContainer || !this.dashboardContent) return;
    
    // Restore dashboard content
    contentContainer.innerHTML = '';
    const restoredContent = this.dashboardContent.cloneNode(true) as HTMLElement;
    
    // Move child nodes to the container
    while (restoredContent.firstChild) {
      contentContainer.appendChild(restoredContent.firstChild);
    }
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
    
    // Search field (filled state, background=01)
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
    
    // Search icon
    const searchIcon = document.createElement('div');
    searchIcon.innerHTML = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#898989" stroke-width="1.5"/><path d="m21 21-4.35-4.35" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    searchIcon.style.cssText = `
      width: 19px;
      height: 19px;
      flex-shrink: 0;
    `;
    
    // Query text
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
    
    // Salut icon (voice assistant)
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
    
    // Close button
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
    
    // Event listener for close button
    closeButton.addEventListener('click', () => {
      this.props.searchFlowManager.goToDashboard();
    });
  }

  /**
   * Update content for search result screen (based on Figma design)
   */
  private updateContentForSearchResult(context: SearchContext): void {
    const contentContainer = this.bottomsheetElement?.querySelector('.dashboard-content') as HTMLElement;
    if (!contentContainer) return;
    
    // Store dashboard content if not already stored
    if (!this.dashboardContent) {
      this.dashboardContent = contentContainer.cloneNode(true) as HTMLElement;
    }
    
    // Clear current content
    contentContainer.innerHTML = '';
    
    // Apply search result content styles
    contentContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      background: #FFF;
      position: relative;
      padding: 0;
      margin: 0;
      overflow-y: auto;
    `;
    
    // Create results content
    this.createResultsContent(contentContainer, context);
    
    // Create fixed filter bar at bottom of bottomsheet
    this.createBottomFilterBar(contentContainer);
  }

  /**
   * Create fixed filter bar at bottom of bottomsheet
   */
  private createBottomFilterBar(container: HTMLElement): void {
    // Clean up existing filter bar
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
    
    // Store reference for cleanup
    this.fixedFilterBar = filterBarWrapper;
    
    // Append to body so it's fixed relative to viewport
    document.body.appendChild(filterBarWrapper);
  }

  private cleanupFixedFilterBar(): void {
    if (this.fixedFilterBar && this.fixedFilterBar.parentNode) {
      this.fixedFilterBar.parentNode.removeChild(this.fixedFilterBar);
      this.fixedFilterBar = undefined;
    }
  }

  /**
   * Create filter bar based on Figma design
   */
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
    
    // Filter buttons based on Figma
    const filters = [
      { text: '8', hasCounter: true },
      { text: 'Рядом', hasCounter: false },
      { text: 'Открыто', hasCounter: false },
      { text: 'Доставка', hasCounter: false }
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
        // Counter badge
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
        // Regular text
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
   * Create results content based on Figma design
   */
  private createResultsContent(container: HTMLElement, context: SearchContext): void {
    const resultsContainer = document.createElement('div');
    resultsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      background: #FFF;
      position: relative;
      padding-bottom: 80px;
    `;
    
    // Create sample results based on Figma structure
    const results = [
      {
        type: 'advertiser',
        title: 'Реактор',
        subtitle: 'Региональная сеть автокомплексов для японских автомобилей',
        rating: '4.6',
        reviews: '120 оценок',
        distance: '3 мин',
        address: 'Тверская 32/12, 1 этаж, Москва',
        adText: 'Скажи кодовое слово «2ГИС» и получи карточку лояльности!',
        buttonText: 'Записаться на прием',
        hasCrown: true
      },
      {
        type: 'advertiser',
        title: 'Реактор',
        subtitle: 'Региональная сеть автокомплексов для японских автомобилей',
        rating: '4.6',
        reviews: '120 оценок',
        distance: '3 мин',
        address: 'Тверская 32/12, 1 этаж, Москва',
        adText: 'Скажи кодовое слово «2ГИС» и получи карточку лояльности!',
        buttonText: 'Записаться на прием',
        hasCrown: true
      },
      {
        type: 'non-advertiser',
        title: 'Шиномонтаж',
        subtitle: 'Региональная сеть автокомплексов для японских автомобилей',
        rating: '4.6',
        reviews: '120 оценок',
        distance: '3 мин',
        address: 'Тверская 32/12, 1 этаж, Москва',
        parking: '500 мест • Цена в час 50 ₽ • Теплая',
        buttonText: 'Заказать доставку',
        hasFriends: true
      }
    ];
    
    results.forEach((result, index) => {
      const resultCard = this.createResultCard(result);
      resultsContainer.appendChild(resultCard);
      
      // Add banner after second result (like in Figma)
      if (index === 1) {
        const banner = this.createPromoBannerSmall();
        resultsContainer.appendChild(banner);
      }
    });
    
    container.appendChild(resultsContainer);
  }

  /**
   * Create a result card based on Figma design
   */
  private createResultCard(result: any): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      display: flex;
      padding: 16px;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      border-bottom: 0.5px solid rgba(137, 137, 137, 0.30);
      cursor: pointer;
    `;
    
    // Top section with title and rating
    const topSection = document.createElement('div');
    topSection.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      gap: 4px;
    `;
    
    // Title with crown badge if applicable
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      align-items: center;
      align-self: stretch;
      gap: 8px;
    `;
    
    const title = document.createElement('h3');
    title.textContent = result.title;
    title.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 600;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.24px;
      margin: 0;
      flex: 1;
    `;
    
    titleContainer.appendChild(title);
    
    if (result.hasCrown) {
      const crownBadge = document.createElement('div');
      crownBadge.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="#1BA136"><path d="M8 1l2 3h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-3z"/></svg>`;
      titleContainer.appendChild(crownBadge);
    }
    
    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = result.subtitle;
    subtitle.style.cssText = `
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
      margin: 0;
      align-self: stretch;
    `;
    
    topSection.appendChild(titleContainer);
    topSection.appendChild(subtitle);
    
    // Rating and info section
    const infoSection = document.createElement('div');
    infoSection.style.cssText = `
      display: flex;
      align-items: center;
      align-self: stretch;
      gap: 12px;
      margin-top: 8px;
    `;
    
    // Rating stars and score
    const ratingContainer = document.createElement('div');
    ratingContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    
    // Stars (simplified)
    const stars = document.createElement('div');
    stars.innerHTML = '★★★★★';
    stars.style.cssText = `
      color: #FFD700;
      font-size: 12px;
    `;
    
    const ratingText = document.createElement('span');
    ratingText.textContent = result.rating;
    ratingText.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 500;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
    `;
    
    const reviewsText = document.createElement('span');
    reviewsText.textContent = result.reviews;
    reviewsText.style.cssText = `
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
    `;
    
    // Distance
    const distanceText = document.createElement('span');
    distanceText.textContent = result.distance;
    distanceText.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 500;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
    `;
    
    ratingContainer.appendChild(stars);
    ratingContainer.appendChild(ratingText);
    ratingContainer.appendChild(reviewsText);
    infoSection.appendChild(ratingContainer);
    infoSection.appendChild(distanceText);
    
    // Address
    const address = document.createElement('p');
    address.textContent = result.address;
    address.style.cssText = `
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
      margin: 4px 0 0 0;
      align-self: stretch;
    `;
    
    card.appendChild(topSection);
    card.appendChild(infoSection);
    card.appendChild(address);
    
    // Ad section for advertiser results
    if (result.type === 'advertiser' && result.adText) {
      const adSection = document.createElement('div');
      adSection.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        align-self: stretch;
        margin-top: 12px;
        padding: 12px;
        border-radius: 8px;
        background: rgba(27, 161, 54, 0.05);
        gap: 8px;
      `;
      
      const adText = document.createElement('p');
      adText.textContent = result.adText;
      adText.style.cssText = `
        color: #141414;
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
        font-weight: 400;
        font-size: 14px;
        line-height: 18px;
        letter-spacing: -0.28px;
        margin: 0;
      `;
      
      const adButton = document.createElement('button');
      adButton.textContent = result.buttonText;
      adButton.style.cssText = `
        display: flex;
        padding: 8px 12px;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        background: #1BA136;
        color: #FFF;
        border: none;
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
        font-weight: 600;
        font-size: 15px;
        line-height: 20px;
        letter-spacing: -0.3px;
        cursor: pointer;
      `;
      
      const adDisclaimer = document.createElement('p');
      adDisclaimer.textContent = 'Реклама • Есть противопоказания, нужна консультация врача';
      adDisclaimer.style.cssText = `
        color: #898989;
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
        font-weight: 400;
        font-size: 11px;
        line-height: 14px;
        letter-spacing: -0.176px;
        margin: 0;
      `;
      
      adSection.appendChild(adText);
      adSection.appendChild(adButton);
      adSection.appendChild(adDisclaimer);
      card.appendChild(adSection);
    }
    
    // Click handler
    card.addEventListener('click', () => {
      console.log('Result card clicked:', result.title);
      // This will later navigate to Organization screen
    });
    
    return card;
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
    title.textContent = 'Суши Маке';
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
    description.textContent = 'Подарок «Филадельфия с лососем» за первый заказ по промокоду «FILA2»';
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
    ctaText.textContent = 'Получить подарок';
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

  // createFigmaContent method removed - now using createDashboardContent directly
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
    mapApiKey?: string
  ): DashboardScreen {
    return new DashboardScreen({
      container,
      searchFlowManager,
      bottomsheetManager,
      mapApiKey
    });
  }
} 