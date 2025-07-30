import { ScreenType } from '../../types';
import { BottomsheetManager, CartService, CartState, MapSyncService, SearchFlowManager } from '../../services';
import { ShopCategory, ShopProduct } from '../Shop';
import { BottomActionBar, BottomActionBarContent } from '../Shared';

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
  private bottomActionBar?: BottomActionBar;
  private cartSubscription?: () => void;

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

    // 4. Создаем нижнюю панель действий с новым компонентом
    this.createBottomActionBar(shopContent);

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
   * Создание нижней панели действий используя новый BottomActionBar компонент
   */
  private createBottomActionBar(container: HTMLElement): void {
    // Create the action bar using the shared component
    this.bottomActionBar = new BottomActionBar({
      container: container,
      className: 'shop-bottom-action-bar',
      visible: true,
    });

    // Update the content
    this.updateActionBarContent();
  }

  /**
   * Обновление содержимого панели действий
   */
  private updateActionBarContent(): void {
    if (!this.bottomActionBar) return;

    const cartState = this.props.cartService.getState();

    if (cartState.totalItems === 0) {
      // Hide action bar when cart is empty
      this.bottomActionBar.hide();
      return;
    }

    // Show action bar and set content
    this.bottomActionBar.show();

    // Create cart info
    const cartInfo = BottomActionBar.createCartInfo(
      this.props.cartService.getFormattedItemCount(),
      this.props.cartService.getFormattedSubtotal()
    );

    // Create view cart button
    const viewCartButton = BottomActionBar.createButton(
      'Корзина',
      () => {
        this.props.onCartClick?.();
        console.log('🛒 Cart button clicked');
      },
      'primary'
    );

    // Set the content
    this.bottomActionBar.setContent({
      leftContent: cartInfo,
      rightContent: viewCartButton,
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
    // Отписываемся от обновлений корзины
    if (this.cartSubscription) {
      this.cartSubscription();
      this.cartSubscription = undefined;
    }

    // Очищаем компонент действий
    if (this.bottomActionBar) {
      this.bottomActionBar.destroy();
      this.bottomActionBar = undefined;
    }

    // Очищаем компоненты категорий
    this.shopCategories.forEach(category => category.destroy());
    this.shopCategories = [];

    // Очищаем содержимое
    this.element.innerHTML = '';

    console.log('🛍️ ShopScreen destroyed');
  }
}
