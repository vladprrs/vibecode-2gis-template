import {
  SearchFlowManager as ISearchFlowManager,
  NavigationEvents,
  Organization,
  ScreenType,
  SearchContext,
  SearchFilters,
  SearchSuggestion,
  Shop,
} from '../types';

/**
 * Реализация менеджера переходов между экранами
 * Управляет навигацией и поисковым контекстом
 */
export class SearchFlowManager implements ISearchFlowManager {
  public currentScreen: ScreenType;
  public searchContext: SearchContext;
  public navigationHistory: ScreenType[];

  private events: Partial<NavigationEvents>;
  private screenChangeCallbacks: Array<(screen: ScreenType) => void> = [];
  private scrollPositions: Map<ScreenType, number> = new Map();

  constructor(
    initialScreen: ScreenType = ScreenType.DASHBOARD,
    events: Partial<NavigationEvents> = {}
  ) {
    this.currentScreen = initialScreen;
    this.events = events;
    this.navigationHistory = [initialScreen];

    // Инициализация пустого поискового контекста
    this.searchContext = this.createEmptySearchContext();
  }

  /**
   * Переход к экрану подсказок поиска
   */
  goToSuggest(): void {
    this.navigateToScreen(ScreenType.SUGGEST);

    // Загружаем подсказки при переходе
    this.loadSuggestions();
  }

  /**
   * Переход к результатам поиска
   */
  goToSearchResults(query: string, filters?: SearchFilters): void {
    // Обновляем поисковый контекст
    this.updateQuery(query);
    if (filters) {
      this.updateFilters(filters);
    }

    // Добавляем в историю поиска
    this.addToHistory(query);

    // Переходим к экрану результатов
    this.navigateToScreen(ScreenType.SEARCH_RESULT);

    // Инициируем поиск
    this.performSearch(query, this.searchContext.filters);

    // Аналитика
    this.events.onSearchInitiated?.(query, 'search_bar');
  }

  /**
   * Переход к карточке организации
   */
  goToOrganization(organization: Organization): void {
    // Сохраняем позицию скролла текущего экрана
    this.saveCurrentScrollPosition();

    // Сохраняем выбранную организацию в контекст
    this.searchContext = {
      ...this.searchContext,
      selectedOrganization: organization,
    };

    this.navigateToScreen(ScreenType.ORGANIZATION);

    // Аналитика
    const position = this.searchContext.results.findIndex(org => org.id === organization.id);
    this.events.onOrganizationSelected?.(organization, position);
  }

  /**
   * Переход к экрану магазина
   */
  goToShop(shop: Shop): void {
    // Сохраняем позицию скролла текущего экрана
    this.saveCurrentScrollPosition();

    // Сохраняем данные магазина в контекст
    this.searchContext = {
      ...this.searchContext,
      selectedShop: shop,
    };

    this.navigateToScreen(ScreenType.SHOP);

    // Аналитика
    this.events.onScreenChange?.(this.currentScreen, ScreenType.SHOP, { shop });
  }

  /**
   * Переход к экрану корзины
   */
  goToCart(): void {
    // Сохраняем позицию скролла текущего экрана
    this.saveCurrentScrollPosition();

    this.navigateToScreen(ScreenType.CART);

    // Аналитика
    this.events.onScreenChange?.(this.currentScreen, ScreenType.CART, {});
  }

  /**
   * Возврат к предыдущему экрану
   */
  goBack(): void {
    if (this.navigationHistory.length > 1) {
      // Сохраняем экран, с которого уходим
      const fromScreen = this.currentScreen;

      // Убираем текущий экран из истории
      this.navigationHistory.pop();

      // Получаем предыдущий экран
      const previousScreen = this.navigationHistory[this.navigationHistory.length - 1];

      // Переходим без добавления в историю
      this.setCurrentScreen(previousScreen);

      // Вызываем событие смены экрана
      this.events.onScreenChange?.(fromScreen, previousScreen, this.searchContext);

      // Восстанавливаем позицию скролла после короткой задержки
      setTimeout(() => {
        this.restoreScrollPosition(previousScreen);
      }, 100);
    }
  }

  /**
   * Переход к главному экрану
   */
  goToDashboard(): void {
    // Очищаем поисковый контекст при возврате к дашборду
    this.searchContext = this.createEmptySearchContext();

    this.navigateToScreen(ScreenType.DASHBOARD);
  }

  /**
   * Обновление поискового запроса
   */
  updateQuery(query: string): void {
    this.searchContext = {
      ...this.searchContext,
      query: query.trim(),
    };
  }

  /**
   * Обновление фильтров поиска
   */
  updateFilters(filters: Partial<SearchFilters>): void {
    this.searchContext = {
      ...this.searchContext,
      filters: { ...this.searchContext.filters, ...filters },
    };

    // Аналитика
    this.events.onFilterApplied?.(this.searchContext.filters);
  }

  /**
   * Добавление запроса в историю
   */
  addToHistory(query: string): void {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Убираем дубликаты и добавляем в начало
    const updatedHistory = [
      trimmedQuery,
      ...this.searchContext.searchHistory.filter(item => item !== trimmedQuery),
    ].slice(0, 10); // Оставляем только последние 10 запросов

    this.searchContext = {
      ...this.searchContext,
      searchHistory: updatedHistory,
    };
  }

  /**
   * Очистка истории поиска
   */
  clearHistory(): void {
    this.searchContext = {
      ...this.searchContext,
      searchHistory: [],
    };
  }

  /**
   * Обработка выбора подсказки
   */
  selectSuggestion(suggestion: SearchSuggestion, position: number): void {
    // Аналитика
    this.events.onSuggestionSelected?.(suggestion, position);

    switch (suggestion.type) {
      case 'organization':
        // Если подсказка - организация, переходим сразу к карточке
        if (suggestion.organizationId) {
          const organization = this.findOrganizationById(suggestion.organizationId);
          if (organization) {
            this.goToOrganization(organization);
            return;
          }
        }
        break;

      case 'history':
      case 'popular':
      case 'address':
      case 'category':
        // Для остальных типов выполняем поиск
        this.goToSearchResults(suggestion.text);
        break;
    }
  }

  /**
   * Подписка на изменения экрана
   */
  onScreenChange(callback: (screen: ScreenType) => void): () => void {
    this.screenChangeCallbacks.push(callback);

    // Возвращаем функцию отписки
    return () => {
      const index = this.screenChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.screenChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Получить состояние загрузки
   */
  isLoading(): boolean {
    return this.searchContext.isLoading;
  }

  /**
   * Получить текущую ошибку
   */
  getCurrentError(): string | undefined {
    return this.searchContext.error;
  }

  /**
   * Внутренний метод для навигации
   */
  private navigateToScreen(screen: ScreenType): void {
    const fromScreen = this.currentScreen;

    // Добавляем в историю только если это новый экран
    if (screen !== this.currentScreen) {
      this.navigationHistory.push(screen);
    }

    this.setCurrentScreen(screen);

    // Аналитика
    this.events.onScreenChange?.(fromScreen, screen, this.searchContext);
  }

  /**
   * Установка текущего экрана без добавления в историю
   */
  private setCurrentScreen(screen: ScreenType): void {
    this.currentScreen = screen;

    // Уведомляем подписчиков
    this.screenChangeCallbacks.forEach(callback => callback(screen));
  }

  /**
   * Создание пустого поискового контекста
   */
  private createEmptySearchContext(): SearchContext {
    return {
      query: '',
      filters: {},
      results: [],
      suggestions: [],
      selectedOrganization: undefined,
      selectedShop: undefined,
      searchHistory: [],
      isLoading: false,
      error: undefined,
    };
  }

  /**
   * Загрузка подсказок для поиска
   */
  private async loadSuggestions(): Promise<void> {
    try {
      this.searchContext = { ...this.searchContext, isLoading: true, error: undefined };

      // В реальной реализации здесь будет API вызов
      const suggestions = await this.fetchSuggestions(this.searchContext.query);

      this.searchContext = {
        ...this.searchContext,
        suggestions,
        isLoading: false,
      };
    } catch (error) {
      this.searchContext = {
        ...this.searchContext,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки подсказок',
      };
    }
  }

  /**
   * Выполнение поиска
   */
  private async performSearch(query: string, filters: SearchFilters): Promise<void> {
    try {
      this.searchContext = { ...this.searchContext, isLoading: true, error: undefined };

      // В реальной реализации здесь будет API вызов
      const results = await this.fetchSearchResults(query, filters);

      this.searchContext = {
        ...this.searchContext,
        results,
        isLoading: false,
      };
    } catch (error) {
      this.searchContext = {
        ...this.searchContext,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка поиска',
      };
    }
  }

  /**
   * Поиск организации по ID
   */
  private findOrganizationById(id: string): Organization | undefined {
    return this.searchContext.results.find(org => org.id === id);
  }

  /**
   * Моковый метод для загрузки подсказок
   * В реальной реализации будет заменен на API вызов
   */
  private async fetchSuggestions(query: string): Promise<SearchSuggestion[]> {
    // Симуляция API вызова
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        id: '1',
        text: 'кафе',
        type: 'popular',
        subtitle: 'Популярный запрос',
      },
      {
        id: '2',
        text: 'ресторан',
        type: 'popular',
        subtitle: 'Популярный запрос',
      },
    ];
  }

  /**
   * Моковый метод для поиска
   * В реальной реализации будет заменен на API вызов
   */
  private async fetchSearchResults(query: string, filters: SearchFilters): Promise<Organization[]> {
    // Симуляция API вызова
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        id: '1',
        name: `Результат для "${query}"`,
        address: 'ул. Примерная, 1',
        coordinates: [37.6173, 55.7558],
        isAdvertiser: false,
        rating: 4.5,
        reviewsCount: 120,
        category: 'Кафе',
        description: 'Описание организации',
        phone: '+7 (495) 123-45-67',
      },
    ];
  }

  /**
   * Сохранение текущей позиции скролла
   */
  private saveCurrentScrollPosition(): void {
    const scrollableElement = document.querySelector('.bottomsheet-content');
    if (scrollableElement) {
      this.scrollPositions.set(this.currentScreen, scrollableElement.scrollTop);
    }
  }

  /**
   * Восстановление позиции скролла для указанного экрана
   */
  private restoreScrollPosition(screen: ScreenType): void {
    const savedPosition = this.scrollPositions.get(screen);
    if (savedPosition !== undefined) {
      const scrollableElement = document.querySelector('.bottomsheet-content');
      if (scrollableElement) {
        scrollableElement.scrollTop = savedPosition;
      }
    }
  }

  /**
   * Получение сохраненной позиции скролла для экрана
   */
  getSavedScrollPosition(screen: ScreenType): number | undefined {
    return this.scrollPositions.get(screen);
  }

  /**
   * Очистка сохраненных позиций скролла
   */
  clearScrollPositions(): void {
    this.scrollPositions.clear();
  }
}
