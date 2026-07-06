# 🚀 Deployment Guide: Vercel + Render

## 📋 Prerequisites
- GitHub account (free)
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (already set up)

---

## ✅ **STEP 1: Push Project to GitHub**

### 1.1 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create repository: `TourAndTravel`
3. Copy the commands to push code

### 1.2 Push to GitHub from your local machine
```bash
cd c:\test\TourAndTravel
git init
git add .
git commit -m "Initial commit: Tour and Travel booking app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TourAndTravel.git
git push -u origin main
```

---

## 🌐 **STEP 2: Deploy Frontend to Vercel**

### 2.1 Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Import Project"
4. Select `TourAndTravel` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./frontend`
   - Click "Deploy"

### 2.2 Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL=https://tourtravel-backend.onrender.com/api
   ```
3. Redeploy: Click **Deployments** → **Redeploy**

### 2.3 Get Frontend URL
- Your site will be at: `https://tourtravel.vercel.app` (or custom domain)

---

## 🔧 **STEP 3: Deploy Backend to Render**

### 3.1 Create Render Web Service
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **New +** → **Web Service**
4. Connect to your GitHub repository
5. Configure:
   - **Name**: `tourtravel-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### 3.2 Add Environment Variables
1. Go to **Environment** section
2. Add these variables (copy from DEPLOYMENT_ENV_TEMPLATE.md):
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://bhaskar:bhaskar@clustertour.jlf2zut.mongodb.net/?appName=Clustertour&retryWrites=true&w=majority
   JWT_SECRET=mysupersecretkey123456789
   JWT_EXPIRES_IN=7d
   RAZORPAY_KEY_ID=rzp_test_dummy123456789
   RAZORPAY_KEY_SECRET=dummy_secret_key_12345
   CLIENT_URL=https://tourtravel.vercel.app
   FAST2SMS_API_KEY=your_api_key_here
   ```

### 3.3 Deploy
- Click **Create Web Service**
- Wait for deployment (~2 minutes)
- Get your backend URL: `https://tourtravel-backend.onrender.com`

---

## 🔗 **STEP 4: Update Frontend with Backend URL**

### 4.1 Update Environment Variable
1. In Vercel Dashboard:
2. Go to **Settings** → **Environment Variables**
3. Update `VITE_API_URL` to your Render backend URL:
   ```
   https://tourtravel-backend.onrender.com/api
   ```

### 4.2 Redeploy Frontend
1. Click **Deployments**
2. Click the 3-dot menu on latest deployment
3. Click **Redeploy**

---

## 📱 **STEP 5: Keep Backend Alive (Optional but Recommended)**

Since Render's free tier spins down after 15 minutes of inactivity, add monitoring:

### Option A: Use Uptime Robot (Easiest)
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up free
3. Add Monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://tourtravel-backend.onrender.com/api/health`
   - **Check interval**: 5 minutes
4. This will keep your backend alive!

### Option B: Manual Ping
If first request is slow, it's just the cold start (10-30 sec). Subsequent requests are instant.

---

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] GitHub repository created and pushed
- [ ] Vercel frontend deployed
- [ ] Frontend environment variables added
- [ ] Render backend deployed  
- [ ] Backend environment variables added
- [ ] Frontend updated with backend URL
- [ ] Test home page loads
- [ ] Test search functionality
- [ ] Test booking flow
- [ ] Monitor uptime (optional)

---

## 🧪 **TESTING AFTER DEPLOYMENT**

### Test URLs
- **Frontend**: `https://tourtravel.vercel.app`
- **Backend Health Check**: `https://tourtravel-backend.onrender.com/api/health`

### Test Flow
1. Go to frontend URL
2. Check "Available Buses Today" section loads
3. Try searching for buses
4. Click "Book Now" on a bus
5. Verify OTP is sent to phone
6. Complete booking with Razorpay

---

## 🐛 **Common Issues & Solutions**

### Issue: "Cannot POST /api/auth/send-phone-otp"
**Solution**: Backend URL might be wrong. Check:
- Frontend `.env.production` has correct Render URL
- Render backend is deployed and running
- Verify at `https://tourtravel-backend.onrender.com/api/health`

### Issue: "CORS Error - Origin not allowed"
**Solution**: Update backend `CLIENT_URL` env var in Render:
```
CLIENT_URL=https://tourtravel.vercel.app
```
Then restart backend.

### Issue: "MongoDB connection timeout"
**Solution**: 
- Check `MONGODB_URI` is correct
- Whitelist Render IP on MongoDB Atlas
- Go to MongoDB Atlas → Network Access → Add IP

### Issue: Backend always spinning down
**Solution**: Use Uptime Robot to ping every 5 minutes (keeps alive)

---

## 📞 **Support URLs**

| Service | Docs |
|---------|------|
| Vercel | https://vercel.com/docs |
| Render | https://render.com/docs |
| MongoDB Atlas | https://docs.mongodb.com/atlas/ |

---

## 🎯 **Next Steps (After Deployment)**

1. Share frontend URL with friends
2. Test end-to-end booking flow
3. Configure custom domain (optional)
4. Monitor performance in Render dashboard
5. Keep API key secure - rotate if exposed

---

**Your live app is now running! 🎉**
