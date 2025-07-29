# 🚀 Setup Guide - 2GIS Web Prototype

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download here](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **Git** (for cloning the repository)

### Checking Prerequisites

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version  
npm --version
# Should output: 9.x.x or higher

# Check Git version
git --version
# Should output: git version 2.x.x
```

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/2gis/2gis_template.git
cd 2gis_template
```

### 2. Install Dependencies

```bash
# Clean install of all dependencies
npm ci

# Or if you prefer regular install
npm install
```

This will install:
- **TypeScript 5.3+** - Type-safe development
- **Vite 5.0** - Lightning-fast build tool
- **ESLint + Prettier** - Code quality tools
- **@2gis/mapgl** - Interactive maps
- All other project dependencies

### 3. Verify Installation

```bash
# Check if TypeScript is working
npx tsc --version
# Should output: Version 5.x.x

# Check if Vite is working
npx vite --version
# Should output: vite/5.x.x
```

---

## 🛠️ Development Server

### Quick Start

```bash
# Start development server with hot reload
npm run dev
```

This will:
- Start Vite development server on `http://localhost:8080`
- Enable **Hot Module Replacement (HMR)** for instant updates
- Automatically open the dashboard demo in your browser
- Watch for file changes and reload automatically

### Manual Browser Access

If the browser doesn't open automatically:

1. Open your browser
2. Navigate to `http://localhost:8080`
3. You should see the Dashboard demo with:
   - Interactive 2GIS map
   - Bottomsheet with demo controls
   - Debug information panel

---

## 🎛️ Available Commands

### Development

```bash
# Start development server (with hot reload)
npm run dev

# Alternative start command
npm start
```

### Building

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Clean build artifacts
npm run clean
```

### Code Quality

```bash
# Run TypeScript type checking
npm run type-check

# Lint code (check for issues)
npm run lint:check

# Lint and auto-fix issues
npm run lint

# Format code with Prettier
npm run format

# Check if code is properly formatted
npm run format:check
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Node.js Version Error**

```
Error: The engine "node" is incompatible with this module
```

**Solution:** Update Node.js to version 18.0.0 or higher:
- Download from [nodejs.org](https://nodejs.org/)
- Or use a version manager like `nvm`:
  ```bash
  nvm install 18
  nvm use 18
  ```

#### 2. **Port Already in Use**

```
Error: Port 8080 is already in use
```

**Solution:** 
- Kill the process using port 8080, or
- Use a different port:
  ```bash
  npm run dev -- --port 3000
  ```

#### 3. **Module Not Found Errors**

```
Error: Cannot resolve module '@/components/...'
```

**Solution:** 
- Ensure TypeScript and Vite configurations are correct
- Try cleaning and reinstalling:
  ```bash
  npm run clean
  rm -rf node_modules package-lock.json
  npm install
  ```

#### 4. **MapGL Loading Issues**

```
MapGL API не загрузился
```

**Solution:**
- Check internet connection
- Verify 2GIS MapGL API is accessible
- Check browser console for network errors

#### 5. **TypeScript Errors**

```
Type errors in development
```

**Solution:**
- Run type checking: `npm run type-check`
- Fix reported type errors
- Ensure all imports use correct paths

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# 2GIS MapGL API Key (optional - demo uses default)
VITE_MAPGL_KEY=your-mapgl-api-key

# Development/Production mode
NODE_ENV=development

# Custom port (optional)
PORT=8080
```

### VS Code Setup (Recommended)

Install these VS Code extensions for the best experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss"
  ]
}
```

---

## 📱 Demo Features

Once the development server is running, you can:

### Dashboard Controls
- **Small (20%)** - Minimal bottomsheet height
- **Default (55%)** - Balanced view
- **Fullscreen (90%)** - Maximum content view  
- **Full + Scroll (95%)** - Scrollable content mode

### Action Buttons
- **🔄 Refresh** - Reload dashboard components
- **🐛 Debug** - Toggle debug information panel
- **🎯 Center** - Center map on Moscow
- **📍 Markers** - Add random test markers

### Debug Information
- Current bottomsheet state
- Map status and coordinates
- Performance metrics
- Version information

---

## 🚀 Next Steps

### For Developers

1. **Explore the codebase:**
   ```bash
   # Main entry point
   src/main.ts
   
   # Dashboard implementation
   src/components/Screens/DashboardScreen.ts
   
   # Service layer
   src/services/
   ```

2. **Make changes:**
   - Edit TypeScript files with full IntelliSense
   - See changes instantly with HMR
   - Use browser dev tools for debugging

3. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

### For Designers

1. **Figma Integration:**
   - Design assets are in `figma_export/`
   - Components maintain pixel-perfect accuracy
   - Styles are modular and maintainable

2. **UI Customization:**
   - Modify styles in `src/styles/`
   - Update component templates
   - Test across different screen sizes

---

## 📚 Additional Resources

- **TypeScript Documentation:** [typescriptlang.org](https://www.typescriptlang.org/)
- **Vite Documentation:** [vitejs.dev](https://vitejs.dev/)
- **2GIS MapGL API:** [docs.2gis.com](https://docs.2gis.com/en/mapgl/overview)
- **ESLint Rules:** [eslint.org](https://eslint.org/)
- **Prettier Formatting:** [prettier.io](https://prettier.io/)

---

## 🆘 Getting Help

If you encounter issues:

1. **Check this setup guide** for common solutions
2. **Review the main README.md** for architecture details
3. **Check browser console** for error messages
4. **Verify Node.js and npm versions** meet requirements
5. **Try clean installation** if persistent issues occur

### Clean Installation

```bash
# Remove all generated files
rm -rf node_modules package-lock.json dist

# Fresh install
npm install

# Start development
npm run dev
```

---

**✅ You're ready to develop with the 2GIS Web Prototype!** 