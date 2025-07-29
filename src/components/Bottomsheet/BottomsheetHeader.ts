/**
 * Пропсы для BottomsheetHeader
 */
export interface BottomsheetHeaderProps {
  /** Текст в поисковой строке */
  searchQuery?: string;
  /** Плейсхолдер для поисковой строки */
  placeholder?: string;
  /** Показывать ли драггер */
  showDragger?: boolean;
  /** Активна ли поисковая строка */
  isSearchActive?: boolean;
  /** CSS класс */
  className?: string;
  /** Обработчики событий */
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  onClearSearch?: () => void;
}

/**
 * Компонент заголовка шторки
 * Содержит драггер и поисковую строку
 */
export class BottomsheetHeader {
  private element: HTMLElement;
  private props: BottomsheetHeaderProps;
  private searchInput?: HTMLInputElement;
  private clearButton?: HTMLElement;

  constructor(containerElement: HTMLElement, props: BottomsheetHeaderProps = {}) {
    this.element = containerElement;
    this.props = props;

    this.initialize();
  }

  /**
   * Инициализация компонента
   */
  private initialize(): void {
    this.setupElement();
    this.createContent();
    this.setupEventListeners();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    // Базовые стили для заголовка
    Object.assign(this.element.style, {
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      backgroundColor: '#ffffff',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      flexShrink: '0',
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }
  }

  /**
   * Создание содержимого заголовка
   */
  private createContent(): void {
    this.element.innerHTML = '';

    // Создаем драггер (если нужен)
    if (this.props.showDragger !== false) {
      this.createDragger();
    }

    // Создаем поисковую строку
    this.createSearchBar();
  }

  /**
   * Создание драггера для перетаскивания
   */
  private createDragger(): void {
    const dragger = document.createElement('div');

    Object.assign(dragger.style, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '24px',
      padding: '8px 0',
      cursor: 'grab',
    });

    // Создаем визуальную полоску драггера
    const handle = document.createElement('div');
    Object.assign(handle.style, {
      width: '36px',
      height: '4px',
      backgroundColor: '#E0E0E0',
      borderRadius: '2px',
      transition: 'background-color 0.2s ease',
    });

    dragger.appendChild(handle);

    // Обработчики для изменения цвета при hover
    dragger.addEventListener('mouseenter', () => {
      handle.style.backgroundColor = '#BDBDBD';
    });

    dragger.addEventListener('mouseleave', () => {
      handle.style.backgroundColor = '#E0E0E0';
    });

    // Добавляем класс для идентификации
    dragger.className = 'bottomsheet-dragger';

    this.element.appendChild(dragger);
  }

  /**
   * Создание поисковой строки
   */
  private createSearchBar(): void {
    const searchContainer = document.createElement('div');

    Object.assign(searchContainer.style, {
      display: 'flex',
      alignItems: 'center',
      margin: '0 16px 16px 16px',
      padding: '12px 16px',
      backgroundColor: '#F5F5F5',
      borderRadius: '12px',
      border: '1px solid transparent',
      transition: 'border-color 0.2s ease, background-color 0.2s ease',
    });

    // Иконка поиска
    const searchIcon = this.createSearchIcon();
    searchContainer.appendChild(searchIcon);

    // Поле ввода
    this.searchInput = this.createSearchInput();
    searchContainer.appendChild(this.searchInput);

    // Кнопка очистки (скрыта по умолчанию)
    this.clearButton = this.createClearButton();
    searchContainer.appendChild(this.clearButton);

    // Добавляем класс для стилизации
    searchContainer.className = 'search-container';

    this.element.appendChild(searchContainer);

    // Обновляем состояние
    this.updateSearchState();
  }

  /**
   * Создание иконки поиска
   */
  private createSearchIcon(): HTMLElement {
    const icon = document.createElement('div');

    Object.assign(icon.style, {
      width: '20px',
      height: '20px',
      marginRight: '12px',
      flexShrink: '0',
      opacity: '0.6',
    });

    // SVG иконка поиска
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16ZM19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    return icon;
  }

  /**
   * Создание поля ввода
   */
  private createSearchInput(): HTMLInputElement {
    const input = document.createElement('input');

    Object.assign(input.style, {
      flex: '1',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    });

    input.type = 'text';
    input.placeholder = this.props.placeholder || 'Поиск в Москве';
    input.value = this.props.searchQuery || '';

    return input;
  }

  /**
   * Создание кнопки очистки
   */
  private createClearButton(): HTMLElement {
    const button = document.createElement('button');

    Object.assign(button.style, {
      width: '20px',
      height: '20px',
      marginLeft: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: '0.6',
      transition: 'opacity 0.2s ease',
    });

    // SVG иконка крестика
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4 4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Hover эффект
    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
    });

    button.addEventListener('mouseleave', () => {
      button.style.opacity = '0.6';
    });

    return button;
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    if (!this.searchInput || !this.clearButton) return;

    // Обработчики для поля ввода
    this.searchInput.addEventListener('focus', () => {
      this.handleSearchFocus();
    });

    this.searchInput.addEventListener('blur', () => {
      this.handleSearchBlur();
    });

    this.searchInput.addEventListener('input', e => {
      const target = e.target as HTMLInputElement;
      this.handleSearchChange(target.value);
    });

    this.searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSearchSubmit();
      }
    });

    // Обработчик для кнопки очистки
    this.clearButton.addEventListener('click', () => {
      this.handleClearSearch();
    });
  }

  /**
   * Обработка фокуса на поисковой строке
   */
  private handleSearchFocus(): void {
    const searchContainer = this.element.querySelector('.search-container') as HTMLElement;
    if (searchContainer) {
      searchContainer.style.borderColor = '#1976D2';
      searchContainer.style.backgroundColor = '#ffffff';
    }

    this.props.onSearchFocus?.();
  }

  /**
   * Обработка потери фокуса
   */
  private handleSearchBlur(): void {
    const searchContainer = this.element.querySelector('.search-container') as HTMLElement;
    if (searchContainer) {
      searchContainer.style.borderColor = 'transparent';
      if (!this.props.isSearchActive) {
        searchContainer.style.backgroundColor = '#F5F5F5';
      }
    }

    this.props.onSearchBlur?.();
  }

  /**
   * Обработка изменения текста
   */
  private handleSearchChange(value: string): void {
    this.updateClearButtonVisibility(value);
    this.props.onSearchChange?.(value);
  }

  /**
   * Обработка отправки поиска
   */
  private handleSearchSubmit(): void {
    const value = this.searchInput?.value || '';
    this.props.onSearchSubmit?.(value);
  }

  /**
   * Обработка очистки поиска
   */
  private handleClearSearch(): void {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.searchInput.focus();
      this.updateClearButtonVisibility('');
    }

    this.props.onClearSearch?.();
  }

  /**
   * Обновление видимости кнопки очистки
   */
  private updateClearButtonVisibility(value: string): void {
    if (!this.clearButton) return;

    if (value.length > 0) {
      this.clearButton.style.display = 'flex';
    } else {
      this.clearButton.style.display = 'none';
    }
  }

  /**
   * Обновление состояния поиска
   */
  private updateSearchState(): void {
    const searchContainer = this.element.querySelector('.search-container') as HTMLElement;
    if (!searchContainer) return;

    if (this.props.isSearchActive) {
      searchContainer.style.backgroundColor = '#ffffff';
      searchContainer.style.borderColor = '#1976D2';
    } else {
      searchContainer.style.backgroundColor = '#F5F5F5';
      searchContainer.style.borderColor = 'transparent';
    }

    // Обновляем видимость кнопки очистки
    const currentValue = this.searchInput?.value || '';
    this.updateClearButtonVisibility(currentValue);
  }

  /**
   * Программная установка значения поиска
   */
  public setSearchQuery(query: string): void {
    if (this.searchInput) {
      this.searchInput.value = query;
      this.updateClearButtonVisibility(query);
    }
  }

  /**
   * Получение текущего значения поиска
   */
  public getSearchQuery(): string {
    return this.searchInput?.value || '';
  }

  /**
   * Установка фокуса на поисковую строку
   */
  public focusSearch(): void {
    this.searchInput?.focus();
  }

  /**
   * Снятие фокуса с поисковой строки
   */
  public blurSearch(): void {
    this.searchInput?.blur();
  }

  /**
   * Обновление пропсов
   */
  public updateProps(newProps: Partial<BottomsheetHeaderProps>): void {
    this.props = { ...this.props, ...newProps };

    // Обновляем поисковую строку если нужно
    if (newProps.searchQuery !== undefined) {
      this.setSearchQuery(newProps.searchQuery);
    }

    if (newProps.placeholder && this.searchInput) {
      this.searchInput.placeholder = newProps.placeholder;
    }

    // Обновляем состояние
    this.updateSearchState();
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    // DOM элементы будут очищены автоматически при удалении родительского элемента
    this.searchInput = undefined;
    this.clearButton = undefined;
  }
}

/**
 * Фабрика для создания BottomsheetHeader
 */
export class BottomsheetHeaderFactory {
  /**
   * Создание заголовка шторки
   */
  static create(
    containerElement: HTMLElement,
    props: BottomsheetHeaderProps = {}
  ): BottomsheetHeader {
    return new BottomsheetHeader(containerElement, props);
  }

  /**
   * Создание заголовка с настройками по умолчанию
   */
  static createDefault(containerElement: HTMLElement): BottomsheetHeader {
    return new BottomsheetHeader(containerElement, {
      placeholder: 'Поиск в Москве',
      showDragger: true,
      isSearchActive: false,
    });
  }
}
