import { ScreenType } from '../../types';
import { BottomsheetManager, MapSyncService, SearchFlowManager, CartService } from '../../services';
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

  // Моковые данные для демонстрации
  private mockProducts: ShopProduct[] = [
    {
      id: '1',
      title: 'Микробиота (Microbiota) Декуссата Карнавал d9 h20',
      price: 799,
      category: 'Саженцы',
      imageUrl: 'https://via.placeholder.com/96x96/BCD7AF/141414?text=🌱',
    },
    {
      id: '2',
      title: 'Ель (Picea) колючая Супер Грин 2л h50-70',
      price: 799,
      category: 'Саженцы',
      imageUrl: 'https://via.placeholder.com/96x96/B9D6A9/141414?text=🌲',
    },
    {
      id: '3',
      title: 'Букеты',
      description: 'Композиции в корзине от 3000 ₽\nСтоимость доставки по г. Новосибирск от 350 ₽',
      price: 3000,
      category: 'Букеты',
      imageUrl: 'https://via.placeholder.com/96x96/D9DBB6/141414?text=💐',
    },
    {
      id: '4',
      title: 'Тако Гранде «Чизбургер»',
      description: 'Котлета из мраморной говядины, халапеньо, томаты, сыр, соус чипотле...',
      price: 480,
      category: 'Букеты',
      imageUrl: 'https://via.placeholder.com/96x96/E2E0CE/141414?text=🌮',
    },
    {
      id: '5',
      title: 'Тако Гранде «Эль Чопсо»',
      description: 'Котлета из мраморной говядины, халапеньо, томаты, сыр, соус чипотле...',
      price: 440,
      category: 'Букеты',
      imageUrl: 'https://via.placeholder.com/96x96/DBDBB7/141414?text=🌮',
    },
    {
      id: '6',
      title: 'Суп «Позоле»',
      description: 'Томатно-кукурузный суп на бычьих хвостах. 290 г',
      price: 440,
      category: 'Супы',
      imageUrl: 'https://via.placeholder.com/96x96/DEDBBB/141414?text=🍲',
    },
    {
      id: '7',
      title: 'Гамбургер «Воппер»',
      description: 'Томленая рваная говядина, соус чипотле, сахар мускавадо, лук. 220 г',
      price: 380,
      category: 'Стрит-фуд',
      imageUrl: 'https://via.placeholder.com/96x96/BCD7AF/141414?text=🍔',
    },
    {
      id: '8',
      title: 'КорнДоги Сандерса (5 шт)',
      description: 'Котлета из мраморной говядины, много сыра, сальса Пико-де-гальо, ма...',
      price: 580,
      category: 'Стрит-фуд',
      imageUrl: 'https://via.placeholder.com/96x96/B9D6A9/141414?text=🌭',
    },
    {
      id: '9',
      title: 'КорнДоги Сандерса (3 шт)',
      description: 'Большие сосиски в кляре с соусами Тартар и Барбакоа. 220 г',
      price: 420,
      category: 'Стрит-фуд',
      imageUrl: 'https://via.placeholder.com/96x96/D9DBB6/141414?text=🌭',
    },
    {
      id: '10',
      title: 'Нада Добле',
      description: 'Два вида сыра, домашний сливочно-пряный соус, лук. 180 г',
      price: 330,
      category: 'Кесадилья',
      imageUrl: 'https://via.placeholder.com/96x96/E2E0CE/141414?text=🧀',
    },
    {
      id: '11',
      title: 'Пойо 2.0',
      description: 'Домашняя пшеничная лепёшка, куриные стрипсы, кукуруза, сыр, зелёный лу...',
      price: 580,
      category: 'Кесадилья',
      imageUrl: 'https://via.placeholder.com/96x96/DBDBB7/141414?text=🌯',
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
   * Создание макета магазина
   */
  private createShopLayout(): void {
    // Основной контейнер шторки
    const shopContent = document.createElement('div');
    Object.assign(shopContent.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
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
      paddingBottom: '100px', // Место для нижней панели
    });

    // 3. Создаем содержимое магазина
    const contentContainer = this.createContentContainer();
    scrollableContent.appendChild(contentContainer);

    shopContent.appendChild(scrollableContent);

    // 4. Создаем нижнюю панель действий
    const bottomActionBar = this.createBottomActionBar();
    shopContent.appendChild(bottomActionBar);

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

    button.addEventListener('click', (event) => {
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
        onAddToCart: (product) => {
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

    // Кнопка корзины
    const cartButton = document.createElement('button');
    cartButton.className = 'shop-order-button';
    cartButton.textContent = 'Корзина';

    cartButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.props.onCartClick?.();
      console.log('🛒 Cart button clicked');
    });

    content.appendChild(cartButton);
    actionBar.appendChild(content);

    return actionBar;
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
   * Активация экрана
   */
  public activate(): void {
    console.log('🛍️ ShopScreen activated');
  }

  /**
   * Очистка ресурсов при уничтожении экрана
   */
  public destroy(): void {
    // Очищаем компоненты категорий
    this.shopCategories.forEach(category => category.destroy());
    this.shopCategories = [];

    // Очищаем содержимое
    this.element.innerHTML = '';
    
    console.log('🛍️ ShopScreen destroyed');
  }
}