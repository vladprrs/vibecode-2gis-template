/**
 * DOM element creation utilities
 * Consolidates element creation patterns from multiple components
 */

/**
 * Configuration for creating suggestion items
 */
export interface SuggestionConfig {
  id: string;
  text: string;
  type: 'history' | 'popular' | 'organization' | 'address' | 'category' | 'home' | 'search' | 'branch';
  subtitle?: string[];
  hasSubtitle?: boolean;
  icon?: string;
  onClick?: (id: string) => void;
}

/**
 * Configuration for creating filter buttons
 */
export interface FilterConfig {
  text: string;
  hasCounter?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * Factory class for creating common DOM elements
 */
export class ElementFactory {
  /**
   * Create a suggestion item element for search screens
   */
  static createSuggestion(config: SuggestionConfig): HTMLElement {
    const suggestionItem = document.createElement('div');
    suggestionItem.className = 'suggestion-item';
    suggestionItem.style.cssText = `
      display: flex;
      padding: 16px;
      align-items: center;
      align-self: stretch;
      cursor: pointer;
      transition: background-color 0.2s ease;
      border-bottom: 0.5px solid rgba(137, 137, 137, 0.20);
    `;

    // Icon container
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      display: flex;
      width: 40px;
      height: 40px;
      justify-content: center;
      align-items: center;
      margin-right: 16px;
      border-radius: 8px;
      background: rgba(20, 20, 20, 0.06);
    `;

    const iconElement = document.createElement('div');
    iconElement.style.cssText = `
      font-size: 18px;
    `;
    iconElement.textContent = this.getIconForType(config.type);
    iconContainer.appendChild(iconElement);

    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    `;

    // Main text
    const mainText = document.createElement('div');
    mainText.textContent = config.text;
    mainText.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 15px;
      line-height: 20px;
      letter-spacing: -0.3px;
    `;

    contentContainer.appendChild(mainText);

    // Subtitle if present
    if (config.hasSubtitle && config.subtitle && config.subtitle.length > 0) {
      const subtitleContainer = document.createElement('div');
      subtitleContainer.style.cssText = `
        display: flex;
        gap: 8px;
        align-items: center;
      `;

      config.subtitle.forEach((text, index) => {
        const subtitleItem = document.createElement('span');
        subtitleItem.textContent = text;
        subtitleItem.style.cssText = `
          color: #898989;
          font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 16px;
          letter-spacing: -0.234px;
        `;

        subtitleContainer.appendChild(subtitleItem);

        // Add separator dot if not last item
        if (config.subtitle && index < config.subtitle.length - 1) {
          const separator = document.createElement('span');
          separator.textContent = '•';
          separator.style.cssText = `
            color: #898989;
            font-size: 12px;
          `;
          subtitleContainer.appendChild(separator);
        }
      });

      contentContainer.appendChild(subtitleContainer);
    }

    // Assembly
    suggestionItem.appendChild(iconContainer);
    suggestionItem.appendChild(contentContainer);

    // Event handling
    if (config.onClick) {
      suggestionItem.addEventListener('click', () => config.onClick!(config.id));
    }

    // Hover effects
    suggestionItem.addEventListener('mouseenter', () => {
      suggestionItem.style.backgroundColor = 'rgba(20, 20, 20, 0.04)';
    });

    suggestionItem.addEventListener('mouseleave', () => {
      suggestionItem.style.backgroundColor = 'transparent';
    });

    return suggestionItem;
  }

  /**
   * Create a filter button element
   */
  static createFilterButton(config: FilterConfig): HTMLElement {
    const button = document.createElement('button');
    button.style.cssText = `
      display: flex;
      height: 40px;
      padding: 8px 12px;
      justify-content: center;
      align-items: center;
      gap: 4px;
      border-radius: 8px;
      background: ${config.isActive ? '#1BA136' : 'rgba(20, 20, 20, 0.06)'};
      color: ${config.isActive ? '#FFF' : '#141414'};
      border: none;
      cursor: pointer;
      flex-shrink: 0;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 500;
      font-size: 15px;
      line-height: 20px;
      letter-spacing: -0.3px;
      transition: all 0.2s ease;
    `;

    if (config.hasCounter) {
      // Counter badge
      const counter = document.createElement('div');
      counter.style.cssText = `
        display: flex;
        width: 16px;
        height: 16px;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        background: #1BA136;
        color: #FFF;
        font-weight: 500;
        font-size: 13px;
        line-height: 16px;
        letter-spacing: -0.234px;
      `;
      counter.textContent = config.text;
      button.appendChild(counter);
    } else {
      button.textContent = config.text;
    }

    // Event handling
    if (config.onClick) {
      button.addEventListener('click', config.onClick);
    }

    return button;
  }

  /**
   * Create a drag handle element
   */
  static createDragHandle(): HTMLElement {
    const dragArea = document.createElement('div');
    dragArea.className = 'drag-handle-area';
    dragArea.style.cssText = `
      display: flex;
      height: 20px;
      padding: 16px 0 6px 0;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      align-self: stretch;
      position: relative;
      flex-shrink: 0;
    `;

    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.style.cssText = `
      width: 40px;
      height: 4px;
      flex-shrink: 0;
      border-radius: 6px;
      background: rgba(137, 137, 137, 0.25);
      cursor: grab;
    `;

    dragArea.appendChild(dragHandle);
    return dragArea;
  }

  /**
   * Create a close button element
   */
  static createCloseButton(onClose?: () => void): HTMLElement {
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
      display: flex;
      padding: 8px;
      justify-content: center;
      align-items: center;
      background: rgba(20, 20, 20, 0.06);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      width: 40px;
      height: 40px;
    `;

    closeButton.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    if (onClose) {
      closeButton.addEventListener('click', onClose);
    }

    return closeButton;
  }

  /**
   * Create a search input field
   */
  static createSearchInput(
    placeholder: string = 'Поиск',
    value: string = '',
    onInput?: (value: string) => void,
    onEnter?: (value: string) => void
  ): HTMLElement {
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      display: flex;
      height: 40px;
      padding: 10px 8px;
      align-items: center;
      align-self: stretch;
      border-radius: 8px;
      background: rgba(20, 20, 20, 0.09);
      position: relative;
      gap: 4px;
      flex: 1;
    `;

    // Search icon
    const searchIcon = document.createElement('div');
    searchIcon.innerHTML = `
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#898989" stroke-width="1.5"/>
        <path d="m21 21-4.35-4.35" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    searchIcon.style.cssText = `
      width: 19px;
      height: 19px;
      flex-shrink: 0;
    `;

    // Input element
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.value = value;
    input.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 15px;
      font-style: normal;
      line-height: 20px;
      letter-spacing: -0.3px;
      border: none;
      outline: none;
      background: transparent;
      padding: 0;
      margin: 0;
      flex: 1;
      min-width: 0;
    `;

    // Event handlers
    if (onInput) {
      input.addEventListener('input', (e) => {
        onInput((e.target as HTMLInputElement).value);
      });
    }

    if (onEnter) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onEnter((e.target as HTMLInputElement).value);
        }
      });
    }

    inputContainer.appendChild(searchIcon);
    inputContainer.appendChild(input);

    return inputContainer;
  }

  /**
   * Create a loading spinner element
   */
  static createLoadingSpinner(size: 'small' | 'medium' | 'large' = 'medium'): HTMLElement {
    const sizeMap = {
      small: '16px',
      medium: '24px',
      large: '32px',
    };

    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: ${sizeMap[size]};
      height: ${sizeMap[size]};
      border: 2px solid rgba(137, 137, 137, 0.3);
      border-top: 2px solid #1BA136;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return spinner;
  }

  /**
   * Get icon emoji for suggestion type
   */
  private static getIconForType(type: string): string {
    const iconMap: Record<string, string> = {
      home: '🏠',
      search: '🔍',
      branch: '🏢',
      history: '🕐',
      popular: '⭐',
      organization: '🏪',
      address: '📍',
      category: '📂',
    };

    return iconMap[type] || '📍';
  }

  /**
   * Create a tab bar element
   */
  static createTabBar(
    tabs: Array<{ id: string; text: string; isActive?: boolean }>,
    onTabClick?: (tabId: string) => void
  ): HTMLElement {
    const tabBar = document.createElement('div');
    tabBar.style.cssText = `
      display: flex;
      align-items: flex-start;
      align-self: stretch;
      background: #FFF;
      border-bottom: 1px solid rgba(137, 137, 137, 0.2);
      position: relative;
    `;

    tabs.forEach((tab) => {
      const tabButton = document.createElement('button');
      tabButton.textContent = tab.text;
      tabButton.style.cssText = `
        flex: 1;
        padding: 16px 12px;
        border: none;
        background: transparent;
        color: ${tab.isActive ? '#1BA136' : '#898989'};
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
        font-weight: 500;
        font-size: 15px;
        line-height: 20px;
        cursor: pointer;
        border-bottom: 2px solid ${tab.isActive ? '#1BA136' : 'transparent'};
        transition: all 0.2s ease;
      `;

      if (onTabClick) {
        tabButton.addEventListener('click', () => onTabClick(tab.id));
      }

      tabBar.appendChild(tabButton);
    });

    return tabBar;
  }
}