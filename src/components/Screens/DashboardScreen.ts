import { ScreenType, BottomsheetState } from '../../types';
import { SearchFlowManager, BottomsheetManager, MapSyncService } from '../../services';
import { 
  BottomsheetContainer, 
  BottomsheetHeader, 
  BottomsheetContent,
  BottomsheetContainerProps 
} from '../Bottomsheet';
import { SearchBar, SearchBarState } from '../Search';

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
   * Создание шторки
   */
  private createBottomsheet(): void {
    this.createBottomsheetContainer();
    this.createBottomsheetHeader();
    this.createBottomsheetContent();
  }

  /**
   * Создание контейнера шторки
   */
  private createBottomsheetContainer(): void {
    const bottomsheetElement = document.createElement('div');
    bottomsheetElement.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 375px;
      max-width: 100%;
      background: white;
      border-radius: 16px 16px 0 0;
      z-index: 2;
      transform: translateY(60%);
      transition: transform 0.3s ease;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    `;
    
    this.element.appendChild(bottomsheetElement);

    const containerProps: BottomsheetContainerProps = {
      config: {
        state: this.props.bottomsheetManager.getCurrentState().currentState,
        snapPoints: [0.2, 0.5, 0.9, 0.95],
        isDraggable: true,
        hasScrollableContent: true
      },
      events: {
        onStateChange: (newState) => {
          this.props.bottomsheetManager.snapToState(newState);
          this.props.mapSyncService?.adjustMapViewport(this.getHeightForState(newState));
        }
      }
    };

    this.bottomsheetContainer = new BottomsheetContainer(bottomsheetElement, containerProps);
  }

  /**
   * Создание заголовка шторки
   */
  private createBottomsheetHeader(): void {
    if (!this.bottomsheetContainer) return;

    const headerElement = document.createElement('div');    
    this.bottomsheetContainer.setContent([headerElement]);
    
    this.bottomsheetHeader = new BottomsheetHeader(headerElement, {
      placeholder: 'Москва',
      showDragger: true,
      onSearchFocus: () => {
        this.props.searchFlowManager.goToSuggest();
        this.props.onSearchFocus?.();
      }
    });

    this.createSearchBar(headerElement);
  }

  /**
   * Создание поисковой строки
   */
  private createSearchBar(container: HTMLElement): void {
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
      padding: 0 16px 16px 16px;
    `;
    container.appendChild(searchContainer);

    this.searchBar = new SearchBar(searchContainer, {
      placeholder: 'Поиск в Москве',
      state: SearchBarState.INACTIVE,
      showSearchIcon: true,
      onFocus: () => {
        this.props.searchFlowManager.goToSuggest();
        this.props.onSearchFocus?.();
      },
      onChange: (query) => {
        this.props.searchFlowManager.updateQuery(query);
      }
    });
  }

  /**
   * Создание содержимого шторки
   */
  private createBottomsheetContent(): void {
    if (!this.bottomsheetContainer) return;

    const contentElement = document.createElement('div');
    const existingContent = this.bottomsheetContainer.getCurrentState();
    
    this.bottomsheetContent = new BottomsheetContent(contentElement, {
      scrollable: true
    });

    this.createDashboardContent(contentElement);
  }

  /**
   * Создание контента дашборда
   */
  private createDashboardContent(container: HTMLElement): void {
    // Создаем контент используя Figma компоненты но с модульной архитектурой
    this.createButtonsRow(container);
    this.createStories(container);
    this.createContentGrid(container);
  }

  /**
   * Создание ряда кнопок
   */
  private createButtonsRow(container: HTMLElement): void {
    const buttons: ButtonItem[] = [
      { id: 'routes', text: 'Маршруты', iconSrc: '/figma_export/dashboard/components/button_row/assets/images/img_1.png' },
      { id: 'taxi', text: 'Такси', iconSrc: '/figma_export/dashboard/components/button_row/assets/images/img_2.png' },
      { id: 'transport', text: 'Транспорт', iconSrc: '/figma_export/dashboard/components/button_row/assets/images/img_3.png' },
      { id: 'food', text: 'Еда', iconSrc: '/figma_export/dashboard/components/button_row/assets/images/img_4.png' }
    ];

    const buttonRowElement = document.createElement('div');
    buttonRowElement.className = 'figma-buttons-row';
    buttonRowElement.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 16px;
      justify-content: space-between;
    `;

    buttons.forEach(button => {
      const buttonEl = this.createButtonElement(button);
      buttonRowElement.appendChild(buttonEl);
    });

    container.appendChild(buttonRowElement);
  }

  /**
   * Создание элемента кнопки
   */
  private createButtonElement(button: ButtonItem): HTMLElement {
    const buttonEl = document.createElement('div');
    buttonEl.className = 'figma-button';
    buttonEl.style.cssText = `
      flex: 1;
      min-height: 72px;
      background: #F8F8F8;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    `;

    if (button.iconSrc) {
      const icon = document.createElement('img');
      icon.src = button.iconSrc;
      icon.style.cssText = `width: 24px; height: 24px;`;
      buttonEl.appendChild(icon);
    }

    const text = document.createElement('div');
    text.textContent = button.text;
    text.style.cssText = `
      font-size: 12px;
      color: #333;
      text-align: center;
    `;
    buttonEl.appendChild(text);

    buttonEl.addEventListener('click', () => button.onClick?.());
    
    return buttonEl;
  }

  /**
   * Создание секции историй
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
      case 'default': return 0.5;
      case 'fullscreen': return 0.9;
      case 'fullscreen_scroll': return 0.95;
      default: return 0.5;
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