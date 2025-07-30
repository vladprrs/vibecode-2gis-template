import { BottomsheetManager } from './BottomsheetManager';
import { BottomsheetAnimationManager } from './BottomsheetAnimationManager';
import { BottomsheetState } from '../types';

/**
 * Handles gesture events for the bottomsheet element
 */
export class BottomsheetGestureManager {
  private element: HTMLElement;
  private bottomsheetManager: BottomsheetManager;
  private animationManager: BottomsheetAnimationManager;
  private getCurrentHeight: () => number | undefined;
  private setHeight: (height: number) => void;
  private onStateChange: (state: string) => void;

  private wheelTimeout?: number;
  private isWheelScrolling = false;
  private touchStartY = 0;
  private touchCurrentY = 0;
  private isTouchScrolling = false;

  constructor(options: {
    element: HTMLElement;
    bottomsheetManager: BottomsheetManager;
    animationManager: BottomsheetAnimationManager;
    getCurrentHeight: () => number | undefined;
    setHeight: (height: number) => void;
    onStateChange: (state: string) => void;
  }) {
    this.element = options.element;
    this.bottomsheetManager = options.bottomsheetManager;
    this.animationManager = options.animationManager;
    this.getCurrentHeight = options.getCurrentHeight;
    this.setHeight = options.setHeight;
    this.onStateChange = options.onStateChange;
  }

  /** Setup wheel and touch event listeners */
  setupBottomsheetEventListeners(): void {
    this.element.addEventListener('wheel', this.handleWheel.bind(this), {
      passive: false,
    });
    this.element.addEventListener('touchstart', this.handleScrollTouchStart.bind(this), {
      passive: false,
    });
    this.element.addEventListener('touchmove', this.handleScrollTouchMove.bind(this), {
      passive: false,
    });
    this.element.addEventListener('touchend', this.handleScrollTouchEnd.bind(this), {
      passive: false,
    });
  }

  private handleWheel(event: WheelEvent): void {
    const screenHeight = window.innerHeight;
    const currentHeight = this.getCurrentHeight() ?? screenHeight * 0.55;
    const scrollableThreshold = screenHeight * 0.92;

    if (currentHeight > scrollableThreshold) {
      // Find scrollable content container - prioritize known classes, then find overflow auto
      const contentContainer =
        this.element.querySelector('.dashboard-content') ||
        this.element.querySelector('[style*="overflow-y: auto"]') ||
        this.element.querySelector('[style*="overflowY: auto"]') ||
        this.findScrollableElement(this.element);

      if (contentContainer) {
        const { scrollTop } = contentContainer;
        const isAtTop = scrollTop <= 0;

        if (event.deltaY < 0 && isAtTop) {
          event.preventDefault();
          const newHeight = Math.max(screenHeight * 0.15, currentHeight + event.deltaY * 2);
          this.setHeight(newHeight);
          this.startSnapTimeout();
          return;
        }
        return;
      }
    }

    event.preventDefault();
    const delta = event.deltaY * 2;
    const newHeight = Math.max(
      screenHeight * 0.15,
      Math.min(screenHeight * 1.0, currentHeight + delta)
    );
    this.setHeight(newHeight);
    this.isWheelScrolling = true;
    this.startSnapTimeout();
  }

  private startSnapTimeout(): void {
    if (this.wheelTimeout) {
      clearTimeout(this.wheelTimeout);
    }

    this.wheelTimeout = window.setTimeout(() => {
      this.snapToNearestState();
      this.isWheelScrolling = false;
    }, 150);
  }

  private snapToNearestState(): void {
    const currentHeight = this.getCurrentHeight();
    if (!currentHeight) return;

    const screenHeight = window.innerHeight;
    const currentRatio = currentHeight / screenHeight;

    const states = [
      { name: 'small', ratio: 0.2 },
      { name: 'default', ratio: 0.55 },
      { name: 'fullscreen', ratio: 0.95 },
      { name: 'fullscreen-scroll', ratio: 1.0 },
    ];

    let nearestState = states[0];
    let minDistance = Math.abs(currentRatio - states[0].ratio);

    for (const state of states) {
      const distance = Math.abs(currentRatio - state.ratio);
      if (distance < minDistance) {
        minDistance = distance;
        nearestState = state;
      }
    }

    const targetHeight = screenHeight * nearestState.ratio;
    this.onStateChange(nearestState.name);
    this.animationManager.animateToHeight(currentHeight, targetHeight, this.setHeight.bind(this));

    this.bottomsheetManager.snapToState(nearestState.name as BottomsheetState);
  }

  private handleScrollTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];

    // Check if touch started on the drag handle area
    const target = event.target as Element;
    const isDragHandle =
      target?.closest('.bottomsheet-drag-handle-area') ||
      target?.closest('.bottomsheet-drag-handle');

    // Only allow dragging from the drag handle area
    if (!isDragHandle) {
      this.isTouchScrolling = false;
      return;
    }

    this.touchStartY = touch.clientY;
    this.touchCurrentY = touch.clientY;
    this.isTouchScrolling = true;
  }

  private handleScrollTouchMove(event: TouchEvent): void {
    if (!this.isTouchScrolling || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const currentY = touch.clientY;

    const momentumDelta = this.touchCurrentY - currentY;

    const screenHeight = window.innerHeight;
    const currentHeight = this.getCurrentHeight() ?? screenHeight * 0.55;
    const scrollableThreshold = screenHeight * 0.92;

    if (currentHeight > scrollableThreshold) {
      // Find scrollable content container - prioritize known classes, then find overflow auto
      const contentContainer =
        this.element.querySelector('.dashboard-content') ||
        this.element.querySelector('[style*="overflow-y: auto"]') ||
        this.element.querySelector('[style*="overflowY: auto"]') ||
        this.findScrollableElement(this.element);

      if (contentContainer) {
        const { scrollTop } = contentContainer;
        const isAtTop = scrollTop <= 0;

        if (momentumDelta < 0 && isAtTop) {
          event.preventDefault();
          const newHeight = Math.max(screenHeight * 0.15, currentHeight + momentumDelta * 3);
          this.setHeight(newHeight);
          this.touchCurrentY = currentY;
          return;
        }

        this.touchCurrentY = currentY;
        return;
      }
    }

    event.preventDefault();

    if (Math.abs(momentumDelta) > 1) {
      const newHeight = Math.max(
        screenHeight * 0.15,
        Math.min(screenHeight * 1.0, currentHeight + momentumDelta * 3)
      );
      this.setHeight(newHeight);
    }

    this.touchCurrentY = currentY;
  }

  private handleScrollTouchEnd(_event: TouchEvent): void {
    this.isTouchScrolling = false;
    this.snapToNearestState();
  }

  /**
   * Find scrollable element by checking computed styles
   */
  private findScrollableElement(container: Element): Element | null {
    const elements = container.querySelectorAll('*');

    for (const element of elements) {
      const computedStyle = getComputedStyle(element);
      const overflowY = computedStyle.overflowY;

      if (overflowY === 'auto' || overflowY === 'scroll') {
        return element;
      }
    }

    return null;
  }
}
