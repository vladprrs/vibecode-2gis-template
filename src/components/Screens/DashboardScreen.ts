import { SearchFlowManager, BottomsheetManager, MapSyncService } from '../../services';
import { MapView } from '../Dashboard/MapView';
import { BottomsheetView } from '../Dashboard/BottomsheetView';

export interface DashboardScreenProps {
  container: HTMLElement;
  searchFlowManager: SearchFlowManager;
  bottomsheetManager: BottomsheetManager;
  mapSyncService?: MapSyncService;
  mapApiKey?: string;
  className?: string;
}

/**
 * Lightweight dashboard screen wiring together map and bottomsheet views.
 */
export class DashboardScreen {
  private props: DashboardScreenProps;
  private element: HTMLElement;
  private mapView?: MapView;
  private bottomsheetView?: BottomsheetView;

  constructor(props: DashboardScreenProps) {
    this.props = props;
    this.element = props.container;
    this.initialize();
  }

  private initialize(): void {
    this.setupElement();
    this.createMapView();
    this.createBottomsheetView();
  }

  private setupElement(): void {
    this.element.className = `dashboard-screen ${this.props.className || ''}`.trim();
    Object.assign(this.element.style, {
      width: '375px',
      maxWidth: '100%',
      height: '100vh',
      background: '#F1F1F1',
      position: 'relative',
      overflow: 'hidden',
      margin: '0 auto'
    });
  }

  private createMapView(): void {
    const mapContainer = document.createElement('div');
    this.element.appendChild(mapContainer);
    this.mapView = new MapView({ container: mapContainer, mapApiKey: this.props.mapApiKey });
  }

  private createBottomsheetView(): void {
    const sheetContainer = document.createElement('div');
    this.element.appendChild(sheetContainer);
    this.bottomsheetView = new BottomsheetView({
      container: sheetContainer,
      bottomsheetManager: this.props.bottomsheetManager,
      mapSyncService: this.props.mapSyncService
    });
  }

  public destroy(): void {
    this.mapView?.destroy();
    this.bottomsheetView?.destroy();
  }
}

export class DashboardScreenFactory {
  static create(props: DashboardScreenProps): DashboardScreen {
    return new DashboardScreen(props);
  }

  static createDefault(
    container: HTMLElement,
    searchFlowManager: SearchFlowManager,
    bottomsheetManager: BottomsheetManager,
    mapApiKey?: string
  ): DashboardScreen {
    return new DashboardScreen({
      container,
      searchFlowManager,
      bottomsheetManager,
      mapApiKey
    });
  }
}
