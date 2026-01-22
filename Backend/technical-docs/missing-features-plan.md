# Missing Features Implementation Plan

This plan covers remaining backend features with schema changes, endpoints, validation, and testing notes.

## 1) Coupons
**Schema**
- `Coupon`: `code`, `user_id`, `discount_type` (flat/percent), `value`, `min_order`, `expires_at`, `is_active`, `usage_limit`, `used_count`.

**APIs**
- `POST /api/v1/coupons` (admin)
- `GET /api/v1/coupons/:userId`
- `POST /api/v1/coupons/apply`

**Validation**
- Code unique, not expired, user matches, min_order met, usage_limit not exceeded.

**Tests**
- Apply valid coupon reduces total; expired coupon rejected.

## 2) Inventory
**Schema**
- Extend product variants with `stock_qty` (done).
- Optional `InventoryLog`: `product_id`, `variant_id`, `delta`, `reason`, `created_by`.

**APIs**
- `PUT /api/v1/inventory/adjust` (admin)
- `GET /api/v1/inventory/summary`

**Validation**
- `delta` non-zero; cannot reduce below zero.

**Tests**
- Adjust stock updates product; out-of-stock hidden.

## 3) Locate v1 Counters
**Schema**
- Reuse existing Counter model.

**API**
- `GET /api/v1/counters` (public)

**Validation**
- None required.

## 4) Reviews/Comments
**Schema**
- `Review`: `user_id`, `product_id`, `rating`, `comment`, `status` (pending/approved/rejected).

**APIs**
- `POST /api/v1/reviews`
- `GET /api/v1/reviews/:productId`
- `GET /api/v1/reviews/pending` (admin)
- `PATCH /api/v1/reviews/:id/approve` (admin)

**Validation**
- Only users who purchased can review.

**Tests**
- Reject review if no completed order.

## 5) Admin Monitoring
**Schema**
- Use existing Order/Payment fields.

**APIs**
- `GET /api/v1/admin/monitoring/payments?status=failed`
- `GET /api/v1/admin/monitoring/cod`

**Validation**
- Admin auth required.

## 6) Refunds/Returns
**Schema**
- `Refund`: `order_id`, `user_id`, `reason`, `status`, `amount`, `processed_at`.

**APIs**
- `POST /api/v1/refunds`
- `GET /api/v1/refunds/:orderId`

**Validation**
- Only paid orders eligible.

## 7) Agent Commissions
**Schema**
- `CommissionLedger`: `agent_id`, `order_id`, `amount`, `status` (pending/paid).

**APIs**
- `GET /api/v1/agents/:id/commissions`
- `POST /api/v1/agents/:id/payouts`

**Validation**
- Admin only.

## 8) Response Whitelisting
**Schema**
- None.

**APIs**
- Update existing responses to return only required fields.

**Tests**
- Ensure PII not returned in public endpoints.
