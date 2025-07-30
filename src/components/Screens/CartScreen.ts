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
    Object.assign(title.style, {
      fontSize: '19px',
      fontWeight: '500',
      lineHeight: '24px',
      letterSpacing: '-0.437px',
      color: '#141414',
      margin: '0',
      fontFamily: 'SB Sans Text',
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
    Object.assign(row.style, {
      display: 'flex',
      padding: '12px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
      gap: '12px',
    });

    // Изображение товара
    const image = document.createElement('div');
    Object.assign(image.style, {
      width: '60px',
      height: '60px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      flexShrink: '0',
      backgroundImage: cartItem.product.imageUrl ? `url(${cartItem.product.imageUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });

    if (!cartItem.product.imageUrl) {
      image.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="#898989" stroke-width="1.5"/>
          <circle cx="8.5" cy="8.5" r="1.5" stroke="#898989" stroke-width="1.5"/>
          <path d="M21 15L16 10L5 21" stroke="#898989" stroke-width="1.5"/>
        </svg>
      `;
    }

    row.appendChild(image);

    // Информация о товаре
    const info = document.createElement('div');
    Object.assign(info.style, {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minWidth: '0', // Для корректного сжатия текста
    });

    // Название товара
    const name = document.createElement('div');
    Object.assign(name.style, {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
    name.textContent = cartItem.product.title;
    info.appendChild(name);

    // Цена за единицу
    const price = document.createElement('div');
    Object.assign(price.style, {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '18px',
      letterSpacing: '-0.28px',
      color: '#898989',
      fontFamily: 'SB Sans Text',
      marginTop: '4px',
    });
    price.textContent = `${cartItem.product.price.toLocaleString('ru-RU')} ₽ за шт.`;
    info.appendChild(price);

    row.appendChild(info);

    // Правая часть: селектор количества и общая цена
    const rightSection = document.createElement('div');
    Object.assign(rightSection.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      flexShrink: '0',
    });

    // Селектор количества
    const quantitySelector = this.createQuantitySelector(cartItem);
    rightSection.appendChild(quantitySelector);

    // Общая цена строки
    const lineTotal = document.createElement('div');
    Object.assign(lineTotal.style, {
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
      marginTop: '8px',
    });
    lineTotal.textContent = this.props.cartService.getFormattedLineTotal(cartItem.product.id);
    rightSection.appendChild(lineTotal);

    row.appendChild(rightSection);

    return row;
  }

  /**
   * Создание селектора количества
   */
  private createQuantitySelector(cartItem: CartItem): HTMLElement {
    const selector = document.createElement('div');
    Object.assign(selector.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#f5f5f5',
      borderRadius: '20px',
      padding: '4px',
    });

    // Кнопка уменьшения
    const decreaseButton = document.createElement('button');
    Object.assign(decreaseButton.style, {
      width: '32px',
      height: '32px',
      border: 'none',
      borderRadius: '16px',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
    });

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

    selector.appendChild(decreaseButton);

    // Количество
    const quantity = document.createElement('div');
    Object.assign(quantity.style, {
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '20px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
      minWidth: '24px',
      textAlign: 'center',
    });
    quantity.textContent = cartItem.quantity.toString();
    selector.appendChild(quantity);

    // Кнопка увеличения
    const increaseButton = document.createElement('button');
    Object.assign(increaseButton.style, {
      width: '32px',
      height: '32px',
      border: 'none',
      borderRadius: '16px',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
    });

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

    selector.appendChild(increaseButton);

    return selector;
  }

  /**
   * Создание нижней панели действий
   */
  private createBottomActionBar(): HTMLElement {
    const actionBar = document.createElement('div');
    Object.assign(actionBar.style, {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: '#ffffff',
      borderTop: '1px solid rgba(0, 0, 0, 0.08)',
      padding: '16px',
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08)',
      zIndex: '10',
    });

    // Контейнер для содержимого
    const content = document.createElement('div');
    Object.assign(content.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    });

    // Левая часть с суммой
    const leftSection = document.createElement('div');
    Object.assign(leftSection.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    });

    // Количество товаров
    const itemCountText = document.createElement('div');
    Object.assign(itemCountText.style, {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '18px',
      letterSpacing: '-0.28px',
      color: '#898989',
      fontFamily: 'SB Sans Text',
    });
    itemCountText.textContent = this.props.cartService.getFormattedItemCount();
    leftSection.appendChild(itemCountText);

    // Общая сумма
    const totalText = document.createElement('div');
    Object.assign(totalText.style, {
      fontSize: '19px',
      fontWeight: '600',
      lineHeight: '24px',
      letterSpacing: '-0.437px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
    });
    totalText.textContent = this.props.cartService.getFormattedSubtotal();
    leftSection.appendChild(totalText);

    content.appendChild(leftSection);

    // Кнопка оформления заказа
    const orderButton = document.createElement('button');
    Object.assign(orderButton.style, {
      backgroundColor: '#0066CC',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
      cursor: 'pointer',
      fontFamily: 'SB Sans Text',
      flexShrink: '0',
    });
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