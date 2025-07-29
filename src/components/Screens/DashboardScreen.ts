import { ScreenType, BottomsheetState } from '../../types';
import { SearchFlowManager, BottomsheetManager, MapSyncService } from '../../services';
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
  
  // Оригинальные параметры bottomsheet
  private bottomsheetElement?: HTMLElement;
  private currentState: string = 'default';
  private currentHeight?: number;
  private isDragging: boolean = false;
  private dragStartY: number = 0;
  private wheelAccumulator: number = 0;
  private wheelThreshold: number = 50;
  private wheelTimeout?: number;
  private isWheelScrolling: boolean = false;
  private touchStartY: number = 0;
  private touchCurrentY: number = 0;
  private isTouchScrolling: boolean = false;

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
    this.setupBottomsheetEventListeners();
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
        iconSrc: '@/assets/images/bookmark.svg',
        type: 'icon'
      },
      {
        id: 'home',
        text: 'Домой',
        iconSrc: '@/assets/images/home.svg',
        type: 'icon'
      },
      {
        id: 'work',
        text: 'На работу',
        iconSrc: '@/assets/images/work.svg',
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
      background: url('/figma_export/dashboard/components/banner/assets/images/img-c6496740.jpg') lightgray 50% / cover no-repeat;
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
    if (targetHeight) {
      this.animateToHeight(targetHeight);
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

  private setupBottomsheetEventListeners(): void {
    if (!this.bottomsheetElement) return;

    // Wheel events для smooth scroll
    this.bottomsheetElement.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    
    // Touch events для mobile
    this.bottomsheetElement.addEventListener('touchstart', this.handleScrollTouchStart.bind(this), { passive: false });
    this.bottomsheetElement.addEventListener('touchmove', this.handleScrollTouchMove.bind(this), { passive: false });
    this.bottomsheetElement.addEventListener('touchend', this.handleScrollTouchEnd.bind(this), { passive: false });
  }

  private handleWheel(event: WheelEvent): void {
    const screenHeight = window.innerHeight;
    const currentHeight = this.currentHeight || screenHeight * 0.55;
    const scrollableThreshold = screenHeight * 0.92;
    
    // Если высота больше 92%, проверяем можно ли скроллить контент
    if (currentHeight > scrollableThreshold) {
      const contentContainer = this.bottomsheetElement?.querySelector('.dashboard-content') as HTMLElement;
      if (contentContainer) {
        const { scrollTop } = contentContainer;
        const isAtTop = scrollTop <= 0;
        
        // Если скроллим вверх и уже наверху, начинаем уменьшать высоту шторки
        if (event.deltaY < 0 && isAtTop) {
          event.preventDefault();
          const newHeight = Math.max(screenHeight * 0.15, currentHeight + event.deltaY * 2);
          this.setBottomsheetHeight(newHeight);
          this.startSnapTimeout();
          return;
        }
        
        return;
      }
    }
    
    event.preventDefault();
    
    // Плавное изменение высоты
    const delta = event.deltaY * 2;
    const newHeight = Math.max(
      screenHeight * 0.15, 
      Math.min(screenHeight * 0.95, currentHeight + delta)
    );
    
    this.setBottomsheetHeight(newHeight);
    this.isWheelScrolling = true;
    
    this.startSnapTimeout();
  }

  private startSnapTimeout(): void {
    if (this.wheelTimeout) {
      clearTimeout(this.wheelTimeout);
    }
    
    this.wheelTimeout = window.setTimeout(() => {
      this.snapToNearestState();
      this.isWheelScrolling = false;
    }, 150);
  }

  private snapToNearestState(): void {
    if (!this.currentHeight) return;
    
    const screenHeight = window.innerHeight;
    const currentRatio = this.currentHeight / screenHeight;
    
    const states = [
      { name: 'small', ratio: 0.2 },
      { name: 'default', ratio: 0.55 },
      { name: 'fullscreen', ratio: 0.9 },
      { name: 'fullscreen-scroll', ratio: 0.95 }
    ];
    
    let nearestState = states[0];
    let minDistance = Math.abs(currentRatio - states[0].ratio);
    
    for (const state of states) {
      const distance = Math.abs(currentRatio - state.ratio);
      if (distance < minDistance) {
        minDistance = distance;
        nearestState = state;
      }
    }
    
    this.currentState = nearestState.name;
    const targetHeight = screenHeight * nearestState.ratio;
    this.animateToHeight(targetHeight);
    
    this.props.bottomsheetManager.snapToState(nearestState.name as any);
  }

  private animateToHeight(targetHeight: number): void {
    if (!this.bottomsheetElement || !this.currentHeight) return;
    
    const startHeight = this.currentHeight;
    const startTime = performance.now();
    const duration = 300;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic bezier easing
      const easeProgress = this.cubicBezierEasing(progress, 0.4, 0.0, 0.2, 1);
      const currentHeight = startHeight + (targetHeight - startHeight) * easeProgress;
      
      this.setBottomsheetHeight(currentHeight);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  private cubicBezierEasing(t: number, x1: number, y1: number, x2: number, y2: number): number {
    // Simplified cubic bezier implementation
    return t * t * (3 - 2 * t);
  }

  private handleScrollTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartY = touch.clientY;
    this.touchCurrentY = touch.clientY;
    this.isTouchScrolling = true;
  }

  private handleScrollTouchMove(event: TouchEvent): void {
    if (!this.isTouchScrolling) return;
    
    const touch = event.touches[0];
    const currentY = touch.clientY;
    
    const momentumDelta = this.touchCurrentY - currentY;
    
    const screenHeight = window.innerHeight;
    const currentHeight = this.currentHeight || screenHeight * 0.55;
    const scrollableThreshold = screenHeight * 0.92;
    
    if (currentHeight > scrollableThreshold) {
      const contentContainer = this.bottomsheetElement?.querySelector('.dashboard-content') as HTMLElement;
      if (contentContainer) {
        const { scrollTop } = contentContainer;
        const isAtTop = scrollTop <= 0;
        
        if (momentumDelta < 0 && isAtTop) {
          event.preventDefault();
          const newHeight = Math.max(screenHeight * 0.15, currentHeight + momentumDelta * 3);
          this.setBottomsheetHeight(newHeight);
          this.touchCurrentY = currentY;
          return;
        }
        
        this.touchCurrentY = currentY;
        return;
      }
    }
    
    event.preventDefault();
    
    if (Math.abs(momentumDelta) > 1) {
      const newHeight = Math.max(
        screenHeight * 0.15,
        Math.min(screenHeight * 0.95, currentHeight + momentumDelta * 3)
      );
      
      this.setBottomsheetHeight(newHeight);
    }
    
    this.touchCurrentY = currentY;
  }

  private handleScrollTouchEnd(event: TouchEvent): void {
    this.isTouchScrolling = false;
    this.snapToNearestState();
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
    
    header.appendChild(dragger);
    header.appendChild(searchContainer);
    this.bottomsheetElement.appendChild(header);
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