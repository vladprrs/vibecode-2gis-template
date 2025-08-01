# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server on localhost:8080
npm run build        # Production build with TypeScript compilation  
npm run preview      # Preview production build on localhost:4173
npm run type-check   # TypeScript type checking without build
```

### Code Quality
```bash
npm run lint         # ESLint with auto-fix
npm run lint:check   # ESLint check only (no fixes)
npm run format       # Prettier formatting 
npm run format:check # Prettier check only
npm run clean        # Clean build artifacts
```

### Testing
```bash
npx playwright test  # Run Playwright e2e tests (tests in ./tests/)
npx playwright test --ui  # Run tests with UI
```

## Architecture Overview

This is a TypeScript-based 2GIS map application with modular architecture and a sophisticated bottomsheet system. The app follows a screen-based navigation flow with centralized state management.

### Core Architecture Patterns

1. **Modular Component System**: Each UI component is a self-contained TypeScript class with factory patterns
2. **Service Layer**: Business logic is separated into service classes (managers) that handle specific concerns
3. **Type-Safe Navigation**: Strongly typed screen transitions and state management
4. **Bottomsheet-Driven UI**: The main interaction model uses a draggable bottomsheet over a 2GIS map

### Key Navigation Flow
```
Dashboard → Suggest → SearchResult → Organization → Shop → Cart → Checkout
```

Each screen is managed by `SearchFlowManager` which handles navigation context and history.

### Essential Services

- **SearchFlowManager**: Navigation between screens and search context management
- **BottomsheetManager**: Manages bottomsheet states (small/default/fullscreen/fullscreen_scroll) with smooth animations
- **CartService**: Shopping cart state with event-driven updates
- **MapManager**: 2GIS MapGL integration with marker management
- **ContentManager**: Dynamic content rendering for different screen states

### Bottomsheet System

The app uses a sophisticated bottomsheet with 4 states:
- `SMALL` (20%): Collapsed with search bar only
- `DEFAULT` (50%): Balanced view with content
- `FULLSCREEN` (90%): Content-focused view  
- `FULLSCREEN_SCROLL` (95%): Scrollable content mode

States are managed through promise-based animations and gesture handling.

## Project Structure

### Source Organization
```
src/
├── components/           # UI Components (TypeScript classes)
│   ├── Screens/         # Main application screens
│   ├── Shared/          # Shared components (headers, cards, forms)
│   ├── Bottomsheet/     # Bottomsheet-specific components
│   ├── Search/          # Search-related components
│   └── Dashboard/       # Dashboard-specific components
├── services/            # Business logic services/managers
├── types/               # TypeScript type definitions
├── config/              # Configuration (MapGL setup)
├── styles/              # CSS with custom properties and BEM-like naming
└── utils/               # Utility functions (DOM manipulation, formatting)
```

### Key Files to Understand

- `src/main.ts`: Application entry point and initialization
- `src/services/SearchFlowManager.ts`: Core navigation logic
- `src/services/BottomsheetManager.ts`: Bottomsheet state management
- `src/types/navigation.ts`: Type definitions for navigation and business entities
- `src/types/bottomsheet.ts`: Bottomsheet-specific types and configurations

## Development Guidelines

### TypeScript Configuration
- Strict mode enabled with ES2022 target
- Path aliases configured (`@/`, `@/components/`, `@/services/`, etc.)
- Modern module resolution with bundler mode

### Code Style
- ESLint + Prettier configured with strict rules
- Explicit function return types preferred (`@typescript-eslint/explicit-function-return-type`)
- Sorted imports with specific member syntax order
- No console.log allowed (use console.warn/error only)

### Component Patterns
- Components are TypeScript classes, not React components
- Factory pattern used for component creation (`ComponentFactory.createDefault()`)
- Service injection through constructor parameters
- Event-driven communication between components

### Service Architecture
- Services are singleton-like classes managing specific domains
- Promise-based APIs for asynchronous operations (especially animations)
- Event subscription patterns for state changes
- Immutable state updates where possible

## Testing

- Playwright configured for e2e testing across Chromium, Firefox, and WebKit
- Tests focus on UI consistency and navigation flows
- Test server runs on localhost:8081 (different from dev server port 8080)
- HTML reporter available at `playwright-report/index.html`

## Build & Deployment

- Vite-based build system with Terser minification
- Production builds drop console statements and debugger
- Source maps generated for debugging
- Static assets optimized and versioned
- Configured for deployment to Vercel (vercel.json present)

## Map Integration

The app integrates with 2GIS MapGL:
- API key required via `VITE_MAPGL_KEY` environment variable
- Moscow-centered by default
- Graceful fallback when MapGL unavailable
- Interactive markers and click events supported

## Important Notes

- This is a **pure TypeScript/Vanilla JS** application, not React/Vue/Angular
- The codebase uses Russian comments but English should be preferred for new code
- Components follow a factory pattern rather than JSX or template-based approaches
- State management is handled through services, not external state libraries
- The UI is mobile-first (375px max-width) with touch-friendly interactions