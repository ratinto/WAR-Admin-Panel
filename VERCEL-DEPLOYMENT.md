# WAR Admin Panel - Vercel Deployment Guide

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub account with your repository pushed
- Backend already deployed (https://war-backend-express.vercel.app/api)

## Quick Deployment Steps

### Step 1: Push to GitHub
```bash
git add -A
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your **WAR-Admin-Panel** repository
4. Click "Import"

#### Option B: Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

### Step 3: Configure Environment Variables

In **Vercel Dashboard** → Your Project → Settings → Environment Variables:

Add these variables:

```
VITE_API_BASE_URL=https://war-backend-express.vercel.app/api
VITE_DEBUG=false
```

**Note**: Make sure to add for **Production** environment.

### Step 4: Deploy

The deployment will start automatically! Monitor progress:
- Go to **Deployments** tab
- Watch for the green checkmark ✅
- Your app will be available at `https://your-project-name.vercel.app`

---

## Verification

### Test Your Deployment

1. **Visit your URL**: `https://your-project-name.vercel.app`
2. **Check Console**: Open DevTools → Console
3. **Look for**: `🔧 App Configuration:` message
4. **Verify**: `apiBaseURL` shows `https://war-backend-express.vercel.app/api`

### Test Login
- Try logging in with admin credentials
- Check Network tab for API calls
- Should see requests to `https://war-backend-express.vercel.app/api/auth/...`

---

## Environment Variables Setup

### For Vercel Dashboard

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://war-backend-express.vercel.app/api` | Production |
| `VITE_DEBUG` | `false` | Production |

---

## Project Configuration

### Files for Vercel
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to ignore
- ✅ `.env.production` - Production template
- ✅ `.env.example` - Configuration template

### Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` (automatic)

---

## Troubleshooting

### 404 Errors on Page Refresh

If you get 404 errors when refreshing pages (except root), this is normal for SPAs.
- ✅ Already configured in `vercel.json`
- All routes rewrite to `/index.html`

### API Calls Failing (404/401)

1. **Check Environment Variables**:
   - Go to Settings → Environment Variables
   - Verify `VITE_API_BASE_URL` is set correctly
   - Redeploy if changed

2. **Check Console**:
   - Look for `🔧 App Configuration:` message
   - Verify `apiBaseURL` is correct

3. **Check Network Tab**:
   - Look at actual API request URLs
   - Should be `https://war-backend-express.vercel.app/api/...`

### Build Fails

1. **Check Build Logs**:
   - Go to Deployments → Failed Deployment → Logs
   - Look for specific errors

2. **Test Locally**:
   ```bash
   npm run build
   ```

3. **Common Issues**:
   - Missing dependencies: Run `npm install`
   - TypeScript errors: Check `npm run build` output locally
   - Environment variables: Verify they're set in Vercel

---

## Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS setup instructions
4. Wait for DNS propagation (5-48 hours)

---

## Monitoring & Analytics

- **Deployments**: View all past deployments
- **Analytics**: Monitor traffic and performance
- **Logs**: Real-time log streaming available
- **Alerts**: Set up notifications for failures

---

## Redeploy & Updates

### Redeploy Manually
1. Go to Deployments
2. Click the three dots (⋯)
3. Select "Redeploy"

### Automatic Redeploy on Push
- Enabled by default
- Every push to main branch triggers redeploy
- View progress in Deployments tab

---

## Performance Tips

1. **Enable Caching**:
   - Vercel automatically caches static assets
   - Set long TTLs for versioned files

2. **Optimize Bundle**:
   - Check `npm run build` output size
   - Consider code splitting

3. **Monitor Performance**:
   - Use Vercel Analytics
   - Check Web Vitals in dashboard

---

## Security

- ✅ HTTPS automatically enabled
- ✅ Environment variables are encrypted
- ✅ `.env` files in `.gitignore` (not committed)
- ✅ Build logs contain no secrets

---

## Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Status Page**: https://www.vercelstatus.com
- **Support**: Vercel dashboard → Help

---

## Success Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported in Vercel
- [ ] Environment variables set (VITE_API_BASE_URL)
- [ ] Deployment completed (green checkmark)
- [ ] URL accessible and responds
- [ ] Console shows correct configuration
- [ ] Login page loads
- [ ] API calls working
- [ ] Custom domain added (optional)

---

**🎉 Your Admin Panel is now live on Vercel!**
