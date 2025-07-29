/**
 * Dashboard Figma Demo - Модульная архитектура
 * Демонстрация Dashboard Screen с точной структурой Figma
 */

// Mock-сервисы для демо
class MockSearchFlowManager {
    constructor() { 
        this.currentScreen = 'DASHBOARD'; 
    }
    
    goToSuggest() { 
        updateMapStatus('Переход к поиску', 'info'); 
        console.log('🔍 Search: goToSuggest');
    }
    
    goToSearchResults(query) { 
        updateMapStatus(`Поиск: ${query}`, 'info'); 
        console.log('🔍 Search results:', query);
    }
    
    updateQuery(query) {
        console.log('🔍 Query updated:', query);
    }
}

class MockBottomsheetManager {
    constructor() { 
        this.currentState = 'default'; 
    }
    
    snapToState(state) { 
        this.currentState = state;
        this.updateDebugInfo();
        console.log('📱 Bottomsheet state:', state);
    }
    
    getCurrentState() {
        return { currentState: this.currentState };
    }
    
    updateDebugInfo() {
        const debugState = document.getElementById('debug-state');
        const debugHeight = document.getElementById('debug-height');
        if (debugState) debugState.textContent = this.currentState;
        if (debugHeight) {
            const heights = { 'small': 20, 'default': 55, 'fullscreen': 90, 'fullscreen-scroll': 95 };
            debugHeight.textContent = `${heights[this.currentState] || 55}%`;
        }
    }
}

class MockMapSyncService {
    syncPinsWithContent(screen, options) {
        console.log('🗺️ Map sync:', screen, options);
    }
    
    adjustMapViewport(height) {
        console.log('🗺️ Map viewport adjust:', height);
    }
}

// Dashboard Screen с точной Figma структурой
class FigmaDashboardScreen {
    constructor(props) {
        this.props = props;
        this.element = props.container;
        this.currentState = 'default';
        this.isDragging = false;
        this.dragStartY = 0;
        this.mapComponent = null;
        this.markers = new Map();
        
        // Параметры для умного скролла
        this.wheelAccumulator = 0;
        this.wheelThreshold = 50;
        this.wheelTimeout = null;
        this.isWheelScrolling = false;
        this.currentHeight = null; // Текущая высота для плавного скролла
        
        // Параметры для touch скролла
        this.touchStartY = 0;
        this.touchCurrentY = 0;
        this.isTouchScrolling = false;
        
        this.initialize();
    }
    
    async initialize() {
        this.setupElement();
        await this.createMapContainer();
        this.createFigmaBottomsheet();
        this.setupEventListeners();
    }
    
    setupElement() {
        this.element.className = 'dashboard-screen';
        this.element.style.cssText = `
            width: 375px;
            max-width: 100%;
            height: 100vh;
            background: #F1F1F1;
            position: relative;
            overflow: hidden;
            margin: 0 auto;
        `;
    }
    
    async createMapContainer() {
        const mapContainer = document.createElement('div');
        mapContainer.className = 'dashboard-map';
        mapContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 375px;
            max-width: 100%;
            height: 100%;
            z-index: 1;
        `;
        this.element.appendChild(mapContainer);

        try {
            updateMapStatus('Ожидание MapGL API...', 'loading');
            await this.waitForMapGL();
            await this.createRealMap(mapContainer);
            updateMapStatus('✅ Карта 2GIS загружена', 'success');
            updateDebugMapInfo('loaded', [37.620393, 55.75396], 12);
        } catch (error) {
            console.error('Map loading error:', error);
            updateMapStatus('❌ Ошибка загрузки карты', 'error');
            updateDebugMapInfo('error', null, null);
            this.createFallbackMap(mapContainer);
        }
    }

    async waitForMapGL() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 30;
            
            const checkMapGL = () => {
                attempts++;
                if (window.mapgl && window.mapgl.Map) {
                    console.log(`✅ MapGL API v1 загружен (попытка ${attempts})`);
                    resolve(window.mapgl);
                } else if (attempts >= maxAttempts) {
                    reject(new Error('MapGL API v1 не загрузился'));
                } else {
                    setTimeout(checkMapGL, 200);
                }
            };
            checkMapGL();
        });
    }

    async createRealMap(container) {
        const mapId = `mapgl-container-${Date.now()}`;
        container.id = mapId;

        this.mapComponent = new window.mapgl.Map(mapId, {
            center: [37.620393, 55.75396],
            zoom: 12,
            key: 'bfa6ee5b-5e88-44f0-b4ad-394e819f26fc'
        });

        await new Promise((resolve) => {
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

        this.mapComponent.on('click', (event) => {
            updateMapStatus(`Клик: ${event.lngLat.lng.toFixed(4)}, ${event.lngLat.lat.toFixed(4)}`, 'info');
            this.addTemporaryMarker([event.lngLat.lng, event.lngLat.lat]);
        });

        this.mapComponent.on('move', () => this.updateDebugMapInfo());
        this.mapComponent.on('zoom', () => this.updateDebugMapInfo());
        this.addTestMarkers();
    }

    createFallbackMap(container) {
        container.innerHTML = `
            <div style="width: 100%; height: 100%; background: linear-gradient(45deg, #e8f4f0 0%, #f0f8f4 100%); display: flex; align-items: center; justify-content: center;">
                <div style="background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 18px; margin-bottom: 8px;">🗺️</div>
                    <div style="font-weight: 600; color: #F5373C;">MapGL Fallback</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">2GIS API недоступен</div>
                </div>
            </div>
        `;
        
        this.mapComponent = {
            setCenter: (coords) => console.log('Fallback: setCenter', coords),
            getCenter: () => ({ lng: 37.620393, lat: 55.75396 }),
            getZoom: () => 12,
            resize: () => console.log('Fallback: resize')
        };
    }

    addTestMarkers() {
        if (!this.mapComponent || !window.mapgl) return;

        const testPins = [
            { id: 'kremlin', coordinates: [37.617734, 55.752023], title: 'Кремль', color: '#1976D2' },
            { id: 'red_square', coordinates: [37.622504, 55.753215], title: 'Красная площадь', color: '#FF5722' },
            { id: 'gum', coordinates: [37.618423, 55.751244], title: 'ГУМ', color: '#4CAF50' }
        ];

        testPins.forEach(pin => {
            try {
                const marker = new window.mapgl.Marker({
                    coordinates: pin.coordinates,
                    color: pin.color
                });
                marker.on('click', () => updateMapStatus(`Маркер: ${pin.title}`, 'info'));
                marker.addTo(this.mapComponent);
                this.markers.set(pin.id, marker);
            } catch (error) {
                console.error(`Ошибка добавления маркера ${pin.title}:`, error);
            }
        });
    }

    addTemporaryMarker(coordinates) {
        if (!this.mapComponent || !window.mapgl) return;
        try {
            const marker = new window.mapgl.Marker({
                coordinates: coordinates,
                color: '#9C27B0'
            });
            marker.addTo(this.mapComponent);
            setTimeout(() => marker.remove(), 3000);
        } catch (error) {
            console.error('Ошибка добавления временного маркера:', error);
        }
    }

    testRandomMarkers() {
        if (!this.mapComponent || !window.mapgl) return;
        
        for (let i = 0; i < 5; i++) {
            const coords = [
                37.620393 + (Math.random() - 0.5) * 0.02,
                55.75396 + (Math.random() - 0.5) * 0.02
            ];
            
            try {
                const marker = new window.mapgl.Marker({
                    coordinates: coords,
                    color: '#FF9800'
                });
                marker.addTo(this.mapComponent);
                setTimeout(() => marker.remove(), 5000);
            } catch (error) {
                console.error('Ошибка добавления случайного маркера:', error);
            }
        }
        updateMapStatus('5 случайных маркеров добавлено', 'success');
    }

    updateDebugMapInfo() {
        if (this.mapComponent && this.mapComponent.getCenter) {
            const center = this.mapComponent.getCenter();
            const zoom = this.mapComponent.getZoom ? this.mapComponent.getZoom() : 12;
            updateDebugMapInfo('loaded', [center.lng, center.lat], zoom);
        }
    }
    
    // Создание шторки с точной структурой из Figma
    createFigmaBottomsheet() {
        this.bottomsheetElement = document.createElement('div');
        this.bottomsheetElement.className = 'dashboard-bottomsheet bs-default';
        this.bottomsheetElement.style.cssText = `
            display: flex;
            width: 375px;
            max-width: 100%;
            flex-direction: column;
            align-items: flex-start;
            border-radius: 16px 16px 0 0;
            background: #FFF;
            position: absolute;
            left: 0;
            bottom: 0;
            transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
            box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
            z-index: 1000;
        `;
        
        // Инициализируем текущую высоту
        const screenHeight = window.innerHeight;
        this.currentHeight = screenHeight * 0.55; // default состояние
        
        this.updateBottomsheetHeight();
        this.createFigmaHeader();
        this.createFigmaContent();
        this.element.appendChild(this.bottomsheetElement);
    }

    // Заголовок шторки - точная структура из Figma
    createFigmaHeader() {
        const header = document.createElement('div');
        header.className = 'figma-bottomsheet-header';
        
        // Драггер
        const dragger = document.createElement('div');
        dragger.className = 'figma-dragger';
        const draggerHandle = document.createElement('div');
        draggerHandle.className = 'figma-dragger-handle';
        dragger.appendChild(draggerHandle);
        
        // Навигационная панель
        const navBar = document.createElement('div');
        navBar.className = 'figma-nav-bar';
        
        const navContent = document.createElement('div');
        navContent.className = 'figma-nav-content';
        
        const searchFieldContainer = document.createElement('div');
        searchFieldContainer.className = 'figma-search-field-container';
        
        const searchField = document.createElement('div');
        searchField.className = 'figma-search-field';
        searchField.addEventListener('click', () => this.handleSearchFocus());
        
        // Иконка поиска
        const searchIcon = document.createElement('div');
        searchIcon.className = 'figma-search-icon';
        searchIcon.innerHTML = `
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M8.5 15.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM15.5 15.5l-3.87-3.87" 
                      stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // Текст поиска
        const searchText = document.createElement('div');
        searchText.className = 'figma-search-text';
        searchText.textContent = 'Поиск в Москве';
        
        // Иконка помощника - зеленый градиент как в Figma
        const assistantIcon = document.createElement('div');
        assistantIcon.className = 'figma-assistant-icon';
        assistantIcon.innerHTML = `
            <div class="assistant-avatar">AI</div>
        `;
        
        searchField.appendChild(searchIcon);
        searchField.appendChild(searchText);
        searchField.appendChild(assistantIcon);
        searchFieldContainer.appendChild(searchField);
        navContent.appendChild(searchFieldContainer);
        
        // Action Right - кнопка микрофона (как в Figma)
        const actionRight = document.createElement('div');
        actionRight.className = 'figma-action-right';
        
        const actionButton = document.createElement('button');
        actionButton.className = 'figma-action-button';
        actionButton.addEventListener('click', () => {
            updateMapStatus('Голосовой поиск', 'info');
            console.log('Voice search clicked');
        });
        
        const micIcon = document.createElement('div');
        micIcon.className = 'figma-menu-icon';
        micIcon.innerHTML = `
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                <path d="M8 12a3 3 0 0 0 3-3V3a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" stroke="#898989" stroke-width="1.5"/>
                <path d="M14 9v0a6 6 0 0 1-12 0v0M8 15v4M6 19h4" stroke="#898989" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        `;
        
        actionButton.appendChild(micIcon);
        actionRight.appendChild(actionButton);
        
        navBar.appendChild(navContent);
        navBar.appendChild(actionRight);
        
        header.appendChild(dragger);
        header.appendChild(navBar);
        this.bottomsheetElement.appendChild(header);
    }

    // Контент шторки - точная структура из Figma
    createFigmaContent() {
        const content = document.createElement('div');
        content.className = 'dashboard-content';
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            align-self: stretch;
            position: relative;
            overflow-y: hidden;
            overflow-x: hidden;
            flex: 1;
            min-height: 0;
        `;
        
        // Button Row с точной структурой
        this.createFigmaButtonsRow(content);
        
        // Stories с размерами 96x112
        this.createFigmaStories(content);
        
        // Section Header "Советы к месту"
        this.createSectionHeader(content, 'Советы к месту');
        
        // Content Grid - единая секция без дублирования
        this.createFigmaContentGrid(content);
        
        // Banner
        this.createBanner(content);
        
        // Feedback Section
        this.createFeedbackSection(content);
        
        // Menu Section 
        this.createMenuSection(content);
        
        this.bottomsheetElement.appendChild(content);
    }

    // Section Header
    createSectionHeader(container, title) {
        const header = document.createElement('div');
        header.className = 'figma-section-header';
        header.style.cssText = `
            display: flex;
            padding: 16px 16px 8px 16px;
            align-items: flex-start;
            align-self: stretch;
            position: relative;
        `;
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'figma-section-title';
        titleElement.style.cssText = `
            color: #141414;
            font-family: 'SB Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 19px;
            font-style: normal;
            font-weight: 600;
            line-height: 24px;
            letter-spacing: -0.38px;
            margin: 0;
        `;
        titleElement.textContent = title;
        
        header.appendChild(titleElement);
        container.appendChild(header);
    }

    // Banner
    createBanner(container) {
        const banner = document.createElement('div');
        banner.className = 'figma-banner-small';
        banner.style.cssText = `
            display: flex;
            margin: 16px 16px;
            padding: 16px;
            align-items: center;
            gap: 16px;
            border-radius: 12px;
            background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%);
            color: white;
        `;
        
        const logo = document.createElement('div');
        logo.style.cssText = `
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
        `;
        logo.textContent = '🍣';
        
        const content = document.createElement('div');
        content.style.cssText = 'flex: 1;';
        content.innerHTML = `
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">Суши Маке</div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Подарок «Филадельфия с лососем» за первый заказ по промокоду «FILA2»</div>
            <button style="background: rgba(255, 255, 255, 0.2); border: none; padding: 6px 12px; border-radius: 6px; color: white; font-size: 12px; cursor: pointer;">Получить подарок</button>
        `;
        
        banner.appendChild(logo);
        banner.appendChild(content);
        container.appendChild(banner);
    }

    // Feedback Section
    createFeedbackSection(container) {
        const feedback = document.createElement('div');
        feedback.className = 'figma-feedback-section';
        feedback.style.cssText = `
            display: flex;
            margin: 16px;
            padding: 16px;
            align-items: center;
            gap: 16px;
            border-radius: 12px;
            background: #f8f8f8;
        `;
        
        const avatar = document.createElement('div');
        avatar.style.cssText = `
            width: 64px;
            height: 64px;
            background: linear-gradient(45deg, #4CAF50, #8BC34A);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
        `;
        avatar.textContent = '😊';
        
        const content = document.createElement('div');
        content.style.cssText = 'flex: 1;';
        content.innerHTML = `
            <div style="font-weight: 600; font-size: 16px; color: #333; margin-bottom: 8px;">Вам нравится 2ГИС?</div>
            <div style="display: flex; gap: 8px;">
                <button style="background: #1BA136; color: white; border: none; padding: 6px 16px; border-radius: 6px; font-size: 14px; cursor: pointer;">Да</button>
                <button style="background: #f0f0f0; color: #333; border: none; padding: 6px 16px; border-radius: 6px; font-size: 14px; cursor: pointer;">Нет</button>
            </div>
        `;
        
        feedback.appendChild(avatar);
        feedback.appendChild(content);
        container.appendChild(feedback);
    }

    // Menu Section
    createMenuSection(container) {
        const menu = document.createElement('div');
        menu.className = 'figma-menu-section';
        menu.style.cssText = `
            padding: 0 16px 80px 16px;
        `;
        
        const menuItems = [
            { icon: '💬', title: 'Обратная связь' },
            { icon: '🏢', title: 'Добавить организацию' },
            { icon: '📢', title: 'Разместить рекламу' }
        ];

        menuItems.forEach((item, index) => {
            const menuItem = document.createElement('div');
            menuItem.style.cssText = `
                display: flex;
                padding: 16px 0;
                align-items: center;
                justify-content: space-between;
                border-bottom: ${index < menuItems.length - 1 ? '1px solid #f0f0f0' : 'none'};
                cursor: pointer;
            `;
            
            menuItem.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 20px;">${item.icon}</div>
                    <div style="font-size: 16px; color: #333;">${item.title}</div>
                </div>
                <div style="color: #999; font-size: 18px;">›</div>
            `;
            
            menu.appendChild(menuItem);
        });
        
        container.appendChild(menu);
    }

    // Button Row - точная структура с fade masks
    createFigmaButtonsRow(container) {
        const buttonsRow = document.createElement('div');
        buttonsRow.className = 'figma-buttons-row';
        
        const buttonsMask = document.createElement('div');
        buttonsMask.className = 'figma-buttons-mask';
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'figma-buttons-container';
        
        const buttons = [
            { 
                id: 'bookmark', 
                text: '', 
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14l-6-4-6 4V4Z" stroke="#141414" stroke-width="1.5"/>
                       </svg>`,
                iconOnly: true
            },
            { 
                id: 'home', 
                text: '45 мин', 
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2L3 8v10h4v-6h6v6h4V8l-7-6Z" stroke="#FF5722" stroke-width="1.5" stroke-linejoin="round"/>
                       </svg>`,
                textColor: '#FF5722'
            },
            { 
                id: 'work', 
                text: '45 мин', 
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 7h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" stroke="#FFA726" stroke-width="1.5"/>
                        <path d="M7 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="#FFA726" stroke-width="1.5"/>
                       </svg>`,
                textColor: '#FFA726'
            },
            { 
                id: 'address', 
                text: 'Немировича-Данченко, 45', 
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="#141414" stroke-width="1.5"/>
                        <path d="M10 2C7.24 2 5 4.24 5 7c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5Z" stroke="#141414" stroke-width="1.5"/>
                       </svg>`
            }
        ];
        
        buttons.forEach(buttonData => {
            const button = document.createElement('button');
            button.className = 'figma-smart-button';
            button.addEventListener('click', () => updateMapStatus(`Кнопка: ${buttonData.id}`, 'info'));
            
            const buttonContent = document.createElement('div');
            buttonContent.className = 'figma-smart-button-content';
            
            const iconContainer = document.createElement('div');
            iconContainer.className = 'figma-smart-button-icon';
            iconContainer.innerHTML = buttonData.icon;
            
            if (!buttonData.iconOnly && buttonData.text) {
                const text = document.createElement('span');
                text.className = 'figma-smart-button-text';
                text.textContent = buttonData.text;
                if (buttonData.textColor) {
                    text.style.color = buttonData.textColor;
                }
                buttonContent.appendChild(iconContainer);
                buttonContent.appendChild(text);
            } else {
                buttonContent.appendChild(iconContainer);
            }
            
            button.appendChild(buttonContent);
            buttonsContainer.appendChild(button);
        });
        
        buttonsMask.appendChild(buttonsContainer);
        buttonsRow.appendChild(buttonsMask);
        container.appendChild(buttonsRow);
    }

    // Stories - точные размеры 96x112 с правильной структурой
    createFigmaStories(container) {
        const storiesSection = document.createElement('div');
        storiesSection.className = 'figma-stories-section';
        
        const storiesContainer = document.createElement('div');
        storiesContainer.className = 'figma-stories-container';
        
        const stories = [
            { id: 'story1', imageUrl: '../figma_export/dashboard/state_default/assets/images/img-69ff32d9.png' },
            { id: 'story2', imageUrl: '../figma_export/dashboard/state_default/assets/images/img-5549a895.png' },
            { id: 'story3', imageUrl: '../figma_export/dashboard/state_default/assets/images/img-62839f12.png' },
            { id: 'story4', imageUrl: '../figma_export/dashboard/state_default/assets/images/img-0f61e5de.png' }
        ];
        
        stories.forEach(story => {
            const storyItem = document.createElement('div');
            storyItem.className = 'figma-story-item';
            storyItem.addEventListener('click', () => {
                updateMapStatus(`История: ${story.id}`, 'info');
                this.handleStoryClick(story.id);
            });
            
            const cover = document.createElement('div');
            cover.className = 'figma-story-cover';
            
            const image = document.createElement('img');
            image.src = story.imageUrl;
            image.alt = 'Story';
            image.onerror = () => {
                cover.style.background = 'linear-gradient(45deg, #f0f0f0, #e0e0e0)';
                cover.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 24px;">📖</div>';
            };
            
            cover.appendChild(image);
            storyItem.appendChild(cover);
            storiesContainer.appendChild(storyItem);
        });
        
        storiesSection.appendChild(storiesContainer);
        container.appendChild(storiesSection);
    }

    // Content Grid - стандартная двухколоночная сетка без дублирования
    createFigmaContentGrid(container) {
        const contentSection = document.createElement('div');
        contentSection.className = 'figma-content-section';
        
        const grid = document.createElement('div');
        grid.className = 'figma-content-grid';
        
        // Левая колонка (166px)
        const leftColumn = document.createElement('div');
        leftColumn.className = 'figma-left-column';
        
        // 1. Cover card (142px высота)
        this.createFigmaCoverCard(leftColumn, {
            title: 'Маленькие экскурсии: гуляем с «Даблби» и...',
            subtitle: '59 мест',
            imageUrl: '../figma_export/dashboard/state_default/assets/images/img-a24168bd.png'
        });
        
        // 2. Meta item "Вкусно позавтракать" (116px высота)
        this.createFigmaMetaItem(leftColumn, {
            title: 'Вкусно позавтракать',
            subtitle: 'Тот самый момент',
            icon: '🍴'
        });
        
        // 3. Meta item "Банкоматы" (116px высота)  
        this.createFigmaMetaItem(leftColumn, {
            title: 'Банкоматы',
            subtitle: 'Number',
            icon: '🏧'
        });
        
        // Правая колонка (166px)
        const rightColumn = document.createElement('div');
        rightColumn.className = 'figma-right-column';
        
        // 1. Meta item ad "Xiaomi" (116px высота)
        this.createFigmaMetaItemAd(rightColumn, {
            title: 'Xiaomi',
            subtitle: 'Реклама',
            imageUrl: '../figma_export/dashboard/state_default/assets/images/img-515d9ed9.png'
        });
        
        // 2. Meta item "Школьная форма" (116px высота)
        this.createFigmaMetaItem(rightColumn, {
            title: 'Школьная форма',
            subtitle: '112 мест', 
            icon: '👔'
        });
        
        // 3. RD блок "Geraldine" (244px высота)
        this.createFigmaRD(rightColumn, {
            title: 'Geraldine',
            subtitle: 'Необистро',
            rating: '4.6',
            distance: '1.4 км',
            address: 'Тверская 32/12, БЦ Апельсин, 1 этаж',
            photoCount: '826',
            mainImage: '../figma_export/dashboard/components/RD/assets/images/img-8cfd8047.png',
            counterImage: '../figma_export/dashboard/components/RD/assets/images/img-6cc6299d.png'
        });
        
        grid.appendChild(leftColumn);
        grid.appendChild(rightColumn);
        contentSection.appendChild(grid);
        container.appendChild(contentSection);
        
        // Баннер на всю ширину (2 колонки)
        this.createFigmaBanner(contentSection, {
            title: 'Суши Маке',
            description: 'Подарок «Филадельфия с лососем» за первый заказ по промокоду «FILA2»',
            action: 'Получить подарок',
            disclaimer: 'Реклама • Условия проведения акции смотрите на sushi-make.ru'  
        });
    }

    // Создание компонентов - упрощенные версии для демо
    createFigmaCoverCard(container, data) {
        const card = document.createElement('div');
        card.className = 'figma-cover-card figma-cover-card-big';
        
        const image = document.createElement('img');
        image.src = data.imageUrl;
        image.alt = data.title;
        image.onerror = () => {
            card.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
            card.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-weight: bold;">Коллекция</div>';
        };
        
        const overlay = document.createElement('div');
        overlay.className = 'figma-cover-overlay';
        
        const title = document.createElement('div');
        title.className = 'figma-cover-title';
        title.textContent = data.title;
        
        const subtitle = document.createElement('div');
        subtitle.className = 'figma-cover-subtitle';
        subtitle.textContent = data.subtitle;
        
        overlay.appendChild(title);
        overlay.appendChild(subtitle);
        
        card.appendChild(image);
        card.appendChild(overlay);
        container.appendChild(card);
    }

    createFigmaMetaItem(container, data) {
        const item = document.createElement('div');
        item.className = 'figma-meta-item';
        item.addEventListener('click', () => {
            updateMapStatus(`Категория: ${data.title}`, 'info');
        });
        
        const card = document.createElement('div');
        card.className = 'figma-meta-item-card';
        
        const content = document.createElement('div');
        content.className = 'figma-meta-item-content';
        
        const titleContainer = document.createElement('div');
        titleContainer.className = 'figma-meta-item-title-container';
        
        const title = document.createElement('div');
        title.className = 'figma-meta-item-title';
        title.textContent = data.title;
        
        titleContainer.appendChild(title);
        
        const subtitleContainer = document.createElement('div');
        subtitleContainer.className = 'figma-meta-item-subtitle-container';
        
        const subtitle = document.createElement('div');
        subtitle.className = 'figma-meta-item-subtitle';
        subtitle.textContent = data.subtitle;
        
        subtitleContainer.appendChild(subtitle);
        
        content.appendChild(titleContainer);
        content.appendChild(subtitleContainer);
        
        const iconContainer = document.createElement('div');
        iconContainer.className = 'figma-meta-item-icon';
        
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'figma-meta-item-icon-container';
        iconWrapper.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4C14.4 4 13 5.4 13 7V10H10C8.9 10 8 10.9 8 12V26C8 27.1 8.9 28 10 28H22C23.1 28 24 27.1 24 26V12C24 10.9 23.1 10 22 10H19V7C19 5.4 17.6 4 16 4ZM16 6C16.6 6 17 6.4 17 7V10H15V7C15 6.4 15.4 6 16 6ZM10 12H22V26H10V12Z" fill="#898989"/>
            </svg>
        `;
        
        iconContainer.appendChild(iconWrapper);
        
        card.appendChild(content);
        card.appendChild(iconContainer);
        item.appendChild(card);
        container.appendChild(item);
    }

    createFigmaMetaItemAd(container, data) {
        const item = document.createElement('div');
        item.className = 'figma-meta-item-ad';
        item.addEventListener('click', () => {
            updateMapStatus(`Реклама: ${data.title}`, 'info');
        });
        
        const fade = document.createElement('div');
        fade.className = 'figma-meta-item-ad-fade';
        
        const color = document.createElement('div');
        color.className = 'figma-meta-item-ad-color';
        
        const userpic = document.createElement('div');
        userpic.className = 'figma-meta-item-ad-userpic';
        
        const container48 = document.createElement('div');
        container48.className = 'figma-meta-item-ad-container';
        
        if (data.imageUrl) {
            const img = document.createElement('img');
            img.src = data.imageUrl;
            img.alt = data.title;
            img.style.cssText = 'width: 48px; height: 48px; object-fit: cover; position: absolute; left: 0px; top: 0px;';
            img.onerror = () => {
                container48.style.background = 'linear-gradient(45deg, #FF9800, #FFC107)';
                container48.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-weight: bold; font-size: 12px;">AD</div>';
            };
            container48.appendChild(img);
        } else {
            container48.style.background = 'linear-gradient(45deg, #FF9800, #FFC107)';
            container48.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-weight: bold; font-size: 12px;">AD</div>';
        }
        
        userpic.appendChild(container48);
        
        const textContent = document.createElement('div');
        textContent.className = 'figma-meta-item-ad-content';
        
        const titleContainer = document.createElement('div');
        titleContainer.className = 'figma-meta-item-ad-title-container';
        
        const title = document.createElement('div');
        title.className = 'figma-meta-item-ad-title';
        title.textContent = data.title;
        
        titleContainer.appendChild(title);
        
        const subtitleContainer = document.createElement('div');
        subtitleContainer.className = 'figma-meta-item-ad-subtitle-container';
        
        const subtitle = document.createElement('div');
        subtitle.className = 'figma-meta-item-ad-subtitle';
        subtitle.textContent = data.subtitle;
        
        subtitleContainer.appendChild(subtitle);
        
        textContent.appendChild(titleContainer);
        textContent.appendChild(subtitleContainer);
        
        item.appendChild(fade);
        item.appendChild(color);
        item.appendChild(userpic);
        item.appendChild(textContent);
        
        container.appendChild(item);
    }

    createFigmaRD(container, data) {
        const rd = document.createElement('div');
        rd.className = 'figma-rd';
        rd.addEventListener('click', () => {
            updateMapStatus(`Организация: ${data.title}`, 'info');
        });
        
        const gallery = document.createElement('div');
        gallery.className = 'figma-rd-gallery';
        
        const photos = document.createElement('div');
        photos.className = 'figma-rd-photos';
        
        const mainPhoto = document.createElement('div');
        mainPhoto.className = 'figma-rd-main-photo';
        
        const mainImg = document.createElement('img');
        mainImg.src = data.mainImage;
        mainImg.alt = data.title;
        mainImg.onerror = () => {
            mainPhoto.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
            mainPhoto.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-weight: bold;">ФОТО</div>';
        };
        mainPhoto.appendChild(mainImg);
        
        const counterPhoto = document.createElement('div');
        counterPhoto.className = 'figma-rd-counter-photo';
        
        const counterImg = document.createElement('img');
        counterImg.src = data.counterImage;
        counterImg.alt = `${data.title} photos`;
        counterImg.onerror = () => {
            counterPhoto.style.background = '#f0f0f0';
        };
        
        const counterOverlay = document.createElement('div');
        counterOverlay.className = 'figma-rd-counter-overlay';
        
        const counter = document.createElement('div');
        counter.className = 'figma-rd-counter';
        counter.textContent = data.photoCount;
        
        counterPhoto.appendChild(counterImg);
        counterPhoto.appendChild(counterOverlay);
        counterPhoto.appendChild(counter);
        
        photos.appendChild(mainPhoto);
        photos.appendChild(counterPhoto);
        gallery.appendChild(photos);
        
        const content = document.createElement('div');
        content.className = 'figma-rd-content';
        
        const header = document.createElement('div');
        header.className = 'figma-rd-header';
        
        const titleRow = document.createElement('div');
        titleRow.className = 'figma-rd-title-row';
        
        const title = document.createElement('div');
        title.className = 'figma-rd-title';
        title.textContent = data.title;
        
        const crown = document.createElement('div');
        crown.className = 'figma-rd-crown';
        crown.innerHTML = '<div style="font-size: 16px;">👑</div>';
        
        titleRow.appendChild(title);
        titleRow.appendChild(crown);
        
        const subtitle = document.createElement('div');
        subtitle.className = 'figma-rd-subtitle';
        subtitle.textContent = data.subtitle;
        
        const meta = document.createElement('div');
        meta.className = 'figma-rd-meta';
        
        const rating = document.createElement('div');
        rating.className = 'figma-rd-rating';
        
        const stars = document.createElement('div');
        stars.className = 'figma-rd-stars';
        stars.innerHTML = '⭐⭐⭐⭐⭐';
        
        const ratingValue = document.createElement('div');
        ratingValue.className = 'figma-rd-rating-value';
        ratingValue.textContent = data.rating;
        
        rating.appendChild(stars);
        rating.appendChild(ratingValue);
        
        const distance = document.createElement('div');
        distance.className = 'figma-rd-distance';
        distance.textContent = data.distance;
        
        meta.appendChild(rating);
        meta.appendChild(distance);
        
        header.appendChild(titleRow);
        header.appendChild(subtitle);
        header.appendChild(meta);
        
        const address = document.createElement('div');
        address.className = 'figma-rd-address';
        address.textContent = data.address;
        
        content.appendChild(header);
        content.appendChild(address);
        
        rd.appendChild(gallery);
        rd.appendChild(content);
        container.appendChild(rd);
    }

    createFigmaBanner(container, data) {
        const banner = document.createElement('div');
        banner.className = 'figma-banner';
        
        const content = document.createElement('div');
        content.className = 'figma-banner-content';
        
        const background = document.createElement('div');
        background.className = 'figma-banner-background';
        
        const fade = document.createElement('div');
        fade.className = 'figma-banner-fade';
        
        const main = document.createElement('div');
        main.className = 'figma-banner-main';
        
        const inner = document.createElement('div');
        inner.className = 'figma-banner-inner';
        
        const logo = document.createElement('div');
        logo.className = 'figma-banner-logo';
        
        const textContainer = document.createElement('div');
        textContainer.className = 'figma-banner-text';
        
        const title = document.createElement('div');
        title.className = 'figma-banner-title';
        title.textContent = data.title;
        
        const description = document.createElement('div');
        description.className = 'figma-banner-description';
        description.textContent = data.description;
        
        const action = document.createElement('div');
        action.className = 'figma-banner-action';
        action.textContent = data.action;
        action.addEventListener('click', () => {
            updateMapStatus(`Баннер: ${data.title}`, 'info');
        });
        
        textContainer.appendChild(title);
        textContainer.appendChild(description);
        textContainer.appendChild(action);
        
        inner.appendChild(logo);
        inner.appendChild(textContainer);
        main.appendChild(inner);
        
        content.appendChild(background);
        content.appendChild(fade);
        content.appendChild(main);
        
        const disclaimer = document.createElement('div');
        disclaimer.className = 'figma-banner-disclaimer';
        
        const disclaimerText = document.createElement('div');
        disclaimerText.className = 'figma-banner-disclaimer-text';
        disclaimerText.textContent = data.disclaimer;
        
        disclaimer.appendChild(disclaimerText);
        
        banner.appendChild(content);
        banner.appendChild(disclaimer);
        container.appendChild(banner);
    }

    // Event handlers и остальные методы...
    setupEventListeners() {
        const dragger = this.bottomsheetElement.querySelector('.figma-dragger-handle');
        if (dragger) {
            dragger.addEventListener('mousedown', this.handleDragStart.bind(this));
            dragger.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false });
        }
        
        // Обработчики wheel и touch для умного скролла
        this.bottomsheetElement.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        this.bottomsheetElement.addEventListener('touchstart', this.handleScrollTouchStart.bind(this), { passive: false });
        this.bottomsheetElement.addEventListener('touchmove', this.handleScrollTouchMove.bind(this), { passive: false });
        this.bottomsheetElement.addEventListener('touchend', this.handleScrollTouchEnd.bind(this), { passive: false });
        
        document.addEventListener('mousemove', this.handleDragMove.bind(this));
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));
        document.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleDragEnd.bind(this));
    }
    
    updateBottomsheetHeight() {
        if (!this.bottomsheetElement) return;
        
        const screenHeight = window.innerHeight;
        const heights = {
            'small': screenHeight * 0.2,
            'default': screenHeight * 0.55,
            'fullscreen': screenHeight * 0.9,
            'fullscreen-scroll': screenHeight * 0.95
        };
        
        const height = heights[this.currentState];
        this.setBottomsheetHeight(height);
    }
    
    // Прямое управление высотой шторки для плавного скролла
    setBottomsheetHeight(height) {
        if (!this.bottomsheetElement) return;
        
        const screenHeight = window.innerHeight;
        const minHeight = screenHeight * 0.15; // Минимум 15%
        const maxHeight = screenHeight * 0.95; // Максимум 95%
        
        // Ограничиваем высоту в разумных пределах
        const clampedHeight = Math.max(minHeight, Math.min(maxHeight, height));
        
        this.currentHeight = clampedHeight;
        this.bottomsheetElement.style.height = `${clampedHeight}px`;
        
        // Определяем текущее "виртуальное" состояние для скролла
        this.updateScrollBehaviorByHeight(clampedHeight);
        
        if (this.mapComponent && this.mapComponent.resize) {
            this.mapComponent.resize();
        }
    }
    
    // Обновление поведения скролла на основе текущей высоты
    updateScrollBehaviorByHeight(height) {
        const contentContainer = this.bottomsheetElement?.querySelector('.dashboard-content');
        if (!contentContainer) return;
        
        const screenHeight = window.innerHeight;
        const heightRatio = height / screenHeight;
        
        // Если высота больше 92% - разрешаем скролл контента
        const isScrollableHeight = heightRatio > 0.92;
        
        if (isScrollableHeight) {
            contentContainer.style.overflowY = 'auto';
            contentContainer.style.overflowX = 'hidden';
            this.bottomsheetElement.style.cursor = 'default';
        } else {
            contentContainer.style.overflowY = 'hidden';
            contentContainer.style.overflowX = 'hidden';
            contentContainer.scrollTop = 0;
            this.bottomsheetElement.style.cursor = 'ns-resize';
        }
        
        // Добавляем CSS классы для визуальной индикации
        this.bottomsheetElement.classList.toggle('scroll-blocked', !isScrollableHeight);
        this.bottomsheetElement.classList.toggle('scroll-enabled', isScrollableHeight);
    }
    
    updateScrollBehavior() {
        const contentContainer = this.bottomsheetElement?.querySelector('.dashboard-content');
        if (!contentContainer) return;
        
        const isScrollableState = this.currentState === 'fullscreen-scroll';
        
        if (isScrollableState) {
            // В fullscreen-scroll разрешаем скролл контента
            contentContainer.style.overflowY = 'auto';
            contentContainer.style.overflowX = 'hidden';
            this.bottomsheetElement.style.cursor = 'default';
        } else {
            // В остальных состояниях блокируем скролл контента
            contentContainer.style.overflowY = 'hidden';
            contentContainer.style.overflowX = 'hidden';
            contentContainer.scrollTop = 0; // Сбрасываем позицию скролла
            this.bottomsheetElement.style.cursor = 'ns-resize';
        }
        
        // Добавляем CSS классы для визуальной индикации
        this.bottomsheetElement.classList.toggle('scroll-blocked', !isScrollableState);
        this.bottomsheetElement.classList.toggle('scroll-enabled', isScrollableState);
    }
    
    handleSearchFocus() {
        this.props.onSearchFocus?.();
        this.props.searchFlowManager.goToSuggest();
    }
    
    handleStoryClick(storyId) {
        this.props.onStoryClick?.(storyId);
        this.props.searchFlowManager.goToSearchResults(storyId);
    }
    
    handleDragStart(event) {
        this.isDragging = true;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        this.dragStartY = clientY;
        
        if (this.bottomsheetElement) {
            this.bottomsheetElement.style.transition = 'none';
        }
    }
    
    handleDragMove(event) {
        if (!this.isDragging || !this.bottomsheetElement) return;
        
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        const deltaY = this.dragStartY - clientY;
        const currentHeight = parseInt(this.bottomsheetElement.style.height);
        const newHeight = Math.max(100, Math.min(window.innerHeight * 0.95, currentHeight + deltaY));
        
        this.bottomsheetElement.style.height = `${newHeight}px`;
        this.dragStartY = clientY;
        
        if ('touches' in event) {
            event.preventDefault();
        }
    }
    
    handleDragEnd() {
        if (!this.isDragging || !this.bottomsheetElement) return;
        
        this.isDragging = false;
        this.bottomsheetElement.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        
        const currentHeight = parseInt(this.bottomsheetElement.style.height);
        const screenHeight = window.innerHeight;
        const heightRatio = currentHeight / screenHeight;
        
        if (heightRatio < 0.35) {
            this.currentState = 'small';
        } else if (heightRatio < 0.72) {
            this.currentState = 'default';
        } else if (heightRatio < 0.92) {
            this.currentState = 'fullscreen';
        } else {
            this.currentState = 'fullscreen-scroll';
        }
        
        this.updateBottomsheetHeight();
        this.props.bottomsheetManager.snapToState(this.currentState);
    }
    
    handleWheel(event) {
        const screenHeight = window.innerHeight;
        const currentHeight = this.currentHeight || screenHeight * 0.55;
        const scrollableThreshold = screenHeight * 0.92;
        
        // Если высота больше 92%, проверяем можно ли скроллить контент
        if (currentHeight > scrollableThreshold) {
            const contentContainer = this.bottomsheetElement.querySelector('.dashboard-content');
            if (contentContainer) {
                const { scrollTop } = contentContainer;
                const isAtTop = scrollTop <= 0;
                
                // Если скроллим вверх и уже наверху, начинаем уменьшать высоту шторки
                if (event.deltaY < 0 && isAtTop) {
                    event.preventDefault();
                    // Плавно уменьшаем высоту
                    const newHeight = Math.max(screenHeight * 0.15, currentHeight + event.deltaY * 2);
                    this.setBottomsheetHeight(newHeight);
                    this.startSnapTimeout();
                    return;
                }
                
                // Иначе разрешаем обычный скролл контента
                return;
            }
        }

        // Для всех остальных случаев блокируем скролл контента и плавно меняем высоту шторки
        event.preventDefault();
        
        // Плавное изменение высоты (скролл вниз = шторка вверх)
        const delta = event.deltaY * 2; // Коэффициент чувствительности
        const newHeight = Math.max(
            screenHeight * 0.15, 
            Math.min(screenHeight * 0.95, currentHeight + delta)
        );
        
        this.setBottomsheetHeight(newHeight);
        this.isWheelScrolling = true;
        
        // Запускаем таймер для snap к ближайшему чекпоинту
        this.startSnapTimeout();
    }
    
    // Запуск таймера для snap к ближайшему состоянию
    startSnapTimeout() {
        if (this.wheelTimeout) {
            clearTimeout(this.wheelTimeout);
        }
        
        this.wheelTimeout = setTimeout(() => {
            this.snapToNearestState();
            this.isWheelScrolling = false;
        }, 150); // Короткая задержка для плавности
    }
    
    // Snap к ближайшему состоянию
    snapToNearestState() {
        if (!this.currentHeight) return;
        
        const screenHeight = window.innerHeight;
        const currentRatio = this.currentHeight / screenHeight;
        
        const states = [
            { name: 'small', ratio: 0.2 },
            { name: 'default', ratio: 0.55 },
            { name: 'fullscreen', ratio: 0.9 },
            { name: 'fullscreen-scroll', ratio: 0.95 }
        ];
        
        // Находим ближайшее состояние
        let nearestState = states[0];
        let minDistance = Math.abs(currentRatio - states[0].ratio);
        
        for (const state of states) {
            const distance = Math.abs(currentRatio - state.ratio);
            if (distance < minDistance) {
                minDistance = distance;
                nearestState = state;
            }
        }
        
        // Плавно переходим к ближайшему состоянию
        this.currentState = nearestState.name;
        const targetHeight = screenHeight * nearestState.ratio;
        this.animateToHeight(targetHeight);
        
        // Обновляем менеджер состояний
        this.props.bottomsheetManager.snapToState(this.currentState);
    }
    
    // Плавная анимация к целевой высоте
    animateToHeight(targetHeight) {
        if (!this.bottomsheetElement || !this.currentHeight) return;
        
        // Включаем CSS transition для плавной анимации
        this.bottomsheetElement.style.transition = 'height 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        
        this.setBottomsheetHeight(targetHeight);
        
        // Убираем transition через небольшую задержку
        setTimeout(() => {
            if (this.bottomsheetElement) {
                this.bottomsheetElement.style.transition = 'none';
            }
        }, 300);
    }
    
    transitionToState(direction) {
        const states = ['small', 'default', 'fullscreen', 'fullscreen-scroll'];
        const currentIndex = states.indexOf(this.currentState);
        let targetIndex = currentIndex;
        
        if (direction > 0) { // Скролл вниз -> уменьшаем высоту
            targetIndex = Math.max(0, currentIndex - 1);
        } else { // Скролл вверх -> увеличиваем высоту
            targetIndex = Math.min(states.length - 1, currentIndex + 1);
        }
        
        if (targetIndex !== currentIndex) {
            const targetState = states[targetIndex];
            this.snapToState(targetState);
            this.props.bottomsheetManager.snapToState(targetState);
        }
    }
    
    handleScrollTouchStart(event) {
        // Не обрабатываем если это drag на dragger
        if (event.target.closest('.figma-dragger-handle')) return;
        
        if (event.touches.length !== 1) return;
        this.touchStartY = event.touches[0].clientY;
        this.touchCurrentY = this.touchStartY;
        this.isTouchScrolling = false;
    }
    
    handleScrollTouchMove(event) {
        // Не обрабатываем если это drag на dragger
        if (event.target.closest('.figma-dragger-handle')) return;
        
        if (event.touches.length !== 1) return;
        
        const currentY = event.touches[0].clientY;
        const totalDelta = this.touchStartY - currentY;
        const momentumDelta = this.touchCurrentY - currentY; // Изменение с последнего кадра
        
        const screenHeight = window.innerHeight;
        const currentHeight = this.currentHeight || screenHeight * 0.55;
        const scrollableThreshold = screenHeight * 0.92;
        
        // Если высота больше 92%, проверяем можно ли скроллить контент
        if (currentHeight > scrollableThreshold) {
            const contentContainer = this.bottomsheetElement.querySelector('.dashboard-content');
            if (contentContainer) {
                const { scrollTop } = contentContainer;
                const isAtTop = scrollTop <= 0;
                
                // Если тянем вниз и уже наверху, начинаем уменьшать высоту шторки
                if (momentumDelta < 0 && isAtTop) {
                    event.preventDefault();
                    // Плавно уменьшаем высоту (свайп вниз = шторка вниз)
                    const newHeight = Math.max(screenHeight * 0.15, currentHeight + momentumDelta * 3);
                    this.setBottomsheetHeight(newHeight);
                    this.touchCurrentY = currentY;
                    return;
                }
                
                // Иначе разрешаем обычный скролл контента
                this.touchCurrentY = currentY;
                return;
            }
        }
        
        // Для всех остальных случаев блокируем скролл контента и плавно меняем высоту шторки
        event.preventDefault();
        
        // Плавное изменение высоты на основе движения пальца
        if (Math.abs(momentumDelta) > 1) { // Минимальный порог для избежания дрожания
            const newHeight = Math.max(
                screenHeight * 0.15,
                Math.min(screenHeight * 0.95, currentHeight + momentumDelta * 3) // Коэффициент чувствительности
            );
            
            this.setBottomsheetHeight(newHeight);
        }
        
        this.touchCurrentY = currentY;
    }
    
    handleScrollTouchEnd(event) {
        // Не обрабатываем если это drag на dragger
        if (event.target.closest('.figma-dragger-handle')) return;
        
        this.isTouchScrolling = false;
        
        // Snap к ближайшему состоянию после завершения жеста
        this.snapToNearestState();
    }
    
    snapToState(state) {
        this.currentState = state;
        
        const screenHeight = window.innerHeight;
        const heights = {
            'small': screenHeight * 0.2,
            'default': screenHeight * 0.55,
            'fullscreen': screenHeight * 0.9,
            'fullscreen-scroll': screenHeight * 0.95
        };
        
        const targetHeight = heights[state];
        if (targetHeight) {
            this.animateToHeight(targetHeight);
        }
    }

    centerMoscow() {
        if (this.mapComponent && this.mapComponent.setCenter) {
            this.mapComponent.setCenter([37.620393, 55.75396]);
            updateMapStatus('Центрирование на Москве', 'success');
        }
    }
}

// Utility functions
function updateMapStatus(message, type = 'info') {
    const statusEl = document.getElementById('map-status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `map-status ${type}`;
        
        if (type === 'info') {
            setTimeout(() => {
                if (statusEl.textContent === message) {
                    statusEl.style.opacity = '0.7';
                }
            }, 3000);
        }
    }
}

function updateDebugMapInfo(status, center, zoom) {
    const debugMap = document.getElementById('debug-map');
    const debugCenter = document.getElementById('debug-center');
    const debugZoom = document.getElementById('debug-zoom');
    
    if (debugMap) debugMap.textContent = status;
    if (debugCenter) debugCenter.textContent = center ? `${center[1].toFixed(3)}, ${center[0].toFixed(3)}` : '-';
    if (debugZoom) debugZoom.textContent = zoom || '-';
}

// Инициализация
const searchFlowManager = new MockSearchFlowManager();
const bottomsheetManager = new MockBottomsheetManager();
const mapSyncService = new MockMapSyncService();

let dashboardScreen = null;

async function initializeDashboard() {
    try {
        updateMapStatus('🚀 Инициализация Figma Dashboard...', 'loading');
        
        dashboardScreen = new FigmaDashboardScreen({
            container: document.getElementById('app'),
            searchFlowManager,
            bottomsheetManager,
            mapSyncService,
            onSearchFocus: () => {
                console.log('🔍 Search focused');
                updateMapStatus('Поиск активирован', 'info');
            },
            onStoryClick: (storyId) => {
                console.log('📖 Story clicked:', storyId);
                updateMapStatus(`История: ${storyId}`, 'info');
            }
        });
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        updateMapStatus('❌ Ошибка инициализации', 'error');
    }
}

// Event listeners
document.querySelectorAll('[data-state]').forEach(button => {
    button.addEventListener('click', () => {
        const state = button.dataset.state;
        document.querySelectorAll('[data-state]').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        if (dashboardScreen) {
            dashboardScreen.snapToState(state);
            bottomsheetManager.snapToState(state);
            updateMapStatus(`Состояние: ${state}`, 'info');
        }
    });
});

document.getElementById('btn-refresh').addEventListener('click', () => location.reload());
document.getElementById('btn-toggle-debug').addEventListener('click', () => {
    const debugInfo = document.getElementById('debug-info');
    debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
});
document.getElementById('btn-center-moscow').addEventListener('click', () => {
    if (dashboardScreen) dashboardScreen.centerMoscow();
});
document.getElementById('btn-test-markers').addEventListener('click', () => {
    if (dashboardScreen) dashboardScreen.testRandomMarkers();
});

// Start
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Figma Dashboard Demo starting...');
    setTimeout(initializeDashboard, 1000);
}); 