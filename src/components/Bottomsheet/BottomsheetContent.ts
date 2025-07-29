/**
 * Пропсы для BottomsheetContent
 */
export interface BottomsheetContentProps {
  /** Включить прокрутку */
  scrollable?: boolean;
  /** Тип прокрутки */
  scrollType?: 'vertical' | 'horizontal' | 'both';
  /** Отступы внутри контента */
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  /** CSS класс */
  className?: string;
  /** Показывать ли индикатор прокрутки */
  showScrollIndicator?: boolean;
  /** Обработчики событий прокрутки */
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  onScrollEnd?: () => void;
  onScrollStart?: () => void;
}

/**
 * Компонент контентной области шторки
 * Обеспечивает прокрутку и правильное отображение содержимого
 */
export class BottomsheetContent {
  private element: HTMLElement;
  private props: BottomsheetContentProps;
  private scrollContainer?: HTMLElement;
  private isScrolling: boolean = false;
  private scrollTimer?: number;

  constructor(containerElement: HTMLElement, props: BottomsheetContentProps = {}) {
    this.element = containerElement;
    this.props = {
      scrollable: true,
      scrollType: 'vertical',
      showScrollIndicator: true,
      ...props,
    };

    this.initialize();
  }

  /**
   * Инициализация компонента
   */
  private initialize(): void {
    this.setupElement();
    this.createScrollContainer();
    this.setupEventListeners();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    // Базовые стили для контентной области
    Object.assign(this.element.style, {
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      minHeight: '0',
      overflow: 'hidden',
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }
  }

  /**
   * Создание контейнера прокрутки
   */
  private createScrollContainer(): void {
    this.scrollContainer = document.createElement('div');

    const scrollStyle: Partial<CSSStyleDeclaration> = {
      flex: '1',
      minHeight: '0',
    };

    // Настройка прокрутки
    if (this.props.scrollable) {
      switch (this.props.scrollType) {
        case 'vertical':
          scrollStyle.overflowY = 'auto';
          scrollStyle.overflowX = 'hidden';
          break;
        case 'horizontal':
          scrollStyle.overflowX = 'auto';
          scrollStyle.overflowY = 'hidden';
          break;
        case 'both':
          scrollStyle.overflow = 'auto';
          break;
      }
    } else {
      scrollStyle.overflow = 'hidden';
    }

    // Настройка отступов
    if (this.props.padding) {
      const p = this.props.padding;
      scrollStyle.padding = `${p.top || 0}px ${p.right || 16}px ${p.bottom || 16}px ${p.left || 16}px`;
    } else {
      scrollStyle.padding = '0 16px 16px 16px';
    }

    // Настройка индикатора прокрутки
    if (!this.props.showScrollIndicator) {
      scrollStyle.scrollbarWidth = 'none'; // Firefox
      // WebKit браузеры
      (scrollStyle as any)['-webkit-scrollbar'] = 'none';
    } else {
      // Кастомный скроллбар для WebKit
      this.addCustomScrollbarStyles();
    }

    Object.assign(this.scrollContainer.style, scrollStyle);

    // Добавляем класс для идентификации
    this.scrollContainer.className = 'bottomsheet-scroll-container';

    this.element.appendChild(this.scrollContainer);
  }

  /**
   * Добавление кастомных стилей для скроллбара
   */
  private addCustomScrollbarStyles(): void {
    // Создаем стили для кастомного скроллбара
    const styleId = 'bottomsheet-scrollbar-styles';

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .bottomsheet-scroll-container::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        .bottomsheet-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .bottomsheet-scroll-container::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 2px;
        }
        
        .bottomsheet-scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
        
        .bottomsheet-scroll-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
      `;

      document.head.appendChild(style);
    }
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    if (!this.scrollContainer) return;

    // Обработчик прокрутки
    this.scrollContainer.addEventListener('scroll', this.handleScroll.bind(this));

    // Обработчики для определения начала и конца прокрутки
    this.scrollContainer.addEventListener('touchstart', this.handleScrollStart.bind(this));
    this.scrollContainer.addEventListener('touchend', this.handlePotentialScrollEnd.bind(this));

    // Для поддержки mouse events
    this.scrollContainer.addEventListener('mousedown', this.handleScrollStart.bind(this));
    this.scrollContainer.addEventListener('mouseup', this.handlePotentialScrollEnd.bind(this));
  }

  /**
   * Обработка события прокрутки
   */
  private handleScroll(): void {
    if (!this.scrollContainer) return;

    const scrollTop = this.scrollContainer.scrollTop;
    const scrollLeft = this.scrollContainer.scrollLeft;

    // Вызываем callback
    this.props.onScroll?.(scrollTop, scrollLeft);

    // Определяем завершение прокрутки
    this.handleScrollEnd();
  }

  /**
   * Обработка начала прокрутки
   */
  private handleScrollStart(): void {
    if (!this.isScrolling) {
      this.isScrolling = true;
      this.props.onScrollStart?.();
    }
  }

  /**
   * Обработка потенциального завершения прокрутки
   */
  private handlePotentialScrollEnd(): void {
    // Используем таймер для определения завершения прокрутки
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }

    this.scrollTimer = window.setTimeout(() => {
      if (this.isScrolling) {
        this.isScrolling = false;
        this.props.onScrollEnd?.();
      }
    }, 150);
  }

  /**
   * Внутренний обработчик завершения прокрутки
   */
  private handleScrollEnd(): void {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }

    this.scrollTimer = window.setTimeout(() => {
      if (this.isScrolling) {
        this.isScrolling = false;
        this.props.onScrollEnd?.();
      }
    }, 150);
  }

  /**
   * Добавление содержимого в контейнер
   */
  public setContent(content: HTMLElement | HTMLElement[] | string): void {
    if (!this.scrollContainer) return;

    // Очищаем текущее содержимое
    this.scrollContainer.innerHTML = '';

    if (typeof content === 'string') {
      this.scrollContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.scrollContainer.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach(element => {
        this.scrollContainer!.appendChild(element);
      });
    }
  }

  /**
   * Добавление содержимого к существующему
   */
  public appendContent(content: HTMLElement | HTMLElement[] | string): void {
    if (!this.scrollContainer) return;

    if (typeof content === 'string') {
      this.scrollContainer.insertAdjacentHTML('beforeend', content);
    } else if (content instanceof HTMLElement) {
      this.scrollContainer.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach(element => {
        this.scrollContainer!.appendChild(element);
      });
    }
  }

  /**
   * Прокрутка к определенной позиции
   */
  public scrollTo(top: number, left: number = 0, smooth: boolean = true): void {
    if (!this.scrollContainer) return;

    this.scrollContainer.scrollTo({
      top,
      left,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }

  /**
   * Прокрутка к верху
   */
  public scrollToTop(smooth: boolean = true): void {
    this.scrollTo(0, 0, smooth);
  }

  /**
   * Прокрутка к низу
   */
  public scrollToBottom(smooth: boolean = true): void {
    if (!this.scrollContainer) return;

    const scrollHeight = this.scrollContainer.scrollHeight;
    const clientHeight = this.scrollContainer.clientHeight;
    const maxScrollTop = scrollHeight - clientHeight;

    this.scrollTo(maxScrollTop, 0, smooth);
  }

  /**
   * Прокрутка к конкретному элементу
   */
  public scrollToElement(element: HTMLElement, smooth: boolean = true): void {
    if (!this.scrollContainer) return;

    const containerRect = this.scrollContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const relativeTop = elementRect.top - containerRect.top + this.scrollContainer.scrollTop;

    this.scrollTo(relativeTop, 0, smooth);
  }

  /**
   * Получение текущей позиции прокрутки
   */
  public getScrollPosition(): { top: number; left: number } {
    if (!this.scrollContainer) {
      return { top: 0, left: 0 };
    }

    return {
      top: this.scrollContainer.scrollTop,
      left: this.scrollContainer.scrollLeft,
    };
  }

  /**
   * Получение размеров контейнера прокрутки
   */
  public getScrollDimensions(): {
    scrollHeight: number;
    scrollWidth: number;
    clientHeight: number;
    clientWidth: number;
  } {
    if (!this.scrollContainer) {
      return { scrollHeight: 0, scrollWidth: 0, clientHeight: 0, clientWidth: 0 };
    }

    return {
      scrollHeight: this.scrollContainer.scrollHeight,
      scrollWidth: this.scrollContainer.scrollWidth,
      clientHeight: this.scrollContainer.clientHeight,
      clientWidth: this.scrollContainer.clientWidth,
    };
  }

  /**
   * Проверка, находится ли элемент в видимой области
   */
  public isElementVisible(element: HTMLElement): boolean {
    if (!this.scrollContainer) return false;

    const containerRect = this.scrollContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    return (
      elementRect.top >= containerRect.top &&
      elementRect.bottom <= containerRect.bottom &&
      elementRect.left >= containerRect.left &&
      elementRect.right <= containerRect.right
    );
  }

  /**
   * Обновление настроек прокрутки
   */
  public updateScrollSettings(newProps: Partial<BottomsheetContentProps>): void {
    this.props = { ...this.props, ...newProps };

    if (this.scrollContainer) {
      // Обновляем стили прокрутки
      if (newProps.scrollable !== undefined || newProps.scrollType !== undefined) {
        const scrollType = this.props.scrollType;

        if (this.props.scrollable) {
          switch (scrollType) {
            case 'vertical':
              this.scrollContainer.style.overflowY = 'auto';
              this.scrollContainer.style.overflowX = 'hidden';
              break;
            case 'horizontal':
              this.scrollContainer.style.overflowX = 'auto';
              this.scrollContainer.style.overflowY = 'hidden';
              break;
            case 'both':
              this.scrollContainer.style.overflow = 'auto';
              break;
          }
        } else {
          this.scrollContainer.style.overflow = 'hidden';
        }
      }

      // Обновляем отступы
      if (newProps.padding !== undefined) {
        const p = this.props.padding;
        if (p) {
          this.scrollContainer.style.padding = `${p.top || 0}px ${p.right || 16}px ${p.bottom || 16}px ${p.left || 16}px`;
        }
      }
    }
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }

    // Удаляем обработчики событий
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.handleScroll.bind(this));
      this.scrollContainer.removeEventListener('touchstart', this.handleScrollStart.bind(this));
      this.scrollContainer.removeEventListener(
        'touchend',
        this.handlePotentialScrollEnd.bind(this)
      );
      this.scrollContainer.removeEventListener('mousedown', this.handleScrollStart.bind(this));
      this.scrollContainer.removeEventListener('mouseup', this.handlePotentialScrollEnd.bind(this));
    }

    this.scrollContainer = undefined;
  }
}

/**
 * Фабрика для создания BottomsheetContent
 */
export class BottomsheetContentFactory {
  /**
   * Создание контентной области
   */
  static create(
    containerElement: HTMLElement,
    props: BottomsheetContentProps = {}
  ): BottomsheetContent {
    return new BottomsheetContent(containerElement, props);
  }

  /**
   * Создание контентной области с настройками по умолчанию
   */
  static createDefault(containerElement: HTMLElement): BottomsheetContent {
    return new BottomsheetContent(containerElement, {
      scrollable: true,
      scrollType: 'vertical',
      showScrollIndicator: true,
      padding: {
        top: 0,
        right: 16,
        bottom: 16,
        left: 16,
      },
    });
  }

  /**
   * Создание горизонтально прокручиваемой области
   */
  static createHorizontalScroll(containerElement: HTMLElement): BottomsheetContent {
    return new BottomsheetContent(containerElement, {
      scrollable: true,
      scrollType: 'horizontal',
      showScrollIndicator: false,
      padding: {
        top: 0,
        right: 16,
        bottom: 0,
        left: 16,
      },
    });
  }
}
