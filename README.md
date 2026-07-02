# AdiTourn Travel — Tour & Travel Booking Platform

A full-stack tour and travel website built for India, featuring multi-role authentication, bus booking with seat selection, free maps, and affordable payment processing.

## Features

- **Three-Role System**: Admin, Driver, and Traveller with separate dashboards and permissions
- **Bus Management**: Admin can configure buses with seat layouts (window/aisle, AC/non-AC)
- **Seat Selection**: Visual seat map with real-time availability
- **Live Tracking**: Map view showing bus location, departure & arrival (OpenStreetMap — free)
- **Payment**: Razorpay integration (~2% fee, no monthly charges — cheapest in India)
- **Non-Technical Admin**: Simple dashboard with forms — no coding knowledge required

## Tech Stack

| Layer      | Technology                          | Cost  |
|------------|-------------------------------------|-------|
| Frontend   | React + Vite + Tailwind CSS         | Free  |
| Backend    | Node.js + Express.js                | Free  |
| Database   | MongoDB Atlas (512 MB free tier)    | Free  |
| Maps       | Leaflet.js + OpenStreetMap          | Free  |
| Auth       | JWT + bcrypt                        | Free  |
| Payment    | Razorpay (~2% per transaction)      | Low   |
| Hosting FE | Vercel                              | Free  |
| Hosting BE | Render.com                          | Free  |

## Project Structure

```
TourAndTravel/
├── backend/          # Node.js + Express API
│   ├── config/       # DB connection
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth, role guards
│   ├── models/       # Mongoose schemas
│   └── routes/       # API endpoints
├── frontend/         # React + Vite app
│   └── src/
│       ├── components/  # Reusable UI
│       ├── context/     # Auth state
│       └── pages/       # Route pages
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Razorpay account (free, test mode available)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB URI and Razorpay keys
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/tourtravel
JWT_SECRET=your_super_secret_key_here
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

## User Roles

| Role      | Capabilities |
|-----------|-------------|
| Admin     | Manage buses, routes, drivers; view all bookings; manage seat layout |
| Driver    | View assigned routes; update bus location |
| Traveller | Search buses; select seats; book & pay; view booking history |

## Deployment (Free)

1. **MongoDB Atlas** → Create free cluster → copy connection string
2. **Render.com** → Deploy backend → add environment variables
3. **Vercel** → Deploy frontend → set `VITE_API_URL` to Render backend URL

## Payment Gateway

Razorpay is used because:
- No setup fees
- No monthly charges
- ~2% transaction fee (lowest in India)
- Test mode available for development
- UPI, Cards, Net Banking, Wallets all supported

---
Built with care for Indian travellers.
