import { Product } from '../types';
import { getProductRepository } from '../data/products';

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


}
