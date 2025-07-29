import { BottomsheetContainer, BottomsheetContainerProps, BottomsheetHeader, BottomsheetContent } from '../Bottomsheet';
import { BottomsheetManager, MapSyncService } from '../../services';

export interface BottomsheetViewProps {
  container: HTMLElement;
  bottomsheetManager: BottomsheetManager;
  mapSyncService?: MapSyncService;
}

/**
 * Dashboard bottomsheet wrapper extracted from DashboardScreen.
 */
export class BottomsheetView {
  private props: BottomsheetViewProps;
  private element: HTMLElement;
  private bottomsheet?: BottomsheetContainer;
  private header?: BottomsheetHeader;
  private content?: BottomsheetContent;

  constructor(props: BottomsheetViewProps) {
    this.props = props;
    this.element = props.container;
    this.initialize();
  }

  private initialize(): void {
    const bottomsheetElement = document.createElement('div');
    bottomsheetElement.style.height = '100%';
    this.element.appendChild(bottomsheetElement);

    const config: BottomsheetContainerProps = {
      config: {
        state: this.props.bottomsheetManager.getCurrentState().currentState,
        snapPoints: [0.2, 0.55, 0.9, 0.95],
        isDraggable: true,
        hasScrollableContent: true
      },
      events: {
        onStateChange: (state) => {
          this.props.bottomsheetManager.snapToState(state);
          if (this.props.mapSyncService && this.bottomsheet) {
            const data = this.bottomsheet.getCurrentState();
            this.props.mapSyncService.adjustMapViewport(data.height);
          }
        }
      }
    };

    this.bottomsheet = new BottomsheetContainer(bottomsheetElement, config);

    const headerEl = document.createElement('div');
    this.header = new BottomsheetHeader(headerEl, { showDragger: true });

    const contentEl = document.createElement('div');
    this.content = new BottomsheetContent(contentEl, { scrollable: true });

    bottomsheetElement.appendChild(headerEl);
    bottomsheetElement.appendChild(contentEl);
  }

  public setContent(content: HTMLElement | HTMLElement[]): void {
    if (!this.content) return;
    this.content.setContent(content);
  }

  public destroy(): void {
    this.bottomsheet?.destroy();
    this.header?.destroy();
    this.content?.destroy();
  }
}
