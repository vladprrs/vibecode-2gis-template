# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 8080 with hot reload and network access (0.0.0.0)
- `npm run build` - TypeScript compilation followed by Vite production build
- `npm run preview` - Preview production build on port 4173
- `npm run type-check` - Run TypeScript compiler without emitting files to catch type errors

### Code Quality 
- `npm run lint` - ESLint with auto-fix for .ts and .js files
- `npm run lint:check` - ESLint check without auto-fix
- `npm run format` - Prettier formatting for all supported file types
- `npm run format:check` - Check if files are properly formatted
- `npm run clean` - Remove dist and Vite cache directories

### Environment Setup
- Create `.env` file with `VITE_MAPGL_KEY=your-2gis-api-key` for map functionality
- Development server opens `index.html` which loads the modular TypeScript application
- Demo API key is included but production requires proper 2GIS API key from dev.2gis.com

## Architecture Overview

### Core Service Layer
The application uses a service-oriented architecture where business logic is separated from UI components:

- **SearchFlowManager** (`src/services/SearchFlowManager.ts`) - Handles navigation between screens (Dashboard → Suggest → SearchResult → Organization) and manages search state context
- **BottomsheetManager** (`src/services/BottomsheetManager.ts`) - Controls bottomsheet state transitions with snap points at 20%, 55%, 90%, and 95% heights
- **BottomsheetScrollManager** - Manages scroll behavior differences between fixed-height and scrollable content modes
- **MapSyncService** - Synchronizes 2GIS MapGL viewport with UI state changes

### Screen Architecture
Screens are TypeScript classes that compose components and coordinate with services:

- **DashboardScreen** - Main screen combining 2GIS MapGL with interactive bottomsheet, using factory pattern for instantiation
- **SearchResultScreen, SuggestScreen, OrganizationScreen** - Additional screens managed by SearchFlowManager

### Component System
Components follow a composition pattern rather than inheritance:

- **Bottomsheet/** - Container, Header, Content components with drag gesture support
- **Search/** - SearchBar, SearchFilters, SearchSuggestions with state management
- **Cards/** - OrganizationCard for displaying search results
- All components have `destroy()` methods for proper cleanup

### State Management Pattern
Services use immutable state updates and event emission:

```typescript
// State updates create new objects
this.searchContext = { ...this.searchContext, query: newQuery };

// Event subscription returns unsubscribe function
const unsubscribe = searchFlowManager.onScreenChange((screen) => {...});
```

### TypeScript Configuration
- **Target**: ES2022 with modern features
- **Strict mode** enabled with some flags disabled for migration
- **Path aliases**: `@/` maps to `src/`, `@/components/` to `src/components/`, etc.
- **Bundler module resolution** with Vite

### 2GIS MapGL Integration
- Async initialization with fallback when MapGL API unavailable
- Map component waits for `window.mapgl` global before initializing
- Graceful degradation shows placeholder when map fails to load
- Marker management with temporary markers for user interactions

### Application Entry Point
- `src/main.ts` is the main application entry point using modular TypeScript components
- `index.html` loads the main application with demo controls for testing different states
- Demo controls allow testing different bottomsheet states and map interactions
- Legacy spaghetti code has been moved to `deprecated/` folder

### Build System
- **Vite 5.0** with ES modules and library mode
- **Single entry point**: `main.ts` using modular TypeScript architecture
- **Path aliases** configured in both Vite and TypeScript
- **Terser minification** with console/debugger removal in production
- **Source maps** enabled for debugging

### Import Pattern
Use path aliases consistently:
```typescript
import { DashboardScreen } from '@/components/Screens';
import { SearchFlowManager } from '@/services';
import { BottomsheetState } from '@/types';
```

### Event-Driven Communication
Components communicate through events rather than direct method calls:
- Services emit events when state changes
- Components subscribe to relevant events and react accordingly
- Subscription methods return cleanup functions for proper memory management

### CSS Architecture
- **base.css** - CSS custom properties and global styles
- **dashboard.css** - Main application styling
- **figma-components.css** - Component-specific styles matching Figma designs
- **demo-controls.css** - Development-only control panel styling