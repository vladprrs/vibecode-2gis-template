# VibeCode 2GIS Template

## 🎯 Overview

Modern **TypeScript** template for creating interactive 2GIS-based map applications with modular architecture. Built for rapid prototyping and UX research with real 2GIS MapGL integration.

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation & Development
```bash
# Clone repository
git clone https://github.com/vladprrs/vibecode-2gis-template.git
cd vibecode-2gis-template

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:8080
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Tech Stack

- **TypeScript 5.3+** — Type-safe development
- **Vite 5.0** — Lightning-fast build tool with HMR
- **@2gis/mapgl** — Real 2GIS map integration
- **ESLint + Prettier** — Code quality and formatting
- **CSS3** — Modern styling with custom properties

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # UI Components
│   ├── Screens/         # Main application screens
│   │   ├── DashboardScreen.ts    # Main dashboard with map
│   │   ├── SearchResultScreen.ts # Search results display
│   │   ├── SuggestScreen.ts     # Search suggestions
│   │   └── OrganizationScreen.ts # Organization details
│   ├── Bottomsheet/     # Bottomsheet components
│   │   ├── BottomsheetContainer.ts
│   │   ├── BottomsheetHeader.ts
│   │   └── BottomsheetContent.ts
│   ├── Search/          # Search-related components
│   │   ├── SearchBar.ts
│   │   ├── SearchFilters.ts
│   │   └── SearchSuggestions.ts
│   ├── Cards/           # Card components
│   │   └── OrganizationCard.ts
│   ├── Dashboard/       # Dashboard-specific components
│   └── Map/            # Map components
├── services/           # Business logic services
│   ├── SearchFlowManager.ts     # Navigation & search flow
│   ├── BottomsheetManager.ts    # Bottomsheet state management
│   ├── BottomsheetScrollManager.ts # Scroll behavior
│   └── MapSyncService.ts        # Map synchronization
├── types/              # TypeScript type definitions
│   ├── bottomsheet.ts  # Bottomsheet types
│   ├── navigation.ts   # Navigation types
│   └── map.ts         # Map types
├── config/            # Configuration files
│   └── mapgl.ts       # 2GIS MapGL configuration
├── styles/            # Global styles
└── main.ts           # Application entry point
```

### Core Components

#### 1. DashboardScreen (`src/components/Screens/DashboardScreen.ts`)
- Main application screen with 2GIS map integration
- Bottomsheet with multiple snap states (small/default/fullscreen/scroll)
- Modular component architecture
- Interactive map with marker support

#### 2. SearchFlowManager (`src/services/SearchFlowManager.ts`)
- Navigation between screens (Dashboard → Suggest → SearchResult → Organization)
- Search context management
- History tracking
- Event handling for search interactions

#### 3. BottomsheetManager (`src/services/BottomsheetManager.ts`)
- Bottomsheet state management
- Smooth transitions between states
- Gesture handling for drag interactions

#### 4. MapSyncService (`src/services/MapSyncService.ts`)
- Synchronization between map and UI components
- Viewport adjustments based on bottomsheet state

## 🎪 Key Features

### Interactive Map
- Real 2GIS MapGL integration
- Interactive markers and click events
- Moscow-centered by default
- Fallback display when MapGL unavailable

### Bottomsheet System
- **Small** (20%) - Collapsed state with search bar
- **Default** (55%) - Normal content display
- **Fullscreen** (90%) - Expanded view
- **Fullscreen Scroll** (95%) - Scrollable content mode

### Search Flow
- **Dashboard** → Main screen with map and content
- **Suggest** → Search suggestions and history
- **Search Results** → Organization listings with filters
- **Organization** → Detailed organization view

### UI Components
- Responsive design (375px max-width)
- Touch-friendly interactions
- Smooth animations and transitions
- Modern CSS with custom properties

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server (localhost:8080)
npm run build        # Production build with TypeScript compilation
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
npm run lint         # ESLint code checking
npm run format       # Prettier code formatting
npm run clean        # Clean build artifacts
```

### Development Features
- **Hot Module Replacement** for instant updates
- **TypeScript strict mode** for type safety
- **Path aliases** for clean imports (`@/components`, `@/services`, etc.)
- **Source maps** for debugging
- **ESLint + Prettier** integration

### Configuration

#### 2GIS MapGL API Key
Create `.env` file in project root:
```env
VITE_MAPGL_KEY=your-2gis-api-key-here
```

Get your API key from [2GIS Developer Portal](https://dev.2gis.com/)

#### TypeScript Configuration
- **Target**: ES2022 with modern features
- **Module**: ESNext with bundler resolution
- **Strict type checking** enabled
- **Path mapping** for clean imports

## 📱 Components Usage

### Creating a Dashboard Screen
```typescript
import { DashboardScreen, DashboardScreenFactory } from '@/components/Screens';
import { SearchFlowManager } from '@/services/SearchFlowManager';
import { BottomsheetManager } from '@/services/BottomsheetManager';

const container = document.getElementById('app')!;
const searchFlowManager = new SearchFlowManager();
const bottomsheetManager = new BottomsheetManager();

const dashboardScreen = DashboardScreenFactory.createDefault(
  container,
  searchFlowManager,
  bottomsheetManager,
  'your-mapgl-api-key'
);
```

### Using Search Flow Manager
```typescript
import { SearchFlowManager, ScreenType } from '@/services';

const searchManager = new SearchFlowManager(ScreenType.DASHBOARD, {
  onScreenChange: (from, to, context) => {
    console.log(`Navigation: ${from} → ${to}`);
  },
  onSearchInitiated: (query, source) => {
    console.log(`Search: "${query}" from ${source}`);
  }
});

// Navigate to search suggestions
searchManager.goToSuggest();

// Perform search
searchManager.goToSearchResults('кафе', { category: 'food' });
```

### Managing Bottomsheet States
```typescript
import { BottomsheetManager, BottomsheetState } from '@/services';

const bottomsheetManager = new BottomsheetManager();

// Snap to different states
bottomsheetManager.snapToState(BottomsheetState.FULLSCREEN);

// Listen to state changes
bottomsheetManager.onStateChange((newState) => {
  console.log(`Bottomsheet state: ${newState}`);
});
```

## 🎨 Styling

### CSS Architecture
- **CSS Custom Properties** for theming
- **BEM-like** class naming convention
- **Responsive design** with mobile-first approach
- **Smooth animations** with hardware acceleration

### Key Style Files
- `src/styles/base.css` - Base styles and CSS variables
- `src/styles/dashboard.css` - Dashboard-specific styles
- `src/styles/demo-controls.css` - Development controls

## 🧪 Testing & Quality

### Code Quality
```bash
# Run all quality checks
npm run type-check && npm run lint && npm run build
```

### Browser Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- ES2022 features with bundler polyfills
- Mobile browsers optimization

## 🚀 Deployment

### Static Build
```bash
npm run build
```

Generates optimized files in `dist/` directory:
- Minified TypeScript/JavaScript bundles
- Optimized CSS with vendor prefixes
- Asset optimization and compression

### Hosting Options
- **Netlify/Vercel** - Static hosting with CDN
- **GitHub Pages** - Free hosting for open source
- **Docker** - Containerized deployment
- **Any static web server**

## 📚 API Reference

### Main Classes

#### `DashboardScreen`
Main application screen with map and bottomsheet.

**Methods:**
- `activate()` - Show screen
- `deactivate()` - Hide screen  
- `snapToState(state)` - Change bottomsheet state
- `centerMoscow()` - Center map on Moscow
- `destroy()` - Clean up resources

#### `SearchFlowManager`
Navigation and search state management.

**Methods:**
- `goToSuggest()` - Navigate to suggestions
- `goToSearchResults(query, filters?)` - Navigate to results
- `goToOrganization(organization)` - Navigate to org details
- `goBack()` - Navigate back
- `updateQuery(query)` - Update search query

#### `BottomsheetManager`
Bottomsheet state and gesture management.

**Methods:**
- `snapToState(state)` - Change bottomsheet state
- `getCurrentState()` - Get current state info
- `onStateChange(callback)` - Listen to state changes

### Type Definitions

#### `ScreenType`
```typescript
enum ScreenType {
  DASHBOARD = 'dashboard',
  SUGGEST = 'suggest',
  SEARCH_RESULT = 'search_result',
  ORGANIZATION = 'organization'
}
```

#### `BottomsheetState`
```typescript
enum BottomsheetState {
  SMALL = 'small',
  DEFAULT = 'default', 
  FULLSCREEN = 'fullscreen',
  FULLSCREEN_SCROLL = 'fullscreen_scroll'
}
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with proper TypeScript types
4. Run quality checks: `npm run type-check && npm run lint`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open Pull Request

### Code Standards
- **TypeScript strict mode** required
- **ESLint + Prettier** configuration must pass
- **Component interfaces** for all public APIs
- **JSDoc comments** for public methods
- **Performance-conscious** implementations

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- **GitHub Repository**: https://github.com/vladprrs/vibecode-2gis-template
- **2GIS MapGL Documentation**: https://docs.2gis.com/en/mapgl/
- **2GIS Developer Portal**: https://dev.2gis.com/

---

Built with ❤️ by VibeCode Team for rapid 2GIS application development.