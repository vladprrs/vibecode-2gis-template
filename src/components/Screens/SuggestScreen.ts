import { BottomsheetState, ScreenType, SearchSuggestion } from '../../types';
import { BottomsheetManager, MapSyncService, SearchFlowManager } from '../../services';
import {
  BottomsheetContainer,
  BottomsheetContent,
  BottomsheetHeader,
} from '../Bottomsheet';
import {
  SearchBar,
  SearchBarFactory,
  SearchSuggestions,
} from '../Search';
import { HeaderStyles } from '../../styles/components/HeaderStyles';

/**
 * Пропсы для SuggestScreen
 */
export interface SuggestScreenProps {
  /** Контейнер для монтирования экрана */
  container: HTMLElement;
  /** Менеджер поискового флоу */
  searchFlowManager: SearchFlowManager;
  /** Менеджер шторки */
  bottomsheetManager: BottomsheetManager;
  /** Сервис синхронизации карты */
  mapSyncService?: MapSyncService;
  /** Начальный поисковый запрос */
  initialQuery?: string;
  /** CSS класс */
  className?: string;
  /** Обработчики событий */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onBackToDashboard?: () => void;
  onQueryChange?: (query: string) => void;
}

/**
 * Экран подсказок поиска
 * Отображает активную поисковую строку и список подсказок
 */
export class SuggestScreen {
  private props: SuggestScreenProps;
  private element: HTMLElement;

  // Компоненты
  private bottomsheetContainer?: BottomsheetContainer;
  private bottomsheetHeader?: BottomsheetHeader;
  private bottomsheetContent?: BottomsheetContent;
  private searchBar?: SearchBar;
  private searchSuggestions?: SearchSuggestions;

  // Контейнеры для компонентов
  private headerContainer?: HTMLElement;
  private contentContainer?: HTMLElement;
  private suggestionsContainer?: HTMLElement;

  // Состояние
  private currentQuery: string = '';
  private suggestions: SearchSuggestion[] = [];

  constructor(props: SuggestScreenProps) {
    this.props = props;
    this.element = props.container;
    this.currentQuery = props.initialQuery || '';

    this.initialize();
  }

  /**
   * Инициализация экрана
   */
  private initialize(): void {
    this.setupElement();
    // Skip createBottomsheet() - use existing bottomsheet from DashboardScreen
    this.createContent();
    this.setupEventListeners();
    this.syncWithServices();
    this.loadSuggestions();
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

    this.element.classList.add('suggest-screen');
  }

  /**
   * Создание шторки
   */
  private createBottomsheet(): void {
    // Создаем контейнер для шторки
    const bottomsheetElement = document.createElement('div');
    bottomsheetElement.style.height = '100%';

    this.element.appendChild(bottomsheetElement);

    // Создаем шторку с состоянием FULLSCREEN для подсказок
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
          if (this.props.mapSyncService) {
            // Map sync is handled by the main bottomsheet manager
            const currentHeight = window.innerHeight * 0.95; // Fullscreen height
            this.props.mapSyncService.adjustMapViewport(currentHeight);
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
    // Создаем заголовок и добавляем его в контейнер
    this.createHeader();

    // Создаем контентную область и добавляем её в контейнер
    this.createContentArea();
  }

  /**
   * Создание заголовка с активной поисковой строкой
   */
  private createHeader(): void {
    // Use unified header structure
    const { container, dragSection, searchBarContainer } = HeaderStyles.createUnifiedHeader();
    this.headerContainer = container;

    // Create unified SearchBar with cross icon for clearing and navigation
    this.searchBar = SearchBarFactory.createSuggest(searchBarContainer, () => {
      // Clear query and navigate back to Dashboard
      this.handleClearAndNavigateBack();
    });

    // Set initial query if provided
    if (this.currentQuery) {
      this.searchBar.setValue(this.currentQuery);
    }

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
    });

    // Apply unified search input styles (consistent across all screens)
    const searchContainer = searchBarContainer.querySelector(
      '.search-bar-container'
    ) as HTMLElement;
    if (searchContainer) {
      HeaderStyles.applyUnifiedSearchInputStyles(searchContainer);
    }

    // Add the header to the main screen element as the first child
    // This follows the same pattern as DashboardScreen
    if (this.headerContainer) {
      this.element.appendChild(this.headerContainer);
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
    this.props.onBackToDashboard?.();
  }

  /**
   * Создание контентной области
   */
  private createContentArea(): void {
    this.contentContainer = document.createElement('div');
    this.contentContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      flex: 1;
      overflow-y: auto;
      padding: 0 0 16px 0;
    `;

    // Создаем содержимое с подсказками
    this.createSuggestionsContent();

    // Добавляем контентную область в основной элемент
    this.element.appendChild(this.contentContainer);
  }

  /**
   * Создание содержимого с подсказками
   */
  private createSuggestionsContent(): void {
    if (!this.contentContainer) return;

    // Создаем контейнер для подсказок
    this.suggestionsContainer = document.createElement('div');

    // Создаем компонент подсказок
    this.searchSuggestions = new SearchSuggestions(this.suggestionsContainer, {
      suggestions: this.suggestions,
      showGroupHeaders: true,
      maxSuggestions: 20,
      onSuggestionClick: (suggestion, _index) => {
        this.handleSuggestionSelect(suggestion);
      },
      onSuggestionHover: (_suggestion, _index) => {
        // Можно показать превью на карте
        if (this.props.mapSyncService) {
          // Подсвечиваем соответствующий элемент на карте
        }
      },
    });

    // Добавляем контейнер подсказок в контентную область
    this.contentContainer.appendChild(this.suggestionsContainer);
  }

  /**
   * Загрузка подсказок
   */
  private loadSuggestions(): void {
    // Генерируем мок подсказки на основе текущего запроса
    this.suggestions = this.generateMockSuggestions(this.currentQuery);

    // Обновляем компонент подсказок
    if (this.searchSuggestions) {
      this.searchSuggestions.updateSuggestions(this.suggestions);
    }
  }

  /**
   * Генерация мок подсказок
   */
  private generateMockSuggestions(query: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];

    // История поиска
    if (!query.trim()) {
      suggestions.push(
        {
          id: 'history_1',
          text: 'Кафе на Невском',
          type: 'history',
          subtitle: 'Недавний поиск',
        },
        {
          id: 'history_2',
          text: 'Рестораны рядом',
          type: 'history',
          subtitle: 'Вчера',
        }
      );
    }

    // Популярные запросы
    suggestions.push(
      {
        id: 'popular_1',
        text: 'Пиццерии',
        type: 'popular',
        subtitle: 'Популярно сегодня',
      },
      {
        id: 'popular_2',
        text: 'Салоны красоты',
        type: 'popular',
        subtitle: 'Часто ищут',
      }
    );

    // Подсказки по запросу
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();

      // Организации
      const organizations = [
        { name: 'Макдоналдс', category: 'Ресторан быстрого питания' },
        { name: 'Кофе Хауз', category: 'Кофейня' },
        { name: 'Пятерочка', category: 'Продуктовый магазин' },
        { name: 'Аптека.ру', category: 'Аптека' },
      ];

      organizations
        .filter(org => org.name.toLowerCase().includes(lowerQuery))
        .forEach((org, index) => {
          suggestions.push({
            id: `org_${index}`,
            text: org.name,
            type: 'organization',
            subtitle: org.category,
          });
        });

      // Адреса
      const addresses = ['Невский проспект, 28', 'ул. Рубинштейна, 15/17', 'пр. Ленина, 45'];

      addresses
        .filter(addr => addr.toLowerCase().includes(lowerQuery))
        .forEach((addr, index) => {
          suggestions.push({
            id: `addr_${index}`,
            text: addr,
            type: 'address',
            subtitle: 'Санкт-Петербург',
          });
        });

      // Категории
      const categories = ['Рестораны', 'Кафе', 'Магазины', 'Аптеки', 'Банки'];

      categories
        .filter(cat => cat.toLowerCase().includes(lowerQuery))
        .forEach((cat, index) => {
          suggestions.push({
            id: `cat_${index}`,
            text: cat,
            type: 'category',
            subtitle: 'Категория',
          });
        });
    }

    return suggestions;
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
    this.props.searchFlowManager.currentScreen = ScreenType.SUGGEST;

    // Обновляем запрос в контексте
    if (this.currentQuery) {
      this.props.searchFlowManager.updateQuery(this.currentQuery);
    }

    // Синхронизируем карту с содержимым подсказок
    if (this.props.mapSyncService) {
      this.props.mapSyncService.syncPinsWithContent('suggestions', {
        query: this.currentQuery,
        suggestions: this.suggestions,
      });
    }
  }

  /**
   * Обработка изменения запроса
   */
  private handleQueryChange(query: string): void {
    this.currentQuery = query;

    // Обновляем подсказки
    this.loadSuggestions();

    // Обновляем контекст поиска
    this.props.searchFlowManager.updateQuery(query);

    // Синхронизируем с картой
    if (this.props.mapSyncService) {
      this.props.mapSyncService.syncPinsWithContent('suggestions', {
        query,
        suggestions: this.suggestions,
      });
    }

    // Уведомляем родительский компонент
    this.props.onQueryChange?.(query);
  }

  /**
   * Обработка отправки запроса
   */
  private handleQuerySubmit(query: string): void {
    if (!query.trim()) return;

    // Переходим к результатам поиска
    this.props.searchFlowManager.goToSearchResults(query);

    // Добавляем в историю
    this.addQueryToHistory(query);
  }

  /**
   * Обработка очистки поиска
   */
  private handleClearSearch(): void {
    this.currentQuery = '';

    // Обновляем подсказки
    this.loadSuggestions();

    // Очищаем контекст поиска
    this.props.searchFlowManager.updateQuery('');

    // Синхронизируем с картой
    if (this.props.mapSyncService) {
      this.props.mapSyncService.syncPinsWithContent('suggestions', {
        query: '',
        suggestions: this.suggestions,
      });
    }
  }

  /**
   * Обработка выбора подсказки
   */
  private handleSuggestionSelect(suggestion: SearchSuggestion): void {
    // Устанавливаем выбранную подсказку как запрос
    this.currentQuery = suggestion.text;
    this.searchBar?.setValue(suggestion.text);

    // Обновляем контекст поиска
    this.props.searchFlowManager.updateQuery(suggestion.text);

    // В зависимости от типа подсказки выполняем разные действия
    switch (suggestion.type) {
      case 'history':
      case 'popular':
      case 'category':
        // Переходим к результатам поиска
        this.props.searchFlowManager.goToSearchResults(suggestion.text);
        break;

      case 'organization':
        // Можно сразу перейти к карточке организации если есть ID
        this.props.searchFlowManager.goToSearchResults(suggestion.text);
        break;

      case 'address':
        // Показываем результаты по адресу
        this.props.searchFlowManager.goToSearchResults(suggestion.text);
        break;
    }

    // Добавляем в историю
    this.addQueryToHistory(suggestion.text);

    // Уведомляем родительский компонент
    this.props.onSuggestionSelect?.(suggestion);
  }

  /**
   * Обработка возврата к дашборду
   */
  private handleBackToDashboard(): void {
    this.props.searchFlowManager.goToDashboard();
    this.props.onBackToDashboard?.();
  }

  /**
   * Обработка нажатий клавиш
   */
  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        // Возвращаемся к дашборду
        this.handleBackToDashboard();
        break;

      case 'ArrowDown':
      case 'ArrowUp':
        // Можно добавить навигацию по подсказкам с клавиатуры
        event.preventDefault();
        // TODO: Реализовать навигацию по списку
        break;
    }
  }

  /**
   * Обработка изменения размера экрана
   */
  private handleResize(): void {
    // Обновляем высоты и адаптируем интерфейс
    // Resize handling is managed by the main bottomsheet manager
  }

  /**
   * Добавление запроса в историю
   */
  private addQueryToHistory(_query: string): void {
    // В реальном приложении здесь будет сохранение в localStorage или API
  }

  /**
   * Активация экрана
   */
  public activate(): void {
    this.element.style.display = 'flex';

    // Устанавливаем состояние шторки в FULLSCREEN для подсказок
    this.props.bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);

    // Фокусируемся на поисковой строке
    setTimeout(() => {
      this.searchBar?.focus();
    }, 100);

    // Синхронизируем с сервисами
    this.syncWithServices();
  }

  /**
   * Деактивация экрана
   */
  public deactivate(): void {
    this.element.style.display = 'none';

    // Снимаем фокус с поисковой строки
    this.searchBar?.blur();
  }

  /**
   * Обновление данных экрана
   */
  public refresh(): void {
    // Перезагружаем подсказки
    this.loadSuggestions();
  }

  /**
   * Установка нового запроса
   */
  public setQuery(query: string): void {
    this.currentQuery = query;
    this.searchBar?.setValue(query);
    this.loadSuggestions();
  }

  /**
   * Получение текущего состояния экрана
   */
  public getState(): any {
    return {
      screen: ScreenType.SUGGEST,
      query: this.currentQuery,
      suggestions: this.suggestions,
      bottomsheetState: this.props.bottomsheetManager.getCurrentState(),
    };
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    // Удаляем обработчики событий
    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));

    // Очищаем компоненты
    this.bottomsheetHeader?.destroy();
    this.searchBar?.destroy();
    this.searchSuggestions?.destroy();

    // Очищаем ссылки
    this.headerContainer = undefined;
    this.contentContainer = undefined;
    this.suggestionsContainer = undefined;
  }
}

/**
 * Фабрика для создания SuggestScreen
 */
export class SuggestScreenFactory {
  /**
   * Создание экрана подсказок
   */
  static create(props: SuggestScreenProps): SuggestScreen {
    return new SuggestScreen(props);
  }

  /**
   * Создание экрана с настройками по умолчанию
   */
  static createDefault(
    container: HTMLElement,
    searchFlowManager: SearchFlowManager,
    bottomsheetManager: BottomsheetManager,
    initialQuery?: string
  ): SuggestScreen {
    return new SuggestScreen({
      container,
      searchFlowManager,
      bottomsheetManager,
      initialQuery,
    });
  }
}
