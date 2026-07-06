# Production Environment Variables

# Backend Production ENV Template
Copy the following to Render dashboard when deploying backend:

PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+atlas_connection_string_here
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLIENT_URL=https://tourtravel.vercel.app
FAST2SMS_API_KEY=your_fast2sms_api_key_here

# Frontend Production ENV (already in .env.production)
VITE_API_URL=https://tourtravel-backend.onrender.com/api
