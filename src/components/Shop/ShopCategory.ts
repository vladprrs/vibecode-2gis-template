import { ShopItem, ShopItemProps, ShopProduct } from './ShopItem';
import { CartService } from '../../services';

/**
 * Пропсы для ShopCategory
 */
export interface ShopCategoryProps {
  title: string;
  products: ShopProduct[];
  cartService: CartService;
  onAddToCart?: (product: ShopProduct) => void;
  className?: string;
}

/**
 * Компонент категории товаров в магазине
 * Отображает заголовок категории с счетчиком и список товаров
 */
export class ShopCategory {
  private props: ShopCategoryProps;
  private element: HTMLElement;
  private shopItems: ShopItem[] = [];

  constructor(props: ShopCategoryProps) {
    this.props = props;
    this.element = document.createElement('div');
    this.initialize();
  }

  /**
   * Инициализация компонента
   */
  private initialize(): void {
    this.setupElement();
    this.createCategoryLayout();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    this.element.className = 'shop-category';
    if (this.props.className) {
      this.element.classList.add(this.props.className);
    }
  }

  /**
   * Создание макета категории
   */
  private createCategoryLayout(): void {
    this.element.innerHTML = '';

    // Заголовок категории
    const header = this.createCategoryHeader();
    this.element.appendChild(header);

    // Список товаров
    const productList = this.createProductList();
    this.element.appendChild(productList);
  }

  /**
   * Создание заголовка категории
   */
  private createCategoryHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'shop-header';

    const titleContainer = document.createElement('div');
    titleContainer.className = 'shop-header-title';

    const title = document.createElement('div');
    title.className = 'shop-header-title-text';
    title.textContent = this.props.title;
    titleContainer.appendChild(title);

    // Счетчик товаров
    const counterContainer = document.createElement('div');
    counterContainer.className = 'shop-header-counter';

    const counterBadge = document.createElement('div');
    counterBadge.className = 'shop-counter-badge';

    const counterText = document.createElement('div');
    counterText.className = 'shop-counter-text';
    counterText.textContent = this.props.products.length.toString();
    counterBadge.appendChild(counterText);

    counterContainer.appendChild(counterBadge);
    titleContainer.appendChild(counterContainer);
    header.appendChild(titleContainer);

    return header;
  }

  /**
   * Создание списка товаров
   */
  private createProductList(): HTMLElement {
    const list = document.createElement('div');
    Object.assign(list.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      paddingBottom: '16px',
    });

    // Очищаем предыдущие элементы
    this.shopItems.forEach(item => item.destroy());
    this.shopItems = [];

    // Создаем новые элементы товаров
    this.props.products.forEach(product => {
      const shopItemProps: ShopItemProps = {
        product,
        cartService: this.props.cartService,
        onAddToCart: this.props.onAddToCart,
      };

      const shopItem = new ShopItem(shopItemProps);
      this.shopItems.push(shopItem);
      list.appendChild(shopItem.getElement());
    });

    return list;
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
  public updateProps(newProps: Partial<ShopCategoryProps>): void {
    this.props = { ...this.props, ...newProps };
    this.createCategoryLayout();
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    this.shopItems.forEach(item => item.destroy());
    this.shopItems = [];
    this.element.remove();
  }
}
