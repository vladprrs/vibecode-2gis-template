import { Organization } from './navigation';

/**
 * Тип контента для синхронизации с картой
 */
export type MapContentType = 
  | 'dashboard' 
  | 'search_results' 
  | 'organization'
  | 'suggestions';

/**
 * Пин на карте
 */
export interface MapPin {
  /** Уникальный идентификатор пина */
  id: string;
  /** Координаты [longitude, latitude] */
  coordinates: [number, number];
  /** Заголовок пина */
  title: string;
  /** Подзаголовок */
  subtitle?: string;
  /** Выделен ли пин */
  isHighlighted: boolean;
  /** Тип пина */
  type: 'organization' | 'user_location' | 'search_result' | 'selected';
  /** Связанная организация */
  organizationId?: string;
  /** Является ли рекламодателем */
  isAdvertiser?: boolean;
  /** Кластеризуется ли пин */
  clusterable?: boolean;
}

/**
 * Состояние карты
 */
export interface MapState {
  /** Центр карты [longitude, latitude] */
  center: [number, number];
  /** Уровень зума */
  zoom: number;
  /** Пины на карте */
  pins: MapPin[];
  /** Выделенный пин */
  highlightedPinId?: string;
  /** Видимая область карты */
  bounds?: {
    northEast: [number, number];
    southWest: [number, number];
  };
  /** Отступы карты для шторки */
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Конфигурация карты
 */
export interface MapConfig {
  /** API ключ для MapGL */
  apiKey: string;
  /** Центр карты по умолчанию */
  defaultCenter: [number, number];
  /** Зум по умолчанию */
  defaultZoom: number;
  /** Минимальный зум */
  minZoom: number;
  /** Максимальный зум */
  maxZoom: number;
  /** Стиль карты */
  style?: string;
  /** Включить кластеризацию */
  enableClustering: boolean;
  /** Включить пользовательское местоположение */
  enableUserLocation: boolean;
}

/**
 * Синхронизация карты и шторки
 */
export interface MapBottomsheetSync {
  /** Обновление пинов на основе содержимого шторки */
  syncPinsWithContent: (contentType: MapContentType, data: any) => void;
  
  /** Выделение пина организации */
  highlightOrganizationPin: (organizationId: string) => void;
  
  /** Снятие выделения со всех пинов */
  clearHighlights: () => void;
  
  /** Адаптация видимой области карты под высоту шторки */
  adjustMapViewport: (bottomsheetHeight: number) => void;
  
  /** Центрирование карты на организации */
  centerOnOrganization: (organization: Organization) => void;
  
  /** Центрирование карты на результатах поиска */
  fitToSearchResults: (organizations: Organization[]) => void;
  
  /** Обновление пользовательского местоположения */
  updateUserLocation: (coordinates: [number, number]) => void;
  
  /** Получение видимых организаций в области карты */
  getVisibleOrganizations: () => Organization[];
}

/**
 * События карты
 */
export interface MapEvents {
  /** Клик по пину */
  onPinClick: (pin: MapPin) => void;
  /** Клик по карте */
  onMapClick: (coordinates: [number, number]) => void;
  /** Изменение центра карты */
  onCenterChange: (center: [number, number]) => void;
  /** Изменение зума */
  onZoomChange: (zoom: number) => void;
  /** Изменение видимой области */
  onBoundsChange: (bounds: MapState['bounds']) => void;
  /** Загрузка карты завершена */
  onMapLoad: () => void;
  /** Ошибка загрузки карты */
  onMapError: (error: Error) => void;
}

/**
 * Параметры анимации карты
 */
export interface MapAnimationOptions {
  /** Длительность анимации в мс */
  duration?: number;
  /** Функция easing */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  /** Callback по завершению анимации */
  onComplete?: () => void;
}

/**
 * Типы интерактивности карты
 */
export interface MapInteractionConfig {
  /** Можно ли перетаскивать карту */
  draggable: boolean;
  /** Можно ли зуммировать колесом мыши */
  scrollZoom: boolean;
  /** Можно ли зуммировать двойным кликом */
  doubleClickZoom: boolean;
  /** Можно ли зуммировать жестами (touch) */
  touchZoom: boolean;
  /** Можно ли поворачивать карту */
  rotatable: boolean;
  /** Показывать ли элементы управления */
  showControls: boolean;
}

/**
 * Фильтр пинов на карте
 */
export interface MapPinFilter {
  /** Показывать только рекламодателей */
  advertisersOnly?: boolean;
  /** Категории для отображения */
  categories?: string[];
  /** Минимальный рейтинг */
  minRating?: number;
  /** Максимальное расстояние от центра */
  maxDistance?: number;
}

/**
 * Ref интерфейс для компонента карты
 */
export interface MapRef {
  /** Центрирование карты */
  setCenter: (center: [number, number], animated?: boolean) => void;
  /** Изменение зума */
  setZoom: (zoom: number, animated?: boolean) => void;
  /** Установка пинов */
  setPins: (pins: MapPin[]) => void;
  /** Выделение пина */
  highlightPin: (pinId: string) => void;
  /** Настройка отступов */
  adjustPadding: (padding: Partial<MapState['padding']>) => void;
  /** Получение текущего состояния */
  getMapState: () => MapState;
  /** Подстройка под границы */
  fitBounds: (bounds: MapState['bounds'], options?: MapAnimationOptions) => void;
} 