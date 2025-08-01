/**
 * Состояния поисковой строки
 */
export enum SearchBarState {
  /** Неактивная - серый фон, плейсхолдер */
  INACTIVE = 'inactive',
  /** Активная - белый фон, фокус, клавиатура */
  ACTIVE = 'active',
  /** Заполненная - с текстом и кнопкой очистки */
  FILLED = 'filled',
}

/**
 * Варианты правой иконки
 */
export enum SearchBarVariant {
  /** Бургер меню (3 линии) для Dashboard */
  BURGER = 'burger',
  /** Крестик (X) для Suggest и SearchResult */
  CLEAR = 'clear',
}

/**
 * Пропсы для SearchBar
 */
export interface SearchBarProps {
  /** Текущее значение поиска */
  value?: string;
  /** Плейсхолдер */
  placeholder?: string;
  /** Текущее состояние */
  state?: SearchBarState;
  /** Вариант правой иконки */
  variant?: SearchBarVariant;
  /** Показывать ли иконку поиска */
  showSearchIcon?: boolean;
  /** Показывать ли кнопку очистки */
  showClearButton?: boolean;
  /** Включен ли автофокус */
  autoFocus?: boolean;
  /** CSS класс */
  className?: string;
  /** Обработчики событий */
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  /** Обработчик клика по правой иконке */
  onRightIconClick?: () => void;
  /** Дебаунс для onChange в мс */
  debounceMs?: number;
}

/**
 * Компонент поисковой строки
 * Поддерживает различные состояния и взаимодействия
 */
export class SearchBar {
  private element: HTMLElement;
  private props: SearchBarProps;
  private input?: HTMLInputElement;
  private clearButton?: HTMLElement;
  private rightIcon?: HTMLElement;
  private container?: HTMLElement;
  private debounceTimer?: number;

  constructor(containerElement: HTMLElement, props: SearchBarProps = {}) {
    this.element = containerElement;
    this.props = {
      placeholder: 'Поиск в Москве',
      state: SearchBarState.INACTIVE,
      variant: SearchBarVariant.CLEAR,
      showSearchIcon: true,
      showClearButton: true,
      autoFocus: false,
      debounceMs: 300,
      ...props,
    };

    this.initialize();
  }

  /**
   * Инициализация компонента
   */
  private initialize(): void {
    this.setupElement();
    this.createSearchBar();
    this.setupEventListeners();
    this.updateState();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    Object.assign(this.element.style, {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }
  }

  /**
   * Создание поисковой строки
   */
  private createSearchBar(): void {
    // Create outer wrapper that contains both input container and right icon
    const outerWrapper = document.createElement('div');
    Object.assign(outerWrapper.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: '1 0 0',
    });

    // Create input container (the actual search bar part) with unified styles
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      display: 'flex',
      alignItems: 'center',
      flex: '1 0 0',
      height: '40px',
      padding: '10px 8px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      border: '1px solid transparent',
      gap: '4px',
      background: 'rgba(20, 20, 20, 0.09)', // Unified gray background for all screens
    });

    // Создаем содержимое input контейнера
    this.createSearchIcon();
    this.createInput();
    this.createClearButton();

    // Добавляем класс для стилизации
    this.container.className = 'search-bar-container';

    // Add input container to wrapper
    outerWrapper.appendChild(this.container);

    // Create right icon outside the input container
    this.createRightIcon(outerWrapper);

    this.element.appendChild(outerWrapper);
  }

  /**
   * Создание иконки поиска с унифицированными стилями
   */
  private createSearchIcon(): void {
    if (!this.props.showSearchIcon || !this.container) return;

    const icon = document.createElement('div');

    // Apply unified search icon styles
    Object.assign(icon.style, {
      width: '20px',
      height: '20px',
      marginRight: '12px',
      flexShrink: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: '0.6',
      transition: 'opacity 0.2s ease',
    });

    // Use improved search icon SVG (better visual design from legacy Suggest screen)
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/>
        <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    icon.className = 'search-icon';
    this.container.appendChild(icon);
  }

  /**
   * Создание поля ввода
   */
  private createInput(): void {
    if (!this.container) return;

    this.input = document.createElement('input');

    Object.assign(this.input.style, {
      flex: '1',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minWidth: '0', // Для корректного сжатия в flex
    });

    this.input.type = 'text';
    this.input.placeholder = this.props.placeholder || '';
    this.input.value = this.props.value || '';

    // Автофокус если нужен
    if (this.props.autoFocus) {
      setTimeout(() => {
        this.input?.focus();
      }, 100);
    }

    this.container.appendChild(this.input);
  }

  /**
   * Создание кнопки очистки с унифицированными стилями
   */
  private createClearButton(): void {
    if (!this.props.showClearButton || !this.container) return;

    this.clearButton = document.createElement('button');

    // Apply unified clear button styles (best from SearchResult screen)
    Object.assign(this.clearButton.style, {
      width: '24px',
      height: '24px',
      marginLeft: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: '0.6',
      transition: 'opacity 0.2s ease, transform 0.1s ease',
      flexShrink: '0',
    });

    // Use unified clear button SVG (best from SearchResult screen)
    this.clearButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4 4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Unified hover and active effects (polished version from SearchResult)
    this.clearButton.addEventListener('mouseenter', () => {
      this.clearButton!.style.opacity = '1';
      this.clearButton!.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    });

    this.clearButton.addEventListener('mouseleave', () => {
      this.clearButton!.style.opacity = '0.6';
      this.clearButton!.style.backgroundColor = 'transparent';
    });

    this.clearButton.addEventListener('mousedown', () => {
      this.clearButton!.style.transform = 'scale(0.9)';
    });

    this.clearButton.addEventListener('mouseup', () => {
      this.clearButton!.style.transform = 'scale(1)';
    });

    this.clearButton.className = 'search-clear-button';
    this.container.appendChild(this.clearButton);
  }

  /**
   * Создание правой иконки (бургер или крестик в зависимости от варианта)
   */
  private createRightIcon(parentContainer: HTMLElement): void {
    this.rightIcon = document.createElement('div');

    Object.assign(this.rightIcon.style, {
      width: '40px',
      height: '40px',
      flexShrink: '0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      background: 'rgba(20, 20, 20, 0.06)',
      transition: 'all 0.2s ease',
    });

    // Устанавливаем иконку в зависимости от варианта
    if (this.props.variant === SearchBarVariant.BURGER) {
      // Бургер меню иконка для Dashboard
      this.rightIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3h12M2 8h12M2 13h12" stroke="#141414" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `;
    } else {
      // Крестик для Suggest и SearchResult
      this.rightIcon.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1L1 12M1 1l11 11" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }

    // Hover эффекты
    this.rightIcon.addEventListener('mouseenter', () => {
      this.rightIcon!.style.opacity = '0.8';
    });

    this.rightIcon.addEventListener('mouseleave', () => {
      this.rightIcon!.style.opacity = '1';
    });

    this.rightIcon.className = 'search-right-icon';
    parentContainer.appendChild(this.rightIcon);
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    if (!this.input) return;

    // Обработчики для поля ввода
    this.input.addEventListener('focus', () => {
      this.handleFocus();
    });

    this.input.addEventListener('blur', () => {
      this.handleBlur();
    });

    this.input.addEventListener('input', e => {
      const target = e.target as HTMLInputElement;
      this.handleChange(target.value);
    });

    this.input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSubmit();
      }

      if (e.key === 'Escape') {
        this.input?.blur();
      }
    });

    // Обработчик для кнопки очистки
    this.clearButton?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.handleClear();
    });

    // Обработчик для правой иконки
    this.rightIcon?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.handleRightIconClick();
    });
  }

  /**
   * Обработка получения фокуса
   */
  private handleFocus(): void {
    this.updateState(SearchBarState.ACTIVE);
    this.props.onFocus?.();
  }

  /**
   * Обработка потери фокуса
   */
  private handleBlur(): void {
    const hasValue = (this.input?.value.length || 0) > 0;
    this.updateState(hasValue ? SearchBarState.FILLED : SearchBarState.INACTIVE);
    this.props.onBlur?.();
  }

  /**
   * Обработка изменения текста
   */
  private handleChange(value: string): void {
    // Обновляем видимость кнопки очистки
    this.updateClearButtonVisibility(value);

    // Определяем состояние
    const newState = value.length > 0 ? SearchBarState.FILLED : SearchBarState.ACTIVE;
    this.updateVisualState(newState);

    // Дебаунс для onChange
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.props.onChange?.(value);
    }, this.props.debounceMs);
  }

  /**
   * Обработка отправки поиска
   */
  private handleSubmit(): void {
    const value = this.input?.value || '';

    // Убираем фокус с поля
    this.input?.blur();

    this.props.onSubmit?.(value);
  }

  /**
   * Обработка очистки поиска
   */
  private handleClear(): void {
    if (this.input) {
      this.input.value = '';
      this.input.focus();
    }

    this.updateClearButtonVisibility('');
    this.updateVisualState(SearchBarState.ACTIVE);

    // Отменяем debounce и сразу вызываем onChange
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.props.onChange?.('');
    this.props.onClear?.();
  }

  /**
   * Обработка клика по правой иконке
   */
  private handleRightIconClick(): void {
    if (this.props.variant === SearchBarVariant.CLEAR) {
      // Для CLEAR варианта: очищаем поисковый запрос перед навигацией
      if (this.input) {
        this.input.value = '';
      }

      // Отменяем debounce и сразу вызываем onChange с пустой строкой
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.props.onChange?.('');
      this.updateClearButtonVisibility('');
      this.updateVisualState(SearchBarState.INACTIVE);
    }

    // Вызываем callback для навигации (общий для всех вариантов)
    this.props.onRightIconClick?.();
  }

  /**
   * Обновление состояния компонента
   */
  private updateState(newState?: SearchBarState): void {
    if (newState) {
      this.props.state = newState;
    }

    this.updateVisualState(this.props.state!);
    this.updateClearButtonVisibility(this.input?.value || '');
  }

  /**
   * Обновление визуального состояния
   */
  private updateVisualState(state: SearchBarState): void {
    if (!this.container) return;

    // Удаляем все классы состояний
    this.container.classList.remove('search-inactive', 'search-active', 'search-filled');

    switch (state) {
      case SearchBarState.INACTIVE:
        this.container.style.backgroundColor = '#F5F5F5';
        this.container.style.borderColor = 'transparent';
        this.container.classList.add('search-inactive');
        break;

      case SearchBarState.ACTIVE:
        this.container.style.backgroundColor = '#ffffff';
        this.container.style.borderColor = '#1976D2';
        this.container.classList.add('search-active');

        // Делаем иконку поиска более заметной
        const searchIcon = this.container.querySelector('.search-icon') as HTMLElement;
        if (searchIcon) {
          searchIcon.style.opacity = '1';
          searchIcon.style.color = '#1976D2';
        }
        break;

      case SearchBarState.FILLED:
        this.container.style.backgroundColor = '#ffffff';
        this.container.style.borderColor = 'transparent';
        this.container.classList.add('search-filled');

        // Возвращаем нормальную иконку
        const filledIcon = this.container.querySelector('.search-icon') as HTMLElement;
        if (filledIcon) {
          filledIcon.style.opacity = '0.6';
          filledIcon.style.color = 'inherit';
        }
        break;
    }
  }

  /**
   * Обновление видимости кнопки очистки
   */
  private updateClearButtonVisibility(value: string): void {
    if (!this.clearButton) return;

    // Always show clear button for SearchResult screen (FILLED state)
    // For other screens, show only when there's text and not inactive
    if (
      this.props.state === SearchBarState.FILLED ||
      (value.length > 0 && this.props.state !== SearchBarState.INACTIVE)
    ) {
      this.clearButton.style.display = 'flex';
    } else {
      this.clearButton.style.display = 'none';
    }
  }

  /**
   * Программная установка значения
   */
  public setValue(value: string): void {
    if (this.input) {
      this.input.value = value;

      // Определяем новое состояние
      const newState =
        value.length > 0
          ? SearchBarState.FILLED
          : document.activeElement === this.input
            ? SearchBarState.ACTIVE
            : SearchBarState.INACTIVE;

      this.updateState(newState);
    }
  }

  /**
   * Получение текущего значения
   */
  public getValue(): string {
    return this.input?.value || '';
  }

  /**
   * Установка фокуса
   */
  public focus(): void {
    this.input?.focus();
  }

  /**
   * Снятие фокуса
   */
  public blur(): void {
    this.input?.blur();
  }

  /**
   * Очистка поля
   */
  public clear(): void {
    this.handleClear();
  }

  /**
   * Проверка активности
   */
  public isActive(): boolean {
    return this.props.state === SearchBarState.ACTIVE;
  }

  /**
   * Проверка заполненности
   */
  public isFilled(): boolean {
    return (this.input?.value.length || 0) > 0;
  }

  /**
   * Получение текущего варианта
   */
  public getVariant(): SearchBarVariant {
    return this.props.variant || SearchBarVariant.CLEAR;
  }

  /**
   * Обновление пропсов
   */
  public updateProps(newProps: Partial<SearchBarProps>): void {
    this.props = { ...this.props, ...newProps };

    // Обновляем поле ввода если нужно
    if (newProps.value !== undefined) {
      this.setValue(newProps.value);
    }

    if (newProps.placeholder && this.input) {
      this.input.placeholder = newProps.placeholder;
    }

    // Обновляем состояние
    if (newProps.state) {
      this.updateState(newProps.state);
    }
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // DOM элементы будут очищены автоматически
    this.input = undefined;
    this.clearButton = undefined;
    this.rightIcon = undefined;
    this.container = undefined;
  }
}

/**
 * Фабрика для создания SearchBar
 */
export class SearchBarFactory {
  /**
   * Создание поисковой строки
   */
  static create(containerElement: HTMLElement, props: SearchBarProps = {}): SearchBar {
    return new SearchBar(containerElement, props);
  }

  /**
   * Создание поисковой строки для дашборда с бургер иконкой
   */
  static createDashboard(containerElement: HTMLElement, onRightIconClick?: () => void): SearchBar {
    return new SearchBar(containerElement, {
      placeholder: 'Поиск в Москве',
      state: SearchBarState.INACTIVE,
      variant: SearchBarVariant.BURGER,
      showSearchIcon: true,
      showClearButton: false,
      autoFocus: false,
      onRightIconClick,
    });
  }

  /**
   * Создание поисковой строки для экрана подсказок с крестиком
   */
  static createSuggest(containerElement: HTMLElement, onRightIconClick?: () => void): SearchBar {
    return new SearchBar(containerElement, {
      placeholder: 'Введите запрос...',
      state: SearchBarState.ACTIVE,
      variant: SearchBarVariant.CLEAR,
      showSearchIcon: true,
      showClearButton: true,
      autoFocus: true,
      debounceMs: 150,
      onRightIconClick,
    });
  }

  /**
   * Создание поисковой строки для результатов поиска с крестиком
   */
  static createSearchResult(
    containerElement: HTMLElement,
    query: string,
    onRightIconClick?: () => void
  ): SearchBar {
    return new SearchBar(containerElement, {
      placeholder: 'Поиск в Москве',
      state: SearchBarState.FILLED,
      variant: SearchBarVariant.CLEAR,
      value: query,
      showSearchIcon: true,
      showClearButton: true,
      autoFocus: false,
      debounceMs: 500,
      onRightIconClick,
    });
  }

  /**
   * Создание неактивной поисковой строки для дашборда (legacy)
   */
  static createInactive(containerElement: HTMLElement): SearchBar {
    return SearchBarFactory.createDashboard(containerElement);
  }

  /**
   * Создание активной поисковой строки для поиска (legacy)
   */
  static createActive(containerElement: HTMLElement): SearchBar {
    return SearchBarFactory.createSuggest(containerElement);
  }
}
