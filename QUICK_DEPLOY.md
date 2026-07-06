# 🚀 Quick Deployment - 15 Minutes to Live!

## 📖 Read First: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## ⚡ **TL;DR - 4 Steps**

### **1️⃣ Push to GitHub** (2 min)
```bash
cd c:\test\TourAndTravel
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TourAndTravel.git
git push -u origin main
```

### **2️⃣ Deploy Frontend to Vercel** (3 min)
1. Visit [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Root Directory: `./frontend`
4. Deploy ✅

**Your Frontend URL**: `https://tourtravel.vercel.app`

### **3️⃣ Deploy Backend to Render** (5 min)
1. Visit [render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Build: `npm install`
4. Start: `node server.js`
5. Add ENV vars from [DEPLOYMENT_ENV_TEMPLATE.md](./DEPLOYMENT_ENV_TEMPLATE.md)
6. Deploy ✅

**Your Backend URL**: `https://tourtravel-backend.onrender.com`

### **4️⃣ Update Frontend URLs** (2 min)
In Vercel Settings → Environment Variables:
```
VITE_API_URL=https://tourtravel-backend.onrender.com/api
```
Redeploy frontend ✅

---

## 🧪 **Test Your Deployment**

1. Open: `https://tourtravel.vercel.app`
2. Check buses load in "Available Buses Today"
3. Click "Book Now" on any bus
4. Test search functionality
5. Try booking a seat

---

## 📊 **Environment Variables Needed**

### Frontend (.env.production)
```
VITE_API_URL=https://tourtravel-backend.onrender.com/api
```
✅ Already created

### Backend (Render Dashboard)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=your_atlas_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
CLIENT_URL=https://tourtravel.vercel.app
FAST2SMS_API_KEY=your_key
```

---

## 🔗 **Useful Links**

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- GitHub: https://github.com/new
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

---

## ⚠️ **Common Issues**

| Problem | Solution |
|---------|----------|
| CORS error | Check `CLIENT_URL` in Render env vars |
| DB connection error | Whitelist Render IP in MongoDB Atlas |
| Backend timeout | Add health check URL in Render settings |
| 404 on API calls | Verify `VITE_API_URL` in Vercel env vars |

---

## 📞 **Need Help?**

1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed steps
2. Review "Common Issues & Solutions" section
3. Check Render/Vercel logs for error messages

---

**Ready? Let's deploy! 🎯**
