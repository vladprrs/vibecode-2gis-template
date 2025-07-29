import {
  BOTTOMSHEET_ANIMATION_CONFIG,
  BOTTOMSHEET_HEIGHTS,
  BottomsheetConfig,
  BottomsheetEvents,
  BottomsheetState,
  BottomsheetStateData,
} from '../types';

/**
 * Менеджер состояний шторки
 * Центральный класс для управления поведением bottomsheet
 */
export class BottomsheetManager {
  private currentState: BottomsheetState;
  private config: BottomsheetConfig;
  private events: Partial<BottomsheetEvents>;
  private screenHeight: number;
  private isAnimating: boolean = false;
  private isDragging: boolean = false;

  constructor(
    initialConfig: BottomsheetConfig,
    events: Partial<BottomsheetEvents> = {},
    screenHeight: number = window.innerHeight
  ) {
    this.currentState = initialConfig.state;
    this.config = initialConfig;
    this.events = events;
    this.screenHeight = screenHeight;
  }

  /**
   * Получить текущее состояние шторки
   */
  getCurrentState(): BottomsheetStateData {
    return {
      currentState: this.currentState,
      height: this.getHeightForState(this.currentState),
      isDragging: this.isDragging,
      isAnimating: this.isAnimating,
      openProgress: this.getOpenProgress(),
    };
  }

  /**
   * Изменить состояние шторки с анимацией
   */
  snapToState(targetState: BottomsheetState): Promise<void> {
    return new Promise(resolve => {
      const fromState = this.currentState;

      if (fromState === targetState) {
        resolve();
        return;
      }

      this.isAnimating = true;
      this.events.onStateChange?.(fromState, targetState);
      this.events.onSnapToState?.(targetState);

      // Симуляция анимации (в реальной реализации здесь будет CSS transition или JS анимация)
      setTimeout(() => {
        this.currentState = targetState;
        this.isAnimating = false;
        resolve();
      }, BOTTOMSHEET_ANIMATION_CONFIG.duration);
    });
  }

  /**
   * Начать перетаскивание
   */
  startDrag(startY: number): void {
    this.isDragging = true;
    const currentHeight = this.getHeightForState(this.currentState);
    this.events.onDragStart?.(currentHeight);
  }

  /**
   * Обработка перетаскивания
   */
  handleDrag(deltaY: number): void {
    if (!this.isDragging) return;

    // Здесь будет логика обновления высоты шторки во время перетаскивания
    // В реальной реализации нужно обновить CSS transform или высоту
  }

  /**
   * Завершить перетаскивание и определить целевое состояние
   */
  endDrag(velocity: number, currentHeight: number): Promise<void> {
    if (!this.isDragging) return Promise.resolve();

    const startHeight = this.getHeightForState(this.currentState);
    this.isDragging = false;

    const targetState = this.findNearestSnapPoint(currentHeight, velocity);

    this.events.onDragEnd?.(startHeight, this.getHeightForState(targetState));

    return this.snapToState(targetState);
  }

  /**
   * Получить высоту в пикселях для состояния
   */
  getHeightForState(state: BottomsheetState): number {
    const percentage = BOTTOMSHEET_HEIGHTS[state];
    return Math.round(this.screenHeight * percentage);
  }

  /**
   * Получить процент раскрытия (0-1)
   */
  getOpenProgress(): number {
    const currentHeight = this.getHeightForState(this.currentState);
    const maxHeight = this.getHeightForState(BottomsheetState.FULLSCREEN_SCROLL);
    const minHeight = this.getHeightForState(BottomsheetState.SMALL);

    return (currentHeight - minHeight) / (maxHeight - minHeight);
  }

  /**
   * Найти ближайшую точку прилипания
   */
  private findNearestSnapPoint(currentHeight: number, velocity: number): BottomsheetState {
    const states = Object.values(BottomsheetState);
    const snapPoints = this.config.snapPoints;

    // Учитываем скорость для определения направления
    const velocityThreshold = BOTTOMSHEET_ANIMATION_CONFIG.snapVelocityThreshold;

    if (Math.abs(velocity) > velocityThreshold) {
      // Быстрое движение - двигаемся в направлении скорости
      if (velocity > 0) {
        // Движение вниз - к меньшему состоянию
        return this.getPreviousState(this.currentState);
      } else {
        // Движение вверх - к большему состоянию
        return this.getNextState(this.currentState);
      }
    }

    // Медленное движение - находим ближайшую точку
    let nearestState = this.currentState;
    let minDistance = Infinity;

    for (const state of states) {
      const stateHeight = this.getHeightForState(state);
      const distance = Math.abs(currentHeight - stateHeight);

      if (distance < minDistance) {
        minDistance = distance;
        nearestState = state;
      }
    }

    return nearestState;
  }

  /**
   * Получить предыдущее состояние
   */
  private getPreviousState(currentState: BottomsheetState): BottomsheetState {
    const states = [
      BottomsheetState.SMALL,
      BottomsheetState.DEFAULT,
      BottomsheetState.FULLSCREEN,
      BottomsheetState.FULLSCREEN_SCROLL,
    ];

    const currentIndex = states.indexOf(currentState);
    return currentIndex > 0 ? states[currentIndex - 1] : states[0];
  }

  /**
   * Получить следующее состояние
   */
  private getNextState(currentState: BottomsheetState): BottomsheetState {
    const states = [
      BottomsheetState.SMALL,
      BottomsheetState.DEFAULT,
      BottomsheetState.FULLSCREEN,
      BottomsheetState.FULLSCREEN_SCROLL,
    ];

    const currentIndex = states.indexOf(currentState);
    return currentIndex < states.length - 1 ? states[currentIndex + 1] : states[states.length - 1];
  }

  /**
   * Обновить конфигурацию шторки
   */
  updateConfig(newConfig: Partial<BottomsheetConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Обновить высоту экрана (например, при повороте)
   */
  updateScreenHeight(newHeight: number): void {
    this.screenHeight = newHeight;
  }

  /**
   * Проверить, можно ли перетаскивать
   */
  isDraggable(): boolean {
    return this.config.isDraggable && !this.isAnimating;
  }

  /**
   * Получить доступные snap points
   */
  getSnapPoints(): number[] {
    return this.config.snapPoints.map(point => point * this.screenHeight);
  }
}
