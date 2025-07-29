import { MapGLComponentFactory } from '../components/Map/MapGLComponent';
import { MapSyncServiceFactory } from '../services/MapSyncService'; 
import { BottomsheetManager } from '../services/BottomsheetManager';
import { SearchFlowManager } from '../services/SearchFlowManager';
import {
  DashboardScreenFactory,
  SuggestScreenFactory, 
  SearchResultScreenFactory,
  OrganizationScreenFactory
} from '../components/Screens';
import { MAPGL_API_KEY } from '../config/mapgl';
import { BottomsheetState, ScreenType } from '../types';

/**
 * Демонстрация интеграции MapGL с экранами приложения
 * Показывает как создать полноценное приложение с реальной картой 2GIS
 */
export class MapGLIntegrationDemo {
  private container: HTMLElement;
  private mapContainer: HTMLElement;
  private screensContainer: HTMLElement;
  
  // Карта и сервисы
  private mapComponent?: any;
  private mapSyncService?: any;
  private bottomsheetManager?: BottomsheetManager;
  private searchFlowManager?: SearchFlowManager;
  
  // Экраны
  private screens: Map<ScreenType, any> = new Map();
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.mapContainer = document.createElement('div');
    this.screensContainer = document.createElement('div');
    
    this.initialize();
  }

  /**
   * Инициализация демо
   */
  private async initialize(): Promise<void> {
    console.log('🚀 Инициализация MapGL Integration Demo...');
    
    try {
      // Настраиваем контейнеры
      this.setupContainers();
      
      // Создаем карту
      await this.createMap();
      
      // Создаем сервисы
      this.createServices();
      
      // Создаем экраны
      this.createScreens();
      
      // Настраиваем навигацию
      this.setupNavigation();
      
      // Показываем дашборд
      this.showScreen(ScreenType.DASHBOARD);
      
      console.log('✅ MapGL Integration Demo готов!');
      
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error);
      this.showError(error as Error);
    }
  }

  /**
   * Настройка контейнеров
   */
  private setupContainers(): void {
    // Основная разметка
    Object.assign(this.container.style, {
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    // Контейнер карты (фон)
    Object.assign(this.mapContainer.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '1'
    });

    // Контейнер экранов (поверх карты)
    Object.assign(this.screensContainer.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '2',
      pointerEvents: 'none' // Пропускаем события к карте
    });

    // Добавляем в DOM
    this.container.appendChild(this.mapContainer);
    this.container.appendChild(this.screensContainer);

    // Создаем контейнеры для каждого экрана
    Object.values(ScreenType).forEach(screenType => {
      const screenContainer = document.createElement('div');
      screenContainer.id = `screen-${screenType}`;
      screenContainer.style.display = 'none';
      screenContainer.style.width = '100%';
      screenContainer.style.height = '100%';
      screenContainer.style.pointerEvents = 'auto'; // Включаем события для экранов
      
      this.screensContainer.appendChild(screenContainer);
    });

    console.log('📦 Контейнеры настроены');
  }

  /**
   * Создание карты
   */
  private async createMap(): Promise<void> {
    console.log('🗺️ Создание карты MapGL...');
    
    this.mapComponent = MapGLComponentFactory.createDefault(
      this.mapContainer,
      MAPGL_API_KEY
    );

    // Ждем инициализации карты
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Карта MapGL создана');
  }

  /**
   * Создание сервисов
   */
  private createServices(): void {
    console.log('⚙️ Создание сервисов...');
    
    // Создаем ref для карты
    const mapRef = { current: this.mapComponent };
    
    // Создаем сервис синхронизации карты
    this.mapSyncService = MapSyncServiceFactory.createDefault(mapRef);
    
    // Создаем менеджер шторки
    this.bottomsheetManager = new BottomsheetManager(
      {
        state: BottomsheetState.DEFAULT,
        snapPoints: [0.2, 0.5, 0.9, 0.95],
        isDraggable: true,
        hasScrollableContent: false
      },
             {
         onStateChange: (stateData) => {
           console.log('Bottomsheet state changed:', stateData);
           // Синхронизируем с картой
           if (this.mapSyncService && this.bottomsheetManager) {
             const currentState = this.bottomsheetManager.getCurrentState();
             this.mapSyncService.adjustMapViewport(currentState.height);
           }
         }
       }
    );
    
    // Создаем менеджер поискового флоу
    this.searchFlowManager = new SearchFlowManager(
      ScreenType.DASHBOARD,
      {
        onScreenChange: (newScreen, oldScreen) => {
          console.log(`Navigation: ${oldScreen} → ${newScreen}`);
          this.showScreen(newScreen);
        }
      }
    );
    
    console.log('✅ Сервисы созданы');
  }

  /**
   * Создание экранов
   */
  private createScreens(): void {
    console.log('📱 Создание экранов...');
    
    if (!this.searchFlowManager || !this.bottomsheetManager || !this.mapSyncService) {
      throw new Error('Сервисы не инициализированы');
    }

    // Dashboard Screen  
    const dashboardContainer = document.getElementById(`screen-${ScreenType.DASHBOARD}`)!;
    const dashboardScreen = new (DashboardScreenFactory as any).create({
      container: dashboardContainer,
      searchFlowManager: this.searchFlowManager,
      bottomsheetManager: this.bottomsheetManager,
      mapSyncService: this.mapSyncService
    });
    this.screens.set(ScreenType.DASHBOARD, dashboardScreen);

    // Suggest Screen
    const suggestContainer = document.getElementById(`screen-${ScreenType.SUGGEST}`)!;
    const suggestScreen = new (SuggestScreenFactory as any).create({
      container: suggestContainer,
      searchFlowManager: this.searchFlowManager,
      bottomsheetManager: this.bottomsheetManager,
      mapSyncService: this.mapSyncService
    });
    this.screens.set(ScreenType.SUGGEST, suggestScreen);

    // Search Result Screen
    const searchResultContainer = document.getElementById(`screen-${ScreenType.SEARCH_RESULT}`)!;
    const searchResultScreen = new (SearchResultScreenFactory as any).create({
      container: searchResultContainer,  
      searchFlowManager: this.searchFlowManager,
      bottomsheetManager: this.bottomsheetManager,
      searchQuery: 'тестовый запрос',
      mapSyncService: this.mapSyncService
    });
    this.screens.set(ScreenType.SEARCH_RESULT, searchResultScreen);

    // Organization Screen
    const organizationContainer = document.getElementById(`screen-${ScreenType.ORGANIZATION}`)!;
    const mockOrganization = {
      id: '1',
      name: 'Кофе Хауз',
      category: 'Кофейня',
      address: 'Невский проспект, 28',
      coordinates: [37.620393, 55.75396] as [number, number],
      rating: 4.2,
      reviewsCount: 126,
      distance: 450,
      phone: '+7 (812) 123-45-67',
      workingHours: '8:00 - 22:00',
      isAdvertiser: true
    };
    
    const organizationScreen = new (OrganizationScreenFactory as any).create({
      container: organizationContainer,
      searchFlowManager: this.searchFlowManager,
      bottomsheetManager: this.bottomsheetManager,
      organization: mockOrganization,
      mapSyncService: this.mapSyncService
    });
    this.screens.set(ScreenType.ORGANIZATION, organizationScreen);

    console.log('✅ Экраны созданы:', this.screens.size);
  }

  /**
   * Настройка навигации
   */
  private setupNavigation(): void {
    console.log('🧭 Настройка навигации...');
    
    // Добавляем кнопки навигации для демо
    this.createNavigationControls();
  }

  /**
   * Создание элементов управления для демо
   */
  private createNavigationControls(): void {
    const controlsContainer = document.createElement('div');
    Object.assign(controlsContainer.style, {
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: '1000',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    });

    // Кнопки для переключения экранов
    const screens = [
      { type: ScreenType.DASHBOARD, label: '🏠 Dashboard' },
      { type: ScreenType.SUGGEST, label: '🔍 Suggest' },
      { type: ScreenType.SEARCH_RESULT, label: '📋 Results' },
      { type: ScreenType.ORGANIZATION, label: '🏢 Organization' }
    ];

    screens.forEach(screen => {
      const button = document.createElement('button');
      button.textContent = screen.label;
      Object.assign(button.style, {
        padding: '8px 12px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: '#1976D2',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s ease'
      });

      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#1565C0';
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#1976D2';
      });

      button.addEventListener('click', () => {
        this.showScreen(screen.type);
      });

      controlsContainer.appendChild(button);
    });

    // Информационная панель
    const infoPanel = document.createElement('div');
    Object.assign(infoPanel.style, {
      padding: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '8px',
      fontSize: '12px',
      marginTop: '10px',
      minWidth: '200px'
    });

    infoPanel.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px;">
        🗺️ MapGL Integration Demo
      </div>
      <div style="color: #666; line-height: 1.4;">
        • Реальная карта 2GIS<br>
        • Полная интеграция экранов<br>
        • Синхронизация с шторкой<br>
        • API Key: активен ✅
      </div>
    `;

    controlsContainer.appendChild(infoPanel);
    this.container.appendChild(controlsContainer);
  }

  /**
   * Показ экрана
   */
  private showScreen(screenType: ScreenType): void {
    console.log(`👁️ Показ экрана: ${screenType}`);

    // Скрываем все экраны
    this.screens.forEach((screen, type) => {
      const container = document.getElementById(`screen-${type}`);
      if (container) {
        container.style.display = 'none';
      }
      screen.deactivate?.();
    });

    // Показываем нужный экран
    const targetScreen = this.screens.get(screenType);
    const targetContainer = document.getElementById(`screen-${screenType}`);
    
    if (targetScreen && targetContainer) {
      targetContainer.style.display = 'block';
      targetScreen.activate?.();
      
      // Обновляем состояние менеджера флоу
      if (this.searchFlowManager) {
        this.searchFlowManager.currentScreen = screenType;
      }
    }
  }

  /**
   * Показ ошибки
   */
  private showError(error: Error): void {
    const errorContainer = document.createElement('div');
    Object.assign(errorContainer.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      textAlign: 'center',
      maxWidth: '400px',
      zIndex: '9999'
    });

    errorContainer.innerHTML = `
      <div style="color: #FF5722; font-size: 48px; margin-bottom: 16px;">❌</div>
      <h3 style="margin: 0 0 12px 0; color: #333;">Ошибка инициализации</h3>
      <p style="margin: 0 0 16px 0; color: #666;">${error.message}</p>
      <button onclick="window.location.reload()" style="
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        background: #1976D2;
        color: white;
        cursor: pointer;
      ">
        Перезагрузить
      </button>
    `;

    this.container.appendChild(errorContainer);
  }

  /**
   * Получение состояния демо
   */
  public getState(): any {
    return {
      currentScreen: this.searchFlowManager?.currentScreen,
      mapState: this.mapComponent?.getState(),
      bottomsheetState: this.bottomsheetManager?.getCurrentState(),
      screensCount: this.screens.size
    };
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    console.log('🧹 Очистка MapGL Integration Demo');
    
    // Очищаем экраны
    this.screens.forEach(screen => {
      screen.destroy?.();
    });
    this.screens.clear();

    // Очищаем карту
    this.mapComponent?.destroy();

    // Очищаем контейнер
    this.container.innerHTML = '';
  }
}

/**
 * Фабрика для создания демо
 */
export class MapGLIntegrationDemoFactory {
  /**
   * Создание демо интеграции
   */
  static create(container: HTMLElement): MapGLIntegrationDemo {
    return new MapGLIntegrationDemo(container);
  }

  /**
   * Быстрый запуск демо
   */
  static async quickStart(containerId: string = 'mapgl-demo'): Promise<MapGLIntegrationDemo> {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Контейнер с ID "${containerId}" не найден`);
    }

    const demo = new MapGLIntegrationDemo(container);
    
    // Ждем инициализации
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🎉 MapGL Integration Demo запущен успешно!');
    return demo;
  }
}

// Экспорт для глобального использования
declare global {
  interface Window {
    MapGLIntegrationDemo?: typeof MapGLIntegrationDemo;
    startMapGLDemo?: (containerId?: string) => Promise<MapGLIntegrationDemo>;
  }
}

// Добавляем в window для простого запуска
if (typeof window !== 'undefined') {
  window.MapGLIntegrationDemo = MapGLIntegrationDemo;
  window.startMapGLDemo = MapGLIntegrationDemoFactory.quickStart;
} 