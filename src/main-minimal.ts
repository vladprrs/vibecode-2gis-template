console.log('🔧 Loading minimal main.ts module...');

import './styles/base.css';
import './styles/dashboard.css';
import './styles/demo-controls.css';

console.log('🎨 Styles loaded');

/**
 * Application version
 */
export const APP_VERSION = '1.0.0';

/**
 * Simple test initialization
 */
export async function initializeApp(container: HTMLElement): Promise<void> {
  console.log(`🚀 2GIS Dashboard v${APP_VERSION} starting...`);
  
  container.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h1>🎯 2GIS Dashboard Test</h1>
      <p>✅ Main.ts loaded successfully!</p>
      <p>Version: ${APP_VERSION}</p>
      <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 10px;">
        <strong>Next steps:</strong>
        <ul>
          <li>Styles are loading: ✅</li>
          <li>JavaScript execution: ✅</li>
          <li>Container rendering: ✅</li>
        </ul>
      </div>
    </div>
  `;
  
  console.log('✅ Minimal app initialized successfully');
}

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

console.log('🚀 Minimal main.ts module loaded completely'); 