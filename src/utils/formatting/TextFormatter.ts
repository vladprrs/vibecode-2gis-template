/**
 * Text formatting utilities
 * Handles text processing and formatting for consistent display
 */
export class TextFormatter {
  /**
   * Truncate text to specified length with ellipsis
   */
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Format organization name for display
   */
  static formatOrganizationName(name: string): string {
    // Remove common prefixes/suffixes and clean up
    return name
      .replace(/^(ООО|ИП|ОАО|ЗАО)\s+/i, '')
      .replace(/\s+(ООО|ИП|ОАО|ЗАО)$/i, '')
      .trim();
  }

  /**
   * Format address for compact display
   */
  static formatCompactAddress(address: string): string {
    // Simplify address for card display
    const parts = address.split(',');
    if (parts.length > 2) {
      // Take the street and building number
      return parts.slice(-2).join(',').trim();
    }
    return address;
  }

  /**
   * Format phone number to Russian format
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Handle Russian phone numbers
    if (digits.length === 11 && digits.startsWith('7')) {
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
    }

    if (digits.length === 10) {
      return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
    }

    return phone; // Return original if can't format
  }

  /**
   * Format rating display
   */
  static formatRating(rating: number, reviewsCount?: number): string {
    const stars = '⭐'.repeat(Math.floor(rating));
    const baseText = `${rating.toFixed(1)}`;

    if (reviewsCount) {
      return `${baseText} (${reviewsCount})`;
    }

    return baseText;
  }

  /**
   * Format distance for display
   */
  static formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} м`;
    }

    const km = distanceInMeters / 1000;
    if (km < 10) {
      return `${km.toFixed(1)} км`;
    }

    return `${Math.round(km)} км`;
  }

  /**
   * Highlight search terms in text
   */
  static highlightSearchTerms(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) {
      return text;
    }

    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');

    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Format category name for consistent display
   */
  static formatCategoryName(category: string): string {
    // Capitalize first letter and normalize
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  }

  /**
   * Format product title for different contexts
   */
  static formatProductTitle(title: string, context: 'card' | 'list' | 'detail'): string {
    switch (context) {
      case 'card':
        return this.truncate(title, 50);
      case 'list':
        return this.truncate(title, 80);
      case 'detail':
        return title;
      default:
        return title;
    }
  }

  /**
   * Format brand name consistently
   */
  static formatBrandName(brand: string): string {
    // Handle special cases for common brands
    const specialCases: Record<string, string> = {
      nike: 'Nike',
      adidas: 'Adidas',
      'tommy hilfiger': 'Tommy Hilfiger',
      'calvin klein': 'Calvin Klein',
    };

    const lowerBrand = brand.toLowerCase();
    return specialCases[lowerBrand] || this.capitalizeWords(brand);
  }

  /**
   * Capitalize each word in a string
   */
  static capitalizeWords(text: string): string {
    return text.replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Format search query for display
   */
  static formatSearchQuery(query: string): string {
    return query.trim().replace(/\s+/g, ' ');
  }

  /**
   * Generate initials from name
   */
  static getInitials(name: string): string {
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Format currency amount with proper spacing
   */
  static formatCurrency(amount: number, currency: string = '₽'): string {
    return `${amount.toLocaleString('ru-RU')} ${currency}`;
  }

  /**
   * Clean HTML from text
   */
  static stripHTML(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Convert text to URL-friendly slug
   */
  static toSlug(text: string): string {
    const cyrillicToLatin: Record<string, string> = {
      а: 'a',
      б: 'b',
      в: 'v',
      г: 'g',
      д: 'd',
      е: 'e',
      ё: 'yo',
      ж: 'zh',
      з: 'z',
      и: 'i',
      й: 'y',
      к: 'k',
      л: 'l',
      м: 'm',
      н: 'n',
      о: 'o',
      п: 'p',
      р: 'r',
      с: 's',
      т: 't',
      у: 'u',
      ф: 'f',
      х: 'h',
      ц: 'ts',
      ч: 'ch',
      ш: 'sh',
      щ: 'sch',
      ъ: '',
      ы: 'y',
      ь: '',
      э: 'e',
      ю: 'yu',
      я: 'ya',
    };

    return text
      .toLowerCase()
      .split('')
      .map(char => cyrillicToLatin[char] || char)
      .join('')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Format working hours status
   */
  static formatWorkingStatus(isOpen: boolean, nextChangeTime?: string): string {
    if (isOpen) {
      return nextChangeTime ? `Открыто до ${nextChangeTime}` : 'Открыто';
    } else {
      return nextChangeTime ? `Закрыто до ${nextChangeTime}` : 'Закрыто';
    }
  }

  /**
   * Format review count with proper Russian pluralization
   */
  static formatReviewCount(count: number): string {
    if (count === 0) return 'Нет отзывов';
    if (count === 1) return '1 отзыв';
    if (count >= 2 && count <= 4) return `${count} отзыва`;
    return `${count} отзывов`;
  }

  /**
   * Format error messages for user display
   */
  static formatErrorMessage(error: string): string {
    // Convert technical errors to user-friendly messages
    const errorMap: Record<string, string> = {
      'Network Error': 'Проблемы с подключением к интернету',
      Timeout: 'Превышено время ожидания',
      'Not Found': 'Запрашиваемая информация не найдена',
      'Server Error': 'Ошибка на сервере, попробуйте позже',
    };

    return errorMap[error] || 'Произошла ошибка, попробуйте еще раз';
  }
}
