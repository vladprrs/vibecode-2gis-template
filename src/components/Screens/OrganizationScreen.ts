import { ScreenType, Organization } from '../../types';
import { SearchFlowManager, BottomsheetManager, MapSyncService } from '../../services';
import { 
  BottomsheetContainer, 
  BottomsheetHeader, 
  BottomsheetContent,
  BottomsheetContainerProps 
} from '../Bottomsheet';
import { OrganizationCard, CardSize } from '../Cards';

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
  /** Обработчики событий */
  onBack?: () => void;
  onCallClick?: (organization: Organization) => void;
  onRouteClick?: (organization: Organization) => void;
  onFavoriteToggle?: (organization: Organization, isFavorite: boolean) => void;
  onShareClick?: (organization: Organization) => void;
}

/**
 * Экран детальной информации об организации
 * Отображает полную информацию с возможностью взаимодействия
 */
export class OrganizationScreen {
  private props: OrganizationScreenProps;
  private element: HTMLElement;
  
  // Компоненты
  private bottomsheetContainer?: BottomsheetContainer;
  private bottomsheetContent?: BottomsheetContent;
  private organizationCard?: OrganizationCard;
  
  // Контейнеры для компонентов
  private headerContainer?: HTMLElement;
  private contentContainer?: HTMLElement;
  private cardContainer?: HTMLElement;
  private actionsContainer?: HTMLElement;
  private infoContainer?: HTMLElement;

  // Состояние
  private isFavorite: boolean = false;

  constructor(props: OrganizationScreenProps) {
    this.props = props;
    this.element = props.container;
    
    this.initialize();
  }

  /**
   * Инициализация экрана
   */
  private initialize(): void {
    this.setupElement();
    this.createBottomsheet();
    this.createContent();
    this.setupEventListeners();
    this.syncWithServices();
  }

  /**
   * Настройка основного элемента
   */
  private setupElement(): void {
    Object.assign(this.element.style, {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff'
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }

    this.element.classList.add('organization-screen');
  }

  /**
   * Создание шторки
   */
  private createBottomsheet(): void {
    // Создаем контейнер для шторки
    const bottomsheetElement = document.createElement('div');
    bottomsheetElement.style.height = '100%';
    
    this.element.appendChild(bottomsheetElement);

    // Создаем шторку с состоянием FULLSCREEN_SCROLL для детальной информации
    const bottomsheetConfig: BottomsheetContainerProps = {
      config: {
        state: this.props.bottomsheetManager.getCurrentState().currentState,
        snapPoints: [0.2, 0.5, 0.9, 0.95],
        isDraggable: true,
        hasScrollableContent: true
      },
      events: {
        onStateChange: (newState) => {
          // Синхронизируем состояние с менеджером шторки
          this.props.bottomsheetManager.snapToState(newState);
          
          // Синхронизируем с картой если есть сервис
          if (this.props.mapSyncService && this.bottomsheetContainer) {
            const currentStateData = this.bottomsheetContainer.getCurrentState();
            this.props.mapSyncService.adjustMapViewport(currentStateData.height);
          }
        }
      }
    };

    this.bottomsheetContainer = new BottomsheetContainer(bottomsheetElement, bottomsheetConfig);
  }

  /**
   * Создание содержимого шторки
   */
  private createContent(): void {
    if (!this.bottomsheetContainer) return;

    // Создаем заголовок
    this.createHeader();
    
    // Создаем контентную область
    this.createContentArea();
  }

  /**
   * Создание заголовка с кнопкой назад
   */
  private createHeader(): void {
    this.headerContainer = document.createElement('div');
    
    Object.assign(this.headerContainer.style, {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px 16px 16px',
      borderBottom: '1px solid #F0F0F0',
      backgroundColor: '#ffffff',
      position: 'sticky',
      top: '0',
      zIndex: '10'
    });

    // Создаем драггер
    this.createDragger();

    // Создаем кнопку назад
    this.createBackButton();

    // Создаем заголовок
    this.createTitle();

    // Создаем кнопки действий
    this.createHeaderActions();
  }

  /**
   * Создание драггера
   */
  private createDragger(): void {
    if (!this.headerContainer) return;

    const draggerContainer = document.createElement('div');
    Object.assign(draggerContainer.style, {
      position: 'absolute',
      top: '8px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '24px'
    });

    const dragger = document.createElement('div');
    Object.assign(dragger.style, {
      width: '36px',
      height: '4px',
      backgroundColor: '#E0E0E0',
      borderRadius: '2px',
      cursor: 'grab'
    });

    dragger.addEventListener('mouseenter', () => {
      dragger.style.backgroundColor = '#BDBDBD';
    });

    dragger.addEventListener('mouseleave', () => {
      dragger.style.backgroundColor = '#E0E0E0';
    });

    draggerContainer.appendChild(dragger);
    this.headerContainer.appendChild(draggerContainer);
  }

  /**
   * Создание кнопки назад
   */
  private createBackButton(): void {
    if (!this.headerContainer) return;

    const backButton = document.createElement('button');
    Object.assign(backButton.style, {
      width: '40px',
      height: '40px',
      border: 'none',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease',
      marginTop: '16px'
    });

    backButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Hover эффект
    backButton.addEventListener('mouseenter', () => {
      backButton.style.backgroundColor = '#F5F5F5';
    });

    backButton.addEventListener('mouseleave', () => {
      backButton.style.backgroundColor = 'transparent';
    });

    // Обработчик клика
    backButton.addEventListener('click', () => {
      this.handleBack();
    });

    this.headerContainer.appendChild(backButton);
  }

  /**
   * Создание заголовка
   */
  private createTitle(): void {
    if (!this.headerContainer) return;

    const titleContainer = document.createElement('div');
    Object.assign(titleContainer.style, {
      flex: '1',
      marginLeft: '12px',
      marginRight: '12px',
      marginTop: '16px'
    });

    const title = document.createElement('h1');
    Object.assign(title.style, {
      margin: '0',
      fontSize: '20px',
      fontWeight: '600',
      color: '#333333',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      lineHeight: '1.3',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
    title.textContent = this.props.organization.name;

    const subtitle = document.createElement('div');
    Object.assign(subtitle.style, {
      fontSize: '14px',
      color: '#666666',
      marginTop: '2px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });
    subtitle.textContent = this.props.organization.category;

    titleContainer.appendChild(title);
    titleContainer.appendChild(subtitle);
    this.headerContainer.appendChild(titleContainer);
  }

  /**
   * Создание кнопок действий в заголовке
   */
  private createHeaderActions(): void {
    if (!this.headerContainer) return;

    const actionsContainer = document.createElement('div');
    Object.assign(actionsContainer.style, {
      display: 'flex',
      gap: '8px',
      marginTop: '16px'
    });

    // Кнопка избранного
    const favoriteButton = this.createActionButton(
      this.isFavorite ? 'favorite-filled' : 'favorite-outline',
      () => this.handleFavoriteToggle()
    );

    // Кнопка поделиться
    const shareButton = this.createActionButton(
      'share',
      () => this.handleShare()
    );

    actionsContainer.appendChild(favoriteButton);
    actionsContainer.appendChild(shareButton);
    this.headerContainer.appendChild(actionsContainer);
  }

  /**
   * Создание кнопки действия
   */
  private createActionButton(iconType: string, onClick: () => void): HTMLElement {
    const button = document.createElement('button');
    Object.assign(button.style, {
      width: '40px',
      height: '40px',
      border: 'none',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease'
    });

    // Иконки
    const icons = {
      'favorite-outline': `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      `,
      'favorite-filled': `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#FF5722" stroke="#FF5722" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      `,
      'share': `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
          <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
          <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" stroke-width="2"/>
        </svg>
      `
    };

    button.innerHTML = icons[iconType as keyof typeof icons] || '';

    // Hover эффект
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#F5F5F5';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'transparent';
    });

    // Обработчик клика
    button.addEventListener('click', onClick);

    return button;
  }

  /**
   * Создание контентной области
   */
  private createContentArea(): void {
    this.contentContainer = document.createElement('div');
    
    this.bottomsheetContent = new BottomsheetContent(this.contentContainer, {
      scrollable: true,
      scrollType: 'vertical',
      showScrollIndicator: true,
      padding: {
        top: 0,
        right: 0,
        bottom: 24,
        left: 0
      }
    });

    // Создаем содержимое организации
    this.createOrganizationContent();
  }

  /**
   * Создание содержимого организации
   */
  private createOrganizationContent(): void {
    if (!this.bottomsheetContent) return;

    const mainContainer = document.createElement('div');
    Object.assign(mainContainer.style, {
      display: 'flex',
      flexDirection: 'column'
    });

    // Создаем полную карточку организации
    this.createOrganizationCard();

    // Создаем кнопки основных действий
    this.createMainActions();

    // Создаем дополнительную информацию
    this.createAdditionalInfo();

    mainContainer.appendChild(this.cardContainer!);
    mainContainer.appendChild(this.actionsContainer!);
    mainContainer.appendChild(this.infoContainer!);

    // Добавляем содержимое
    this.bottomsheetContent.setContent([mainContainer]);
  }

  /**
   * Создание полной карточки организации
   */
  private createOrganizationCard(): void {
    this.cardContainer = document.createElement('div');
    Object.assign(this.cardContainer.style, {
      margin: '0 16px 24px 16px'
    });

    this.organizationCard = new OrganizationCard(this.cardContainer, {
      organization: this.props.organization,
      size: CardSize.FULL,
      showPhoto: true,
      showRating: true,
      showDistance: true,
      showWorkingHours: true,
      showCategory: true,
      showDescription: true,
      onCallClick: (org) => {
        this.handleCall(org);
      },
      onPhotoClick: (org) => {
        this.handlePhotoClick(org);
      }
    });
  }

  /**
   * Создание основных кнопок действий
   */
  private createMainActions(): void {
    this.actionsContainer = document.createElement('div');
    Object.assign(this.actionsContainer.style, {
      display: 'flex',
      gap: '12px',
      margin: '0 16px 24px 16px'
    });

    // Кнопка звонка
    if (this.props.organization.phone) {
      const callButton = this.createMainActionButton(
        'Позвонить',
        '#1976D2',
        `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.05 15.39c-.4.46-.91.86-1.5 1.18-.59.32-1.24.48-1.95.48-1.26 0-2.58-.39-3.96-1.17-1.38-.78-2.76-1.88-4.14-3.3S3.75 9.52 2.97 8.14C2.19 6.76 1.8 5.44 1.8 4.18c0-.71.16-1.36.48-1.95.32-.59.72-1.1 1.18-1.5.54-.46 1.14-.69 1.8-.69.27 0 .54.06.81.18.27.12.51.3.72.54l2.76 3.69c.21.27.36.51.45.72.09.21.14.42.14.63 0 .27-.09.54-.27.81s-.42.54-.72.81l-.81.81c-.09.09-.14.21-.14.36 0 .09.03.18.09.27.06.09.12.18.18.27.63 1.17 1.41 2.22 2.34 3.15.93.93 1.98 1.71 3.15 2.34.18.09.36.18.54.27s.36.14.54.14c.15 0 .27-.05.36-.14l.81-.81c.27-.27.54-.48.81-.66.27-.18.54-.27.81-.27.21 0 .42.05.63.14.21.09.45.24.72.45l3.69 2.76c.24.21.42.45.54.72.12.27.18.54.18.81 0 .66-.23 1.26-.69 1.8z" fill="currentColor"/>
          </svg>
        `,
        () => this.handleCall(this.props.organization)
      );
      this.actionsContainer.appendChild(callButton);
    }

    // Кнопка маршрута
    const routeButton = this.createMainActionButton(
      'Маршрут',
      '#4CAF50',
      `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0C6.2 0 3 3.2 3 7c0 5.2 7 13 7 13s7-7.8 7-13c0-3.8-3.2-7-7-7Z" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      `,
      () => this.handleRoute(this.props.organization)
    );
    this.actionsContainer.appendChild(routeButton);
  }

  /**
   * Создание кнопки основного действия
   */
  private createMainActionButton(
    text: string, 
    color: string, 
    iconSvg: string, 
    onClick: () => void
  ): HTMLElement {
    const button = document.createElement('button');
    Object.assign(button.style, {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '16px',
      border: `2px solid ${color}`,
      borderRadius: '12px',
      backgroundColor: 'transparent',
      color: color,
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    const icon = document.createElement('span');
    icon.innerHTML = iconSvg;

    const label = document.createElement('span');
    label.textContent = text;

    button.appendChild(icon);
    button.appendChild(label);

    // Hover эффект
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = color;
      button.style.color = '#ffffff';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'transparent';
      button.style.color = color;
    });

    // Обработчик клика
    button.addEventListener('click', onClick);

    return button;
  }

  /**
   * Создание дополнительной информации
   */
  private createAdditionalInfo(): void {
    this.infoContainer = document.createElement('div');
    Object.assign(this.infoContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    });

    // Создаем секции информации
    this.createContactInfo();
    this.createReviewsSection();
  }

  /**
   * Создание секции контактов
   */
  private createContactInfo(): void {
    if (!this.infoContainer) return;

    const section = this.createInfoSection('Контакты');
    const { organization } = this.props;

    // Телефон
    if (organization.phone) {
      const phoneItem = this.createInfoItem(
        `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.05 15.39c-.4.46-.91.86-1.5 1.18-.59.32-1.24.48-1.95.48-1.26 0-2.58-.39-3.96-1.17-1.38-.78-2.76-1.88-4.14-3.3S3.75 9.52 2.97 8.14C2.19 6.76 1.8 5.44 1.8 4.18c0-.71.16-1.36.48-1.95.32-.59.72-1.1 1.18-1.5.54-.46 1.14-.69 1.8-.69.27 0 .54.06.81.18.27.12.51.3.72.54l2.76 3.69c.21.27.36.51.45.72.09.21.14.42.14.63 0 .27-.09.54-.27.81s-.42.54-.72.81l-.81.81c-.09.09-.14.21-.14.36 0 .09.03.18.09.27.06.09.12.18.18.27.63 1.17 1.41 2.22 2.34 3.15.93.93 1.98 1.71 3.15 2.34.18.09.36.18.54.27s.36.14.54.14c.15 0 .27-.05.36-.14l.81-.81c.27-.27.54-.48.81-.66.27-.18.54-.27.81-.27.21 0 .42.05.63.14.21.09.45.24.72.45l3.69 2.76c.24.21.42.45.54.72.12.27.18.54.18.81 0 .66-.23 1.26-.69 1.8z" fill="currentColor"/>
          </svg>
        `,
        'Телефон',
        organization.phone,
        () => this.handleCall(organization)
      );
      section.appendChild(phoneItem);
    }

    // Адрес
    const addressItem = this.createInfoItem(
      `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0C6.2 0 3 3.2 3 7c0 5.2 7 13 7 13s7-7.8 7-13c0-3.8-3.2-7-7-7Z" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      `,
      'Адрес',
      organization.address,
      () => this.handleRoute(organization)
    );
    section.appendChild(addressItem);

    // Время работы
    if (organization.workingHours) {
      const hoursItem = this.createInfoItem(
        `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 5v5l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        `,
        'Время работы',
        organization.workingHours
      );
      section.appendChild(hoursItem);
    }

    this.infoContainer.appendChild(section);
  }

  /**
   * Создание секции отзывов
   */
  private createReviewsSection(): void {
    if (!this.infoContainer) return;

    const { organization } = this.props;
    
    if (!organization.reviewsCount || organization.reviewsCount === 0) return;

    const section = this.createInfoSection('Отзывы');

    // Общий рейтинг
    const ratingContainer = document.createElement('div');
    Object.assign(ratingContainer.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#F8F9FA',
      borderRadius: '12px',
      margin: '0 16px'
    });

    const ratingValue = document.createElement('div');
    Object.assign(ratingValue.style, {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1976D2'
    });
    ratingValue.textContent = organization.rating?.toFixed(1) || '0.0';

    const ratingInfo = document.createElement('div');
    Object.assign(ratingInfo.style, {
      display: 'flex',
      flexDirection: 'column'
    });

    const stars = document.createElement('div');
    Object.assign(stars.style, {
      display: 'flex',
      gap: '2px',
      marginBottom: '4px'
    });

    // Создаем звездочки
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('div');
      Object.assign(star.style, {
        width: '16px',
        height: '16px',
        color: i <= (organization.rating || 0) ? '#FFA726' : '#E0E0E0'
      });

      star.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0l2.06 5.11L16 6.18l-4 3.64L13.82 16 8 13.06 2.18 16 4 9.82 0 6.18l5.94-1.07L8 0Z"/>
        </svg>
      `;

      stars.appendChild(star);
    }

    const reviewsCount = document.createElement('div');
    Object.assign(reviewsCount.style, {
      fontSize: '14px',
      color: '#666666'
    });
    reviewsCount.textContent = `${organization.reviewsCount} отзывов`;

    ratingInfo.appendChild(stars);
    ratingInfo.appendChild(reviewsCount);

    ratingContainer.appendChild(ratingValue);
    ratingContainer.appendChild(ratingInfo);

    section.appendChild(ratingContainer);
    this.infoContainer.appendChild(section);
  }

  /**
   * Создание секции информации
   */
  private createInfoSection(title: string): HTMLElement {
    const section = document.createElement('div');

    const header = document.createElement('h3');
    Object.assign(header.style, {
      margin: '0 0 16px 0',
      padding: '0 16px',
      fontSize: '18px',
      fontWeight: '600',
      color: '#333333',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });
    header.textContent = title;

    section.appendChild(header);
    return section;
  }

  /**
   * Создание элемента информации
   */
  private createInfoItem(
    iconSvg: string, 
    label: string, 
    value: string, 
    onClick?: () => void
  ): HTMLElement {
    const item = document.createElement('div');
    Object.assign(item.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 16px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background-color 0.2s ease'
    });

    if (onClick) {
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#F5F5F5';
      });

      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
      });

      item.addEventListener('click', onClick);
    }

    const icon = document.createElement('div');
    Object.assign(icon.style, {
      width: '20px',
      height: '20px',
      color: '#666666',
      flexShrink: '0'
    });
    icon.innerHTML = iconSvg;

    const content = document.createElement('div');
    Object.assign(content.style, {
      flex: '1'
    });

    const labelElement = document.createElement('div');
    Object.assign(labelElement.style, {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '2px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });
    labelElement.textContent = label;

    const valueElement = document.createElement('div');
    Object.assign(valueElement.style, {
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });
    valueElement.textContent = value;

    content.appendChild(labelElement);
    content.appendChild(valueElement);

    item.appendChild(icon);
    item.appendChild(content);

    return item;
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    // Обработчик изменения размера экрана
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Обработчик клавиш
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Синхронизация с сервисами
   */
  private syncWithServices(): void {
    // Устанавливаем текущий экран в менеджере флоу
    this.props.searchFlowManager.currentScreen = ScreenType.ORGANIZATION;
    
    // Центрируем карту на организации
    if (this.props.mapSyncService) {
      this.props.mapSyncService.syncPinsWithContent('organization', {
        organization: this.props.organization
      });
      
      this.props.mapSyncService.centerOnOrganization(this.props.organization);
    }
  }

  /**
   * Обработчики событий
   */
  private handleBack(): void {
    this.props.searchFlowManager.goBack();
    this.props.onBack?.();
  }

  private handleCall(organization: Organization): void {
    if (organization.phone) {
      window.open(`tel:${organization.phone}`);
    }
    this.props.onCallClick?.(organization);
  }

  private handleRoute(organization: Organization): void {
    // Открываем навигацию
    const address = encodeURIComponent(organization.address);
    window.open(`https://maps.google.com/?q=${address}`);
    this.props.onRouteClick?.(organization);
  }

  private handleFavoriteToggle(): void {
    this.isFavorite = !this.isFavorite;
    
    // Обновляем иконку
    const favoriteButton = this.headerContainer?.querySelector('button:nth-child(4)') as HTMLElement;
    if (favoriteButton) {
      const iconType = this.isFavorite ? 'favorite-filled' : 'favorite-outline';
      favoriteButton.innerHTML = this.createActionButton(iconType, () => {}).innerHTML;
    }
    
    this.props.onFavoriteToggle?.(this.props.organization, this.isFavorite);
  }

  private handleShare(): void {
    // Поделиться организацией
    const shareData = {
      title: this.props.organization.name,
      text: `${this.props.organization.name} - ${this.props.organization.category}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback - копируем в буфер обмена
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
    }

    this.props.onShareClick?.(this.props.organization);
  }

  private handlePhotoClick(organization: Organization): void {
    // Открываем галерею фотографий
    console.log('Photo gallery for:', organization.name);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.handleBack();
    }
  }

  private handleResize(): void {
    // Адаптируем интерфейс при изменении размера
  }

  /**
   * Публичные методы
   */
  public activate(): void {
    this.element.style.display = 'flex';
    this.bottomsheetContainer?.snapToState(
      this.props.bottomsheetManager.getCurrentState().currentState
    );
    this.syncWithServices();
  }

  public deactivate(): void {
    this.element.style.display = 'none';
  }

  public refresh(): void {
    // Можно обновить данные организации
  }

  public updateOrganization(organization: Organization): void {
    this.props.organization = organization;
    
    // Обновляем карточку
    this.organizationCard?.updateOrganization(organization);
    
    // Обновляем заголовок
    const title = this.headerContainer?.querySelector('h1');
    if (title) {
      title.textContent = organization.name;
    }
    
    const subtitle = this.headerContainer?.querySelector('div > div:last-child');
    if (subtitle) {
      subtitle.textContent = organization.category;
    }
    
    // Синхронизируем с сервисами
    this.syncWithServices();
  }

  public getState(): any {
    return {
      screen: ScreenType.ORGANIZATION,
      organization: this.props.organization,
      isFavorite: this.isFavorite,
      bottomsheetState: this.bottomsheetContainer?.getCurrentState()
    };
  }

  public destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    
    this.bottomsheetContainer?.destroy();
    this.bottomsheetContent?.destroy();
    this.organizationCard?.destroy();
    
    this.headerContainer = undefined;
    this.contentContainer = undefined;
    this.cardContainer = undefined;
    this.actionsContainer = undefined;
    this.infoContainer = undefined;
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
      organization
    });
  }
} 