import { SearchContext } from '../../types';

export interface ResultsHeaderProps {
  context: SearchContext;
  onClose?: () => void;
}

export class ResultsHeader {
  private element: HTMLElement;
  private props: ResultsHeaderProps;

  constructor(container: HTMLElement, props: ResultsHeaderProps) {
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
    container.style.justifyContent = 'space-between';
    container.style.padding = '0 16px 8px';

    const query = document.createElement('span');
    query.textContent = this.props.context.query || '';
    query.style.flex = '1';

    const close = document.createElement('button');
    close.textContent = '✕';
    close.style.background = 'none';
    close.style.border = 'none';
    close.style.cursor = 'pointer';
    close.addEventListener('click', () => this.props.onClose?.());

    container.appendChild(query);
    container.appendChild(close);

    this.element.appendChild(dragger);
    this.element.appendChild(container);
  }
}
