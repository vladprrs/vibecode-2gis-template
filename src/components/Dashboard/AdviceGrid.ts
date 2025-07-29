export interface AdviceGridProps {
  container: HTMLElement;
  onItemClick?: (itemId: string) => void;
}

export class AdviceGrid {
  private props: AdviceGridProps;
  private element: HTMLElement;

  constructor(props: AdviceGridProps) {
    this.props = props;
    this.element = this.createAdviceGrid();
    this.props.container.appendChild(this.element);
  }

  private createAdviceGrid(): HTMLElement {
    const gridContainer = document.createElement('div');
    gridContainer.className = 'advice-grid';
    gridContainer.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 12px;
      align-self: stretch;
      position: relative;
    `;

    // Left Column
    const leftColumn = document.createElement('div');
    leftColumn.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      flex: 1 0 0;
      position: relative;
    `;

    // Large Cover Card
    const largeCoverCard = this.createLargeCoverCard();
    leftColumn.appendChild(largeCoverCard);

    // Meta Items in left column
    const metaItem1 = this.createMetaItem('Воскресные бранчи', '156 мест', '🍴');
    leftColumn.appendChild(metaItem1);

    const metaItem2 = this.createMetaItem('Банкоматы', 'Number', '🏧');
    leftColumn.appendChild(metaItem2);

    // Small Cover Card
    const smallCoverCard = this.createSmallCoverCard();
    leftColumn.appendChild(smallCoverCard);

    // Right Column
    const rightColumn = document.createElement('div');
    rightColumn.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      flex: 1 0 0;
      position: relative;
    `;

    // Meta Item Ad
    const metaItemAd = this.createMetaItemAd();
    rightColumn.appendChild(metaItemAd);

    // Meta Item
    const metaItem3 = this.createMetaItem('Школьная форма', '112 мест', '🎓');
    rightColumn.appendChild(metaItem3);

    // RD Card
    const rdCard = this.createRDCard();
    rightColumn.appendChild(rdCard);

    // Meta Item
    const metaItem4 = this.createMetaItem('Все рубрики', '3 256 567 мест', '📋');
    rightColumn.appendChild(metaItem4);

    gridContainer.appendChild(leftColumn);
    gridContainer.appendChild(rightColumn);

    return gridContainer;
  }

  private createLargeCoverCard(): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      width: 166px;
      height: 244px;
      border-radius: 12px;
      background: #FFF;
      position: relative;
      cursor: pointer;
      overflow: hidden;
    `;

    // Card container
    const cardContainer = document.createElement('div');
    cardContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1 0 0;
      align-self: stretch;
      border-radius: 12px;
      position: relative;
      height: 100%;
    `;

    // Text content
    const textContent = document.createElement('div');
    textContent.style.cssText = `
      display: flex;
      padding: 0 16px;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    // Title
    const title = document.createElement('div');
    title.style.cssText = `
      display: flex;
      padding: 10px 0 2px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const titleText = document.createElement('div');
    titleText.style.cssText = `
      flex: 1 0 0;
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: -0.24px;
    `;
    titleText.textContent = 'Туристический слой';

    // Subtitle
    const subtitle = document.createElement('div');
    subtitle.style.cssText = `
      display: flex;
      padding-bottom: 12px;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const subtitleText = document.createElement('div');
    subtitleText.style.cssText = `
      flex: 1 0 0;
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: -0.28px;
    `;
    subtitleText.textContent = 'Лучшие места города на карте';

    // Image
    const image = document.createElement('img');
    image.src = '/assets/images/promo/img-c1dcdcdd.png';
    image.alt = 'Туристический слой';
    image.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-end;
      flex: 1 0 0;
      align-self: stretch;
      position: relative;
      width: 100%;
      height: auto;
      object-fit: cover;
    `;

    title.appendChild(titleText);
    subtitle.appendChild(subtitleText);
    textContent.appendChild(title);
    textContent.appendChild(subtitle);
    cardContainer.appendChild(textContent);
    cardContainer.appendChild(image);
    card.appendChild(cardContainer);

    card.addEventListener('click', () => {
      this.props.onItemClick?.('promo-card');
    });

    return card;
  }

  private createSmallCoverCard(): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      width: 166px;
      height: 116px;
      border-radius: 12px;
      border: 0.5px solid rgba(137, 137, 137, 0.30);
      background: #FFF;
      position: relative;
      cursor: pointer;
      overflow: hidden;
    `;

    // Background image placeholder
    const background = document.createElement('div');
    background.style.cssText = `
      width: 166px;
      height: 116px;
      flex-shrink: 0;
      position: absolute;
      left: 0px;
      top: 0px;
      background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
    `;

    // Overlay gradient
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      width: 166px;
      height: 116px;
      flex-shrink: 0;
      border-radius: 12px;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0.28) 42.34%, rgba(0, 0, 0, 0.00) 100%);
      position: absolute;
      left: 0px;
      top: 0px;
    `;

    // Content container
    const content = document.createElement('div');
    content.style.cssText = `
      display: flex;
      width: 166px;
      padding: 0 16px;
      flex-direction: column;
      align-items: flex-start;
      position: absolute;
      left: 0px;
      top: 0px;
      height: 70px;
    `;

    // Title
    const title = document.createElement('div');
    title.style.cssText = `
      display: flex;
      padding: 10px 0 2px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const titleText = document.createElement('div');
    titleText.style.cssText = `
      flex: 1 0 0;
      color: #FFF;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 16px;
      color: rgba(255,255,255,1);
    `;
    titleText.textContent = 'Товары для ремонта';

    // Subtitle
    const subtitle = document.createElement('div');
    subtitle.style.cssText = `
      display: flex;
      padding: 1px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const subtitleText = document.createElement('div');
    subtitleText.style.cssText = `
      flex: 1 0 0;
      color: #FFF;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 13px;
      color: rgba(255,255,255,1);
    `;
    subtitleText.textContent = '13 мест';

    title.appendChild(titleText);
    subtitle.appendChild(subtitleText);
    content.appendChild(title);
    content.appendChild(subtitle);

    card.appendChild(background);
    card.appendChild(overlay);
    card.appendChild(content);

    card.addEventListener('click', () => {
      this.props.onItemClick?.('small-cover');
    });

    return card;
  }

  private createMetaItem(title: string, subtitle: string, icon: string): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      display: flex;
      height: 116px;
      justify-content: center;
      align-items: center;
      align-self: stretch;
      border-radius: 12px;
      background: #FFF;
      position: relative;
      cursor: pointer;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      display: flex;
      padding: 0 16px 12px 16px;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      flex: 1 0 0;
      align-self: stretch;
      border-radius: 12px;
      position: absolute;
      left: 0px;
      top: 0px;
      width: 166px;
      height: 116px;
    `;

    const textContent = document.createElement('div');
    textContent.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      display: flex;
      padding: 10px 0 2px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const titleText = document.createElement('div');
    titleText.style.cssText = `
      flex: 1 0 0;
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 16px;
      color: rgba(20,20,20,1);
    `;
    titleText.textContent = title;

    // Subtitle
    const subtitleDiv = document.createElement('div');
    subtitleDiv.style.cssText = `
      display: flex;
      padding: 1px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const subtitleText = document.createElement('div');
    subtitleText.style.cssText = `
      flex: 1 0 0;
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 13px;
      color: rgba(137,137,137,1);
    `;
    subtitleText.textContent = subtitle;

    // Icon
    const iconDiv = document.createElement('div');
    iconDiv.style.cssText = `
      display: flex;
      height: 1px;
      justify-content: flex-end;
      align-items: flex-end;
      align-self: stretch;
      position: relative;
    `;

    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      display: flex;
      padding: 8px;
      justify-content: center;
      align-items: center;
      border-radius: 24px;
      background: rgba(20, 20, 20, 0.06);
      position: relative;
    `;

    const iconElement = document.createElement('div');
    iconElement.style.cssText = `
      width: 32px;
      height: 32px;
      position: relative;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    iconElement.textContent = icon;

    titleDiv.appendChild(titleText);
    subtitleDiv.appendChild(subtitleText);
    textContent.appendChild(titleDiv);
    textContent.appendChild(subtitleDiv);
    iconContainer.appendChild(iconElement);
    iconDiv.appendChild(iconContainer);
    content.appendChild(textContent);
    content.appendChild(iconDiv);
    card.appendChild(content);

    card.addEventListener('click', () => {
      this.props.onItemClick?.(title.toLowerCase().replace(/\s+/g, '-'));
    });

    return card;
  }

  private createMetaItemAd(): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      height: 116px;
      align-self: stretch;
      border-radius: 12px;
      border: 1px solid rgba(20, 20, 20, 0.06);
      background: #FFF;
      position: relative;
      cursor: pointer;
    `;

    // Fade overlay
    const fade = document.createElement('div');
    fade.style.cssText = `
      width: 166px;
      height: 116px;
      flex-shrink: 0;
      background: linear-gradient(294deg, rgba(0, 0, 0, 0.30) -1.66%, rgba(0, 0, 0, 0.06) 58.04%, rgba(0, 0, 0, 0.00) 97.93%);
      position: absolute;
      left: 0px;
      top: 0px;
    `;

    // Color background
    const colorBg = document.createElement('div');
    colorBg.style.cssText = `
      width: 166px;
      height: 116px;
      position: absolute;
      right: -0.5px;
      background: #EB6100;
      left: 0px;
      top: 0px;
    `;

    // Card content
    const cardContent = document.createElement('div');
    cardContent.style.cssText = `
      width: 166px;
      height: 116px;
      flex-shrink: 0;
      border-radius: 12px;
      position: absolute;
      left: 0px;
      top: 0px;
    `;

    // Icon position
    const iconPosition = document.createElement('div');
    iconPosition.style.cssText = `
      display: flex;
      width: 166px;
      padding: 56px 16px 12px 102px;
      justify-content: flex-end;
      align-items: center;
      position: absolute;
      left: 0px;
      top: 0px;
      height: 116px;
    `;

    // Userpic
    const userpic = document.createElement('div');
    userpic.style.cssText = `
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      border-radius: 24px;
      position: absolute;
      left: 102px;
      top: 56px;
      width: 48px;
      height: 48px;
    `;

    const userpicContainer = document.createElement('div');
    userpicContainer.style.cssText = `
      display: flex;
      width: 48px;
      height: 48px;
      justify-content: center;
      align-items: center;
      position: relative;
    `;

    const userpicPhoto = document.createElement('div');
    userpicPhoto.style.cssText = `
      display: flex;
      width: 48px;
      height: 48px;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      border-radius: 32px;
      border: 0.5px solid rgba(137, 137, 137, 0.30);
      background: #FFF;
      position: absolute;
      left: 0px;
      top: 0px;
    `;

    const userpicImg = document.createElement('div');
    userpicImg.style.cssText = `
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      position: absolute;
      left: 0px;
      top: 0px;
      background: #1BA136;
      border-radius: 50%;
    `;

    // Text content
    const textContent = document.createElement('div');
    textContent.style.cssText = `
      display: flex;
      width: 166px;
      height: 116px;
      padding: 0 16px;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      flex-shrink: 0;
      position: absolute;
      left: 0px;
      top: 0px;
    `;

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      display: flex;
      padding: 10px 0 4px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const titleText = document.createElement('div');
    titleText.style.cssText = `
      flex: 1 0 0;
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 16px;
      color: rgba(20,20,20,1);
    `;
    titleText.textContent = 'Xiaomi';

    // Subtitle
    const subtitleDiv = document.createElement('div');
    subtitleDiv.style.cssText = `
      display: flex;
      padding: 1px 0 13px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const subtitleText = document.createElement('div');
    subtitleText.style.cssText = `
      flex: 1 0 0;
      color: rgba(20, 20, 20, 0.30);
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 11px;
      color: rgba(20,20,20,0.30000001192092896);
    `;
    subtitleText.textContent = 'Реклама';

    userpicPhoto.appendChild(userpicImg);
    userpicContainer.appendChild(userpicPhoto);
    userpic.appendChild(userpicContainer);
    iconPosition.appendChild(userpic);
    titleDiv.appendChild(titleText);
    subtitleDiv.appendChild(subtitleText);
    textContent.appendChild(titleDiv);
    textContent.appendChild(subtitleDiv);
    cardContent.appendChild(iconPosition);
    cardContent.appendChild(textContent);
    card.appendChild(fade);
    card.appendChild(colorBg);
    card.appendChild(cardContent);

    card.addEventListener('click', () => {
      this.props.onItemClick?.('xiaomi-ad');
    });

    return card;
  }

  private createRDCard(): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      display: flex;
      width: 166px;
      height: 244px;
      padding-top: 8px;
      flex-direction: column;
      align-items: flex-start;
      border-radius: 12px;
      background: #FFF;
      position: relative;
      cursor: pointer;
    `;

    // Gallery
    const gallery = document.createElement('div');
    gallery.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      align-self: stretch;
      position: relative;
    `;

    const galleryContainer = document.createElement('div');
    galleryContainer.style.cssText = `
      display: flex;
      padding: 0 8px;
      align-items: flex-start;
      gap: 1px;
      align-self: stretch;
      position: relative;
    `;

    // Photo Item 1
    const photoItem1 = document.createElement('div');
    photoItem1.style.cssText = `
      display: flex;
      height: 100.001px;
      padding-bottom: 0.001px;
      justify-content: center;
      align-items: center;
      flex: 1 0 0;
      border-radius: 8px;
      background: #FFF;
      position: relative;
    `;

    const photo1 = document.createElement('div');
    photo1.style.cssText = `
      width: 101px;
      align-self: stretch;
      border-radius: 8px 0 0 8px;
      border: 0.5px solid rgba(137, 137, 137, 0.30);
      position: absolute;
      left: 0px;
      top: 0px;
      height: 100px;
      background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
    `;

    // Photo Item 2 (with counter)
    const photoItem2 = document.createElement('div');
    photoItem2.style.cssText = `
      width: 48px;
      height: 100px;
      border-radius: 0 8px 8px 0;
      background: #FFF;
      position: relative;
    `;

    const photo2 = document.createElement('div');
    photo2.style.cssText = `
      width: 48px;
      height: 100px;
      flex-shrink: 0;
      border-radius: 0 8px 8px 0;
      border: 0.5px solid rgba(137, 137, 137, 0.30);
      position: absolute;
      left: 0px;
      top: 0px;
      background: linear-gradient(135deg, #1BA136 0%, #4CAF50 100%);
    `;

    const overlay2 = document.createElement('div');
    overlay2.style.cssText = `
      width: 48px;
      height: 100px;
      flex-shrink: 0;
      background: rgba(0, 0, 0, 0.40);
      position: absolute;
      left: 0px;
      top: 0px;
    `;

    const counter = document.createElement('div');
    counter.style.cssText = `
      display: inline-flex;
      padding: 6px 8px 4px 8px;
      align-items: flex-start;
      border-radius: 6px;
      position: absolute;
      left: 1px;
      top: 35px;
      width: 45px;
      height: 30px;
    `;

    const counterText = document.createElement('div');
    counterText.style.cssText = `
      color: #FFF;
      text-align: center;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 16px;
      color: rgba(255,255,255,1);
    `;
    counterText.textContent = '+86';

    // Content
    const content = document.createElement('div');
    content.style.cssText = `
      display: flex;
      padding: 12px 16px;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      flex: 1 0 0;
      align-self: stretch;
      position: relative;
    `;

    // Top section
    const top = document.createElement('div');
    top.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    // Card header
    const cardHeader = document.createElement('div');
    cardHeader.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      display: flex;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const titleText = document.createElement('div');
    titleText.style.cssText = `
      display: flex;
      padding: 2px 0;
      align-items: flex-start;
      position: relative;
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 16px;
      color: rgba(20,20,20,1);
    `;
    titleText.textContent = 'Geraldine';

    // Container position for badges
    const containerPosition = document.createElement('div');
    containerPosition.style.cssText = `
      display: flex;
      width: 24px;
      padding: 5px 0 3px 4px;
      align-items: flex-start;
      gap: 2px;
      align-self: stretch;
      position: relative;
    `;

    const crownBadge = document.createElement('div');
    crownBadge.style.cssText = `
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      position: relative;
      background: #EFA701;
      border-radius: 50%;
    `;

    // Subtitle
    const subtitleDiv = document.createElement('div');
    subtitleDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const subtitleText = document.createElement('div');
    subtitleText.style.cssText = `
      display: flex;
      padding-bottom: 2px;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
      height: 18px;
      flex: 1 0 0;
      overflow: hidden;
      color: #898989;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: rgba(137,137,137,1);
    `;
    subtitleText.textContent = 'Необистро';

    // Secondary line
    const secondaryLine = document.createElement('div');
    secondaryLine.style.cssText = `
      display: flex;
      width: 134px;
      align-items: flex-start;
      gap: 8px;
      position: relative;
    `;

    const secondaryContent = document.createElement('div');
    secondaryContent.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 8px;
      flex: 1 0 0;
      align-self: stretch;
      position: relative;
    `;

    // Rating
    const rating = document.createElement('div');
    rating.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1 0 0;
      position: relative;
    `;

    const stars = document.createElement('div');
    stars.style.cssText = `
      display: flex;
      align-items: flex-start;
      position: relative;
    `;

    const star1 = document.createElement('div');
    star1.style.cssText = `
      width: 16px;
      height: 16px;
      position: relative;
      background: #EFA701;
      border-radius: 2px;
    `;

    const star2 = document.createElement('div');
    star2.style.cssText = `
      width: 8px;
      height: 16px;
      flex-shrink: 0;
      background: #EFA701;
      position: absolute;
      left: 0px;
      top: 0px;
    `;

    const star3 = document.createElement('div');
    star3.style.cssText = `
      width: 8px;
      height: 16px;
      flex-shrink: 0;
      background: #EFA701;
      position: absolute;
      left: 8px;
      top: 0px;
    `;

    const ratingCounter = document.createElement('div');
    ratingCounter.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 6px;
      flex: 1 0 0;
      position: relative;
    `;

    const ratingText = document.createElement('div');
    ratingText.style.cssText = `
      display: flex;
      padding: 2px 0;
      align-items: flex-start;
      position: relative;
      color: #141414;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: rgba(20,20,20,1);
    `;
    ratingText.textContent = '4.6';

    // Ride time
    const rideTime = document.createElement('div');
    rideTime.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
    `;

    const rideTimeText = document.createElement('div');
    rideTimeText.style.cssText = `
      display: flex;
      padding: 2px 0;
      align-items: flex-start;
      position: relative;
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: rgba(137,137,137,1);
    `;
    rideTimeText.textContent = '1.4 км';

    // Bottom section
    const bottom = document.createElement('div');
    bottom.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const bottomText = document.createElement('div');
    bottomText.style.cssText = `
      display: flex;
      padding: 2px 0;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
      flex: 1 0 0;
      color: #898989;
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: rgba(137,137,137,1);
    `;
    bottomText.textContent = 'Тверская 32/12, БЦ Апельсин, 1 этаж';

    // Assemble the RD card
    photoItem1.appendChild(photo1);
    photoItem2.appendChild(photo2);
    photoItem2.appendChild(overlay2);
    counter.appendChild(counterText);
    photoItem2.appendChild(counter);
    galleryContainer.appendChild(photoItem1);
    galleryContainer.appendChild(photoItem2);
    gallery.appendChild(galleryContainer);

    titleDiv.appendChild(titleText);
    containerPosition.appendChild(crownBadge);
    titleDiv.appendChild(containerPosition);
    subtitleDiv.appendChild(subtitleText);
    cardHeader.appendChild(titleDiv);
    cardHeader.appendChild(subtitleDiv);

    stars.appendChild(star1);
    stars.appendChild(star2);
    stars.appendChild(star3);
    rating.appendChild(stars);
    ratingCounter.appendChild(ratingText);
    rating.appendChild(ratingCounter);
    rideTime.appendChild(rideTimeText);
    secondaryContent.appendChild(rating);
    secondaryContent.appendChild(rideTime);
    secondaryLine.appendChild(secondaryContent);

    top.appendChild(cardHeader);
    top.appendChild(secondaryLine);

    bottom.appendChild(bottomText);

    content.appendChild(top);
    content.appendChild(bottom);

    card.appendChild(gallery);
    card.appendChild(content);

    card.addEventListener('click', () => {
      this.props.onItemClick?.('geraldine-rd');
    });

    return card;
  }

  public destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
} 