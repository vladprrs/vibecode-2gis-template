/**
 * Экраны приложения в рамках поискового флоу
 */
export enum ScreenType {
  /** Главный экран с дашбордом */
  DASHBOARD = 'dashboard',
  /** Экран подсказок поиска */
  SUGGEST = 'suggest',
  /** Экран результатов поиска */
  SEARCH_RESULT = 'search_result',
  /** Карточка организации */
  ORGANIZATION = 'organization',
  /** Экран магазина/каталога */
  SHOP = 'shop',
  /** Экран корзины */
  CART = 'cart',
  /** Экран оформления заказа */
  CHECKOUT = 'checkout',
}

/**
 * Фильтры поиска
 */
export interface SearchFilters {
  /** Категории для фильтрации */
  categories?: string[];
  /** Рейтинг от */
  ratingFrom?: number;
  /** Расстояние в метрах */
  distance?: number;
  /** Открыто сейчас */
  openNow?: boolean;
  /** Только с отзывами */
  withReviews?: boolean;
  /** Только рекламодатели */
  advertisersOnly?: boolean;
  /** Сортировка */
  sortBy?: 'relevance' | 'distance' | 'rating' | 'reviews';
}

/**
 * Базовая информация об организации
 */
export interface Organization {
  /** Уникальный идентификатор */
  id: string;
  /** Название организации */
  name: string;
  /** Адрес */
  address: string;
  /** Координаты [longitude, latitude] */
  coordinates: [number, number];
  /** Является ли рекламодателем */
  isAdvertiser: boolean;
  /** Рейтинг (1-5) */
  rating?: number;
  /** Количество отзывов */
  reviewsCount?: number;
  /** Категория */
  category: string;
  /** Описание */
  description?: string;
  /** Телефон */
  phone?: string;
  /** Часы работы */
  workingHours?: string;
  /** URL фото */
  photoUrl?: string;
  /** Расстояние от пользователя в метрах */
  distance?: number;
}

/**
 * Товар в магазине
 */
export interface Product {
  /** Уникальный идентификатор */
  id: string;
  /** Название товара */
  title: string;
  /** Описание товара */
  description?: string;
  /** Цена в рублях */
  price: number;
  /** URL изображения товара */
  imageUrl?: string;
  /** Бейджи товара */
  badges?: string[];
  /** Количество в корзине */
  quantity?: number;
  /** Категория товара */
  category?: string;
  /** Размер (для одежды) */
  size?: string;
  /** Цвет */
  color?: string;
  /** Бренд */
  brand?: string;
}

/**
 * Категория товаров
 */
export interface ProductCategory {
  /** Уникальный идентификатор */
  id: string;
  /** Название категории */
  name: string;
  /** Количество товаров в категории */
  count: number;
  /** Товары в категории */
  products: Product[];
  /** Иконка категории */
  icon?: string;
}

/**
 * Данные магазина
 */
export interface Shop {
  /** Идентификатор организации */
  organizationId: string;
  /** Название магазина */
  name: string;
  /** Категории товаров */
  categories: ProductCategory[];
  /** Все товары */
  products: Product[];
  /** Общая сумма корзины */
  cartTotal?: number;
  /** Количество товаров в корзине */
  cartItemsCount?: number;
  /** Тип магазина */
  type?: 'sports' | 'fitness' | 'general';
  /** Описание магазина */
  description?: string;
}

/**
 * Контекст поиска - данные, передаваемые между экранами
 */
export interface SearchContext {
  /** Поисковый запрос */
  query: string;
  /** Активные фильтры */
  filters: SearchFilters;
  /** Результаты поиска */
  results: Organization[];
  /** Подсказки для автодополнения */
  suggestions: SearchSuggestion[];
  /** Выбранная организация */
  selectedOrganization?: Organization;
  /** Данные магазина */
  selectedShop?: Shop;
  /** История поиска */
  searchHistory: string[];
  /** Состояние загрузки */
  isLoading: boolean;
  /** Ошибка */
  error?: string;
}

/**
 * Подсказка для поиска
 */
export interface SearchSuggestion {
  /** Уникальный идентификатор */
  id: string;
  /** Текст подсказки */
  text: string;
  /** Тип подсказки */
  type: 'history' | 'popular' | 'organization' | 'address' | 'category';
  /** Дополнительная информация */
  subtitle?: string;
  /** Координаты (для организаций и адресов) */
  coordinates?: [number, number];
  /** ID организации (для типа organization) */
  organizationId?: string;
}

/**
 * Менеджер переходов между экранами
 */
export interface SearchFlowManager {
  /** Текущий экран */
  currentScreen: ScreenType;
  /** Поисковый контекст */
  searchContext: SearchContext;
  /** История навигации */
  navigationHistory: ScreenType[];

  /** Методы навигации */
  goToSuggest: () => void;
  goToSearchResults: (query: string, filters?: SearchFilters) => void;
  goToOrganization: (organization: Organization) => void;
  goToShop: (shop: Shop) => void;
  goToCart: () => void;
  goToCheckout: () => void;
  goBack: () => void;
  goToDashboard: () => void;

  /** Методы для работы с поисковым контекстом */
  updateQuery: (query: string) => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

/**
 * События навигации для аналитики
 */
export interface NavigationEvents {
  onScreenChange: (fromScreen: ScreenType, toScreen: ScreenType, context?: any) => void;
  onSearchInitiated: (query: string, source: 'search_bar' | 'suggestion' | 'voice') => void;
  onSuggestionSelected: (suggestion: SearchSuggestion, position: number) => void;
  onFilterApplied: (filters: SearchFilters) => void;
  onOrganizationSelected: (organization: Organization, position: number) => void;
}
