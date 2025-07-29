/**
 * 2GIS MapGL Integration Component - Fixed Version
 * Provides map functionality for Dashboard and other screens
 */

import { MAPGL_CONFIG, getDeviceOptimizedConfig } from '../../config/mapgl';

// Типы для MapGL API
interface MapGLMap {
  setCenter: (coordinates: [number, number]) => void;
  setZoom: (zoom: number) => void;
  getCenter: () => { lng: number; lat: number };
  getZoom: () => number;
  fitBounds: (bounds: [[number, number], [number, number]], options?: any) => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
  destroy?: () => void;
  remove?: () => void;
}

interface MapGLMarker {
  setOptions: (options: any) => void;
  addTo: (map: MapGLMap) => void;
  remove: () => void;
  on: (event: string, callback: Function) => void;
}

declare global {
  interface Window {
    mapgl?: {
      Map: new (container: string | HTMLElement, options: any) => MapGLMap;
      Marker: new (options: any) => MapGLMarker;
    };
  }
}

export interface MapGLComponentProps {
  /** Container element for the map */
  container: HTMLElement;
  /** Initial center coordinates [lng, lat] */
  center?: [number, number];
  /** Initial zoom level */
  zoom?: number;
  /** Map style configuration */
  style?: string;
  /** Custom configuration override */
  config?: Partial<typeof MAPGL_CONFIG>;
  /** Event callbacks */
  onLoad?: (map: MapGLMap) => void;
  onError?: (error: Error) => void;
  onCenterChange?: (center: [number, number]) => void;
  onZoomChange?: (zoom: number) => void;
}

export interface MarkerOptions {
  coordinates: [number, number];
  color?: string;
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  clickable?: boolean;
  onClick?: () => void;
}

/**
 * MapGL Component for 2GIS integration - Fixed Version
 */
export class MapGLComponent {
  private container: HTMLElement;
  private props: MapGLComponentProps;
  private map: MapGLMap | undefined;
  private markers: Map<string, MapGLMarker> = new Map();
  private isLoaded: boolean = false;
  private loadPromise?: Promise<void>;

  constructor(props: MapGLComponentProps) {
    this.props = props;
    this.container = props.container;

    this.initialize();
  }

  /**
   * Initialize the map component
   */
  private async initialize(): Promise<void> {
    try {
      // Setup container
      this.setupContainer();

      // Load MapGL API
      await this.waitForMapGL();

      // Create map instance
      await this.createMap();
    } catch (error) {
      console.error('Failed to initialize MapGL:', error);
      this.props.onError?.(error as Error);
    }
  }

  /**
   * Setup the container element
   */
  private setupContainer(): void {
    // Создаем уникальный ID для контейнера карты
    const mapContainerId = `mapgl-container-${Math.random().toString(36).substr(2, 9)}`;

    this.container.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    `;

    this.container.id = mapContainerId;

    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'mapgl-loading';
    loadingDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      font-family: system-ui, sans-serif;
      color: #333;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    `;

    loadingDiv.innerHTML = `
      <div style="width: 30px; height: 30px; border: 3px solid #e0e0e0; border-top: 3px solid #1976D2; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px;"></div>
      <div style="font-weight: 600; margin-bottom: 4px;">Загрузка карты 2GIS</div>
      <div style="font-size: 12px; color: #666;">MapGL API v1</div>
    `;

    // Добавляем анимацию спиннера
    if (!document.getElementById('mapgl-spinner-style')) {
      const style = document.createElement('style');
      style.id = 'mapgl-spinner-style';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    this.container.appendChild(loadingDiv);
  }

  /**
   * Wait for MapGL API to load - Fixed Version
   */
  private async waitForMapGL(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 10 секунд

      const checkMapGL = () => {
        attempts++;

        if (window.mapgl && window.mapgl.Map) {
          console.log(`✅ MapGL API v1 загружен (попытка ${attempts})`);
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(
            new Error(
              'MapGL API v1 не загрузился за отведенное время. Проверьте подключение к интернету и доступность 2GIS API.'
            )
          );
        } else {
          console.log(`⏳ Ожидание MapGL API... (попытка ${attempts}/${maxAttempts})`);
          setTimeout(checkMapGL, 200);
        }
      };

      checkMapGL();
    });

    return this.loadPromise;
  }

  /**
   * Create the map instance - Fixed Version
   */
  private async createMap(): Promise<void> {
    if (!window.mapgl) {
      throw new Error('MapGL API недоступен');
    }

    // Get optimized config for device
    const config = getDeviceOptimizedConfig();
    const mergedConfig = { ...config, ...this.props.config };

    // Map configuration - правильная согласно документации 2GIS
    const mapConfig = {
      center: this.props.center || mergedConfig.defaultCenter,
      zoom: this.props.zoom || mergedConfig.defaultZoom,
      key: 'bfa6ee5b-5e88-44f0-b4ad-394e819f26fc', // API ключ в конфигурации, не в URL
    };

    try {
      console.log('Создание карты с конфигурацией:', mapConfig);

      // Создаем карту - используем ID контейнера, не элемент
      this.map = new window.mapgl.Map(this.container.id, mapConfig);

      // Ждем события загрузки стиля карты согласно документации 2GIS
      await new Promise<void>(resolve => {
        let resolved = false;

        this.map!.on('styleload', () => {
          if (!resolved) {
            resolved = true;
            console.log('✅ Стиль карты загружен');
            resolve();
          }
        });

        // Таймаут на случай если styleload не сработает
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.warn('⚠️ Styleload не сработал, продолжаем...');
            resolve();
          }
        }, 5000);
      });

      // Remove loading indicator
      const loading = this.container.querySelector('#mapgl-loading');
      if (loading) {
        loading.remove();
      }

      // Setup event listeners
      this.setupEventListeners();

      // Mark as loaded
      this.isLoaded = true;

      // Notify parent
      this.props.onLoad?.(this.map);

      console.log('✅ MapGL карта успешно создана');
    } catch (error) {
      console.error('Failed to create map:', error);
      this.showError('Не удалось создать карту 2GIS');
      this.props.onError?.(error as Error);
    }
  }

  /**
   * Setup map event listeners
   */
  private setupEventListeners(): void {
    if (!this.map) return;

    // Center change
    this.map.on('move', () => {
      if (this.map) {
        const center = this.map.getCenter();
        this.props.onCenterChange?.([center.lng, center.lat]);
      }
    });

    // Zoom change
    this.map.on('zoom', () => {
      if (this.map) {
        const zoom = this.map.getZoom();
        this.props.onZoomChange?.(zoom);
      }
    });

    // Click events
    this.map.on('click', (event: any) => {
      if (event.lngLat) {
        console.log('Map clicked:', event.lngLat);
      }
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(245, 55, 60, 0.9);
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      text-align: center;
      z-index: 1000;
      max-width: 300px;
    `;

    errorDiv.innerHTML = `
      <div style="margin-bottom: 12px; font-weight: 600;">❌ ${message}</div>
      <div style="font-size: 14px; opacity: 0.9;">Проверьте подключение к интернету</div>
    `;

    // Remove loading indicator
    const loading = this.container.querySelector('#mapgl-loading');
    if (loading) {
      loading.remove();
    }

    this.container.appendChild(errorDiv);
  }

  /**
   * Add marker to the map - Fixed Version
   */
  public addMarker(id: string, options: MarkerOptions): void {
    if (!this.map || !window.mapgl) return;

    try {
      // Правильное создание маркера согласно API 2GIS
      const marker = new window.mapgl.Marker({
        coordinates: options.coordinates, // [lng, lat]
        color: options.color || '#1976D2',
      });

      // Добавляем обработчик клика если нужен
      if (options.onClick && options.clickable !== false) {
        marker.on('click', options.onClick);
      }

      // Добавляем маркер на карту
      marker.addTo(this.map);
      this.markers.set(id, marker);

      console.log(`✅ Маркер "${id}" добавлен`);
    } catch (error) {
      console.error('Failed to add marker:', error);
    }
  }

  /**
   * Remove marker from the map
   */
  public removeMarker(id: string): void {
    const marker = this.markers.get(id);
    if (marker) {
      marker.remove();
      this.markers.delete(id);
    }
  }

  /**
   * Clear all markers
   */
  public clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();
  }

  /**
   * Set map center
   */
  public setCenter(coordinates: [number, number]): void {
    if (this.map) {
      this.map.setCenter(coordinates);
    }
  }

  /**
   * Set map zoom
   */
  public setZoom(zoom: number): void {
    if (this.map) {
      this.map.setZoom(zoom);
    }
  }

  /**
   * Get current map center
   */
  public getCenter(): [number, number] | null {
    if (this.map) {
      const center = this.map.getCenter();
      return [center.lng, center.lat];
    }
    return null;
  }

  /**
   * Get current map zoom
   */
  public getZoom(): number | null {
    return this.map ? this.map.getZoom() : null;
  }

  /**
   * Fit map to bounds
   */
  public fitBounds(bounds: [[number, number], [number, number]], options?: any): void {
    if (this.map) {
      this.map.fitBounds(bounds, options);
    }
  }

  /**
   * Resize map (call after container size change)
   */
  public resize(): void {
    // MapGL автоматически подстраивается под размер контейнера
    console.log('Map resize requested');
  }

  /**
   * Check if map is loaded
   */
  public isMapLoaded(): boolean {
    return this.isLoaded && Boolean(this.map);
  }

  /**
   * Get map instance
   */
  public getMap(): MapGLMap | undefined {
    return this.map;
  }

  /**
   * Destroy the component
   */
  public destroy(): void {
    // Remove all markers
    this.clearMarkers();

    // Destroy map
    if (this.map) {
      if (this.map.destroy) {
        this.map.destroy();
      } else if (this.map.remove) {
        this.map.remove();
      }
      this.map = undefined;
    }

    // Clear container
    this.container.innerHTML = '';

    this.isLoaded = false;
  }
}

/**
 * Factory for creating MapGL components
 */
export class MapGLComponentFactory {
  /**
   * Create a new MapGL component
   */
  static create(props: MapGLComponentProps): MapGLComponent {
    return new MapGLComponent(props);
  }

  /**
   * Create with default Dashboard configuration
   */
  static createForDashboard(container: HTMLElement): MapGLComponent {
    return new MapGLComponent({
      container,
      center: [37.620393, 55.75396], // Moscow
      zoom: 12,
      onLoad: map => {
        console.log('Dashboard map loaded:', map);
      },
      onError: error => {
        console.error('Dashboard map error:', error);
      },
    });
  }
}

// Export alias for backward compatibility
export { MapGLComponent as MapGLService };
