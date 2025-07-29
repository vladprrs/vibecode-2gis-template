export interface FilterBarItem {
  text: string;
  hasCounter?: boolean;
}

export interface FilterBarProps {
  container: HTMLElement;
  filters?: FilterBarItem[];
}

/**
 * Simple filter bar component used in search results screen
 */
export class FilterBar {
  private props: FilterBarProps;
  private element: HTMLElement;

  constructor(props: FilterBarProps) {
    this.props = {
      filters: [
        { text: '8', hasCounter: true },
        { text: 'Рядом' },
        { text: 'Открыто' },
        { text: 'Доставка' },
      ],
      ...props,
    };
    this.element = props.container;
    this.render();
  }

  private render(): void {
    const filterBar = document.createElement('div');
    filterBar.className = 'inline-element-1';
    filterBar.style.cssText = `
      display: flex;
      align-items: flex-start;
      align-self: stretch;
      position: relative;
    `;

    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'inline-element-2';
    filtersContainer.style.cssText = `
      display: flex;
      padding: 0 16px;
      align-items: flex-start;
      gap: 8px;
      flex: 1 0 0;
      position: relative;
      overflow-x: auto;
    `;

    this.props.filters!.forEach(filter => {
      const filterButton = document.createElement('div');
      filterButton.style.cssText = `
        display: flex;
        height: 40px;
        padding: 8px 12px;
        justify-content: center;
        align-items: center;
        gap: 4px;
        border-radius: 8px;
        background: rgba(20, 20, 20, 0.06);
        cursor: pointer;
        flex-shrink: 0;
      `;

      if (filter.hasCounter) {
        const counter = document.createElement('div');
        counter.style.cssText = `
          display: flex;
          width: 16px;
          height: 16px;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          background: #1BA136;
        `;

        const counterText = document.createElement('span');
        counterText.textContent = filter.text;
        counterText.style.cssText = `
          color: #FFF;
          font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
          font-weight: 500;
          font-size: 13px;
          line-height: 16px;
          letter-spacing: -0.234px;
        `;

        counter.appendChild(counterText);
        filterButton.appendChild(counter);
      } else {
        const text = document.createElement('span');
        text.textContent = filter.text;
        text.style.cssText = `
          color: #141414;
          font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
          font-weight: 500;
          font-size: 15px;
          line-height: 20px;
          letter-spacing: -0.3px;
        `;
        filterButton.appendChild(text);
      }

      filtersContainer.appendChild(filterButton);
    });

    filterBar.appendChild(filtersContainer);
    this.element.appendChild(filterBar);
  }

  public destroy(): void {
    this.element.innerHTML = '';
  }
}
