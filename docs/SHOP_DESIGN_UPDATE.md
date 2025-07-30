# Shop Design Update - Figma Integration

## Обзор изменений

Обновлен дизайн shop компонентов на основе экспорта из Figma (`figma_export/shop/state_default/`). Все компоненты теперь соответствуют точному дизайну из Figma с правильными размерами, цветами, типографикой и анимациями.

## Ключевые изменения

### 1. Создан новый файл стилей `src/styles/shop.css`

- **CSS переменные** для консистентности цветов и размеров
- **Компонентные стили** для всех элементов shop
- **Адаптивный дизайн** для мобильных устройств
- **Анимации и переходы** для улучшения UX

### 2. Обновлены компоненты

#### CartScreen.ts
- ✅ Обновлен дизайн карточек товаров в корзине
- ✅ Новый stepper компонент для изменения количества
- ✅ Обновленная нижняя панель действий
- ✅ Использование CSS классов вместо inline стилей

#### ShopItem.ts (новый)
- ✅ Компонент товара в магазине
- ✅ Автоматическое переключение между кнопкой "В корзину" и stepper
- ✅ Подписка на изменения корзины
- ✅ Правильная структура HTML согласно Figma

#### ShopCategory.ts (новый)
- ✅ Компонент категории товаров
- ✅ Заголовок с счетчиком товаров
- ✅ Список товаров с правильными отступами

#### ShopScreen.ts (обновлен)
- ✅ Полностью переписан на основе новых компонентов
- ✅ Моковые данные для демонстрации
- ✅ Правильная структура согласно Figma дизайну

### 3. Дизайн-система

#### Цвета
```css
--shop-primary-color: #141414;
--shop-secondary-color: #898989;
--shop-background: #ffffff;
--shop-card-background: #ffffff;
--shop-border-color: rgba(137, 137, 137, 0.30);
```

#### Типографика
- **Шрифт**: SB Sans Text
- **Заголовки**: 16px, 600 weight, -0.24px letter-spacing
- **Цены**: 19px, 500 weight, -0.437px letter-spacing
- **Описания**: 14px, 400 weight, -0.28px letter-spacing

#### Размеры
- **Карточки товаров**: 96x96px фото
- **Stepper**: 48px высота
- **Кнопки**: 12px border-radius
- **Отступы**: 16px между элементами

## Компоненты

### ShopItem
```typescript
interface ShopProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
}
```

### ShopCategory
```typescript
interface ShopCategoryProps {
  title: string;
  products: ShopProduct[];
  cartService: CartService;
  onAddToCart?: (product: ShopProduct) => void;
}
```

### CartScreen
- Обновлен для использования новых CSS классов
- Улучшен stepper компонент
- Новая нижняя панель действий

## Демонстрация

Создана демонстрационная страница `figma_export/shop/demo.html` для тестирования обновленного дизайна.

### Запуск демо
```bash
# Откройте файл в браузере
open figma_export/shop/demo.html
```

## Интеграция

### Подключение стилей
```typescript
// В main.ts добавлен импорт
import './styles/shop.css';
```

### Использование компонентов
```typescript
import { ShopItem, ShopCategory } from './components/Shop';
import { ShopScreen } from './components/Screens/ShopScreen';

// Создание товара
const shopItem = new ShopItem({
  product: productData,
  cartService: cartService,
  onAddToCart: (product) => console.log('Added:', product)
});

// Создание категории
const category = new ShopCategory({
  title: 'Саженцы',
  products: productsData,
  cartService: cartService
});
```

## Соответствие Figma

### Проверенные элементы
- ✅ Размеры и отступы карточек товаров
- ✅ Цветовая схема и типографика
- ✅ Stepper компонент с правильными размерами
- ✅ Кнопки "В корзину" и "Оформить заказ"
- ✅ Нижняя панель действий
- ✅ Заголовки категорий с счетчиками
- ✅ Анимации и hover эффекты

### Изображения
- ✅ Placeholder изображения для отсутствующих фото
- ✅ Правильные размеры 96x96px
- ✅ Border radius 8px
- ✅ Border с прозрачностью

## Тестирование

### Функциональность
- ✅ Добавление товаров в корзину
- ✅ Изменение количества через stepper
- ✅ Удаление товаров из корзины
- ✅ Обновление общей суммы
- ✅ Подписка на изменения корзины

### Визуальное соответствие
- ✅ Точные размеры из Figma
- ✅ Правильные цвета и шрифты
- ✅ Анимации и переходы
- ✅ Адаптивность на мобильных устройствах

## Следующие шаги

1. **Интеграция с API** - подключение реальных данных товаров
2. **Оптимизация изображений** - lazy loading и кэширование
3. **Дополнительные анимации** - улучшение UX
4. **Тестирование на реальных устройствах** - проверка производительности

## Файлы изменений

- `src/styles/shop.css` - новые стили
- `src/components/Shop/ShopItem.ts` - компонент товара
- `src/components/Shop/ShopCategory.ts` - компонент категории
- `src/components/Screens/CartScreen.ts` - обновленный экран корзины
- `src/components/Screens/ShopScreen.ts` - обновленный экран магазина
- `figma_export/shop/demo.html` - демонстрационная страница
- `src/main.ts` - подключение стилей
- `src/components/Screens/index.ts` - обновление экспортов 