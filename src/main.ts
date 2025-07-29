/**
 * Main entry point for 2GIS Dashboard Application
 * Uses modular TypeScript components for clean architecture
 */

import './styles/_variables.css';
import './styles/base.css';
import './styles/dashboard.css';
import './styles/demo-controls.css';

import { ScreenType } from './types/navigation';
import { BottomsheetState, BottomsheetConfig } from './types/bottomsheet';
import { SearchFlowManager } from './services/SearchFlowManager';
import { BottomsheetManager } from './services/BottomsheetManager';
import { MapSyncService } from './services/MapSyncService';
import { DashboardScreen, DashboardScreenFactory } from './components/Screens/DashboardScreen';

/**
 * Application version
 */
export const APP_VERSION = '1.0.0';

/**
 * Main Application Class using modular components
 */
class App {
  private container: HTMLElement;
  private dashboardScreen?: DashboardScreen;
  private searchFlowManager?: SearchFlowManager;
  private bottomsheetManager?: BottomsheetManager;
  private mapSyncService?: MapSyncService;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    try {
      console.log(`🚀 2GIS Dashboard v${APP_VERSION} starting...`);
      
      // Initialize services
      this.initializeServices();
      
      // Create dashboard screen using the modular component
      this.createDashboardScreen();
      
      console.log('✅ Dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize dashboard:', error);
      this.showError(error);
      throw error;
    }
  }

  /**
   * Initialize all services
   */
  private initializeServices(): void {
    // Initialize SearchFlowManager with navigation events
    this.searchFlowManager = new SearchFlowManager(ScreenType.DASHBOARD, {
      onScreenChange: (from, to, context) => {
        console.log(`📱 Navigation: ${from} → ${to}`, context);
      },
      onSearchInitiated: (query, source) => {
        console.log(`🔍 Search initiated: "${query}" from ${source}`);
      }
    });

    // Initialize BottomsheetManager with configuration
    const bottomsheetConfig: BottomsheetConfig = {
      state: BottomsheetState.DEFAULT,
      snapPoints: [0.2, 0.55, 0.9, 0.95],
      isDraggable: true,
      hasScrollableContent: true
    };

    this.bottomsheetManager = new BottomsheetManager(
      bottomsheetConfig,
      {
        onStateChange: (fromState, toState) => {
          console.log(`📋 Bottomsheet: ${fromState} → ${toState}`);
          // Sync map viewport when bottomsheet state changes
          this.mapSyncService?.adjustMapViewport(this.getHeightForState(toState));
        },
        onDragStart: (height) => {
          console.log(`🖱️ Drag start: ${height}px`);
        },
        onDragEnd: (startHeight, endHeight) => {
          console.log(`🖱️ Drag end: ${startHeight}px → ${endHeight}px`);
        }
      },
      window.innerHeight
    );

    // Initialize MapSyncService with dummy ref (will be updated by DashboardScreen)
    this.mapSyncService = new MapSyncService({ current: null });
  }

  /**
   * Create dashboard screen using the modular component
   */
  private createDashboardScreen(): void {
    if (!this.searchFlowManager || !this.bottomsheetManager) {
      throw new Error('Services not initialized');
    }

    // Create dashboard screen using the factory
    this.dashboardScreen = DashboardScreenFactory.createDefault(
      this.container,
      this.searchFlowManager,
      this.bottomsheetManager,
      import.meta.env.VITE_MAPGL_KEY || 'bfa6ee5b-5e88-44f0-b4ad-394e819f26fc'
    );

    // Activate the screen
    this.dashboardScreen.activate();

    // Set up global controls if they exist
    this.setupGlobalControls();
  }

  /**
   * Set up global control handlers (debug panel, etc.)
   */
  private setupGlobalControls(): void {
    // Refresh button
    document.getElementById('btn-refresh')?.addEventListener('click', () => {
      location.reload();
    });

    // Debug toggle
    document.getElementById('btn-toggle-debug')?.addEventListener('click', () => {
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) {
        debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
      }
    });

    // Center Moscow button
    document.getElementById('btn-center-moscow')?.addEventListener('click', () => {
      this.dashboardScreen?.centerMoscow();
    });

    // Test markers button
    document.getElementById('btn-test-markers')?.addEventListener('click', () => {
      this.dashboardScreen?.testRandomMarkers();
    });

    // Bottomsheet state buttons
    document.querySelectorAll('[data-state]').forEach(button => {
      button.addEventListener('click', () => {
        const state = (button as HTMLElement).dataset.state;
        if (state && this.dashboardScreen) {
          const bottomsheetState = this.mapStateToBottomsheetState(state);
          this.dashboardScreen.snapToState(bottomsheetState);
          
          // Update active button
          document.querySelectorAll('[data-state]').forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
        }
      });
    });
  }

  /**
   * Map string state to BottomsheetState enum
   */
  private mapStateToBottomsheetState(state: string): BottomsheetState {
    switch (state.toLowerCase().replace('-', '_')) {
      case 'small': return BottomsheetState.SMALL;
      case 'default': return BottomsheetState.DEFAULT;
      case 'fullscreen': return BottomsheetState.FULLSCREEN;
      case 'fullscreen_scroll': return BottomsheetState.FULLSCREEN_SCROLL;
      default: return BottomsheetState.DEFAULT;
    }
  }

  /**
   * Get height percentage for bottomsheet state
   */
  private getHeightForState(state: BottomsheetState): number {
    switch (state) {
      case BottomsheetState.SMALL: return 0.2;
      case BottomsheetState.DEFAULT: return 0.55;
      case BottomsheetState.FULLSCREEN: return 0.9;
      case BottomsheetState.FULLSCREEN_SCROLL: return 0.95;
      default: return 0.55;
    }
  }

  /**
   * Show error in UI
   */
  private showError(error: any): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    
    this.container.innerHTML = `
      <div style="padding: 20px; background: #ffe6e6; color: #d00; border-radius: 8px; margin: 20px;">
        <h2>❌ Ошибка инициализации</h2>
        <p><strong>Ошибка:</strong> ${errorMessage}</p>
        <details><summary>Подробности</summary><pre>${errorStack}</pre></details>
      </div>
    `;
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.dashboardScreen?.destroy();
  }
}

/**
 * Initialize application with default configuration
 */
export async function initializeApp(container: HTMLElement): Promise<App> {
  const app = new App(container);
  await app.initialize();
  return app;
}

/**
 * Global error handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Show user-friendly error in development
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 16px;
    border-radius: 8px;
    z-index: 10000;
    max-width: 400px;
    font-family: monospace;
    font-size: 14px;
  `;
  errorDiv.textContent = `Error: ${event.reason}`;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    if (document.body.contains(errorDiv)) {
      document.body.removeChild(errorDiv);
    }
  }, 5000);
});

/**
 * Auto-initialize if DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      initializeApp(appContainer).catch(console.error);
    }
  });
} else {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    initializeApp(appContainer).catch(console.error);
  }
} 