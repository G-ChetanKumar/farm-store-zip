# Authentication & Authorization Guide

## Overview
This document provides a comprehensive guide to the authentication and authorization implementation in the Farm Backend API.

## Authentication Flows

### 1. OTP-Based Authentication (Primary Flow)
Used for mobile-based user authentication (Farmers, Agri-Retailers, Agents).

#### Flow:
1. **Request OTP** - `POST /api/v1/auth/request-otp`
   - Body: `{ mobile, user_type }`
   - Sends OTP via SMS (MSG91 integration)
   - Creates user record if Farmer (other types require admin creation)
   
2. **Verify OTP** - `POST /api/v1/auth/verify-otp`
   - Body: `{ mobile, otp }`
   - Returns JWT token on success
   - Token expires in 15 minutes

3. **Complete Profile** - `POST /api/v1/auth/complete-profile`
   - Body: `{ mobile, name, email, user_type, gstin, license_number, etc. }`
   - Required after first OTP verification
   - Agri-Retailers/Agents require admin approval

### 2. Email/Password Authentication
Used for existing users with password credentials.

#### Login Endpoint - `POST /api/user/login`
- Body: `{ email, password }`
- Returns JWT token (expires in 1 hour)

### 3. Admin Authentication
Separate authentication flow for admin users.

#### Admin Login - `POST /api/admin/admin-login`
- Body: `{ email, password }`
- Returns admin JWT token
- Uses separate JWT secret (`ADMIN_JWT_SECRET`)

## Authorization Middlewares

### 1. User Auth Middleware (`auth`)
**File:** `middlewares/Auth.js`

**Usage:**
```javascript
const auth = require("../middlewares/Auth");
router.get("/protected-route", auth, controller.method);
```

**Validates:**
- JWT token in `Authorization` header (Bearer token)
- Token signed with `jwtSecret`
- Adds `req.user` (userId) and `req.user_type` to request

### 2. Admin Auth Middleware (`adminAuth`)
**File:** `middlewares/AdminAuth.js`

**Usage:**
```javascript
const adminAuth = require("../middlewares/AdminAuth");
router.post("/admin-route", adminAuth, controller.method);
```

**Validates:**
- JWT token in `Authorization` header (Bearer token)
- Token signed with `ADMIN_JWT_SECRET`
- Adds `req.admin_id` to request

## Protected Routes Summary

### User Routes (Auth Required)
| Endpoint | Method | Middleware | Description |
|----------|--------|------------|-------------|
| `/api/user/me` | GET | `auth` | Get current user profile |
| `/api/user/me` | PUT | `auth` | Update current user profile |
| `/api/user/user-stats` | GET | `auth` | Get user statistics (NEW) |
| `/api/user/get-user` | GET | `auth` | Get all users |
| `/api/user/get-user-by-id/:id` | GET | `auth` | Get user by ID |
| `/api/user/update-user/:id` | PUT | `auth` | Update user (admin or self) |
| `/api/user/delete-user/:id` | DELETE | `auth` | Delete user (admin only) |

### Order Routes (Auth Required)
| Endpoint | Method | Middleware |
|----------|--------|------------|
| `/api/order/add-order` | POST | `auth` |
| `/api/order/get-orders` | GET | `auth` |
| `/api/order/get-order-by-id/:id` | GET | `auth` |
| `/api/order/update-order/:id` | PUT | `auth` |
| `/api/order/delete-order/:id` | DELETE | `auth` |

### Cart Routes (Auth Required)
| Endpoint | Method | Middleware |
|----------|--------|------------|
| `/api/v1/cart/` | GET | `auth` |
| `/api/v1/cart/` | PUT | `auth` |
| `/api/v1/cart/items` | POST | `auth` |
| `/api/v1/cart/items/:itemIndex` | DELETE | `auth` |
| `/api/v1/cart/clear` | DELETE | `auth` |

### Address Routes (Auth Required)
| Endpoint | Method | Middleware |
|----------|--------|------------|
| `/api/v1/addresses/` | POST | `auth` |
| `/api/v1/addresses/` | GET | `auth` |
| `/api/v1/addresses/:id` | PUT | `auth` |
| `/api/v1/addresses/:id` | DELETE | `auth` |
| `/api/v1/addresses/:id/default` | PATCH | `auth` |

### Payment Routes (Auth Required)
| Endpoint | Method | Middleware |
|----------|--------|------------|
| `/api/v1/payments/create-order` | POST | `auth` |

### Membership Routes
| Endpoint | Method | Middleware |
|----------|--------|------------|
| `/api/v1/membership/plans` | POST | `adminAuth` |
| `/api/v1/membership/plans` | GET | Public |
| `/api/v1/membership/subscribe` | POST | `auth` |
| `/api/v1/membership/subscription/:userId` | GET | `auth` |

### Kisan Cash Routes
| Endpoint | Method | Middleware |
|----------|--------|------------|
| `/api/v1/credits/ledger/:userId` | GET | `auth` |
| `/api/v1/credits/earn` | POST | `adminAuth` |
| `/api/v1/credits/redeem` | POST | `adminAuth` |

### Coupon Routes
| Endpoint | Method | Middleware |
|----------|--------|------------|
| `/api/v1/coupons/` | POST | `adminAuth` |
| `/api/v1/coupons/:userId` | GET | `auth` |
| `/api/v1/coupons/apply` | POST | `auth` |

### Admin-Only Routes (AdminAuth Required)

#### Catalog Management
All create, update, delete operations require `adminAuth`:

**Product Routes:**
- `POST /api/product/add-product`
- `PUT /api/product/update-product/:id`
- `DELETE /api/product/delete-product/:id`

**Category Routes:**
- `POST /api/category/add-category`
- `PUT /api/category/update-category/:id`
- `DELETE /api/category/delete-category/:id`

**SubCategory Routes:**
- `POST /api/subcategory/add-sub-category`
- `PUT /api/subcategory/update-sub-category/:id`
- `DELETE /api/subcategory/delete-sub-category/:id`

**SuperCategory Routes:**
- `POST /api/super-category/add-super-category`
- `PUT /api/super-category/update-super-category/:id`
- `DELETE /api/super-category/delete-super-category/:id`

**Brand Routes:**
- `POST /api/brand/add-brand`
- `PUT /api/brand/update-brand/:id`
- `DELETE /api/brand/delete-brand/:id`

**Crop Routes:**
- `POST /api/crop/add-crop`
- `PUT /api/crop/update-crop/:id`
- `DELETE /api/crop/delete-crop/:id`

**Pest Routes:**
- `POST /api/pest/add-pest`
- `PUT /api/pest/update-pest/:id`
- `DELETE /api/pest/delete-pest/:id`

**Counter Routes:**
- `POST /api/counter/add-counter`
- `PUT /api/counter/update-counter/:id`
- `DELETE /api/counter/delete-counter/:id`

#### User Management
**Entrepreneur Routes:**
- `POST /api/entrepreneur/add-entrepreneur`
- `GET /api/entrepreneur/get-entrepreneurs`
- `PUT /api/entrepreneur/update-entrepreneur/:id`

#### Admin Routes
- `POST /api/admin/admin-register` - Register new admin
- `GET /api/admin/users/pending` - Get pending user approvals
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id/cart` - Get user cart & payment
- `PATCH /api/admin/users/:id/approve` - Approve user
- `PATCH /api/admin/users/:id/reject` - Reject user
- `PATCH /api/admin/users/:id/block` - Block user
- `PATCH /api/admin/users/:id/unblock` - Unblock user
- `POST /api/admin/users` - Create user by admin

## Public Routes (No Auth Required)

### Catalog Browsing
- `GET /api/product/get-product` - List all products
- `GET /api/product/get-id-product/:id` - Get product by ID
- `GET /api/category/get-category` - List categories
- `GET /api/subcategory/get-sub-category` - List subcategories
- `GET /api/super-category/get-super-category` - List super categories
- `GET /api/brand/get-brand` - List brands
- `GET /api/crop/get-crops` - List crops
- `GET /api/pest/get-pests` - List pests
- `GET /api/counter/get-counters` - List counters

### Membership
- `GET /api/v1/membership/plans` - List membership plans

### Admin
- `POST /api/admin/admin-login` - Admin login
- `PATCH /api/admin/admin-update/:id` - Update admin
- `GET /api/admin/get-admin` - Get admin by ID

### User
- `POST /api/user/add-user` - User registration (Farmers only)
- `POST /api/user/login` - User login

### Authentication
- `POST /api/v1/auth/request-otp` - Request OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/resend-otp` - Resend OTP
- `POST /api/v1/auth/complete-profile` - Complete user profile

### Payment Webhooks
- `POST /api/v1/payments/webhook` - Payment webhook (no auth)
- `POST /api/razorpay/create-razorpay-order` - Create Razorpay order
- `POST /api/razorpay/verify-razorpay-payment` - Verify payment

## Environment Variables

Required environment variables for authentication:

```env
# JWT Secrets
JWT_SECRET=your-user-jwt-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret

# OTP Configuration
MSG91_OTP_LENGTH=6
MSG91_OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SEC=30
OTP_REQUEST_WINDOW_MINUTES=60
OTP_REQUEST_MAX=5
OTP_HASH_SECRET=your-otp-hash-secret

# Other
SALT_ROUNDS=10
```

## Testing Authentication

### Using Postman/Curl

#### 1. User Login (OTP Flow)
```bash
# Request OTP
curl -X POST http://localhost:3000/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "user_type": "Farmer"}'

# Verify OTP
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "otp": "123456"}'
```

#### 2. User Login (Email/Password)
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

#### 3. Using Token
```bash
curl -X GET http://localhost:3000/api/user/user-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Admin Login
```bash
curl -X POST http://localhost:3000/api/admin/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

## Security Best Practices

1. **Token Expiry**: User tokens expire in 1 hour, OTP tokens in 15 minutes
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: OTP requests are rate-limited (5 requests per hour)
4. **Password Hashing**: Passwords are hashed using bcrypt with configurable salt rounds
5. **OTP Security**: OTPs are hashed before storage
6. **User Status**: Blocked and rejected users cannot authenticate
7. **Admin Separation**: Admin authentication uses separate JWT secret

## Common Issues & Solutions

### "No token, authorization denied"
- Ensure Authorization header is present: `Authorization: Bearer <token>`
- Token format must be: `Bearer <token>` (note the space)

### "Token is not valid"
- Token may have expired (user: 1h, OTP: 15min)
- Token may be for wrong environment (user vs admin)
- JWT secret may have changed

### "User not found" during OTP verification
- Ensure OTP was requested first
- Mobile number must match exactly

### "User access blocked"
- User status is "blocked" - contact admin
- Check `blocked_reason` field

## New Features Added

### User Stats Endpoint
**Endpoint:** `GET /api/user/user-stats`
**Requires:** User authentication (`auth` middleware)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "mobile": "9876543210",
      "user_type": "Farmer",
      "farmestore_id": "FESB2C3210",
      "status": "active"
    },
    "orders": {
      "total": 10,
      "pending": 2,
      "delivered": 8,
      "totalSpent": 15000
    },
    "cart": {
      "itemCount": 5
    },
    "addresses": {
      "count": 2
    },
    "kisanCash": {
      "balance": 500
    }
  }
}
```

This endpoint provides comprehensive user statistics including order history, cart status, addresses, and Kisan Cash balance.

---

**Last Updated:** 2026-01-07
**Author:** Development Team
