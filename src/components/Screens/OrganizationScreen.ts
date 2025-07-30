import { Organization, ScreenType } from '../../types';
import { BottomsheetManager, MapSyncService, SearchFlowManager } from '../../services';
import { TabBar, createHeaderNotAdvertiser } from '../Organization';

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
    bottomsheetContent.className = 'bottomsheet-content';

    // 1. Создаем заголовок организации (Organization card top)
    const organizationCardTop = this.createOrganizationCardTop();
    bottomsheetContent.appendChild(organizationCardTop);

    // 2. Создаем прокручиваемое содержимое
    const scrollableContent = document.createElement('div');
    scrollableContent.className = 'scrollable-content';

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
    return createHeaderNotAdvertiser({
      name: this.props.organization.name,
      category: this.props.organization.category,
      rating: this.props.organization.rating || 4.6,
      reviews: this.props.organization.reviewsCount || 0,
      time: '3 мин',
    });
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

    // Временное уведомление
    const alert = this.createAlert();
    container.appendChild(alert);

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

    // Панель табов
    const tabContainer = document.createElement('div');
    new TabBar({
      container: tabContainer,
      items: [
        { label: 'Обзор' },
        { label: 'Меню', count: 213 },
        { label: 'Фото', count: 432 },
        { label: 'Отзывы', count: 232 },
        { label: 'Инфо' },
        { label: 'Акции' },
      ],
    });
    container.appendChild(tabContainer);

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
    title.textContent = 'Меню';

    const placeholder = document.createElement('div');
    placeholder.textContent = 'Меню недоступно';
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
    actionBar.className = 'bottom-action';

    const button = document.createElement('button');
    button.textContent = 'Написать отзыв';


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
    const title = this.element.querySelector('.inline-element-31');
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