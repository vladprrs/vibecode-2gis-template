/**
 * Dashboard Figma Demo - Uses the main modular application
 * This demo loads the main application and provides test controls
 */

import { initializeApp } from '../main';

class DashboardFigmaDemo {
  constructor() {
    this.app = null;
    this.container = document.getElementById('app');
    this.mapStatus = document.getElementById('map-status');
    this.debugInfo = document.getElementById('debug-info');
    
    this.setupControls();
    this.initialize();
  }

  async initialize() {
    try {
      this.updateMapStatus('Инициализация приложения...', 'loading');
      
      // Initialize the main application
      this.app = await initializeApp(this.container);
      
      this.updateMapStatus('Готово', 'success');
      this.setupDebugInfo();
      
      console.log('✅ Dashboard Figma Demo initialized');
    } catch (error) {
      console.error('❌ Failed to initialize demo:', error);
      this.updateMapStatus('Ошибка инициализации', 'error');
    }
  }

  setupControls() {
    // Dashboard States
    const stateButtons = document.querySelectorAll('[data-state]');
    stateButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const state = e.target.dataset.state;
        this.snapToState(state);
        
        // Update active button
        stateButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Actions
    const refreshBtn = document.getElementById('btn-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }

    const debugBtn = document.getElementById('btn-toggle-debug');
    if (debugBtn) {
      debugBtn.addEventListener('click', () => {
        this.debugInfo.style.display = 
          this.debugInfo.style.display === 'none' ? 'block' : 'none';
      });
    }

    const centerBtn = document.getElementById('btn-center-moscow');
    if (centerBtn) {
      centerBtn.addEventListener('click', () => {
        if (this.app?.dashboardScreen) {
          this.app.dashboardScreen.centerMoscow();
        }
      });
    }

    const markersBtn = document.getElementById('btn-test-markers');
    if (markersBtn) {
      markersBtn.addEventListener('click', () => {
        if (this.app?.dashboardScreen) {
          this.app.dashboardScreen.testRandomMarkers();
        }
      });
    }
  }

  snapToState(state) {
    if (this.app?.dashboardScreen) {
      this.app.dashboardScreen.snapToState(state);
      this.updateDebugInfo();
    }
  }

  updateMapStatus(message, type = 'info') {
    if (this.mapStatus) {
      this.mapStatus.textContent = message;
      this.mapStatus.className = `map-status ${type}`;
    }
  }

  setupDebugInfo() {
    this.updateDebugInfo();
    // Update debug info periodically
    setInterval(() => {
      this.updateDebugInfo();
    }, 1000);
  }

  updateDebugInfo() {
    if (!this.debugInfo) return;

    const stateSpan = this.debugInfo.querySelector('#debug-state');
    const heightSpan = this.debugInfo.querySelector('#debug-height');
    const mapSpan = this.debugInfo.querySelector('#debug-map');
    const centerSpan = this.debugInfo.querySelector('#debug-center');
    const zoomSpan = this.debugInfo.querySelector('#debug-zoom');

    if (stateSpan) {
      stateSpan.textContent = this.app?.dashboardScreen?.currentState || 'unknown';
    }

    if (heightSpan) {
      const height = this.app?.dashboardScreen?.currentHeight || 0;
      const percentage = Math.round((height / window.innerHeight) * 100);
      heightSpan.textContent = `${percentage}%`;
    }

    if (mapSpan) {
      mapSpan.textContent = this.app?.dashboardScreen?.mapComponent ? 'ready' : 'loading';
    }

    if (centerSpan) {
      centerSpan.textContent = 'Moscow';
    }

    if (zoomSpan) {
      zoomSpan.textContent = '12';
    }
  }
}

// Initialize demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new DashboardFigmaDemo();
}); 