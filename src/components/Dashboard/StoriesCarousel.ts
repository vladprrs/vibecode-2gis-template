import { ButtonRowItem } from './ButtonRow';

/**
 * Пропсы для StoriesCarousel
 */
export interface StoriesCarouselProps {
  /** Контейнер для монтирования компонента */
  container: HTMLElement;
  /** Обработчик клика по истории */
  onStoryClick?: (storyId: string) => void;
}

/**
 * Элемент истории
 */
interface StoryItem {
  id: string;
  title: string;
  imageUrl: string;
  isViewed: boolean;
}

/**
 * Компонент карусели историй
 * Использует точную разметку и CSS из Figma экспорта
 */
export class StoriesCarousel {
  private props: StoriesCarouselProps;
  private element: HTMLElement;

  constructor(props: StoriesCarouselProps) {
    this.props = props;
    this.element = props.container;
    this.initialize();
  }

  /**
   * Инициализация компонента
   */
  private initialize(): void {
    this.createStoriesCarousel();
  }

  /**
   * Создание карусели историй с точным соответствием Figma
   */
  private createStoriesCarousel(): void {
    // Stories data based on Figma export
    const stories: StoryItem[] = [
      { 
        id: 'story1', 
        title: 'Заголовок сторис три строки',
        imageUrl: '/figma_export/dashboard/components/stories/assets/images/img-69ff32d9.png',
        isViewed: false
      },
      { 
        id: 'story2', 
        title: 'Заголовок сторис три строки',
        imageUrl: '/figma_export/dashboard/components/stories/assets/images/img-5549a895.png',
        isViewed: false
      },
      { 
        id: 'story3', 
        title: 'Заголовок сторис три строки',
        imageUrl: '/figma_export/dashboard/components/stories/assets/images/img-62839f12.png',
        isViewed: false
      },
      { 
        id: 'story4', 
        title: 'Заголовок сторис три строки',
        imageUrl: '/figma_export/dashboard/components/stories/assets/images/img-0f61e5de.png',
        isViewed: false
      }
    ];

    // Create the main container with exact Figma styles
    const storiesContainer = document.createElement('div');
    storiesContainer.className = 'stories-carousel-container';
    storiesContainer.style.cssText = `
      align-self: stretch;
      position: relative;
    `;

    // Create the horizontal scroll container with exact Figma styles
    const storiesRow = document.createElement('div');
    storiesRow.className = 'stories-row';
    storiesRow.style.cssText = `
      display: flex;
      width: max-content;
      align-items: flex-start;
      gap: 8px;
      position: relative;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 4px;
    `;

    // Create each story item with exact Figma markup and styles
    stories.forEach((story, index) => {
      const storyItem = this.createStoryItem(story, index);
      storiesRow.appendChild(storyItem);
    });

    storiesContainer.appendChild(storiesRow);
    this.element.appendChild(storiesContainer);
  }

  /**
   * Создание элемента истории с точным соответствием Figma
   */
  private createStoryItem(story: StoryItem, index: number): HTMLElement {
    // Create the outer container (Story-Item)
    const storyItem = document.createElement('div');
    storyItem.className = 'story-item';
    storyItem.setAttribute('data-component-name', 'Story-Item');
    storyItem.setAttribute('data-variant-name', 'State=Default, Theme=Light');
    storyItem.style.cssText = `
      display: inline-flex;
      height: 120px;
      padding: 4px;
      flex-direction: column;
      align-items: flex-start;
      flex-shrink: 0;
      border-radius: 16px;
      border: 2px solid var(--color-accent-brand);
      position: relative;
      scroll-snap-align: start;
      cursor: pointer;
      transition: transform 0.2s ease;
      box-sizing: border-box;
    `;

    // Create the inner item container
    const itemContainer = document.createElement('div');
    itemContainer.className = 'story-item-inner';
    itemContainer.style.cssText = `
      display: flex;
      width: 96px;
      height: 112px;
      flex-direction: column;
      align-items: flex-start;
      flex-shrink: 0;
      border-radius: 12px;
      border: 0.5px solid rgba(137, 137, 137, 0.30);
      background: rgba(20, 20, 20, 0.06);
      position: relative;
      overflow: hidden;
    `;

    // Create the cover image container
    const coverContainer = document.createElement('div');
    coverContainer.className = 'story-cover';
    coverContainer.style.cssText = `
      display: flex;
      width: 96px;
      height: 112px;
      padding: 0 6px;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-start;
      flex-shrink: 0;
      position: relative;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    `;

    // Create the image element
    const image = document.createElement('img');
    image.className = 'story-image';
    image.alt = story.title;
    image.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
    `;

    // Handle image loading
    image.onload = () => {
      // Add title overlay when image loads successfully
      const titleOverlay = document.createElement('div');
      titleOverlay.className = 'story-title-overlay';
      titleOverlay.style.cssText = `
        position: absolute;
        bottom: 8px;
        left: 6px;
        right: 6px;
        color: #FFF;
        font-family: 'SB Sans Text', -apple-system, Roboto, Helvetica, sans-serif;
        font-size: 11px;
        font-style: normal;
        font-weight: 600;
        line-height: 14px;
        letter-spacing: -0.176px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        z-index: 2;
      `;
      titleOverlay.textContent = story.title;
      coverContainer.appendChild(titleOverlay);
    };

    image.onerror = () => {
      // Fallback when image fails to load
      image.style.display = 'none';
      const fallbackText = document.createElement('div');
      fallbackText.style.cssText = `
        position: absolute;
        bottom: 8px;
        left: 6px;
        right: 6px;
        color: #FFF;
        font-family: 'SB Sans Text', -apple-system, Roboto, Helvetica, sans-serif;
        font-size: 11px;
        font-weight: 600;
        line-height: 14px;
        text-align: center;
        z-index: 2;
      `;
      fallbackText.textContent = story.title;
      coverContainer.appendChild(fallbackText);
    };

    // Set image source
    image.src = story.imageUrl;

    // Add image to cover container
    coverContainer.appendChild(image);

    // Add cover container to item container
    itemContainer.appendChild(coverContainer);

    // Add item container to story item
    storyItem.appendChild(itemContainer);

    // Add click handler
    storyItem.addEventListener('click', () => {
      this.props.onStoryClick?.(story.id);
    });

    return storyItem;
  }

  /**
   * Публичные методы
   */
  public destroy(): void {
    // Cleanup if needed
  }
} 