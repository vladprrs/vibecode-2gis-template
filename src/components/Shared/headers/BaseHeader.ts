/**
 * Base configuration for header components
 */
export interface BaseHeaderConfig {
  /** Show drag handle */
  showDragger?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Container element */
  container: HTMLElement;
}

/**
 * Base header component with common patterns
 * Provides shared functionality for all header variants
 */
export abstract class BaseHeader {
  protected element: HTMLElement;
  protected config: BaseHeaderConfig;

  constructor(config: BaseHeaderConfig) {
    this.config = config;
    this.element = config.container;
    // Don't initialize here - let subclasses do it after they're fully constructed
  }

  /**
   * Initialize the header component
   */
  protected initialize(): void {
    this.setupElement();
    this.createContent();
    this.setupEventListeners();
  }

  /**
   * Setup base element styles
   */
  protected setupElement(): void {
    Object.assign(this.element.style, {
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      backgroundColor: '#ffffff',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      flexShrink: '0',
    });

    if (this.config.className) {
      this.element.className = this.config.className;
    }
  }

  /**
   * Create header content - implemented by subclasses
   */
  protected abstract createContent(): void;

  /**
   * Setup event listeners - implemented by subclasses
   */
  protected setupEventListeners(): void {
    // Default implementation - can be overridden
  }

  /**
   * Create drag handle element
   */
  protected createDragger(): HTMLElement {
    const dragger = document.createElement('div');

    Object.assign(dragger.style, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '24px',
      padding: '8px 0',
      cursor: 'grab',
    });

    // Create visual handle
    const handle = document.createElement('div');
    Object.assign(handle.style, {
      width: '32px',
      height: '4px',
      backgroundColor: '#D1D5DB',
      borderRadius: '2px',
    });

    dragger.appendChild(handle);
    return dragger;
  }

  /**
   * Create search bar container
   */
  protected createSearchBarContainer(): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      gap: '12px',
    });
    return container;
  }

  /**
   * Create search input element
   */
  protected createSearchInput(placeholder: string = 'Поиск в Москве'): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;

    Object.assign(input.style, {
      flex: '1',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: '16px',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      color: '#141414',
    });

    return input;
  }

  /**
   * Create search icon
   */
  protected createSearchIcon(): HTMLElement {
    const icon = document.createElement('div');
    Object.assign(icon.style, {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
    });

    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 2C13.97 2 18 6.03 18 11C18 15.97 13.97 20 9 20C4.03 20 0 15.97 0 11C0 6.03 4.03 2 9 2ZM9 18C12.86 18 16 14.86 16 11C16 7.14 12.86 4 9 4C5.14 4 2 7.14 2 11C2 14.86 5.14 18 9 18ZM15.5 14L20 18.5L18.5 20L14 15.5L15.5 14Z" fill="#898989"/>
      </svg>
    `;

    return icon;
  }

  /**
   * Create clear button
   */
  protected createClearButton(onClear?: () => void): HTMLElement {
    const button = document.createElement('div');
    Object.assign(button.style, {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
      display: 'none', // Hidden by default
    });

    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15 13.59L13.59 15L10 11.41L6.41 15L5 13.59L8.59 10L5 6.41L6.41 5L10 8.59L13.59 5L15 6.41L11.41 10L15 13.59Z" fill="#898989"/>
      </svg>
    `;

    if (onClear) {
      button.addEventListener('click', onClear);
    }

    return button;
  }

  /**
   * Create back button
   */
  protected createBackButton(onBack?: () => void): HTMLElement {
    const button = document.createElement('div');
    Object.assign(button.style, {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
    });

    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 5L11.09 6.41L13.17 8.5H2V10.5H13.17L11.09 12.59L12.5 14L17 9.5L12.5 5Z" fill="#141414" transform="rotate(180 10 9.5)"/>
      </svg>
    `;

    if (onBack) {
      button.addEventListener('click', onBack);
    }

    return button;
  }

  /**
   * Update component properties
   */
  public updateConfig(newConfig: Partial<BaseHeaderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.createContent(); // Recreate content with new config
  }

  /**
   * Destroy the component
   */
  public destroy(): void {
    // Remove event listeners and clean up
    this.element.innerHTML = '';
  }

  /**
   * Get the root element
   */
  public getElement(): HTMLElement {
    return this.element;
  }
}
