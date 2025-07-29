# 2GIS Web Clickable Prototype

## 🎯 Overview

Modern **TypeScript/Node.js** implementation of a clickable web prototype of the 2GIS app for:

* 🔬 **UX research** as an interactive prototype
* ⚡ **Rapid UI iteration** without server teams involved  
* 🧪 **Fast hypothesis validation** about screen structure, flows, and content priority

The prototype focuses on realistic layout and UI behavior (gestures, animations, states) while using **mock data**. No production search/routing algorithms are implemented.

---

## 🚀 Quick Start

### Prerequisites

* **Node.js** >= 18.0.0
* **npm** >= 9.0.0

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
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

### Code Quality

```bash
# Run TypeScript type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

---

## 📦 Modern Tech Stack

* **TypeScript 5.3+** — Type-safe development
* **Vite 5.0** — Lightning-fast build tool with HMR
* **ESLint + Prettier** — Code quality and formatting
* **@2gis/mapgl** — Interactive map rendering
* **ES2022 Modules** — Modern JavaScript features
* **CSS Modules** — Scoped styling architecture

### Build System Features

* ⚡ **Hot Module Replacement (HMR)** for instant updates
* 🎯 **Path aliases** (`@/components`, `@/services`, etc.)
* 📦 **Tree shaking** for optimal bundle size
* 🗜️ **Asset optimization** with modern formats
* 🔍 **Source maps** for debugging
* 📊 **Bundle analysis** and performance metrics

---

## 🏗️ Architecture

### Project Structure

```
2gis_template/
├── src/
│   ├── components/          # UI Components
│   │   ├── Screens/         # Main screens (Dashboard, Search, etc.)
│   │   ├── Bottomsheet/     # Bottomsheet components
│   │   ├── Search/          # Search-related components
│   │   └── Cards/           # Card components
│   ├── services/            # Business logic services
│   ├── types/               # TypeScript type definitions
│   ├── config/              # Configuration files
│   ├── styles/              # Global and component styles
│   ├── demo/                # Demo implementations
│   └── main.ts              # Main application entry point
├── test/                    # Demo HTML files
├── figma_export/            # Figma design exports
├── dist/                    # Build output (generated)
└── node_modules/            # Dependencies (generated)
```

### Key Components

1. **DashboardScreen** — Unified main screen with 2GIS MapGL integration
2. **SearchFlowManager** — Navigation state management
3. **BottomsheetManager** — Bottomsheet state and gestures
4. **MapSyncService** — Map and UI synchronization

---

## 🎪 Demo Screens

### 1. **Dashboard Screen** 
* Interactive 2GIS map background
* Bottomsheet with snap states: `small` / `default` / `fullscreen` / `fullscreen-scroll`
* Search bar, stories, buttons grid, and meta items
* Pixel-perfect Figma design implementation

### 2. **Search Flow** (Architecture ready)
* Suggest screen with live suggestions
* Results screen with card ↔ pin synchronization
* Filters and sorting capabilities

### 3. **Organization Card** (Architecture ready)
* Hero gallery with actions
* Tabbed content: Overview / Reviews / Prices / Info
* Responsive layout and animations

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start dev server (localhost:8080)
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # TypeScript validation  
npm run lint         # ESLint checking
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run clean        # Clean build artifacts
```

### Development Features

* 🔥 **Hot reload** for instant feedback
* 🐛 **Enhanced debugging** with source maps
* 📊 **Performance monitoring** built-in
* 🎨 **Modern UI controls** with visual feedback
* 📱 **Responsive design** testing tools

### Environment Configuration

Create `.env` file for custom settings:

```env
# 2GIS MapGL API Key
VITE_MAPGL_KEY=your-api-key-here

# Development settings
NODE_ENV=development
```

---

## 🎨 Design Integration

### Figma Compatibility

* **Pixel-perfect** component reproduction
* **Exact dimensions** from Figma exports
* **Proper typography** and spacing
* **Asset optimization** for web delivery

### Responsive Behavior

* **Mobile-first** approach
* **Touch-friendly** interactions
* **Adaptive layouts** for different screen sizes
* **Performance optimization** for mobile devices

---

## 🔧 Configuration Files

### TypeScript (`tsconfig.json`)
* **Strict type checking** enabled
* **Path mapping** for clean imports
* **ES2022** target with modern features
* **Source maps** for debugging

### Vite (`vite.config.ts`)
* **Development server** on port 8080
* **Path aliases** configuration
* **Asset handling** optimization
* **Build optimization** settings

### ESLint (`.eslintrc.json`)
* **TypeScript-aware** linting
* **Prettier integration**
* **Custom rules** for code quality
* **Auto-fix** capabilities

---

## 📊 Performance

### Bundle Optimization

* **Tree shaking** removes unused code
* **Code splitting** for lazy loading
* **Asset compression** with modern formats
* **Critical CSS** inlining

### Runtime Performance

* **Efficient re-renders** with proper state management
* **Memory leak prevention** with cleanup methods
* **Optimized animations** with hardware acceleration
* **Lazy loading** for non-critical resources

---

## 🧪 Testing & Quality

### Code Quality Tools

```bash
# Type safety
npm run type-check

# Code linting
npm run lint:check

# Code formatting  
npm run format:check
```

### Browser Compatibility

* **Modern browsers** (Chrome 90+, Firefox 88+, Safari 14+)
* **ES2022 features** with polyfills where needed
* **Mobile browsers** optimization
* **Progressive enhancement** approach

---

## 🚀 Deployment

### Production Build

```bash
npm run build
```

Generates optimized static files in `dist/` directory:

* **Minified JavaScript** bundles
* **Optimized CSS** with critical path inlining
* **Compressed assets** (images, fonts)
* **Service worker** ready structure

### Hosting Options

* **Static hosting** (Netlify, Vercel, GitHub Pages)
* **CDN deployment** for global performance
* **Docker containers** for consistent environments
* **CI/CD integration** ready

---

## 📚 Documentation

* **API Documentation** — Generated from TypeScript definitions
* **Component Stories** — Interactive component documentation
* **Architecture Guides** — Detailed system documentation
* **Performance Metrics** — Bundle analysis and optimization guides

---

## 🤝 Contributing

### Development Workflow

1. **Install dependencies:** `npm install`
2. **Start development:** `npm run dev`
3. **Make changes** with hot reload feedback
4. **Run quality checks:** `npm run lint && npm run type-check`
5. **Format code:** `npm run format`
6. **Test build:** `npm run build`

### Code Standards

* **TypeScript strict mode** enforced
* **Consistent formatting** with Prettier
* **Meaningful component names** and clear interfaces
* **Performance-conscious** implementations

---

## 📄 License

MIT License - Built by 2GIS Team for UX research and rapid prototyping.
