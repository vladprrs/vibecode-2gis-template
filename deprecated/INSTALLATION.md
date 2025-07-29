# Установка и запуск VibeCode 2GIS Template

## 📋 Требования

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** для клонирования репозитория

## 🚀 Быстрая установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/vladprrs/vibecode-2gis-template.git
cd vibecode-2gis-template
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Запуск проекта

```bash
npm start
```

### 4. Открытие в браузере

Перейдите по адресу: `http://localhost:8080`

## 🔧 Детальная настройка

### Настройка 2GIS API

1. Получите API ключ на [2GIS Developer Portal](https://dev.2gis.com/)
2. Создайте файл `.env` в корне проекта:

```env
VITE_MAPGL_KEY=your-2gis-api-key-here
```

### Настройка Git

```bash
git config --global user.name "Ваше имя"
git config --global user.email "ваш.email@example.com"
```

## 📦 Доступные команды

```bash
# Разработка
npm run dev          # Запуск dev сервера
npm start           # Алиас для dev

# Сборка
npm run build       # Production сборка
npm run preview     # Предварительный просмотр сборки

# Качество кода
npm run type-check  # Проверка TypeScript типов
npm run lint        # Проверка и исправление ESLint
npm run format      # Форматирование кода с Prettier

# Очистка
npm run clean       # Удаление build артефактов
```

## 🛠 Структура проекта

```
vibecode-2gis-template/
├── src/
│   ├── components/          # React компоненты
│   │   ├── Dashboard/      # Компоненты дашборда
│   │   ├── Search/         # Поисковые компоненты
│   │   ├── Cards/          # Карточки контента
│   │   ├── Map/           # Картографические компоненты
│   │   └── Screens/       # Основные экраны
│   ├── services/           # Бизнес-логика
│   ├── types/             # TypeScript типы
│   ├── styles/            # CSS стили
│   └── config/            # Конфигурация
├── test/                   # Тестовые файлы
├── figma_export/          # Экспорт дизайна из Figma
└── package.json           # Зависимости и скрипты
```

## 🎯 Основные функции

- **Единая точка входа** - Архитектура без дублирования
- **Плавный скролл** - Интегрированный скроллинг
- **Полнофункциональный поиск** - Интеграция с 2GIS API
- **Модульная архитектура** - Компоненты: SuggestScreen, SearchFlowManager, BottomsheetManager
- **Современный UI** - Дизайн в стиле Figma

## 🔍 Отладка

### Просмотр логов

```bash
# В режиме разработки
npm run dev

# В консоли браузера
console.log('Debug info');
```

### Проверка типов

```bash
npm run type-check
```

### Проверка качества кода

```bash
npm run lint
npm run format:check
```

## 🚀 Деплой

### Сборка для продакшена

```bash
npm run build
```

### Статический хостинг

Собранные файлы в папке `dist/` можно загрузить на:
- Netlify
- Vercel
- GitHub Pages
- Любой статический хостинг

## 📞 Поддержка

При возникновении проблем:

1. Проверьте версии Node.js и npm
2. Убедитесь, что все зависимости установлены
3. Проверьте конфигурацию 2GIS API ключа
4. Создайте Issue в репозитории

## 🔄 Обновления

```bash
# Получение последних изменений
git pull origin main

# Обновление зависимостей
npm install

# Перезапуск проекта
npm start
``` 