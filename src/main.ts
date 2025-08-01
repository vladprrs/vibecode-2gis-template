/**
 * Main entry point for 2GIS Dashboard Application
 * Uses modular TypeScript components for clean architecture
 */

import './styles/_variables.css';
import './styles/base.css';
import './styles/dashboard.css';
import './styles/shop.css';

import { ScreenType } from './types/navigation';
import { BottomsheetConfig, BottomsheetState } from './types/bottomsheet';
import { SearchFlowManager } from './services/SearchFlowManager';
import { BottomsheetManager } from './services/BottomsheetManager';
import {
  CartService,
  CheckoutService,
  FilterBarManager,
  MapManager,
  MapSyncService,
  globalBottomActionBar,
} from './services';
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
  private filterBarManager?: FilterBarManager;
  private cartService?: CartService;
  private checkoutService?: CheckoutService;
  private mapSyncService?: MapSyncService;
  private mapManager?: MapManager;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    try {
      // Initialize services
      this.initializeServices();

      // Create dashboard screen using the modular component
      this.createDashboardScreen();
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
    // Initialize global bottom action bar overlay
    globalBottomActionBar.initialize();

    // Initialize SearchFlowManager with navigation events
    this.searchFlowManager = new SearchFlowManager(ScreenType.DASHBOARD, {
      onScreenChange: (from, to, context) => {
        // Delegate screen changes to the DashboardScreen
        this.dashboardScreen?.handleScreenChange(from, to, context);
      },
      onSearchInitiated: (_query, _source) => {
        // Search initiated
      },
    });

    // Initialize BottomsheetManager with configuration
    const bottomsheetConfig: BottomsheetConfig = {
      state: BottomsheetState.DEFAULT,
      snapPoints: [0.2, 0.55, 0.95, 1.0],
      isDraggable: true,
      hasScrollableContent: true,
    };

    this.bottomsheetManager = new BottomsheetManager(
      bottomsheetConfig,
      {
        onStateChange: (fromState, toState) => {
          // Save the current bottomsheet state for the active screen
          if (this.searchFlowManager) {
            this.searchFlowManager.saveCurrentBottomsheetState(toState);
          }
        },
        onDragStart: _height => {
          // Drag started
        },
        onDragEnd: (_startHeight, _endHeight) => {
          // Drag ended
        },
      },
      window.innerHeight
    );

    // Initialize FilterBarManager
    this.filterBarManager = new FilterBarManager();

    // Initialize CartService
    this.cartService = new CartService({
      onCartUpdated: _state => {
        // Cart updated
      },
      onItemAdded: _item => {
        // Item added to cart
      },
      onItemRemoved: _productId => {
        // Item removed from cart
      },
    });

    // Initialize CheckoutService
    this.checkoutService = new CheckoutService(0, {
      onCheckoutUpdated: _state => {
        // Checkout updated
      },
      onPromoCodeChanged: _promoCode => {
        // Promo code changed
      },
      onLoyaltyToggled: _enabled => {
        // Loyalty toggled
      },
      onDateSelected: _date => {
        // Date selected
      },
    });

    // Initialize MapSyncService with dummy ref (will be updated by DashboardScreen)
    this.mapSyncService = new MapSyncService({ current: null });

    // Initialize MapManager with API key from environment
    this.mapManager = new MapManager({
      mapApiKey: import.meta.env.VITE_MAPGL_KEY || 'bfa6ee5b-5e88-44f0-b4ad-394e819f26fc',
    });
  }

  /**
   * Create dashboard screen using the modular component
   */
  private createDashboardScreen(): void {
    if (
      !this.searchFlowManager ||
      !this.bottomsheetManager ||
      !this.filterBarManager ||
      !this.cartService ||
      !this.checkoutService
    ) {
      throw new Error('Services not initialized');
    }

    // Create dashboard screen using the factory
    this.dashboardScreen = DashboardScreenFactory.createDefault(
      this.container,
      this.searchFlowManager,
      this.bottomsheetManager,
      this.filterBarManager,
      this.cartService,
      this.checkoutService,
      this.mapManager!
    );

    // Activate the screen
    this.dashboardScreen.activate();
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
window.addEventListener('unhandledrejection', event => {
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
