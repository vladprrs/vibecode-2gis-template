export interface SearchHeaderProps {
  onSearchClick?: () => void;
}

export class SearchHeader {
  private element: HTMLElement;
  private props: SearchHeaderProps;

  constructor(container: HTMLElement, props: SearchHeaderProps = {}) {
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

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-nav-bar';
    searchContainer.innerHTML = `
      <div class="search-nav-content">
        <div class="search-field-container">
          <div class="search-field">
            <div class="search-icon">
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M8.5 15.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM15.5 15.5l-3.87-3.87" stroke="#898989" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="search-placeholder">Поиск в Москве</div>
          </div>
        </div>
      </div>
    `;

    const searchField = searchContainer.querySelector('.search-field') as HTMLElement;
    if (searchField) {
      searchField.style.cursor = 'pointer';
      searchField.addEventListener('click', () => {
        this.props.onSearchClick?.();
      });
    }

    this.element.appendChild(dragger);
    this.element.appendChild(searchContainer);
  }
}
