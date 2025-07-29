/**
 * Main entry point for 2GIS Web Prototype
 * Unified dashboard application with proper scroll behavior
 */

console.log('🔧 Loading main.ts module...');

import './styles/base.css';
import './styles/dashboard.css';
import './styles/demo-controls.css';

console.log('🎨 Styles loaded');

import { BottomsheetState, BottomsheetConfig } from './types/bottomsheet';
import { BottomsheetManager } from './services/BottomsheetManager';
import { BottomsheetContainer } from './components/Bottomsheet/BottomsheetContainer';

console.log('📦 Components loaded');

/**
 * Application version
 */
export const APP_VERSION = '1.0.0';

/**
 * Main Dashboard Application Class
 */
class DashboardApp {
  private container: HTMLElement;
  private bottomsheetContainer?: BottomsheetContainer;
  private mapComponent: any = null;
  private markers = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async initialize(): Promise<void> {
    try {
      console.log(`🚀 2GIS Dashboard v${APP_VERSION} starting...`);
      
      console.log('📦 Step 1: Setting up container...');
      this.setupContainer();
      
      console.log('🗺️ Step 2: Initializing map...');
      await this.initializeMap();
      
      console.log('📋 Step 3: Creating bottomsheet...');
      this.createBottomsheet();
      
      console.log('🎛️ Step 4: Setting up controls...');
      this.setupControls();
      
      this.updateMapStatus('✅ Приложение загружено', 'success');
      
      console.log('✅ Dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize dashboard:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
      console.error('❌ Error details:', errorMessage);
      console.error('❌ Error stack:', errorStack);
      this.updateMapStatus('❌ Ошибка инициализации', 'error');
      
      // Show error in UI
      this.container.innerHTML = `<div style="padding: 20px; background: #ffe6e6; color: #d00; border-radius: 8px; margin: 20px;">
        <h2>❌ Ошибка инициализации</h2>
        <p><strong>Ошибка:</strong> ${errorMessage}</p>
        <details><summary>Подробности</summary><pre>${errorStack}</pre></details>
      </div>`;
      
      throw error;
    }
  }

  private setupContainer(): void {
    this.container.className = 'dashboard-screen';
    this.container.style.cssText = `
      width: 100%;
      max-width: 400px;
      height: 100vh;
      background: #F1F1F1;
      position: relative;
      overflow: hidden;
      margin: 0 auto;
    `;
  }

  private async initializeMap(): Promise<void> {
    const mapContainer = document.createElement('div');
    mapContainer.className = 'dashboard-map';
    mapContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      background: linear-gradient(45deg, #e8f4f0 0%, #f0f8f4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    this.container.appendChild(mapContainer);

    try {
      this.updateMapStatus('Загрузка MapGL...', 'loading');
      await this.waitForMapGL();
      await this.createRealMap(mapContainer);
      this.updateMapStatus('✅ Карта 2GIS загружена', 'success');
    } catch (error) {
      console.error('Map loading error:', error);
      this.updateMapStatus('❌ Ошибка загрузки карты', 'error');
      this.createFallbackMap(mapContainer);
    }
  }

  private async waitForMapGL(): Promise<any> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkMapGL = () => {
        attempts++;
        if ((window as any).mapgl && (window as any).mapgl.Map) {
          console.log(`✅ MapGL API загружен (попытка ${attempts})`);
          resolve((window as any).mapgl);
        } else if (attempts >= maxAttempts) {
          reject(new Error('MapGL API не загрузился'));
        } else {
          setTimeout(checkMapGL, 200);
        }
      };
      checkMapGL();
    });
  }

  private async createRealMap(container: HTMLElement): Promise<void> {
    const mapId = `mapgl-container-${Date.now()}`;
    container.id = mapId;

    this.mapComponent = new (window as any).mapgl.Map(mapId, {
      center: [37.620393, 55.75396],
      zoom: 12,
      key: 'bfa6ee5b-5e88-44f0-b4ad-394e819f26fc'
    });

    await new Promise<void>((resolve) => {
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
      this.updateMapStatus(`Клик: ${event.lngLat.lng.toFixed(4)}, ${event.lngLat.lat.toFixed(4)}`, 'info');
      this.addTemporaryMarker([event.lngLat.lng, event.lngLat.lat]);
    });

    this.addTestMarkers();
  }

  private createFallbackMap(container: HTMLElement): void {
    container.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        <div style="font-size: 24px; margin-bottom: 8px;">🗺️</div>
        <div style="font-weight: 600;">Демо карта</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">MapGL недоступен</div>
      </div>
    `;
  }

  private addTestMarkers(): void {
    if (!this.mapComponent || !(window as any).mapgl) return;

    const testPins = [
      { id: 'kremlin', coordinates: [37.617734, 55.752023], title: 'Кремль', color: '#1976D2' },
      { id: 'red_square', coordinates: [37.622504, 55.753215], title: 'Красная площадь', color: '#FF5722' },
      { id: 'gum', coordinates: [37.618423, 55.751244], title: 'ГУМ', color: '#4CAF50' }
    ];

    testPins.forEach(pin => {
      try {
        const marker = new (window as any).mapgl.Marker({
          coordinates: pin.coordinates,
          color: pin.color
        });
        marker.on('click', () => this.updateMapStatus(`Маркер: ${pin.title}`, 'info'));
        marker.addTo(this.mapComponent);
        this.markers.set(pin.id, marker);
      } catch (error) {
        console.error(`Ошибка добавления маркера ${pin.title}:`, error);
      }
    });
  }

  private addTemporaryMarker(coordinates: [number, number]): void {
    if (!this.mapComponent || !(window as any).mapgl) return;
    try {
      const marker = new (window as any).mapgl.Marker({
        coordinates: coordinates,
        color: '#9C27B0'
      });
      marker.addTo(this.mapComponent);
      setTimeout(() => marker.remove(), 3000);
    } catch (error) {
      console.error('Ошибка добавления временного маркера:', error);
    }
  }

  private createBottomsheet(): void {
    const bottomsheetElement = document.createElement('div');
    bottomsheetElement.className = 'dashboard-bottomsheet bs-default';
    
    // Создаем заголовок с драггером
    this.createBottomsheetHeader(bottomsheetElement);
    
    this.container.appendChild(bottomsheetElement);

    // Инициализируем BottomsheetContainer с новой функциональностью скролла
    const config: BottomsheetConfig = {
      state: BottomsheetState.DEFAULT,
      snapPoints: [0.2, 0.55, 0.9, 0.95],
      isDraggable: true,
      hasScrollableContent: true
    };

    const events = {
      onStateChange: (fromState: BottomsheetState, toState: BottomsheetState) => {
        this.updateDebugInfo();
        this.updateMapStatus(`Состояние: ${fromState} → ${toState}`, 'info');
        console.log(`📱 Bottomsheet: ${fromState} → ${toState}`);
      },
      onDragStart: (height: number) => {
        console.log(`🖱️ Drag start: ${height}px`);
      },
      onDragEnd: (startHeight: number, endHeight: number) => {
        console.log(`🖱️ Drag end: ${startHeight}px → ${endHeight}px`);
      }
    };

    this.bottomsheetContainer = new BottomsheetContainer(bottomsheetElement, {
      config,
      events,
      screenHeight: window.innerHeight
    });

    // Добавляем контент
    this.addBottomsheetContent();
  }

  private createBottomsheetHeader(container: HTMLElement): void {
    const header = document.createElement('div');
    header.className = 'bottomsheet-header';
    
    // Драггер
    const dragger = document.createElement('div');
    dragger.className = 'dragger';
    const draggerHandle = document.createElement('div');
    draggerHandle.className = 'dragger-handle';
    dragger.appendChild(draggerHandle);
    
    // Поисковая строка
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-nav-bar';
    searchContainer.innerHTML = `
      <div class="search-nav-content">
        <div class="search-field-container">
          <div class="search-field">
            <div class="search-icon">
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M8.5 15.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM15.5 15.5l-3.87-3.87" 
                      stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="search-placeholder">Поиск в Москве</div>
          </div>
        </div>
      </div>
    `;
    
    header.appendChild(dragger);
    header.appendChild(searchContainer);
    container.appendChild(header);
  }

  private addBottomsheetContent(): void {
    if (!this.bottomsheetContainer) return;

    const contentElements = [
      this.createButtonsRow(),
      this.createStoriesSection(),
      this.createSectionHeader('Советы к месту'),
      this.createContentGrid(),
      this.createSectionHeader('Популярные категории'),
      this.createCategoriesGrid(),
      this.createBanner(),
      this.createSectionHeader('Рекомендации'),
      this.createRecommendationsSection(),
      this.createSectionHeader('Обратная связь'),
      this.createFeedbackSection(),
      this.createMenuSection(),
      this.createBottomSpacing()
    ];

    this.bottomsheetContainer.setContent(contentElements);
  }

  private createSectionHeader(title: string): HTMLElement {
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
      <h3 class="section-title">${title}</h3>
    `;
    return header;
  }

  private createBanner(): HTMLElement {
    const banner = document.createElement('div');
    banner.className = 'banner-small';
    banner.innerHTML = `
      <div class="banner-logo" style="background: linear-gradient(45deg, #FF9800, #FFC107); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">🍣</div>
      <div class="banner-content">
        <div class="banner-title">Суши Маке</div>
        <div class="banner-description">Подарок «Филадельфия с лососем» за первый заказ по промокоду «FILA2»</div>
        <div style="margin-top: 8px;">
          <button class="smart-button" style="background: #1BA136; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">Получить подарок</button>
        </div>
      </div>
    `;
    return banner;
  }

  private createFeedbackSection(): HTMLElement {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-section';
    feedback.style.cssText = `
      padding: 16px;
      margin: 16px;
      background: #f8f8f8;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
    `;
    feedback.innerHTML = `
      <div style="width: 64px; height: 64px; background: linear-gradient(45deg, #4CAF50, #8BC34A); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">😊</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 16px; color: #333; margin-bottom: 8px;">Вам нравится 2ГИС?</div>
        <div style="display: flex; gap: 8px;">
          <button class="smart-button" style="background: #1BA136; color: white; border: none; padding: 6px 16px; border-radius: 6px;">Да</button>
          <button class="smart-button" style="background: #f0f0f0; color: #333; border: none; padding: 6px 16px; border-radius: 6px;">Нет</button>
        </div>
      </div>
    `;
    return feedback;
  }

  private createMenuSection(): HTMLElement {
    const menu = document.createElement('div');
    menu.className = 'menu-section';
    menu.style.cssText = `
      padding: 0 16px;
      margin-bottom: 80px;
    `;
    
    const menuItems = [
      { icon: '💬', title: 'Обратная связь' },
      { icon: '🏢', title: 'Добавить организацию' },
      { icon: '📢', title: 'Разместить рекламу' }
    ];

    const menuHTML = menuItems.map(item => `
      <div class="meta-item" style="margin-bottom: 1px;">
        <div class="meta-item-content">
          <div class="meta-item-title">${item.title}</div>
        </div>
        <div class="meta-item-icon" style="font-size: 20px;">${item.icon}</div>
      </div>
    `).join('');

    menu.innerHTML = menuHTML;
    return menu;
  }

  private createCategoriesGrid(): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'categories-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 0 16px;
      margin-bottom: 16px;
    `;

    const categories = [
      { icon: '🍕', title: 'Пицца', subtitle: '156 заведений' },
      { icon: '☕', title: 'Кофе', subtitle: '234 кофейни' },
      { icon: '🏪', title: 'Магазины', subtitle: '1,243 места' },
      { icon: '⛽', title: 'АЗС', subtitle: '89 станций' },
      { icon: '🏥', title: 'Медицина', subtitle: '567 клиник' },
      { icon: '🎓', title: 'Образование', subtitle: '123 учреждения' }
    ];

    const categoriesHTML = categories.map(cat => `
      <div class="meta-item">
        <div class="meta-item-content">
          <div class="meta-item-title">${cat.title}</div>
          <div class="meta-item-subtitle">${cat.subtitle}</div>
        </div>
        <div class="meta-item-icon" style="font-size: 24px;">${cat.icon}</div>
      </div>
    `).join('');

    grid.innerHTML = categoriesHTML;
    return grid;
  }

  private createRecommendationsSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'recommendations-section';
    section.style.cssText = `
      padding: 0 16px;
      margin-bottom: 24px;
    `;

    const recommendations = [
      {
        title: 'Кофе Хауз',
        subtitle: 'Кофейня',
        rating: '4.5',
        distance: '200 м',
        isAd: false
      },
      {
        title: 'Burger King',
        subtitle: 'Быстрое питание • Реклама',
        rating: '4.2',
        distance: '350 м',
        isAd: true
      },
      {
        title: 'Пятёрочка',
        subtitle: 'Супермаркет',
        rating: '4.1',
        distance: '120 м',
        isAd: false
      }
    ];

    const recHTML = recommendations.map(rec => `
      <div class="rd-block" style="margin-bottom: 12px; ${rec.isAd ? 'background: rgba(255, 152, 0, 0.05);' : ''}">
        <div class="rd-gallery">
          <div class="rd-main-photo" style="width: 80px; height: 80px; background: linear-gradient(45deg, ${rec.isAd ? '#FF9800, #FFC107' : '#4CAF50, #8BC34A'}); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border-radius: 12px; font-size: 12px;">
            ${rec.isAd ? 'AD' : 'ФОТО'}
          </div>
        </div>
        <div class="rd-content" style="flex: 1; padding-left: 12px;">
          <div class="rd-header">
            <div class="rd-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${rec.title}</div>
            <div class="rd-subtitle" style="font-size: 14px; color: #666; margin-bottom: 4px;">${rec.subtitle}</div>
            <div class="rd-meta" style="display: flex; gap: 12px; font-size: 14px; color: #666;">
              <span>⭐ ${rec.rating}</span>
              <span>${rec.distance}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    section.innerHTML = recHTML;
    return section;
  }

  private createBottomSpacing(): HTMLElement {
    const spacing = document.createElement('div');
    spacing.style.cssText = `
      height: 100px;
      background: linear-gradient(to bottom, transparent, rgba(241, 241, 241, 0.1));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 14px;
    `;
    spacing.innerHTML = `
      <div style="text-align: center;">
        <div style="margin-bottom: 8px;">🎯</div>
        <div>Тестируйте скролл в разных состояниях шторки</div>
        <div style="font-size: 12px; margin-top: 4px;">Small/Default/Fullscreen: скролл меняет высоту</div>
        <div style="font-size: 12px;">Fullscreen+Scroll: скролл внутри контента</div>
      </div>
    `;
    return spacing;
  }

  private createButtonsRow(): HTMLElement {
    const buttonsRow = document.createElement('div');
    buttonsRow.className = 'buttons-row';
    buttonsRow.innerHTML = `
      <div class="buttons-row-mask">
        <div class="buttons-row-container">
          <button class="smart-button" onclick="console.log('Закладки')">
            <div class="smart-button-icon">📚</div>
          </button>
          <button class="smart-button" onclick="console.log('Дом')">
            <div class="smart-button-icon">🏠</div>
            <span class="smart-button-text">45 мин</span>
          </button>
          <button class="smart-button" onclick="console.log('Работа')">
            <div class="smart-button-icon">💼</div>
            <span class="smart-button-text">45 мин</span>
          </button>
          <button class="smart-button" onclick="console.log('Адрес')">
            <div class="smart-button-icon">📍</div>
            <span class="smart-button-text">Немировича-Данченко, 45</span>
          </button>
        </div>
      </div>
    `;
    return buttonsRow;
  }

  private createStoriesSection(): HTMLElement {
    const storiesSection = document.createElement('div');
    storiesSection.className = 'stories-section';
    storiesSection.innerHTML = `
      <div class="stories-container">
        <div class="story-item">
          <div class="story-cover" style="background: linear-gradient(45deg, #4CAF50, #8BC34A); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">📖</div>
        </div>
        <div class="story-item">
          <div class="story-cover" style="background: linear-gradient(45deg, #2196F3, #03DAC6); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">🎭</div>
        </div>
        <div class="story-item">
          <div class="story-cover" style="background: linear-gradient(45deg, #FF9800, #FFC107); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">🍕</div>
        </div>
        <div class="story-item">
          <div class="story-cover" style="background: linear-gradient(45deg, #E91E63, #9C27B0); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">🎵</div>
        </div>
      </div>
    `;
    return storiesSection;
  }

  private createContentGrid(): HTMLElement {
    const contentGrid = document.createElement('div');
    contentGrid.className = 'content-grid';
    contentGrid.innerHTML = `
      <div class="content-row">
        <div class="left-column">
          <div class="cover-card cover-card-big" style="background: linear-gradient(135deg, #1BA136 0%, #4CAF50 100%); position: relative; display: flex; align-items: flex-end; color: white;">
            <div class="cover-overlay">
              <div class="cover-title">Маленькие экскурсии: гуляем с «Даблби» и…</div>
              <div class="cover-subtitle">59 мест</div>
            </div>
          </div>
          <div class="meta-item">
            <div class="meta-item-content">
              <div class="meta-item-title">Вкусно позавтракать</div>
              <div class="meta-item-subtitle">Тот самый момент</div>
            </div>
            <div class="meta-item-icon">🍴</div>
          </div>
          <div class="meta-item">
            <div class="meta-item-content">
              <div class="meta-item-title">Банкоматы</div>
              <div class="meta-item-subtitle">Number</div>
            </div>
            <div class="meta-item-icon">🏧</div>
          </div>
          <div class="cover-card cover-card-small" style="background: linear-gradient(135deg, #FF5722 0%, #FF9800 100%); position: relative; display: flex; align-items: flex-end; color: white;">
            <div class="cover-overlay">
              <div class="cover-title">Товары для ремонта</div>
              <div class="cover-subtitle">13 мест</div>
            </div>
          </div>
        </div>
        <div class="right-column">
          <div class="meta-item meta-item-ad" style="background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%); position: relative;">
            <div class="meta-item-content">
              <div class="meta-item-title">Xiaomi</div>
              <div class="meta-item-subtitle">Реклама</div>
            </div>
            <div class="meta-item-icon" style="background: linear-gradient(45deg, #FF9800, #FFC107); color: white; border-radius: 8px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">📱</div>
          </div>
          <div class="meta-item">
            <div class="meta-item-content">
              <div class="meta-item-title">Школьная форма</div>
              <div class="meta-item-subtitle">112 мест</div>
            </div>
            <div class="meta-item-icon">👔</div>
          </div>
          <div class="rd-block">
            <div class="rd-gallery">
              <div class="rd-photos">
                <div class="rd-main-photo" style="background: linear-gradient(45deg, #4CAF50, #8BC34A); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border-radius: 12px;">ФОТО</div>
                <div class="rd-counter-photo" style="background: linear-gradient(45deg, #2196F3, #03DAC6); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border-radius: 12px; position: relative;">
                  <div class="rd-counter">826</div>
                </div>
              </div>
            </div>
            <div class="rd-content">
              <div class="rd-header">
                <div class="rd-title-row">
                  <div class="rd-title">Geraldine</div>
                  <div class="rd-crown">👑</div>
                </div>
                <div class="rd-subtitle">Необистро</div>
                <div class="rd-meta">
                  <div class="rd-rating">
                    <div class="rd-stars">⭐⭐⭐⭐⭐</div>
                    <div class="rd-rating-value">4.6</div>
                  </div>
                  <div class="rd-distance">1.4 км</div>
                </div>
              </div>
              <div class="rd-address">Тверская 32/12, БЦ Апельсин, 1 этаж</div>
            </div>
          </div>
          <div class="meta-item">
            <div class="meta-item-content">
              <div class="meta-item-title">Все рубрики</div>
              <div class="meta-item-subtitle">3 256 567 мест</div>
            </div>
            <div class="meta-item-icon">📋</div>
          </div>
        </div>
      </div>
    `;
    return contentGrid;
  }

  private setupControls(): void {
    // Обработчики кнопок состояний
    document.querySelectorAll('[data-state]').forEach(button => {
      button.addEventListener('click', () => {
        const state = (button as HTMLElement).dataset.state as keyof typeof BottomsheetState;
        if (state && this.bottomsheetContainer) {
          const bottomsheetState = BottomsheetState[state.toUpperCase() as keyof typeof BottomsheetState] || BottomsheetState.DEFAULT;
          this.bottomsheetContainer.snapToState(bottomsheetState);
          
          // Обновляем активную кнопку
          document.querySelectorAll('[data-state]').forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
        }
      });
    });

    // Остальные кнопки управления
    document.getElementById('btn-refresh')?.addEventListener('click', () => location.reload());
    document.getElementById('btn-toggle-debug')?.addEventListener('click', () => {
      const debugInfo = document.getElementById('debug-info');
      if (debugInfo) {
        debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
      }
    });
    document.getElementById('btn-center-moscow')?.addEventListener('click', () => {
      if (this.mapComponent && this.mapComponent.setCenter) {
        this.mapComponent.setCenter([37.620393, 55.75396]);
        this.updateMapStatus('Центрирование на Москве', 'success');
      }
    });
    document.getElementById('btn-test-markers')?.addEventListener('click', () => {
      this.testRandomMarkers();
    });
  }

  private testRandomMarkers(): void {
    if (!this.mapComponent || !(window as any).mapgl) return;
    
    for (let i = 0; i < 5; i++) {
      const coords = [
        37.620393 + (Math.random() - 0.5) * 0.02,
        55.75396 + (Math.random() - 0.5) * 0.02
      ];
      
      try {
        const marker = new (window as any).mapgl.Marker({
          coordinates: coords,
          color: '#FF9800'
        });
        marker.addTo(this.mapComponent);
        setTimeout(() => marker.remove(), 5000);
      } catch (error) {
        console.error('Ошибка добавления случайного маркера:', error);
      }
    }
    this.updateMapStatus('5 случайных маркеров добавлено', 'success');
  }

  private updateMapStatus(message: string, type: 'loading' | 'success' | 'error' | 'info' = 'info'): void {
    const statusEl = document.getElementById('map-status');
    const statusText = document.getElementById('status-text');
    
    if (statusEl && statusText) {
      statusEl.className = `map-status ${type}`;
      statusText.textContent = message;
      
      const icons: Record<string, string> = {
        loading: '⏳',
        success: '✅', 
        error: '❌',
        info: 'ℹ️'
      };
      
      const statusIcon = statusEl.querySelector('.status-icon');
      if (statusIcon) {
        statusIcon.textContent = icons[type] || 'ℹ️';
      }
      
      if (type === 'info') {
        setTimeout(() => {
          if (statusText.textContent === message) {
            statusEl.style.opacity = '0.7';
          }
        }, 3000);
      } else {
        statusEl.style.opacity = '1';
      }
    }
  }

  private updateDebugInfo(): void {
    if (!this.bottomsheetContainer) return;
    
    const currentState = this.bottomsheetContainer.getCurrentState();
    const scrollState = this.bottomsheetContainer.getScrollState();
    
    const debugState = document.getElementById('debug-state');
    const debugHeight = document.getElementById('debug-height');
    
    if (debugState) debugState.textContent = currentState.currentState;
    if (debugHeight) {
      const heightPercent = Math.round((currentState.height / window.innerHeight) * 100);
      debugHeight.textContent = `${heightPercent}% ${scrollState?.canScrollContent ? '(скролл)' : '(фикс)'}`;
    }

    // Обновляем активное состояние кнопок
    document.querySelectorAll('[data-state]').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`[data-state="${currentState.currentState.replace('_', '-')}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  public centerMoscow(): void {
    if (this.mapComponent && this.mapComponent.setCenter) {
      this.mapComponent.setCenter([37.620393, 55.75396]);
      this.updateMapStatus('Центрирование на Москве', 'success');
    }
  }
}

/**
 * Initialize application with default configuration
 */  
export async function initializeApp(container: HTMLElement): Promise<void> {
  const app = new DashboardApp(container);
  await app.initialize();
}

/**
 * Global error handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Show user-friendly error in development
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 16px;
    border-radius: 8px;
    z-index: 10000;
    max-width: 400px;
    font-family: monospace;
    font-size: 14px;
  `;
  errorDiv.textContent = `Error: ${event.reason}`;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    if (document.body.contains(errorDiv)) {
      document.body.removeChild(errorDiv);
    }
  }, 5000);
});

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