# Техническое руководство: Реализация сценария "Поиск и навигация"

## Архитектурный обзор

Проект уже имеет четко структурированную архитектуру с разделением на компоненты, сервисы и типы. Этот документ описывает использование существующих компонентов для реализации полного сценария поиска и навигации.

## Существующая структура

```
src/
├── components/
│   ├── Bottomsheet/           # Компоненты шторки
│   │   ├── BottomsheetContainer.ts
│   │   ├── BottomsheetHeader.ts
│   │   └── BottomsheetContent.ts
│   ├── Cards/                 # Карточки организаций
│   │   └── OrganizationCard.ts
│   ├── Dashboard/             # Компоненты дашборда
│   │   └── DashboardComponents.ts
│   ├── Screens/               # Экраны приложения
│   │   ├── DashboardScreen.ts
│   │   ├── SuggestScreen.ts
│   │   ├── SearchResultScreen.ts
│   │   └── OrganizationScreen.ts
│   └── Search/                # Поисковые компоненты
│       ├── SearchBar.ts
│       ├── SearchSuggestions.ts
│       └── SearchFilters.ts
├── services/                  # Управляющие сервисы
│   ├── SearchFlowManager.ts   # Навигация между экранами
│   ├── BottomsheetManager.ts  # Управление состояниями шторки
│   └── MapSyncService.ts      # Синхронизация карты и контента
└── types/                     # TypeScript интерфейсы
    ├── navigation.ts          # Типы навигации и поиска
    ├── bottomsheet.ts         # Типы шторки
    └── map.ts                 # Типы карты
```

---

## Основные архитектурные принципы

### 1. Единая система состояний шторки

**Уже реализовано в `src/types/bottomsheet.ts`:**

```typescript
export enum BottomsheetState {
  SMALL = 'small',                    // ~20% высоты экрана
  DEFAULT = 'default',                // ~50% высоты экрана  
  FULLSCREEN = 'fullscreen',          // ~90% высоты экрана
  FULLSCREEN_SCROLL = 'fullscreen_scroll' // 95%+ с прокруткой
}

export interface BottomsheetConfig {
  state: BottomsheetState;
  snapPoints: number[];     // [0.2, 0.5, 0.9, 0.95]
  isDraggable: boolean;
  hasScrollableContent: boolean;
}
```

**Использование в `src/services/BottomsheetManager.ts`:**

```typescript
export class BottomsheetManager {
  getCurrentState(): BottomsheetStateData
  snapToState(targetState: BottomsheetState): Promise<void>
  handleDragGesture(gestureState: GestureState): void
}
```

### 2. Менеджер переходов между экранами

**Уже реализовано в `src/services/SearchFlowManager.ts`:**

```typescript
export class SearchFlowManager {
  public currentScreen: ScreenType;
  public searchContext: SearchContext;
  public navigationHistory: ScreenType[];
  
  // Методы навигации
  goToSuggest(): void
  goToSearchResults(query: string, filters?: SearchFilters): void
  goToOrganization(org: Organization): void
  goBack(): void
  
  // Управление поисковым контекстом
  updateQuery(query: string): void
  updateFilters(filters: SearchFilters): void
  addToHistory(query: string): void
}
```

### 3. Синхронизация карты и шторки

**Уже реализовано в `src/services/MapSyncService.ts`:**

```typescript
export class MapSyncService {
  // Обновление пинов на основе содержимого шторки
  syncPinsWithContent(content: ContentType, options: SyncOptions): void
  
  // Выделение активного пина при выборе карточки
  highlightOrganizationPin(orgId: string): void
  
  // Адаптация видимой области карты под высоту шторки
  adjustMapViewport(bottomsheetHeight: number): void
}
```

---

## Поток выполнения сценария

### Экран 1: Dashboard

**Компонент:** `src/components/Screens/DashboardScreen.ts`

```typescript
export class DashboardScreen {
  // Уже реализованные компоненты:
  private bottomsheetContainer: BottomsheetContainer
  private bottomsheetHeader: BottomsheetHeader
  private bottomsheetContent: BottomsheetContent
  private searchBar: SearchBar
  
  // Обработчик фокуса на поисковой строке
  private handleSearchFocus(): void {
    this.props.searchFlowManager.goToSuggest();
    this.props.onSearchFocus?.();
  }
}
```

**Использование:**
```typescript
const dashboardScreen = new DashboardScreen({
  container: document.getElementById('app'),
  searchFlowManager,
  bottomsheetManager,
  mapSyncService,
  onSearchFocus: () => console.log('Search activated')
});
```

### Экран 2: Suggest (Подсказки)

**Компонент:** `src/components/Screens/SuggestScreen.ts`

```typescript
export class SuggestScreen {
  // Уже реализованные компоненты:
  private searchBar: SearchBar           // Активная поисковая строка
  private searchSuggestions: SearchSuggestions // Список подсказок
  
  // Обработчик выбора подсказки
  private handleSuggestionSelect(suggestion: SearchSuggestion): void {
    this.props.searchFlowManager.goToSearchResults(suggestion.text);
  }
  
  // Загрузка подсказок
  private async loadSuggestions(): Promise<void> {
    const suggestions = await this.props.searchFlowManager.getSuggestions();
    this.searchSuggestions?.updateSuggestions(suggestions);
  }
}
```

### Экран 3: Search Results (Результаты поиска)

**Компонент:** `src/components/Screens/SearchResultScreen.ts`

```typescript
export class SearchResultScreen {
  // Уже реализованные компоненты:
  private searchBar: SearchBar           // Поисковая строка с запросом
  private searchFilters: SearchFilters   // Панель фильтров
  private organizationCards: OrganizationCard[] // Список карточек
  
  // Обработчик клика по карточке
  private handleOrganizationClick(org: Organization): void {
    this.props.searchFlowManager.goToOrganization(org);
    this.props.mapSyncService?.highlightOrganizationPin(org.id);
  }
  
  // Синхронизация результатов с картой
  private syncResultsWithMap(): void {
    const results = this.props.searchFlowManager.searchContext.results;
    this.props.mapSyncService?.syncPinsWithContent('search_results', {
      organizations: results
    });
  }
}
```

### Экран 4: Organization (Карточка организации)

**Компонент:** `src/components/Screens/OrganizationScreen.ts`

```typescript
export class OrganizationScreen {
  // Уже реализованные возможности:
  private organizationHeader: OrganizationHeader
  private organizationTabs: OrganizationTabs
  private actionBar: ActionBar
  
  // Обработчик кнопки "Назад"
  private handleBackClick(): void {
    this.props.searchFlowManager.goBack();
  }
}
```

---

## Использование существующих компонентов

### 1. Поисковые компоненты

#### SearchBar (`src/components/Search/SearchBar.ts`)

```typescript
// Инициализация
const searchBar = new SearchBar(container, {
  placeholder: 'Поиск в Москве',
  state: SearchBarState.ACTIVE,
  showSearchIcon: true,
  onFocus: () => searchFlowManager.goToSuggest(),
  onQueryChange: (query) => searchFlowManager.updateQuery(query)
});

// Управление состоянием
searchBar.setState(SearchBarState.ACTIVE);
searchBar.setValue('кафе рядом');
```

#### SearchSuggestions (`src/components/Search/SearchSuggestions.ts`)

```typescript
// Инициализация
const suggestions = new SearchSuggestions(container, {
  suggestions: [],
  showHistory: true,
  onSuggestionSelect: (suggestion) => {
    searchFlowManager.goToSearchResults(suggestion.text);
  }
});

// Обновление данных
suggestions.updateSuggestions(newSuggestions);
```

#### SearchFilters (`src/components/Search/SearchFilters.ts`)

```typescript
// Инициализация панели фильтров
const filters = new SearchFilters(container, {
  filters: searchFlowManager.searchContext.filters,
  onFiltersChange: (newFilters) => {
    searchFlowManager.updateFilters(newFilters);
  }
});
```

### 2. Компоненты шторки

#### BottomsheetContainer (`src/components/Bottomsheet/BottomsheetContainer.ts`)

```typescript
// Конфигурация шторки
const bottomsheetConfig: BottomsheetContainerProps = {
  config: {
    state: BottomsheetState.DEFAULT,
    snapPoints: [0.2, 0.5, 0.9, 0.95],
    isDraggable: true,
    hasScrollableContent: true
  },
  events: {
    onStateChange: (newState) => {
      bottomsheetManager.snapToState(newState);
      mapSyncService.adjustMapViewport(getHeightForState(newState));
    }
  }
};

const bottomsheet = new BottomsheetContainer(element, bottomsheetConfig);
```

### 3. Карточки организаций

#### OrganizationCard (`src/components/Cards/OrganizationCard.ts`)

```typescript
// Создание карточки
const card = new OrganizationCard(container, {
  organization: {
    id: 'org_1',
    name: 'Кафе "Пример"',
    address: 'ул. Тверская, 1',
    coordinates: [37.617734, 55.752023],
    isAdvertiser: false,
    rating: 4.5,
    reviewsCount: 123
  },
  size: CardSize.MEDIUM,
  onClick: (org) => searchFlowManager.goToOrganization(org)
});
```

---

## Интеграция и управление состоянием

### 1. Инициализация приложения

```typescript
// Создание основных сервисов
const searchFlowManager = new SearchFlowManager(ScreenType.DASHBOARD, {
  onScreenChange: (screen) => console.log('Screen:', screen)
});

const bottomsheetManager = new BottomsheetManager({
  state: BottomsheetState.DEFAULT,
  snapPoints: [0.2, 0.5, 0.9, 0.95],
  isDraggable: true,
  hasScrollableContent: false
});

const mapSyncService = new MapSyncService(mapRef, {
  onPinHighlight: (orgId) => console.log('Pin highlighted:', orgId)
});

// Создание экранов
const screens = {
  dashboard: new DashboardScreen({
    container: document.getElementById('dashboard'),
    searchFlowManager,
    bottomsheetManager,
    mapSyncService
  }),
  suggest: new SuggestScreen({
    container: document.getElementById('suggest'),
    searchFlowManager,
    bottomsheetManager
  }),
  searchResult: new SearchResultScreen({
    container: document.getElementById('search-results'),
    searchFlowManager,
    bottomsheetManager,
    mapSyncService
  }),
  organization: new OrganizationScreen({
    container: document.getElementById('organization'),
    searchFlowManager,
    bottomsheetManager,
    mapSyncService
  })
};
```

### 2. Управление переходами

```typescript
// Подписка на изменения экрана
searchFlowManager.onScreenChange((screen: ScreenType) => {
  // Скрыть все экраны
  Object.values(screens).forEach(s => s.deactivate());
  
  // Показать активный экран
  switch(screen) {
    case ScreenType.DASHBOARD:
      screens.dashboard.activate();
      bottomsheetManager.snapToState(BottomsheetState.DEFAULT);
      break;
    case ScreenType.SUGGEST:
      screens.suggest.activate();
      bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);
      break;
    case ScreenType.SEARCH_RESULT:
      screens.searchResult.activate();
      bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN_SCROLL);
      break;
    case ScreenType.ORGANIZATION:
      screens.organization.activate();
      bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN_SCROLL);
      break;
  }
});
```

---

## Оптимизация и лучшие практики

### 1. Использование существующих фабрик

Все компоненты имеют фабричные методы для упрощения создания:

```typescript
// Вместо new SearchBar(...)
const searchBar = SearchBarFactory.create({
  container,
  placeholder: 'Поиск в Москве'
});

// Вместо new OrganizationCard(...)
const card = OrganizationCardFactory.create({
  container,
  organization: orgData
});
```

### 2. Переиспользование компонентов

```typescript
// Один экземпляр SearchBar используется на разных экранах
const sharedSearchBar = SearchBarFactory.create({
  container: document.getElementById('search-container'),
  onQueryChange: (query) => {
    // Обновляем контекст во всех экранах
    searchFlowManager.updateQuery(query);
  }
});

// Передаем в разные экраны
const suggestScreen = new SuggestScreen({
  searchBar: sharedSearchBar, // Переиспользуем
  // ... другие пропсы
});
```

### 3. Кэширование данных

```typescript
// Используем существующий SearchFlowManager для кэширования
searchFlowManager.searchContext.suggestions; // Кэшированные подсказки
searchFlowManager.searchContext.results;     // Кэшированные результаты
searchFlowManager.searchContext.searchHistory; // История поиска
```

---

## Тестирование

### 1. Unit тесты для сервисов

```typescript
describe('SearchFlowManager', () => {
  test('should navigate to suggest screen', () => {
    const manager = new SearchFlowManager();
    manager.goToSuggest();
    expect(manager.currentScreen).toBe(ScreenType.SUGGEST);
  });
});

describe('BottomsheetManager', () => {
  test('should snap to correct state', async () => {
    const manager = new BottomsheetManager({
      state: BottomsheetState.DEFAULT,
      snapPoints: [0.2, 0.5, 0.9, 0.95],
      isDraggable: true,
      hasScrollableContent: false
    });
    
    await manager.snapToState(BottomsheetState.FULLSCREEN);
    expect(manager.getCurrentState().currentState).toBe(BottomsheetState.FULLSCREEN);
  });
});
```

### 2. Интеграционные тесты

```typescript
describe('Search Flow Integration', () => {
  test('should complete full search flow', async () => {
    const { searchFlowManager, screens } = setupTestEnvironment();
    
    // Активация поиска
    searchFlowManager.goToSuggest();
    expect(searchFlowManager.currentScreen).toBe(ScreenType.SUGGEST);
    
    // Поиск
    searchFlowManager.goToSearchResults('кафе');
    expect(searchFlowManager.currentScreen).toBe(ScreenType.SEARCH_RESULT);
    expect(searchFlowManager.searchContext.query).toBe('кафе');
    
    // Переход к организации
    const org = mockOrganization();
    searchFlowManager.goToOrganization(org);
    expect(searchFlowManager.currentScreen).toBe(ScreenType.ORGANIZATION);
    expect(searchFlowManager.searchContext.selectedOrganization).toBe(org);
  });
});
```

---

## Мониторинг и аналитика

### 1. Встроенная аналитика в сервисах

```typescript
// SearchFlowManager уже поддерживает события
const manager = new SearchFlowManager(ScreenType.DASHBOARD, {
  onScreenChange: (screen) => {
    analytics.track('screen_change', { screen });
  },
  onSearchPerformed: (query) => {
    analytics.track('search_performed', { query });
  }
});

// BottomsheetManager отслеживает взаимодействия
const bottomsheet = new BottomsheetManager(config, {
  onStateChange: (from, to) => {
    analytics.track('bottomsheet_state_change', { from, to });
  },
  onDragEnd: (finalState) => {
    analytics.track('bottomsheet_drag_interaction', { finalState });
  }
});
```

### 2. Метрики производительности

```typescript
// Используем существующие методы для измерения производительности
const performanceManager = {
  measureSearchLatency: async (query: string) => {
    const start = performance.now();
    await searchFlowManager.performSearch(query);
    const duration = performance.now() - start;
    
    analytics.track('search_performance', { query, duration });
  }
};
```

---

## Заключение

Существующая архитектура проекта уже содержит все необходимые компоненты для полной реализации сценария "Поиск и навигация":

### ✅ Что уже готово:
- **Все экраы**: Dashboard, Suggest, SearchResult, Organization
- **Все компоненты**: SearchBar, SearchSuggestions, SearchFilters, OrganizationCard
- **Управляющие сервисы**: SearchFlowManager, BottomsheetManager, MapSyncService
- **Типизация**: Полные TypeScript интерфейсы
- **Архитектурные паттерны**: Фабрики, события, состояние

### 🔧 Что нужно для интеграции:
1. **Инициализация сервисов** с правильными параметрами
2. **Подключение обработчиков событий** между компонентами
3. **Настройка переходов между экранами** через SearchFlowManager
4. **Конфигурация шторки** через BottomsheetManager
5. **Синхронизация с картой** через MapSyncService

### 🚀 Преимущества текущей архитектуры:
- **Модульность**: Каждый компонент независим и переиспользуем
- **Типобезопасность**: Полная поддержка TypeScript
- **Тестируемость**: Четкое разделение ответственности
- **Расширяемость**: Легко добавлять новые функции
- **Производительность**: Ленивая загрузка и кэширование

Данная архитектура готова к production использованию и не требует создания дополнительных компонентов - только правильной интеграции существующих. 