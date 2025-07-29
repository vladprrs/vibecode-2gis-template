import { Organization } from '../../types';

/**
 * Размер карточки
 */
export enum CardSize {
  /** Компактная карточка - только основная информация */
  COMPACT = 'compact',
  /** Стандартная карточка - с описанием */
  STANDARD = 'standard',
  /** Полная карточка - со всей информацией */
  FULL = 'full',
}

/**
 * Пропсы для OrganizationCard
 */
export interface OrganizationCardProps {
  /** Данные организации */
  organization: Organization;
  /** Размер карточки */
  size?: CardSize;
  /** Показывать ли фото */
  showPhoto?: boolean;
  /** Показывать ли рейтинг и отзывы */
  showRating?: boolean;
  /** Показывать ли расстояние */
  showDistance?: boolean;
  /** Показывать ли время работы */
  showWorkingHours?: boolean;
  /** Показывать ли категорию */
  showCategory?: boolean;
  /** Показывать ли описание */
  showDescription?: boolean;
  /** CSS класс */
  className?: string;
  /** Обработчики событий */
  onClick?: (organization: Organization) => void;
  onPhotoClick?: (organization: Organization) => void;
  onCallClick?: (organization: Organization) => void;
}

/**
 * Базовая карточка организации
 * Содержит общую логику отображения информации об организации
 */
export class OrganizationCard {
  protected element: HTMLElement;
  protected props: OrganizationCardProps;
  protected contentContainer?: HTMLElement;
  protected photoElement?: HTMLElement;

  constructor(containerElement: HTMLElement, props: OrganizationCardProps) {
    this.element = containerElement;
    this.props = {
      size: CardSize.STANDARD,
      showPhoto: true,
      showRating: true,
      showDistance: true,
      showWorkingHours: true,
      showCategory: true,
      showDescription: true,
      ...props,
    };

    this.initialize();
  }

  /**
   * Инициализация компонента
   */
  protected initialize(): void {
    this.setupElement();
    this.createCard();
    this.setupEventListeners();
  }

  /**
   * Настройка основного элемента
   */
  protected setupElement(): void {
    Object.assign(this.element.style, {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid #F0F0F0',
    });

    // Добавляем hover эффект
    this.element.addEventListener('mouseenter', () => {
      this.element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      this.element.style.transform = 'translateY(-2px)';
    });

    this.element.addEventListener('mouseleave', () => {
      this.element.style.boxShadow = 'none';
      this.element.style.transform = 'translateY(0)';
    });

    if (this.props.className) {
      this.element.className = this.props.className;
    }

    // Добавляем класс для размера
    this.element.classList.add(`org-card-${this.props.size}`);
  }

  /**
   * Создание карточки
   */
  protected createCard(): void {
    // Создаем фото (если нужно)
    if (this.props.showPhoto) {
      this.createPhoto();
    }

    // Создаем контейнер для контента
    this.createContentContainer();

    // Создаем содержимое в зависимости от размера
    this.createContent();
  }

  /**
   * Создание фото организации
   */
  protected createPhoto(): void {
    const { organization } = this.props;

    this.photoElement = document.createElement('div');

    const photoHeight = this.getPhotoHeight();

    Object.assign(this.photoElement.style, {
      height: photoHeight,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      overflow: 'hidden',
    });

    // Устанавливаем фото или заглушку
    if (organization.photoUrl) {
      this.photoElement.style.backgroundImage = `url(${organization.photoUrl})`;
    } else {
      // Заглушка для фото
      this.photoElement.style.backgroundColor = '#F5F5F5';
      this.photoElement.innerHTML = this.createPhotoPlaceholder();
    }

    // Добавляем overlay для рекламодателей
    if (organization.isAdvertiser) {
      this.addAdvertiserBadge();
    }

    // Добавляем класс для стилизации
    this.photoElement.className = 'org-card-photo';

    this.element.appendChild(this.photoElement);
  }

  /**
   * Получение высоты фото в зависимости от размера карточки
   */
  protected getPhotoHeight(): string {
    switch (this.props.size) {
      case CardSize.COMPACT:
        return '80px';
      case CardSize.STANDARD:
        return '120px';
      case CardSize.FULL:
        return '160px';
      default:
        return '120px';
    }
  }

  /**
   * Создание заглушки для фото
   */
  protected createPhotoPlaceholder(): string {
    return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #999999;
      ">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 26h24V10H4v16ZM6 6h20v2H6V6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M10 16h12M10 20h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    `;
  }

  /**
   * Добавление бейджа рекламодателя
   */
  protected addAdvertiserBadge(): void {
    if (!this.photoElement) return;

    const badge = document.createElement('div');

    Object.assign(badge.style, {
      position: 'absolute',
      top: '8px',
      right: '8px',
      padding: '4px 8px',
      backgroundColor: '#FF6D00',
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: '600',
      borderRadius: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    });

    badge.textContent = 'Реклама';
    badge.className = 'advertiser-badge';

    this.photoElement.appendChild(badge);
  }

  /**
   * Создание контейнера для контента
   */
  protected createContentContainer(): void {
    this.contentContainer = document.createElement('div');

    const padding = this.props.size === CardSize.COMPACT ? '12px' : '16px';

    Object.assign(this.contentContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      padding,
      flex: '1',
    });

    this.contentContainer.className = 'org-card-content';
    this.element.appendChild(this.contentContainer);
  }

  /**
   * Создание содержимого карточки
   */
  protected createContent(): void {
    if (!this.contentContainer) return;

    // Заголовок (название организации)
    this.createTitle();

    // Категория
    if (this.props.showCategory) {
      this.createCategory();
    }

    // Рейтинг и отзывы
    if (this.props.showRating) {
      this.createRating();
    }

    // Адрес и расстояние
    this.createAddress();

    // Описание (для стандартной и полной карточки)
    if (this.props.showDescription && this.props.size !== CardSize.COMPACT) {
      this.createDescription();
    }

    // Время работы (для полной карточки)
    if (this.props.showWorkingHours && this.props.size === CardSize.FULL) {
      this.createWorkingHours();
    }

    // Действия (кнопки)
    if (this.props.size === CardSize.FULL) {
      this.createActions();
    }
  }

  /**
   * Создание заголовка
   */
  protected createTitle(): void {
    if (!this.contentContainer) return;

    const title = document.createElement('h3');

    Object.assign(title.style, {
      margin: '0 0 4px 0',
      fontSize: this.props.size === CardSize.COMPACT ? '16px' : '18px',
      fontWeight: '600',
      color: '#333333',
      lineHeight: '1.3',
      display: '-webkit-box',
      WebkitLineClamp: this.props.size === CardSize.COMPACT ? '1' : '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    });

    title.textContent = this.props.organization.name;
    title.className = 'org-card-title';

    this.contentContainer.appendChild(title);
  }

  /**
   * Создание категории
   */
  protected createCategory(): void {
    if (!this.contentContainer) return;

    const category = document.createElement('div');

    Object.assign(category.style, {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '8px',
    });

    category.textContent = this.props.organization.category;
    category.className = 'org-card-category';

    this.contentContainer.appendChild(category);
  }

  /**
   * Создание рейтинга и отзывов
   */
  protected createRating(): void {
    if (!this.contentContainer) return;

    const { organization } = this.props;

    if (!organization.rating && !organization.reviewsCount) return;

    const ratingContainer = document.createElement('div');

    Object.assign(ratingContainer.style, {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      gap: '8px',
    });

    // Рейтинг
    if (organization.rating) {
      const rating = document.createElement('div');
      Object.assign(rating.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      });

      // Звездочки
      const stars = this.createStars(organization.rating);
      rating.appendChild(stars);

      // Числовой рейтинг
      const ratingText = document.createElement('span');
      Object.assign(ratingText.style, {
        fontSize: '14px',
        fontWeight: '500',
        color: '#333333',
      });
      ratingText.textContent = organization.rating.toFixed(1);
      rating.appendChild(ratingText);

      ratingContainer.appendChild(rating);
    }

    // Количество отзывов
    if (organization.reviewsCount) {
      const reviews = document.createElement('span');
      Object.assign(reviews.style, {
        fontSize: '14px',
        color: '#666666',
      });
      reviews.textContent = `${organization.reviewsCount} отзывов`;
      ratingContainer.appendChild(reviews);
    }

    ratingContainer.className = 'org-card-rating';
    this.contentContainer.appendChild(ratingContainer);
  }

  /**
   * Создание звездочек рейтинга
   */
  protected createStars(rating: number): HTMLElement {
    const starsContainer = document.createElement('div');
    Object.assign(starsContainer.style, {
      display: 'flex',
      gap: '2px',
    });

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('div');
      Object.assign(star.style, {
        width: '12px',
        height: '12px',
        color: i <= rating ? '#FFA726' : '#E0E0E0',
      });

      star.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 0l1.545 3.832L12 4.618 8.727 7.382l.818 4.618L6 9.798 2.455 12l.818-4.618L0 4.618l4.455-.786L6 0Z"/>
        </svg>
      `;

      starsContainer.appendChild(star);
    }

    return starsContainer;
  }

  /**
   * Создание адреса и расстояния
   */
  protected createAddress(): void {
    if (!this.contentContainer) return;

    const addressContainer = document.createElement('div');
    Object.assign(addressContainer.style, {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      marginBottom: '8px',
    });

    // Иконка локации
    const locationIcon = document.createElement('div');
    Object.assign(locationIcon.style, {
      width: '16px',
      height: '16px',
      marginTop: '2px',
      flexShrink: '0',
      color: '#666666',
    });

    locationIcon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 0C5.2 0 3 2.2 3 5c0 4.2 5 11 5 11s5-6.8 5-11c0-2.8-2.2-5-5-5Z" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="8" cy="5" r="2" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    `;

    // Текст адреса
    const addressText = document.createElement('div');
    Object.assign(addressText.style, {
      flex: '1',
      fontSize: '14px',
      color: '#666666',
      lineHeight: '1.4',
    });

    const { organization } = this.props;
    let addressContent = organization.address;

    // Добавляем расстояние если есть
    if (this.props.showDistance && organization.distance) {
      const distanceText =
        organization.distance < 1000
          ? `${organization.distance} м`
          : `${(organization.distance / 1000).toFixed(1)} км`;
      addressContent += ` • ${distanceText}`;
    }

    addressText.textContent = addressContent;

    addressContainer.appendChild(locationIcon);
    addressContainer.appendChild(addressText);

    addressContainer.className = 'org-card-address';
    this.contentContainer.appendChild(addressContainer);
  }

  /**
   * Создание описания
   */
  protected createDescription(): void {
    if (!this.contentContainer) return;

    const { organization } = this.props;

    if (!organization.description) return;

    const description = document.createElement('div');

    Object.assign(description.style, {
      fontSize: '14px',
      color: '#666666',
      lineHeight: '1.5',
      marginBottom: '12px',
      display: '-webkit-box',
      WebkitLineClamp: this.props.size === CardSize.FULL ? '3' : '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    });

    description.textContent = organization.description;
    description.className = 'org-card-description';

    this.contentContainer.appendChild(description);
  }

  /**
   * Создание времени работы
   */
  protected createWorkingHours(): void {
    if (!this.contentContainer) return;

    const { organization } = this.props;

    if (!organization.workingHours) return;

    const workingHours = document.createElement('div');

    Object.assign(workingHours.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '12px',
    });

    // Иконка часов
    const clockIcon = document.createElement('div');
    Object.assign(clockIcon.style, {
      width: '16px',
      height: '16px',
      color: '#666666',
    });

    clockIcon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 4v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;

    // Текст времени работы
    const hoursText = document.createElement('span');
    Object.assign(hoursText.style, {
      fontSize: '14px',
      color: '#666666',
    });
    hoursText.textContent = organization.workingHours;

    workingHours.appendChild(clockIcon);
    workingHours.appendChild(hoursText);

    workingHours.className = 'org-card-working-hours';
    this.contentContainer.appendChild(workingHours);
  }

  /**
   * Создание кнопок действий
   */
  protected createActions(): void {
    if (!this.contentContainer) return;

    const { organization } = this.props;

    if (!organization.phone) return;

    const actionsContainer = document.createElement('div');
    Object.assign(actionsContainer.style, {
      display: 'flex',
      gap: '8px',
      marginTop: 'auto',
    });

    // Кнопка звонка
    const callButton = document.createElement('button');
    Object.assign(callButton.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      border: '1px solid #1976D2',
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: '#1976D2',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    });

    callButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.05 12.39c-.4.46-.91.86-1.5 1.18-.59.32-1.24.48-1.95.48-1.26 0-2.58-.39-3.96-1.17-1.38-.78-2.76-1.88-4.14-3.3S1.75 7.52.97 6.14C.19 4.76-.2 3.44-.2 2.18c0-.71.16-1.36.48-1.95.32-.59.72-1.1 1.18-1.5.54-.46 1.14-.69 1.8-.69.27 0 .54.06.81.18.27.12.51.3.72.54l2.76 3.69c.21.27.36.51.45.72.09.21.14.42.14.63 0 .27-.09.54-.27.81s-.42.54-.72.81l-.81.81c-.09.09-.14.21-.14.36 0 .09.03.18.09.27.06.09.12.18.18.27.63 1.17 1.41 2.22 2.34 3.15.93.93 1.98 1.71 3.15 2.34.18.09.36.18.54.27s.36.14.54.14c.15 0 .27-.05.36-.14l.81-.81c.27-.27.54-.48.81-.66.27-.18.54-.27.81-.27.21 0 .42.05.63.14.21.09.45.24.72.45l3.69 2.76c.24.21.42.45.54.72.12.27.18.54.18.81 0 .66-.23 1.26-.69 1.8z" fill="currentColor"/>
      </svg>
      <span>Позвонить</span>
    `;

    // Hover эффекты
    callButton.addEventListener('mouseenter', () => {
      callButton.style.backgroundColor = '#1976D2';
      callButton.style.color = '#ffffff';
    });

    callButton.addEventListener('mouseleave', () => {
      callButton.style.backgroundColor = 'transparent';
      callButton.style.color = '#1976D2';
    });

    // Обработчик клика
    callButton.addEventListener('click', e => {
      e.stopPropagation();
      this.props.onCallClick?.(organization);
    });

    callButton.className = 'org-card-call-button';
    actionsContainer.appendChild(callButton);

    actionsContainer.className = 'org-card-actions';
    this.contentContainer.appendChild(actionsContainer);
  }

  /**
   * Настройка обработчиков событий
   */
  protected setupEventListeners(): void {
    // Клик по всей карточке
    this.element.addEventListener('click', () => {
      this.props.onClick?.(this.props.organization);
    });

    // Клик по фото (если есть)
    if (this.photoElement) {
      this.photoElement.addEventListener('click', e => {
        e.stopPropagation();
        this.props.onPhotoClick?.(this.props.organization);
      });
    }
  }

  /**
   * Обновление данных организации
   */
  public updateOrganization(organization: Organization): void {
    this.props.organization = organization;

    // Перерендериваем карточку
    this.element.innerHTML = '';
    this.createCard();
  }

  /**
   * Получение данных организации
   */
  public getOrganization(): Organization {
    return this.props.organization;
  }

  /**
   * Обновление пропсов
   */
  public updateProps(newProps: Partial<OrganizationCardProps>): void {
    this.props = { ...this.props, ...newProps };

    // Перерендериваем если изменились критичные пропсы
    const shouldRerender =
      newProps.size !== undefined ||
      newProps.showPhoto !== undefined ||
      newProps.organization !== undefined;

    if (shouldRerender) {
      this.element.innerHTML = '';
      this.createCard();
    }
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    // DOM элементы будут очищены автоматически
    this.contentContainer = undefined;
    this.photoElement = undefined;
  }
}

/**
 * Фабрика для создания OrganizationCard
 */
export class OrganizationCardFactory {
  /**
   * Создание карточки организации
   */
  static create(containerElement: HTMLElement, props: OrganizationCardProps): OrganizationCard {
    return new OrganizationCard(containerElement, props);
  }

  /**
   * Создание компактной карточки
   */
  static createCompact(
    containerElement: HTMLElement,
    organization: Organization
  ): OrganizationCard {
    return new OrganizationCard(containerElement, {
      organization,
      size: CardSize.COMPACT,
      showPhoto: false,
      showDescription: false,
      showWorkingHours: false,
    });
  }

  /**
   * Создание стандартной карточки
   */
  static createStandard(
    containerElement: HTMLElement,
    organization: Organization
  ): OrganizationCard {
    return new OrganizationCard(containerElement, {
      organization,
      size: CardSize.STANDARD,
      showPhoto: true,
      showDescription: true,
      showWorkingHours: false,
    });
  }

  /**
   * Создание полной карточки
   */
  static createFull(containerElement: HTMLElement, organization: Organization): OrganizationCard {
    return new OrganizationCard(containerElement, {
      organization,
      size: CardSize.FULL,
      showPhoto: true,
      showDescription: true,
      showWorkingHours: true,
    });
  }
}
