/**
 * Date formatting utilities for Russian locale
 * Handles date display in checkout and order screens
 */
export class DateFormatter {
  /**
   * Format date for Russian locale (DD.MM.YYYY)
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Format date with day of week for delivery selection
   */
  static formatDeliveryDate(date: Date): string {
    const dayNames = [
      'Воскресенье',
      'Понедельник',
      'Вторник',
      'Среда',
      'Четверг',
      'Пятница',
      'Суббота',
    ];

    const monthNames = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ];

    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];

    return `${dayName}, ${day} ${month}`;
  }

  /**
   * Format time (HH:MM)
   */
  static formatTime(date: Date): string {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format date and time together
   */
  static formatDateTime(date: Date): string {
    return `${this.formatDate(date)} в ${this.formatTime(date)}`;
  }

  /**
   * Format relative date (Today, Tomorrow, etc.)
   */
  static formatRelativeDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Reset time for comparison
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return 'Сегодня';
    }

    if (compareDate.getTime() === tomorrow.getTime()) {
      return 'Завтра';
    }

    // Check if it's within this week
    const daysDiff = Math.floor((compareDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 2 && daysDiff <= 6) {
      const dayNames = [
        'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
      ];
      return dayNames[date.getDay()];
    }

    return this.formatDeliveryDate(date);
  }

  /**
   * Get delivery time options for a given date
   */
  static getDeliveryTimeSlots(date: Date): Array<{ value: string; label: string; available: boolean }> {
    const slots = [
      { start: 9, end: 12, label: '9:00 - 12:00' },
      { start: 12, end: 15, label: '12:00 - 15:00' },
      { start: 15, end: 18, label: '15:00 - 18:00' },
      { start: 18, end: 21, label: '18:00 - 21:00' },
    ];

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    return slots.map(slot => ({
      value: `${slot.start}-${slot.end}`,
      label: slot.label,
      available: !isToday || now.getHours() < slot.start,
    }));
  }

  /**
   * Format duration (for delivery estimates)
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} мин`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ч`;
    }

    return `${hours} ч ${remainingMinutes} мин`;
  }

  /**
   * Format working hours
   */
  static formatWorkingHours(openTime: string, closeTime: string): string {
    return `${openTime} - ${closeTime}`;
  }

  /**
   * Check if organization is open now
   */
  static isOpenNow(workingHours: string): boolean {
    // Simple implementation - in real app would parse working hours properly
    const now = new Date();
    const currentHour = now.getHours();
    
    // Assume most places are open 9-21
    return currentHour >= 9 && currentHour < 21;
  }

  /**
   * Format "last updated" timestamp
   */
  static formatLastUpdated(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Только что';
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} мин назад`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} ч назад`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    }

    return this.formatDate(date);
  }

  /**
   * Get next available delivery dates (excluding Sundays)
   */
  static getAvailableDeliveryDates(count: number = 7): Array<{ date: Date; label: string; available: boolean }> {
    const dates: Array<{ date: Date; label: string; available: boolean }> = [];
    const today = new Date();

    for (let i = 0; i < count + 2; i++) { // Add extra days to account for Sundays
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip Sundays (assuming no delivery on Sundays)
      if (date.getDay() === 0) {
        continue;
      }

      const isToday = i === 0;
      const available = !isToday || today.getHours() < 18; // No same-day delivery after 6 PM

      dates.push({
        date,
        label: this.formatRelativeDate(date),
        available,
      });

      if (dates.length >= count) {
        break;
      }
    }

    return dates;
  }

  /**
   * Parse date from string (DD.MM.YYYY format)
   */
  static parseDate(dateString: string): Date | null {
    const parts = dateString.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    
    // Validate the date
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null;
    }

    return date;
  }
}