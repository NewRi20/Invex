# 🚀 Invex App - Complete Deployment Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Supabase Configuration](#supabase-configuration)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

Your Invex app consists of three main components:

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │◄─── User Browser
│   React + Vite  │
└────────┬────────┘
         │
         │ HTTPS API calls
         │
         ▼
┌─────────────────┐         ┌─────────────────┐
│   Render        │────────►│   Supabase      │
│   (Backend)     │         │   (Database +   │
│   Flask/Python  │         │    Auth)        │
└─────────────────┘         └─────────────────┘
```

---

## 1️⃣ Supabase Configuration

### Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project: `yjpizcpmtyopcqxtpkzj`
3. Click on **Settings** (gear icon) → **API**
4. Copy these values:
   - **Project URL**: `https://yjpizcpmtyopcqxtpkzj.supabase.co`
   - **anon public key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key** (secret): Click "Reveal" to see it

⚠️ **IMPORTANT**: 
- The `anon` key is safe to use in the frontend (public)
- The `service_role` key must ONLY be used in the backend (keep it secret!)

### Step 2: Configure OAuth Redirect URLs

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs** (Site URLs):
   ```
   http://localhost:5173
   https://your-app-name.vercel.app
   ```
3. Set **Site URL** to: `https://your-app-name.vercel.app`

### Step 3: Configure Authentication Providers

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider:
   - Enable the toggle
   - Add your Google OAuth Client ID and Secret (if you have custom ones)
   - Or use Supabase's default provider for testing

---

## 2️⃣ Backend Deployment (Render)

### Step 1: Prepare Your Repository

Make sure your `backend` folder has:
- ✅ `requirements.txt` (already exists)
- ✅ `app.py` (already exists)
- ✅ All route files in `routes/` folder

### Step 2: Create Render Web Service

1. Go to https://render.com/dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub repository (Invex)
4. Configure the service:

**Basic Settings:**
```
Name: invex-backend (or your preferred name)
Region: Choose closest to your users
Branch: main
Root Directory: backend
```

**Build & Deploy:**
```
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

### Step 3: Set Environment Variables

In Render dashboard → **Environment** tab, add:

```bash
SUPABASE_URL=https://yjpizcpmtyopcqxtpkzj.supabase.co
SUPABASE_KEY=your_supabase_service_role_key_here
```

⚠️ **CRITICAL**: Use your **service_role** key here (not the anon key!)

### Step 4: Deploy

1. Click **Create Web Service**
2. Wait 3-5 minutes for deployment
3. Copy your backend URL: `https://invex-backend-xxxx.onrender.com`

### Step 5: Test Backend

Test if your backend is running:
```bash
curl https://your-backend-url.onrender.com/api/items/
```

You should get a 401 (unauthorized) response - this is correct! It means the API is working but requires authentication.

---

## 3️⃣ Frontend Deployment (Vercel)

### Step 1: Update Your .env File

Update your `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=https://yjpizcpmtyopcqxtpkzj.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_URL=https://your-backend-url.onrender.com
```

⚠️ **NOTE**: Use the **anon** key here (safe for frontend)

### Step 2: Update All API Calls (Already Done!)

I've already updated your code to use `API_BASE_URL` from `src/config.js`. The files that were updated:
- ✅ `src/AuthProvider.jsx`
- 📝 You'll need to update remaining files (I'll do this next)

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from root directory)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? invex-app
# - Directory? ./
# - Override build settings? No
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository (Invex)
4. Configure:
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   ```

### Step 4: Set Environment Variables in Vercel

In Vercel Project Settings → **Environment Variables**, add:

```bash
VITE_SUPABASE_URL=https://yjpizcpmtyopcqxtpkzj.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_URL=https://your-backend-url.onrender.com
```

✅ Apply to: **Production**, **Preview**, and **Development**

### Step 5: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **•••** on the latest deployment
3. Click **Redeploy**

---

## 4️⃣ Update All API Calls to Use Config

I need to update the remaining files to use `API_BASE_URL`. Here are the files that need updating:

### Files to Update:
- `src/pages/Dashboard/Dashboard.jsx`
- `src/pages/Inventory/Inventory.jsx`
- `src/pages/Pricing/Pricing.jsx`
- `src/pages/Reports/AddDeleteUpdate/ReportsAddDeleteUpdate.jsx`
- `src/pages/Reports/SalesRevenue/ReportsSalesRevenue.jsx`
- `src/pages/Reports/ReportStock/ReportsStocks.jsx`
- `src/pages/Profile/Profile/Profile.jsx`

### Update Pattern:

**Before:**
```javascript
fetch('/api/items/', { ... })
```

**After:**
```javascript
import { API_BASE_URL } from '../../config'; // Adjust path as needed

fetch(`${API_BASE_URL}/items/`, { ... })
```

Would you like me to update all these files automatically?

---

## 5️⃣ Testing & Verification

### Test Checklist:

#### Backend Health Check:
```bash
# Should return 401 (unauthorized) - this is good!
curl https://your-backend-url.onrender.com/api/items/

# Check if gunicorn is running
curl https://your-backend-url.onrender.com/
```

#### Frontend Check:
1. Visit: `https://your-app-name.vercel.app`
2. Open Browser DevTools (F12) → **Console**
3. Check for errors

#### Authentication Flow:
1. Click **Sign In with Google**
2. Complete OAuth flow
3. Should redirect back to your app
4. Check if profile loads correctly
5. Verify Dashboard shows data

#### API Communication:
1. Open **Network** tab in DevTools
2. Look for API calls to your Render backend
3. Check response status (should be 200 for authenticated requests)
4. Verify Authorization header is present: `Bearer <token>`

---

## 6️⃣ Troubleshooting

### Issue: "Token is missing!" (401 Error)

**Cause**: Authorization header not being sent or parsed correctly.

**Fix**: Already fixed in `backend/auth_decorator.py` - case-insensitive header check.

---

### Issue: CORS Errors

**Symptoms**: 
```
Access to fetch at 'https://backend.com/api/...' from origin 'https://frontend.com' 
has been blocked by CORS policy
```

**Fix**: Update `backend/app.py`:
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "https://your-app-name.vercel.app"
        ],
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
})
```

---

### Issue: OAuth Redirect Not Working

**Symptoms**: After Google login, stuck on blank page or URL has `#access_token=...`

**Cause**: Supabase redirect URL not configured correctly.

**Fix**:
1. Add your Vercel URL to Supabase redirect URLs
2. Make sure `supabase.auth.getSession()` is called in AuthProvider

---

### Issue: API Calls Return 401 Even When Logged In

**Possible Causes**:
1. ❌ Wrong Supabase key in backend (must be `service_role` key)
2. ❌ Token not being sent in Authorization header
3. ❌ Token expired (refresh not working)

**Debug Steps**:
```javascript
// In AuthProvider.jsx, add console.log
const fetchProfile = async (sessionData) => {
  console.log('Session:', sessionData);
  console.log('Token:', sessionData.access_token);
  // ... rest of code
};
```

Check Render logs:
1. Go to Render Dashboard → Your Service → **Logs**
2. Look for authentication errors

---

### Issue: Environment Variables Not Working

**Check**:
1. ✅ Vercel: Variables start with `VITE_`
2. ✅ Render: Variables don't need `VITE_` prefix
3. ✅ Redeploy after adding variables
4. ✅ No quotes around values in Vercel/Render UI

---

## 🎉 Success Checklist

- [ ] Backend deployed on Render
- [ ] Backend environment variables set (SUPABASE_URL, SUPABASE_KEY)
- [ ] Frontend deployed on Vercel
- [ ] Frontend environment variables set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL)
- [ ] Supabase OAuth redirect URLs configured
- [ ] All API calls updated to use `API_BASE_URL`
- [ ] Google Sign-In works
- [ ] Dashboard loads data
- [ ] Can add/edit/delete items
- [ ] No CORS errors
- [ ] No 401 errors when authenticated

---

## 📚 Quick Reference

### Environment Variables Summary:

**Frontend (.env):**
```bash
VITE_SUPABASE_URL=https://yjpizcpmtyopcqxtpkzj.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_API_URL=https://invex-backend.onrender.com
```

**Backend (backend/.env):**
```bash
SUPABASE_URL=https://yjpizcpmtyopcqxtpkzj.supabase.co
SUPABASE_KEY=<service_role_key>
```

### Useful Commands:

```bash
# Local development - Frontend
npm run dev

# Local development - Backend
cd backend
source invex-venv/bin/activate  # Mac/Linux
.\invex-venv\Scripts\activate    # Windows
python app.py

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# View Render logs
# Go to: https://dashboard.render.com → Your Service → Logs
```

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Render Logs**: 
   - Dashboard → Your Service → Logs
   - Look for Python errors or authentication failures

2. **Check Vercel Logs**:
   - Dashboard → Your Project → Deployments → View Function Logs

3. **Check Browser Console**:
   - F12 → Console tab
   - Look for network errors or JavaScript errors

4. **Verify Environment Variables**:
   - Render: Dashboard → Service → Environment
   - Vercel: Dashboard → Project → Settings → Environment Variables

---

**Next Step**: Would you like me to automatically update all the remaining API calls in your frontend files to use the `API_BASE_URL` configuration?
