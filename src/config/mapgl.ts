/**
 * Конфигурация для 2GIS MapGL API
 */

// API ключ для 2GIS MapGL
export const MAPGL_API_KEY = 'bfa6ee5b-5e88-44f0-b4ad-394e819f26fc';

// Базовая конфигурация карты
export const MAPGL_CONFIG = {
  // Начальные координаты (Москва)
  defaultCenter: [37.620393, 55.75396] as [number, number],
  defaultZoom: 10,

  // Ограничения карты
  minZoom: 2,
  maxZoom: 20,

  // Стиль карты 2GIS
  style: 'https://tiles.api.2gis.com/2.0/tiles/styles?key=' + MAPGL_API_KEY,

  // Язык интерфейса
  language: 'ru',

  // Настройки взаимодействия
  interactive: true,
  scrollZoom: true,
  doubleClickZoom: true,
  touchZoom: true,
  dragPan: true,

  // Элементы управления
  showControls: {
    zoom: true,
    compass: true,
    pitch: false,
    attribution: true,
  },
};

// Конфигурация маркеров по умолчанию
export const DEFAULT_MARKER_CONFIG = {
  color: '#1976D2',
  size: 'medium' as 'small' | 'medium' | 'large',
  anchor: 'bottom' as 'center' | 'bottom' | 'top',
  clickable: true,
  draggable: false,
};

// Конфигурация для разных типов маркеров
export const MARKER_STYLES = {
  organization: {
    color: '#1976D2',
    size: 'medium' as const,
    icon: '🏢',
  },
  userLocation: {
    color: '#4CAF50',
    size: 'small' as const,
    icon: '📍',
  },
  searchResult: {
    color: '#FF5722',
    size: 'medium' as const,
    icon: '🔍',
  },
  popular: {
    color: '#9C27B0',
    size: 'small' as const,
    icon: '⭐',
  },
};

// Настройки анимаций карты
export const ANIMATION_CONFIG = {
  // Длительность анимаций (мс)
  duration: {
    fast: 200,
    normal: 500,
    slow: 1000,
  },

  // Типы easing
  easing: 'ease' as const,

  // Настройки для разных типов анимаций
  centerTo: {
    duration: 500,
    easing: 'ease' as const,
  },

  zoomTo: {
    duration: 300,
    easing: 'ease-out' as const,
  },

  fitBounds: {
    duration: 800,
    easing: 'ease-in-out' as const,
    padding: {
      top: 50,
      right: 50,
      bottom: 100, // Больше отступ снизу для bottomsheet
      left: 50,
    },
  },
};

// Конфигурация для разных экранов
export const SCREEN_MAP_CONFIG = {
  dashboard: {
    zoom: 12,
    showTraffic: false,
    showBuildings: true,
    tilt: 0,
  },

  suggest: {
    zoom: 11,
    showTraffic: false,
    showBuildings: true,
    tilt: 0,
  },

  searchResults: {
    zoom: 13,
    showTraffic: true,
    showBuildings: true,
    tilt: 0,
  },

  organization: {
    zoom: 16,
    showTraffic: true,
    showBuildings: true,
    tilt: 30, // Небольшой наклон для лучшего обзора
  },
};

// Конфигурация кластеризации маркеров
export const CLUSTER_CONFIG = {
  enabled: true,
  maxZoom: 15, // На каком зуме прекращать кластеризацию
  radius: 50, // Радиус кластеризации в пикселях
  minPoints: 2, // Минимальное количество точек для создания кластера

  // Стили кластеров
  styles: [
    {
      textColor: '#ffffff',
      textSize: 12,
      color: '#1976D2',
      size: 30,
    },
    {
      textColor: '#ffffff',
      textSize: 14,
      color: '#1565C0',
      size: 40,
    },
    {
      textColor: '#ffffff',
      textSize: 16,
      color: '#0D47A1',
      size: 50,
    },
  ],
};

// Конфигурация геолокации
export const GEOLOCATION_CONFIG = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 минут

  // Стиль маркера геолокации
  marker: {
    color: '#4CAF50',
    size: 'small' as const,
    showAccuracyCircle: true,
    accuracyCircleColor: 'rgba(76, 175, 80, 0.2)',
    accuracyCircleBorderColor: '#4CAF50',
  },
};

// URL для подключения MapGL JS API
// Правильный URL согласно документации: БЕЗ ключа в URL
export const MAPGL_JS_API_URL = 'https://mapgl.2gis.com/api/js/v1';

// Проверка поддержки WebGL
export const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};

// Получение оптимальной конфигурации для устройства
export const getDeviceOptimizedConfig = () => {
  const isTouch = 'ontouchstart' in window;
  const isMobile = window.innerWidth < 768;

  return {
    ...MAPGL_CONFIG,
    // На мобильных устройствах отключаем некоторые интенсивные функции
    showControls: {
      ...MAPGL_CONFIG.showControls,
      pitch: !isMobile, // Отключаем pitch control на мобильных
    },

    // Настройки для touch устройств
    touchZoom: isTouch,
    touchPitch: isTouch && !isMobile,

    // Производительность
    antialias: !isMobile, // Отключаем антиалиасинг на мобильных
    preserveDrawingBuffer: false,
  };
};
