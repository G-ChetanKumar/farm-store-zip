# API Gap Matrix (Existing vs Needed)

This matrix lists current APIs, required modifications, and new APIs to be built based on PRD and current code.

## 1) Existing APIs (Current)

### Users
- `POST /user/add-user` (create user)
- `POST /user/login` (login)
- `GET /user/get-users`
- `GET /user/get-user/:id`
- `PUT /user/update-user/:id`
- `DELETE /user/delete-user/:id`

### Products
- `POST /product/add-product`
- `GET /product/get-products`
- `GET /product/get-product/:id`
- `PUT /product/update-product/:id`
- `DELETE /product/delete-product/:id`

### Categories/Subcategories
- `POST /category/add-category`
- `GET /category/get-category`
- `PUT /category/update-category/:id`
- `DELETE /category/delete-category/:id`
- Similar for subcategories and super categories

### Brand/Crop/Pest
- CRUD routes exist

### Orders
- `POST /order/add-order`
- `GET /order/get-orders`
- `GET /order/get-order/:id`
- `PUT /order/update-order/:id`
- `DELETE /order/delete-order/:id`

### Entrepreneurs/Counters
- Entrepreneur CRUD
- Counter CRUD

## 2) APIs to Modify

### Users
- `POST /user/login`
  - Enforce `status=active` for Agent/Retailer
  - Replace or deprecate in favor of OTP flow
- `GET/PUT /user/me`
  - Fetch/update current user profile
- Address APIs
  - `POST /api/v1/addresses`
  - `GET /api/v1/addresses`
  - `PUT /api/v1/addresses/:id`
  - `DELETE /api/v1/addresses/:id`
  - `PATCH /api/v1/addresses/:id/default`
- Cart APIs
  - `GET /api/v1/cart`
  - `PUT /api/v1/cart`
  - `POST /api/v1/cart/items`
  - `DELETE /api/v1/cart/items/:itemIndex`
  - `DELETE /api/v1/cart/clear`

### Products
- `GET /product/get-products`
  - Add role-based pricing resolution
  - Add filtering/sorting parameters
  - Hide out-of-stock
- Add delivery speed filter (30-45 min, same day, tomorrow, within 3 days, within 1 week).
- Add filters for formulation, usage method, discount band, rating.
- `GET /product/get-product/:id`
  - Return role-resolved variants

### Orders
- `POST /order/add-order`
  - Store price snapshot and role info
  - Support COD part-payment
- Add `address_id` for delivery.
- Server-side pricing and payment verification:
  - `POST /api/v1/payments/create-order` (server computes payable amount)
  - `POST /api/v1/payments/webhook` (verify gateway signature)
  - Idempotency key required for order creation

## 3) New APIs to Build

### Auth (OTP)
- `POST /api/v1/auth/request-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/resend-otp`
- `POST /api/v1/auth/complete-profile`

### Membership
- `POST /api/v1/membership/plans`
- `GET /api/v1/membership/plans`
- `POST /api/v1/membership/subscribe`
- `GET /api/v1/membership/subscription/:userId`

### Kisan Cash Credits
- `GET /api/v1/credits/ledger/:userId`
- `POST /api/v1/credits/redeem`
- `POST /api/v1/credits/earn`

### Coupons
- `POST /api/v1/coupons`
- `GET /api/v1/coupons/:userId`
- `POST /api/v1/coupons/apply`

### Locate / Counters
- `GET /api/v1/counters`

### Inventory
- `PUT /api/v1/inventory/adjust`
- `GET /api/v1/inventory/summary`

### Admin Controls
- `PATCH /api/admin/users/:id/block`
- `PATCH /api/admin/users/:id/unblock`
- `GET /api/admin/users/:id/cart` (user + cart + last payment status)

## 4) Notes
- API versioning required: `/api/v1/...` for new endpoints.
- Existing endpoints should be migrated or wrapped behind versioned paths.
- OpenAPI spec should be generated and stored in `technical-docs/api-contracts/openapi.yaml`.

## 5) New API Specifications (Request/Response + Dependencies)

### Auth (OTP)

#### `POST /api/v1/auth/request-otp`
Request:
```json
{ "mobile": "9010189891", "user_type": "Farmer" }
```
Response:
```json
{ "success": true, "data": { "otp_sent": true, "resend_after_sec": 30 } }
```
Dependencies:
- SMS provider (e.g., Twilio, MSG91, AWS SNS)
- Redis (rate limiting, resend cooldown)

#### `POST /api/v1/auth/verify-otp`
Request:
```json
{ "mobile": "9010189891", "otp": "123456" }
```
Response:
```json
{ "success": true, "data": { "token": "<access_token>", "user": { "id": "...", "status": "active" } } }
```
Dependencies:
- OTP hash store (Mongo or Redis)
- JWT signing keys

#### `POST /api/v1/auth/resend-otp`
Request:
```json
{ "mobile": "9010189891" }
```
Response:
```json
{ "success": true, "data": { "otp_sent": true, "resend_after_sec": 30 } }
```
Dependencies:
- SMS provider
- Rate limiter

#### `POST /api/v1/auth/complete-profile`
Request:
```json
{
  "name": "Kamal",
  "email": "kamal@example.com",
  "mobile": "9010189891",
  "user_type": "Agri-Retailer",
  "gstin": "29ABCDE1234F1Z5",
  "license_number": "LIC-123"
}
```
Response:
```json
{ "success": true, "data": { "farmestore_id": "FESB2B9891", "status": "pending" } }
```
Dependencies:
- User model updates
- Admin approval flow for retailers/agents

### Addresses

#### `POST /api/v1/addresses`
Request:
```json
{ "label": "Home", "line1": "Street 1", "city": "Madanapalle", "state": "AP", "postal_code": "517325", "is_default": true }
```
Response:
```json
{ "success": true, "data": { "id": "addr_1" } }
```
Dependencies:
- Address model

### Membership

#### `POST /api/v1/membership/plans`
Request:
```json
{ "name": "Gold", "price": 179, "cashback_percent": 8, "validity_purchases": 10, "validity_days": 70 }
```
Response:
```json
{ "success": true, "data": { "id": "plan_123" } }
```
Dependencies:
- MembershipPlan model
- Admin auth

#### `GET /api/v1/membership/plans`
Response:
```json
{ "success": true, "data": [ { "id": "plan_123", "name": "Gold", "price": 179 } ] }
```

#### `POST /api/v1/membership/subscribe`
Request:
```json
{ "user_id": "user_1", "plan_id": "plan_123", "payment_method": "razorpay" }
```
Response:
```json
{ "success": true, "data": { "subscription_id": "sub_123", "status": "active" } }
```
Dependencies:
- Payment gateway

#### `GET /api/v1/membership/subscription/:userId`
Response:
```json
{ "success": true, "data": { "plan_name": "Gold", "purchases_left": 8, "expires_at": "2025-12-23" } }
```

### Kisan Cash Credits

#### `GET /api/v1/credits/ledger/:userId`
Response:
```json
{ "success": true, "data": { "earned": 235, "redeemed": 15, "available": 220, "transactions": [] } }
```
Dependencies:
- Credits ledger model

#### `POST /api/v1/credits/redeem`
Request:
```json
{ "user_id": "user_1", "order_id": "order_1", "amount": 50 }
```
Response:
```json
{ "success": true, "data": { "available": 170 } }
```
Dependencies:
- Membership validation (only members)
- 50% of order cap rule

#### `POST /api/v1/credits/earn`
Request:
```json
{ "user_id": "user_1", "order_id": "order_1", "amount": 10 }
```
Response:
```json
{ "success": true, "data": { "available": 180 } }
```

### Coupons

#### `POST /api/v1/coupons`
Request:
```json
{ "code": "SAVE50", "user_id": "user_1", "discount_type": "flat", "value": 50, "expires_at": "2025-12-31" }
```
Response:
```json
{ "success": true, "data": { "id": "coupon_123" } }
```
Dependencies:
- Coupon model
- Admin auth

#### `GET /api/v1/coupons/:userId`
Response:
```json
{ "success": true, "data": [ { "code": "SAVE50", "value": 50 } ] }
```

#### `POST /api/v1/coupons/apply`
Request:
```json
{ "user_id": "user_1", "code": "SAVE50", "order_total": 500 }
```
Response:
```json
{ "success": true, "data": { "discount": 50, "new_total": 450 } }
```

### Locate / Counters

#### `GET /api/v1/counters`
Response:
```json
{ "success": true, "data": [ { "name": "Farm E-Store", "location": "Madanapalle" } ] }
```
Dependencies:
- Counter model

### Inventory

#### `PUT /api/v1/inventory/adjust`
Request:
```json
{ "product_id": "prod_1", "variant_id": "var_1", "delta": -5, "reason": "order" }
```
Response:
```json
{ "success": true, "data": { "stock_qty": 20 } }
```
Dependencies:
- Inventory fields on variants
- Admin/role guard

#### `GET /api/v1/inventory/summary`
Response:
```json
{ "success": true, "data": [ { "product_id": "prod_1", "variant_id": "var_1", "stock_qty": 20 } ] }
```
