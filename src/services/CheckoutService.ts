/**
 * Checkout state information
 */
export interface CheckoutState {
  promoCode: string;
  loyaltyEnabled: boolean;
  deliveryMethod: 'courier' | 'pickup';
  recipientName: string;
  recipientPhone: string;
  address: string;
  selectedDate: string;
  subtotal: number;
  deliveryPrice: number;
  loyaltyDiscount: number;
  totalPrice: number;
  lastUpdated: Date;
}

/**
 * Checkout event callbacks
 */
export interface CheckoutEvents {
  onCheckoutUpdated?: (state: CheckoutState) => void;
  onPromoCodeChanged?: (promoCode: string) => void;
  onLoyaltyToggled?: (enabled: boolean) => void;
  onDateSelected?: (date: string) => void;
}

/**
 * Checkout service for managing order checkout state
 * Handles promo codes, loyalty points, delivery options, and total calculations
 */
export class CheckoutService {
  private state: CheckoutState;
  private events: Partial<CheckoutEvents> = {};
  private listeners: Array<(state: CheckoutState) => void> = [];

  constructor(initialSubtotal: number = 0, events: Partial<CheckoutEvents> = {}) {
    this.events = events;
    this.state = this.createInitialState(initialSubtotal);
  }

  /**
   * Get current checkout state
   */
  getState(): CheckoutState {
    return { ...this.state };
  }

  /**
   * Update promo code
   */
  setPromoCode(promoCode: string): void {
    this.state = {
      ...this.state,
      promoCode: promoCode.trim(),
      lastUpdated: new Date(),
    };

    this.events.onPromoCodeChanged?.(promoCode);
    this.notifyStateChange();
  }

  /**
   * Toggle loyalty points usage
   */
  toggleLoyalty(enabled: boolean): void {
    this.state = {
      ...this.state,
      loyaltyEnabled: enabled,
      loyaltyDiscount: enabled ? 85 : 0,
      lastUpdated: new Date(),
    };

    this.recalculateTotal();
    this.events.onLoyaltyToggled?.(enabled);
    this.notifyStateChange();
  }

  /**
   * Set selected delivery date
   */
  setSelectedDate(date: string): void {
    this.state = {
      ...this.state,
      selectedDate: date,
      lastUpdated: new Date(),
    };

    this.events.onDateSelected?.(date);
    this.notifyStateChange();
  }

  /**
   * Update subtotal (when cart changes)
   */
  updateSubtotal(subtotal: number): void {
    this.state = {
      ...this.state,
      subtotal,
      lastUpdated: new Date(),
    };

    this.recalculateTotal();
    this.notifyStateChange();
  }

  /**
   * Set delivery method
   */
  setDeliveryMethod(method: 'courier' | 'pickup'): void {
    this.state = {
      ...this.state,
      deliveryMethod: method,
      deliveryPrice: method === 'courier' ? 0 : 0, // Free delivery for demo
      lastUpdated: new Date(),
    };

    this.recalculateTotal();
    this.notifyStateChange();
  }

  /**
   * Update recipient information
   */
  setRecipientInfo(name: string, phone: string): void {
    this.state = {
      ...this.state,
      recipientName: name,
      recipientPhone: phone,
      lastUpdated: new Date(),
    };

    this.notifyStateChange();
  }

  /**
   * Update delivery address
   */
  setDeliveryAddress(address: string): void {
    this.state = {
      ...this.state,
      address,
      lastUpdated: new Date(),
    };

    this.notifyStateChange();
  }

  /**
   * Get formatted total price
   */
  getFormattedTotal(): string {
    return `${this.state.totalPrice.toLocaleString('ru-RU')} ₽`;
  }

  /**
   * Get formatted subtotal
   */
  getFormattedSubtotal(): string {
    return `${this.state.subtotal.toLocaleString('ru-RU')} ₽`;
  }

  /**
   * Get formatted delivery price
   */
  getFormattedDeliveryPrice(): string {
    return this.state.deliveryPrice === 0
      ? 'Бесплатно'
      : `${this.state.deliveryPrice.toLocaleString('ru-RU')} ₽`;
  }

  /**
   * Get available delivery dates (next 7 days)
   */
  getAvailableDates(): Array<{ date: string; label: string; today?: boolean }> {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateStr = date.toISOString().split('T')[0];
      let label = '';

      if (i === 0) {
        label = 'Сегодня';
      } else if (i === 1) {
        label = 'Завтра';
      } else {
        const options: Intl.DateTimeFormatOptions = {
          day: 'numeric',
          month: 'short',
        };
        label = date.toLocaleDateString('ru-RU', options);
      }

      dates.push({
        date: dateStr,
        label,
        today: i === 0,
      });
    }

    return dates;
  }

  /**
   * Subscribe to checkout state changes
   */
  subscribe(callback: (state: CheckoutState) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Process checkout (placeholder for actual payment processing)
   */
  async processCheckout(): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      // Simulate checkout processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo, always succeed
      const orderId = `ORDER-${Date.now()}`;

      return {
        success: true,
        orderId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка оформления заказа',
      };
    }
  }

  /**
   * Reset checkout state
   */
  reset(): void {
    this.state = this.createInitialState(0);
    this.notifyStateChange();
  }

  /**
   * Create initial checkout state
   */
  private createInitialState(subtotal: number): CheckoutState {
    const availableDates = this.getAvailableDates();

    return {
      promoCode: '',
      loyaltyEnabled: false,
      deliveryMethod: 'courier',
      recipientName: 'Иван Иванов',
      recipientPhone: '+7 (999) 123-45-67',
      address: 'ул. Ленина, 1, кв. 10',
      selectedDate: availableDates[1]?.date || '', // Tomorrow by default
      subtotal,
      deliveryPrice: 0,
      loyaltyDiscount: 0,
      totalPrice: subtotal,
      lastUpdated: new Date(),
    };
  }

  /**
   * Recalculate total price
   */
  private recalculateTotal(): void {
    this.state = {
      ...this.state,
      totalPrice: this.state.subtotal + this.state.deliveryPrice - this.state.loyaltyDiscount,
    };
  }

  /**
   * Notify all listeners about state changes
   */
  private notifyStateChange(): void {
    // Notify event callbacks
    this.events.onCheckoutUpdated?.(this.state);

    // Notify all subscribers
    this.listeners.forEach(callback => callback(this.state));
  }
}
