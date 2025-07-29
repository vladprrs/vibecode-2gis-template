import { SearchFlowManager } from './SearchFlowManager';
import { SearchContext } from '../types';
import { SearchHeader } from '../components/Header/SearchHeader';
import { SuggestHeader } from '../components/Header/SuggestHeader';
import { ResultsHeader } from '../components/Header/ResultsHeader';

export interface HeaderManagerProps {
  container: HTMLElement;
  searchFlowManager: SearchFlowManager;
  onSearchFocus?: () => void;
}

export class HeaderManager {
  private props: HeaderManagerProps;
  private headerContainer: HTMLElement;

  constructor(props: HeaderManagerProps) {
    this.props = props;
    this.headerContainer = document.createElement('div');
    this.props.container.appendChild(this.headerContainer);
  }

  /** Create default dashboard header */
  createSearchHeader(): void {
    new SearchHeader(this.headerContainer, {
      onSearchClick: () => this.handleSearchFieldClick()
    });
  }

  /** Update header for suggest screen */
  updateHeaderForSuggest(): void {
    new SuggestHeader(this.headerContainer, {
      onClose: () => this.props.searchFlowManager.goToDashboard(),
      onSubmit: (q) => this.props.searchFlowManager.goToSearchResults(q)
    });
    this.props.onSearchFocus?.();
  }

  /** Update header for dashboard */
  updateHeaderForDashboard(): void {
    this.createSearchHeader();
  }

  /** Update header for search results */
  updateHeaderForSearchResult(context: SearchContext): void {
    new ResultsHeader(this.headerContainer, {
      context,
      onClose: () => this.props.searchFlowManager.goToDashboard()
    });
  }

  /** Handle click on search field */
  private handleSearchFieldClick(): void {
    this.props.searchFlowManager.goToSuggest();
    this.props.onSearchFocus?.();
  }
}
