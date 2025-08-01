import { BaseHeader, BaseHeaderConfig } from './BaseHeader';

/**
 * Configuration for SearchHeader
 */
export interface SearchHeaderConfig extends BaseHeaderConfig {
  /** Placeholder text for search */
  placeholder?: string;
  /** Search query value */
  searchQuery?: string;
  /** Whether search is active (focused state) */
  isActive?: boolean;
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
 * Search header component for search result screens
 * Shows active search bar with back button and clear functionality
 */
export class SearchHeader extends BaseHeader {
  private searchInput?: HTMLInputElement;
  private clearButton?: HTMLElement;
  private searchConfig: SearchHeaderConfig;

  constructor(config: SearchHeaderConfig) {
    super(config);
    this.searchConfig = config;
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
    const backButton = this.createBackButton(this.searchConfig.onBack);
    searchContainer.appendChild(backButton);

    // Search input container
    const inputContainer = document.createElement('div');
    Object.assign(inputContainer.style, {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'rgba(20, 20, 20, 0.06)',
      borderRadius: '8px',
      padding: '8px 12px',
      gap: '8px',
    });

    // Search icon
    const searchIcon = this.createSearchIcon();
    inputContainer.appendChild(searchIcon);

    // Search input
    this.searchInput = this.createSearchInput(this.searchConfig.placeholder || 'Поиск в Москве');

    // Set initial value if provided
    if (this.searchConfig.searchQuery) {
      this.searchInput.value = this.searchConfig.searchQuery;
    }

    // Style for active search
    Object.assign(this.searchInput.style, {
      backgroundColor: 'transparent',
      padding: '0',
    });

    inputContainer.appendChild(this.searchInput);

    // Clear button
    this.clearButton = this.createClearButton(this.searchConfig.onClear);
    inputContainer.appendChild(this.clearButton);

    searchContainer.appendChild(inputContainer);
    this.element.appendChild(searchContainer);

    // Update clear button visibility
    this.updateClearButtonVisibility();
  }

  protected override setupEventListeners(): void {
    if (!this.searchInput) return;

    // Focus event
    this.searchInput.addEventListener('focus', () => {
      if (this.searchConfig.onSearchFocus) {
        this.searchConfig.onSearchFocus();
      }
    });

    // Blur event
    this.searchInput.addEventListener('blur', () => {
      if (this.searchConfig.onSearchBlur) {
        this.searchConfig.onSearchBlur();
      }
    });

    // Input event
    this.searchInput.addEventListener('input', e => {
      const target = e.target as HTMLInputElement;
      this.updateClearButtonVisibility();

      if (this.searchConfig.onSearchChange) {
        this.searchConfig.onSearchChange(target.value);
      }
    });

    // Submit event (Enter key)
    this.searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        if (this.searchConfig.onSearchSubmit) {
          this.searchConfig.onSearchSubmit(target.value);
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
      if (this.searchConfig.onClear) {
        this.searchConfig.onClear();
      }
    }
  }

  /**
   * Update search-specific configuration
   */
  public updateSearchConfig(newConfig: Partial<SearchHeaderConfig>): void {
    this.searchConfig = { ...this.searchConfig, ...newConfig };
    this.updateConfig(newConfig);
  }
}
