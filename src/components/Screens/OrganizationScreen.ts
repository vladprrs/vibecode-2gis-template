import { Organization, ScreenType } from '../../types';
import { BottomsheetManager, MapSyncService, SearchFlowManager } from '../../services';

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

    // 2. Создаем табы
    const tabBar = this.createTabBar();
    bottomsheetContent.appendChild(tabBar);

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
   * Создание заголовка организации (Organization card top)
   */
  private createOrganizationCardTop(): HTMLElement {
    const cardTop = document.createElement('div');
    Object.assign(cardTop.style, {
      backgroundColor: '#ffffff',
      borderRadius: '16px 16px 0 0',
      position: 'relative',
    });

    // Drag handle
    const draggerContainer = document.createElement('div');
    Object.assign(draggerContainer.style, {
      display: 'flex',
      height: '0',
      paddingBottom: '6px',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      alignSelf: 'stretch',
      position: 'relative',
      paddingTop: '16px',
    });

    const dragger = document.createElement('div');
    Object.assign(dragger.style, {
      width: '40px',
      height: '4px',
      flexShrink: '0',
      borderRadius: '6px',
      background: 'rgba(137, 137, 137, 0.25)',
      cursor: 'grab',
    });

    draggerContainer.appendChild(dragger);
    cardTop.appendChild(draggerContainer);

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

    // Друзья секция
    if (!this.props.organization.isAdvertiser) {
      const friendsSection = this.createFriendsSection();
      leftContent.appendChild(friendsSection);
    }

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
   * Создание панели табов
   */
  private createTabBar(): HTMLElement {
    const tabBar = document.createElement('div');
    Object.assign(tabBar.style, {
      position: 'relative',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid rgba(137, 137, 137, 0.15)',
    });

    // Fade mask
    const fadeMask = document.createElement('div');
    Object.assign(fadeMask.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      pointerEvents: 'none',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0px, transparent 16px, transparent calc(100% - 16px), rgba(255,255,255,0.8) 100%)',
    });

    // Табы контейнер
    const tabsContainer = document.createElement('div');
    Object.assign(tabsContainer.style, {
      display: 'flex',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    });

    // Скрываем scrollbar в webkit
    const style = document.createElement('style');
    style.textContent = `
      .tabs-container::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    tabsContainer.classList.add('tabs-container');

    const tabs = [
      { name: 'Обзор', active: true, count: null },
      { name: 'Меню', active: false, count: 213 },
      { name: 'Фото', active: false, count: 432 },
      { name: 'Отзывы', active: false, count: 232 },
      { name: 'Инфо', active: false, count: null },
      { name: 'Акции', active: false, count: null },
    ];

    tabs.forEach(tab => {
      const tabElement = this.createTab(tab.name, tab.active, tab.count);
      tabsContainer.appendChild(tabElement);
    });

    tabBar.appendChild(fadeMask);
    tabBar.appendChild(tabsContainer);

    return tabBar;
  }

  /**
   * Создание отдельного таба
   */
  private createTab(name: string, active: boolean, count: number | null): HTMLElement {
    const tab = document.createElement('div');
    Object.assign(tab.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '12px 16px',
      cursor: 'pointer',
      borderBottom: active ? '2px solid #1976D2' : '2px solid transparent',
      whiteSpace: 'nowrap',
      transition: 'border-color 0.2s ease',
    });

    const label = document.createElement('span');
    Object.assign(label.style, {
      color: active ? '#1976D2' : '#898989',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '18px',
      letterSpacing: '-0.28px',
    });
    label.textContent = name;

    tab.appendChild(label);

    if (count !== null) {
      const counter = document.createElement('div');
      Object.assign(counter.style, {
        minWidth: '19px',
        height: '19px',
        padding: '2px 6px',
        borderRadius: '10px',
        backgroundColor: 'rgba(20, 20, 20, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });

      const counterText = document.createElement('span');
      Object.assign(counterText.style, {
        color: '#898989',
        fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
        fontSize: '13px',
        fontWeight: '500',
        lineHeight: '16px',
        letterSpacing: '-0.234px',
      });
      counterText.textContent = count.toString();

      counter.appendChild(counterText);
      tab.appendChild(counter);
    }

    return tab;
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

    // Временное уведомление
    const alert = this.createAlert();
    container.appendChild(alert);

    // Рекламный баннер
    const banner = this.createBanner();
    container.appendChild(banner);

    // Адрес
    const address = this.createAddressSection();
    container.appendChild(address);

    // Нижняя кнопка действия
    const bottomAction = this.createBottomActionBar();
    container.appendChild(bottomAction);

    return container;
  }

  /**
   * Создание уведомления
   */
  private createAlert(): HTMLElement {
    const alert = document.createElement('div');
    Object.assign(alert.style, {
      margin: '16px',
      padding: '16px',
      backgroundColor: '#FFF8E1',
      borderRadius: '12px',
      border: '1px solid #FFE082',
    });

    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
    });

    const icon = document.createElement('div');
    icon.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="#F57C00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const title = document.createElement('span');
    Object.assign(title.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '-0.24px',
    });
    title.textContent = 'Временно не работает';

    header.appendChild(icon);
    header.appendChild(title);

    const description = document.createElement('div');
    Object.assign(description.style, {
      color: '#141414',
      fontFamily: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '18px',
      letterSpacing: '-0.28px',
    });
    description.textContent = 'Сейчас этот филиал временно закрыт, но вернется к работе через некоторое время. Уточняйте информацию у компании';

    alert.appendChild(header);
    alert.appendChild(description);

    return alert;
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

    const buttons = [
      'Входы 5',
      'На такси за 249 ₽'
    ];

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

  public destroy(): void {
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
    organization: Organization
  ): OrganizationScreen {
    return new OrganizationScreen({
      container,
      searchFlowManager,
      bottomsheetManager,
      organization,
    });
  }
}