# Database Schema Changes (Planned)

## User
- Add `farmestore_id` (string, unique).
- Add role metadata fields:
  - Retailer: `gstin`, `license_number`, `license_doc_url`.
  - Agent: `agent_code` or `agent_region`.
- Add OTP tracking fields:
  - `otp_last_sent_at`, `otp_attempts`.
- Indexes:
  - `mobile`, `email`, `farmestore_id`, `user_type`.

## OTP
- New collection `Otp`:
  - `user_id`, `otp_hash`, `expires_at`, `attempts`, `verified`.
- TTL index on `expires_at`.

## Product
- Add `agent_commission_type` (percent/flat) and `agent_commission_value`.
- Add stock fields per variant (`stock_qty`).
- Optional product-level `total_stock` for fast sold-out checks.
- Add `delivery_speed` (30-45 min, same day, tomorrow, within 3 days, within 1 week).
- Add image `sequence` on each product image.
- Indexes:
  - `category_id`, `sub_category_id`, `brand_id`, `crop_id`, `pest_id`.

## Order
- Add `role`, `delivery_mode`, `payment_method`.
- Add `price_snapshot[]` with `variant_id`, `unit_price`, `original_price`, `commission`.
- Add `cod_partial_amount` for COD part payment.
- Add `address_id` for delivery.
- Add payment gateway fields: `gateway_order_id`, `gateway_payment_id`, `gateway_signature`, `payment_status`, `paid_at`.
- Add `price_snapshot_hash` and `idempotency_key`.
 - Add `razorpay_payment_status` and `transaction_id` if retaining legacy fields.
- Indexes:
  - `user_id`, `date`, `order_status`.

## Membership
- New collection `MembershipPlan` and `MembershipSubscription`.
- Store pricing, cashback %, GST, purchase limits, validity window.

## Credits (Kisan Cash)
- New ledger `KisanCashTransaction` with earned/redeemed/available.

## Coupons
- New `Coupon` with per-user scoping.

## Address
- New collection `Address` with `label`, `tag`, `line1/line2`, `city`, `state`, `postal_code`, `country`, `is_default`.

## Cart
- New collection `Cart` with `user_id` and `items[]` (`product_id`, `variant_id`, `qty`, `unit_price`, `original_price`, `commission`).
