#!/bin/bash
# =====================================================
# Curl Test Commands for Admin API Endpoints
# =====================================================
# Run these after starting the backend server on port 5004
# First login as admin to get the JWT token:
# =====================================================

# --- LOGIN AS ADMIN ---
TOKEN=$(curl -s -X POST http://localhost:5004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bmaart.com","password":"admin123"}' | jq -r '.data.accessToken')

echo "Token: $TOKEN"

# =====================================================
# 1. SETTINGS API
# =====================================================

# GET all settings (admin only)
curl -s http://localhost:5004/api/settings \
  -H "Authorization: Bearer $TOKEN" | jq .

# GET public settings (no auth needed)
curl -s http://localhost:5004/api/settings/public | jq .

# UPDATE settings
curl -s -X PUT http://localhost:5004/api/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "storeName": "Bikroy-Mart-BD",
    "storePhone": "16469",
    "storeEmail": "info@bmaart.com",
    "freeDeliveryMinimum": "1500",
    "defaultDeliveryCharge": "60"
  }' | jq .

# =====================================================
# 2. ANALYTICS API
# =====================================================

# GET admin stats
curl -s http://localhost:5004/api/analytics/stats \
  -H "Authorization: Bearer $TOKEN" | jq .

# GET sales trend (last 30 days)
curl -s "http://localhost:5004/api/analytics/sales-trend?days=30" \
  -H "Authorization: Bearer $TOKEN" | jq .

# GET orders by status
curl -s http://localhost:5004/api/analytics/orders-by-status \
  -H "Authorization: Bearer $TOKEN" | jq .

# GET top categories
curl -s http://localhost:5004/api/analytics/top-categories \
  -H "Authorization: Bearer $TOKEN" | jq .

# GET revenue by district
curl -s http://localhost:5004/api/analytics/revenue-by-district \
  -H "Authorization: Bearer $TOKEN" | jq .

# GET recent orders
curl -s "http://localhost:5004/api/analytics/recent-orders?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq .

# =====================================================
# 3. USER MANAGEMENT API
# =====================================================

# GET all users
curl -s http://localhost:5004/api/users \
  -H "Authorization: Bearer $TOKEN" | jq .

# GET single user (replace USER_ID with actual user id)
curl -s http://localhost:5004/api/users/USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

# UPDATE user details
curl -s -X PUT http://localhost:5004/api/users/USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","phone":"01712345678"}' | jq .

# CHANGE user role
curl -s -X PUT http://localhost:5004/api/users/USER_ID/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"MANAGER"}' | jq .

# BLOCK user
curl -s -X PUT http://localhost:5004/api/users/USER_ID/block \
  -H "Authorization: Bearer $TOKEN" | jq .

# UNBLOCK user
curl -s -X PUT http://localhost:5004/api/users/USER_ID/unblock \
  -H "Authorization: Bearer $TOKEN" | jq .

# DELETE user (cannot delete admin)
curl -s -X DELETE http://localhost:5004/api/users/USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

# =====================================================
# 4. BANNER API (already existed, enhanced)
# =====================================================

# GET all banners (including inactive)
curl -s "http://localhost:5004/api/banners?all=true" \
  -H "Authorization: Bearer $TOKEN" | jq .

# GET hero banners (public)
curl -s "http://localhost:5004/api/banners?position=hero" | jq .

# CREATE banner with new fields
curl -s -X POST http://localhost:5004/api/banners \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mega Sale",
    "subtitle": "Up to 50% off",
    "image": "https://example.com/banner.jpg",
    "link": "/shop",
    "position": "hero",
    "bgColor": "from-[#EC008C] to-[#D60071]",
    "sortOrder": 1
  }' | jq .
