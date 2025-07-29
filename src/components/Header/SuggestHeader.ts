export interface SuggestHeaderProps {
  onClose?: () => void;
  onSubmit?: (query: string) => void;
}

export class SuggestHeader {
  private element: HTMLElement;
  private props: SuggestHeaderProps;
  private input?: HTMLInputElement;

  constructor(container: HTMLElement, props: SuggestHeaderProps = {}) {
    this.element = container;
    this.props = props;
    this.create();
  }

  private create(): void {
    this.element.innerHTML = '';
    this.element.className = 'bottomsheet-header';

    const dragger = document.createElement('div');
    dragger.className = 'dragger';
    const draggerHandle = document.createElement('div');
    draggerHandle.className = 'dragger-handle';
    dragger.appendChild(draggerHandle);

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.padding = '0 16px 8px';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Введите запрос...';
    this.input.style.flex = '1';
    this.input.style.marginRight = '8px';
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = this.input!.value.trim();
        if (query) this.props.onSubmit?.(query);
      }
    });

    const close = document.createElement('button');
    close.textContent = '✕';
    close.style.background = 'none';
    close.style.border = 'none';
    close.style.cursor = 'pointer';
    close.addEventListener('click', () => this.props.onClose?.());

    container.appendChild(this.input);
    container.appendChild(close);

    this.element.appendChild(dragger);
    this.element.appendChild(container);

    setTimeout(() => this.input?.focus(), 50);
  }
}
