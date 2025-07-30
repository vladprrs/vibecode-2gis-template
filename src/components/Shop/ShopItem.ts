import { CartItem, CartService } from '../../services';

/**
 * Интерфейс товара
 */
export interface ShopProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
}

/**
 * Пропсы для ShopItem
 */
export interface ShopItemProps {
  product: ShopProduct;
  cartService: CartService;
  onAddToCart?: (product: ShopProduct) => void;
  className?: string;
}

/**
 * Компонент товара в магазине
 * Отображает товар с кнопкой "В корзину" или stepper если товар уже в корзине
 */
export class ShopItem {
  private props: ShopItemProps;
  private element: HTMLElement;
  private cartSubscription?: () => void;

  constructor(props: ShopItemProps) {
    this.props = props;
    this.element = document.createElement('div');
    this.initialize();
  }

  /**
   * Инициализация компонента
   */
  private initialize(): void {
    this.setupElement();
    this.createItemLayout();
    this.setupEventListeners();
    this.subscribeToCartUpdates();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    this.element.className = 'shop-item-card';
    if (this.props.className) {
      this.element.classList.add(this.props.className);
    }
  }

  /**
   * Создание макета товара
   */
  private createItemLayout(): void {
    this.element.innerHTML = '';

    // Изображение товара
    const photo = this.createPhoto();
    this.element.appendChild(photo);

    // Контент товара
    const content = this.createContent();
    this.element.appendChild(content);

    // Правая часть (кнопка или stepper)
    const rightSection = this.createRightSection();
    this.element.appendChild(rightSection);
  }

  /**
   * Создание фото товара
   */
  private createPhoto(): HTMLElement {
    const photo = document.createElement('div');
    photo.className = 'shop-item-photo';

    const img = document.createElement('img');
    if (this.props.product.imageUrl) {
      img.src = this.props.product.imageUrl;
      img.alt = this.props.product.title;
    } else {
      // Placeholder для отсутствующего изображения
      img.src =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMTIiIHk9IjEyIiB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHJ4PSI4IiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjI4IiBjeT0iMjgiIHI9IjYiIGZpbGw9IiM4OTg5ODkiLz4KPHBhdGggZD0iTTg0IDYwTDU2IDMyTDI0IDY0IiBzdHJva2U9IiM4OTg5ODkiIHN0cm9rZS13aWR0aD0iMS41Ii8+Cjwvc3ZnPgo=';
      img.alt = 'Placeholder';
    }
    photo.appendChild(img);

    return photo;
  }

  /**
   * Создание контента товара
   */
  private createContent(): HTMLElement {
    const content = document.createElement('div');
    content.className = 'shop-item-content';

    // Название товара
    const title = document.createElement('div');
    title.className = 'shop-item-title';

    const titleText = document.createElement('div');
    titleText.className = 'shop-item-title-text';
    titleText.textContent = this.props.product.title;
    title.appendChild(titleText);
    content.appendChild(title);

    // Описание товара (если есть)
    if (this.props.product.description) {
      const subtitle = document.createElement('div');
      subtitle.className = 'shop-item-subtitle';
      subtitle.textContent = this.props.product.description;
      content.appendChild(subtitle);
    }

    // Цена
    const price = document.createElement('div');
    price.className = 'shop-item-price';

    const priceText = document.createElement('div');
    priceText.className = 'shop-item-price-text';
    priceText.textContent = `${this.props.product.price.toLocaleString('ru-RU')} ₽`;
    price.appendChild(priceText);
    content.appendChild(price);

    return content;
  }

  /**
   * Создание правой части (кнопка или stepper)
   */
  private createRightSection(): HTMLElement {
    const rightSection = document.createElement('div');
    Object.assign(rightSection.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      flexShrink: '0',
    });

    const cartItem = this.props.cartService.getCartItem(this.props.product.id);

    if (cartItem && cartItem.quantity > 0) {
      // Товар в корзине - показываем stepper
      const stepper = this.createStepper(cartItem);
      rightSection.appendChild(stepper);
    } else {
      // Товар не в корзине - показываем кнопку "В корзину"
      const addButton = this.createAddToCartButton();
      rightSection.appendChild(addButton);
    }

    return rightSection;
  }

  /**
   * Создание кнопки "В корзину"
   */
  private createAddToCartButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'shop-add-to-cart-button';
    button.textContent = 'В корзину';

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.props.cartService.addToCart(this.props.product);
      this.props.onAddToCart?.(this.props.product);
    });

    return button;
  }

  /**
   * Создание stepper для количества
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

    decreaseButton.addEventListener('click', event => {
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

    increaseButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const newQuantity = cartItem.quantity + 1;
      this.props.cartService.updateQuantity(cartItem.product.id, newQuantity);
    });

    stepper.appendChild(increaseButton);

    return stepper;
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    // Обработчики уже добавлены в методах создания компонентов
  }

  /**
   * Подписка на обновления корзины
   */
  private subscribeToCartUpdates(): void {
    this.cartSubscription = this.props.cartService.subscribe(() => {
      this.refreshContent();
    });
  }

  /**
   * Обновление содержимого при изменении корзины
   */
  private refreshContent(): void {
    this.createItemLayout();
  }

  /**
   * Получение DOM элемента
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Обновление пропсов
   */
  public updateProps(newProps: Partial<ShopItemProps>): void {
    this.props = { ...this.props, ...newProps };
    this.refreshContent();
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription();
      this.cartSubscription = undefined;
    }
    this.element.remove();
  }
}
