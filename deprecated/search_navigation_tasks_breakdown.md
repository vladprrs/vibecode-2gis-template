# План задач: Реализация сценария "Поиск и навигация"

## Общая информация

**Проект**: 2GIS Web Prototype - Search & Navigation Flow  
**Цель**: Реализация полного пользовательского флоу поиска и навигации  
**Архитектура**: Единая система шторки поверх интерактивной карты

---

## Фаза 1: Архитектурная основа (Приоритет: КРИТИЧЕСКИЙ)

### 📋 1.1 Базовые архитектурные интерфейсы
**Временная оценка**: 1-2 дня  
**Исполнитель**: Senior Frontend Developer  
**Зависимости**: Нет

**Задачи:**
- [ ] **arch_bottomsheet_system**: Реализовать единую систему состояний шторки
  - Создать `BottomsheetState` enum (SMALL, DEFAULT, FULLSCREEN, FULLSCREEN_SCROLL)
  - Создать `BottomsheetConfig` interface с настройками snap points
  - Определить константы высот для разных состояний

- [ ] **arch_flow_manager**: Создать менеджер переходов между экранами
  - Реализовать `SearchFlowManager` interface
  - Создать навигационный контекст и методы переходов
  - Настроить хранение состояния текущего экрана

- [ ] **arch_map_sync**: Реализовать синхронизацию карты и шторки
  - Создать `MapBottomsheetSync` interface
  - Реализовать методы обновления пинов и viewport
  - Настроить систему событий для синхронизации

---

## Фаза 2: Базовые компоненты (Приоритет: ВЫСОКИЙ)

### 📋 2.1 Компоненты шторки
**Временная оценка**: 3-4 дня  
**Исполнитель**: Frontend Developer  
**Зависимости**: Фаза 1

**Задачи:**
- [ ] **components_bottomsheet_base**: Создать базовые компоненты шторки
  - `BottomsheetContainer.tsx` - основной контейнер с логикой состояний
  - `BottomsheetHeader.tsx` - заголовок с поисковой строкой
  - `BottomsheetDragger.tsx` - драггер для изменения высоты
  - `BottomsheetContent.tsx` - контентная область с прокруткой

**Технические требования:**
- Поддержка всех состояний высоты
- Gesture handling для драггера
- Адаптивность под разные размеры экранов
- Accessibility support

### 📋 2.2 Поисковые компоненты
**Временная оценка**: 2-3 дня  
**Исполнитель**: Frontend Developer  
**Зависимости**: 2.1

**Задачи:**
- [ ] **components_search_base**: Создать поисковые компоненты
  - `SearchBar.tsx` - поисковая строка с состояниями (inactive/active/filled)
  - `SearchSuggestions.tsx` - компонент списка подсказок
  - `SearchFilters.tsx` - панель фильтров с горизонтальной прокруткой

**Технические требования:**
- Debouncing для поискового ввода
- Keyboard navigation
- Управление фокусом
- Анимации появления/скрытия

### 📋 2.3 Карточки организаций
**Временная оценка**: 2-3 дня  
**Исполнитель**: Frontend Developer  
**Зависимости**: 2.1

**Задачи:**
- [ ] **components_cards_base**: Создать карточки организаций
  - `OrganizationCard.tsx` - базовая карточка с общей логикой
  - `AdvertiserCard.tsx` - расширенная карточка рекламодателя
  - `RegularCard.tsx` - обычная карточка организации

**Технические требования:**
- Responsive design
- Lazy loading для изображений
- Interaction states (hover, pressed)
- Consistent spacing и typography

---

## Фаза 3: Экраны приложения (Приоритет: ВЫСОКИЙ)

### 📋 3.1 Dashboard экран
**Временная оценка**: 4-5 дней  
**Исполнитель**: Frontend Developer  
**Зависимости**: Фаза 2

**Задачи:**
- [ ] **screen_dashboard**: Реализовать экран Dashboard
  - `DashboardScreen.tsx` - основной экран с логикой состояний
  - `Stories.tsx` - горизонтальный блок историй
  - `MetaItems.tsx` - карточки категорий и рубрик  
  - `PromoBlocks.tsx` - промо-блоки и баннеры
  - `ButtonRows.tsx` - ряды кнопок быстрого доступа

**Технические требования:**
- Горизонтальные скроллы для Stories
- Ленивая загрузка контента
- Интеграция с поисковой строкой
- Управление состояниями шторки

### 📋 3.2 Suggest экран
**Временная оценка**: 2-3 дня  
**Исполнитель**: Frontend Developer  
**Зависимости**: 3.1

**Задачи:**
- [ ] **screen_suggest**: Реализовать экран Suggest
  - `SuggestScreen.tsx` - экран с подсказками поиска
  - `SuggestionsList.tsx` - список различных типов подсказок
  - `SearchHistory.tsx` - история предыдущих поисков

**Технические требования:**
- Активная поисковая строка с клавиатурой
- Динамическое обновление подсказок
- Группировка подсказок по типам
- Интеграция с поисковым API

### 📋 3.3 Search Results экран
**Временная оценка**: 3-4 дня  
**Исполнитель**: Frontend Developer  
**Зависимости**: 3.2

**Задачи:**
- [ ] **screen_search_results**: Реализовать экран SearchResult
  - `SearchResultScreen.tsx` - экран с результатами поиска
  - `ResultsList.tsx` - виртуализированный список результатов
  - `FilterPanel.tsx` - панель фильтров с состояниями
  - `ResultCard.tsx` - карточки результатов разных типов

**Технические требования:**
- Infinite scrolling для результатов
- Фильтрация в реальном времени
- Синхронизация с пинами на карте
- Интеграция рекламных блоков

### 📋 3.4 Organization экран
**Временная оценка**: 4-5 дней  
**Исполнитель**: Frontend Developer  
**Зависимости**: 3.3

**Задачи:**
- [ ] **screen_organization**: Реализовать экран Organization
  - `OrganizationScreen.tsx` - карточка организации с табами
  - `OrganizationHeader.tsx` - заголовки для разных типов организаций
  - `OrganizationTabs.tsx` - табы переключения контента
  - `ActionBar.tsx` - панель действий (звонок, маршрут, сохранить)
  - `InfoBlocks/` - информационные блоки (about, contacts, worktime, etc.)

**Технические требования:**
- Табы без изменения высоты шторки
- Адаптивный контент для рекламодателей/обычных организаций
- Фотогалерея с горизонтальной прокруткой
- Интеграция с внешними сервисами (звонки, навигация)

---

## Фаза 4: Хуки и утилиты (Приоритет: ВЫСОКИЙ)

### 📋 4.1 Основные хуки
**Временная оценка**: 3-4 дня  
**Исполнитель**: Senior Frontend Developer  
**Зависимости**: Фаза 3

**Задачи:**
- [ ] **hooks_bottomsheet**: Создать хук useBottomsheet
  - Управление состояниями шторки (state, height, isDragging)
  - Методы snapToState и handleDragEnd
  - Анимированные переходы между состояниями
  - Обработка gesture events

- [ ] **hooks_search_context**: Создать хук useSearchContext
  - Управление поисковым состоянием (query, filters, results, suggestions)
  - Асинхронный метод performSearch с обработкой ошибок
  - Методы updateFilters и selectOrganization
  - Интеграция с поисковым API

- [ ] **hooks_map_sync**: Создать хук useMapSync
  - Обновление пинов на карте (updateMapPins)
  - Выделение активного пина (highlightPin)
  - Адаптация viewport под высоту шторки (adjustViewport)
  - Ref management для MapView

**Технические требования:**
- Оптимизация с useCallback и useMemo
- Правильная очистка ресурсов в useEffect
- TypeScript типизация
- Error boundaries

---

## Фаза 5: Анимации и переходы (Приоритет: СРЕДНИЙ)

### 📋 5.1 Анимационная система
**Временная оценка**: 3-4 дня  
**Исполнитель**: Frontend Developer (анимации)  
**Зависимости**: Фаза 4

**Задачи:**
- [ ] **animations_bottomsheet**: Реализовать анимации шторки
  - `snapToHeight` - плавное изменение высоты с easing
  - `fadeInContent` - анимация появления содержимого
  - `dragGesture` - обработка gesture анимаций
  - Настройка duration и easing curves

- [ ] **animations_screen_transitions**: Реализовать переходы между экранами
  - `dashboardToSuggest` - анимация активации поиска
  - `suggestToResults` - переход к результатам поиска
  - `resultsToOrganization` - открытие карточки организации
  - Координация анимаций UI и появления пинов на карте

**Технические требования:**
- Использование React Native Animated API
- 60 FPS performance
- Прерывание анимаций при пользовательском вводе
- Accessibility considerations

---

## Фаза 6: Оптимизация производительности (Приоритет: СРЕДНИЙ)

### 📋 6.1 Performance оптимизации
**Временная оценка**: 2-3 дня  
**Исполнитель**: Senior Frontend Developer  
**Зависимости**: Фаза 5

**Задачи:**
- [ ] **performance_virtualization**: Реализовать виртуализацию длинных списков
  - Настройка VirtualizedList для результатов поиска
  - Оптимизация renderItem с useCallback
  - Конфигурация parameters (windowSize, initialNumToRender, etc.)
  - removeClippedSubviews optimization

- [ ] **performance_lazy_loading**: Реализовать ленивую загрузку компонентов
  - React.lazy() для компонентов Stories, OrganizationTabs, FilterPanel
  - Suspense с fallback компонентами (скелетоны)
  - Code splitting по экранам
  - Bundle size мониторинг

- [ ] **performance_caching**: Создать систему кэширования данных
  - useDataCache hook с Map-based storage
  - TTL система для данных (5 минут default)
  - Cache invalidation strategies
  - Memory management

**Технические требования:**
- Performance profiling до и после оптимизаций
- Memory leak detection
- Bundle size reduction measurements
- FCP и LCP optimizations

---

## Фаза 7: Тестирование (Приоритет: ВЫСОКИЙ)

### 📋 7.1 Test Suite
**Временная оценка**: 4-5 дней  
**Исполнитель**: QA Engineer + Frontend Developer  
**Зависимости**: Фаза 6

**Задачи:**
- [ ] **testing_unit_hooks**: Написать unit тесты для всех кастомных хуков
  - Тесты для useBottomsheet (state transitions, snap points)
  - Тесты для useSearchContext (API calls, error handling)
  - Тесты для useMapSync (pin updates, viewport changes)
  - React Testing Library + renderHook

- [ ] **testing_integration_flow**: Написать интеграционные тесты
  - Полный пользовательский флоу от Dashboard до Organization
  - Тестирование переходов между экранами
  - Синхронизация карты и шторки
  - Error scenarios и edge cases

- [ ] **testing_e2e**: Настроить и написать E2E тесты
  - Detox/Playwright setup для мобильных тестов
  - Critical user journeys automation
  - Performance benchmarks
  - Cross-platform testing (iOS/Android)

**Технические требования:**
- Test coverage > 80% для критических компонентов
- CI/CD integration
- Automated visual regression testing
- Performance regression tests

---

## Фаза 8: Мониторинг и аналитика (Приоритет: СРЕДНИЙ)

### 📋 8.1 Analytics & Monitoring
**Временная оценка**: 2-3 дня  
**Исполнитель**: Frontend Developer + Analytics  
**Зависимости**: Фаза 7

**Задачи:**
- [ ] **analytics_events**: Реализовать трекинг ключевых событий
  - SearchAnalytics события (search_initiated, suggestion_selected, result_clicked)
  - Bottomsheet взаимодействия (state_changed, dragged)
  - User journey events с контекстом
  - GDPR-compliant data collection

- [ ] **analytics_performance**: Реализовать мониторинг производительности
  - measureSearchLatency для API calls
  - measureBottomsheetAnimationPerformance
  - React DevTools Profiler integration
  - Real User Monitoring (RUM)

**Технические требования:**
- Privacy-first аналитика
- Real-time performance dashboards
- Alerting для критических метрик
- A/B testing infrastructure готовность

---

## Временная диаграмма и зависимости

```
Неделя 1: [Фаза 1] ──→ [Фаза 2.1]
Неделя 2: [Фаза 2.2] ──→ [Фаза 2.3] ──→ [Фаза 3.1]
Неделя 3: [Фаза 3.2] ──→ [Фаза 3.3] 
Неделя 4: [Фаза 3.4] ──→ [Фаза 4.1]
Неделя 5: [Фаза 5.1] ┐
                      ├──→ [Фаза 7.1]
Неделя 6: [Фаза 6.1] ┘
Неделя 7: [Фаза 8.1] ──→ [Финальное тестирование]
```

---

## Критические зависимости

### 🔴 Блокирующие зависимости:
1. **Фаза 1 → Все остальные фазы** - архитектурные интерфейсы
2. **Фаза 2 → Фаза 3** - базовые компоненты для экранов
3. **Фаза 3 → Фаза 4** - экраны для хуков

### 🟡 Важные зависимости:
1. **Фаза 4 → Фаза 5** - хуки для анимаций
2. **Фаза 5 → Фаза 6** - анимации для оптимизаций
3. **Все фазы → Фаза 7** - готовый код для тестирования

### 🟢 Независимые задачи:
1. **Фаза 8** - может разрабатываться параллельно
2. **Документация** - может вестись на протяжении всего процесса
3. **Дизайн системы** - может уточняться параллельно

---

## Команда и роли

### 👨‍💻 Senior Frontend Developer (1 человек)
- Архитектурные решения (Фаза 1)
- Ключевые хуки (Фаза 4)
- Code review и архитектурный надзор

### 👩‍💻 Frontend Developer (2 человека)
- Компоненты (Фаза 2)
- Экраны (Фаза 3)
- Анимации (Фаза 5)
- Оптимизации (Фаза 6)

### 🧪 QA Engineer (1 человек)
- Тестирование (Фаза 7)
- E2E автоматизация
- Performance testing

### 📊 Analytics Engineer (0.5 человека)
- Настройка аналитики (Фаза 8)
- Дашборды мониторинга

---

## Критерии готовности (Definition of Done)

### ✅ Для каждой задачи:
- [ ] Код написан и отревьюен
- [ ] Unit тесты написаны и проходят
- [ ] TypeScript типизация корректна
- [ ] Accessibility требования выполнены
- [ ] Performance требования соблюдены
- [ ] Документация обновлена

### ✅ Для каждой фазы:
- [ ] Все задачи фазы завершены
- [ ] Интеграционные тесты проходят
- [ ] QA подтверждение
- [ ] Stakeholder approval

### ✅ Для всего проекта:
- [ ] Полный пользовательский флоу работает
- [ ] E2E тесты проходят на всех платформах
- [ ] Performance метрики в пределах требований
- [ ] Готовность к production release

---

## Риски и митigation

### 🔴 Высокие риски:
1. **Сложность gesture handling** → Раннее прототипирование
2. **Performance на слабых устройствах** → Тестирование с первых итераций
3. **Синхронизация карты и UI** → Изолированное тестирование интеграции

### 🟡 Средние риски:
1. **Анимации могут тормозить на Android** → Fallback варианты
2. **API латентность влияет на UX** → Optimistic updates
3. **Сложность тестирования анимаций** → Visual regression tools

### 🟢 Низкие риски:
1. **Изменения в дизайне** → Компонентный подход
2. **Новые требования** → Модульная архитектура 