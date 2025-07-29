import { SearchSuggestion } from '../../types';

/**
 * Пропсы для SearchSuggestions
 */
export interface SearchSuggestionsProps {
  /** Список подсказок */
  suggestions: SearchSuggestion[];
  /** Показывать ли заголовки групп */
  showGroupHeaders?: boolean;
  /** Максимальное количество подсказок для показа */
  maxSuggestions?: number;
  /** CSS класс */
  className?: string;
  /** Обработчики событий */
  onSuggestionClick?: (suggestion: SearchSuggestion, index: number) => void;
  onSuggestionHover?: (suggestion: SearchSuggestion, index: number) => void;
}

/**
 * Группированные подсказки для отображения
 */
interface GroupedSuggestions {
  type: SearchSuggestion['type'];
  title: string;
  suggestions: SearchSuggestion[];
}

/**
 * Компонент списка подсказок поиска
 * Отображает различные типы подсказок с группировкой
 */
export class SearchSuggestions {
  private element: HTMLElement;
  private props: SearchSuggestionsProps;
  private suggestionsContainer?: HTMLElement;

  constructor(containerElement: HTMLElement, props: SearchSuggestionsProps) {
    this.element = containerElement;
    this.props = {
      showGroupHeaders: true,
      maxSuggestions: 10,
      ...props
    };
    
    this.initialize();
  }

  /**
   * Инициализация компонента
   */
  private initialize(): void {
    this.setupElement();
    this.createSuggestionsContainer();
    this.renderSuggestions();
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
   * Создание контейнера для подсказок
   */
  private createSuggestionsContainer(): void {
    this.suggestionsContainer = document.createElement('div');
    
    Object.assign(this.suggestionsContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    });

    this.suggestionsContainer.className = 'suggestions-container';
    this.element.appendChild(this.suggestionsContainer);
  }

  /**
   * Рендеринг подсказок
   */
  private renderSuggestions(): void {
    if (!this.suggestionsContainer) return;

    // Очищаем контейнер
    this.suggestionsContainer.innerHTML = '';

    // Если нет подсказок, показываем пустое состояние
    if (this.props.suggestions.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Группируем подсказки
    const groupedSuggestions = this.groupSuggestions();

    // Рендерим каждую группу
    groupedSuggestions.forEach(group => {
      this.renderGroup(group);
    });
  }

  /**
   * Группировка подсказок по типам
   */
  private groupSuggestions(): GroupedSuggestions[] {
    const groups: Record<string, GroupedSuggestions> = {};
    const typeOrder: SearchSuggestion['type'][] = ['history', 'popular', 'organization', 'address', 'category'];
         const typeTitles: Record<SearchSuggestion['type'], string> = {
       history: 'История поиска',
       popular: 'Популярные запросы',
       organization: 'Организации',
       address: 'Адреса',
       category: 'Категории'
     };

    // Ограничиваем количество подсказок
    const limitedSuggestions = this.props.suggestions.slice(0, this.props.maxSuggestions);

    // Группируем подсказки
    limitedSuggestions.forEach(suggestion => {
      const type = suggestion.type;
      
             if (!groups[type]) {
         groups[type] = {
           type,
           title: typeTitles[type] || String(type),
           suggestions: []
         };
       }
      
      groups[type].suggestions.push(suggestion);
    });

         // Сортируем группы по порядку
     return typeOrder
       .filter(type => groups[type])
       .map(type => groups[type]!);
  }

  /**
   * Рендеринг группы подсказок
   */
  private renderGroup(group: GroupedSuggestions): void {
    if (!this.suggestionsContainer) return;

    // Создаем заголовок группы (если нужен)
    if (this.props.showGroupHeaders && group.suggestions.length > 0) {
      const header = this.createGroupHeader(group.title);
      this.suggestionsContainer.appendChild(header);
    }

    // Создаем подсказки
    group.suggestions.forEach((suggestion, groupIndex) => {
      const globalIndex = this.props.suggestions.indexOf(suggestion);
      const suggestionElement = this.createSuggestionElement(suggestion, globalIndex);
      this.suggestionsContainer.appendChild(suggestionElement);
    });
  }

  /**
   * Создание заголовка группы
   */
  private createGroupHeader(title: string): HTMLElement {
    const header = document.createElement('div');
    
    Object.assign(header.style, {
      padding: '12px 16px 8px 16px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#666666',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    });

    header.textContent = title;
    header.className = 'suggestions-group-header';
    
    return header;
  }

  /**
   * Создание элемента подсказки
   */
  private createSuggestionElement(suggestion: SearchSuggestion, index: number): HTMLElement {
    const element = document.createElement('div');
    
    Object.assign(element.style, {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      borderRadius: '0'
    });

    // Создаем содержимое подсказки
    const icon = this.createSuggestionIcon(suggestion.type);
    const content = this.createSuggestionContent(suggestion);

    element.appendChild(icon);
    element.appendChild(content);

    // Добавляем обработчики событий
    this.setupSuggestionEventListeners(element, suggestion, index);

    element.className = `suggestion-item suggestion-${suggestion.type}`;
    
    return element;
  }

  /**
   * Создание иконки для подсказки
   */
  private createSuggestionIcon(type: SearchSuggestion['type']): HTMLElement {
    const icon = document.createElement('div');
    
    Object.assign(icon.style, {
      width: '20px',
      height: '20px',
      marginRight: '12px',
      flexShrink: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: '0.6'
    });

    // Различные иконки для разных типов
    let iconSvg = '';
    
    switch (type) {
      case 'history':
        iconSvg = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12ZM8 4v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        break;
      case 'popular':
        iconSvg = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 6H10L8 0 6 6H0l5 4-2 6 5-4 5 4-2-6 5-4Z" fill="currentColor"/>
          </svg>
        `;
        break;
      case 'organization':
        iconSvg = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 14h12V8H2v6ZM4 2h8v4H4V2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M6 10h4M6 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        `;
        break;
      case 'address':
        iconSvg = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0C5.2 0 3 2.2 3 5c0 4.2 5 11 5 11s5-6.8 5-11c0-2.8-2.2-5-5-5Z" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="8" cy="5" r="2" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        `;
        break;
      case 'category':
        iconSvg = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2h5v5H2V2ZM9 2h5v5H9V2ZM2 9h5v5H2V9ZM9 9h5v5H9V9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        `;
        break;
      default:
        iconSvg = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 4v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
    }

    icon.innerHTML = iconSvg;
    icon.className = 'suggestion-icon';
    
    return icon;
  }

  /**
   * Создание содержимого подсказки
   */
  private createSuggestionContent(suggestion: SearchSuggestion): HTMLElement {
    const content = document.createElement('div');
    
    Object.assign(content.style, {
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      minWidth: '0'
    });

    // Основной текст
    const mainText = document.createElement('div');
    Object.assign(mainText.style, {
      fontSize: '16px',
      color: '#333333',
      fontWeight: '400',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    });
    mainText.textContent = suggestion.text;
    content.appendChild(mainText);

    // Дополнительный текст (если есть)
    if (suggestion.subtitle) {
      const subtitle = document.createElement('div');
      Object.assign(subtitle.style, {
        fontSize: '14px',
        color: '#666666',
        marginTop: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      });
      subtitle.textContent = suggestion.subtitle;
      content.appendChild(subtitle);
    }

    content.className = 'suggestion-content';
    
    return content;
  }

  /**
   * Настройка обработчиков событий для подсказки
   */
  private setupSuggestionEventListeners(
    element: HTMLElement, 
    suggestion: SearchSuggestion, 
    index: number
  ): void {
    // Hover эффект
    element.addEventListener('mouseenter', () => {
      element.style.backgroundColor = '#F5F5F5';
      this.props.onSuggestionHover?.(suggestion, index);
    });

    element.addEventListener('mouseleave', () => {
      element.style.backgroundColor = 'transparent';
    });

    // Клик
    element.addEventListener('click', () => {
      // Добавляем эффект нажатия
      element.style.backgroundColor = '#E0E0E0';
      
      setTimeout(() => {
        element.style.backgroundColor = '#F5F5F5';
      }, 100);

      this.props.onSuggestionClick?.(suggestion, index);
    });

    // Активное состояние для touch устройств
    element.addEventListener('touchstart', () => {
      element.style.backgroundColor = '#E0E0E0';
    });

    element.addEventListener('touchend', () => {
      setTimeout(() => {
        element.style.backgroundColor = 'transparent';
      }, 150);
    });
  }

  /**
   * Рендеринг пустого состояния
   */
  private renderEmptyState(): void {
    if (!this.suggestionsContainer) return;

    const emptyState = document.createElement('div');
    
    Object.assign(emptyState.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      textAlign: 'center',
      color: '#666666'
    });

    emptyState.innerHTML = `
      <div style="
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.4;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="14" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="m26 26-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div style="
        fontSize: 16px;
        fontWeight: 500;
        marginBottom: 8px;
      ">
        Нет подсказок
      </div>
      <div style="
        fontSize: 14px;
        opacity: 0.8;
      ">
        Начните вводить запрос для поиска
      </div>
    `;

    emptyState.className = 'suggestions-empty-state';
    this.suggestionsContainer.appendChild(emptyState);
  }

  /**
   * Обновление списка подсказок
   */
  public updateSuggestions(suggestions: SearchSuggestion[]): void {
    this.props.suggestions = suggestions;
    this.renderSuggestions();
  }

  /**
   * Получение текущих подсказок
   */
  public getSuggestions(): SearchSuggestion[] {
    return this.props.suggestions;
  }

  /**
   * Очистка подсказок
   */
  public clear(): void {
    this.updateSuggestions([]);
  }

  /**
   * Проверка на пустоту
   */
  public isEmpty(): boolean {
    return this.props.suggestions.length === 0;
  }

  /**
   * Получение подсказки по индексу
   */
  public getSuggestionByIndex(index: number): SearchSuggestion | undefined {
    return this.props.suggestions[index];
  }

  /**
   * Обновление пропсов
   */
  public updateProps(newProps: Partial<SearchSuggestionsProps>): void {
    const shouldRerender = 
      newProps.suggestions !== undefined ||
      newProps.showGroupHeaders !== this.props.showGroupHeaders ||
      newProps.maxSuggestions !== this.props.maxSuggestions;

    this.props = { ...this.props, ...newProps };

    if (shouldRerender) {
      this.renderSuggestions();
    }
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    // DOM элементы будут очищены автоматически
    this.suggestionsContainer = undefined;
  }
}

/**
 * Фабрика для создания SearchSuggestions
 */
export class SearchSuggestionsFactory {
  /**
   * Создание компонента подсказок
   */
  static create(
    containerElement: HTMLElement,
    props: SearchSuggestionsProps
  ): SearchSuggestions {
    return new SearchSuggestions(containerElement, props);
  }

  /**
   * Создание компонента с настройками по умолчанию
   */
  static createDefault(
    containerElement: HTMLElement,
    suggestions: SearchSuggestion[] = []
  ): SearchSuggestions {
    return new SearchSuggestions(containerElement, {
      suggestions,
      showGroupHeaders: true,
      maxSuggestions: 10
    });
  }

  /**
   * Создание компонента без группировки
   */
  static createSimple(
    containerElement: HTMLElement,
    suggestions: SearchSuggestion[] = []
  ): SearchSuggestions {
    return new SearchSuggestions(containerElement, {
      suggestions,
      showGroupHeaders: false,
      maxSuggestions: 8
    });
  }
} 