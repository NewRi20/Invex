# ✅ Pre-Deployment Checklist

## Quick Reference Before You Deploy

---

## 🎯 Your Endpoints Are Correctly Configured!

### Summary:
✅ **All frontend API calls** now use `API_BASE_URL` from config  
✅ **All backend routes** have the `/api/` prefix  
✅ **CORS** is configured for your Vercel domain  
✅ **Authentication** handles both uppercase and lowercase headers  
✅ **Environment variables** are properly structured  

---

## 📝 Final Steps Before Deployment

### 1️⃣ Backend (Render)

**Create Web Service:**
1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository

**Configuration:**
```
Name: invex-backend
Region: (Choose closest to your users)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

**Environment Variables in Render:**
```
SUPABASE_URL=https://yjpizcpmtyopcqxtpkzj.supabase.co
SUPABASE_KEY=<your_supabase_service_role_key>
```

⚠️ **Important**: Use your **service_role** key (not anon key)!

**After Deployment:**
- Copy your Render URL: `https://invex-backend-xxxx.onrender.com`
- Keep this URL for the next step!

---

### 2️⃣ Frontend (Vercel)

**Deploy via CLI or Dashboard:**

#### Option A: CLI (Recommended)
```bash
# From your project root
npm install -g vercel
vercel login
vercel
```

#### Option B: Dashboard
1. Go to https://vercel.com/dashboard
2. Import GitHub repository
3. Configure:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

**Environment Variables in Vercel:**
```
VITE_SUPABASE_URL=https://yjpizcpmtyopcqxtpkzj.supabase.co
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
VITE_API_URL=<your_render_backend_url>
```

Example:
```
VITE_API_URL=https://invex-backend-xxxx.onrender.com
```

⚠️ **Important**: 
- Use **anon** key (not service_role)
- No trailing slash in `VITE_API_URL`
- Redeploy after adding variables!

---

### 3️⃣ Supabase Configuration

**Add OAuth Redirect URLs:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **URL Configuration**
4. Add to **Redirect URLs**:
   ```
   http://localhost:5173
   https://invex-five.vercel.app
   ```
5. Set **Site URL**: `https://invex-five.vercel.app`

---

## 🧪 Testing After Deployment

### Step 1: Test Backend
```bash
# Should return: {"status": "Flask backend is running!"}
curl https://your-backend.onrender.com/

# Should return 401 (this is correct!)
curl https://your-backend.onrender.com/api/items/
```

### Step 2: Test Frontend
1. Visit: `https://invex-five.vercel.app`
2. Open DevTools (F12) → **Console** tab
3. Click **Sign In with Google**
4. Complete OAuth flow
5. Check that dashboard loads with data

### Step 3: Verify API Calls
1. Open DevTools → **Network** tab
2. Filter by: `Fetch/XHR`
3. Look for calls to: `https://your-backend.onrender.com/api/...`
4. Check response status: Should be `200 OK` (not 401)
5. Verify `Authorization: Bearer ...` header is present

---

## ⚠️ Known Issues & Quick Fixes

### Issue: CORS Error
**Error**: "blocked by CORS policy"  
**Fix**: Update `backend/app.py` line 14 with your actual Vercel URL:
```python
"https://invex-five.vercel.app"  # No trailing slash!
```

### Issue: 401 After Login
**Possible Causes**:
1. Wrong Supabase key in Render (use `service_role`)
2. Token not sent in Authorization header
3. Redirect URL not configured in Supabase

**Debug**:
- Check Render logs for authentication errors
- Check browser console for failed API calls
- Verify `SUPABASE_KEY` in Render is the service_role key

### Issue: Environment Variables Not Working
**Fix**:
- Vercel: Go to Settings → Environment Variables → Redeploy
- Render: Settings → Environment → Restart service

---

## 📦 Files Ready for Deployment

### Backend (`backend/`)
✅ `app.py` - CORS configured  
✅ `auth_decorator.py` - Fixed case-insensitive header check  
✅ `requirements.txt` - All dependencies listed  
✅ `routes/*.py` - All routes prefixed with `/api/`  

### Frontend (`/`)
✅ `src/config.js` - API_BASE_URL configuration  
✅ `src/AuthProvider.jsx` - Uses API_BASE_URL  
✅ All page components - Updated to use API_BASE_URL  
✅ `vercel.json` - SPA routing configured  
✅ `vite.config.js` - Dev proxy configured  

---

## 🎉 You're Ready to Deploy!

All your endpoints are correctly configured. Just follow the steps above and you'll be live in minutes!

### What's Working:
- ✅ User authentication with Google OAuth
- ✅ Inventory management (CRUD)
- ✅ Category management
- ✅ Stock tracking
- ✅ Sales reporting
- ✅ Price updates
- ✅ Business profile management
- ✅ Dashboard analytics

### Configuration:
- ✅ Backend routes: `/api/` prefix
- ✅ Frontend: Configurable API base URL
- ✅ CORS: Configured for localhost + Vercel
- ✅ Auth: Case-insensitive header handling
- ✅ Environment: Development & production ready

---

**Need Help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions or `ENDPOINT_VERIFICATION.md` for complete endpoint documentation.
