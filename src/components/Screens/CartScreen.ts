import { ScreenType } from '../../types';
import { BottomsheetManager, MapSyncService, SearchFlowManager, CartService, CartState, CartItem } from '../../services';

/**
 * Пропсы для CartScreen
 */
export interface CartScreenProps {
  /** Контейнер для монтирования экрана */
  container: HTMLElement;
  /** Менеджер поискового флоу */
  searchFlowManager: SearchFlowManager;
  /** Менеджер шторки */
  bottomsheetManager: BottomsheetManager;
  /** Сервис синхронизации карты */
  mapSyncService?: MapSyncService;
  /** Сервис корзины */
  cartService: CartService;
  /** CSS класс */
  className?: string;
  /** Состояние скролла предыдущего экрана для восстановления */
  previousScrollPosition?: number;
  /** Обработчики событий */
  onBack?: () => void;
  onOrderClick?: (cartState: CartState) => void;
}

/**
 * Экран корзины с drag-handle и snap points 20/55/90/95%
 * Показывает список товаров в корзине с возможностью изменения количества
 */
export class CartScreen {
  private props: CartScreenProps;
  private element: HTMLElement;
  private cartState: CartState;
  private cartSubscription?: () => void;

  constructor(props: CartScreenProps) {
    this.props = props;
    this.element = props.container;
    this.cartState = props.cartService.getState();
    this.initialize();
  }

  /**
   * Инициализация экрана корзины
   */
  private initialize(): void {
    this.setupElement();
    this.createCartLayout();
    this.setupEventListeners();
    this.syncWithServices();
    this.subscribeToCartUpdates();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    this.element.innerHTML = '';
    Object.assign(this.element.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
      overflow: 'hidden',
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }
    this.element.classList.add('cart-screen');
  }

  /**
   * Создание полного макета корзины
   */
  private createCartLayout(): void {
    // Основной контейнер шторки
    const bottomsheetContent = document.createElement('div');
    Object.assign(bottomsheetContent.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    });

    // 1. Создаем заголовок корзины
    const cartHeader = this.createCartHeader();
    bottomsheetContent.appendChild(cartHeader);

    // 2. Создаем прокручиваемое содержимое
    const scrollableContent = document.createElement('div');
    Object.assign(scrollableContent.style, {
      flex: '1',
      overflowY: 'auto',
      backgroundColor: '#ffffff',
      paddingBottom: '100px', // Место для нижней панели
    });

    // 3. Создаем содержимое корзины
    const contentContainer = this.createContentContainer();
    scrollableContent.appendChild(contentContainer);

    bottomsheetContent.appendChild(scrollableContent);

    // 4. Создаем нижнюю панель действий (если есть товары)
    if (this.cartState.totalItems > 0) {
      const bottomActionBar = this.createBottomActionBar();
      bottomsheetContent.appendChild(bottomActionBar);
    }

    this.element.appendChild(bottomsheetContent);
  }

  /**
   * Создание заголовка корзины
   */
  private createCartHeader(): HTMLElement {
    const header = document.createElement('div');
    Object.assign(header.style, {
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
      position: 'relative',
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      flexShrink: '0',
    });

    // Note: Drag handle is now managed by replaceBottomsheetContent in DashboardScreen

    // Навигационная панель
    const navBar = document.createElement('div');
    Object.assign(navBar.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px 16px 16px',
      backgroundColor: '#ffffff',
    });

    // Левая часть с кнопкой назад и заголовком
    const leftSection = document.createElement('div');
    Object.assign(leftSection.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: '1',
    });

    // Кнопка назад
    const backButton = this.createBackButton();
    leftSection.appendChild(backButton);

    // Заголовок с количеством товаров
    const title = document.createElement('h1');
    title.className = 'shop-header-title-text';
    Object.assign(title.style, {
      margin: '0',
    });
    
    const itemCount = this.cartState.totalItems;
    title.textContent = `Корзина (${itemCount})`;
    leftSection.appendChild(title);

    navBar.appendChild(leftSection);
    header.appendChild(navBar);

    return header;
  }

  /**
   * Создание кнопки назад
   */
  private createBackButton(): HTMLElement {
    const button = document.createElement('button');
    Object.assign(button.style, {
      width: '40px',
      height: '40px',
      border: 'none',
      borderRadius: '20px',
      backgroundColor: 'rgba(20, 20, 20, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flexShrink: '0',
    });

    // Иконка стрелки назад
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('🔙 Cart back button clicked');
      this.props.onBack?.();
      this.props.searchFlowManager.goBack();
    });

    return button;
  }

  /**
   * Создание содержимого корзины
   */
  private createContentContainer(): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      backgroundColor: '#ffffff',
      padding: '16px',
    });

    if (this.cartState.totalItems === 0) {
      // Показываем пустое состояние
      const emptyState = this.createEmptyState();
      container.appendChild(emptyState);
    } else {
      // Показываем список товаров
      const itemList = this.createItemList();
      container.appendChild(itemList);
    }

    return container;
  }

  /**
   * Создание пустого состояния
   */
  private createEmptyState(): HTMLElement {
    const emptyState = document.createElement('div');
    Object.assign(emptyState.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      minHeight: '300px',
    });

    // Иконка корзины
    const icon = document.createElement('div');
    Object.assign(icon.style, {
      width: '80px',
      height: '80px',
      backgroundColor: 'rgba(137, 137, 137, 0.1)',
      borderRadius: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px',
    });

    icon.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M8 10L12 10L16 26H28L32 16H14" stroke="#898989" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="18" cy="32" r="2" stroke="#898989" stroke-width="2"/>
        <circle cx="26" cy="32" r="2" stroke="#898989" stroke-width="2"/>
      </svg>
    `;

    emptyState.appendChild(icon);

    // Текст сообщения
    const message = document.createElement('div');
    Object.assign(message.style, {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
      color: '#898989',
      fontFamily: 'SB Sans Text',
    });
    message.textContent = 'В корзине пусто';

    emptyState.appendChild(message);

    return emptyState;
  }

  /**
   * Создание списка товаров
   */
  private createItemList(): HTMLElement {
    const itemList = document.createElement('div');
    Object.assign(itemList.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    });

    this.cartState.items.forEach((cartItem: CartItem) => {
      const itemRow = this.createItemRow(cartItem);
      itemList.appendChild(itemRow);
    });

    return itemList;
  }

  /**
   * Создание строки товара
   */
  private createItemRow(cartItem: CartItem): HTMLElement {
    const row = document.createElement('div');
    row.className = 'shop-item-card';

    // Изображение товара
    const image = document.createElement('div');
    image.className = 'shop-item-photo';
    
    const img = document.createElement('img');
    if (cartItem.product.imageUrl) {
      img.src = cartItem.product.imageUrl;
      img.alt = cartItem.product.title;
    } else {
      // Placeholder для отсутствующего изображения
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHJ4PSI4IiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjI4IiBjeT0iMjgiIHI9IjYiIGZpbGw9IiM4OTg5ODkiLz4KPHBhdGggZD0iTTg0IDYwTDU2IDMyTDI0IDY0IiBzdHJva2U9IiM4OTg5ODkiIHN0cm9rZS13aWR0aD0iMS41Ii8+Cjwvc3ZnPgo=';
      img.alt = 'Placeholder';
    }
    image.appendChild(img);

    row.appendChild(image);

    // Информация о товаре
    const info = document.createElement('div');
    info.className = 'shop-item-content';

    // Название товара
    const title = document.createElement('div');
    title.className = 'shop-item-title';
    
    const titleText = document.createElement('div');
    titleText.className = 'shop-item-title-text';
    titleText.textContent = cartItem.product.title;
    title.appendChild(titleText);
    info.appendChild(title);

    // Цена
    const price = document.createElement('div');
    price.className = 'shop-item-price';
    
    const priceText = document.createElement('div');
    priceText.className = 'shop-item-price-text';
    priceText.textContent = `${cartItem.product.price.toLocaleString('ru-RU')} ₽`;
    price.appendChild(priceText);
    info.appendChild(price);

    row.appendChild(info);

    // Правая часть: stepper
    const rightSection = document.createElement('div');
    Object.assign(rightSection.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      flexShrink: '0',
    });

    // Stepper для количества
    const stepper = this.createStepper(cartItem);
    rightSection.appendChild(stepper);

    row.appendChild(rightSection);

    return row;
  }

  /**
   * Создание stepper для количества товара
   */
  private createStepper(cartItem: CartItem): HTMLElement {
    const stepper = document.createElement('div');
    stepper.className = 'shop-stepper';

    // Кнопка уменьшения
    const decreaseButton = document.createElement('button');
    decreaseButton.className = 'shop-stepper-button';
    decreaseButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 8H12" stroke="#141414" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;

    decreaseButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const newQuantity = cartItem.quantity - 1;
      this.props.cartService.updateQuantity(cartItem.product.id, newQuantity);
    });

    stepper.appendChild(decreaseButton);

    // Количество
    const quantity = document.createElement('div');
    quantity.className = 'shop-stepper-quantity';
    quantity.textContent = cartItem.quantity.toString();
    stepper.appendChild(quantity);

    // Кнопка увеличения
    const increaseButton = document.createElement('button');
    increaseButton.className = 'shop-stepper-button';
    increaseButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 4V12M4 8H12" stroke="#141414" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;

    increaseButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const newQuantity = cartItem.quantity + 1;
      this.props.cartService.updateQuantity(cartItem.product.id, newQuantity);
    });

    stepper.appendChild(increaseButton);

    return stepper;
  }

  /**
   * Создание нижней панели действий
   */
  private createBottomActionBar(): HTMLElement {
    const actionBar = document.createElement('div');
    actionBar.className = 'shop-bottom-action-bar';

    // Контейнер для содержимого
    const content = document.createElement('div');
    content.className = 'shop-action-bar-content';

    // Левая часть с информацией о корзине
    const cartInfo = document.createElement('div');
    cartInfo.className = 'shop-cart-info';

    // Количество товаров
    const itemCountText = document.createElement('div');
    itemCountText.className = 'shop-cart-count';
    itemCountText.textContent = this.props.cartService.getFormattedItemCount();
    cartInfo.appendChild(itemCountText);

    // Общая сумма
    const totalText = document.createElement('div');
    totalText.className = 'shop-cart-total';
    totalText.textContent = this.props.cartService.getFormattedSubtotal();
    cartInfo.appendChild(totalText);

    content.appendChild(cartInfo);

    // Кнопка оформления заказа
    const orderButton = document.createElement('button');
    orderButton.className = 'shop-order-button';
    orderButton.textContent = 'Оформить заказ';

    orderButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.props.onOrderClick?.(this.cartState);
      console.log('Order clicked:', this.cartState);
    });

    content.appendChild(orderButton);
    actionBar.appendChild(content);

    return actionBar;
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    // Обработчики для элементов корзины будут добавлены при создании компонентов
  }

  /**
   * Синхронизация с сервисами
   */
  private syncWithServices(): void {
    // Синхронизация с картой (если нужно)
    if (this.props.mapSyncService) {
      // Скрываем маркеры или выполняем другие действия
    }
  }

  /**
   * Подписка на обновления корзины
   */
  private subscribeToCartUpdates(): void {
    this.cartSubscription = this.props.cartService.subscribe((newState: CartState) => {
      this.cartState = newState;
      this.refreshContent();
    });
  }

  /**
   * Обновление содержимого при изменении корзины
   */
  private refreshContent(): void {
    // Пересоздаем весь макет с новыми данными
    this.createCartLayout();
  }

  /**
   * Активация экрана
   */
  public activate(): void {
    // Можно добавить дополнительную логику активации
    console.log('🛒 CartScreen activated');
  }

  /**
   * Очистка ресурсов при уничтожении экрана
   */
  public destroy(): void {
    // Отписываемся от обновлений корзины
    if (this.cartSubscription) {
      this.cartSubscription();
      this.cartSubscription = undefined;
    }

    // Очищаем содержимое
    this.element.innerHTML = '';
    
    console.log('🛒 CartScreen destroyed');
  }
}