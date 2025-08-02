import { BaseHeader, BaseHeaderConfig } from './BaseHeader';
import { SearchBar, SearchBarFactory, SearchBarVariant } from '../../Search/SearchBar';

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
 * Uses SearchBar component to eliminate duplication
 */
export class SearchHeader extends BaseHeader {
  private searchBar?: SearchBar;
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

    // Create search container
    this.createSearchBarSection();
  }

  private createSearchBarSection(): void {
    const searchContainer = this.createSearchBarContainer();

    // Back button
    const backButton = this.createBackButton(this.searchConfig.onBack);
    searchContainer.appendChild(backButton);

    // Create SearchBar container
    const searchBarContainer = document.createElement('div');
    Object.assign(searchBarContainer.style, {
      flex: '1',
      display: 'flex',
    });

    // Use SearchBar component instead of recreating search functionality
    this.searchBar = SearchBarFactory.createSearchResult(
      searchBarContainer,
      this.searchConfig.searchQuery || '',
      this.searchConfig.onBack // Right icon (X) navigates back
    );

    // Configure SearchBar with our callbacks
    this.searchBar.updateProps({
      placeholder: this.searchConfig.placeholder || 'Поиск в Москве',
      onChange: this.searchConfig.onSearchChange,
      onSubmit: this.searchConfig.onSearchSubmit,
      onClear: this.searchConfig.onClear,
      onFocus: this.searchConfig.onSearchFocus,
      onBlur: this.searchConfig.onSearchBlur,
    });

    searchContainer.appendChild(searchBarContainer);
    this.element.appendChild(searchContainer);
  }

  protected override setupEventListeners(): void {
    // Event handling is now delegated to SearchBar component
    // No additional event listeners needed
  }

  /**
   * Update search query programmatically
   */
  public setSearchQuery(query: string): void {
    this.searchBar?.setValue(query);
  }

  /**
   * Get current search query
   */
  public getSearchQuery(): string {
    return this.searchBar?.getValue() || '';
  }

  /**
   * Focus the search input
   */
  public focusSearch(): void {
    this.searchBar?.focus();
  }

  /**
   * Clear the search input
   */
  public clearSearch(): void {
    this.searchBar?.clear();
  }

  /**
   * Update search-specific configuration
   */
  public updateSearchConfig(newConfig: Partial<SearchHeaderConfig>): void {
    this.searchConfig = { ...this.searchConfig, ...newConfig };

    // Update SearchBar with new configuration
    if (this.searchBar && newConfig) {
      this.searchBar.updateProps({
        value: newConfig.searchQuery,
        placeholder: newConfig.placeholder,
        onChange: newConfig.onSearchChange,
        onSubmit: newConfig.onSearchSubmit,
        onClear: newConfig.onClear,
        onFocus: newConfig.onSearchFocus,
        onBlur: newConfig.onSearchBlur,
      });
    }

    this.updateConfig(newConfig);
  }
}
