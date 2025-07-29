import { 
  BottomsheetState, 
  BottomsheetConfig, 
  BottomsheetStateData,
  BottomsheetEvents,
  BOTTOMSHEET_HEIGHTS 
} from '../../types';
import { BottomsheetManager, BottomsheetScrollManager } from '../../services';

/**
 * Пропсы для BottomsheetContainer
 */
export interface BottomsheetContainerProps {
  /** Конфигурация шторки */
  config: BottomsheetConfig;
  /** Обработчики событий */
  events?: Partial<BottomsheetEvents>;
  /** CSS класс */
  className?: string;
  /** Содержимое шторки */
  children?: HTMLElement[];
  /** Начальная высота экрана */
  screenHeight?: number;
}

/**
 * Основной контейнер шторки
 * Управляет состояниями, анимациями и жестами
 */
export class BottomsheetContainer {
  private element: HTMLElement;
  private manager: BottomsheetManager;
  private scrollManager?: BottomsheetScrollManager;
  private contentContainer?: HTMLElement;
  private props: BottomsheetContainerProps;
  private dragStartY: number = 0;
  private isDragging: boolean = false;
  private resizeObserver?: ResizeObserver;

  constructor(containerElement: HTMLElement, props: BottomsheetContainerProps) {
    this.element = containerElement;
    this.props = props;
    
    // Инициализируем менеджер состояний
    this.manager = new BottomsheetManager(
      props.config,
      props.events || {},
      props.screenHeight || window.innerHeight
    );

    this.initialize();
  }

  /**
   * Инициализация компонента
   */
  private initialize(): void {
    this.setupElement();
    this.setupContentContainer();
    this.setupScrollManager();
    this.setupEventListeners();
    this.setupResizeObserver();
    this.updateDisplay();
  }

  /**
   * Настройка DOM элемента
   */
  private setupElement(): void {
    // Базовые стили для контейнера шторки
    Object.assign(this.element.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: '#ffffff',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
      zIndex: '1000',
      overflow: 'hidden'
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }

    // Устанавливаем начальную высоту
    this.updateHeight();
  }

  /**
   * Настройка контейнера контента
   */
  private setupContentContainer(): void {
    // Создаем основной контейнер контента
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'dashboard-content';
    
    // Стили для контентной области
    Object.assign(this.contentContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignSelf: 'stretch',
      position: 'relative',
      flex: '1',
      minHeight: '0'
    });
    
    this.element.appendChild(this.contentContainer);
  }

  /**
   * Настройка менеджера скролла
   */
  private setupScrollManager(): void {
    if (!this.contentContainer) return;
    
    this.scrollManager = new BottomsheetScrollManager(
      this.element,
      this.contentContainer,
      this.manager
    );
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    // Обработчики touch событий для мобильных устройств
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

    // Обработчики mouse событий для десктопа
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseEnd.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseEnd.bind(this));

    // Предотвращаем скролл страницы при перетаскивании
    this.element.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  /**
   * Настройка ResizeObserver для отслеживания изменений размера экрана
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        const newHeight = window.innerHeight;
        this.manager.updateScreenHeight(newHeight);
        this.updateHeight();
      });
      
      this.resizeObserver.observe(document.body);
    }
  }

  /**
   * Обработка начала касания (touch)
   */
  private handleTouchStart(event: TouchEvent): void {
    if (!this.manager.isDraggable()) return;
    
    const touch = event.touches[0];
    this.startDrag(touch.clientY);
  }

  /**
   * Обработка движения касания (touch)
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    const touch = event.touches[0];
    this.handleDrag(touch.clientY);
  }

  /**
   * Обработка окончания касания (touch)
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    const touch = event.changedTouches[0];
    this.endDrag(touch.clientY);
  }

  /**
   * Обработка начала клика мыши
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.manager.isDraggable()) return;
    
    // Проверяем, что клик произошел по драггеру (первый ребенок)
    const target = event.target as HTMLElement;
    const dragger = this.element.firstElementChild as HTMLElement;
    
    if (dragger && (target === dragger || dragger.contains(target))) {
      this.startDrag(event.clientY);
    }
  }

  /**
   * Обработка движения мыши
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    this.handleDrag(event.clientY);
  }

  /**
   * Обработка окончания клика мыши
   */
  private handleMouseEnd(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    this.endDrag(event.clientY);
  }

  /**
   * Начало перетаскивания
   */
  private startDrag(clientY: number): void {
    this.dragStartY = clientY;
    this.isDragging = true;
    this.manager.startDrag(clientY);
    
    // Отключаем transition во время перетаскивания
    this.element.style.transition = 'none';
  }

  /**
   * Обработка перетаскивания
   */
  private handleDrag(clientY: number): void {
    const deltaY = clientY - this.dragStartY;
    this.manager.handleDrag(deltaY);
    
    // Обновляем позицию шторки в реальном времени
    const currentState = this.manager.getCurrentState();
    const baseHeight = this.manager.getHeightForState(currentState.currentState);
    const newHeight = Math.max(
      this.manager.getHeightForState(BottomsheetState.SMALL),
      Math.min(
        this.manager.getHeightForState(BottomsheetState.FULLSCREEN_SCROLL),
        baseHeight - deltaY
      )
    );
    
    this.element.style.height = `${newHeight}px`;
  }

  /**
   * Окончание перетаскивания
   */
  private endDrag(clientY: number): void {
    const deltaY = clientY - this.dragStartY;
    const velocity = 0; // В реальной реализации нужно вычислить скорость
    
    this.isDragging = false;
    
    // Включаем transition обратно
    this.element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
    
    // Определяем конечное состояние
    const currentHeight = parseInt(this.element.style.height) || this.manager.getHeightForState(this.manager.getCurrentState().currentState);
    
    this.manager.endDrag(velocity, currentHeight).then(() => {
      this.updateDisplay();
    });
  }

  /**
   * Обновление отображения шторки
   */
  private updateDisplay(): void {
    const state = this.manager.getCurrentState();
    this.updateHeight();
    this.updateVisualState(state);
    this.scrollManager?.updateScrollBehavior();
  }

  /**
   * Обновление высоты шторки
   */
  private updateHeight(): void {
    const state = this.manager.getCurrentState();
    const height = state.height;
    
    this.element.style.height = `${height}px`;
    
    // Обновляем transform для анимации
    if (state.isAnimating) {
      this.element.style.transform = 'translateY(0)';
    }
  }

  /**
   * Обновление визуального состояния
   */
  private updateVisualState(state: BottomsheetStateData): void {
    // Добавляем CSS классы для разных состояний
    this.element.classList.remove('bs-small', 'bs-default', 'bs-fullscreen', 'bs-fullscreen-scroll');
    this.element.classList.add(`bs-${state.currentState}`);
    
    // Добавляем класс для состояния перетаскивания
    if (state.isDragging) {
      this.element.classList.add('bs-dragging');
    } else {
      this.element.classList.remove('bs-dragging');
    }

    // Добавляем класс для состояния анимации
    if (state.isAnimating) {
      this.element.classList.add('bs-animating');
    } else {
      this.element.classList.remove('bs-animating');
    }
  }

  /**
   * Программное изменение состояния шторки
   */
  public snapToState(targetState: BottomsheetState): Promise<void> {
    return this.manager.snapToState(targetState).then(() => {
      this.updateDisplay();
    });
  }

  /**
   * Получение текущего состояния
   */
  public getCurrentState(): BottomsheetStateData {
    return this.manager.getCurrentState();
  }

  /**
   * Обновление конфигурации
   */
  public updateConfig(newConfig: Partial<BottomsheetConfig>): void {
    this.manager.updateConfig(newConfig);
    this.updateDisplay();
  }

  /**
   * Получение контейнера контента
   */
  public getContentContainer(): HTMLElement | undefined {
    return this.contentContainer;
  }

  /**
   * Получение состояния скролла
   */
  public getScrollState() {
    return this.scrollManager?.getScrollState();
  }

  /**
   * Программное управление скроллом
   */
  public setScrollEnabled(enabled: boolean): void {
    this.scrollManager?.setScrollEnabled(enabled);
  }

  /**
   * Добавление содержимого в шторку
   */
  public setContent(content: HTMLElement[]): void {
    if (!this.contentContainer) return;
    
    // Очищаем текущее содержимое контейнера
    this.contentContainer.innerHTML = '';
    
    // Добавляем новое содержимое в контейнер контента
    content.forEach(child => {
      this.contentContainer!.appendChild(child);
    });
    
    // Обновляем поведение скролла
    this.scrollManager?.updateScrollBehavior();
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    // Очищаем менеджер скролла
    this.scrollManager?.destroy();
    
    // Удаляем обработчики событий
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseEnd.bind(this));
    this.element.removeEventListener('mouseleave', this.handleMouseEnd.bind(this));

    // Останавливаем ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

/**
 * Фабрика для создания BottomsheetContainer
 */
export class BottomsheetContainerFactory {
  /**
   * Создание контейнера шторки
   */
  static create(
    containerElement: HTMLElement,
    props: BottomsheetContainerProps
  ): BottomsheetContainer {
    return new BottomsheetContainer(containerElement, props);
  }

  /**
   * Создание контейнера с конфигурацией по умолчанию
   */
  static createDefault(containerElement: HTMLElement): BottomsheetContainer {
    const defaultConfig: BottomsheetConfig = {
      state: BottomsheetState.DEFAULT,
      snapPoints: [0.2, 0.5, 0.9, 0.95],
      isDraggable: true,
      hasScrollableContent: false
    };

    return new BottomsheetContainer(containerElement, { config: defaultConfig });
  }
} 