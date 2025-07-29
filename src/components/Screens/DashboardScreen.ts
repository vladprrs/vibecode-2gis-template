import { ScreenType, BottomsheetState } from '../../types';
import { SearchFlowManager, BottomsheetManager, MapSyncService } from '../../services';
import { 
  BottomsheetContainer, 
  BottomsheetHeader, 
  BottomsheetContent,
  BottomsheetContainerProps 
} from '../Bottomsheet';
import { SearchBar, SearchBarState } from '../Search';
import { ButtonRow, ButtonRowItem } from '../Dashboard';

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
      this.updateMapStatus?.('Ожидание MapGL API...', 'loading');
      await this.waitForMapGL();
      await this.createRealMap(mapContainer);
      this.updateMapStatus?.('✅ Карта 2GIS загружена', 'success');
    } catch (error) {
      console.error('Map loading error:', error);
      this.updateMapStatus?.('❌ Ошибка загрузки карты', 'error');
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
      this.updateMapStatus?.(`Клик: ${event.lngLat.lng.toFixed(4)}, ${event.lngLat.lat.toFixed(4)}`, 'info');
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
    this.createFigmaContent();
    this.element.appendChild(this.bottomsheetElement);
  }

  /**
   * Создание заголовка шторки
   */

  /**
   * Создание контента дашборда с точным соответствием Figma
   */
  private createDashboardContent(container: HTMLElement): void {
    // 1. Quick action buttons (horizontal row)
    this.createQuickActionButtons(container);
    
    // 2. Stories carousel 
    this.createStoriesCarousel(container);
    
    // 3. "Советы к месту" heading
    this.createSectionHeading(container, 'Советы к месту');
    
    // 4. Content masonry grid
    this.createContentMasonryGrid(container);
    
    // 5. "Популярные категории" heading
    this.createSectionHeading(container, 'Популярные категории');
    
    // 6. Categories grid  
    this.createCategoriesGrid(container);
    
    // 7. Banner
    this.createPromoBanner(container);
    
    // 8. Bottom spacing for scroll
    this.createBottomSpacing(container);
  }

  /**
   * Создание горизонтального ряда быстрых действий
   */
  private createQuickActionButtons(container: HTMLElement): void {
    const buttonRowContainer = document.createElement('div');
    buttonRowContainer.style.cssText = `
      padding: 16px 0;
      margin-bottom: 0;
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
    storiesContainer.style.cssText = `
      padding: 0 16px;
      margin-bottom: 12px;
    `;

    const storiesRow = document.createElement('div');
    storiesRow.className = 'stories-container';
    storiesRow.style.cssText = `
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 4px;
    `;

    // Stories data with proper rectangular cards
    const stories = [
      { 
        id: 'story1', 
        title: 'Кафе', 
        imageUrl: '/figma_export/dashboard/state_default/assets/images/img-0de1a764.jpg',
        viewed: false
      },
      { 
        id: 'story2', 
        title: 'Развлечения', 
        imageUrl: '/figma_export/dashboard/state_default/assets/images/img-c4517f50.png',
        viewed: false
      },
      { 
        id: 'story3', 
        title: 'Еда', 
        imageUrl: '/figma_export/dashboard/state_default/assets/images/img-f106c1b4.png',
        viewed: true
      },
      { 
        id: 'story4', 
        title: 'Шоппинг', 
        imageUrl: '/figma_export/dashboard/state_default/assets/images/img-a24168bd.png',
        viewed: false
      }
    ];

    stories.forEach(story => {
      const storyItem = document.createElement('div');
      storyItem.className = 'story-item';
      storyItem.style.cssText = `
        display: flex;
        width: 96px;
        height: 128px;
        flex-direction: column;
        align-items: center;
        position: relative;
        cursor: pointer;
        scroll-snap-align: start;
        flex-shrink: 0;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid ${story.viewed ? 'transparent' : '#1BA136'};
        transition: transform 0.2s ease;
      `;

      const storyCover = document.createElement('div');
      storyCover.className = 'story-cover';
      storyCover.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
        display: flex;
        align-items: flex-end;
        justify-content: center;
      `;

      // Try to load image, fallback to gradient
      const image = document.createElement('img');
      image.src = story.imageUrl;
      image.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
      `;
      
      // Image loading error fallback
      image.onerror = () => {
        image.style.display = 'none';
        storyCover.innerHTML = `
          <div style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); color: white; font-size: 12px; font-weight: 600; text-align: center;">
            ${story.title}
          </div>
        `;
      };

      // Image loading success
      image.onload = () => {
        const titleOverlay = document.createElement('div');
        titleOverlay.style.cssText = `
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        `;
        titleOverlay.textContent = story.title;
        storyCover.appendChild(titleOverlay);
      };

      storyCover.appendChild(image);
      storyItem.appendChild(storyCover);

      // Hover effect
      storyItem.addEventListener('mouseenter', () => {
        storyItem.style.transform = 'translateY(-2px)';
      });
      
      storyItem.addEventListener('mouseleave', () => {
        storyItem.style.transform = 'translateY(0)';
      });

      storiesRow.appendChild(storyItem);
    });

    storiesContainer.appendChild(storiesRow);
    container.appendChild(storiesContainer);
  }

  /**
   * Создание заголовка секции
   */
  private createSectionHeading(container: HTMLElement, title: string): void {
    const heading = document.createElement('div');
    heading.className = 'section-header';
    heading.style.cssText = `
      padding: 0 16px;
      margin: 12px 0 16px 0;
    `;

    const titleElement = document.createElement('h4');
    titleElement.className = 'section-title';
    titleElement.style.cssText = `
      font-family: 'SB Sans Text', -apple-system, Roboto, Helvetica, sans-serif;
      font-size: 18px;
      font-weight: 600;
      line-height: 24px;
      color: #333;
      margin: 0;
    `;
    titleElement.textContent = title;

    heading.appendChild(titleElement);
    container.appendChild(heading);
  }

  /**
   * Создание масонри сетки контента  
   */
  private createContentMasonryGrid(container: HTMLElement): void {
    const gridContainer = document.createElement('div');
    gridContainer.className = 'content-masonry-grid';
    gridContainer.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 0 16px;
      margin-bottom: 16px;
    `;

    // Left column (tall image card spanning 2 rows)
    const leftColumn = document.createElement('div');
    leftColumn.style.cssText = `
      display: grid;
      gap: 12px;
    `;

    // Large cover card (spans 2 rows)
    const largeCoverCard = document.createElement('div');
    largeCoverCard.className = 'cover-card cover-card-big';
    largeCoverCard.style.cssText = `
      height: 142px;
      border-radius: 16px;
      overflow: hidden;
      background: linear-gradient(135deg, #1BA136 0%, #4CAF50 100%);
      position: relative;
      display: flex;
      align-items: flex-end;
      color: white;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    `;

    const coverOverlay = document.createElement('div');
    coverOverlay.className = 'cover-overlay';
    coverOverlay.style.cssText = `
      padding: 16px;
      background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
      width: 100%;
    `;

    const coverTitle = document.createElement('div');
    coverTitle.className = 'cover-title';
    coverTitle.style.cssText = `
      font-size: 14px;
      font-weight: 600;
      line-height: 18px;
      margin-bottom: 4px;
    `;
    coverTitle.textContent = 'Маленькие экскурсии: гуляем с "Даблби" и…';

    const coverSubtitle = document.createElement('div');
    coverSubtitle.className = 'cover-subtitle';
    coverSubtitle.style.cssText = `
      font-size: 12px;
      opacity: 0.8;
    `;
    coverSubtitle.textContent = '59 мест';

    coverOverlay.appendChild(coverTitle);
    coverOverlay.appendChild(coverSubtitle);
    largeCoverCard.appendChild(coverOverlay);
    leftColumn.appendChild(largeCoverCard);

    // Right column (two smaller cards)
    const rightColumn = document.createElement('div');
    rightColumn.style.cssText = `
      display: grid;
      gap: 12px;
    `;

    // Meta item 1
    const metaItem1 = document.createElement('div');
    metaItem1.className = 'meta-item';
    metaItem1.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
      height: 65px;
    `;

    const metaContent1 = document.createElement('div');
    metaContent1.innerHTML = `
      <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 2px;">Вкусно позавтракать</div>
      <div style="font-size: 14px; color: #666;">Тот самый момент</div>
    `;

    const metaIcon1 = document.createElement('div');
    metaIcon1.style.cssText = `font-size: 24px;`;
    metaIcon1.textContent = '🍴';

    metaItem1.appendChild(metaContent1);
    metaItem1.appendChild(metaIcon1);
    rightColumn.appendChild(metaItem1);

    // Meta item 2  
    const metaItem2 = document.createElement('div');
    metaItem2.className = 'meta-item';
    metaItem2.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
      height: 65px;
    `;

    const metaContent2 = document.createElement('div');
    metaContent2.innerHTML = `
      <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 2px;">Банкоматы</div>
      <div style="font-size: 14px; color: #666;">Number</div>
    `;

    const metaIcon2 = document.createElement('div');
    metaIcon2.style.cssText = `font-size: 24px;`;
    metaIcon2.textContent = '🏧';

    metaItem2.appendChild(metaContent2);
    metaItem2.appendChild(metaIcon2);
    rightColumn.appendChild(metaItem2);

    gridContainer.appendChild(leftColumn);
    gridContainer.appendChild(rightColumn);
    container.appendChild(gridContainer);
  }

  /**
   * Создание сетки категорий
   */
  private createCategoriesGrid(container: HTMLElement): void {
    const grid = document.createElement('div');
    grid.className = 'categories-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 0 16px;
      margin-bottom: 16px;
    `;

    const categories = [
      { icon: '🍕', title: 'Пицца', subtitle: '156 заведений' },
      { icon: '☕', title: 'Кофе', subtitle: '234 кофейни' },
      { icon: '🏪', title: 'Магазины', subtitle: '1,243 места' },
      { icon: '⛽', title: 'АЗС', subtitle: '89 станций' },
      { icon: '🏥', title: 'Медицина', subtitle: '567 клиник' },
      { icon: '🎓', title: 'Образование', subtitle: '123 учреждения' }
    ];

    categories.forEach(cat => {
      const categoryCard = document.createElement('div');
      categoryCard.className = 'meta-item';
      categoryCard.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        height: 65px;
      `;

      const categoryContent = document.createElement('div');
      categoryContent.innerHTML = `
        <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 2px;">${cat.title}</div>
        <div style="font-size: 14px; color: #666;">${cat.subtitle}</div>
      `;

      const categoryIcon = document.createElement('div');
      categoryIcon.style.cssText = `font-size: 24px;`;
      categoryIcon.textContent = cat.icon;

      categoryCard.appendChild(categoryContent);
      categoryCard.appendChild(categoryIcon);
      grid.appendChild(categoryCard);
    });

    container.appendChild(grid);
  }

  /**
   * Создание промо баннера
   */
  private createPromoBanner(container: HTMLElement): void {
    const banner = document.createElement('div');
    banner.className = 'promo-banner';
    banner.style.cssText = `
      margin: 16px;
      padding: 16px;
      background: white;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    `;

    const bannerLogo = document.createElement('div');
    bannerLogo.style.cssText = `
      width: 48px;
      height: 48px;
      background: linear-gradient(45deg, #FF9800, #FFC107);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    `;
    bannerLogo.textContent = '🍣';

    const bannerContent = document.createElement('div');
    bannerContent.style.cssText = `flex: 1;`;
    bannerContent.innerHTML = `
      <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px;">Суши Маке</div>
      <div style="font-size: 14px; color: #666; line-height: 18px; margin-bottom: 8px;">Подарок «Филадельфия с лососем» за первый заказ по промокоду «FILA2»</div>
      <button style="background: #1BA136; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">Получить подарок</button>
    `;

    banner.appendChild(bannerLogo);
    banner.appendChild(bannerContent);
    container.appendChild(banner);
  }

  /**
   * Создание нижнего отступа
   */
  private createBottomSpacing(container: HTMLElement): void {
    const spacing = document.createElement('div');
    spacing.style.cssText = `
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 14px;
      text-align: center;
    `;
    spacing.innerHTML = `
      <div>
        <div style="margin-bottom: 8px;">🎯</div>
        <div>Тестируйте скролл в разных состояниях шторки</div>
      </div>
    `;
    container.appendChild(spacing);
  }

  /**
   * Создание секции историй (deprecated)
   */
  private createStories(container: HTMLElement): void {
    const stories: StoryItem[] = [
      { id: '1', title: 'История 1', imageUrl: '/figma_export/dashboard/components/stories/assets/images/img_1.png', isViewed: false },
      { id: '2', title: 'История 2', imageUrl: '/figma_export/dashboard/components/stories/assets/images/img_2.png', isViewed: false },
      { id: '3', title: 'История 3', imageUrl: '/figma_export/dashboard/components/stories/assets/images/img_3.png', isViewed: true }
    ];

    const storiesContainer = document.createElement('div');
    storiesContainer.className = 'figma-stories';
    storiesContainer.style.cssText = `
      padding: 16px;
      padding-top: 0;
    `;

    const storiesRow = document.createElement('div');
    storiesRow.style.cssText = `
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;
    `;

    stories.forEach(story => {
      const storyEl = this.createStoryElement(story);
      storiesRow.appendChild(storyEl);
    });

    storiesContainer.appendChild(storiesRow);
    container.appendChild(storiesContainer);
  }

  /**
   * Создание элемента истории
   */
  private createStoryElement(story: StoryItem): HTMLElement {
    const storyEl = document.createElement('div');
    storyEl.className = 'figma-story';
    storyEl.style.cssText = `
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${story.isViewed ? '#E0E0E0' : 'linear-gradient(45deg, #FF6B6B, #4ECDC4)'};
      padding: 2px;
      cursor: pointer;
    `;

    const storyInner = document.createElement('div');
    storyInner.style.cssText = `
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-image: url(${story.imageUrl});
      background-size: cover;
      background-position: center;
      border: 2px solid white;
    `;

    storyEl.appendChild(storyInner);
    
    storyEl.addEventListener('click', () => {
      this.props.onStoryClick?.(story.id);
    });

    return storyEl;
  }

  /**
   * Создание сетки контента
   */
  private createContentGrid(container: HTMLElement): void {
    const metaItems: MetaItem[] = [
      { id: 'item1', title: 'Кафе', subtitle: 'Рядом с вами', iconType: 'emoji', iconSrc: '☕' },
      { id: 'item2', title: 'АЗС', subtitle: 'Найти ближайшую', iconType: 'emoji', iconSrc: '⛽' },
      { id: 'item3', title: 'Банкоматы', subtitle: 'Снять наличные', iconType: 'emoji', iconSrc: '🏧', isAd: true }
    ];

    const gridContainer = document.createElement('div');
    gridContainer.className = 'figma-content-grid';
    gridContainer.style.cssText = `
      padding: 16px;
      padding-top: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    `;

    metaItems.forEach(item => {
      const itemEl = this.createMetaItemElement(item);
      gridContainer.appendChild(itemEl);
    });

    container.appendChild(gridContainer);
  }

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

  private updateMapStatus?(message: string, type: 'loading' | 'success' | 'error' | 'info'): void {
    // Обновление статуса карты (если есть элемент статуса)
    const statusElement = document.querySelector('.map-status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `map-status ${type}`;
    }
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

  private createFigmaContent(): void {
    if (!this.bottomsheetElement) return;

    const content = document.createElement('div');
    content.className = 'dashboard-content';
    content.style.cssText = `
      flex: 1;
      width: 100%;
      overflow-y: auto;
    `;
    
    // Add all the original content elements
    this.createDashboardContent(content);
    
    this.bottomsheetElement.appendChild(content);
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