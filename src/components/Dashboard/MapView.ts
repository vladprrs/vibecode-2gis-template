import { MapGLComponent, MapGLComponentFactory } from '../Map/MapGLComponent';

export interface MapViewProps {
  container: HTMLElement;
  mapApiKey?: string;
}

/**
 * Dashboard map wrapper that initializes MapGL and manages markers.
 */
export class MapView {
  private props: MapViewProps;
  private element: HTMLElement;
  private map?: MapGLComponent;

  constructor(props: MapViewProps) {
    this.props = props;
    this.element = props.container;
    this.initialize();
  }

  private initialize(): void {
    this.setupElement();
    this.createMap();
  }

  private setupElement(): void {
    this.element.className = 'dashboard-map';
    Object.assign(this.element.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '375px',
      maxWidth: '100%',
      height: '100%',
      zIndex: '1'
    });
  }

  private createMap(): void {
    this.map = MapGLComponentFactory.createForDashboard(this.element);
    const rawMap = this.map.getMap();
    if (rawMap) {
      rawMap.on('click', (event: any) => {
        if (event.lngLat) {
          this.addTemporaryMarker([event.lngLat.lng, event.lngLat.lat]);
        }
      });
    }
  }

  private addTemporaryMarker(coordinates: [number, number]): void {
    const id = `tmp_${Date.now()}`;
    this.map?.addMarker(id, { coordinates, color: '#FF0000' });
    setTimeout(() => this.map?.removeMarker(id), 3000);
  }

  public destroy(): void {
    this.map?.destroy();
  }
}
