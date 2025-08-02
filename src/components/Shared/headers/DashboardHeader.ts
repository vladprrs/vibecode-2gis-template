import { BaseHeader, BaseHeaderConfig } from './BaseHeader';
import { SearchBar, SearchBarFactory } from '../../Search/SearchBar';

/**
 * Configuration for DashboardHeader
 */
export interface DashboardHeaderConfig extends BaseHeaderConfig {
  /** Placeholder text for search */
  placeholder?: string;
  /** Search query value */
  searchQuery?: string;
  /** Callback when search is focused */
  onSearchFocus?: () => void;
  /** Callback when search value changes */
  onSearchChange?: (query: string) => void;
  /** Callback when search is submitted */
  onSearchSubmit?: (query: string) => void;
}

/**
 * Dashboard header component
 * Uses SearchBar component to eliminate duplication
 */
export class DashboardHeader extends BaseHeader {
  private searchBar?: SearchBar;
  private dashboardConfig: DashboardHeaderConfig;

  constructor(config: DashboardHeaderConfig) {
    super(config);
    this.dashboardConfig = config;
    this.initialize();
  }

  protected override createContent(): void {
    this.element.innerHTML = '';

    // Add dragger using exact Figma structure
    if (this.config.showDragger !== false) {
      this.createDashboardDragger();
    }

    // Create search section
    this.createSearchSection();
  }

  private createDashboardDragger(): void {
    // Create dragger using exact Figma structure
    const dragger = document.createElement('div');
    dragger.className = 'dragger';
    const draggerHandle = document.createElement('div');
    draggerHandle.className = 'dragger-handle';
    dragger.appendChild(draggerHandle);
    this.element.appendChild(dragger);
  }

  private createSearchSection(): void {
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-nav-bar';
    Object.assign(searchContainer.style, {
      padding: '0 16px 16px 16px',
    });

    // Use SearchBar component for dashboard (inactive state with burger menu)
    this.searchBar = SearchBarFactory.createDashboard(
      searchContainer,
      this.dashboardConfig.onSearchFocus // Burger menu click navigates to suggest
    );

    // Configure SearchBar with dashboard-specific settings
    this.searchBar.updateProps({
      placeholder: this.dashboardConfig.placeholder || 'Поиск в Москве',
      value: this.dashboardConfig.searchQuery,
      onChange: this.dashboardConfig.onSearchChange,
      onSubmit: this.dashboardConfig.onSearchSubmit,
    });

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
   * Focus the search input (navigates to suggest screen for dashboard)
   */
  public focusSearch(): void {
    if (this.dashboardConfig.onSearchFocus) {
      this.dashboardConfig.onSearchFocus();
    }
  }

  /**
   * Update dashboard-specific configuration
   */
  public updateDashboardConfig(newConfig: Partial<DashboardHeaderConfig>): void {
    this.dashboardConfig = { ...this.dashboardConfig, ...newConfig };

    // Update SearchBar with new configuration
    if (this.searchBar && newConfig) {
      this.searchBar.updateProps({
        placeholder: newConfig.placeholder,
        value: newConfig.searchQuery,
        onChange: newConfig.onSearchChange,
        onSubmit: newConfig.onSearchSubmit,
      });
    }

    this.updateConfig(newConfig);
  }
}
