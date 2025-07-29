export interface MapContainerProps {
  /** Parent element where the map will be appended */
  parent: HTMLElement;
  /** Optional CSS class */
  className?: string;
}

/**
 * Lightweight DOM container for MapGL instance
 */
export class MapContainer {
  private element: HTMLElement;

  constructor(props: MapContainerProps) {
    this.element = document.createElement('div');
    this.element.className = props.className || 'dashboard-map';
    this.element.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 375px;
      max-width: 100%;
      height: 100%;
      z-index: 1;
    `;
    props.parent.appendChild(this.element);
  }

  /** Return underlying DOM element */
  getElement(): HTMLElement {
    return this.element;
  }
}

