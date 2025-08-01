/**
 * Content for bottom action bar
 */
export interface BottomActionBarContent {
  /** Left content */
  left?: HTMLElement;
  /** Center content (usually button) */
  center?: HTMLElement;
  /** Right content */
  right?: HTMLElement;
}

/**
 * Props for BottomActionBar component
 */
export interface BottomActionBarProps {
  /** Container element */
  container: HTMLElement;
  /** Initial content */
  content?: BottomActionBarContent;
  /** CSS class name */
  className?: string;
  /** Whether to show the bar */
  visible?: boolean;
}

/**
 * Global bottom action bar component
 * Provides a fixed bottom bar for actions across different screens
 */
export class BottomActionBar {
  private element: HTMLElement;
  private props: BottomActionBarProps;
  private leftContainer: HTMLElement;
  private centerContainer: HTMLElement;
  private rightContainer: HTMLElement;

  constructor(props: BottomActionBarProps) {
    this.props = props;
    this.element = document.createElement('div');
    this.leftContainer = document.createElement('div');
    this.centerContainer = document.createElement('div');
    this.rightContainer = document.createElement('div');

    this.initialize();
  }

  private initialize(): void {
    this.setupElement();
    this.createContent();
    this.props.container.appendChild(this.element);
  }

  private setupElement(): void {
    this.element.className = `bottom-action-bar ${this.props.className || ''}`;

    Object.assign(this.element.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      height: '80px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid rgba(0, 0, 0, 0.08)',
      display: this.props.visible !== false ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      zIndex: '1000',
      boxSizing: 'border-box',
    });
  }

  private createContent(): void {
    // Left container
    this.leftContainer.className = 'left-content';
    Object.assign(this.leftContainer.style, {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    });

    // Center container
    this.centerContainer.className = 'center-content';
    Object.assign(this.centerContainer.style, {
      flex: '2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });

    // Right container
    this.rightContainer.className = 'right-content';
    Object.assign(this.rightContainer.style, {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    });

    this.element.appendChild(this.leftContainer);
    this.element.appendChild(this.centerContainer);
    this.element.appendChild(this.rightContainer);

    // Set initial content if provided
    if (this.props.content) {
      this.updateContent(this.props.content);
    }
  }

  /**
   * Update bar content
   */
  public updateContent(content: BottomActionBarContent): void {
    // Clear existing content
    this.leftContainer.innerHTML = '';
    this.centerContainer.innerHTML = '';
    this.rightContainer.innerHTML = '';

    // Add new content
    if (content.left) {
      this.leftContainer.appendChild(content.left);
    }

    if (content.center) {
      this.centerContainer.appendChild(content.center);
    }

    if (content.right) {
      this.rightContainer.appendChild(content.right);
    }
  }

  /**
   * Show the action bar
   */
  public show(): void {
    this.element.style.display = 'flex';
    this.props.visible = true;
  }

  /**
   * Hide the action bar
   */
  public hide(): void {
    this.element.style.display = 'none';
    this.props.visible = false;
  }

  /**
   * Toggle visibility
   */
  public toggle(): void {
    if (this.props.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if bar is visible
   */
  public isVisible(): boolean {
    return this.props.visible !== false;
  }

  /**
   * Get the root element
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Update bar properties
   */
  public updateProps(newProps: Partial<BottomActionBarProps>): void {
    this.props = { ...this.props, ...newProps };

    if (newProps.className) {
      this.element.className = `bottom-action-bar ${newProps.className}`;
    }

    if (newProps.visible !== undefined) {
      if (newProps.visible) {
        this.show();
      } else {
        this.hide();
      }
    }

    if (newProps.content) {
      this.updateContent(newProps.content);
    }
  }

  /**
   * Destroy the component
   */
  public destroy(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
