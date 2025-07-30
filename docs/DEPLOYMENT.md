# Deployment Documentation

## 📋 Overview

This document describes the deployment process and configuration for the 2GIS template application.

## 🚀 Build Process

### Development Build
```bash
# Start development server
npm run dev

# Build for development
npm run build

# Preview production build
npm run preview
```

### Production Build
```bash
# Clean previous builds
npm run clean

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### Build Output
```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── main-[hash].js      # Main JavaScript bundle
│   ├── main-[hash].css     # Main CSS bundle
│   └── images/             # Optimized images
└── [other assets]
```

## 🔧 Environment Configuration

### Environment Variables
```bash
# .env file
VITE_MAPGL_KEY=your-2gis-api-key-here
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
VITE_API_BASE_URL=https://api.example.com
```

### Environment-Specific Configs
```typescript
// src/config/environment.ts
export const Environment = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // API Configuration
  mapApiKey: process.env.VITE_MAPGL_KEY || 'demo-key',
  apiBaseUrl: process.env.VITE_API_BASE_URL || 'https://api.example.com',
  
  // Feature Flags
  debugMode: process.env.VITE_DEBUG_MODE === 'true',
  enableAnalytics: process.env.NODE_ENV === 'production',
  
  // Build Information
  version: process.env.VITE_APP_VERSION || '1.0.0',
  buildTime: new Date().toISOString()
};
```

## 🌐 Hosting Options

### Static Hosting

#### Netlify
```yaml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[headers]
  for = "*.js"
    [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
  
  for = "*.css"
    [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
  
  for = "*.html"
    [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

#### Vercel
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### GitHub Pages
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_MAPGL_KEY: ${{ secrets.VITE_MAPGL_KEY }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Docker Deployment

#### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API proxy (if needed)
        location /api/ {
            proxy_pass http://api-server:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_MAPGL_KEY=${VITE_MAPGL_KEY}
    restart: unless-stopped
    
  api:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./api:/app
    ports:
      - "3000:3000"
    command: npm start
    environment:
      - NODE_ENV=production
```

## 🔒 Security Configuration

### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.2gis.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.2gis.com https://api.example.com;
  frame-src 'none';
  object-src 'none';
">
```

### Security Headers
```typescript
// Security middleware configuration
const securityHeaders = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

## 📊 Performance Optimization

### Bundle Optimization
```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Bundle analysis
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@2gis/mapgl'],
          utils: ['lodash', 'date-fns']
        }
      }
    },
    
    // Compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Source maps
    sourcemap: false
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['@2gis/mapgl']
  }
});
```

### Caching Strategy
```typescript
// Service worker for caching
const CACHE_NAME = '2gis-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/main.js',
  '/assets/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

## 🔍 Monitoring and Analytics

### Error Tracking
```typescript
// Error monitoring setup
class ErrorMonitor {
  static init() {
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason
      });
    });
  }
  
  static logError(type: string, data: any) {
    // Send to monitoring service
    console.error(type, data);
  }
}
```

### Performance Monitoring
```typescript
// Performance metrics
class PerformanceMonitor {
  static measurePageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
      };
      
      this.sendMetrics('page_load', metrics);
    });
  }
  
  static sendMetrics(name: string, data: any) {
    // Send to analytics service
    console.log(`Metric: ${name}`, data);
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          VITE_MAPGL_KEY: ${{ secrets.VITE_MAPGL_KEY }}
      
      - name: Test build
        run: npm run preview &
        run: sleep 10
        run: curl -f http://localhost:4173 || exit 1

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_MAPGL_KEY: ${{ secrets.VITE_MAPGL_KEY }}
      
      - name: Deploy to production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/2gis-app
            git pull origin main
            npm ci
            npm run build
            sudo systemctl reload nginx
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules
npm install
npm run build
```

#### Environment Variables
```bash
# Check environment variables
echo $VITE_MAPGL_KEY

# Set environment variable
export VITE_MAPGL_KEY=your-key-here
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for memory leaks
node --inspect npm run dev
```

### Debug Configuration
```typescript
// Debug configuration
const DEBUG_CONFIG = {
  enableLogging: process.env.NODE_ENV === 'development',
  logLevel: process.env.VITE_LOG_LEVEL || 'info',
  enablePerformanceMonitoring: true,
  enableErrorTracking: true
};

// Debug utilities
class Debug {
  static log(message: string, data?: any) {
    if (DEBUG_CONFIG.enableLogging) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
  
  static error(message: string, error?: Error) {
    console.error(`[ERROR] ${message}`, error);
  }
}
```

## 📈 Scaling Considerations

### CDN Configuration
```typescript
// CDN configuration
const CDN_CONFIG = {
  baseUrl: 'https://cdn.example.com',
  assets: {
    js: '/assets/js',
    css: '/assets/css',
    images: '/assets/images'
  }
};

// Asset URL generation
function getAssetUrl(path: string): string {
  return `${CDN_CONFIG.baseUrl}${path}`;
}
```

### Load Balancing
```nginx
# nginx load balancer configuration
upstream app_servers {
    server app1.example.com:80;
    server app2.example.com:80;
    server app3.example.com:80;
}

server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

This deployment documentation provides comprehensive guidance for deploying the 2GIS template application across various hosting platforms and environments. 