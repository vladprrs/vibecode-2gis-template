import { SearchFilters as ISearchFilters } from '../../types';

/**
 * Фильтр для отображения
 */
export interface FilterItem {
  /** Уникальный идентификатор */
  id: string;
  /** Отображаемый текст */
  label: string;
  /** Активен ли фильтр */
  active: boolean;
  /** Значение фильтра */
  value: any;
  /** Тип фильтра */
  type: 'category' | 'rating' | 'distance' | 'feature' | 'sort';
  /** Иконка (опционально) */
  icon?: string;
  /** Количество результатов (опционально) */
  count?: number;
}

/**
 * Пропсы для SearchFilters
 */
export interface SearchFiltersProps {
  /** Активные фильтры */
  activeFilters: ISearchFilters;
  /** Доступные фильтры для отображения */
  availableFilters: FilterItem[];
  /** Показывать ли счетчик активных фильтров */
  showActiveCount?: boolean;
  /** Показывать ли кнопку очистки всех фильтров */
  showClearAll?: boolean;
  /** CSS класс */
  className?: string;
  /** Обработчики событий */
  onFilterToggle?: (filter: FilterItem) => void;
  onFiltersChange?: (filters: ISearchFilters) => void;
  onClearAll?: () => void;
  onFilterModal?: () => void; // Открыть полный экран фильтров
}

/**
 * Компонент панели фильтров поиска
 * Горизонтальная прокрутка с активными фильтрами
 */
export class SearchFilters {
  private element: HTMLElement;
  private props: SearchFiltersProps;
  private scrollContainer?: HTMLElement;
  private activeCountBadge?: HTMLElement;

  constructor(containerElement: HTMLElement, props: SearchFiltersProps) {
    this.element = containerElement;
    this.props = {
      showActiveCount: true,
      showClearAll: true,
      ...props
    };
    
    this.initialize();
  }

  /**
   * Инициализация компонента
   */
  private initialize(): void {
    this.setupElement();
    this.createFiltersContainer();
    this.renderFilters();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    Object.assign(this.element.style, {
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }
  }

  /**
   * Создание контейнера для фильтров
   */
  private createFiltersContainer(): void {
    this.scrollContainer = document.createElement('div');
    
    Object.assign(this.scrollContainer.style, {
      display: 'flex',
      alignItems: 'center',
      overflowX: 'auto',
      overflowY: 'hidden',
      padding: '12px 16px',
      gap: '8px',
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none' // IE
    });

    // Скрываем скроллбар для WebKit браузеров
    const style = document.createElement('style');
    style.textContent = `
      .search-filters-container::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);

    this.scrollContainer.className = 'search-filters-container';
    this.element.appendChild(this.scrollContainer);
  }

  /**
   * Рендеринг фильтров
   */
  private renderFilters(): void {
    if (!this.scrollContainer) return;

    // Очищаем контейнер
    this.scrollContainer.innerHTML = '';

    // Создаем кнопку "Все фильтры" если есть неактивные фильтры
    this.createAllFiltersButton();

    // Создаем активные фильтры
    const activeFilters = this.props.availableFilters.filter(filter => filter.active);
    activeFilters.forEach(filter => {
      const filterElement = this.createFilterElement(filter, true);
      this.scrollContainer!.appendChild(filterElement);
    });

    // Создаем неактивные фильтры (первые несколько)
    const inactiveFilters = this.props.availableFilters
      .filter(filter => !filter.active)
      .slice(0, 5); // Показываем только первые 5 неактивных

    inactiveFilters.forEach(filter => {
      const filterElement = this.createFilterElement(filter, false);
      this.scrollContainer!.appendChild(filterElement);
    });

    // Создаем кнопку очистки всех фильтров
    if (this.props.showClearAll && activeFilters.length > 0) {
      this.createClearAllButton();
    }
  }

  /**
   * Создание кнопки "Все фильтры"
   */
  private createAllFiltersButton(): void {
    if (!this.scrollContainer) return;

    const activeCount = this.getActiveFiltersCount();
    
    const button = document.createElement('button');
    
    Object.assign(button.style, {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      border: '1px solid #E0E0E0',
      borderRadius: '20px',
      backgroundColor: activeCount > 0 ? '#1976D2' : '#ffffff',
      color: activeCount > 0 ? '#ffffff' : '#333333',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flexShrink: '0',
      transition: 'all 0.2s ease',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    // Создаем содержимое кнопки
    const icon = document.createElement('span');
    icon.style.marginRight = '6px';
    icon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;

    const text = document.createElement('span');
    text.textContent = 'Фильтры';

    button.appendChild(icon);
    button.appendChild(text);

    // Добавляем бейдж с количеством активных фильтров
    if (activeCount > 0) {
      this.activeCountBadge = document.createElement('span');
      Object.assign(this.activeCountBadge.style, {
        marginLeft: '6px',
        padding: '2px 6px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '10px',
        fontSize: '12px',
        fontWeight: '600'
      });
      this.activeCountBadge.textContent = String(activeCount);
      button.appendChild(this.activeCountBadge);
    }

    // Hover эффекты
    button.addEventListener('mouseenter', () => {
      if (activeCount > 0) {
        button.style.backgroundColor = '#1565C0';
      } else {
        button.style.backgroundColor = '#F5F5F5';
      }
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = activeCount > 0 ? '#1976D2' : '#ffffff';
    });

    // Клик
    button.addEventListener('click', () => {
      this.props.onFilterModal?.();
    });

    button.className = 'filter-all-button';
    this.scrollContainer.appendChild(button);
  }

  /**
   * Создание элемента фильтра
   */
  private createFilterElement(filter: FilterItem, isActive: boolean): HTMLElement {
    const element = document.createElement('button');
    
    Object.assign(element.style, {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      border: '1px solid #E0E0E0',
      borderRadius: '20px',
      backgroundColor: isActive ? '#1976D2' : '#ffffff',
      color: isActive ? '#ffffff' : '#333333',
      fontSize: '14px',
      fontWeight: isActive ? '500' : '400',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flexShrink: '0',
      transition: 'all 0.2s ease',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    // Создаем содержимое фильтра
    if (filter.icon) {
      const icon = document.createElement('span');
      icon.style.marginRight = '6px';
      icon.innerHTML = filter.icon;
      element.appendChild(icon);
    }

    const text = document.createElement('span');
    text.textContent = filter.label;
    element.appendChild(text);

    // Добавляем счетчик результатов
    if (filter.count !== undefined && filter.count > 0) {
      const count = document.createElement('span');
      Object.assign(count.style, {
        marginLeft: '6px',
        fontSize: '12px',
        opacity: '0.8'
      });
      count.textContent = `(${filter.count})`;
      element.appendChild(count);
    }

    // Hover эффекты
    element.addEventListener('mouseenter', () => {
      if (isActive) {
        element.style.backgroundColor = '#1565C0';
      } else {
        element.style.backgroundColor = '#F5F5F5';
        element.style.borderColor = '#BDBDBD';
      }
    });

    element.addEventListener('mouseleave', () => {
      element.style.backgroundColor = isActive ? '#1976D2' : '#ffffff';
      element.style.borderColor = '#E0E0E0';
    });

    // Клик
    element.addEventListener('click', () => {
      this.handleFilterToggle(filter);
    });

    element.className = `filter-item filter-${filter.type} ${isActive ? 'active' : 'inactive'}`;
    
    return element;
  }

  /**
   * Создание кнопки очистки всех фильтров
   */
  private createClearAllButton(): void {
    if (!this.scrollContainer) return;

    const button = document.createElement('button');
    
    Object.assign(button.style, {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      border: '1px solid #FF5722',
      borderRadius: '20px',
      backgroundColor: '#ffffff',
      color: '#FF5722',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flexShrink: '0',
      transition: 'all 0.2s ease',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    // Иконка и текст
    const icon = document.createElement('span');
    icon.style.marginRight = '6px';
    icon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4 4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;

    const text = document.createElement('span');
    text.textContent = 'Очистить';

    button.appendChild(icon);
    button.appendChild(text);

    // Hover эффекты
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#FF5722';
      button.style.color = '#ffffff';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#ffffff';
      button.style.color = '#FF5722';
    });

    // Клик
    button.addEventListener('click', () => {
      this.handleClearAll();
    });

    button.className = 'filter-clear-all';
    this.scrollContainer.appendChild(button);
  }

  /**
   * Обработка переключения фильтра
   */
  private handleFilterToggle(filter: FilterItem): void {
    // Обновляем состояние фильтра
    filter.active = !filter.active;
    
    // Создаем новые активные фильтры
    const newFilters = this.buildActiveFilters();
    
    // Уведомляем о изменениях
    this.props.onFilterToggle?.(filter);
    this.props.onFiltersChange?.(newFilters);
    
    // Перерендериваем
    this.renderFilters();
  }

  /**
   * Обработка очистки всех фильтров
   */
  private handleClearAll(): void {
    // Деактивируем все фильтры
    this.props.availableFilters.forEach(filter => {
      filter.active = false;
    });
    
    // Создаем пустые фильтры
    const emptyFilters: ISearchFilters = {};
    
    // Уведомляем о изменениях
    this.props.onClearAll?.();
    this.props.onFiltersChange?.(emptyFilters);
    
    // Перерендериваем
    this.renderFilters();
  }

  /**
   * Построение объекта активных фильтров
   */
  private buildActiveFilters(): ISearchFilters {
    const filters: ISearchFilters = {};
    
    this.props.availableFilters
      .filter(filter => filter.active)
      .forEach(filter => {
        switch (filter.type) {
          case 'category':
            if (!filters.categories) filters.categories = [];
            filters.categories.push(filter.value);
            break;
          case 'rating':
            filters.ratingFrom = filter.value;
            break;
          case 'distance':
            filters.distance = filter.value;
            break;
          case 'feature':
            if (filter.id === 'openNow') filters.openNow = true;
            if (filter.id === 'withReviews') filters.withReviews = true;
            if (filter.id === 'advertisersOnly') filters.advertisersOnly = true;
            break;
          case 'sort':
            filters.sortBy = filter.value;
            break;
        }
      });
    
    return filters;
  }

  /**
   * Получение количества активных фильтров
   */
  private getActiveFiltersCount(): number {
    return this.props.availableFilters.filter(filter => filter.active).length;
  }

  /**
   * Прокрутка к активному фильтру
   */
  public scrollToActiveFilter(): void {
    if (!this.scrollContainer) return;

    const activeFilter = this.scrollContainer.querySelector('.filter-item.active') as HTMLElement;
    if (activeFilter) {
      activeFilter.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }

  /**
   * Обновление доступных фильтров
   */
  public updateFilters(availableFilters: FilterItem[]): void {
    this.props.availableFilters = availableFilters;
    this.renderFilters();
  }

  /**
   * Получение активных фильтров
   */
  public getActiveFilters(): FilterItem[] {
    return this.props.availableFilters.filter(filter => filter.active);
  }

  /**
   * Установка активных фильтров
   */
  public setActiveFilters(activeFilters: ISearchFilters): void {
    // Сбрасываем все фильтры
    this.props.availableFilters.forEach(filter => {
      filter.active = false;
    });

    // Активируем соответствующие фильтры
    this.props.availableFilters.forEach(filter => {
      switch (filter.type) {
        case 'category':
          filter.active = activeFilters.categories?.includes(filter.value) || false;
          break;
        case 'rating':
          filter.active = activeFilters.ratingFrom === filter.value;
          break;
        case 'distance':
          filter.active = activeFilters.distance === filter.value;
          break;
        case 'feature':
          if (filter.id === 'openNow') filter.active = activeFilters.openNow || false;
          if (filter.id === 'withReviews') filter.active = activeFilters.withReviews || false;
          if (filter.id === 'advertisersOnly') filter.active = activeFilters.advertisersOnly || false;
          break;
        case 'sort':
          filter.active = activeFilters.sortBy === filter.value;
          break;
      }
    });

    this.props.activeFilters = activeFilters;
    this.renderFilters();
  }

  /**
   * Проверка наличия активных фильтров
   */
  public hasActiveFilters(): boolean {
    return this.getActiveFiltersCount() > 0;
  }

  /**
   * Обновление пропсов
   */
  public updateProps(newProps: Partial<SearchFiltersProps>): void {
    this.props = { ...this.props, ...newProps };
    this.renderFilters();
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    // DOM элементы будут очищены автоматически
    this.scrollContainer = undefined;
    this.activeCountBadge = undefined;
  }
}

/**
 * Фабрика для создания SearchFilters
 */
export class SearchFiltersFactory {
  /**
   * Создание панели фильтров
   */
  static create(
    containerElement: HTMLElement,
    props: SearchFiltersProps
  ): SearchFilters {
    return new SearchFilters(containerElement, props);
  }

  /**
   * Создание панели с базовыми фильтрами
   */
  static createWithBasicFilters(
    containerElement: HTMLElement,
    activeFilters: ISearchFilters = {}
  ): SearchFilters {
    const basicFilters: FilterItem[] = [
      {
        id: 'openNow',
        label: 'Открыто сейчас',
        active: activeFilters.openNow || false,
        value: true,
        type: 'feature'
      },
      {
        id: 'withReviews',
        label: 'С отзывами',
        active: activeFilters.withReviews || false,
        value: true,
        type: 'feature'
      },
      {
        id: 'rating4',
        label: 'Рейтинг 4+',
        active: activeFilters.ratingFrom === 4,
        value: 4,
        type: 'rating'
      },
      {
        id: 'distance1km',
        label: 'До 1 км',
        active: activeFilters.distance === 1000,
        value: 1000,
        type: 'distance'
      }
    ];

    return new SearchFilters(containerElement, {
      activeFilters,
      availableFilters: basicFilters,
      showActiveCount: true,
      showClearAll: true
    });
  }
} 