# Role-Based Backend Gap Audit

This document maps required role flows to current backend coverage and highlights gaps.

## Farmer (B2C)
### Auth & Profile
- OTP login: Implemented (`/api/v1/auth/*`)
- Profile update: Implemented (`/api/user/me`)
- Address book: Implemented (`/api/v1/addresses/*`)
### Browse & Search
- Product list: Implemented (`/api/product/get-product`)
- Filters/sort: Implemented (query params: price, rating, delivery_speed, stock, etc.)
- Full-text search across products: Partial (title/sub_title/technical_name)
- Related products / buy-together: Missing (no API)
### Pricing
- Role-based pricing: Missing (retail vs B2B vs agent not resolved)
### Cart & Checkout
- Cart storage: Implemented (`/api/v1/cart/*`)
- COD rule (10%): Implemented in payment create-order
- Payment verification: Implemented (webhook + server-calculated totals)
### Orders
- Order snapshot/role fields: Partial (model updated, create flow still legacy)
### Reviews/Comments
- Post-review if purchased: Missing

## Agri-Retailer (B2B)
### Auth & Approval
- Admin-created user: Implemented (`/api/admin/users`)
- OTP login: Implemented
- Auto-activation on first OTP: Implemented (current behavior)
- Admin approval gate: Missing (if required by policy)
### Pricing
- Wholesale price view: Missing (not resolved in product APIs)
### Cart & Checkout
- Same as Farmer; role-specific pricing not enforced
### Orders
- Same as Farmer; order snapshot not enforced in creation

## Agent (B2A)
### Auth & Approval
- Admin-created user: Implemented
- OTP login: Implemented
- Auto-activation on first OTP: Implemented
- Admin approval gate: Missing (if required by policy)
### Pricing & Commission
- Commission-based pricing: Missing (not resolved in product APIs)
- Commission snapshot in orders: Missing (not enforced in creation)

## Admin
### Users
- Create users: Implemented
- Approve/reject/block: Implemented
- List/filter users: Implemented
### Products
- CRUD: Implemented
- Image sequence: Implemented
- Stock/delivery_speed fields: Implemented
### Locations / Counters
- CRUD: Implemented (legacy `/api/counter/*`)
- Versioned locate API: Missing (`/api/v1/counters`)
### Monitoring
- User cart & last payment status: Implemented (`/api/admin/users/:id/cart`)
- Failed payments list: Missing
- COD monitoring: Missing
### Orders
- CRUD (legacy): Implemented
- Hardened create flow (snapshot/idempotency): Partial (payments create-order exists; order create still legacy)

## Cross-Cutting Gaps
- Role-based pricing resolution across products/cart/order
- Order creation should use server-side pricing snapshot (not client totals)
- Coupons APIs and data model
- Inventory endpoints (`/api/v1/inventory/*`)
- Reviews/comments APIs with “purchased only” guard
- Versioned counters API (`/api/v1/counters`)
- Admin analytics endpoints (failed payments, COD status, commission ledger)

## Recommendations (Next)
1) Enforce role-based pricing in product APIs + order creation snapshot.
2) Replace legacy order create flow with payment-backed create-order.
3) Add coupons + inventory endpoints.
4) Add reviews/comments with purchase validation.

## Missing APIs Summary
- Role-based pricing resolution endpoints (or enhancements to product list/detail).
- Order creation with enforced price snapshots (server-side only).
- Coupons: `POST /api/v1/coupons`, `GET /api/v1/coupons/:userId`, `POST /api/v1/coupons/apply`.
- Inventory: `PUT /api/v1/inventory/adjust`, `GET /api/v1/inventory/summary`.
- Locate (versioned): `GET /api/v1/counters`.
- Reviews/Comments with purchase validation.
- Admin monitoring: failed payments list, COD payment tracking, commission ledger.
