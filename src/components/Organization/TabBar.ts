export interface TabItem {
  label: string;
  count?: number;
}

export interface TabBarProps {
  container: HTMLElement;
  items: TabItem[];
  activeIndex?: number;
  onTabSelect?: (index: number) => void;
}

export class TabBar {
  private props: Required<Omit<TabBarProps, 'activeIndex'>> & { activeIndex: number };
  private element: HTMLElement;

  constructor(props: TabBarProps) {
    this.props = { activeIndex: 0, ...props } as Required<Omit<TabBarProps, 'activeIndex'>> & { activeIndex: number };
    this.element = props.container;
    this.render();
  }

  private render(): void {
    this.element.className = 'tab-bar';
    this.element.style.cssText = `
      position: relative;
      background: #FFF;
      border-bottom: 1px solid rgba(137, 137, 137, 0.15);
    `;

    const fadeMask = document.createElement('div');
    fadeMask.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      background: linear-gradient(90deg, rgba(255,255,255,0.8) 0px, transparent 16px, transparent calc(100% - 16px), rgba(255,255,255,0.8) 100%);
    `;

    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tab-bar-container';
    tabsContainer.style.cssText = `
      display: flex;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    `;

    const style = document.createElement('style');
    style.textContent = '.tab-bar-container::-webkit-scrollbar{display:none;}';
    document.head.appendChild(style);

    this.props.items.forEach((item, idx) => {
      const tab = this.createTab(item, idx === this.props.activeIndex, idx);
      tabsContainer.appendChild(tab);
    });

    this.element.appendChild(fadeMask);
    this.element.appendChild(tabsContainer);
  }

  private createTab(item: TabItem, active: boolean, index: number): HTMLElement {
    const tab = document.createElement('div');
    tab.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 9px 12px;
      cursor: pointer;
      border-bottom: ${active ? '2px solid #1976D2' : '2px solid transparent'};
      white-space: nowrap;
      transition: border-color 0.2s ease;
    `;

    tab.addEventListener('click', () => {
      this.props.onTabSelect?.(index);
    });

    const label = document.createElement('span');
    label.textContent = item.label;
    label.style.cssText = `
      color: ${active ? '#1976D2' : '#898989'};
      font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 18px;
      letter-spacing: -0.28px;
    `;
    tab.appendChild(label);

    if (item.count !== undefined) {
      const counter = document.createElement('div');
      counter.style.cssText = `
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1px 5px 2px 5px;
        min-width: 19px;
        height: 18px;
        border-radius: 12px;
        background: rgba(20, 20, 20, 0.30);
      `;

      const counterText = document.createElement('span');
      counterText.textContent = item.count.toString();
      counterText.style.cssText = `
        color: #FFF;
        font-family: SB Sans Text, -apple-system, Roboto, Helvetica, sans-serif;
        font-size: 13px;
        font-weight: 400;
        line-height: 16px;
        letter-spacing: -0.234px;
      `;

      counter.appendChild(counterText);
      tab.appendChild(counter);
    }

    return tab;
  }
}
