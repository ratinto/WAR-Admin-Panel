# 🚀 How to Change Backend URL - Quick Guide

## One-Place Configuration System

The WAR Admin Panel now uses a centralized configuration system. Change your backend URL **ONE TIME** and it updates everywhere!

## ✨ How to Use

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Update Backend URL in `.env`
```env
# For local development (default)
VITE_API_BASE_URL=http://localhost:8000/api

# OR for production/deployed backend
VITE_API_BASE_URL=https://your-vercel-url.vercel.app/api
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

**Done!** All API calls now use the new URL.

---

## 📋 Quick Examples

### Local Backend (Development)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Vercel Deployed Backend
```env
VITE_API_BASE_URL=https://war-backend-xy1z.vercel.app/api
```

### Production Server
```env
VITE_API_BASE_URL=https://api.yourcompany.com/api
```

---

## 🎯 Where Changes Take Effect

Once you update `.env`, these files automatically use the new URL:

✅ `src/services/api.ts` - All API calls  
✅ `src/contexts/AuthContext.tsx` - Authentication  
✅ `src/pages/Dashboard.tsx` - Dashboard API  
✅ `src/pages/Students.tsx` - Students API  
✅ `src/pages/Washermen.tsx` - Washermen API  
✅ `src/pages/Orders.tsx` - Orders API  
✅ All other API requests  

**No code changes needed!**

---

## 📁 Configuration Files

| File | Purpose | Git |
|------|---------|-----|
| `.env` | Your local settings | ❌ Ignored |
| `.env.example` | Template for team | ✅ In Git |
| `.env.production` | Production settings template | ✅ In Git |

---

## 🔧 For Different Scenarios

### Development (Local)
1. Copy `.env.example` → `.env`
2. Keep `VITE_API_BASE_URL=http://localhost:8000/api`
3. Run `npm run dev`

### Staging Server
1. Copy `.env.example` → `.env.staging`
2. Set `VITE_API_BASE_URL=https://staging-api.example.com/api`
3. Run `npm run build -- --mode staging`

### Production Build
1. Update `.env.production`
2. Set `VITE_API_BASE_URL=https://api.example.com/api`
3. Run `npm run build` (uses `.env.production`)

---

## 🐛 Debugging

### Check Current Configuration
Open browser console and look for:
```
🔧 App Configuration: {
  apiBaseURL: "http://localhost:8000/api",
  environment: "development",
  debug: true
}
```

### Enable Debug Mode
Add to `.env`:
```env
VITE_DEBUG=true
```

### Verify Backend is Running
```bash
curl http://localhost:8000/api/health
# Should return: { status: 'healthy', ... }
```

---

## ❓ FAQ

**Q: Do I need to change code in multiple files?**  
A: No! Just update `.env` and restart the dev server.

**Q: What if the URL is wrong?**  
A: Update `.env` and restart `npm run dev`. Changes take effect immediately.

**Q: How do I know if it's using the correct URL?**  
A: Check browser console for the 🔧 debug message, or check Network tab for the API calls.

**Q: Can I have different URLs for development/production?**  
A: Yes! Use `.env` for development and `.env.production` for production builds.

---

## 📚 Full Documentation

See `ENVIRONMENT-CONFIG.md` for complete documentation.

---

**That's it!** 🎉 One place to change = Backend URL updated everywhere.
