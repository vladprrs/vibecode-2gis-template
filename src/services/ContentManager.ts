import { SearchContext, SearchFlowManager } from '../types';

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
      { type: 'home', title: 'Дом', subtitle: ['Красный проспект, 49', '5 км'], hasSubtitle: true, icon: 'home' },
      { type: 'search', title: 'Мебель', subtitle: [], hasSubtitle: false, icon: 'search' },
      { type: 'branch', title: 'МЕСТО, инвест-апарты', subtitle: ['Красный проспект, 49'], hasSubtitle: true, icon: 'building' },
      { type: 'category', title: 'Мечети', subtitle: ['6 филиалов', 'Место для намаза'], hasSubtitle: true, icon: 'category' },
      { type: 'category', title: 'Боулинг', subtitle: ['6 филиалов', 'Места отдыха'], hasSubtitle: true, icon: 'category' },
      { type: 'category', title: 'Аквапарки/Водные аттракционы', subtitle: ['6 филиалов', 'Места отдыха'], hasSubtitle: true, icon: 'category' },
      { type: 'category', title: 'Газпромнефть азс', subtitle: [], hasSubtitle: false, icon: 'category' },
      { type: 'category', title: 'Гостиницы', subtitle: ['222 филиала'], hasSubtitle: true, icon: 'category' },
      { type: 'category', title: 'Грильница, сеть ресторанов вкусной…', subtitle: ['22 филиала'], hasSubtitle: true, icon: 'category' },
      { type: 'transport', title: '12, автобус', subtitle: ['Александра Чистякова — Дюканова'], hasSubtitle: true, icon: 'bus' },
      { type: 'transport', title: 'Площадь Калинина, остановка', subtitle: ['Новосибирск'], hasSubtitle: true, icon: 'bus' },
      { type: 'metro', title: 'Октябрьская', subtitle: ['Ленинская линия', '5 км'], hasSubtitle: true, icon: 'metro' }
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
        type: 'advertiser',
        title: 'Реактор',
        subtitle: 'Региональная сеть автокомплексов для японских автомобилей',
        rating: '4.6',
        reviews: '120 оценок',
        distance: '3 мин',
        address: 'Тверская 32/12, 1 этаж, Москва',
        adText: 'Скажи кодовое слово «2ГИС» и получи карточку лояльности!',
        buttonText: 'Записаться на прием',
        hasCrown: true
      },
      {
        type: 'advertiser',
        title: 'Реактор',
        subtitle: 'Региональная сеть автокомплексов для японских автомобилей',
        rating: '4.6',
        reviews: '120 оценок',
        distance: '3 мин',
        address: 'Тверская 32/12, 1 этаж, Москва',
        adText: 'Скажи кодовое слово «2ГИС» и получи карточку лояльности!',
        buttonText: 'Записаться на прием',
        hasCrown: true
      },
      {
        type: 'non-advertiser',
        title: 'Шиномонтаж',
        subtitle: 'Региональная сеть автокомплексов для японских автомобилей',
        rating: '4.6',
        reviews: '120 оценок',
        distance: '3 мин',
        address: 'Тверская 32/12, 1 этаж, Москва',
        parking: '500 мест • Цена в час 50 ₽ • Теплая',
        buttonText: 'Заказать доставку',
        hasFriends: true
      }
    ];

    results.forEach((result, index) => {
      const resultCard = this.createResultCard(result);
      resultsContainer.appendChild(resultCard);

      if (index === 1) {
        const banner = document.createElement('div');
        banner.textContent = 'Promo';
        resultsContainer.appendChild(banner);
      }
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
    });

    return card;
  }
}
