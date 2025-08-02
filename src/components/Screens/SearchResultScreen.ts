import { SearchFilters as ISearchFilters, Organization, Product, ScreenType } from '../../types';
import { BottomsheetManager, CartService, MapSyncService, SearchFlowManager } from '../../services';
import { BottomsheetContainer, BottomsheetContent, BottomsheetHeader } from '../Bottomsheet';
import { FilterItem, SearchBar, SearchBarFactory, SearchFilters } from '../Search';
import { CardSize, OrganizationCard } from '../Cards';
import { ProductCarousel } from '../Content/ProductCarousel';
import { HeaderStyles, UNIFIED_HEADER_STYLES } from '../../styles/components/HeaderStyles';

/**
 * Пропсы для SearchResultScreen
 */
export interface SearchResultScreenProps {
  /** Контейнер для монтирования экрана */
  container: HTMLElement;
  /** Менеджер поискового флоу */
  searchFlowManager: SearchFlowManager;
  /** Менеджер шторки */
  bottomsheetManager: BottomsheetManager;
  /** Сервис синхронизации карты */
  mapSyncService?: MapSyncService;
  /** Сервис корзины */
  cartService: CartService;
  /** Поисковый запрос */
  searchQuery: string;
  /** Активные фильтры */
  searchFilters?: ISearchFilters;
  /** CSS класс */
  className?: string;
  /** Обработчики событий */
  onOrganizationClick?: (organization: Organization) => void;
  onFiltersChange?: (filters: ISearchFilters) => void;
  onBackToSuggests?: () => void;
  onQueryChange?: (query: string) => void;
}

/**
 * Состояние загрузки результатов
 */
enum LoadingState {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  EMPTY = 'empty',
}

/**
 * Экран результатов поиска
 * Отображает список найденных организаций с фильтрами
 */
export class SearchResultScreen {
  private props: SearchResultScreenProps;
  private element: HTMLElement;

  // Компоненты
  private bottomsheetContainer?: BottomsheetContainer;
  private bottomsheetHeader?: BottomsheetHeader;
  private bottomsheetContent?: BottomsheetContent;
  private searchBar?: SearchBar;
  private searchFilters?: SearchFilters;

  // Контейнеры для компонентов
  private headerContainer?: HTMLElement;
  private contentContainer?: HTMLElement;
  private filtersContainer?: HTMLElement;
  private resultsContainer?: HTMLElement;

  // Состояние
  private currentQuery: string = '';
  private currentFilters: ISearchFilters = {};
  private organizations: Organization[] = [];
  private organizationCards: OrganizationCard[] = [];
  private productCarousels: ProductCarousel[] = [];
  private loadingState: LoadingState = LoadingState.LOADING;
  private resultsCount: number = 0;

  // Общие товары для карусели (те же что и в Shop/Organization)
  private sharedProducts: Product[] = [
    {
      id: 'prod-001',
      title: 'Мужские спортивные брюки Tommy Hilfiger, синие, S',
      description: 'Мужские спортивные брюки Tommy Hilfiger, синие, S',
      price: 7349,
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720111201494_1.jpg',
    },
    {
      id: 'prod-002',
      title: 'Мужские спортивные брюки Tommy Hilfiger, чёрные, S',
      description: 'Мужские спортивные брюки Tommy Hilfiger, чёрные, S',
      price: 7489,
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720111205591_1.jpg',
    },
    {
      id: 'prod-003',
      title: 'Брюки Tommy Hilfiger спортивные, зелёные, XL',
      description: 'Брюки Tommy Hilfiger спортивные, зелёные, XL',
      price: 10529,
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720646433131_1.jpg',
    },
    {
      id: 'prod-004',
      title: 'Мужские спортивные брюки Nike French Terry, серые, S',
      description: 'Мужские спортивные брюки Nike French Terry, серые, S',
      price: 2455,
      imageUrl:
        'https://cm.samokat.ru/processed/l/product_card/7cd57dbc-42aa-4977-859f-37bd02df6309.jpg',
    },
    {
      id: 'prod-005',
      title: 'Мужские спортивные брюки Nike Repeat, синие, L',
      description: 'Мужские спортивные брюки Nike Repeat, синие, L',
      price: 2438,
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/195870919801_1.jpg',
    },
    {
      id: 'prod-006',
      title: 'Мужские спортивные брюки Nike Yoga Dri‑Fit, серые, L',
      description: 'Мужские спортивные брюки Nike Yoga Dri‑Fit, серые, L',
      price: 2629,
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/0194501845649_1.jpg',
    },
    {
      id: 'prod-007',
      title: 'Мужские спортивные брюки Nike Repeat, белые, L',
      description: 'Мужские спортивные брюки Nike Repeat, белые, L',
      price: 2438,
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/195870919740_1.jpg',
    },
    {
      id: 'prod-008',
      title: 'Брюки Adidas GM5542, размер S',
      description: 'Брюки Adidas GM5542, размер S',
      price: 1632,
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/4064044668639_1.jpg',
    },
  ];

  constructor(props: SearchResultScreenProps) {
    this.props = props;
    this.element = props.container;
    this.currentQuery = props.searchQuery;
    this.currentFilters = props.searchFilters || {};

    this.initialize();
  }

  /**
   * Инициализация экрана
   */
  private initialize(): void {
    this.setupElement();
    this.createBottomsheet();
    this.createContent();
    this.setupEventListeners();
    this.syncWithServices();
    this.loadResults();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    Object.assign(this.element.style, {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff',
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }

    this.element.classList.add('search-result-screen');
  }

  /**
   * Создание шторки
   */
  private createBottomsheet(): void {
    // Создаем контейнер для шторки
    const bottomsheetElement = document.createElement('div');
    bottomsheetElement.style.height = '100%';

    this.element.appendChild(bottomsheetElement);

    // Создаем шторку с состоянием FULLSCREEN_SCROLL для результатов
    const bottomsheetConfig = {
      config: {
        state: this.props.bottomsheetManager.getCurrentState().currentState,
        snapPoints: [0.2, 0.5, 0.95, 1.0],
        isDraggable: true,
        hasScrollableContent: true,
      },
      events: {
        onStateChange: (newState: any) => {
          // Синхронизируем состояние с менеджером шторки
          this.props.bottomsheetManager.snapToState(newState);

          // Синхронизируем с картой если есть сервис
          if (this.props.mapSyncService && this.bottomsheetContainer) {
            const currentStateData = this.bottomsheetContainer.getCurrentState();
            this.props.mapSyncService.adjustMapViewport(currentStateData.height);
          }
        },
      },
    };

    this.bottomsheetContainer = new BottomsheetContainer(bottomsheetElement, bottomsheetConfig);
  }

  /**
   * Создание содержимого шторки
   */
  private createContent(): void {
    if (!this.bottomsheetContainer) return;

    // Создаем заголовок
    this.createHeader();

    // Создаем контентную область
    this.createContentArea();
  }

  /**
   * Создание заголовка с поисковой строкой
   */
  private createHeader(): void {
    // Use unified header structure (remove wrapper for consistency)
    const { container, dragSection, searchBarContainer } = HeaderStyles.createUnifiedHeader();
    this.headerContainer = container;

    // Create unified SearchBar with cross icon for clearing and navigation
    // Ensure we always use the latest query from SearchFlowManager context
    const latestQuery = this.props.searchFlowManager.searchContext.query || this.currentQuery;
    this.currentQuery = latestQuery; // Update our local query to match
    this.searchBar = SearchBarFactory.createSearchResult(searchBarContainer, latestQuery, () => {
      // Clear query and navigate back to Dashboard
      this.handleClearAndNavigateBack();
    });

    // Set up event handlers
    this.searchBar.updateProps({
      onChange: (query: string) => {
        this.handleQueryChange(query);
      },
      onSubmit: (query: string) => {
        this.handleQuerySubmit(query);
      },
      onClear: () => {
        this.handleClearSearch();
      },
      onFocus: () => {
        this.handleSearchFocus();
      },
    });

    // Apply unified search input styles (consistent across all screens)
    const searchContainer = searchBarContainer.querySelector(
      '.search-bar-container'
    ) as HTMLElement;
    if (searchContainer) {
      HeaderStyles.applyUnifiedSearchInputStyles(searchContainer);
    }

    // Create filters panel and add directly to bottomsheet header
    this.createFiltersPanel();

    // Add filters after the search bar container
    if (this.filtersContainer) {
      this.headerContainer.appendChild(this.filtersContainer);
    }
  }

  /**
   * Обработка очистки запроса и навигации назад
   */
  private handleClearAndNavigateBack(): void {
    // Clear the search query first
    this.currentQuery = '';
    this.props.searchFlowManager.updateQuery('');

    // Navigate back to dashboard
    this.props.searchFlowManager.goToDashboard();
    this.props.onBackToSuggests?.();
  }

  /**
   * Создание панели фильтров
   */
  private createFiltersPanel(): void {
    this.filtersContainer = document.createElement('div');
    this.filtersContainer.style.cssText = UNIFIED_HEADER_STYLES.FILTERS_PANEL;

    // Создаем доступные фильтры
    const availableFilters = this.generateAvailableFilters();

    this.searchFilters = new SearchFilters(this.filtersContainer, {
      activeFilters: this.currentFilters,
      availableFilters,
      showActiveCount: true,
      showClearAll: true,
      onFilterToggle: filter => {
        this.handleFilterToggle(filter);
      },
      onFiltersChange: filters => {
        this.handleFiltersChange(filters);
      },
      onClearAll: () => {
        this.handleClearAllFilters();
      },
      onFilterModal: () => {
        // Можно открыть полноэкранный модал с фильтрами
      },
    });
  }

  /**
   * Генерация доступных фильтров
   */
  private generateAvailableFilters(): FilterItem[] {
    return [
      {
        id: 'openNow',
        label: 'Открыто сейчас',
        active: this.currentFilters.openNow || false,
        value: true,
        type: 'feature',
        count: this.resultsCount > 0 ? Math.floor(this.resultsCount * 0.7) : undefined,
      },
      {
        id: 'withReviews',
        label: 'С отзывами',
        active: this.currentFilters.withReviews || false,
        value: true,
        type: 'feature',
        count: this.resultsCount > 0 ? Math.floor(this.resultsCount * 0.8) : undefined,
      },
      {
        id: 'rating4',
        label: 'Рейтинг 4+',
        active: this.currentFilters.ratingFrom === 4,
        value: 4,
        type: 'rating',
        count: this.resultsCount > 0 ? Math.floor(this.resultsCount * 0.6) : undefined,
      },
      {
        id: 'distance1km',
        label: 'До 1 км',
        active: this.currentFilters.distance === 1000,
        value: 1000,
        type: 'distance',
        count: this.resultsCount > 0 ? Math.floor(this.resultsCount * 0.4) : undefined,
      },
      {
        id: 'distance5km',
        label: 'До 5 км',
        active: this.currentFilters.distance === 5000,
        value: 5000,
        type: 'distance',
        count: this.resultsCount > 0 ? Math.floor(this.resultsCount * 0.8) : undefined,
      },
      {
        id: 'advertiser',
        label: 'Реклама',
        active: this.currentFilters.advertisersOnly || false,
        value: true,
        type: 'feature',
        count: this.resultsCount > 0 ? Math.floor(this.resultsCount * 0.3) : undefined,
      },
    ];
  }

  /**
   * Создание контентной области
   */
  private createContentArea(): void {
    this.contentContainer = document.createElement('div');

    this.bottomsheetContent = new BottomsheetContent(this.contentContainer, {
      scrollable: true,
      scrollType: 'vertical',
      showScrollIndicator: true,
      padding: {
        top: 0,
        right: 0,
        bottom: 16,
        left: 0,
      },
    });

    // Создаем содержимое с результатами
    this.createResultsContent();
  }

  /**
   * Создание содержимого с результатами
   */
  private createResultsContent(): void {
    if (!this.bottomsheetContent) return;

    // Создаем контейнер для результатов
    this.resultsContainer = document.createElement('div');
    Object.assign(this.resultsContainer.style, {
      display: 'flex',
      flexDirection: 'column',
    });

    // Отображаем состояние в зависимости от загрузки
    this.renderResultsState();

    // Добавляем контейнер в контент
    this.bottomsheetContent.setContent([this.resultsContainer]);
  }

  /**
   * Рендеринг состояния результатов
   */
  private renderResultsState(): void {
    if (!this.resultsContainer) return;

    // Очищаем контейнер и существующие компоненты
    this.resultsContainer.innerHTML = '';
    this.organizationCards = [];

    // Очищаем карусели товаров
    this.productCarousels.forEach(carousel => carousel.destroy());
    this.productCarousels = [];

    switch (this.loadingState) {
      case LoadingState.LOADING:
        this.renderLoadingState();
        break;
      case LoadingState.SUCCESS:
        this.renderSuccessState();
        break;
      case LoadingState.EMPTY:
        this.renderEmptyState();
        break;
      case LoadingState.ERROR:
        this.renderErrorState();
        break;
    }
  }

  /**
   * Рендеринг состояния загрузки
   */
  private renderLoadingState(): void {
    if (!this.resultsContainer) return;

    const loadingElement = document.createElement('div');
    Object.assign(loadingElement.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      textAlign: 'center',
    });

    loadingElement.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        border: 3px solid #E0E0E0;
        border-top: 3px solid #1976D2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      "></div>
      <div style="
        font-size: 16px;
        color: #666666;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        Поиск организаций...
      </div>
    `;

    // Добавляем CSS анимацию
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    if (!document.getElementById('loading-animation')) {
      style.id = 'loading-animation';
      document.head.appendChild(style);
    }

    this.resultsContainer.appendChild(loadingElement);
  }

  /**
   * Рендеринг успешного состояния с результатами
   */
  private renderSuccessState(): void {
    if (!this.resultsContainer) return;

    // Создаем заголовок с количеством результатов
    this.createResultsHeader();

    // Создаем список организаций
    this.createOrganizationsList();
  }

  /**
   * Создание заголовка результатов
   */
  private createResultsHeader(): void {
    if (!this.resultsContainer) return;

    const header = document.createElement('div');
    Object.assign(header.style, {
      padding: '16px',
      borderBottom: '1px solid #F0F0F0',
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '4px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    });

    const resultsText =
      this.resultsCount === 1 ? 'результат' : this.resultsCount < 5 ? 'результата' : 'результатов';

    title.textContent = `${this.resultsCount} ${resultsText}`;

    const subtitle = document.createElement('div');
    Object.assign(subtitle.style, {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    });
    subtitle.textContent = `По запросу "${this.currentQuery}"`;

    header.appendChild(title);
    header.appendChild(subtitle);

    this.resultsContainer.appendChild(header);
  }

  /**
   * Создание списка организаций с интегрированными каруселями товаров
   */
  private createOrganizationsList(): void {
    if (!this.resultsContainer) return;

    const listContainer = document.createElement('div');
    Object.assign(listContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '1px', // Минимальный отступ между карточками
      backgroundColor: '#F5F5F5',
    });

    // Создаем карточки организаций с интегрированными каруселями
    this.organizations.forEach((organization, index) => {
      const cardContainer = document.createElement('div');
      cardContainer.style.backgroundColor = '#ffffff';

      const organizationCard = new OrganizationCard(cardContainer, {
        organization,
        size: CardSize.STANDARD,
        showPhoto: true,
        showRating: true,
        showDistance: true,
        showWorkingHours: false,
        showCategory: true,
        showDescription: true,
        onClick: org => {
          this.handleOrganizationClick(org);
        },
        onCallClick: org => {
          this.handleCallClick(org);
        },
        onPhotoClick: org => {
          this.handlePhotoClick(org);
        },
      });

      // Добавляем hover эффект для всего контейнера
      cardContainer.addEventListener('mouseenter', () => {
        cardContainer.style.backgroundColor = '#FAFAFA';
      });

      cardContainer.addEventListener('mouseleave', () => {
        cardContainer.style.backgroundColor = '#ffffff';
      });

      this.organizationCards.push(organizationCard);
      listContainer.appendChild(cardContainer);

      // Добавляем карусель товаров после каждой 4-й карточки или в начале (если индекс 3)
      if (index === 3 || (index > 3 && (index + 1) % 4 === 0)) {
        const carouselContainer = this.createProductCarouselContainer();
        listContainer.appendChild(carouselContainer);
      }
    });

    // Если у нас меньше 4 организаций, добавляем карусель в конце
    if (this.organizations.length > 0 && this.organizations.length < 4) {
      const carouselContainer = this.createProductCarouselContainer();
      listContainer.appendChild(carouselContainer);
    }

    this.resultsContainer.appendChild(listContainer);
  }

  /**
   * Создание контейнера для карусели товаров
   */
  private createProductCarouselContainer(): HTMLElement {
    const carouselContainer = document.createElement('div');
    Object.assign(carouselContainer.style, {
      backgroundColor: '#ffffff',
      margin: '16px 0',
    });

    // Создаем карусель товаров
    const productCarousel = new ProductCarousel({
      container: carouselContainer,
      cartService: this.props.cartService,
      products: this.sharedProducts.slice(0, 6), // Показываем первые 6 товаров
      onProductClick: product => {
        this.handleProductClick(product);
      },
      onAddToCart: product => {
        this.handleAddToCart(product);
      },
    });

    this.productCarousels.push(productCarousel);

    return carouselContainer;
  }

  /**
   * Обработчик клика по товару в карусели (опционально)
   */
  private handleProductClick(product: Product): void {
    // Можно перейти в магазин и выделить товар
    // TODO: Реализовать переход в Shop с выделением товара
  }

  /**
   * Обработчик добавления товара в корзину
   */
  private handleAddToCart(product: Product): void {
    // Логика уже в ProductCarousel через CartService
  }

  /**
   * Рендеринг пустого состояния
   */
  private renderEmptyState(): void {
    if (!this.resultsContainer) return;

    const emptyElement = document.createElement('div');
    Object.assign(emptyElement.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 16px',
      textAlign: 'center',
    });

    emptyElement.innerHTML = `
      <div style="
        width: 64px;
        height: 64px;
        margin-bottom: 24px;
        opacity: 0.4;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="16" stroke="currentColor" stroke-width="3"/>
          <path d="m36 36-8-8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          <path d="M20 12v16M12 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div style="
        font-size: 20px;
        fontWeight: 600;
        marginBottom: 12px;
        color: #333333;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        Ничего не найдено
      </div>
      <div style="
        font-size: 16px;
        color: #666666;
        marginBottom: 24px;
        lineHeight: 1.5;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        По запросу "${this.currentQuery}" не найдено организаций.<br>
        Попробуйте изменить запрос или фильтры.
      </div>
      <button style="
        padding: 12px 24px;
        border: 1px solid #1976D2;
        borderRadius: 8px;
        backgroundColor: transparent;
        color: #1976D2;
        fontSize: 16px;
        fontWeight: 500;
        cursor: pointer;
        fontFamily: system-ui, -apple-system, sans-serif;
        transition: all 0.2s ease;
      ">
        Изменить запрос
      </button>
    `;

    // Добавляем обработчик для кнопки
    const button = emptyElement.querySelector('button') as HTMLButtonElement;
    if (button) {
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#1976D2';
        button.style.color = '#ffffff';
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'transparent';
        button.style.color = '#1976D2';
      });

      button.addEventListener('click', () => {
        this.handleSearchFocus();
      });
    }

    this.resultsContainer.appendChild(emptyElement);
  }

  /**
   * Рендеринг состояния ошибки
   */
  private renderErrorState(): void {
    if (!this.resultsContainer) return;

    const errorElement = document.createElement('div');
    Object.assign(errorElement.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 16px',
      textAlign: 'center',
    });

    errorElement.innerHTML = `
      <div style="
        width: 64px;
        height: 64px;
        margin-bottom: 24px;
        color: #FF5722;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="3"/>
          <path d="M24 16v8M24 32h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
      <div style="
        font-size: 20px;
        fontWeight: 600;
        marginBottom: 12px;
        color: #333333;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        Ошибка поиска
      </div>
      <div style="
        font-size: 16px;
        color: #666666;
        marginBottom: 24px;
        lineHeight: 1.5;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        Не удалось выполнить поиск.<br>
        Проверьте подключение к интернету и попробуйте снова.
      </div>
      <button style="
        padding: 12px 24px;
        border: none;
        borderRadius: 8px;
        backgroundColor: #1976D2;
        color: #ffffff;
        fontSize: 16px;
        fontWeight: 500;
        cursor: pointer;
        fontFamily: system-ui, -apple-system, sans-serif;
        transition: all 0.2s ease;
      ">
        Повторить поиск
      </button>
    `;

    // Добавляем обработчик для кнопки
    const button = errorElement.querySelector('button') as HTMLButtonElement;
    if (button) {
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#1565C0';
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#1976D2';
      });

      button.addEventListener('click', () => {
        this.loadResults();
      });
    }

    this.resultsContainer.appendChild(errorElement);
  }

  /**
   * Загрузка результатов поиска
   */
  private loadResults(): void {
    this.loadingState = LoadingState.LOADING;
    this.renderResultsState();

    // Симулируем загрузку данных
    setTimeout(() => {
      this.organizations = this.generateMockOrganizations();
      this.resultsCount = this.organizations.length;

      if (this.organizations.length === 0) {
        this.loadingState = LoadingState.EMPTY;
      } else {
        this.loadingState = LoadingState.SUCCESS;
      }

      this.renderResultsState();

      // Обновляем фильтры с новыми счетчиками
      if (this.searchFilters) {
        const updatedFilters = this.generateAvailableFilters();
        this.searchFilters.updateFilters(updatedFilters);
      }

      // Синхронизируем с картой
      this.syncResultsWithMap();
    }, 1500);
  }

  /**
   * Генерация мок организаций
   */
  private generateMockOrganizations(): Organization[] {
    const mockOrganizations: Organization[] = [
      {
        id: '1',
        name: 'Кофе Хауз',
        category: 'Кофейня',
        address: 'Невский проспект, 28',
        rating: 4.2,
        reviewsCount: 126,
        distance: 450,
        phone: '+7 (812) 123-45-67',
        workingHours: '8:00 - 22:00',
        isAdvertiser: true,
        photoUrl:
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=200&fit=crop',
        description: 'Уютная кофейня в центре города с большим выбором кофе и десертов.',
        coordinates: [59.9311, 30.3609],
      },
      {
        id: '2',
        name: 'Макдоналдс',
        category: 'Ресторан быстрого питания',
        address: 'ул. Рубинштейна, 15/17',
        rating: 3.8,
        reviewsCount: 342,
        distance: 780,
        phone: '+7 (812) 234-56-78',
        workingHours: '24 часа',
        isAdvertiser: false,
        photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop',
        description: 'Популярная сеть ресторанов быстрого питания.',
        coordinates: [59.9321, 30.3619],
      },
      {
        id: '3',
        name: 'Пушкин',
        category: 'Ресторан',
        address: 'Тверской бульвар, 26А',
        rating: 4.7,
        reviewsCount: 89,
        distance: 1200,
        phone: '+7 (812) 345-67-89',
        workingHours: '12:00 - 00:00',
        isAdvertiser: true,
        photoUrl:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop',
        description: 'Изысканный ресторан русской кухни с элегантным интерьером.',
        coordinates: [59.9331, 30.3629],
      },
    ];

    // Фильтруем результаты по активным фильтрам
    return mockOrganizations.filter(org => {
      if (this.currentFilters.openNow && org.workingHours !== '24 часа') {
        // Упрощенная проверка рабочего времени
        return false;
      }

      if (this.currentFilters.withReviews && (!org.reviewsCount || org.reviewsCount === 0)) {
        return false;
      }

      if (
        this.currentFilters.ratingFrom &&
        org.rating &&
        org.rating < this.currentFilters.ratingFrom
      ) {
        return false;
      }

      if (
        this.currentFilters.distance &&
        org.distance &&
        org.distance > this.currentFilters.distance
      ) {
        return false;
      }

      if (this.currentFilters.advertisersOnly && !org.isAdvertiser) {
        return false;
      }

      return true;
    });
  }

  /**
   * Синхронизация результатов с картой
   */
  private syncResultsWithMap(): void {
    if (this.props.mapSyncService) {
      this.props.mapSyncService.syncPinsWithContent('search_results', {
        query: this.currentQuery,
        organizations: this.organizations,
        filters: this.currentFilters,
      });

      // Подгоняем карту под результаты
      if (this.organizations.length > 0) {
        this.props.mapSyncService.fitToSearchResults(this.organizations);
      }
    }
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    // Обработчик изменения размера экрана
    window.addEventListener('resize', this.handleResize.bind(this));

    // Обработчик клавиш
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Синхронизация с сервисами
   */
  private syncWithServices(): void {
    // Устанавливаем текущий экран в менеджере флоу
    this.props.searchFlowManager.currentScreen = ScreenType.SEARCH_RESULT;

    // Обновляем контекст поиска
    this.props.searchFlowManager.updateQuery(this.currentQuery);
    this.props.searchFlowManager.searchContext.filters = this.currentFilters;
  }

  /**
   * Обработчики событий
   */
  private handleQueryChange(query: string): void {
    this.currentQuery = query;
    this.debouncedSearch();
    this.props.onQueryChange?.(query);
  }

  private handleQuerySubmit(query: string): void {
    this.currentQuery = query;
    this.loadResults();
  }

  private handleClearSearch(): void {
    this.currentQuery = '';
    this.props.searchFlowManager.updateQuery('');
    this.props.searchFlowManager.goToDashboard();
  }

  private handleSearchFocus(): void {
    this.props.searchFlowManager.goToSuggest();
    this.props.onBackToSuggests?.();
  }

  private handleFilterToggle(filter: FilterItem): void {
    // Фильтр уже изменен в компоненте, просто перезагружаем результаты
    this.loadResults();
  }

  private handleFiltersChange(filters: ISearchFilters): void {
    this.currentFilters = filters;
    this.loadResults();
    this.props.onFiltersChange?.(filters);
  }

  private handleClearAllFilters(): void {
    this.currentFilters = {};
    this.loadResults();
    this.props.onFiltersChange?.(this.currentFilters);
  }

  private handleOrganizationClick(organization: Organization): void {
    this.props.searchFlowManager.goToOrganization(organization);
    this.props.onOrganizationClick?.(organization);
  }

  private handleCallClick(organization: Organization): void {
    // Открываем диалер или показываем номер
    if (organization.phone) {
      window.open(`tel:${organization.phone}`);
    }
  }

  private handlePhotoClick(organization: Organization): void {
    // Можно открыть галерею фотографий
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.handleSearchFocus();
    }
  }

  private handleResize(): void {
    // Адаптируем интерфейс при изменении размера
  }

  // Дебаунсированный поиск
  private searchTimeout?: number;
  private debouncedSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = window.setTimeout(() => {
      this.loadResults();
    }, 800);
  }

  /**
   * Публичные методы
   */
  public activate(): void {
    this.element.style.display = 'flex';
    this.bottomsheetContainer?.snapToState(
      this.props.bottomsheetManager.getCurrentState().currentState
    );
    this.syncWithServices();
  }

  public deactivate(): void {
    this.element.style.display = 'none';
  }

  public refresh(): void {
    this.loadResults();
  }

  public setQuery(query: string): void {
    this.currentQuery = query;
    this.searchBar?.setValue(query);
    this.loadResults();
  }

  public setFilters(filters: ISearchFilters): void {
    this.currentFilters = filters;
    this.searchFilters?.setActiveFilters(filters);
    this.loadResults();
  }

  public getState(): any {
    return {
      screen: ScreenType.SEARCH_RESULT,
      query: this.currentQuery,
      filters: this.currentFilters,
      resultsCount: this.resultsCount,
      loadingState: this.loadingState,
      bottomsheetState: this.bottomsheetContainer?.getCurrentState(),
    };
  }

  public destroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));

    this.bottomsheetContainer?.destroy();
    this.bottomsheetHeader?.destroy();
    this.bottomsheetContent?.destroy();
    this.searchBar?.destroy();
    this.searchFilters?.destroy();

    this.organizationCards.forEach(card => card.destroy());
    this.organizationCards = [];

    // Очищаем карусели товаров
    this.productCarousels.forEach(carousel => carousel.destroy());
    this.productCarousels = [];

    this.headerContainer = undefined;
    this.contentContainer = undefined;
    this.filtersContainer = undefined;
    this.resultsContainer = undefined;
  }
}

/**
 * Фабрика для создания SearchResultScreen
 */
export class SearchResultScreenFactory {
  static create(props: SearchResultScreenProps): SearchResultScreen {
    return new SearchResultScreen(props);
  }

  static createDefault(
    container: HTMLElement,
    searchFlowManager: SearchFlowManager,
    bottomsheetManager: BottomsheetManager,
    cartService: CartService,
    searchQuery: string,
    searchFilters?: ISearchFilters
  ): SearchResultScreen {
    return new SearchResultScreen({
      container,
      searchFlowManager,
      bottomsheetManager,
      cartService,
      searchQuery,
      searchFilters,
    });
  }
}
