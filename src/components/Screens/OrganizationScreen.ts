import { Organization, Product, ProductCategory, ScreenType, Shop } from '../../types';
import { BottomsheetManager, CartService, MapSyncService, SearchFlowManager } from '../../services';
import { TabBar } from '../Organization';
import { ShopProduct } from '../Shop';
import { getProductRepository } from '../../data/products';

/**
 * Пропсы для OrganizationScreen
 */
export interface OrganizationScreenProps {
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
  /** Данные организации */
  organization: Organization;
  /** CSS класс */
  className?: string;
  /** Состояние скролла предыдущего экрана для восстановления */
  previousScrollPosition?: number;
  /** Обработчики событий */
  onBack?: () => void;
  onCallClick?: (organization: Organization) => void;
  onRouteClick?: (organization: Organization) => void;
  onFavoriteToggle?: (organization: Organization, isFavorite: boolean) => void;
  onShareClick?: (organization: Organization) => void;
}

/**
 * Экран организации с точной копией дизайна Figma для не-рекламодателей
 * Использует bottomsheet с drag-handle и snap points 20/55/90/95%
 */
export class OrganizationScreen {
  private props: OrganizationScreenProps;
  private element: HTMLElement;
  private isFavorite: boolean = false;
  private cartSubscription?: () => void;
  private productRepository = getProductRepository();

  constructor(props: OrganizationScreenProps) {
    this.props = props;
    this.element = props.container;
    this.initialize();
  }

  /**
   * Инициализация экрана организации
   */
  private initialize(): void {
    this.setupElement();
    this.createNonAdvertiserLayout();
    this.setupEventListeners();
    this.syncWithServices();
    this.subscribeToCartUpdates();
  }

  /**
   * Получить продукты в формате ShopProduct из ProductRepository
   */
  private getShopProducts(): ShopProduct[] {
    return this.productRepository.getSportsClothing().map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category || 'Спортивная одежда',
    }));
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
    this.element.classList.add('organization-screen');
  }

  /**
   * Создание полного макета не-рекламодателя из Figma
   */
  private createNonAdvertiserLayout(): void {
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

    // 1. Создаем заголовок организации (Organization card top)
    const organizationCardTop = this.createOrganizationCardTop();
    bottomsheetContent.appendChild(organizationCardTop);

    // 2. Создаем фиксированную панель табов
    const tabBarContainer = this.createTabBar();
    bottomsheetContent.appendChild(tabBarContainer);

    // 3. Создаем прокручиваемое содержимое
    const scrollableContent = document.createElement('div');
    Object.assign(scrollableContent.style, {
      flex: '1',
      overflowY: 'auto',
      backgroundColor: '#ffffff',
    });

    // 4. Создаем основное содержимое (Content-non-RD)
    const contentContainer = this.createContentContainer();
    scrollableContent.appendChild(contentContainer);

    bottomsheetContent.appendChild(scrollableContent);

    this.element.appendChild(bottomsheetContent);
  }

  /**
   * Создание фиксированной панели табов
   */
  private createTabBar(): HTMLElement {
    const tabBarContainer = document.createElement('div');
    Object.assign(tabBarContainer.style, {
      position: 'sticky',
      top: '0',
      zIndex: '10',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      flexShrink: '0',
    });

    // Создаем Tab Bar компонент
    new TabBar({
      container: tabBarContainer,
      items: [
        { label: 'Обзор' },
        { label: 'Вам может пригодиться', count: 45 },
        { label: 'Фото', count: 432 },
        { label: 'Отзывы', count: 232 },
        { label: 'Инфо' },
        { label: 'Акции' },
      ],
    });

    return tabBarContainer;
  }

  /**
   * Создание заголовка организации (Organization card top)
   */
  private createOrganizationCardTop(): HTMLElement {
    const cardTop = document.createElement('div');
    Object.assign(cardTop.style, {
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
      position: 'relative',
    });

    // Note: Drag handle is now managed by replaceBottomsheetContent in DashboardScreen

    // RD контент контейнер
    const rdContainer = document.createElement('div');
    Object.assign(rdContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignSelf: 'stretch',
      borderRadius: '16px 16px 0 0',
      background: '#FFF',
    });

    // Контент с padding
    const contentContainer = document.createElement('div');
    Object.assign(contentContainer.style, {
      display: 'flex',
      padding: '0 16px 16px 16px',
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignSelf: 'stretch',
    });

    // Верхняя секция с контентом и кнопкой закрытия
    const topSection = document.createElement('div');
    Object.assign(topSection.style, {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      alignSelf: 'stretch',
    });

    // Левая секция с друзьями и заголовком
    const leftContent = document.createElement('div');
    Object.assign(leftContent.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      flex: '1 0 0',
    });

    // Заголовок карточки
    const cardHeader = this.createCardHeader();
    leftContent.appendChild(cardHeader);

    topSection.appendChild(leftContent);

    // Кнопка закрытия
    const closeButton = this.createCloseButton();
    topSection.appendChild(closeButton);

    contentContainer.appendChild(topSection);

    // Секция с рейтингом и временем поездки
    const ratingSection = this.createRatingSection();
    contentContainer.appendChild(ratingSection);

    rdContainer.appendChild(contentContainer);
    cardTop.appendChild(rdContainer);

    return cardTop;
  }

  /**
   * Создание секции друзей
   */
  private createFriendsSection(): HTMLElement {
    const friendsContainer = document.createElement('div');
    Object.assign(friendsContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '10px',
      alignSelf: 'stretch',
    });

    const friendsRow = document.createElement('div');
    Object.assign(friendsRow.style, {
      display: 'flex',
      width: '72px',
      padding: '4px 0',
      alignItems: 'flex-start',
      gap: '4px',
    });

    // 4 позиции для друзей
    for (let i = 0; i < 4; i++) {
      const position = document.createElement('div');
      Object.assign(position.style, {
        width: i === 3 ? '24px' : '12px',
        height: '24px',
        position: 'relative',
      });

      const avatar = document.createElement('div');
      Object.assign(avatar.style, {
        width: '24px',
        height: '24px',
        borderRadius: '12px',
        border: '0.5px solid rgba(137, 137, 137, 0.30)',
        background: '#E0E0E0',
        position: 'absolute',
        left: '0px',
        top: '0px',
      });

      position.appendChild(avatar);
      friendsRow.appendChild(position);
    }

    friendsContainer.appendChild(friendsRow);
    return friendsContainer;
  }

  /**
   * Создание заголовка карточки
   */
  private createCardHeader(): HTMLElement {
    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      alignSelf: 'stretch',
    });

    // Заголовок
    const titleContainer = document.createElement('div');
    Object.assign(titleContainer.style, {
      display: 'flex',
      alignItems: 'flex-start',
    });

    const titleBlock = document.createElement('div');
    Object.assign(titleBlock.style, {
      display: 'flex',
      padding: '7px 0 1px 0',
      alignItems: 'flex-start',
    });

    const title = document.createElement('span');
    Object.assign(title.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '19px',
      fontWeight: '500',
      lineHeight: '24px',
      letterSpacing: '-0.437px',
    });
    title.textContent = this.props.organization.name;

    titleBlock.appendChild(title);
    titleContainer.appendChild(titleBlock);
    header.appendChild(titleContainer);

    // Подзаголовок
    const subtitleContainer = document.createElement('div');
    Object.assign(subtitleContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignSelf: 'stretch',
    });

    const subtitleBlock = document.createElement('div');
    Object.assign(subtitleBlock.style, {
      display: 'flex',
      padding: '1px 0 3px 0',
      alignItems: 'flex-start',
      alignSelf: 'stretch',
    });

    const subtitle = document.createElement('span');
    Object.assign(subtitle.style, {
      height: '20px',
      flex: '1',
      overflow: 'hidden',
      color: '#898989',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      fontWeight: '400',
      lineHeight: '20px',
      letterSpacing: '-0.3px',
    });
    subtitle.textContent = this.props.organization.category;

    subtitleBlock.appendChild(subtitle);
    subtitleContainer.appendChild(subtitleBlock);
    header.appendChild(subtitleContainer);

    return header;
  }

  /**
   * Создание кнопки закрытия
   */
  private createCloseButton(): HTMLElement {
    const buttonContainer = document.createElement('div');
    Object.assign(buttonContainer.style, {
      display: 'flex',
      alignItems: 'flex-start',
    });

    const button = document.createElement('button');
    Object.assign(button.style, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '8px',
      background: 'rgba(20, 20, 20, 0.06)',
      border: 'none',
      cursor: 'pointer',
      padding: '10px 8px',
    });

    const iconWrapper = document.createElement('div');
    Object.assign(iconWrapper.style, {
      width: '24px',
      height: '24px',
      position: 'relative',
    });

    const icon = document.createElement('div');
    Object.assign(icon.style, {
      position: 'absolute',
      left: '5px',
      top: '5px',
    });

    icon.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M12 1L1 12M1 1l11 11" stroke="#5A5A5A" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    button.addEventListener('click', () => this.handleBack());
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(20, 20, 20, 0.12)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(20, 20, 20, 0.06)';
    });

    iconWrapper.appendChild(icon);
    button.appendChild(iconWrapper);
    buttonContainer.appendChild(button);

    return buttonContainer;
  }

  /**
   * Создание секции рейтинга
   */
  private createRatingSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, {
      display: 'flex',
      alignItems: 'flex-start',
      alignSelf: 'stretch',
    });

    // Рейтинг контейнер
    const ratingContainer = document.createElement('div');
    Object.assign(ratingContainer.style, {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      flex: '1',
      alignSelf: 'stretch',
    });

    const ratingContent = document.createElement('div');
    Object.assign(ratingContent.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      flex: '1',
    });

    // Звезды
    const stars = this.createStars();
    ratingContent.appendChild(stars);

    // Рейтинг и отзывы
    const ratingInfo = document.createElement('div');
    Object.assign(ratingInfo.style, {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '6px',
      flex: '1',
    });

    const ratingValue = document.createElement('span');
    Object.assign(ratingValue.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '-0.3px',
      padding: '1px 0',
    });
    ratingValue.textContent = (this.props.organization.rating || 4.6).toFixed(1);

    const reviewsCount = document.createElement('span');
    Object.assign(reviewsCount.style, {
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      fontWeight: '400',
      lineHeight: '20px',
      letterSpacing: '-0.3px',
      padding: '1px 0',
    });
    reviewsCount.textContent = `${this.props.organization.reviewsCount || 120} оценок`;

    ratingInfo.appendChild(ratingValue);
    ratingInfo.appendChild(reviewsCount);
    ratingContent.appendChild(ratingInfo);
    ratingContainer.appendChild(ratingContent);

    // Время поездки
    const rideTime = this.createRideTime();
    section.appendChild(ratingContainer);
    section.appendChild(rideTime);

    return section;
  }

  /**
   * Создание звезд рейтинга
   */
  private createStars(): HTMLElement {
    const starsContainer = document.createElement('div');
    Object.assign(starsContainer.style, {
      display: 'flex',
      alignItems: 'flex-start',
    });

    const rating = this.props.organization.rating || 4.6;
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('div');
      Object.assign(star.style, {
        width: '16px',
        height: '16px',
        position: 'relative',
      });

      // Заполнение звезды зависит от рейтинга
      const filled = i <= rating;
      const color = filled ? '#EFA701' : 'rgba(20, 20, 20, 0.09)';

      star.innerHTML = `
        <div style="position: absolute; left: 0; top: 0; width: 8px; height: 16px; background: ${color};"></div>
        <div style="position: absolute; left: 8px; top: 0; width: 8px; height: 16px; background: ${color};"></div>
      `;

      starsContainer.appendChild(star);
    }

    return starsContainer;
  }

  /**
   * Создание времени поездки
   */
  private createRideTime(): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    });

    const icon = document.createElement('div');
    Object.assign(icon.style, {
      width: '16px',
      height: '16px',
      position: 'relative',
    });

    icon.innerHTML = `
      <svg width="13" height="10" viewBox="0 0 13 10" style="position: absolute; left: 2px; top: 3px;">
        <path d="M1 5h8l-3-3m0 6l3-3" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    `;

    const timeText = document.createElement('span');
    Object.assign(timeText.style, {
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '-0.3px',
      padding: '1px 0',
    });
    timeText.textContent = '3 мин';

    container.appendChild(icon);
    container.appendChild(timeText);

    return container;
  }

  /**
   * Создание основного содержимого
   */
  private createContentContainer(): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      backgroundColor: '#ffffff',
      paddingBottom: '80px', // Место для нижней кнопки
    });

    // Блок "О компании"
    const about = this.createAboutSection();
    container.appendChild(about);

    // Адрес
    const address = this.createAddressSection();
    container.appendChild(address);

    // Контакты
    const contacts = this.createContactsSection();
    container.appendChild(contacts);

    // Время работы
    const worktime = this.createWorktimeSection();
    container.appendChild(worktime);

    // Меню
    const menu = this.createMenuSection();
    container.appendChild(menu);

    // Отзывы
    const feedback = this.createFeedbackSection();
    container.appendChild(feedback);

    // Друзья
    if (!this.props.organization.isAdvertiser) {
      const friends = this.createFriendsSection();
      container.appendChild(friends);
    }

    // Филиалы
    const branches = this.createBranchesSection();
    container.appendChild(branches);

    // Скидки
    const discounts = this.createDiscountsSection();
    container.appendChild(discounts);

    // Инфо
    const info = this.createInfoSection();
    container.appendChild(info);

    // Note: Tab Bar moved to fixed position between header and scrollable content

    // Нижняя кнопка действия
    const bottomAction = this.createBottomActionBar();
    container.appendChild(bottomAction);

    return container;
  }

  /**
   * Создание рекламного баннера
   */
  private createBanner(): HTMLElement {
    const banner = document.createElement('div');
    Object.assign(banner.style, {
      margin: '0 16px 16px 16px',
      padding: '16px',
      backgroundColor: '#F8F9FA',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    });

    const textContent = document.createElement('div');
    Object.assign(textContent.style, {
      flex: '1',
    });

    const bannerText = document.createElement('div');
    Object.assign(bannerText.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '18px',
      letterSpacing: '-0.28px',
      marginBottom: '12px',
    });
    bannerText.textContent = 'Смартфоны серии Xiaomi 12 уже в твоем городе!';

    const button = document.createElement('button');
    Object.assign(button.style, {
      padding: '8px 16px',
      backgroundColor: '#1976D2',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.3px',
      cursor: 'pointer',
    });
    button.textContent = 'Выбрать';

    textContent.appendChild(bannerText);
    textContent.appendChild(button);

    const image = document.createElement('div');
    Object.assign(image.style, {
      width: '88px',
      height: '88px',
      borderRadius: '8px',
      backgroundColor: '#E0E0E0',
      flexShrink: '0',
    });

    banner.appendChild(textContent);
    banner.appendChild(image);

    // Реклама дисклеймер
    const disclaimer = document.createElement('div');
    Object.assign(disclaimer.style, {
      margin: '0 16px 16px 16px',
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '11px',
      fontWeight: '400',
      lineHeight: '14px',
      letterSpacing: '-0.176px',
    });
    disclaimer.textContent = 'Реклама • ООО «Сяоми», Москва, ОГРН 12565426546254';

    const container = document.createElement('div');
    container.appendChild(banner);
    container.appendChild(disclaimer);

    return container;
  }

  /**
   * Создание секции адреса
   */
  private createAddressSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, {
      margin: '0 16px',
    });

    // Заголовок секции
    const header = document.createElement('h3');
    Object.assign(header.style, {
      margin: '0 0 16px 0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.36px',
    });
    header.textContent = 'Адрес';

    // Адрес
    const addressContainer = document.createElement('div');
    Object.assign(addressContainer.style, {
      marginBottom: '16px',
    });

    const addressTitle = document.createElement('div');
    Object.assign(addressTitle.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
      marginBottom: '4px',
    });
    addressTitle.textContent = this.props.organization.address;

    const addressSubtitle = document.createElement('div');
    Object.assign(addressSubtitle.style, {
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '18px',
      letterSpacing: '-0.28px',
    });
    addressSubtitle.textContent = '630075, Новосибирск, Богдана Хмельницкого м-н, 1 этаж';

    addressContainer.appendChild(addressTitle);
    addressContainer.appendChild(addressSubtitle);

    // Кнопки действий
    const buttonsContainer = document.createElement('div');
    Object.assign(buttonsContainer.style, {
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    });

    const buttons = ['Входы 5', 'На такси за 249 ₽'];

    buttons.forEach(buttonText => {
      const button = document.createElement('button');
      Object.assign(button.style, {
        padding: '8px 12px',
        backgroundColor: 'rgba(20, 20, 20, 0.06)',
        border: 'none',
        borderRadius: '8px',
        whiteSpace: 'nowrap',
        color: '#141414',
        fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
        fontSize: '15px',
        fontWeight: '500',
        lineHeight: '20px',
        letterSpacing: '-0.3px',
        cursor: 'pointer',
      });
      button.textContent = buttonText;

      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = 'rgba(20, 20, 20, 0.12)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'rgba(20, 20, 20, 0.06)';
      });

      buttonsContainer.appendChild(button);
    });

    section.appendChild(header);
    section.appendChild(addressContainer);
    section.appendChild(buttonsContainer);

    return section;
  }

  /**
   * Создание секции "О компании"
   */
  private createAboutSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, { margin: '16px' });

    const title = document.createElement('h3');
    Object.assign(title.style, {
      margin: '0 0 8px 0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.36px',
    });
    title.textContent = 'О компании';

    const desc = document.createElement('div');
    desc.textContent = this.props.organization.description || '—';
    Object.assign(desc.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      lineHeight: '20px',
    });

    section.appendChild(title);
    section.appendChild(desc);

    return section;
  }

  /**
   * Создание секции контактов
   */
  private createContactsSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, { margin: '16px' });

    const title = document.createElement('h3');
    Object.assign(title.style, {
      margin: '0 0 8px 0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.36px',
    });
    title.textContent = 'Контакты';

    const phone = document.createElement('div');
    phone.textContent = this.props.organization.phone || '—';
    Object.assign(phone.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      lineHeight: '20px',
    });

    section.appendChild(title);
    section.appendChild(phone);

    return section;
  }

  /**
   * Создание секции времени работы
   */
  private createWorktimeSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, { margin: '16px' });

    const title = document.createElement('h3');
    Object.assign(title.style, {
      margin: '0 0 8px 0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.36px',
    });
    title.textContent = 'Время работы';

    const hours = document.createElement('div');
    hours.textContent = this.props.organization.workingHours || '—';
    Object.assign(hours.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      lineHeight: '20px',
    });

    section.appendChild(title);
    section.appendChild(hours);

    return section;
  }

  /**
   * Создание секции меню
   */
  private createMenuSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, {
      margin: '16px',
      cursor: 'pointer',
    });

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
    title.textContent = 'Вам может пригодиться';

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
      .menu-gallery::-webkit-scrollbar {
        display: none;
      }
    `;
    if (!document.head.querySelector('style[data-menu-gallery]')) {
      style.setAttribute('data-menu-gallery', 'true');
      document.head.appendChild(style);
    }
    gallery.className = 'menu-gallery';

    // Показываем все 8 спортивных товаров
    const products = this.convertShopProductsToProducts();
    products.forEach(product => {
      const item = this.createMenuPreviewItemWithCart(product);
      gallery.appendChild(item);
    });

    // Добавляем спейсер в конце
    const spacer = document.createElement('div');
    Object.assign(spacer.style, {
      width: '16px',
      flexShrink: '0',
    });
    gallery.appendChild(spacer);

    section.appendChild(headerContainer);
    section.appendChild(gallery);

    // Обработчик клика для перехода к магазину
    section.addEventListener('click', () => {
      this.openShop();
    });

    // Hover эффекты
    section.addEventListener('mouseenter', () => {
      section.style.backgroundColor = 'rgba(20, 20, 20, 0.02)';
      section.style.borderRadius = '8px';
      section.style.padding = '8px';
      section.style.margin = '8px';
    });

    section.addEventListener('mouseleave', () => {
      section.style.backgroundColor = 'transparent';
      section.style.padding = '0';
      section.style.margin = '16px';
    });

    return section;
  }

  /**
   * Создание превью товара с кнопкой добавления в корзину
   */
  private createMenuPreviewItemWithCart(product: Product): HTMLElement {
    const item = this.createMenuPreviewItem(product);
    
    // Добавляем кнопку или stepper для работы с корзиной
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
    
    // Настраиваем позиционирование для фото
    const photo = item.querySelector('div') as HTMLElement;
    if (photo) {
      photo.style.position = 'relative';
      photo.appendChild(actionContainer);
    }
    
    return item;
  }

  /**
   * Создание предварительного просмотра товара в меню
   */
  private createMenuPreviewItem(product: Product): HTMLElement {
    const item = document.createElement('div');
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
      placeholder.textContent = '👕';
      photo.appendChild(placeholder);
    }

    // Информация о товаре
    const info = document.createElement('div');
    Object.assign(info.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    });

    // Описание товара
    const description = document.createElement('div');
    Object.assign(description.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '18px',
      letterSpacing: '-0.28px',
    });
    description.textContent = product.description || product.title;

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
    info.appendChild(description);
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
      
      // Конвертируем Product обратно в ShopProduct формат для CartService
      const shopProduct = this.getShopProducts().find(p => p.id === product.id);
      if (shopProduct) {
        // Преобразуем в формат Product для CartService
        const cartProduct = {
          id: shopProduct.id,
          title: shopProduct.title,
          description: shopProduct.title,
          price: shopProduct.price,
          imageUrl: shopProduct.imageUrl,
        };
        this.props.cartService.addToCart(cartProduct);
      }
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
   * Конвертация ShopProduct в Product для совместимости
   */
  private convertShopProductsToProducts(): Product[] {
    return this.getShopProducts().map(shopProduct => ({
      id: shopProduct.id,
      title: shopProduct.title,
      description: shopProduct.title, // Короткое описание
      price: shopProduct.price,
      imageUrl: shopProduct.imageUrl,
    }));
  }

  /**
   * Открытие экрана магазина
   */
  private openShop(): void {
    const shop: Shop = {
      organizationId: this.props.organization.id,
      name: this.props.organization.name,
      categories: [
        {
          id: 'sport-clothing',
          name: 'Спортивная одежда',
          count: 15,
          products: [
            {
              id: 'sport-shirt-1',
              title: 'Спортивная футболка Nike',
              description: 'Дышащая футболка для тренировок из высококачественного материала',
              price: 2500,
              imageUrl: '/assets/images/products/sport-shirt.jpg',
              category: 'sport-clothing',
              brand: 'Nike',
            },
            {
              id: 'sport-pants-1',
              title: 'Спортивные штаны Adidas',
              description: 'Удобные штаны для фитнеса с эластичным поясом',
              price: 3200,
              imageUrl: '/assets/images/products/sport-pants.jpg',
              category: 'sport-clothing',
              brand: 'Adidas',
            },
          ],
        },
        {
          id: 'sport-shoes',
          name: 'Спортивная обувь',
          count: 8,
          products: [
            {
              id: 'sport-shoes-1',
              title: 'Кроссовки Nike Air Max',
              description: 'Профессиональные кроссовки для бега с амортизацией',
              price: 8900,
              imageUrl: '/assets/images/products/sport-shoes.jpg',
              category: 'sport-shoes',
              brand: 'Nike',
            },
            {
              id: 'sport-shoes-2',
              title: 'Кроссовки Adidas Ultraboost',
              description: 'Легкие кроссовки для бега с технологией Boost',
              price: 12000,
              imageUrl: '/assets/images/products/sport-shoes-2.jpg',
              category: 'sport-shoes',
              brand: 'Adidas',
            },
          ],
        },
        {
          id: 'sport-accessories',
          name: 'Спортивные аксессуары',
          count: 12,
          products: [
            {
              id: 'sport-bag-1',
              title: 'Спортивная сумка Under Armour',
              description: 'Вместительная сумка для спортивного инвентаря',
              price: 1800,
              imageUrl: '/assets/images/products/sport-bag.jpg',
              category: 'sport-accessories',
              brand: 'Under Armour',
            },
            {
              id: 'sport-water-1',
              title: 'Бутылка для воды 0.5л',
              description: 'Экологичная бутылка для тренировок',
              price: 450,
              imageUrl: '/assets/images/products/water-bottle.jpg',
              category: 'sport-accessories',
              brand: 'Generic',
            },
          ],
        },
      ],
      products: [],
      cartTotal: 0,
      cartItemsCount: 0,
      type: 'sports',
      description: 'Магазин спортивных товаров при фитнес-клубе',
    };

    // Собираем все товары из категорий
    shop.products = shop.categories.flatMap(category => category.products);

    this.props.searchFlowManager.goToShop(shop);
  }

  /**
   * Создание секции отзывов
   */
  private createFeedbackSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, { margin: '16px' });

    const title = document.createElement('h3');
    Object.assign(title.style, {
      margin: '0 0 8px 0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.36px',
    });
    title.textContent = 'Отзывы';

    const rating = document.createElement('div');
    rating.textContent = `${this.props.organization.rating ?? '-'} · ${
      this.props.organization.reviewsCount ?? 0
    } отзывов`;
    Object.assign(rating.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      lineHeight: '20px',
    });

    section.appendChild(title);
    section.appendChild(rating);

    return section;
  }

  /**
   * Создание секции филиалов
   */
  private createBranchesSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, { margin: '16px' });

    const title = document.createElement('h3');
    Object.assign(title.style, {
      margin: '0 0 8px 0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.36px',
    });
    title.textContent = 'Филиалы';

    const placeholder = document.createElement('div');
    placeholder.textContent = 'Нет филиалов';
    Object.assign(placeholder.style, {
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      lineHeight: '20px',
    });

    section.appendChild(title);
    section.appendChild(placeholder);

    return section;
  }

  /**
   * Создание секции скидок
   */
  private createDiscountsSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, { margin: '16px' });

    const title = document.createElement('h3');
    Object.assign(title.style, {
      margin: '0 0 8px 0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.36px',
    });
    title.textContent = 'Скидки';

    const placeholder = document.createElement('div');
    placeholder.textContent = 'Нет доступных акций';
    Object.assign(placeholder.style, {
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      lineHeight: '20px',
    });

    section.appendChild(title);
    section.appendChild(placeholder);

    return section;
  }

  /**
   * Создание секции дополнительной информации
   */
  private createInfoSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, { margin: '16px' });

    const title = document.createElement('h3');
    Object.assign(title.style, {
      margin: '0 0 8px 0',
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.36px',
    });
    title.textContent = 'Инфо';

    const placeholder = document.createElement('div');
    placeholder.textContent = 'Дополнительная информация отсутствует';
    Object.assign(placeholder.style, {
      color: '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '15px',
      lineHeight: '20px',
    });

    section.appendChild(title);
    section.appendChild(placeholder);

    return section;
  }

  /**
   * Создание нижней панели действий
   */
  private createBottomActionBar(): HTMLElement {
    const actionBar = document.createElement('div');
    Object.assign(actionBar.style, {
      position: 'fixed',
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
      padding: '16px',
      backgroundColor: '#1976D2',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    });
    button.textContent = 'Написать отзыв';

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
    this.props.searchFlowManager.currentScreen = ScreenType.ORGANIZATION;

    if (this.props.mapSyncService) {
      this.props.mapSyncService.syncPinsWithContent('organization', {
        organization: this.props.organization,
      });
      this.props.mapSyncService.centerOnOrganization(this.props.organization);
      this.props.mapSyncService.highlightOrganizationPin(this.props.organization.id);
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
    // Обновление данных организации
  }

  public updateOrganization(organization: Organization): void {
    this.props.organization = organization;
    // Обновляем заголовок и другие элементы
    const title = this.element.querySelector('span[style*="font-size: 19px"]');
    if (title) {
      title.textContent = organization.name;
    }
    this.syncWithServices();
  }

  public getState(): any {
    return {
      screen: ScreenType.ORGANIZATION,
      organization: this.props.organization,
      isFavorite: this.isFavorite,
    };
  }

  /**
   * Подписка на обновления корзины
   */
  private subscribeToCartUpdates(): void {
    this.cartSubscription = this.props.cartService.subscribe(() => {
      // Обновляем карусель при изменении корзины
      this.refreshCarousel();
    });
  }

  /**
   * Обновление карусели при изменении корзины
   */
  private refreshCarousel(): void {
    const gallery = this.element.querySelector('.menu-gallery');
    if (gallery) {
      // Очищаем содержимое
      gallery.innerHTML = '';
      
      // Пересоздаем элементы
      const products = this.convertShopProductsToProducts();
      products.forEach(product => {
        const item = this.createMenuPreviewItemWithCart(product);
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

  public destroy(): void {
    // Отписываемся от обновлений корзины
    if (this.cartSubscription) {
      this.cartSubscription();
      this.cartSubscription = undefined;
    }
    
    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));

    if (this.props.mapSyncService) {
      this.props.mapSyncService.clearHighlights();
    }

    this.element.innerHTML = '';
  }
}

/**
 * Фабрика для создания OrganizationScreen
 */
export class OrganizationScreenFactory {
  static create(props: OrganizationScreenProps): OrganizationScreen {
    return new OrganizationScreen(props);
  }

  static createDefault(
    container: HTMLElement,
    searchFlowManager: SearchFlowManager,
    bottomsheetManager: BottomsheetManager,
    cartService: CartService,
    organization: Organization
  ): OrganizationScreen {
    return new OrganizationScreen({
      container,
      searchFlowManager,
      bottomsheetManager,
      cartService,
      organization,
    });
  }
}
