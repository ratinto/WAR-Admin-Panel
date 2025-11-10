# WAR Admin Panel - Environment Configuration Guide

## Overview

The application now uses centralized environment configuration. All backend URLs and settings can be changed in one place:

- **Development**: Change `VITE_API_BASE_URL` in `.env`
- **Production**: Change `VITE_API_BASE_URL` in `.env.production`
- **Template**: Reference `.env.example` for available options

## Quick Start

### 1. **Copy Environment Template**
```bash
cp .env.example .env
```

### 2. **Update Your Backend URL**
Edit `.env` and change the `VITE_API_BASE_URL`:

```env
# For local development
VITE_API_BASE_URL=http://localhost:8000/api

# Or for a deployed backend
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

### 3. **Restart Dev Server**
```bash
npm run dev
```

**That's it!** All API calls will now use the new URL.

## Environment Variables

### `VITE_API_BASE_URL`
- **Type**: String
- **Default**: `http://localhost:8000/api`
- **Usage**: Base URL for all backend API calls
- **Example**: 
  - Development: `http://localhost:8000/api`
  - Production: `https://war-backend.vercel.app/api`

### `VITE_DEBUG`
- **Type**: Boolean (as string: `"true"` or `"false"`)
- **Default**: `false`
- **Usage**: Enables debug logging in console

## File Structure

```
WAR-Admin-Panel/
├── .env                    # ← LOCAL: Development settings (git ignored)
├── .env.example            # ← TEMPLATE: Configuration reference (in git)
├── .env.production         # ← TEMPLATE: Production settings (in git)
└── src/
    ├── config/
    │   └── index.ts        # ← CENTRALIZED: Config loader
    └── services/
        └── api.ts          # ← Uses config.api.baseURL
```

## How It Works

1. **Configuration Loading** (`src/config/index.ts`):
   ```typescript
   export const config = {
     api: {
       baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
       timeout: 10000,
     },
     // ... more config
   };
   ```

2. **API Service Usage** (`src/services/api.ts`):
   ```typescript
   import { config } from '@/config';
   
   const API_BASE_URL = config.api.baseURL;
   // Now all requests use this URL from environment
   ```

3. **Vite Auto-Loading**:
   - Vite automatically loads `.env` and `.env.{MODE}` files
   - Variables prefixed with `VITE_` are accessible via `import.meta.env`

## Changing Backend URL

### Local Development
1. Open `.env`
2. Update `VITE_API_BASE_URL`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
3. Restart dev server: `npm run dev`

### Production Build
1. Open `.env.production`
2. Update `VITE_API_BASE_URL`:
   ```env
   VITE_API_BASE_URL=https://your-vercel-url.vercel.app/api
   ```
3. Build: `npm run build`

### For Multiple Environments
Create additional environment files:
```bash
.env                    # Development (local)
.env.staging            # Staging server
.env.production         # Production
```

Then run:
```bash
npm run build -- --mode staging  # Builds with .env.staging
```

## Configuration in Different Environments

### 🚀 Vercel Deployment

If deploying frontend to Vercel, set environment variable in Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add:
   ```
   Name: VITE_API_BASE_URL
   Value: https://your-backend-url.vercel.app/api
   ```
3. Redeploy

### 🐳 Docker Deployment

Build with environment variable:
```bash
docker build --build-arg VITE_API_BASE_URL=https://backend.example.com/api -t admin-panel .
```

### 📱 Different Deployment Methods

| Environment | Command | Config File |
|---|---|---|
| Local Dev | `npm run dev` | `.env` |
| Staging Build | `npm run build -- --mode staging` | `.env.staging` |
| Production Build | `npm run build` | `.env.production` |

## Debugging

### Check Current Configuration
Open browser console and look for debug message:
```
🔧 App Configuration: {
  apiBaseURL: "http://localhost:8000/api",
  environment: "development",
  debug: true
}
```

### Enable Debug Logging
Set in `.env`:
```env
VITE_DEBUG=true
```

### Verify Backend Connection
```bash
curl http://localhost:8000/api/health
# Should return: { status: 'healthy', ... }
```

## Common Issues

### API Calls Failing
1. **Check Configuration**:
   - Open DevTools → Console
   - Look for the 🔧 debug message
   - Verify `apiBaseURL` is correct

2. **Backend Not Running**:
   ```bash
   # Check if backend is running
   curl http://localhost:8000/health
   ```

3. **Wrong URL Format**:
   - ✅ Correct: `http://localhost:8000/api`
   - ❌ Wrong: `http://localhost:8000` (missing `/api`)
   - ❌ Wrong: `http://localhost:8000/api/` (trailing slash)

### Environment Variable Not Loading
- Vite caches environment variables
- After changing `.env`, restart dev server: `npm run dev`
- For production builds, rebuild: `npm run build`

## Best Practices

1. **Always use `.env.example` as template**
   - Keep it in git for team reference
   - Don't commit actual `.env` files

2. **Use different URLs for different environments**
   ```
   Development: http://localhost:8000/api
   Staging: https://staging-api.example.com/api
   Production: https://api.example.com/api
   ```

3. **Use absolute URLs for non-local environments**
   ```env
   # ❌ Avoid relative paths in production
   VITE_API_BASE_URL=/api

   # ✅ Use full URLs
   VITE_API_BASE_URL=https://api.example.com/api
   ```

4. **Keep sensitive data in environment, not code**
   - If you need API keys, add to `.env`
   - Never commit `.env` file
   - Add to `.gitignore` ✅

## Next Steps

- [ ] Copy `.env.example` to `.env`
- [ ] Update `VITE_API_BASE_URL` with your backend URL
- [ ] Restart dev server
- [ ] Test API calls
- [ ] For production, update `.env.production`

## Files Modified

- ✅ `src/config/index.ts` - NEW: Centralized configuration
- ✅ `src/services/api.ts` - UPDATED: Uses config
- ✅ `.env` - NEW: Development environment
- ✅ `.env.example` - NEW: Template
- ✅ `.env.production` - NEW: Production template
- ✅ `.gitignore` - UPDATED: Ignores .env files

## Reference

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vite Guide - Modes and Environment](https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server)
