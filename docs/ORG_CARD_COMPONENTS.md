# Organization Card Components

## 📋 Overview

This document describes the organization card components and their usage in the 2GIS template application.

## 🏗️ Component Architecture

### OrganizationCard

Main component for displaying organization information in search results and details.

#### Location
`src/components/Cards/OrganizationCard.ts`

#### Props Interface
```typescript
interface OrganizationCardProps {
  showRating?: boolean;
  showDistance?: boolean;
  showAddress?: boolean;
  onClick?: (organization: Organization) => void;
  onCallClick?: (phone: string) => void;
  onRouteClick?: (coordinates: [number, number]) => void;
}
```

#### Methods
```typescript
class OrganizationCard {
  updateOrganization(organization: Organization): void
  highlight(): void
  removeHighlight(): void
  destroy(): void
}
```

#### Usage Example
```typescript
import { OrganizationCard } from '@/components/Cards';

const organization = {
  id: '1',
  name: 'Coffee Shop',
  address: 'Moscow, Tverskaya st. 1',
  coordinates: [37.620393, 55.75396],
  isAdvertiser: true,
  rating: 4.5,
  reviewsCount: 128,
  category: 'Cafe',
  phone: '+7 (495) 123-45-67'
};

const card = new OrganizationCard(container, organization, {
  showRating: true,
  showDistance: true,
  onClick: (org) => {
    searchFlowManager.goToOrganization(org);
  },
  onCallClick: (phone) => {
    window.open(`tel:${phone}`);
  }
});
```

### OrganizationScreen

Screen component for displaying detailed organization information.

#### Location
`src/components/Screens/OrganizationScreen.ts`

#### Features
- Organization details display
- Contact information
- Working hours
- Photos and gallery
- Reviews and ratings
- Map integration
- Action buttons (call, route, website)

#### Content Structure
```typescript
interface OrganizationContent {
  mainCard: HTMLElement;      // Organization header with basic info
  tabs: HTMLElement;          // Tab navigation (Info, Photos, Reviews)
  contacts: HTMLElement;      // Contact information
  actions: HTMLElement;       // Action buttons
  map: HTMLElement;          // Embedded map
}
```

### TabBar

Navigation component for organization details tabs.

#### Location
`src/components/Organization/TabBar.ts`

#### Tab Types
```typescript
enum OrganizationTab {
  INFO = 'info',
  PHOTOS = 'photos',
  REVIEWS = 'reviews',
  CONTACTS = 'contacts'
}
```

#### Usage
```typescript
import { TabBar } from '@/components/Organization';

const tabBar = new TabBar(container, {
  activeTab: OrganizationTab.INFO,
  onTabChange: (tab) => {
    updateContent(tab);
  }
});
```

## 🎨 Styling

### CSS Classes
- `.organization-card` - Main card container
- `.organization-card--advertiser` - Advertiser styling
- `.organization-card__header` - Card header
- `.organization-card__title` - Organization name
- `.organization-card__rating` - Rating display
- `.organization-card__address` - Address information
- `.organization-card__actions` - Action buttons

### Responsive Design
- Mobile-first approach (375px max-width)
- Touch-friendly interactions
- Proper spacing for mobile devices
- Optimized for thumb navigation

## 🔄 State Management

### Organization Data Flow
```
Search Results → Organization Card → Organization Screen → Tab Content
```

### Event Handling
```typescript
// Card click events
organizationCard.onClick = (organization) => {
  searchFlowManager.goToOrganization(organization);
};

// Contact action events
organizationCard.onCallClick = (phone) => {
  window.open(`tel:${phone}`);
};

organizationCard.onRouteClick = (coordinates) => {
  mapManager.centerOn(coordinates);
  mapManager.addRoute(coordinates);
};
```

## 📱 Mobile Optimization

### Touch Interactions
- Large touch targets (44px minimum)
- Swipe gestures for tab navigation
- Pull-to-refresh for content updates
- Long press for additional actions

### Performance
- Lazy loading of images
- Virtual scrolling for large lists
- Debounced search interactions
- Optimized animations

## 🧪 Testing

### Component Testing
```typescript
describe('OrganizationCard', () => {
  let container: HTMLElement;
  let organization: Organization;

  beforeEach(() => {
    container = document.createElement('div');
    organization = createMockOrganization();
  });

  it('should render organization information', () => {
    const card = new OrganizationCard(container, organization);
    
    expect(container.querySelector('.organization-card__title'))
      .toHaveTextContent(organization.name);
  });

  it('should handle click events', () => {
    const onClick = jest.fn();
    const card = new OrganizationCard(container, organization, { onClick });
    
    container.querySelector('.organization-card')?.click();
    
    expect(onClick).toHaveBeenCalledWith(organization);
  });
});
```

## 🔧 Configuration

### Default Settings
```typescript
const DEFAULT_ORGANIZATION_CARD_CONFIG = {
  showRating: true,
  showDistance: true,
  showAddress: true,
  maxTitleLength: 50,
  ratingPrecision: 1,
  distanceUnit: 'km'
};
```

### Customization
```typescript
// Custom card styling
const customCard = new OrganizationCard(container, organization, {
  showRating: false,
  showDistance: false,
  customStyles: {
    backgroundColor: '#f5f5f5',
    borderRadius: '12px'
  }
});
```

## 📊 Analytics Integration

### Event Tracking
```typescript
// Track card interactions
organizationCard.onClick = (organization) => {
  analytics.track('organization_card_click', {
    organizationId: organization.id,
    organizationName: organization.name,
    category: organization.category,
    position: cardPosition
  });
  
  searchFlowManager.goToOrganization(organization);
};
```

### Metrics
- Card view impressions
- Click-through rates
- Time spent on organization details
- Contact action usage (call, route, website)

## 🔄 Future Enhancements

### Planned Features
- **Rich Media Support** - Video content and 360° photos
- **Social Integration** - Share buttons and social proof
- **Personalization** - User preferences and history
- **Offline Support** - Cached organization data
- **Accessibility** - Screen reader support and keyboard navigation

### Technical Improvements
- **Virtual Scrolling** - For large organization lists
- **Image Optimization** - WebP format and lazy loading
- **Caching Strategy** - Intelligent data caching
- **Performance Monitoring** - Real-time performance metrics

---

This component system provides a flexible and extensible foundation for displaying organization information in 2GIS applications.
