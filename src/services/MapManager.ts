import { MapContainer } from '../components/Map/MapContainer';

export interface MapManagerOptions {
  /** 2GIS API key */
  mapApiKey?: string;
}

/**
 * Simple manager responsible for creating and keeping reference
 * to the MapGL instance. Used by screens via dependency injection.
 */
export class MapManager {
  private options: MapManagerOptions;
  private mapComponent: any;

  constructor(options: MapManagerOptions = {}) {
    this.options = options;
  }

  /**
   * Create map container element and initialize real map.
   */
  async createMapContainer(parent: HTMLElement): Promise<MapContainer> {
    const container = new MapContainer({ parent });
    try {
      await this.waitForMapGL();
      await this.createRealMap(container.getElement());
    } catch (error) {
      console.error('Map loading error:', error);
      this.createFallbackMap(container.getElement());
    }
    return container;
  }

  /**
   * Wait for MapGL API to be available
   */
  private async waitForMapGL(): Promise<any> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30;

      const checkMapGL = () => {
        attempts++;
        if ((window as any).mapgl && (window as any).mapgl.Map) {
          console.log(`✅ MapGL API v1 загружен (попытка ${attempts})`);
          resolve((window as any).mapgl);
        } else if (attempts >= maxAttempts) {
          reject(new Error('MapGL API v1 не загрузился'));
        } else {
          setTimeout(checkMapGL, 200);
        }
      };
      checkMapGL();
    });
  }

  /**
   * Create 2GIS map instance
   */
  private async createRealMap(container: HTMLElement): Promise<void> {
    const mapId = `mapgl-container-${Date.now()}`;
    container.id = mapId;

    this.mapComponent = new (window as any).mapgl.Map(mapId, {
      center: [37.620393, 55.75396],
      zoom: 12,
      key: this.options.mapApiKey || 'bfa6ee5b-5e88-44f0-b4ad-394e819f26fc',
    });

    await new Promise<void>(resolve => {
      let resolved = false;
      this.mapComponent.on('styleload', () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      });
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 5000);
    });

    this.mapComponent.on('click', (event: any) => {
      // Placeholder for click handling; consumers may subscribe via map instance
    });
  }

  /**
   * Create fallback view when MapGL is unavailable
   */
  private createFallbackMap(container: HTMLElement): void {
    container.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #E8F4F8 0%, #D4E8F0 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #666;
      ">
        <div class="map-placeholder-icon" style="
          font-size: 48px;
          margin-bottom: 16px;
        ">🗺️</div>
        <div>Карта недоступна</div>
        <div style="font-size: 12px; margin-top: 8px;">
          MapGL API не загрузился
        </div>
      </div>
    `;
  }

  /** Get map instance */
  getMapInstance(): any {
    return this.mapComponent;
  }

  /** Destroy created map */
  destroy(): void {
    if (this.mapComponent) {
      this.mapComponent.destroy();
      this.mapComponent = undefined;
    }
  }
}
