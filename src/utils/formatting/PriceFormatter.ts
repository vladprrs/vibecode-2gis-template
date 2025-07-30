/**
 * Price formatting utilities for Russian ruble pricing
 * Consolidates price formatting logic from CartService and product displays
 */
export class PriceFormatter {
  /**
   * Format price in Russian rubles with proper locale formatting
   */
  static formatPrice(price: number): string {
    return `${price.toLocaleString('ru-RU')} ₽`;
  }

  /**
   * Format price range
   */
  static formatPriceRange(minPrice: number, maxPrice: number): string {
    if (minPrice === maxPrice) {
      return this.formatPrice(minPrice);
    }
    return `${minPrice.toLocaleString('ru-RU')} - ${maxPrice.toLocaleString('ru-RU')} ₽`;
  }

  /**
   * Format subtotal with item count
   */
  static formatSubtotal(price: number, itemCount: number): string {
    const formattedPrice = this.formatPrice(price);
    const itemText = this.formatItemCount(itemCount);
    return `${formattedPrice} • ${itemText}`;
  }

  /**
   * Format item count with proper Russian pluralization
   */
  static formatItemCount(count: number): string {
    if (count === 0) return 'Корзина пуста';
    if (count === 1) return '1 товар';
    if (count >= 2 && count <= 4) return `${count} товара`;
    return `${count} товаров`;
  }

  /**
   * Format discount amount
   */
  static formatDiscount(discount: number): string {
    return `-${this.formatPrice(discount)}`;
  }

  /**
   * Format loyalty points
   */
  static formatLoyaltyPoints(points: number): string {
    return `${points.toLocaleString('ru-RU')} баллов`;
  }

  /**
   * Format delivery price
   */
  static formatDeliveryPrice(price: number): string {
    if (price === 0) return 'Бесплатно';
    return this.formatPrice(price);
  }

  /**
   * Calculate and format line total (price * quantity)
   */
  static formatLineTotal(price: number, quantity: number): string {
    return this.formatPrice(price * quantity);
  }

  /**
   * Format price per unit (for bulk items)
   */
  static formatPricePerUnit(totalPrice: number, unitCount: number, unit: string = 'шт'): string {
    const pricePerUnit = totalPrice / unitCount;
    return `${pricePerUnit.toLocaleString('ru-RU')} ₽/${unit}`;
  }

  /**
   * Format savings amount
   */
  static formatSavings(originalPrice: number, discountedPrice: number): string {
    const savings = originalPrice - discountedPrice;
    if (savings <= 0) return '';
    
    const savingsPercent = Math.round((savings / originalPrice) * 100);
    return `Экономия ${this.formatPrice(savings)} (${savingsPercent}%)`;
  }

  /**
   * Parse price from formatted string
   */
  static parsePrice(formattedPrice: string): number {
    // Remove currency symbol and spaces, parse as number
    const cleanedPrice = formattedPrice.replace(/[₽\s]/g, '').replace(/,/g, '');
    return parseFloat(cleanedPrice) || 0;
  }

  /**
   * Format minimal price display (for cards and compact views)
   */
  static formatCompactPrice(price: number): string {
    if (price >= 1000) {
      const thousands = Math.floor(price / 1000);
      const remainder = price % 1000;
      if (remainder === 0) {
        return `${thousands} тыс. ₽`;
      }
      return `${thousands}.${Math.floor(remainder / 100)} тыс. ₽`;
    }
    return `${price} ₽`;
  }

  /**
   * Validate price value
   */
  static isValidPrice(price: number): boolean {
    return typeof price === 'number' && price >= 0 && isFinite(price);
  }

  /**
   * Format price with original and discounted amounts
   */
  static formatDiscountedPrice(originalPrice: number, discountedPrice: number): {
    current: string;
    original?: string;
    savings?: string;
  } {
    if (!this.isValidPrice(originalPrice) || !this.isValidPrice(discountedPrice)) {
      return { current: 'Цена не указана' };
    }

    if (originalPrice === discountedPrice) {
      return { current: this.formatPrice(discountedPrice) };
    }

    return {
      current: this.formatPrice(discountedPrice),
      original: this.formatPrice(originalPrice),
      savings: this.formatSavings(originalPrice, discountedPrice),
    };
  }
}