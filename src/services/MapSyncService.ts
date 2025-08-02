import {
  MapBottomsheetSync,
  MapContentType,
  MapPin,
  MapRef,
  MapState,
  Organization,
} from '../types';
import { MAPGL_API_KEY } from '../config/mapgl';

// Тип для RefObject без зависимости от React
type RefObject<T> = { current: T | null };

/**
 * Обновленный сервис синхронизации карты с реальным MapGL
 */
export class MapSyncService implements MapBottomsheetSync {
  private mapRef: RefObject<MapRef>;
  private mapState: MapState;
  private config: any; // Упрощенная конфигурация
  private currentPins: MapPin[] = [];

  constructor(mapRef: RefObject<MapRef>, config: any = {}) {
    this.mapRef = mapRef;
    this.config = config;

    // Инициализируем базовое состояние
    this.mapState = {
      center: [37.620393, 55.75396], // Москва по умолчанию
      zoom: 10,
      pins: [],
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    };
  }

  /**
   * Синхронизация пинов с содержимым экрана
   */
  syncPinsWithContent(contentType: MapContentType, data: any): void {
    let newPins: MapPin[] = [];

    switch (contentType) {
      case 'dashboard':
        newPins = this.generateDashboardPins(data);
        break;

      case 'suggestions':
        newPins = this.generateSuggestionPins(data);
        break;

      case 'search_results':
        newPins = this.generateSearchResultPins(data);
        break;

      case 'organization':
        newPins = this.generateOrganizationPins(data);
        break;
    }

    this.currentPins = newPins;
    this.updateMapPins(newPins);
  }

  /**
   * Генерация пинов для дашборда
   */
  private generateDashboardPins(data: any): MapPin[] {
    const pins: MapPin[] = [];

    // Добавляем популярные места
    if (data?.showPopularPlaces) {
      pins.push(
        {
          id: 'popular_1',
          coordinates: [37.622504, 55.753215], // Красная площадь
          title: 'Красная площадь',
          subtitle: 'Популярное место',
          isHighlighted: false,
          type: 'search_result',
          clusterable: false,
        },
        {
          id: 'popular_2',
          coordinates: [37.618423, 55.751244], // ГУМ
          title: 'ГУМ',
          subtitle: 'Торговый центр',
          isHighlighted: false,
          type: 'organization',
          clusterable: true,
        },
        {
          id: 'popular_3',
          coordinates: [37.617734, 55.752023], // Собор Василия Блаженного
          title: 'Собор Василия Блаженного',
          subtitle: 'Достопримечательность',
          isHighlighted: false,
          type: 'organization',
          clusterable: false,
        }
      );
    }

    // Добавляем местоположение пользователя
    if (data?.showUserLocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userPin: MapPin = {
            id: 'user_location',
            coordinates: [position.coords.longitude, position.coords.latitude],
            title: 'Ваше местоположение',
            isHighlighted: true,
            type: 'user_location',
            clusterable: false,
          };
          this.currentPins.push(userPin);
          this.updateMapPins(this.currentPins);
        },
        error => {
          console.warn('Не удалось получить геолокацию:', error);
        }
      );
    }

    return pins;
  }

  /**
   * Генерация пинов для подсказок
   */
  private generateSuggestionPins(data: any): MapPin[] {
    const pins: MapPin[] = [];

    // Если есть запрос, показываем релевантные места
    if (data?.query && data.query.length > 2) {
      // Мок места на основе запроса
      const mockPlaces = [
        {
          coordinates: [37.621311, 55.75438] as [number, number],
          title: `${data.query} - место 1`,
          subtitle: 'Найдено по запросу',
        },
        {
          coordinates: [37.619472, 55.75396] as [number, number],
          title: `${data.query} - место 2`,
          subtitle: 'Найдено по запросу',
        },
      ];

      mockPlaces.forEach((place, index) => {
        pins.push({
          id: `suggestion_${index}`,
          coordinates: place.coordinates,
          title: place.title,
          subtitle: place.subtitle,
          isHighlighted: false,
          type: 'search_result',
          clusterable: true,
        });
      });
    }

    return pins;
  }

  /**
   * Генерация пинов для результатов поиска
   */
  private generateSearchResultPins(data: any): MapPin[] {
    const pins: MapPin[] = [];

    if (data?.organizations && Array.isArray(data.organizations)) {
      data.organizations.forEach((org: Organization, index: number) => {
        // Генерируем координаты на основе адреса (в реальном приложении будет геокодинг)
        const baseCoords = [37.620393, 55.75396];
        const coords: [number, number] = [
          baseCoords[0] + (Math.random() - 0.5) * 0.02, // Случайное смещение для демо
          baseCoords[1] + (Math.random() - 0.5) * 0.02,
        ];

        pins.push({
          id: `org_${org.id}`,
          coordinates: coords,
          title: org.name,
          subtitle: org.category,
          isHighlighted: false,
          type: 'organization',
          organizationId: org.id,
          isAdvertiser: org.isAdvertiser,
          clusterable: true,
        });
      });
    }

    return pins;
  }

  /**
   * Генерация пинов для детальной карточки организации
   */
  private generateOrganizationPins(data: any): MapPin[] {
    if (!data?.organization) return [];

    const org = data.organization as Organization;

    // Генерируем координаты для организации
    const coords: [number, number] = [
      37.620393 + Math.random() * 0.01,
      55.75396 + Math.random() * 0.01,
    ];

    return [
      {
        id: `selected_org_${org.id}`,
        coordinates: coords,
        title: org.name,
        subtitle: org.address,
        isHighlighted: true,
        type: 'selected',
        organizationId: org.id,
        isAdvertiser: org.isAdvertiser,
        clusterable: false,
      },
    ];
  }

  /**
   * Обновление пинов на карте
   */
  private updateMapPins(pins: MapPin[]): void {
    if (this.mapRef.current) {
      this.mapRef.current.setPins(pins);
      this.mapState.pins = pins;
    }
  }

  /**
   * Выделение пина организации
   */
  highlightOrganizationPin(organizationId: string): void {
    // Обновляем состояние пинов
    this.currentPins = this.currentPins.map(pin => ({
      ...pin,
      isHighlighted: pin.organizationId === organizationId,
    }));

    // Обновляем карту
    this.updateMapPins(this.currentPins);

    // Выделяем пин через MapRef
    if (this.mapRef.current) {
      const targetPin = this.currentPins.find(pin => pin.organizationId === organizationId);
      if (targetPin) {
        this.mapRef.current.highlightPin(targetPin.id);
      }
    }
  }

  /**
   * Снятие выделения со всех пинов
   */
  clearHighlights(): void {
    this.currentPins = this.currentPins.map(pin => ({
      ...pin,
      isHighlighted: false,
    }));

    this.updateMapPins(this.currentPins);
  }

  /**
   * Адаптация видимой области карты под высоту шторки
   */
  adjustMapViewport(bottomsheetHeight: number): void {
    if (!this.mapRef.current) return;

    // Вычисляем отступы на основе высоты шторки
    const screenHeight = window.innerHeight;
    const bottomPadding = bottomsheetHeight;

    const padding = {
      top: 20,
      right: 20,
      bottom: Math.max(bottomPadding, 100), // Минимум 100px отступ снизу
      left: 20,
    };

    this.mapRef.current.adjustPadding(padding);
    this.mapState.padding = padding;
  }

  /**
   * Центрирование карты на организации
   */
  centerOnOrganization(organization: Organization): void {
    if (!this.mapRef.current) return;

    // Генерируем координаты для организации (в реальном приложении будет геокодинг)
    const coords: [number, number] = [
      37.620393 + Math.random() * 0.01,
      55.75396 + Math.random() * 0.01,
    ];

    this.mapRef.current.setCenter(coords, true);
    this.mapRef.current.setZoom(16, true);

    this.mapState.center = coords;
    this.mapState.zoom = 16;
  }

  /**
   * Подгонка карты под результаты поиска
   */
  fitToSearchResults(organizations: Organization[]): void {
    if (!this.mapRef.current || organizations.length === 0) return;

    // Генерируем координаты для всех организаций
    const points: [number, number][] = organizations.map(() => [
      37.620393 + (Math.random() - 0.5) * 0.02,
      55.75396 + (Math.random() - 0.5) * 0.02,
    ]);

    if (points.length === 1) {
      // Если одна организация, центрируем на ней
      this.mapRef.current.setCenter(points[0], true);
      this.mapRef.current.setZoom(15, true);
    } else {
      // Если несколько, вычисляем bounds и подгоняем карту
      const bounds = this.calculateBoundsFromPoints(points);
      this.mapRef.current.fitBounds(bounds);
    }
  }

  /**
   * Обновление местоположения пользователя
   */
  updateUserLocation(coordinates: [number, number]): void {
    // Удаляем старый пин пользователя
    this.currentPins = this.currentPins.filter(pin => pin.type !== 'user_location');

    // Добавляем новый пин пользователя
    const userPin: MapPin = {
      id: 'user_location',
      coordinates,
      title: 'Ваше местоположение',
      isHighlighted: true,
      type: 'user_location',
      clusterable: false,
    };

    this.currentPins.push(userPin);
    this.updateMapPins(this.currentPins);
  }

  /**
   * Получение видимых организаций в области карты
   */
  getVisibleOrganizations(): Organization[] {
    // Фильтруем пины организаций из текущих пинов
    const organizationPins = this.currentPins.filter(
      pin => pin.type === 'organization' && pin.organizationId
    );

    // Преобразуем пины в организации (упрощенная версия)
    return organizationPins.map(pin => ({
      id: pin.organizationId!,
      name: pin.title,
      category: pin.subtitle || 'Неизвестно',
      address: pin.subtitle || '',
      coordinates: pin.coordinates,
      rating: 0,
      reviewsCount: 0,
      distance: 0,
      phone: '',
      workingHours: '',
      isAdvertiser: pin.isAdvertiser || false,
    }));
  }

  /**
   * Вычисление bounds из списка точек
   */
  private calculateBoundsFromPoints(points: [number, number][]): MapState['bounds'] {
    if (points.length === 0) {
      return {
        northEast: [0, 0],
        southWest: [0, 0],
      };
    }

    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    points.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });

    // Добавляем небольшой отступ
    const padding = 0.01;

    return {
      northEast: [maxLng + padding, maxLat + padding],
      southWest: [minLng - padding, minLat - padding],
    };
  }

  /**
   * Получение текущего состояния карты
   */
  getMapState(): MapState {
    if (this.mapRef.current) {
      return this.mapRef.current.getMapState();
    }
    return this.mapState;
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newConfig: any): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Фабрика для создания MapSyncService
 */
export class MapSyncServiceFactory {
  /**
   * Создание сервиса синхронизации
   */
  static create(mapRef: RefObject<MapRef>, config: any = {}): MapSyncService {
    return new MapSyncService(mapRef, config);
  }

  /**
   * Создание сервиса с настройками по умолчанию
   */
  static createDefault(mapRef: RefObject<MapRef>): MapSyncService {
    return new MapSyncService(mapRef, {
      apiKey: MAPGL_API_KEY,
      enableGeolocation: true,
      enableClustering: true,
    });
  }
}
