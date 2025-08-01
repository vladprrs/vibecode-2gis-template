import { BaseHeader, BaseHeaderConfig } from './BaseHeader';

/**
 * Configuration for SuggestHeader
 */
export interface SuggestHeaderConfig extends BaseHeaderConfig {
  /** Placeholder text for search */
  placeholder?: string;
  /** Search query value */
  searchQuery?: string;
  /** Callback when back button is clicked */
  onBack?: () => void;
  /** Callback when search value changes */
  onSearchChange?: (query: string) => void;
  /** Callback when search is submitted */
  onSearchSubmit?: (query: string) => void;
  /** Callback when search is cleared */
  onClear?: () => void;
  /** Callback when search gains focus */
  onSearchFocus?: () => void;
  /** Callback when search loses focus */
  onSearchBlur?: () => void;
}

/**
 * Suggest header component for suggestion screens
 * Shows active search bar optimized for real-time suggestions
 */
export class SuggestHeader extends BaseHeader {
  private searchInput?: HTMLInputElement;
  private clearButton?: HTMLElement;
  private suggestConfig: SuggestHeaderConfig;

  constructor(config: SuggestHeaderConfig) {
    super(config);
    this.suggestConfig = config;
    this.initialize();
  }

  protected override createContent(): void {
    this.element.innerHTML = '';

    // Add dragger if needed
    if (this.config.showDragger !== false) {
      const dragger = this.createDragger();
      this.element.appendChild(dragger);
    }

    // Create search bar
    this.createSearchBar();
  }

  private createSearchBar(): void {
    const searchContainer = this.createSearchBarContainer();

    // Back button
    const backButton = this.createBackButton(this.suggestConfig.onBack);
    searchContainer.appendChild(backButton);

    // Search input container with enhanced styling for suggestions
    const inputContainer = document.createElement('div');
    Object.assign(inputContainer.style, {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'rgba(20, 20, 20, 0.06)',
      borderRadius: '8px',
      padding: '8px 12px',
      gap: '8px',
      border: '1px solid transparent',
      transition: 'border-color 0.2s ease',
    });

    // Add focus styling
    inputContainer.addEventListener('focusin', () => {
      inputContainer.style.borderColor = '#1BA136';
      inputContainer.style.backgroundColor = '#ffffff';
    });

    inputContainer.addEventListener('focusout', () => {
      inputContainer.style.borderColor = 'transparent';
      inputContainer.style.backgroundColor = 'rgba(20, 20, 20, 0.06)';
    });

    // Search icon
    const searchIcon = this.createSearchIcon();
    inputContainer.appendChild(searchIcon);

    // Search input
    this.searchInput = this.createSearchInput(
      this.suggestConfig.placeholder || 'Введите запрос...'
    );

    // Set initial value if provided
    if (this.suggestConfig.searchQuery) {
      this.searchInput.value = this.suggestConfig.searchQuery;
    }

    // Style for suggest input (auto-focused and ready for typing)
    Object.assign(this.searchInput.style, {
      backgroundColor: 'transparent',
      padding: '0',
      color: '#141414',
    });

    inputContainer.appendChild(this.searchInput);

    // Clear button
    this.clearButton = this.createClearButton(this.suggestConfig.onClear);
    inputContainer.appendChild(this.clearButton);

    searchContainer.appendChild(inputContainer);
    this.element.appendChild(searchContainer);

    // Update clear button visibility
    this.updateClearButtonVisibility();

    // Auto-focus for suggest screen
    setTimeout(() => {
      this.searchInput?.focus();
    }, 100);
  }

  protected override setupEventListeners(): void {
    if (!this.searchInput) return;

    // Focus event
    this.searchInput.addEventListener('focus', () => {
      if (this.suggestConfig.onSearchFocus) {
        this.suggestConfig.onSearchFocus();
      }
    });

    // Blur event
    this.searchInput.addEventListener('blur', () => {
      if (this.suggestConfig.onSearchBlur) {
        this.suggestConfig.onSearchBlur();
      }
    });

    // Input event with debouncing for suggestions
    let debounceTimer: number;
    this.searchInput.addEventListener('input', e => {
      const target = e.target as HTMLInputElement;
      this.updateClearButtonVisibility();

      // Clear previous timer
      clearTimeout(debounceTimer);

      // Debounce the search change callback for better performance
      debounceTimer = window.setTimeout(() => {
        if (this.suggestConfig.onSearchChange) {
          this.suggestConfig.onSearchChange(target.value);
        }
      }, 150); // 150ms debounce for suggestions
    });

    // Submit event (Enter key)
    this.searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        if (this.suggestConfig.onSearchSubmit) {
          this.suggestConfig.onSearchSubmit(target.value);
        }
      }
    });
  }

  private updateClearButtonVisibility(): void {
    if (this.clearButton && this.searchInput) {
      const hasValue = this.searchInput.value.length > 0;
      this.clearButton.style.display = hasValue ? 'block' : 'none';
    }
  }

  /**
   * Update search query programmatically
   */
  public setSearchQuery(query: string): void {
    if (this.searchInput) {
      this.searchInput.value = query;
      this.updateClearButtonVisibility();
    }
  }

  /**
   * Get current search query
   */
  public getSearchQuery(): string {
    return this.searchInput?.value || '';
  }

  /**
   * Focus the search input
   */
  public focusSearch(): void {
    this.searchInput?.focus();
  }

  /**
   * Clear the search input
   */
  public clearSearch(): void {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.updateClearButtonVisibility();
      if (this.suggestConfig.onClear) {
        this.suggestConfig.onClear();
      }
    }
  }

  /**
   * Set cursor position in search input
   */
  public setCursorPosition(position: number): void {
    if (this.searchInput) {
      this.searchInput.setSelectionRange(position, position);
    }
  }

  /**
   * Select all text in search input
   */
  public selectAllText(): void {
    if (this.searchInput) {
      this.searchInput.select();
    }
  }

  /**
   * Update suggest-specific configuration
   */
  public updateSuggestConfig(newConfig: Partial<SuggestHeaderConfig>): void {
    this.suggestConfig = { ...this.suggestConfig, ...newConfig };
    this.updateConfig(newConfig);
  }
}
