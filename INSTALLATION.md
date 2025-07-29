# Installation Guide

## 📋 System Requirements

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** for version control
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

## 🚀 Quick Installation

### 1. Clone Repository
```bash
git clone https://github.com/vladprrs/vibecode-2gis-template.git
cd vibecode-2gis-template
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to: `http://localhost:8080`

## 🔧 Detailed Setup

### Prerequisites Verification
Check your system meets the requirements:

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher

# Check Git installation
git --version
```

### Environment Configuration

#### 2GIS MapGL API Key
1. Visit [2GIS Developer Portal](https://dev.2gis.com/)
2. Register or sign in to your account
3. Create a new project
4. Generate an API key
5. Create `.env` file in project root:

```env
# 2GIS MapGL API Key
VITE_MAPGL_KEY=your-2gis-api-key-here

# Development settings (optional)
NODE_ENV=development
```

**Note:** The application includes a demo API key for testing, but you should use your own key for production.

### Project Structure After Installation
```
vibecode-2gis-template/
├── src/                     # Source code
│   ├── components/          # UI components
│   ├── services/           # Business logic
│   ├── types/              # TypeScript definitions
│   ├── config/             # Configuration
│   ├── styles/             # Global styles
│   └── main.ts             # Entry point
├── test/                   # Test files and demos
├── figma_export/           # Design assets
├── node_modules/           # Dependencies (generated)
├── dist/                   # Build output (generated)
├── package.json            # Project configuration
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite build config
└── .env                    # Environment variables (you create this)
```

## 🛠️ Development Commands

### Primary Commands
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run TypeScript type checking
npm run type-check

# Lint code with ESLint
npm run lint

# Format code with Prettier
npm run format

# Clean build artifacts
npm run clean
```

### Advanced Commands
```bash
# Lint and auto-fix issues
npm run lint

# Check code formatting
npm run format:check

# Run all quality checks
npm run type-check && npm run lint && npm run build
```

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
If port 8080 is occupied:
```bash
# Kill process using port 8080 (macOS/Linux)
lsof -ti:8080 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

#### Node.js Version Issues
If you're using an older Node.js version:
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or update Node.js manually
# Visit: https://nodejs.org/
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run type checking
npm run type-check
```

#### Build Failures
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### MapGL Not Loading
1. Check API key in `.env` file
2. Verify internet connection
3. Check browser console for errors
4. Ensure API key has proper permissions

### Development Environment Setup

#### VS Code Extensions (Recommended)
- **TypeScript Hero** - TypeScript support
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vite** - Build tool support
- **Auto Rename Tag** - HTML/JSX editing

#### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## 🧪 Verification

### Test Installation
After installation, verify everything works:

1. **Development server starts:**
   ```bash
   npm run dev
   ```
   Should output: `Local: http://localhost:8080`

2. **Application loads:**
   - Open browser to `http://localhost:8080`
   - Should see 2GIS map with bottomsheet
   - No console errors

3. **Build system works:**
   ```bash
   npm run build
   ```
   Should create `dist/` folder without errors

4. **Code quality tools work:**
   ```bash
   npm run type-check && npm run lint
   ```
   Should pass without errors

### Feature Testing
Test key features:
- **Map interaction** - Click on map to add markers
- **Bottomsheet gestures** - Drag bottomsheet up/down
- **Search bar** - Click search to navigate (demo functionality)
- **Responsive design** - Resize browser window

## 📱 Mobile Development

### Local Network Access
To test on mobile devices:

```bash
# Start server with network access
npm run dev

# Find your local IP
ipconfig getifaddr en0  # macOS
hostname -I             # Linux
ipconfig               # Windows
```

Access from mobile: `http://YOUR_IP:8080`

### Mobile Browser Testing
Recommended browsers for testing:
- **iOS Safari** (latest)
- **Chrome Mobile** (latest)
- **Firefox Mobile** (latest)

## 🚀 Production Setup

### Build for Production
```bash
# Create optimized build
npm run build

# Test production build locally
npm run preview
```

### Environment Variables for Production
Create production `.env`:
```env
VITE_MAPGL_KEY=your-production-api-key
NODE_ENV=production
```

### Deploy to Static Hosting
The `dist/` folder contains static files ready for deployment to:
- **Netlify** - Drag & drop deployment
- **Vercel** - Git-connected deployment
- **GitHub Pages** - Free hosting
- **Any static web server**

## 📞 Support

### Getting Help
1. **Check documentation** - Read README.md thoroughly
2. **Search issues** - Check GitHub issues for similar problems
3. **Create issue** - Provide detailed information:
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Operating system
   - Error messages
   - Steps to reproduce

### Debug Information
When reporting issues, include:
```bash
# System information
node --version
npm --version
npm list --depth=0

# Console errors from browser
# Network tab information
# Any relevant log files
```

---

📝 **Note:** This installation guide covers the standard setup. For advanced configurations, Docker deployment, or CI/CD integration, refer to the main README.md file.