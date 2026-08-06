# Bikroy-Mart-BD

Next-Gen E-Commerce & Live Tracking Platform for Bangladesh

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, Redux Toolkit, Leaflet
- **Backend**: Express.js 5, TypeScript, PostgreSQL (Prisma ORM), Socket.IO
- **Payments**: SSLCommerz

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb bikroy_mart_bd
```

### 2. Backend
```bash
cd backend
cp .env.example .env  # Update DATABASE_URL and other configs

npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

npm run dev
# API runs on http://localhost:5004
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

## Default Users (after seeding)
- **Admin**: admin@bmaart.com / admin123

## Features

### 4 Panels
1. **Customer** - Shop, Cart, Checkout, Order Tracking
2. **Admin** - Dashboard, Products, Orders, Riders, Managers, Analytics
3. **Manager** - Zila-based product/order management
4. **Rider** - Active deliveries, GPS tracking, history

### Key Features
- Shwapno-style grocery UI (White + Blue theme)
- Category mega menu
- Flash deals with countdown timer
- Trust badges (60-min delivery, etc.)
- Custom Requirement button (অতিরিক্ত চাহিদা)
- Live GPS rider tracking (Leaflet + OpenStreetMap)
- SSLCommerz payment integration
- Socket.IO real-time updates
- Location-based product visibility
