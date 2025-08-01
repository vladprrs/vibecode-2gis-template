import { BaseHeader, BaseHeaderConfig } from './BaseHeader';

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
 * Shows search bar with placeholder text for main dashboard screen
 */
export class DashboardHeader extends BaseHeader {
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

    // Create search bar
    this.createSearchBar();
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

  private createSearchBar(): void {
    // Create search bar using the exact Figma structure
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-nav-bar';

    searchContainer.innerHTML = `
      <div class="search-nav-content">
        <div class="search-field-container">
          <div class="search-field">
            <div class="search-icon">
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M8.5 15.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM15.5 15.5l-3.87-3.87" 
                      stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="search-placeholder">${this.dashboardConfig.placeholder || 'Поиск в Москве'}</div>
          </div>
        </div>
      </div>
    `;

    // Add click handler to search field
    const searchField = searchContainer.querySelector('.search-field') as HTMLElement;
    if (searchField) {
      searchField.style.cursor = 'pointer';
      searchField.addEventListener('click', () => {
        if (this.dashboardConfig.onSearchFocus) {
          this.dashboardConfig.onSearchFocus();
        }
      });
    }

    this.element.appendChild(searchContainer);
  }

  protected override setupEventListeners(): void {
    // Event listeners are already set up in createSearchBar method
    // Dashboard header uses click-to-navigate pattern instead of actual input
  }

  /**
   * Update search query programmatically
   */
  public setSearchQuery(query: string): void {
    // Update the placeholder text in the dashboard header
    const placeholder = this.element.querySelector('.search-placeholder') as HTMLElement;
    if (placeholder) {
      placeholder.textContent = query || this.dashboardConfig.placeholder || 'Поиск в Москве';
    }
  }

  /**
   * Get current search query
   */
  public getSearchQuery(): string {
    // Dashboard header doesn't store actual query, it's just a click target
    return '';
  }

  /**
   * Focus the search input
   */
  public focusSearch(): void {
    // Dashboard header doesn't have focusable input, clicking navigates to suggest screen
    if (this.dashboardConfig.onSearchFocus) {
      this.dashboardConfig.onSearchFocus();
    }
  }

  /**
   * Update dashboard-specific configuration
   */
  public updateDashboardConfig(newConfig: Partial<DashboardHeaderConfig>): void {
    this.dashboardConfig = { ...this.dashboardConfig, ...newConfig };
    this.updateConfig(newConfig);
  }
}
