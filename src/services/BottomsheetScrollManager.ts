import { BottomsheetState, BottomsheetStateData } from '../types';
import { BottomsheetManager } from './BottomsheetManager';

/**
 * Менеджер скролла для шторки
 * Управляет поведением скролла в зависимости от состояния шторки
 */
export class BottomsheetScrollManager {
  private container: HTMLElement;
  private contentContainer: HTMLElement;
  private bottomsheetManager: BottomsheetManager;
  private isScrollBlocked: boolean = true;
  private wheelAccumulator: number = 0;
  private wheelThreshold: number = 50; // Порог для срабатывания изменения состояния
  private wheelTimeout?: number;
  private isWheelScrolling: boolean = false;

  constructor(
    container: HTMLElement,
    contentContainer: HTMLElement,
    bottomsheetManager: BottomsheetManager
  ) {
    this.container = container;
    this.contentContainer = contentContainer;
    this.bottomsheetManager = bottomsheetManager;
    
    this.initialize();
  }

  /**
   * Инициализация менеджера скролла
   */
  private initialize(): void {
    this.setupEventListeners();
    this.updateScrollBehavior();
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    // Обработчик wheel событий для десктопа
    this.container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    
    // Обработчики touch событий для мобильных устройств
    this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

    // Блокируем стандартное поведение скролла для контента когда нужно
    this.contentContainer.addEventListener('scroll', this.handleContentScroll.bind(this));
  }

  /**
   * Обработка wheel событий
   */
  private handleWheel(event: WheelEvent): void {
    const currentState = this.bottomsheetManager.getCurrentState();
    
    // В состоянии fullscreen_scroll разрешаем обычный скролл контента
    if (currentState.currentState === BottomsheetState.FULLSCREEN_SCROLL) {
      // Проверяем, достиг ли контент границ прокрутки
      const { scrollTop, scrollHeight, clientHeight } = this.contentContainer;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      // Если прокручиваем вверх на самом верху - уменьшаем шторку
      if (event.deltaY < 0 && isAtTop) {
        event.preventDefault();
        this.handleStateTransition(-1);
        return;
      }
      
      // Разрешаем обычный скролл внутри контента
      return;
    }

    // В остальных состояниях блокируем скролл контента и управляем высотой шторки
    event.preventDefault();
    
    // Накапливаем значения wheel для плавного изменения
    this.wheelAccumulator += event.deltaY;
    this.isWheelScrolling = true;
    
    // Сбрасываем таймер
    if (this.wheelTimeout) {
      clearTimeout(this.wheelTimeout);
    }
    
    // Проверяем, достигли ли порога для изменения состояния
    if (Math.abs(this.wheelAccumulator) >= this.wheelThreshold) {
      const direction = this.wheelAccumulator > 0 ? 1 : -1;
      this.handleStateTransition(direction);
      this.wheelAccumulator = 0;
    }
    
    // Устанавливаем таймер для сброса накопителя
    this.wheelTimeout = window.setTimeout(() => {
      this.wheelAccumulator = 0;
      this.isWheelScrolling = false;
    }, 200);
  }

  /**
   * Обработка изменения состояния шторки
   */
  private handleStateTransition(direction: number): void {
    const currentState = this.bottomsheetManager.getCurrentState();
    const states = [
      BottomsheetState.SMALL,
      BottomsheetState.DEFAULT,
      BottomsheetState.FULLSCREEN,
      BottomsheetState.FULLSCREEN_SCROLL
    ];
    
    const currentIndex = states.indexOf(currentState.currentState);
    let targetIndex = currentIndex;
    
    if (direction > 0) {
      // Скролл вниз - уменьшаем высоту шторки
      targetIndex = Math.max(0, currentIndex - 1);
    } else {
      // Скролл вверх - увеличиваем высоту шторки
      targetIndex = Math.min(states.length - 1, currentIndex + 1);
    }
    
    if (targetIndex !== currentIndex) {
      const targetState = states[targetIndex];
      this.bottomsheetManager.snapToState(targetState).then(() => {
        this.updateScrollBehavior();
      });
    }
  }

  // Touch события для мобильных устройств
  private touchStartY: number = 0;
  private touchCurrentY: number = 0;
  private isTouchScrolling: boolean = false;

  /**
   * Обработка начала touch события
   */
  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    
    this.touchStartY = event.touches[0].clientY;
    this.touchCurrentY = this.touchStartY;
    this.isTouchScrolling = false;
  }

  /**
   * Обработка движения touch события
   */
  private handleTouchMove(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    
    const currentY = event.touches[0].clientY;
    const deltaY = this.touchCurrentY - currentY;
    const totalDelta = this.touchStartY - currentY;
    
    const currentState = this.bottomsheetManager.getCurrentState();
    
    // В состоянии fullscreen_scroll проверяем границы контента
    if (currentState.currentState === BottomsheetState.FULLSCREEN_SCROLL) {
      const { scrollTop, scrollHeight, clientHeight } = this.contentContainer;
      const isAtTop = scrollTop <= 0;
      
      // Если тянем вниз на самом верху контента - уменьшаем шторку
      if (totalDelta < -30 && isAtTop) {
        event.preventDefault();
        this.handleStateTransition(-1);
        return;
      }
      
      // Разрешаем обычный скролл
      return;
    }
    
    // В остальных состояниях блокируем скролл контента
    event.preventDefault();
    
    // Определяем направление для изменения состояния
    if (Math.abs(totalDelta) > 30) {
      if (!this.isTouchScrolling) {
        const direction = totalDelta > 0 ? 1 : -1;
        this.handleStateTransition(direction);
        this.isTouchScrolling = true;
      }
    }
    
    this.touchCurrentY = currentY;
  }

  /**
   * Обработка окончания touch события
   */
  private handleTouchEnd(event: TouchEvent): void {
    this.isTouchScrolling = false;
  }

  /**
   * Обработка скролла контента
   */
  private handleContentScroll(event: Event): void {
    const currentState = this.bottomsheetManager.getCurrentState();
    
    // Блокируем скролл контента если не в состоянии fullscreen_scroll
    if (currentState.currentState !== BottomsheetState.FULLSCREEN_SCROLL && this.isScrollBlocked) {
      event.preventDefault();
      this.contentContainer.scrollTop = 0;
    }
  }

  /**
   * Обновление поведения скролла в зависимости от состояния
   */
  public updateScrollBehavior(): void {
    const currentState = this.bottomsheetManager.getCurrentState();
    const isScrollableState = currentState.currentState === BottomsheetState.FULLSCREEN_SCROLL;
    
    this.isScrollBlocked = !isScrollableState;
    
    // Обновляем CSS для контейнера контента
    if (isScrollableState) {
      this.contentContainer.style.overflowY = 'auto';
      this.contentContainer.style.overflowX = 'hidden';
    } else {
      this.contentContainer.style.overflowY = 'hidden';
      this.contentContainer.style.overflowX = 'hidden';
      // Сбрасываем позицию скролла
      this.contentContainer.scrollTop = 0;
    }
    
    // Добавляем CSS классы для визуальной индикации
    this.container.classList.toggle('scroll-blocked', !isScrollableState);
    this.container.classList.toggle('scroll-enabled', isScrollableState);
  }

  /**
   * Получение состояния скролла
   */
  public getScrollState(): {
    isBlocked: boolean;
    currentState: BottomsheetState;
    canScrollContent: boolean;
  } {
    const currentState = this.bottomsheetManager.getCurrentState();
    const canScrollContent = currentState.currentState === BottomsheetState.FULLSCREEN_SCROLL;
    
    return {
      isBlocked: this.isScrollBlocked,
      currentState: currentState.currentState,
      canScrollContent
    };
  }

  /**
   * Программное изменение состояния скролла
   */
  public setScrollEnabled(enabled: boolean): void {
    this.isScrollBlocked = !enabled;
    this.updateScrollBehavior();
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    if (this.wheelTimeout) {
      clearTimeout(this.wheelTimeout);
    }
    
    // Удаляем обработчики событий
    this.container.removeEventListener('wheel', this.handleWheel.bind(this));
    this.container.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.container.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.container.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.contentContainer.removeEventListener('scroll', this.handleContentScroll.bind(this));
  }
} 