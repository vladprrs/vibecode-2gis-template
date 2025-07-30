/**
 * Состояния высоты шторки
 * Определяют различные уровни раскрытия bottomsheet поверх карты
 */
export enum BottomsheetState {
  /** Минимальная высота ~20% экрана - только поисковая строка и основные элементы */
  SMALL = 'small',
  /** Средняя высота ~50% экрана - баланс между картой и контентом */
  DEFAULT = 'default',
  /** Полная высота ~90% экрана - фокус на контенте */
  FULLSCREEN = 'fullscreen',
  /** Полная высота с внутренней прокруткой - максимум контента */
  FULLSCREEN_SCROLL = 'fullscreen_scroll',
}

/**
 * Конфигурация поведения шторки
 */
export interface BottomsheetConfig {
  /** Текущее состояние шторки */
  state: BottomsheetState;
  /** Точки "прилипания" для жестов (от 0 до 1) */
  snapPoints: number[];
  /** Можно ли перетаскивать шторку */
  isDraggable: boolean;
  /** Есть ли прокручиваемый контент внутри */
  hasScrollableContent: boolean;
  /** Минимальная высота в пикселях */
  minHeight?: number;
  /** Максимальная высота в пикселях */
  maxHeight?: number;
}

/**
 * Состояние шторки для React компонентов
 */
export interface BottomsheetStateData {
  /** Текущее состояние */
  currentState: BottomsheetState;
  /** Текущая высота в пикселях */
  height: number;
  /** Происходит ли перетаскивание */
  isDragging: boolean;
  /** Анимируется ли переход между состояниями */
  isAnimating: boolean;
  /** Процент раскрытия (0-1) */
  openProgress: number;
}

/**
 * Константы высот для разных состояний
 * Значения в процентах от высоты экрана
 */
export const BOTTOMSHEET_HEIGHTS = {
  [BottomsheetState.SMALL]: 0.2,
  [BottomsheetState.DEFAULT]: 0.5,
  [BottomsheetState.FULLSCREEN]: 0.95,
  [BottomsheetState.FULLSCREEN_SCROLL]: 1.0, // True fullscreen - 100% height with safe-area padding
} as const;

/**
 * Настройки анимаций по умолчанию
 */
export const BOTTOMSHEET_ANIMATION_CONFIG = {
  /** Длительность анимации перехода в мс */
  duration: 300,
  /** Функция easing для плавности */
  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  /** Минимальная скорость для snap */
  snapVelocityThreshold: 500,
  /** Минимальное расстояние для срабатывания snap */
  snapDistanceThreshold: 50,
} as const;

/**
 * События шторки для аналитики и отладки
 */
export interface BottomsheetEvents {
  onStateChange: (fromState: BottomsheetState, toState: BottomsheetState) => void;
  onDragStart: (currentHeight: number) => void;
  onDragEnd: (startHeight: number, endHeight: number) => void;
  onSnapToState: (targetState: BottomsheetState) => void;
}
