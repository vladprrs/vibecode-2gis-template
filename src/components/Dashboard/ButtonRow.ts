/**
 * ButtonRow Component - Horizontal quick-action row
 * Based on Figma export: figma_export/dashboard/components/button_row/
 */

export interface ButtonRowItem {
  id: string;
  text: string;
  iconSrc: string;
  type: 'icon' | 'icon-text';
}

export interface ButtonRowProps {
  container: HTMLElement;
  items: ButtonRowItem[];
  onButtonClick?: (buttonId: string) => void;
}

export class ButtonRow {
  private props: ButtonRowProps;
  private element: HTMLElement;

  constructor(props: ButtonRowProps) {
    this.props = props;
    this.element = props.container;
    this.render();
  }

  private render(): void {
    this.element.className = 'buttons-row';
    this.element.style.cssText = `
      display: flex;
      padding-left: 16px;
      justify-content: flex-end;
      align-items: center;
      position: relative;
      margin-bottom: var(--space-16);
    `;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-row-container';
    buttonsContainer.style.cssText = `
      display: flex;
      width: 704px;
      align-items: center;
      gap: 8px;
      height: 40px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    `;

    // Hide scrollbar
    buttonsContainer.addEventListener('scroll', () => {
      // Ensure smooth scrolling behavior
    });

    this.props.items.forEach(item => {
      const buttonElement = this.createButtonElement(item);
      buttonsContainer.appendChild(buttonElement);
    });

    this.element.appendChild(buttonsContainer);
  }

  private createButtonElement(item: ButtonRowItem): HTMLElement {
    const button = document.createElement('div');
    button.className = 'smart-button';
    button.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
      background: rgba(20, 20, 20, 0.06);
      position: relative;
      cursor: pointer;
      scroll-snap-align: start;
      flex-shrink: 0;
      transition: background-color 0.2s ease;
      min-width: 40px;
      height: 40px;
    `;

    button.addEventListener('click', () => {
      this.props.onButtonClick?.(item.id);
    });

    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(20, 20, 20, 0.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(20, 20, 20, 0.06)';
    });

    const buttonContent = document.createElement('div');
    buttonContent.className = 'button-content';
    buttonContent.style.cssText = `
      display: flex;
      padding: 10px 9px;
      align-items: flex-start;
      gap: 5px;
      position: relative;
    `;

    // Icon container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container';
    iconContainer.style.cssText = `
      display: flex;
      width: 23px;
      height: 20px;
      justify-content: flex-end;
      align-items: center;
      position: relative;
    `;

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'icon-wrapper';
    iconWrapper.style.cssText = `
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      position: relative;
    `;

    // Load icon from assets
    const icon = document.createElement('img');
    // Use the iconSrc directly as it's already a proper path
    icon.src = item.iconSrc;
    icon.alt = item.text;
    icon.style.cssText = `
      width: 22px;
      height: 19px;
      flex-shrink: 0;
      fill: #141414;
      position: absolute;
      left: 1px;
      top: 2px;
    `;

    // Handle image loading errors
    icon.onerror = () => {
      console.warn(`Failed to load icon: ${item.iconSrc}`);
      // Fallback to text representation
      icon.style.display = 'none';
      const fallbackIcon = document.createElement('div');
      fallbackIcon.textContent = item.text.charAt(0);
      fallbackIcon.style.cssText = `
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        color: #666;
      `;
      iconWrapper.appendChild(fallbackIcon);
    };

    iconWrapper.appendChild(icon);
    iconContainer.appendChild(iconWrapper);
    buttonContent.appendChild(iconContainer);

    // Add badges for specific buttons (Home and Work) - INSIDE the button content
    if (item.id === 'home' || item.id === 'work') {
      const badgeContainer = document.createElement('div');
      badgeContainer.className = 'badge-container';
      badgeContainer.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: flex-start;
        gap: 8px;
        position: relative;
      `;

      const badge = document.createElement('div');
      badge.className = 'button-badge';
      badge.style.cssText = `
        font-family: 'SB Sans Text', -apple-system, Roboto, Helvetica, sans-serif;
        font-weight: 400;
        font-size: 15px;
        color: ${item.id === 'home' ? 'rgba(245,55,60,1)' : 'rgba(239,167,1,1)'};
        line-height: 20px;
        letter-spacing: -0.3px;
        position: relative;
      `;
      badge.textContent = '45 мин';
      
      badgeContainer.appendChild(badge);
      buttonContent.appendChild(badgeContainer);
    }

    button.appendChild(buttonContent);
    return button;
  }

  public updateItems(items: ButtonRowItem[]): void {
    this.props.items = items;
    this.element.innerHTML = '';
    this.render();
  }

  public destroy(): void {
    this.element.innerHTML = '';
  }
} 