import { FilterBar } from '../components/Filter';

/**
 * Manager responsible for rendering and cleaning up the fixed filter bar
 */
export class FilterBarManager {
  private wrapper?: HTMLElement;
  private filterBar?: FilterBar;

  /** Show filter bar at the bottom of the viewport */
  show(): void {
    this.cleanup();

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: #FFF;
      border-radius: 16px 16px 0 0;
      padding: 16px;
      padding-bottom: calc(16px + env(safe-area-inset-bottom));
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    `;

    this.filterBar = new FilterBar({ container: wrapper });
    this.wrapper = wrapper;
    document.body.appendChild(wrapper);
  }

  /** Hide and destroy filter bar */
  hide(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.filterBar?.destroy();
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
    this.wrapper = undefined;
    this.filterBar = undefined;
  }
}
