import { BOTTOMSHEET_ANIMATION_CONFIG } from '../types';

/**
 * Manages animation of bottomsheet height transitions
 */
export class BottomsheetAnimationManager {
  /**
   * Animate bottomsheet height from current to target value
   */
  animateToHeight(
    startHeight: number,
    targetHeight: number,
    onUpdate: (height: number) => void,
    onComplete?: () => void
  ): void {
    const startTime = performance.now();
    const duration = BOTTOMSHEET_ANIMATION_CONFIG.duration;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = this.cubicBezierEasing(progress, 0.4, 0.0, 0.2, 1);
      const currentHeight =
        startHeight + (targetHeight - startHeight) * easeProgress;

      onUpdate(currentHeight);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Simplified cubic-bezier easing function
   */
  cubicBezierEasing(
    t: number,
    _x1: number,
    _y1: number,
    _x2: number,
    _y2: number
  ): number {
    // Simple ease-in-out approximation
    return t * t * (3 - 2 * t);
  }
}
