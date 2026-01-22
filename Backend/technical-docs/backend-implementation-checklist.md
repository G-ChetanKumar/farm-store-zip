# Backend Implementation Checklist (Pin-to-Pin)

This is a file-by-file, endpoint-by-endpoint plan aligned to PRD requirements and current code.

## A) Auth + User Types

### A1) User Model
- File: `Project/farm-e-store-backend-main/models/UserModel.js`
- Add fields: `farmestore_id`, `gstin`, `license_number`, `license_doc_url`, `agent_code`, `otp_last_sent_at`, `otp_attempts`.
- Add indexes: `mobile`, `email`, `farmestore_id`, `user_type`.

### A2) OTP Model
- New file: `Project/farm-e-store-backend-main/models/OtpModel.js`
- Fields: `user_id`, `otp_hash`, `expires_at`, `attempts`, `verified`.
- TTL index on `expires_at`.

### A3) Auth Controller + Routes
- New routes: `Project/farm-e-store-backend-main/routes/AuthRoutes.js`
- New controller: `Project/farm-e-store-backend-main/controllers/AuthController.js`
- Endpoints:
  - `POST /api/v1/auth/request-otp`
  - `POST /api/v1/auth/verify-otp`
  - `POST /api/v1/auth/resend-otp`
  - `POST /api/v1/auth/complete-profile`
- Rules:
  - OTP TTL 5 minutes, max 5 attempts, resend cooldown 30 seconds.
  - Generate Farm E-Store ID: `FES` + `B2C|B2B|B2A` + last 4 digits of mobile.

### A4) Enforce Activation
- File: `Project/farm-e-store-backend-main/controllers/UserController.js`
- Block login if `status !== active` for Agent/Retailer.
- Allow Farmer auto-activation policy (confirm decision).

## B) Product Pricing & Variants

### B1) Product Model
- File: `Project/farm-e-store-backend-main/models/ProductModel.js`
- Add: `agent_commission_type`, `agent_commission_value`.
- Add stock fields per variant (`stock_qty` or `in_stock`).
- Optional: add product-level `total_stock` for faster sold-out computation.

### B2) Product Controller (Role-Resolved Variants)
- File: `Project/farm-e-store-backend-main/controllers/ProductController.js`
- Update list and detail endpoints to resolve variants by role.
- Filter out-of-stock items at API level.
- Compute and return `is_sold_out` based on `total_stock` or sum of variant `stock_qty`.

### B3) Product Routes
- File: `Project/farm-e-store-backend-main/routes/ProductRoute.js`
- Add query params for filtering/sorting:
  - `sort`, `filters`, `price_range`, `rating`, `brand`, `category`, etc.

## C) Orders & Payments

### C1) Order Model
- File: `Project/farm-e-store-backend-main/models/OrderModel.js`
- Add:
  - `role`, `delivery_mode`, `payment_method`
  - `price_snapshot[]` with `variant_id`, `unit_price`, `original_price`, `commission`
  - `cod_partial_amount` for COD 10% rule

### C2) Order Controller
- File: `Project/farm-e-store-backend-main/controllers/OrderContoller.js`
- Create order should store snapshot and role metadata.
- Enforce COD part-payment rule if payment_method=COD.

## D) Membership & Kisan Cash

### D1) Models
- New: `MembershipPlanModel.js`, `MembershipSubscriptionModel.js`
- New: `KisanCashTransactionModel.js`

### D2) Controllers & Routes
- Add routes for:
  - membership plans
  - purchase/activate membership
  - kisan cash ledger + redeem

### D3) Business Rules
- Credits usable only up to 50% of order value.
- Membership conflicts to resolve (plans/prices/validity).

## E) Coupons

### E1) Model
- New: `CouponModel.js` with user-scoped coupons.

### E2) Controller + Routes
- Add coupon CRUD and validation endpoints.
- Apply coupon during checkout.

## F) Locate / Counters

### F1) Counter Model Usage
- File: `Project/farm-e-store-backend-main/models/CounterModel.js`
- Ensure store/counter data is exposed via API.

### F2) Routes
- Add `GET /api/v1/counters` for locate screen.

## G) Inventory & Billing

### G1) Inventory Fields
- Store stock per variant in product.

### G2) Billing/Inventory APIs
- Define endpoints (scope TBD) for inventory adjustments and billing export.

## H) Security & Observability

### H1) Middleware
- Add `helmet`, `cors` allowlist, and rate-limiting.
- Add request correlation IDs and structured logging.

### H2) Validation
- Add zod/joi validators to all request bodies.

### H3) JWT
- Short TTL access token + refresh rotation.

## I) OpenAPI + Docs
- Update `technical-docs/api-contracts/openapi.yaml` via code annotations.
- Update docs on any behavior change.

---

## Decisions Needed
- Membership plan pricing/cashback/validity conflicts between PDFs.
- Farmer auto-activation policy.
- COD partial payment flow details.
