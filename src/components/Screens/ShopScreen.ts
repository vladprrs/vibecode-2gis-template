import { ScreenType } from '../../types';
import {
  BottomsheetManager,
  CartService,
  CartState,
  GlobalBottomActionBar,
  MapSyncService,
  SearchFlowManager,
  globalBottomActionBar,
} from '../../services';
import { ShopCategory, ShopProduct } from '../Shop';

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
  /** CSS класс */
  className?: string;
  /** Состояние скролла предыдущего экрана для восстановления */
  previousScrollPosition?: number;
  /** Обработчики событий */
  onBack?: () => void;
  onCartClick?: () => void;
}

/**
 * Экран магазина с товарами по категориям
 */
export class ShopScreen {
  private props: ShopScreenProps;
  private element: HTMLElement;
  private shopCategories: ShopCategory[] = [];
  private cartSubscription?: () => void;

  // Новые товары с актуальными данными
  private mockProducts: ShopProduct[] = [
    {
      id: 'prod-001',
      title: 'Мужские спортивные брюки Tommy Hilfiger, синие, S',
      price: 7349,
      category: 'Спортивная одежда',
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720111201494_1.jpg',
    },
    {
      id: 'prod-002',
      title: 'Мужские спортивные брюки Tommy Hilfiger, чёрные, S',
      price: 7489,
      category: 'Спортивная одежда',
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720111205591_1.jpg',
    },
    {
      id: 'prod-003',
      title: 'Брюки Tommy Hilfiger спортивные, зелёные, XL',
      price: 10529,
      category: 'Спортивная одежда',
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720646433131_1.jpg',
    },
    {
      id: 'prod-004',
      title: 'Мужские спортивные брюки Nike French Terry, серые, S',
      price: 2455,
      category: 'Спортивная одежда',
      imageUrl:
        'https://cm.samokat.ru/processed/l/product_card/7cd57dbc-42aa-4977-859f-37bd02df6309.jpg',
    },
    {
      id: 'prod-005',
      title: 'Мужские спортивные брюки Nike Repeat, синие, L',
      price: 2438,
      category: 'Спортивная одежда',
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/195870919801_1.jpg',
    },
    {
      id: 'prod-006',
      title: 'Мужские спортивные брюки Nike Yoga Dri‑Fit, серые, L',
      price: 2629,
      category: 'Спортивная одежда',
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/0194501845649_1.jpg',
    },
    {
      id: 'prod-007',
      title: 'Мужские спортивные брюки Nike Repeat, белые, L',
      price: 2438,
      category: 'Спортивная одежда',
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/195870919740_1.jpg',
    },
    {
      id: 'prod-008',
      title: 'Брюки Adidas GM5542, размер S',
      price: 1632,
      category: 'Спортивная одежда',
      imageUrl: 'https://cm.samokat.ru/processed/l/product_card/4064044668639_1.jpg',
    },
  ];

  constructor(props: ShopScreenProps) {
    this.props = props;
    this.element = props.container;
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
    // Show action bar based on initial cart state
    this.updateActionBarContent();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    this.element.innerHTML = '';
    Object.assign(this.element.style, {
      position: 'relative',
      width: '100%',
      // Remove height constraint - let it size naturally
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
      overflow: 'hidden',
      // Ensure it fills the container properly
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      minHeight: '0',
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }
    this.element.classList.add('shop-screen');
  }

  /**
   * Создание макета магазина
   */
  private createShopLayout(): void {
    // Основной контейнер шторки
    const shopContent = document.createElement('div');
    Object.assign(shopContent.style, {
      position: 'relative',
      width: '100%',
      // Remove height: 100% - let it size naturally within bottomsheet container
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      // Ensure it takes the full space available in the flex container
      flex: '1',
      minHeight: '0',
    });

    // 1. Создаем заголовок магазина
    const shopHeader = this.createShopHeader();
    shopContent.appendChild(shopHeader);

    // 2. Создаем прокручиваемое содержимое
    const scrollableContent = document.createElement('div');
    Object.assign(scrollableContent.style, {
      flex: '1',
      overflowY: 'auto',
      backgroundColor: '#F1F1F1',
      // Remove hardcoded paddingBottom - action bar will be positioned outside scroll area
    });

    // 3. Создаем содержимое магазина
    const contentContainer = this.createContentContainer();
    scrollableContent.appendChild(contentContainer);

    shopContent.appendChild(scrollableContent);

    // 4. Initialize global action bar (will be shown when cart has items)

    this.element.appendChild(shopContent);
  }

  /**
   * Создание заголовка магазина
   */
  private createShopHeader(): HTMLElement {
    const header = document.createElement('div');
    Object.assign(header.style, {
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
      position: 'relative',
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      flexShrink: '0',
    });

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
    title.className = 'shop-header-title-text';
    Object.assign(title.style, {
      margin: '0',
    });
    title.textContent = 'Магазин';
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

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      console.log('🔙 Shop back button clicked');
      this.props.onBack?.();
      this.props.searchFlowManager.goBack();
    });

    return button;
  }

  /**
   * Создание содержимого магазина
   */
  private createContentContainer(): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      backgroundColor: '#F1F1F1',
      padding: '16px',
    });

    // Группируем товары по категориям
    const categories = this.groupProductsByCategory();

    // Создаем компоненты категорий
    categories.forEach(({ title, products }) => {
      const category = new ShopCategory({
        title,
        products,
        cartService: this.props.cartService,
        onAddToCart: product => {
          console.log('🛒 Product added to cart:', product);
        },
      });

      this.shopCategories.push(category);
      container.appendChild(category.getElement());
    });

    return container;
  }

  /**
   * Группировка товаров по категориям
   */
  private groupProductsByCategory(): Array<{ title: string; products: ShopProduct[] }> {
    const categories = new Map<string, ShopProduct[]>();

    this.mockProducts.forEach(product => {
      if (!categories.has(product.category)) {
        categories.set(product.category, []);
      }
      categories.get(product.category)!.push(product);
    });

    return Array.from(categories.entries()).map(([title, products]) => ({
      title,
      products,
    }));
  }

  /**
   * Обновление содержимого глобальной панели действий
   */
  private updateActionBarContent(): void {
    const cartState = this.props.cartService.getState();

    if (cartState.totalItems === 0) {
      // Hide global action bar when cart is empty
      globalBottomActionBar.hide();
      return;
    }

    // Create cart info using static method
    const cartInfo = GlobalBottomActionBar.createCartInfo(
      this.props.cartService.getFormattedItemCount(),
      this.props.cartService.getFormattedSubtotal()
    );

    // Create view cart button using static method
    const viewCartButton = GlobalBottomActionBar.createButton(
      'Корзина',
      () => {
        this.props.onCartClick?.();
        console.log('🛒 Cart button clicked');
      },
      'primary'
    );

    // Show global action bar with content
    globalBottomActionBar.show({
      leftContent: cartInfo,
      rightContent: viewCartButton,
      className: 'shop-bottom-action-bar',
    });
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    // Обработчики уже добавлены в методах создания компонентов
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
      // Update action bar when cart changes
      this.updateActionBarContent();
    });
  }

  /**
   * Активация экрана
   */
  public activate(): void {
    console.log('🛍️ ShopScreen activated');
  }

  /**
   * Очистка ресурсов при уничтожении экрана
   */
  public destroy(): void {
    // Hide global action bar when leaving shop screen
    globalBottomActionBar.hide();

    // Отписываемся от обновлений корзины
    if (this.cartSubscription) {
      this.cartSubscription();
      this.cartSubscription = undefined;
    }

    // Очищаем компоненты категорий
    this.shopCategories.forEach(category => category.destroy());
    this.shopCategories = [];

    // Очищаем содержимое
    this.element.innerHTML = '';

    console.log('🛍️ ShopScreen destroyed');
  }
}
