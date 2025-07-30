import { Product } from '../types';

/**
 * Cart item with quantity information
 */
export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

/**
 * Cart state information
 */
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: Date;
}

/**
 * Cart event callbacks
 */
export interface CartEvents {
  onCartUpdated?: (state: CartState) => void;
  onItemAdded?: (item: CartItem) => void;
  onItemRemoved?: (productId: string) => void;
  onQuantityChanged?: (productId: string, newQuantity: number) => void;
}

/**
 * Centralized cart state management service
 * Handles adding, removing, and updating product quantities
 */
export class CartService {
  private items: Map<string, CartItem> = new Map();
  private events: Partial<CartEvents> = {};
  private listeners: Array<(state: CartState) => void> = [];

  constructor(events: Partial<CartEvents> = {}) {
    this.events = events;
  }

  /**
   * Get current cart state
   */
  getState(): CartState {
    const items = Array.from(this.items.values());
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return {
      items,
      totalItems,
      totalPrice,
      lastUpdated: new Date(),
    };
  }

  /**
   * Add product to cart or increase quantity if already exists
   */
  addToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.items.get(product.id);

    if (existingItem) {
      // Increase quantity of existing item
      existingItem.quantity += quantity;
      existingItem.addedAt = new Date();
    } else {
      // Add new item
      const newItem: CartItem = {
        product,
        quantity,
        addedAt: new Date(),
      };
      this.items.set(product.id, newItem);
      this.events.onItemAdded?.(newItem);
    }

    this.notifyStateChange();
  }

  /**
   * Remove product from cart completely
   */
  removeFromCart(productId: string): void {
    const wasRemoved = this.items.delete(productId);

    if (wasRemoved) {
      this.events.onItemRemoved?.(productId);
      this.notifyStateChange();
    }
  }

  /**
   * Update quantity of specific product
   */
  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const item = this.items.get(productId);
    if (item) {
      item.quantity = newQuantity;
      item.addedAt = new Date();
      this.events.onQuantityChanged?.(productId, newQuantity);
      this.notifyStateChange();
    }
  }

  /**
   * Get quantity of specific product in cart
   */
  getProductQuantity(productId: string): number {
    return this.items.get(productId)?.quantity || 0;
  }

  /**
   * Check if product is in cart
   */
  isInCart(productId: string): boolean {
    return this.items.has(productId);
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.items.clear();
    this.notifyStateChange();
  }

  /**
   * Get cart item by product ID
   */
  getCartItem(productId: string): CartItem | undefined {
    return this.items.get(productId);
  }

  /**
   * Subscribe to cart state changes
   */
  subscribe(callback: (state: CartState) => void): () => void {
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
   * Get formatted subtotal string
   */
  getFormattedSubtotal(): string {
    const state = this.getState();
    return `${state.totalPrice.toLocaleString('ru-RU')} ₽`;
  }

  /**
   * Get formatted item count string
   */
  getFormattedItemCount(): string {
    const state = this.getState();
    const count = state.totalItems;

    if (count === 0) return '';
    if (count === 1) return '1 товар';
    if (count < 5) return `${count} товара`;
    return `${count} товаров`;
  }

  /**
   * Notify all listeners about state changes
   */
  private notifyStateChange(): void {
    const state = this.getState();

    // Notify event callbacks
    this.events.onCartUpdated?.(state);

    // Notify all subscribers
    this.listeners.forEach(callback => callback(state));
  }

  /**
   * Get line total for specific product
   */
  getLineTotal(productId: string): number {
    const item = this.items.get(productId);
    return item ? item.product.price * item.quantity : 0;
  }

  /**
   * Get formatted line total string
   */
  getFormattedLineTotal(productId: string): string {
    const total = this.getLineTotal(productId);
    return `${total.toLocaleString('ru-RU')} ₽`;
  }

  /**
   * Export cart data for persistence
   */
  exportData(): any {
    return {
      items: Array.from(this.items.entries()),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Import cart data from persistence
   */
  importData(data: any): void {
    if (data?.items && Array.isArray(data.items)) {
      this.items.clear();

      data.items.forEach(([productId, item]: [string, CartItem]) => {
        // Reconstruct Date objects
        item.addedAt = new Date(item.addedAt);
        this.items.set(productId, item);
      });

      this.notifyStateChange();
    }
  }

  /**
   * Get sample sports products for demo
   */
  getSampleProducts(): Product[] {
    return [
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
        id: 'tommy-hilfiger-pants-green-xl',
        title: 'Брюки Tommy Hilfiger спортивные, зелёные, XL',
        description: 'Комфортные спортивные брюки Tommy Hilfiger',
        price: 10529,
        imageUrl: 'https://cm.samokat.ru/processed/l/product_card/8720646433131_1.jpg',
        badges: ['Премиум', 'Новинка'],
        brand: 'Tommy Hilfiger',
        size: 'XL',
        color: 'зелёные',
      },
      {
        id: 'nike-pants-french-terry-gray-s',
        title: 'Мужские спортивные брюки Nike French Terry, серые, S',
        description: 'Дышащие спортивные брюки Nike',
        price: 2455,
        imageUrl: 'https://cm.samokat.ru/processed/l/product_card/7cd57dbc-42aa-4977-859f-37bd02df6309.jpg',
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
        id: 'nike-pants-yoga-drifit-gray-l',
        title: 'Мужские спортивные брюки Nike Yoga Dri‑Fit, серые, L',
        description: 'Технологичные спортивные брюки Nike',
        price: 2629,
        imageUrl: 'https://cm.samokat.ru/processed/l/product_card/0194501845649_1.jpg',
        badges: ['Технология Dri-Fit'],
        brand: 'Nike',
        size: 'L',
        color: 'серые',
      },
      {
        id: 'nike-pants-repeat-white-l',
        title: 'Мужские спортивные брюки Nike Repeat, белые, L',
        description: 'Классические спортивные брюки Nike',
        price: 2438,
        imageUrl: 'https://cm.samokat.ru/processed/l/product_card/195870919740_1.jpg',
        badges: ['Классика'],
        brand: 'Nike',
        size: 'L',
        color: 'белые',
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
  }
}
