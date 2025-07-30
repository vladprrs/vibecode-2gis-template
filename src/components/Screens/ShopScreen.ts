import { Shop, ScreenType, Product, ProductCategory } from '../../types';
import { BottomsheetManager, MapSyncService, SearchFlowManager, CartService, CartState } from '../../services';

/**
 * Пропсы для ShopScreen
 */
export interface ShopScreenProps {
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
  /** Данные магазина */
  shop: Shop;
  /** CSS класс */
  className?: string;
  /** Состояние скролла предыдущего экрана для восстановления */
  previousScrollPosition?: number;
  /** Обработчики событий */
  onBack?: () => void;
  onAddToCart?: (product: Product) => void;
  onRemoveFromCart?: (product: Product) => void;
  onUpdateQuantity?: (product: Product, quantity: number) => void;
  onCartClick?: () => void;
}

/**
 * Экран магазина с точной копией дизайна Figma
 * Использует bottomsheet с drag-handle и snap points 20/55/90/95%
 */
export class ShopScreen {
  private props: ShopScreenProps;
  private element: HTMLElement;
  private cartState: CartState;
  private cartSubscription?: () => void;
  private activeCategory: string | null = null;

  constructor(props: ShopScreenProps) {
    this.props = props;
    this.element = props.container;
    this.cartState = props.cartService.getState();
    this.initialize();
  }

  /**
   * Инициализация экрана магазина
   */
  private initialize(): void {
    this.setupElement();
    this.createShopLayout();
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
    this.element.classList.add('shop-screen');
  }

  /**
   * Создание полного макета магазина из Figma
   */
  private createShopLayout(): void {
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

    // Фиксированная часть
    const fixedSection = document.createElement('div');
    Object.assign(fixedSection.style, {
      position: 'sticky',
      top: '0',
      zIndex: '10',
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
    });

    // Заголовок с drag handle
    const header = this.createHeader();
    fixedSection.appendChild(header);

    // Панель табов (фильтры категорий)
    if (this.props.shop.categories.length > 1) {
      const tabBar = this.createTabBar();
      fixedSection.appendChild(tabBar);
    }

    bottomsheetContent.appendChild(fixedSection);

    // Прокручиваемое содержимое
    const scrollableContent = document.createElement('div');
    Object.assign(scrollableContent.style, {
      flex: '1',
      overflowY: 'auto',
      backgroundColor: '#ffffff',
      paddingBottom: '100px', // Место для нижней панели
    });

    // Основное содержимое (товары по категориям)
    const contentContainer = this.createContentContainer();
    scrollableContent.appendChild(contentContainer);

    bottomsheetContent.appendChild(scrollableContent);

    // Нижняя панель действий (корзина)
    const bottomActionBar = this.createBottomActionBar();
    bottomsheetContent.appendChild(bottomActionBar);

    this.element.appendChild(bottomsheetContent);
  }

  /**
   * Создание заголовка магазина
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    Object.assign(header.style, {
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
      position: 'relative',
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

    // Заголовок
    const title = document.createElement('h1');
    Object.assign(title.style, {
      margin: '0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '19px',
      fontWeight: '600',
      lineHeight: '24px',
      letterSpacing: '-0.437px',
      flex: '1',
    });
    title.textContent = this.props.shop.name;
    leftSection.appendChild(title);

    navBar.appendChild(leftSection);

    // Правая часть с поиском (если есть в дизайне)
    // Пока оставляем пустой по требованиям

    header.appendChild(navBar);

    return header;
  }

  /**
   * Создание кнопки назад
   */
  private createBackButton(): HTMLElement {
    const button = document.createElement('button');
    Object.assign(button.style, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '8px',
      background: 'rgba(20, 20, 20, 0.06)',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      width: '40px',
      height: '40px',
    });

    const iconWrapper = document.createElement('div');
    Object.assign(iconWrapper.style, {
      width: '24px',
      height: '24px',
      position: 'relative',
    });

    iconWrapper.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="position: absolute; left: 0; top: 0;">
        <path d="M15 18l-6-6 6-6" stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    button.addEventListener('click', () => this.handleBack());
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(20, 20, 20, 0.12)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(20, 20, 20, 0.06)';
    });

    button.appendChild(iconWrapper);
    return button;
  }

  /**
   * Создание панели табов для категорий
   */
  private createTabBar(): HTMLElement {
    const tabBar = document.createElement('div');
    Object.assign(tabBar.style, {
      position: 'relative',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid rgba(137, 137, 137, 0.15)',
    });

    // Fade mask для горизонтального скролла
    const fadeContainer = document.createElement('div');
    Object.assign(fadeContainer.style, {
      position: 'relative',
      overflow: 'hidden',
    });

    const scrollContainer = document.createElement('div');
    Object.assign(scrollContainer.style, {
      display: 'flex',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      padding: '0 16px',
      gap: '8px',
    });

    // Скрываем скроллбар webkit
    const style = document.createElement('style');
    style.textContent = `
      .shop-tab-container::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    scrollContainer.className = 'shop-tab-container';

    // Создаем табы для категорий
    this.props.shop.categories.forEach((category, index) => {
      const tab = this.createCategoryTab(category, index === 0);
      scrollContainer.appendChild(tab);
    });

    fadeContainer.appendChild(scrollContainer);
    tabBar.appendChild(fadeContainer);

    return tabBar;
  }

  /**
   * Создание таба категории
   */
  private createCategoryTab(category: ProductCategory, isActive: boolean = false): HTMLElement {
    const tab = document.createElement('button');
    Object.assign(tab.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '20px',
      backgroundColor: isActive ? '#1976D2' : 'rgba(20, 20, 20, 0.06)',
      color: isActive ? '#ffffff' : '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.3px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
    });

    const categoryName = document.createElement('span');
    categoryName.textContent = category.name;

    const categoryCount = document.createElement('span');
    Object.assign(categoryCount.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '18px',
      height: '18px',
      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(20, 20, 20, 0.1)',
      borderRadius: '9px',
      fontSize: '13px',
      fontWeight: '500',
      lineHeight: '16px',
      letterSpacing: '-0.234px',
      padding: '0 4px',
    });
    categoryCount.textContent = category.count.toString();

    tab.appendChild(categoryName);
    tab.appendChild(categoryCount);

    // Обработчики событий
    tab.addEventListener('click', () => {
      this.selectCategory(category.id);
      this.updateTabStyles(tab);
    });

    tab.addEventListener('mouseenter', () => {
      if (!isActive) {
        tab.style.backgroundColor = 'rgba(20, 20, 20, 0.12)';
      }
    });

    tab.addEventListener('mouseleave', () => {
      if (!isActive) {
        tab.style.backgroundColor = 'rgba(20, 20, 20, 0.06)';
      }
    });

    if (isActive) {
      this.activeCategory = category.id;
    }

    return tab;
  }

  /**
   * Создание основного содержимого с товарами
   */
  private createContentContainer(): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      backgroundColor: '#ffffff',
    });

    // Создаем секции для каждой категории
    this.props.shop.categories.forEach(category => {
      const categorySection = this.createCategorySection(category);
      container.appendChild(categorySection);
    });

    return container;
  }

  /**
   * Создание секции категории
   */
  private createCategorySection(category: ProductCategory): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, {
      margin: '0 0 24px 0',
    });
    section.setAttribute('data-category-id', category.id);

    // Заголовок категории
    const headerContainer = document.createElement('div');
    Object.assign(headerContainer.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 16px 8px 16px',
      margin: '0',
    });

    const title = document.createElement('h2');
    Object.assign(title.style, {
      margin: '0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
    });
    title.textContent = category.name;

    const counter = document.createElement('div');
    Object.assign(counter.style, {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '19px',
      height: '19px',
      backgroundColor: 'rgba(20, 20, 20, 0.06)',
      borderRadius: '9.5px',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '13px',
      fontWeight: '500',
      lineHeight: '16px',
      letterSpacing: '-0.234px',
      padding: '0 4px',
    });
    counter.textContent = category.count.toString();

    headerContainer.appendChild(title);
    headerContainer.appendChild(counter);
    section.appendChild(headerContainer);

    // Список товаров
    const productsList = document.createElement('div');
    Object.assign(productsList.style, {
      display: 'flex',
      flexDirection: 'column',
    });

    category.products.forEach(product => {
      const productCard = this.createProductCard(product);
      productsList.appendChild(productCard);
    });

    section.appendChild(productsList);

    return section;
  }

  /**
   * Создание карточки товара
   */
  private createProductCard(product: Product): HTMLElement {
    const card = document.createElement('div');
    card.setAttribute('data-product-id', product.id);
    Object.assign(card.style, {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 16px',
      borderBottom: '1px solid rgba(137, 137, 137, 0.1)',
    });

    // Фото товара
    const photo = this.createProductPhoto(product);
    card.appendChild(photo);

    // Контент товара
    const content = this.createProductContent(product);
    card.appendChild(content);

    return card;
  }

  /**
   * Создание фото товара
   */
  private createProductPhoto(product: Product): HTMLElement {
    const photoContainer = document.createElement('div');
    Object.assign(photoContainer.style, {
      width: '96px',
      height: '96px',
      borderRadius: '8px',
      overflow: 'hidden',
      flexShrink: '0',
      backgroundColor: '#F5F5F5',
      position: 'relative',
    });

    if (product.imageUrl) {
      const img = document.createElement('img');
      Object.assign(img.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      });
      img.src = product.imageUrl;
      img.alt = product.title;
      photoContainer.appendChild(img);
    } else {
      // Плейсхолдер если нет изображения
      const placeholder = document.createElement('div');
      Object.assign(placeholder.style, {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#898989',
        fontSize: '32px',
      });
      placeholder.textContent = '📦';
      photoContainer.appendChild(placeholder);
    }

    return photoContainer;
  }

  /**
   * Создание контента товара
   */
  private createProductContent(product: Product): HTMLElement {
    const content = document.createElement('div');
    Object.assign(content.style, {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    });

    // Название товара
    const title = document.createElement('div');
    Object.assign(title.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
      margin: '0',
    });
    title.textContent = product.title;
    content.appendChild(title);

    // Описание товара (если есть)
    if (product.description) {
      const description = document.createElement('div');
      Object.assign(description.style, {
        color: '#898989',
        fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '18px',
        letterSpacing: '-0.28px',
      });
      description.textContent = product.description;
      content.appendChild(description);
    }

    // Цена и кнопка добавления
    const priceSection = document.createElement('div');
    Object.assign(priceSection.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'auto',
    });

    const price = document.createElement('div');
    Object.assign(price.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '19px',
      fontWeight: '500',
      lineHeight: '24px',
      letterSpacing: '-0.437px',
    });
    price.textContent = `${product.price} ₽`;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'product-button-container';
    const addButton = this.createAddToCartButton(product);
    buttonContainer.appendChild(addButton);

    priceSection.appendChild(price);
    priceSection.appendChild(buttonContainer);
    content.appendChild(priceSection);

    return content;
  }

  /**
   * Создание кнопки добавления в корзину
   */
  private createAddToCartButton(product: Product): HTMLElement {
    const quantity = this.props.cartService.getProductQuantity(product.id);

    if (quantity === 0) {
      // Кнопка "В корзину"
      const button = document.createElement('button');
      Object.assign(button.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#1976D2',
        border: 'none',
        borderRadius: '8px',
        color: '#ffffff',
        fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
        fontSize: '15px',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '-0.3px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      });

      const icon = document.createElement('span');
      icon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;

      const text = document.createElement('span');
      text.textContent = 'В корзину';

      button.appendChild(icon);
      button.appendChild(text);

      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.addToCart(product);
      });

      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#1565C0';
      });
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#1976D2';
      });

      return button;
    } else {
      // Stepper для изменения количества
      return this.createQuantityStepper(product, quantity);
    }
  }

  /**
   * Создание stepper для изменения количества
   */
  private createQuantityStepper(product: Product, quantity: number): HTMLElement {
    const stepper = document.createElement('div');
    Object.assign(stepper.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '4px',
      backgroundColor: 'rgba(20, 20, 20, 0.06)',
      borderRadius: '8px',
    });

    // Кнопка уменьшения
    const decreaseButton = document.createElement('button');
    Object.assign(decreaseButton.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#141414',
    });

    decreaseButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3.5 8h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    decreaseButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.decreaseQuantity(product);
    });

    // Количество
    const quantityLabel = document.createElement('span');
    Object.assign(quantityLabel.style, {
      minWidth: '20px',
      textAlign: 'center',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
    });
    quantityLabel.textContent = quantity.toString();

    // Кнопка увеличения
    const increaseButton = document.createElement('button');
    Object.assign(increaseButton.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#141414',
    });

    increaseButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    increaseButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.increaseQuantity(product);
    });

    stepper.appendChild(decreaseButton);
    stepper.appendChild(quantityLabel);
    stepper.appendChild(increaseButton);

    return stepper;
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
      padding: '16px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid rgba(137, 137, 137, 0.15)',
      zIndex: '100',
    });

    const button = document.createElement('button');
    Object.assign(button.style, {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '16px',
      backgroundColor: '#1976D2',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.3px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    });

    // Иконка корзины
    const cartIcon = document.createElement('span');
    cartIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 3h2l.4 2m0 0L7 13h6l2-8H5.4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="9" cy="17" r="1" stroke="currentColor" stroke-width="2"/>
        <circle cx="15" cy="17" r="1" stroke="currentColor" stroke-width="2"/>
      </svg>
    `;

    // Счетчик товаров в корзине и текст кнопки
    const totalItems = this.cartState.totalItems;
    
    if (totalItems > 0) {
      // Показываем корзину с количеством и суммой
      const text = document.createElement('span');
      text.textContent = `Корзина • ${this.cartState.totalPrice.toLocaleString('ru-RU')} ₽`;
      
      const counter = document.createElement('span');
      Object.assign(counter.style, {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '20px',
        height: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '500',
        lineHeight: '16px',
        letterSpacing: '-0.234px',
        padding: '0 4px',
      });
      counter.textContent = totalItems.toString();
      
      button.appendChild(cartIcon);
      button.appendChild(text);
      button.appendChild(counter);
    } else {
      // Показываем обычную кнопку заказа
      const text = document.createElement('span');
      text.textContent = 'Заказать доставку';
      
      button.appendChild(cartIcon);
      button.appendChild(text);
    }

    button.addEventListener('click', () => {
      this.props.onCartClick?.();
    });

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#1565C0';
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#1976D2';
    });

    actionBar.appendChild(button);

    return actionBar;
  }

  /**
   * Обработчики действий с товарами
   */
  private addToCart(product: Product): void {
    this.props.cartService.addToCart(product, 1);
    this.props.onAddToCart?.(product);
    // updateProductButton and updateBottomActionBar will be called via cart subscription
  }

  private increaseQuantity(product: Product): void {
    const currentQuantity = this.props.cartService.getProductQuantity(product.id);
    const newQuantity = currentQuantity + 1;
    this.props.cartService.updateQuantity(product.id, newQuantity);
    this.props.onUpdateQuantity?.(product, newQuantity);
    // updateProductButton and updateBottomActionBar will be called via cart subscription
  }

  private decreaseQuantity(product: Product): void {
    const currentQuantity = this.props.cartService.getProductQuantity(product.id);
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      this.props.cartService.updateQuantity(product.id, newQuantity);
      this.props.onUpdateQuantity?.(product, newQuantity);
    } else {
      this.props.cartService.removeFromCart(product.id);
      this.props.onRemoveFromCart?.(product);
    }
    // updateProductButton and updateBottomActionBar will be called via cart subscription
  }

  /**
   * Обновление кнопки товара
   */
  private updateProductButton(product: Product): void {
    // Находим карточку товара и обновляем кнопку
    const productCards = this.element.querySelectorAll('[data-product-id]');
    productCards.forEach(card => {
      if (card.getAttribute('data-product-id') === product.id) {
        const buttonContainer = card.querySelector('.product-button-container');
        if (buttonContainer) {
          buttonContainer.innerHTML = '';
          const newButton = this.createAddToCartButton(product);
          buttonContainer.appendChild(newButton);
        }
      }
    });
  }

  /**
   * Обновление нижней панели
   */
  private updateBottomActionBar(): void {
    const actionBar = this.element.querySelector('.shop-screen div:last-child');
    if (actionBar) {
      actionBar.innerHTML = '';
      const newActionBar = this.createBottomActionBar();
      actionBar.appendChild(newActionBar.firstChild!);
    }
  }

  /**
   * Выбор категории
   */
  private selectCategory(categoryId: string): void {
    this.activeCategory = categoryId;
    
    // Прокручиваем к секции категории
    const categorySection = this.element.querySelector(`[data-category-id="${categoryId}"]`);
    if (categorySection) {
      categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Обновление стилей табов
   */
  private updateTabStyles(activeTab: HTMLElement): void {
    const allTabs = this.element.querySelectorAll('.shop-tab-container button');
    allTabs.forEach(tab => {
      if (tab === activeTab) {
        Object.assign((tab as HTMLElement).style, {
          backgroundColor: '#1976D2',
          color: '#ffffff',
        });
        
        const counter = tab.querySelector('span:last-child') as HTMLElement;
        if (counter) {
          counter.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }
      } else {
        Object.assign((tab as HTMLElement).style, {
          backgroundColor: 'rgba(20, 20, 20, 0.06)',
          color: '#141414',
        });
        
        const counter = tab.querySelector('span:last-child') as HTMLElement;
        if (counter) {
          counter.style.backgroundColor = 'rgba(20, 20, 20, 0.1)';
        }
      }
    });
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Синхронизация с сервисами
   */
  private syncWithServices(): void {
    this.props.searchFlowManager.currentScreen = ScreenType.SHOP;

    // Карта остается видимой в фоне, pin highlighting не требуется
    if (this.props.mapSyncService) {
      // Можно добавить логику синхронизации карты если нужно
    }
  }

  /**
   * Обработчики событий
   */
  private handleBack(): void {
    if (this.props.previousScrollPosition !== undefined) {
      setTimeout(() => {
        const scrollableElement = document.querySelector('.bottomsheet-content');
        if (scrollableElement) {
          scrollableElement.scrollTop = this.props.previousScrollPosition!;
        }
      }, 100);
    }

    this.props.searchFlowManager.goBack();
    this.props.onBack?.();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.handleBack();
    }
  }

  private handleResize(): void {
    // Адаптация при изменении размера экрана
  }

  /**
   * Подписка на обновления корзины
   */
  private subscribeToCartUpdates(): void {
    this.cartSubscription = this.props.cartService.subscribe((newState: CartState) => {
      this.cartState = newState;
      this.refreshCartDependentUI();
    });
  }

  /**
   * Обновление UI элементов, зависящих от корзины
   */
  private refreshCartDependentUI(): void {
    // Обновляем все кнопки товаров
    this.refreshAllProductButtons();
    
    // Обновляем нижнюю панель действий
    this.updateBottomActionBar();
  }

  /**
   * Обновление всех кнопок товаров
   */
  private refreshAllProductButtons(): void {
    const productCards = this.element.querySelectorAll('[data-product-id]');
    productCards.forEach(card => {
      const productId = card.getAttribute('data-product-id');
      if (productId) {
        const product = this.findProductById(productId);
        if (product) {
          this.updateProductButton(product);
        }
      }
    });
  }

  /**
   * Найти товар по ID
   */
  private findProductById(productId: string): Product | undefined {
    for (const category of this.props.shop.categories) {
      const product = category.products.find(p => p.id === productId);
      if (product) {
        return product;
      }
    }
    return undefined;
  }

  /**
   * Публичные методы
   */
  public activate(): void {
    this.element.style.display = 'block';
    this.syncWithServices();
  }

  public deactivate(): void {
    this.element.style.display = 'none';
  }

  public refresh(): void {
    // Обновление данных магазина
  }

  public updateShop(shop: Shop): void {
    this.props.shop = shop;
    // Перерендериваем содержимое
    this.element.innerHTML = '';
    this.createShopLayout();
    this.syncWithServices();
  }

  public getState(): any {
    return {
      screen: ScreenType.SHOP,
      shop: this.props.shop,
      cartState: this.cartState,
      activeCategory: this.activeCategory,
    };
  }

  public destroy(): void {
    // Отписываемся от обновлений корзины
    if (this.cartSubscription) {
      this.cartSubscription();
      this.cartSubscription = undefined;
    }

    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));

    if (this.props.mapSyncService) {
      // Очистка если нужно
    }

    this.element.innerHTML = '';
    console.log('🛍️ ShopScreen destroyed');
  }
}

/**
 * Фабрика для создания ShopScreen
 */
export class ShopScreenFactory {
  static create(props: ShopScreenProps): ShopScreen {
    return new ShopScreen(props);
  }

  static createDefault(
    container: HTMLElement,
    searchFlowManager: SearchFlowManager,
    bottomsheetManager: BottomsheetManager,
    cartService: CartService,
    shop: Shop
  ): ShopScreen {
    return new ShopScreen({
      container,
      searchFlowManager,
      bottomsheetManager,
      cartService,
      shop,
    });
  }
}