import { ScreenType } from '../../types';
import {
  BottomsheetManager,
  CartService,
  CartState,
  MapSyncService,
  SearchFlowManager,
} from '../../services';
import { CheckoutService, CheckoutState } from '../../services/CheckoutService';
import { BottomActionBar, BottomActionBarContent } from '../Shared';

/**
 * Пропсы для CheckoutScreen
 */
export interface CheckoutScreenProps {
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
  /** Сервис оформления заказа */
  checkoutService: CheckoutService;
  /** CSS класс */
  className?: string;
  /** Состояние скролла предыдущего экрана для восстановления */
  previousScrollPosition?: number;
  /** Обработчики событий */
  onClose?: () => void;
  onProcessPayment?: (checkoutState: CheckoutState) => void;
}

/**
 * Экран оформления заказа с drag-handle и snap points 20/55/90/95%
 * Показывает форму оформления заказа с выбором доставки, даты и оплаты
 */
export class CheckoutScreen {
  private props: CheckoutScreenProps;
  private element: HTMLElement;
  private cartState: CartState;
  private checkoutState: CheckoutState;
  private cartSubscription?: () => void;
  private checkoutSubscription?: () => void;
  private bottomActionBar?: BottomActionBar;

  constructor(props: CheckoutScreenProps) {
    this.props = props;
    this.element = props.container;
    this.cartState = props.cartService.getState();
    this.checkoutState = props.checkoutService.getState();
    this.initialize();
  }

  /**
   * Инициализация экрана оформления заказа
   */
  private initialize(): void {
    this.setupElement();
    this.createCheckoutLayout();
    this.setupEventListeners();
    this.syncWithServices();
    this.subscribeToUpdates();
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
    this.element.classList.add('checkout-screen');
  }

  /**
   * Создание полного макета оформления заказа
   */
  private createCheckoutLayout(): void {
    // Основной контейнер шторки
    const bottomsheetContent = document.createElement('div');
    Object.assign(bottomsheetContent.style, {
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

    // 1. Создаем заголовок
    const header = this.createCheckoutHeader();
    bottomsheetContent.appendChild(header);

    // 2. Создаем прокручиваемое содержимое
    const scrollableContent = document.createElement('div');
    Object.assign(scrollableContent.style, {
      flex: '1',
      overflowY: 'auto',
      backgroundColor: '#ffffff',
      // Remove hardcoded paddingBottom - action bar will be positioned outside scroll area
    });

    // 3. Создаем содержимое оформления заказа
    const contentContainer = this.createContentContainer();
    scrollableContent.appendChild(contentContainer);

    bottomsheetContent.appendChild(scrollableContent);

    // 4. Создаем нижнюю панель действий с новым компонентом
    this.createBottomActionBar(bottomsheetContent);

    this.element.appendChild(bottomsheetContent);
  }

  /**
   * Создание заголовка экрана оформления заказа
   */
  private createCheckoutHeader(): HTMLElement {
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

    // Левая часть с кнопкой закрытия
    const leftSection = document.createElement('div');
    Object.assign(leftSection.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    });

    // Кнопка закрытия (крестик)
    const closeButton = this.createCloseButton();
    leftSection.appendChild(closeButton);

    navBar.appendChild(leftSection);

    // Центральная часть с заголовком
    const centerSection = document.createElement('div');
    Object.assign(centerSection.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
    });

    const title = document.createElement('h1');
    title.className = 'shop-header-title-text';
    Object.assign(title.style, {
      margin: '0',
      fontSize: '17px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.43px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
    });
    title.textContent = 'Оформление заказа';
    centerSection.appendChild(title);

    navBar.appendChild(centerSection);

    header.appendChild(navBar);

    return header;
  }

  /**
   * Создание кнопки закрытия (крестик)
   */
  private createCloseButton(): HTMLElement {
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

    // Иконка крестика
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6L18 18" stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      console.log('🗙 Checkout close button clicked');
      this.props.onClose?.();
      this.props.searchFlowManager.goBack();
    });

    return button;
  }

  /**
   * Создание содержимого экрана оформления заказа
   */
  private createContentContainer(): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      backgroundColor: '#ffffff',
      padding: '0',
    });

    // Способ получения
    const deliverySection = this.createDeliverySection();
    container.appendChild(deliverySection);

    // Дата и время доставки
    const dateTimeSection = this.createDateTimeSection();
    container.appendChild(dateTimeSection);

    // Итог
    const summarySection = this.createSummarySection();
    container.appendChild(summarySection);

    return container;
  }

  /**
   * Создание секции способа получения
   */
  private createDeliverySection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, {
      padding: '24px 16px 0 16px',
    });

    // Заголовок секции
    const sectionTitle = document.createElement('div');
    Object.assign(sectionTitle.style, {
      fontSize: '17px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.43px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
      marginBottom: '16px',
    });
    sectionTitle.textContent = 'Способ получения';
    section.appendChild(sectionTitle);

    // Доставка курьером
    const deliveryRow = this.createListRow(
      '🚀',
      'Доставка курьером',
      this.checkoutState.address,
      'Бесплатно',
      true,
      () => {
        console.log('Delivery method clicked');
        // TODO: Open delivery method selector
      }
    );
    section.appendChild(deliveryRow);

    // Получатель
    const recipientRow = this.createListRow(
      '👤',
      'Получатель',
      `${this.checkoutState.recipientName}, ${this.checkoutState.recipientPhone}`,
      '',
      true,
      () => {
        console.log('Recipient clicked');
        // TODO: Open recipient editor
      }
    );
    section.appendChild(recipientRow);

    return section;
  }

  /**
   * Создание секции даты и времени доставки
   */
  private createDateTimeSection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, {
      padding: '24px 16px 0 16px',
    });

    // Заголовок секции
    const sectionTitle = document.createElement('div');
    Object.assign(sectionTitle.style, {
      fontSize: '17px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.43px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
      marginBottom: '16px',
    });
    sectionTitle.textContent = 'Дата и время доставки';
    section.appendChild(sectionTitle);

    // Контейнер с превью товара и датами
    const contentRow = document.createElement('div');
    Object.assign(contentRow.style, {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
    });

    // Превью товара
    if (this.cartState.items.length > 0) {
      const productPreview = this.createProductPreview();
      contentRow.appendChild(productPreview);
    }

    // Контейнер с датами
    const datesContainer = document.createElement('div');
    Object.assign(datesContainer.style, {
      flex: '1',
    });

    // Горизонтальный список дат
    const dateChips = this.createDateChips();
    datesContainer.appendChild(dateChips);

    // Информационный чип
    const infoChip = this.createInfoChip();
    Object.assign(infoChip.style, {
      marginTop: '8px',
    });
    datesContainer.appendChild(infoChip);

    contentRow.appendChild(datesContainer);
    section.appendChild(contentRow);

    return section;
  }

  /**
   * Создание превью товара
   */
  private createProductPreview(): HTMLElement {
    const preview = document.createElement('div');
    Object.assign(preview.style, {
      position: 'relative',
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      backgroundColor: '#f5f5f5',
      flexShrink: '0',
      overflow: 'hidden',
    });

    const firstItem = this.cartState.items[0];
    if (firstItem?.product.imageUrl) {
      const img = document.createElement('img');
      img.src = firstItem.product.imageUrl;
      img.alt = firstItem.product.title;
      Object.assign(img.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      });
      preview.appendChild(img);
    }

    // Бейдж с количеством товаров
    if (this.cartState.totalItems > 0) {
      const badge = document.createElement('div');
      Object.assign(badge.style, {
        position: 'absolute',
        top: '-6px',
        right: '-6px',
        width: '20px',
        height: '20px',
        borderRadius: '10px',
        backgroundColor: '#8B5CF6',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'SB Sans Text',
      });
      badge.textContent = this.cartState.totalItems.toString();
      preview.appendChild(badge);
    }

    return preview;
  }

  /**
   * Создание чипов с датами
   */
  private createDateChips(): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    });

    const availableDates = this.props.checkoutService.getAvailableDates();

    availableDates.forEach(dateInfo => {
      const chip = document.createElement('button');
      const isSelected = dateInfo.date === this.checkoutState.selectedDate;

      Object.assign(chip.style, {
        padding: '8px 12px',
        borderRadius: '20px',
        border: isSelected ? '1px solid #8B5CF6' : '1px solid rgba(0, 0, 0, 0.1)',
        backgroundColor: isSelected ? 'transparent' : '#ffffff',
        color: isSelected ? '#8B5CF6' : '#141414',
        fontSize: '14px',
        fontWeight: '400',
        fontFamily: 'SB Sans Text',
        cursor: 'pointer',
        flexShrink: '0',
      });

      chip.textContent = dateInfo.label;

      chip.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        this.props.checkoutService.setSelectedDate(dateInfo.date);
      });

      container.appendChild(chip);
    });

    return container;
  }

  /**
   * Создание информационного чипа
   */
  private createInfoChip(): HTMLElement {
    const chip = document.createElement('div');
    Object.assign(chip.style, {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 10px',
      borderRadius: '16px',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      backgroundColor: '#ffffff',
      fontSize: '13px',
      fontWeight: '400',
      color: '#898989',
      fontFamily: 'SB Sans Text',
      cursor: 'pointer',
    });

    chip.innerHTML = `
      По клику ℹ️
    `;

    return chip;
  }

  /**
   * Создание секции итога
   */
  private createSummarySection(): HTMLElement {
    const section = document.createElement('div');
    Object.assign(section.style, {
      padding: '24px 16px 0 16px',
    });

    // Заголовок секции
    const sectionTitle = document.createElement('div');
    Object.assign(sectionTitle.style, {
      fontSize: '17px',
      fontWeight: '600',
      lineHeight: '22px',
      letterSpacing: '-0.43px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
      marginBottom: '16px',
    });
    sectionTitle.textContent = 'Итог';
    section.appendChild(sectionTitle);

    // Поле промокода
    const promoField = this.createPromoCodeField();
    section.appendChild(promoField);

    // СберСпасибо
    const loyaltyRow = this.createLoyaltyRow();
    section.appendChild(loyaltyRow);

    // Строки цен
    const priceLines = this.createPriceLines();
    section.appendChild(priceLines);

    // Дисклеймер
    const disclaimer = this.createDisclaimer();
    section.appendChild(disclaimer);

    return section;
  }

  /**
   * Создание поля промокода
   */
  private createPromoCodeField(): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      marginBottom: '16px',
    });

    const input = document.createElement('input');
    Object.assign(input.style, {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      backgroundColor: '#ffffff',
      fontSize: '15px',
      fontWeight: '400',
      fontFamily: 'SB Sans Text',
      outline: 'none',
      boxSizing: 'border-box',
    });

    input.type = 'text';
    input.placeholder = 'Промокод';
    input.value = this.checkoutState.promoCode;

    input.addEventListener('input', event => {
      const target = event.target as HTMLInputElement;
      this.props.checkoutService.setPromoCode(target.value);
    });

    container.appendChild(input);

    return container;
  }

  /**
   * Создание строки лояльности (СберСпасибо)
   */
  private createLoyaltyRow(): HTMLElement {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      marginBottom: '16px',
    });

    // Левая часть
    const leftSection = document.createElement('div');
    Object.assign(leftSection.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: '1',
    });

    // Иконка
    const icon = document.createElement('div');
    Object.assign(icon.style, {
      width: '24px',
      height: '24px',
      flexShrink: '0',
    });
    icon.innerHTML = '🎁';
    leftSection.appendChild(icon);

    // Текст
    const textContainer = document.createElement('div');

    const title = document.createElement('div');
    Object.assign(title.style, {
      fontSize: '15px',
      fontWeight: '400',
      lineHeight: '20px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
    });
    title.textContent = 'Списать СберСпасибо';
    textContainer.appendChild(title);

    const subtitle = document.createElement('div');
    Object.assign(subtitle.style, {
      fontSize: '13px',
      fontWeight: '400',
      lineHeight: '18px',
      color: '#898989',
      fontFamily: 'SB Sans Text',
    });
    subtitle.textContent = 'Доступно 850 баллов';
    textContainer.appendChild(subtitle);

    leftSection.appendChild(textContainer);
    row.appendChild(leftSection);

    // Переключатель
    const toggle = this.createToggle(this.checkoutState.loyaltyEnabled, enabled => {
      this.props.checkoutService.toggleLoyalty(enabled);
    });
    row.appendChild(toggle);

    return row;
  }

  /**
   * Создание переключателя
   */
  private createToggle(enabled: boolean, onChange: (enabled: boolean) => void): HTMLElement {
    const toggle = document.createElement('div');
    Object.assign(toggle.style, {
      position: 'relative',
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      backgroundColor: enabled ? '#8B5CF6' : 'rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    });

    const handle = document.createElement('div');
    Object.assign(handle.style, {
      position: 'absolute',
      top: '2px',
      left: enabled ? '22px' : '2px',
      width: '20px',
      height: '20px',
      borderRadius: '10px',
      backgroundColor: '#ffffff',
      transition: 'left 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    });

    toggle.appendChild(handle);

    toggle.addEventListener('click', () => {
      onChange(!enabled);
    });

    return toggle;
  }

  /**
   * Создание строк цен
   */
  private createPriceLines(): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      marginBottom: '16px',
    });

    // Строка товаров
    const itemsLine = this.createPriceLine(
      this.props.cartService.getFormattedItemCount(),
      this.props.cartService.getFormattedSubtotal()
    );
    container.appendChild(itemsLine);

    // Строка доставки
    const deliveryLine = this.createPriceLine(
      'Доставка',
      this.props.checkoutService.getFormattedDeliveryPrice()
    );
    container.appendChild(deliveryLine);

    // Скидка по баллам (если включена)
    if (this.checkoutState.loyaltyEnabled) {
      const loyaltyLine = this.createPriceLine(
        'СберСпасибо',
        `-${this.checkoutState.loyaltyDiscount.toLocaleString('ru-RU')} ₽`
      );
      container.appendChild(loyaltyLine);
    }

    // Разделитель
    const divider = document.createElement('div');
    Object.assign(divider.style, {
      height: '1px',
      background:
        'repeating-linear-gradient(to right, #E5E5E5 0, #E5E5E5 4px, transparent 4px, transparent 8px)',
      margin: '12px 0',
    });
    container.appendChild(divider);

    // Итоговая строка
    const totalLine = this.createPriceLine(
      'Итого',
      this.props.checkoutService.getFormattedTotal(),
      true
    );
    container.appendChild(totalLine);

    return container;
  }

  /**
   * Создание строки цены
   */
  private createPriceLine(label: string, value: string, bold: boolean = false): HTMLElement {
    const line = document.createElement('div');
    Object.assign(line.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 0',
    });

    const labelElement = document.createElement('div');
    Object.assign(labelElement.style, {
      fontSize: '15px',
      fontWeight: bold ? '600' : '400',
      lineHeight: '20px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
    });
    labelElement.textContent = label;

    const valueElement = document.createElement('div');
    Object.assign(valueElement.style, {
      fontSize: '15px',
      fontWeight: bold ? '600' : '400',
      lineHeight: '20px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
    });
    valueElement.textContent = value;

    line.appendChild(labelElement);
    line.appendChild(valueElement);

    return line;
  }

  /**
   * Создание дисклеймера
   */
  private createDisclaimer(): HTMLElement {
    const disclaimer = document.createElement('div');
    Object.assign(disclaimer.style, {
      fontSize: '13px',
      fontWeight: '400',
      lineHeight: '18px',
      color: '#898989',
      fontFamily: 'SB Sans Text',
      marginTop: '16px',
    });

    disclaimer.innerHTML = `
      Нажимая на кнопку «К оплате» я соглашаюсь с 
      <span style="color: #8B5CF6; cursor: pointer;">условиями заказа и доставки</span>
    `;

    return disclaimer;
  }

  /**
   * Создание строки списка
   */
  private createListRow(
    icon: string,
    title: string,
    subtitle: string,
    badge: string,
    hasChevron: boolean,
    onClick?: () => void
  ): HTMLElement {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      cursor: onClick ? 'pointer' : 'default',
    });

    if (onClick) {
      row.addEventListener('click', onClick);
    }

    // Иконка
    const iconElement = document.createElement('div');
    Object.assign(iconElement.style, {
      width: '20px',
      height: '20px',
      flexShrink: '0',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });
    iconElement.textContent = icon;
    row.appendChild(iconElement);

    // Текстовый контент
    const textContainer = document.createElement('div');
    Object.assign(textContainer.style, {
      flex: '1',
      minWidth: '0',
    });

    const titleElement = document.createElement('div');
    Object.assign(titleElement.style, {
      fontSize: '15px',
      fontWeight: '400',
      lineHeight: '20px',
      color: '#141414',
      fontFamily: 'SB Sans Text',
    });
    titleElement.textContent = title;
    textContainer.appendChild(titleElement);

    if (subtitle) {
      const subtitleElement = document.createElement('div');
      Object.assign(subtitleElement.style, {
        fontSize: '13px',
        fontWeight: '400',
        lineHeight: '18px',
        color: '#898989',
        fontFamily: 'SB Sans Text',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      });
      subtitleElement.textContent = subtitle;
      textContainer.appendChild(subtitleElement);
    }

    row.appendChild(textContainer);

    // Бейдж (если есть)
    if (badge) {
      const badgeElement = document.createElement('div');
      Object.assign(badgeElement.style, {
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fontSize: '12px',
        fontWeight: '400',
        color: '#22C55E',
        fontFamily: 'SB Sans Text',
        flexShrink: '0',
      });
      badgeElement.textContent = badge;
      row.appendChild(badgeElement);
    }

    // Шеврон (если нужен)
    if (hasChevron) {
      const chevron = document.createElement('div');
      Object.assign(chevron.style, {
        width: '20px',
        height: '20px',
        flexShrink: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });

      chevron.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;

      row.appendChild(chevron);
    }

    return row;
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

    // Show action bar and set content
    this.bottomActionBar.show();

    // Create payment button
    const paymentButton = BottomActionBar.createButton(
      `К оплате — ${this.props.checkoutService.getFormattedTotal()}`,
      () => {
        this.props.onProcessPayment?.(this.checkoutState);
        console.log('💳 Payment clicked:', this.checkoutState);
      },
      'primary'
    );

    // Ensure proper styling for checkout button
    Object.assign(paymentButton.style, {
      width: '100%',
      backgroundColor: '#8B5CF6',
    });

    // Set the content as full-width button
    this.bottomActionBar.setContent({
      fullWidthContent: paymentButton,
    });
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    // Обработчики для элементов оформления заказа будут добавлены при создании компонентов
  }

  /**
   * Синхронизация с сервисами
   */
  private syncWithServices(): void {
    // Обновляем субтотал в сервисе оформления заказа
    this.props.checkoutService.updateSubtotal(this.cartState.totalPrice);

    // Синхронизация с картой (если нужно)
    if (this.props.mapSyncService) {
      // Скрываем маркеры или выполняем другие действия
    }
  }

  /**
   * Подписка на обновления корзины и оформления заказа
   */
  private subscribeToUpdates(): void {
    this.cartSubscription = this.props.cartService.subscribe((newState: CartState) => {
      this.cartState = newState;
      this.props.checkoutService.updateSubtotal(newState.totalPrice);
      this.refreshContent();
    });

    this.checkoutSubscription = this.props.checkoutService.subscribe((newState: CheckoutState) => {
      this.checkoutState = newState;
      this.refreshContent();
    });
  }

  /**
   * Обновление содержимого при изменении состояния
   */
  private refreshContent(): void {
    // Пересоздаем весь макет с новыми данными
    this.createCheckoutLayout();
    // Update action bar content for dynamic state
    this.updateActionBarContent();
  }

  /**
   * Активация экрана
   */
  public activate(): void {
    console.log('💳 CheckoutScreen activated');
  }

  /**
   * Очистка ресурсов при уничтожении экрана
   */
  public destroy(): void {
    // Очищаем компонент действий
    if (this.bottomActionBar) {
      this.bottomActionBar.destroy();
      this.bottomActionBar = undefined;
    }

    // Отписываемся от обновлений
    if (this.cartSubscription) {
      this.cartSubscription();
      this.cartSubscription = undefined;
    }

    if (this.checkoutSubscription) {
      this.checkoutSubscription();
      this.checkoutSubscription = undefined;
    }

    // Очищаем содержимое
    this.element.innerHTML = '';

    console.log('💳 CheckoutScreen destroyed');
  }
}
