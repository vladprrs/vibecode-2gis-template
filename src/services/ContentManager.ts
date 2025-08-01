import { SearchContext, SearchFlowManager } from '../types';
import { CartService } from './CartService';
import { ProductCarousel } from '../components/Content/ProductCarousel';
import { Product } from '../types';
import { getProductRepository } from '../data/products/ProductRepository';

export class ContentManager {
  private searchFlowManager: SearchFlowManager;
  private dashboardContent?: HTMLElement;
  private cartService?: CartService;

  constructor(searchFlowManager: SearchFlowManager, cartService?: CartService) {
    this.searchFlowManager = searchFlowManager;
    this.cartService = cartService;
  }


  updateContentForSearchResult(contentContainer: HTMLElement, context: SearchContext): void {
    if (!contentContainer) return;
    if (!this.dashboardContent) {
      this.dashboardContent = contentContainer.cloneNode(true) as HTMLElement;
    }

    // Clear only the content, preserve any header elements that might exist
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
      {
        id: 'advertiser-3',
        type: 'advertiser',
        title: 'СпортМакс',
        subtitle: 'Современный спортивный комплекс',
        rating: '4.7',
        reviews: '189 оценок',
        distance: '4 мин',
        address: 'ул. Спортивная, 15, Москва',
        adText: 'Скидка 30% на первый месяц!',
        buttonText: 'Записаться на пробное',
        hasCrown: true,
        isAdvertiser: true,
        organization: {
          id: 'advertiser-3',
          name: 'СпортМакс',
          address: 'ул. Спортивная, 15, Москва',
          coordinates: [37.6, 55.75] as [number, number],
          isAdvertiser: true,
          rating: 4.7,
          reviewsCount: 189,
          category: 'Фитнес-клуб',
          description:
            'Современный спортивный комплекс с тренажерным залом, бассейном и групповыми занятиями.',
          phone: '+7 (495) 111-22-33',
          workingHours: 'Пн-Вс: 06:00-23:00',
        },
      },
      {
        id: 'non-advertiser-2',
        type: 'non-advertiser',
        title: 'ФитнесПлюс',
        subtitle: 'Демократичный фитнес-центр',
        rating: '4.3',
        reviews: '67 оценок',
        distance: '8 мин',
        address: 'ул. Фитнесная, 8, Москва',
        parking: 'Платная парковка • Тренажерный зал',
        buttonText: 'Записаться на занятие',
        hasFriends: false,
        isAdvertiser: false,
        organization: {
          id: 'non-advertiser-2',
          name: 'ФитнесПлюс',
          address: 'ул. Фитнесная, 8, Москва',
          coordinates: [37.61, 55.74] as [number, number],
          isAdvertiser: false,
          rating: 4.3,
          reviewsCount: 67,
          category: 'Фитнес-клуб',
          description:
            'Демократичный фитнес-центр с доступными ценами и качественным оборудованием.',
          phone: '+7 (495) 444-55-66',
          workingHours: 'Пн-Вс: 08:00-22:00',
        },
      },
      {
        id: 'advertiser-4',
        type: 'advertiser',
        title: 'Премиум Фитнес',
        subtitle: 'Элитный фитнес-клуб',
        rating: '4.9',
        reviews: '312 оценок',
        distance: '6 мин',
        address: 'Ленинградский проспект, 45, Москва',
        adText: 'Персональный тренер в подарок!',
        buttonText: 'Записаться онлайн',
        hasCrown: true,
        isAdvertiser: true,
        organization: {
          id: 'advertiser-4',
          name: 'Премиум Фитнес',
          address: 'Ленинградский проспект, 45, Москва',
          coordinates: [37.59, 55.76] as [number, number],
          isAdvertiser: true,
          rating: 4.9,
          reviewsCount: 312,
          category: 'Фитнес-клуб',
          description: 'Элитный фитнес-клуб с премиальным оборудованием и индивидуальным подходом.',
          phone: '+7 (495) 777-88-99',
          workingHours: 'Круглосуточно',
        },
      },
    ];

    // Get shared products data
    const sharedProducts: Product[] = this.cartService ? getProductRepository().getSportsClothing() : [
      {
        id: 'tommy-hilfiger-pants-blue-s',
        title: 'Мужские спортивные брюки Tommy Hilfiger, синие, S',
        description: 'Стильные спортивные брюки Tommy Hilfiger',
        price: 7349,
        imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720111201494_1.jpg',
        badges: ['Премиум', 'Быстрая доставка'],
        brand: 'Tommy Hilfiger',
        size: 'S',
        color: 'синие',
      },
      {
        id: 'tommy-hilfiger-pants-black-s',
        title: 'Мужские спортивные брюки Tommy Hilfiger, чёрные, S',
        description: 'Элегантные спортивные брюки Tommy Hilfiger',
        price: 7489,
        imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720111205591_1.jpg',
        badges: ['Премиум', 'Хит продаж'],
        brand: 'Tommy Hilfiger',
        size: 'S',
        color: 'чёрные',
      },
      {
        id: 'nike-pants-french-terry-gray-s',
        title: 'Мужские спортивные брюки Nike French Terry, серые, S',
        description: 'Дышащие спортивные брюки Nike',
        price: 2455,
        imageUrl:
          'https://cm.samokat.ru/processed/l/product_card/7cd57dbc-42aa-4977-859f-37bd02df6309.jpg',
        badges: ['Хит продаж', 'Быстрая доставка'],
        brand: 'Nike',
        size: 'S',
        color: 'серые',
      },
      {
        id: 'nike-pants-repeat-blue-l',
        title: 'Мужские спортивные брюки Nike Repeat, синие, L',
        description: 'Удобные спортивные брюки Nike',
        price: 2438,
        imageUrl: 'https://cm.samokat.ru/processed/l/product_card/195870919801_1.jpg',
        badges: ['Популярные'],
        brand: 'Nike',
        size: 'L',
        color: 'синие',
      },
      {
        id: 'adidas-pants-gm5542-s',
        title: 'Брюки Adidas GM5542, размер S',
        description: 'Спортивные брюки Adidas',
        price: 1632,
        imageUrl: 'https://cm.samokat.ru/processed/l/product_card/4064044668639_1.jpg',
        badges: ['Доступные'],
        brand: 'Adidas',
        size: 'S',
        color: 'чёрные',
      },
    ];

    results.forEach((result, index) => {
      const resultCard = this.createResultCard(result);
      resultsContainer.appendChild(resultCard);

      // Inject carousel after every 4th card or at least once near the top
      if ((index + 1) % 4 === 0 || (index === 1 && results.length > 2)) {
        const carouselContainer = this.createCarouselContainer(sharedProducts);
        resultsContainer.appendChild(carouselContainer);
      }
    });

    container.appendChild(resultsContainer);
  }

  /**
   * Create carousel container with lazy loading
   */
  private createCarouselContainer(products: Product[]): HTMLElement {
    const carouselContainer = document.createElement('div');
    carouselContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      background: #FFF;
      position: relative;
      margin: 8px 0;
    `;

    // Create placeholder for lazy loading
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
      height: 200px;
      width: 100%;
      background: #f5f5f5;
      border-radius: 8px;
      display: flex;
      alignItems: center;
      justifyContent: center;
      color: #898989;
      font-size: 14px;
      font-family: 'SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif';
    `;
    placeholder.textContent = 'Загрузка товаров...';
    carouselContainer.appendChild(placeholder);

    // Lazy load the carousel when it comes into view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Replace placeholder with actual carousel
              carouselContainer.innerHTML = '';
              if (this.cartService) {
                const carousel = new ProductCarousel({
                  container: carouselContainer,
                  cartService: this.cartService,
                  products: products,
                  onProductClick: product => {
                    // Could navigate to shop or product details
                  },
                  onAddToCart: product => {
                    // CartService handles the state update automatically
                  },
                  onCarouselClick: () => {
                    // Открываем магазин через SearchFlowManager
                    this.openShop();
                  },
                });
              }
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Load 50px before entering viewport
          threshold: 0.1,
        }
      );

      observer.observe(carouselContainer);
    } else {
      // Fallback for older browsers - load immediately
      carouselContainer.innerHTML = '';
      if (this.cartService) {
        const carousel = new ProductCarousel({
          container: carouselContainer,
          cartService: this.cartService,
          products: products,
          onProductClick: product => {
            // Product clicked
          },
          onAddToCart: product => {
            // Product added to cart
          },
          onCarouselClick: () => {
            this.openShop();
          },
        });
      }
    }

    return carouselContainer;
  }

  /**
   * Открыть магазин через SearchFlowManager
   */
  private openShop(): void {
    // Создаем демо-данные магазина
    const shopData = {
      organizationId: 'demo-shop',
      name: 'Спортивный магазин',
      categories: [
        {
          id: 'sports-pants',
          name: 'Спортивные брюки',
          count: 8,
          products: this.cartService ? getProductRepository().getSportsClothing() : [],
          icon: '🩳',
        },
      ],
      products: this.cartService ? getProductRepository().getSportsClothing() : [],
      type: 'sports' as const,
      description: 'Магазин спортивной одежды и аксессуаров',
    };

    // Открываем магазин через SearchFlowManager
    this.searchFlowManager.goToShop(shopData);
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
      // Переходим к карточке организации
      if (result.organization) {
        this.searchFlowManager.goToOrganization(result.organization);
      }
    });

    return card;
  }

}
