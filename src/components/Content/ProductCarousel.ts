import { Product } from '../../types';
import { CartService } from '../../services';

/**
 * Props для ProductCarousel
 */
export interface ProductCarouselProps {
  /** Контейнер для монтирования карусели */
  container: HTMLElement;
  /** Сервис корзины */
  cartService: CartService;
  /** Список товаров для отображения */
  products: Product[];
  /** CSS класс */
  className?: string;
  /** Обработчики событий */
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  /** Обработчик клика на весь блок карусели для открытия магазина */
  onCarouselClick?: () => void;
}

/**
 * Карусель товаров для результатов поиска
 * Идентична по стилю карусели в OrganizationScreen
 */
export class ProductCarousel {
  private props: ProductCarouselProps;
  private element: HTMLElement;
  private cartSubscription?: () => void;
  private intersectionObserver?: IntersectionObserver;
  private isVisible: boolean = false;
  private isInitialized: boolean = false;

  constructor(props: ProductCarouselProps) {
    this.props = props;
    this.element = props.container;
    this.initialize();
  }

  /**
   * Инициализация карусели
   */
  private initialize(): void {
    this.setupElement();
    this.setupIntersectionObserver();
    this.subscribeToCartUpdates();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    Object.assign(this.element.style, {
      margin: '16px',
      cursor: 'pointer',
      backgroundColor: '#ffffff',
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }
    this.element.classList.add('product-carousel');

    // Создаем placeholder для lazy loading
    this.createPlaceholder();
  }

  /**
   * Создание placeholder до загрузки контента
   */
  private createPlaceholder(): void {
    const placeholder = document.createElement('div');
    Object.assign(placeholder.style, {
      height: '200px', // Примерная высота карусели
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#898989',
      fontSize: '14px',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
    });
    placeholder.textContent = 'Загрузка товаров...';
    this.element.appendChild(placeholder);
  }

  /**
   * Настройка Intersection Observer для lazy loading
   */
  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback для старых браузеров - загружаем сразу
      this.initializeContent();
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isInitialized) {
            this.isVisible = true;
            this.initializeContent();
            // Отключаем observer после первой загрузки
            this.intersectionObserver?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Загружаем за 50px до появления в viewport
        threshold: 0.1,
      }
    );

    this.intersectionObserver.observe(this.element);
  }

  /**
   * Инициализация контента карусели
   */
  private initializeContent(): void {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.element.innerHTML = '';
    this.createContent();
  }

  /**
   * Создание содержимого карусели
   */
  private createContent(): void {
    // Заголовок секции с иконкой перехода
    const headerContainer = document.createElement('div');
    Object.assign(headerContainer.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
    });

    const title = document.createElement('h3');
    Object.assign(title.style, {
      margin: '0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
    });
    title.textContent = 'Возможно, вас заинтересует';

    const arrowIcon = document.createElement('div');
    Object.assign(arrowIcon.style, {
      width: '24px',
      height: '24px',
      color: '#898989',
    });
    arrowIcon.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    headerContainer.appendChild(title);
    headerContainer.appendChild(arrowIcon);

    // Галерея товаров (горизонтальный скролл)
    const gallery = document.createElement('div');
    Object.assign(gallery.style, {
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      paddingBottom: '4px',
    });

    // Скрываем скроллбар webkit
    const style = document.createElement('style');
    style.textContent = `
      .product-carousel-gallery::-webkit-scrollbar {
        display: none;
      }
    `;
    if (!document.head.querySelector('style[data-product-carousel-gallery]')) {
      style.setAttribute('data-product-carousel-gallery', 'true');
      document.head.appendChild(style);
    }
    gallery.className = 'product-carousel-gallery';

    // Отображаем товары
    this.props.products.forEach(product => {
      const item = this.createProductItem(product);
      gallery.appendChild(item);
    });

    // Добавляем спейсер в конце
    const spacer = document.createElement('div');
    Object.assign(spacer.style, {
      width: '16px',
      flexShrink: '0',
    });
    gallery.appendChild(spacer);

    this.element.appendChild(headerContainer);
    this.element.appendChild(gallery);

    // Обработчик клика на весь блок карусели для открытия магазина
    this.element.addEventListener('click', (event) => {
      // Проверяем, что клик не на кнопке добавления в корзину или на отдельном товаре
      const target = event.target as HTMLElement;
      const isAddButton = target.closest('button') && target.closest('button')?.textContent === '+';
      const isStepperButton = target.closest('button') && (target.closest('button')?.textContent === '−' || target.closest('button')?.textContent === '+');
      const isProductItem = target.closest('.product-item');
      
      // Если клик не на кнопке добавления/удаления или на отдельном товаре, открываем магазин
      if (!isAddButton && !isStepperButton && !isProductItem) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Carousel clicked - opening shop');
        this.props.onCarouselClick?.();
      }
    });

    // Обработчик клика для перехода к магазину (опционально)
    if (this.props.onProductClick) {
      headerContainer.addEventListener('click', () => {
        // Можно открыть магазин или другое действие
        console.log('Header clicked - could navigate to shop');
      });
    }

    // Hover эффекты
    this.element.addEventListener('mouseenter', () => {
      this.element.style.backgroundColor = 'rgba(20, 20, 20, 0.02)';
      this.element.style.borderRadius = '8px';
      this.element.style.padding = '8px';
      this.element.style.margin = '8px';
    });

    this.element.addEventListener('mouseleave', () => {
      this.element.style.backgroundColor = '#ffffff';
      this.element.style.padding = '0';
      this.element.style.margin = '16px';
    });
  }

  /**
   * Создание элемента товара с кнопкой добавления в корзину
   */
  private createProductItem(product: Product): HTMLElement {
    const item = document.createElement('div');
    item.className = 'product-item';
    Object.assign(item.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '232px',
      maxWidth: '232px',
      flexShrink: '0',
    });

    // Фото товара
    const photo = document.createElement('div');
    Object.assign(photo.style, {
      width: '232px',
      height: '142px',
      borderRadius: '8px',
      overflow: 'hidden',
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
      
      // Обработчик клика на изображение
      img.addEventListener('click', (event) => {
        event.stopPropagation();
        this.props.onProductClick?.(product);
      });
      
      photo.appendChild(img);
    } else {
      // Плейсхолдер
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
      placeholder.textContent = '🛍️';
      photo.appendChild(placeholder);
    }

    // Кнопка добавления в корзину
    const actionContainer = document.createElement('div');
    Object.assign(actionContainer.style, {
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      zIndex: '2',
    });

    const quantity = this.props.cartService.getProductQuantity(product.id);

    if (quantity > 0) {
      // Товар в корзине - показываем stepper
      const stepper = this.createStepper(product, quantity);
      actionContainer.appendChild(stepper);
    } else {
      // Товар не в корзине - показываем кнопку добавления
      const addButton = this.createAddButton(product);
      actionContainer.appendChild(addButton);
    }

    photo.appendChild(actionContainer);

    // Информация о товаре
    const info = document.createElement('div');
    Object.assign(info.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    });

    // Название товара
    const title = document.createElement('div');
    Object.assign(title.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '18px',
      letterSpacing: '-0.28px',
      cursor: 'pointer',
    });
    title.textContent = product.title;

    // Обработчик клика на название
    title.addEventListener('click', (event) => {
      event.stopPropagation();
      this.props.onProductClick?.(product);
    });

    // Цена
    const priceRow = document.createElement('div');
    const price = document.createElement('div');
    Object.assign(price.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '18px',
      letterSpacing: '-0.28px',
    });
    price.textContent = `${product.price} ₽`;

    priceRow.appendChild(price);
    info.appendChild(title);
    info.appendChild(priceRow);

    item.appendChild(photo);
    item.appendChild(info);

    return item;
  }

  /**
   * Создание кнопки добавления в корзину
   */
  private createAddButton(product: Product): HTMLElement {
    const button = document.createElement('button');
    Object.assign(button.style, {
      width: '32px',
      height: '32px',
      borderRadius: '16px',
      border: 'none',
      backgroundColor: '#1976D2',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.2s ease',
    });

    button.innerHTML = '+';

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      this.props.cartService.addToCart(product);
      this.props.onAddToCart?.(product);
    });

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#1565C0';
      button.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#1976D2';
      button.style.transform = 'scale(1)';
    });

    return button;
  }

  /**
   * Создание stepper для управления количеством
   */
  private createStepper(product: Product, quantity: number): HTMLElement {
    const stepper = document.createElement('div');
    Object.assign(stepper.style, {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
    });

    // Кнопка уменьшения
    const decreaseButton = document.createElement('button');
    Object.assign(decreaseButton.style, {
      width: '32px',
      height: '32px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#1976D2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
    });

    decreaseButton.innerHTML = '−';

    // Количество
    const quantityDisplay = document.createElement('div');
    Object.assign(quantityDisplay.style, {
      minWidth: '24px',
      textAlign: 'center',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
    });
    quantityDisplay.textContent = quantity.toString();

    // Кнопка увеличения
    const increaseButton = document.createElement('button');
    Object.assign(increaseButton.style, {
      width: '32px',
      height: '32px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#1976D2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
    });

    increaseButton.innerHTML = '+';

    // Обработчики событий
    decreaseButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const newQuantity = quantity - 1;
      this.props.cartService.updateQuantity(product.id, newQuantity);
    });

    increaseButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const newQuantity = quantity + 1;
      this.props.cartService.updateQuantity(product.id, newQuantity);
    });

    stepper.appendChild(decreaseButton);
    stepper.appendChild(quantityDisplay);
    stepper.appendChild(increaseButton);

    return stepper;
  }

  /**
   * Подписка на обновления корзины
   */
  private subscribeToCartUpdates(): void {
    this.cartSubscription = this.props.cartService.subscribe(() => {
      if (this.isInitialized) {
        this.refreshCarousel();
      }
    });
  }

  /**
   * Обновление карусели при изменении корзины
   */
  private refreshCarousel(): void {
    const gallery = this.element.querySelector('.product-carousel-gallery');
    if (gallery) {
      // Очищаем содержимое
      gallery.innerHTML = '';

      // Пересоздаем элементы
      this.props.products.forEach(product => {
        const item = this.createProductItem(product);
        gallery.appendChild(item);
      });

      // Добавляем спейсер
      const spacer = document.createElement('div');
      Object.assign(spacer.style, {
        width: '16px',
        flexShrink: '0',
      });
      gallery.appendChild(spacer);
    }
  }

  /**
   * Публичные методы
   */
  public updateProducts(products: Product[]): void {
    this.props.products = products;
    if (this.isInitialized) {
      this.refreshCarousel();
    }
  }

  public show(): void {
    this.element.style.display = 'block';
  }

  public hide(): void {
    this.element.style.display = 'none';
  }

  public destroy(): void {
    // Отключаем intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = undefined;
    }

    // Отписываемся от обновлений корзины
    if (this.cartSubscription) {
      this.cartSubscription();
      this.cartSubscription = undefined;
    }

    // Очищаем содержимое
    this.element.innerHTML = '';
  }
}

/**
 * Фабрика для создания ProductCarousel
 */
export class ProductCarouselFactory {
  static create(props: ProductCarouselProps): ProductCarousel {
    return new ProductCarousel(props);
  }

  static createDefault(
    container: HTMLElement,
    cartService: CartService,
    products: Product[]
  ): ProductCarousel {
    return new ProductCarousel({
      container,
      cartService,
      products,
    });
  }
}