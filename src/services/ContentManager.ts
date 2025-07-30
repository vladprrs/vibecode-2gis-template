import { Organization, SearchContext, SearchFlowManager } from '../types';

export class ContentManager {
  private searchFlowManager: SearchFlowManager;
  private dashboardContent?: HTMLElement;

  constructor(searchFlowManager: SearchFlowManager) {
    this.searchFlowManager = searchFlowManager;
  }

  updateContentForSuggest(contentContainer: HTMLElement): void {
    if (!this.dashboardContent) {
      this.dashboardContent = contentContainer.cloneNode(true) as HTMLElement;
    }
    contentContainer.innerHTML = '';
    contentContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      background: rgba(0, 0, 0, 0.00);
      box-shadow: 0 -0.5px 0 0 rgba(137, 137, 137, 0.30) inset;
      position: relative;
      padding: 0;
      margin: 0;
      overflow-y: auto;
    `;

    const suggestions = [
      {
        type: 'home',
        title: 'Дом',
        subtitle: ['Красный проспект, 49', '5 км'],
        hasSubtitle: true,
        icon: 'home',
      },
      { type: 'search', title: 'Фитнес клубы', subtitle: [], hasSubtitle: false, icon: 'search' },
      {
        type: 'branch',
        title: 'Фитнес Хаус',
        subtitle: ['Красный проспект, 49'],
        hasSubtitle: true,
        icon: 'building',
      },
      {
        type: 'category',
        title: 'Спортивные клубы',
        subtitle: ['12 филиалов', 'Фитнес и спорт'],
        hasSubtitle: true,
        icon: 'category',
      },
      {
        type: 'category',
        title: 'Йога студии',
        subtitle: ['8 филиалов', 'Здоровье и спорт'],
        hasSubtitle: true,
        icon: 'category',
      },
      {
        type: 'category',
        title: 'Бассейны',
        subtitle: ['6 филиалов', 'Водные виды спорта'],
        hasSubtitle: true,
        icon: 'category',
      },
      {
        type: 'category',
        title: 'Спортивная одежда',
        subtitle: [],
        hasSubtitle: false,
        icon: 'category',
      },
      {
        type: 'category',
        title: 'Фитнес тренеры',
        subtitle: ['45 специалистов'],
        hasSubtitle: true,
        icon: 'category',
      },
      {
        type: 'category',
        title: 'Спортивное питание',
        subtitle: ['18 магазинов'],
        hasSubtitle: true,
        icon: 'category',
      },
      {
        type: 'transport',
        title: '12, автобус',
        subtitle: ['Александра Чистякова — Дюканова'],
        hasSubtitle: true,
        icon: 'bus',
      },
      {
        type: 'transport',
        title: 'Площадь Калинина, остановка',
        subtitle: ['Новосибирск'],
        hasSubtitle: true,
        icon: 'bus',
      },
      {
        type: 'metro',
        title: 'Октябрьская',
        subtitle: ['Ленинская линия', '5 км'],
        hasSubtitle: true,
        icon: 'metro',
      },
    ];

    suggestions.forEach((suggestion, index) => {
      const row = this.createSuggestionRow(suggestion, index === suggestions.length - 1);
      contentContainer.appendChild(row);
    });
  }

  private createSuggestionRow(suggestion: any, isLast: boolean): HTMLElement {
    const row = document.createElement('div');
    row.style.cssText = `
      display: flex;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const contentRow = document.createElement('div');
    contentRow.style.cssText = `
      display: flex;
      padding-left: 16px;
      align-items: flex-start;
      gap: 12px;
      flex: 1 0 0;
      position: relative;
      padding-top: 16px;
      padding-bottom: 16px;
      ${!isLast ? 'border-bottom: 0.5px solid rgba(137, 137, 137, 0.30);' : ''}
      cursor: pointer;
    `;

    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      width: 24px;
      height: 24px;
      position: relative;
      margin-top: -2px;
    `;

    let iconSvg = '';
    switch (suggestion.icon) {
      case 'home':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="9,22 9,12 15,12 15,22" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'search':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="#898989" stroke-width="1.5"/>
          <path d="m21 21-4.35-4.35" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'building':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'category':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#898989" stroke-width="1.5"/>
          <path d="M12 6v6l4 2" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'bus':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M8 6v6M16 6v6M4 15l4-9 8 0 4 9-4 2-8 0-4-2z" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      case 'metro':
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#898989" stroke-width="1.5"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="9" y1="9" x2="9.01" y2="9" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="15" y1="9" x2="15.01" y2="9" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        break;
      default:
        iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#898989" stroke-width="1.5"/>
        </svg>`;
    }

    iconContainer.innerHTML = iconSvg;

    const textContent = document.createElement('div');
    textContent.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1 0 0;
      position: relative;
    `;

    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      flex: 1 0 0;
      font-family: 'SB Sans Text', -apple-system, Roboto, Helvetica, sans-serif;
      font-style: normal;
      font-weight: ${suggestion.type === 'home' ? '500' : '400'};
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.24px;
      color: #141414;
      position: relative;
    `;

    if (suggestion.title.toLowerCase().includes('ме')) {
      const parts = suggestion.title.split(/(ме|МЕ)/gi);
      title.innerHTML = parts
        .map((part: string) =>
          part.toLowerCase() === 'ме' || part === 'МЕ'
            ? `<span style="font-weight: 500;">${part}</span>`
            : part
        )
        .join('');
    } else {
      title.textContent = suggestion.title;
    }

    titleContainer.appendChild(title);
    textContent.appendChild(titleContainer);

    if (suggestion.hasSubtitle && suggestion.subtitle.length > 0) {
      const subtitleContainer = document.createElement('div');
      subtitleContainer.style.cssText = `
        display: flex;
        align-items: flex-start;
        align-self: stretch;
        position: relative;
        gap: 4px;
      `;

      suggestion.subtitle.forEach((subtitleText: string, index: number) => {
        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
          font-family: 'SB Sans Text', -apple-system, Roboto, Helvetica, sans-serif;
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 18px;
          letter-spacing: -0.28px;
          color: #898989;
          position: relative;
        `;
        subtitle.textContent = subtitleText;
        subtitleContainer.appendChild(subtitle);

        if (index < suggestion.subtitle.length - 1) {
          const separator = document.createElement('div');
          separator.style.cssText = `
            color: #898989;
            font-size: 14px;
            line-height: 18px;
          `;
          separator.textContent = '•';
          subtitleContainer.appendChild(separator);
        }
      });

      textContent.appendChild(subtitleContainer);
    }

    contentRow.addEventListener('click', () => {
      this.searchFlowManager.goToSearchResults(suggestion.title);
    });

    contentRow.addEventListener('mouseenter', () => {
      contentRow.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
    });

    contentRow.addEventListener('mouseleave', () => {
      contentRow.style.backgroundColor = 'transparent';
    });

    contentRow.appendChild(iconContainer);
    contentRow.appendChild(textContent);
    row.appendChild(contentRow);

    return row;
  }

  updateContentForDashboard(contentContainer: HTMLElement): void {
    if (!contentContainer || !this.dashboardContent) return;
    contentContainer.innerHTML = '';
    const restoredContent = this.dashboardContent.cloneNode(true) as HTMLElement;
    while (restoredContent.firstChild) {
      contentContainer.appendChild(restoredContent.firstChild);
    }
  }

  updateContentForSearchResult(contentContainer: HTMLElement, context: SearchContext): void {
    if (!contentContainer) return;
    if (!this.dashboardContent) {
      this.dashboardContent = contentContainer.cloneNode(true) as HTMLElement;
    }
    contentContainer.innerHTML = '';
    contentContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      background: #FFF;
      position: relative;
      padding: 0;
      margin: 0;
      overflow-y: auto;
    `;
    this.createResultsContent(contentContainer, context);
  }

  private createResultsContent(container: HTMLElement, context: SearchContext): void {
    const resultsContainer = document.createElement('div');
    resultsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      background: #FFF;
      position: relative;
      padding-bottom: 80px;
    `;

    const results = [
      {
        id: 'advertiser-1',
        type: 'advertiser',
        title: 'Фитнес Хаус',
        subtitle: 'Современный фитнес-клуб с полным спектром услуг',
        rating: '4.8',
        reviews: '156 оценок',
        distance: '3 мин',
        address: 'Тверская 32/12, 1 этаж, Москва',
        adText: 'Скидка 20% на первый месяц! Промокод "2GIS"',
        buttonText: 'Записаться на пробное',
        hasCrown: true,
        isAdvertiser: true,
        organization: {
          id: 'advertiser-1',
          name: 'Фитнес Хаус',
          address: 'Тверская 32/12, 1 этаж, Москва',
          coordinates: [37.6173, 55.7558] as [number, number],
          isAdvertiser: true,
          rating: 4.8,
          reviewsCount: 156,
          category: 'Фитнес-клуб',
          description:
            'Современный фитнес-клуб с новейшим оборудованием, бассейном, сауной и профессиональными тренерами.',
          phone: '+7 (495) 123-45-67',
          workingHours: 'Пн-Вс: 06:00-24:00',
        },
      },
      {
        id: 'non-advertiser-1',
        type: 'non-advertiser',
        title: 'СпортЛайф',
        subtitle: 'Фитнес-центр с групповыми занятиями',
        rating: '4.5',
        reviews: '89 оценок',
        distance: '5 мин',
        address: 'ул. Садовая, 45, Москва',
        parking: 'Бесплатная парковка • Тренажерный зал • Групповые занятия',
        buttonText: 'Записаться на занятие',
        hasFriends: true,
        isAdvertiser: false,
        organization: {
          id: 'non-advertiser-1',
          name: 'СпортЛайф',
          address: 'ул. Садовая, 45, Москва',
          coordinates: [37.6203, 55.7489] as [number, number],
          isAdvertiser: false,
          rating: 4.5,
          reviewsCount: 89,
          category: 'Фитнес-клуб',
          description:
            'Уютный фитнес-центр с разнообразными групповыми занятиями и персональными тренировками.',
          phone: '+7 (495) 987-65-43',
          workingHours: 'Пн-Вс: 07:00-23:00',
        },
      },
      {
        id: 'advertiser-2',
        type: 'advertiser',
        title: 'Элит Фитнес',
        subtitle: 'Премиальный фитнес-клуб с бассейном',
        rating: '4.9',
        reviews: '234 оценки',
        distance: '7 мин',
        address: 'Ленинский проспект, 123, Москва',
        adText: 'Бесплатная консультация тренера при покупке абонемента!',
        buttonText: 'Записаться онлайн',
        hasCrown: true,
        isAdvertiser: true,
        organization: {
          id: 'advertiser-2',
          name: 'Элит Фитнес',
          address: 'Ленинский проспект, 123, Москва',
          coordinates: [37.5847, 55.7342] as [number, number],
          isAdvertiser: true,
          rating: 4.9,
          reviewsCount: 234,
          category: 'Фитнес-клуб',
          description:
            'Премиальный фитнес-клуб с бассейном, сауной, спа-зоной и высококвалифицированными тренерами.',
          phone: '+7 (495) 555-77-99',
          workingHours: 'Круглосуточно',
        },
      },
    ];

    results.forEach((result, index) => {
      const resultCard = this.createResultCard(result);
      resultsContainer.appendChild(resultCard);

      // if (index === 1) {
      //   const banner = document.createElement('div');
      //   banner.textContent = 'Promo';
      //   resultsContainer.appendChild(banner);
      // }
    });

    container.appendChild(resultsContainer);
  }

  private createResultCard(result: any): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      display: flex;
      padding: 16px;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      border-bottom: 0.5px solid rgba(137, 137, 137, 0.30);
      cursor: pointer;
    `;

    const topSection = document.createElement('div');
    topSection.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      gap: 4px;
    `;

    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      align-items: center;
      align-self: stretch;
      gap: 8px;
    `;

    const title = document.createElement('h3');
    title.textContent = result.title;
    title.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 600;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.24px;
      margin: 0;
      flex: 1;
    `;

    titleContainer.appendChild(title);

    if (result.hasCrown) {
      const crownBadge = document.createElement('div');
      crownBadge.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="#1BA136"><path d="M8 1l2 3h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-3z"/></svg>`;
      titleContainer.appendChild(crownBadge);
    }

    const subtitle = document.createElement('p');
    subtitle.textContent = result.subtitle;
    subtitle.style.cssText = `
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
      margin: 0;
      align-self: stretch;
    `;

    topSection.appendChild(titleContainer);
    topSection.appendChild(subtitle);

    const infoSection = document.createElement('div');
    infoSection.style.cssText = `
      display: flex;
      align-items: center;
      align-self: stretch;
      gap: 12px;
      margin-top: 8px;
    `;

    const ratingContainer = document.createElement('div');
    ratingContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
    `;

    const stars = document.createElement('div');
    stars.innerHTML = '★★★★★';
    stars.style.cssText = `
      color: #FFD700;
      font-size: 12px;
    `;

    const ratingText = document.createElement('span');
    ratingText.textContent = result.rating;
    ratingText.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 500;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
    `;

    const reviewsText = document.createElement('span');
    reviewsText.textContent = result.reviews;
    reviewsText.style.cssText = `
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
    `;

    const distanceText = document.createElement('span');
    distanceText.textContent = result.distance;
    distanceText.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 500;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
    `;

    ratingContainer.appendChild(stars);
    ratingContainer.appendChild(ratingText);
    ratingContainer.appendChild(reviewsText);
    infoSection.appendChild(ratingContainer);
    infoSection.appendChild(distanceText);

    const address = document.createElement('p');
    address.textContent = result.address;
    address.style.cssText = `
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
      margin: 4px 0 0 0;
      align-self: stretch;
    `;

    card.appendChild(topSection);
    card.appendChild(infoSection);
    card.appendChild(address);

    if (result.type === 'advertiser' && result.adText) {
      const adSection = document.createElement('div');
      adSection.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        align-self: stretch;
        margin-top: 12px;
        padding: 12px;
        border-radius: 8px;
        background: rgba(27, 161, 54, 0.05);
        gap: 8px;
      `;

      const adText = document.createElement('p');
      adText.textContent = result.adText;
      adText.style.cssText = `
        color: #141414;
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
        font-weight: 400;
        font-size: 14px;
        line-height: 18px;
        letter-spacing: -0.28px;
        margin: 0;
      `;

      const adButton = document.createElement('button');
      adButton.textContent = result.buttonText;
      adButton.style.cssText = `
        display: flex;
        padding: 8px 12px;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        background: #1BA136;
        color: #FFF;
        border: none;
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
        font-weight: 600;
        font-size: 15px;
        line-height: 20px;
        letter-spacing: -0.3px;
        cursor: pointer;
      `;

      const adDisclaimer = document.createElement('p');
      adDisclaimer.textContent = 'Реклама • Есть противопоказания, нужна консультация врача';
      adDisclaimer.style.cssText = `
        color: #898989;
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
        font-weight: 400;
        font-size: 11px;
        line-height: 14px;
        letter-spacing: -0.176px;
        margin: 0;
      `;

      adSection.appendChild(adText);
      adSection.appendChild(adButton);
      adSection.appendChild(adDisclaimer);
      card.appendChild(adSection);
    }

    card.addEventListener('click', () => {
      console.log('Result card clicked:', result.title);
      // Переходим к карточке организации
      if (result.organization) {
        this.searchFlowManager.goToOrganization(result.organization);
      }
    });

    return card;
  }

  updateContentForOrganization(contentContainer: HTMLElement, organization: Organization): void {
    if (!contentContainer) return;
    if (!this.dashboardContent) {
      this.dashboardContent = contentContainer.cloneNode(true) as HTMLElement;
    }
    contentContainer.innerHTML = '';
    contentContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      background: #FFF;
      position: relative;
      padding: 0;
      margin: 0;
      overflow-y: auto;
    `;
    this.createOrganizationContent(contentContainer, organization);
  }

  private createOrganizationContent(container: HTMLElement, organization: Organization): void {
    const orgContainer = document.createElement('div');
    orgContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      background: #FFF;
      position: relative;
      padding-bottom: 80px;
    `;

    // Создаем основную карточку организации
    const mainCard = this.createOrganizationMainCard(organization);
    orgContainer.appendChild(mainCard);

    // Создаем табы (если рекламодатель - больше табов)
    const tabsSection = this.createOrganizationTabs(organization);
    orgContainer.appendChild(tabsSection);

    // Создаем секцию контактов
    const contactsSection = this.createOrganizationContacts(organization);
    orgContainer.appendChild(contactsSection);

    // Создаем секцию с дополнительной информацией
    if (organization.isAdvertiser) {
      const extraSection = this.createAdvertiserExtraContent(organization);
      orgContainer.appendChild(extraSection);
    }

    container.appendChild(orgContainer);
  }

  private createOrganizationMainCard(organization: Organization): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      display: flex;
      padding: 16px;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      border-bottom: 8px solid #F5F5F5;
    `;

    // Создаем фото организации (заглушка)
    const photo = document.createElement('div');
    photo.style.cssText = `
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      font-family: 'system-ui, -apple-system, sans-serif';
    `;
    photo.textContent = organization.name;

    // Создаем информацию о рейтинге
    const ratingInfo = document.createElement('div');
    ratingInfo.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    `;

    const stars = document.createElement('div');
    stars.innerHTML = '★★★★★';
    stars.style.cssText = `
      color: #FFD700;
      font-size: 16px;
    `;

    const ratingText = document.createElement('span');
    ratingText.textContent = `${organization.rating || 4.5} • ${organization.reviewsCount || 120} отзывов`;
    ratingText.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 500;
      font-size: 14px;
    `;

    const distance = document.createElement('span');
    distance.textContent = '3 мин';
    distance.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 500;
      font-size: 14px;
    `;

    ratingInfo.appendChild(stars);
    ratingInfo.appendChild(ratingText);
    ratingInfo.appendChild(distance);

    // Создаем описание если есть
    if (organization.description) {
      const description = document.createElement('p');
      description.textContent = organization.description;
      description.style.cssText = `
        color: #898989;
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
        font-weight: 400;
        font-size: 14px;
        line-height: 18px;
        margin: 0;
      `;
      card.appendChild(description);
    }

    card.appendChild(photo);
    card.appendChild(ratingInfo);

    return card;
  }

  private createOrganizationTabs(organization: Organization): HTMLElement {
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-self: stretch;
      border-bottom: 8px solid #F5F5F5;
    `;

    // Создаем табы
    const tabsHeader = document.createElement('div');
    tabsHeader.style.cssText = `
      display: flex;
      align-items: center;
      align-self: stretch;
      border-bottom: 1px solid #F0F0F0;
    `;

    const baseTabs = ['О заведении', 'Контакты'];
    const advertiserTabs = organization.isAdvertiser
      ? ['О заведении', 'Вам может пригодиться', 'Услуги', 'Акции', 'Контакты']
      : baseTabs;

    advertiserTabs.forEach((tabName, index) => {
      const tab = document.createElement('button');
      tab.style.cssText = `
        padding: 12px 16px;
        border: none;
        background: transparent;
        color: ${index === 0 ? '#1BA136' : '#898989'};
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        border-bottom: ${index === 0 ? '2px solid #1BA136' : '2px solid transparent'};
      `;
      tab.textContent = tabName;
      tabsHeader.appendChild(tab);
    });

    // Контент таба (заглушка для демо)
    const tabContent = document.createElement('div');
    tabContent.style.cssText = `
      padding: 16px;
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 20px;
    `;
    tabContent.textContent = organization.isAdvertiser
      ? 'Подробная информация о фитнес-клубе, услугах и специальных предложениях для посетителей.'
      : 'Основная информация о фитнес-клубе.';

    tabsContainer.appendChild(tabsHeader);
    tabsContainer.appendChild(tabContent);

    return tabsContainer;
  }

  private createOrganizationContacts(organization: Organization): HTMLElement {
    const contactsSection = document.createElement('div');
    contactsSection.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      padding: 16px;
      border-bottom: 8px solid #F5F5F5;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Контакты';
    title.style.cssText = `
      margin: 0 0 16px 0;
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 600;
      font-size: 18px;
    `;

    const contactsList = document.createElement('div');
    contactsList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-self: stretch;
    `;

    // Адрес
    const addressItem = this.createContactItem('📍', 'Адрес', organization.address);
    contactsList.appendChild(addressItem);

    // Телефон
    if (organization.phone) {
      const phoneItem = this.createContactItem('📞', 'Телефон', organization.phone);
      contactsList.appendChild(phoneItem);
    }

    // Время работы
    if (organization.workingHours) {
      const hoursItem = this.createContactItem('🕒', 'Время работы', organization.workingHours);
      contactsList.appendChild(hoursItem);
    }

    contactsSection.appendChild(title);
    contactsSection.appendChild(contactsList);

    return contactsSection;
  }

  private createContactItem(emoji: string, label: string, value: string): HTMLElement {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 12px;
    `;

    const icon = document.createElement('div');
    icon.textContent = emoji;
    icon.style.cssText = `
      font-size: 16px;
      margin-top: 2px;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
    `;

    const labelElement = document.createElement('div');
    labelElement.textContent = label;
    labelElement.style.cssText = `
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-size: 12px;
      margin-bottom: 2px;
    `;

    const valueElement = document.createElement('div');
    valueElement.textContent = value;
    valueElement.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-size: 14px;
      font-weight: 500;
    `;

    content.appendChild(labelElement);
    content.appendChild(valueElement);
    item.appendChild(icon);
    item.appendChild(content);

    return item;
  }

  private createAdvertiserExtraContent(organization: Organization): HTMLElement {
    const extraSection = document.createElement('div');
    extraSection.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      padding: 16px;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Специальные предложения';
    title.style.cssText = `
      margin: 0 0 16px 0;
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 600;
      font-size: 18px;
    `;

    // Создаем карточку предложения
    const offerCard = document.createElement('div');
    offerCard.style.cssText = `
      display: flex;
      flex-direction: column;
      align-self: stretch;
      padding: 16px;
      background: rgba(27, 161, 54, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(27, 161, 54, 0.1);
      gap: 12px;
    `;

    const offerTitle = document.createElement('div');
    offerTitle.textContent = '🎉 Скидка на спортивную одежду!';
    offerTitle.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 600;
      font-size: 16px;
    `;

    const offerText = document.createElement('div');
    offerText.textContent =
      'Скидка 15% на спортивную одежду и обувь при покупке абонемента на 3 месяца';
    offerText.style.cssText = `
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 20px;
    `;

    offerCard.appendChild(offerTitle);
    offerCard.appendChild(offerText);

    extraSection.appendChild(title);
    extraSection.appendChild(offerCard);

    return extraSection;
  }
}
