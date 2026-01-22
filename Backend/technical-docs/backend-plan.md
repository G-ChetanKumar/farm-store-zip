# Backend Plan (OTP, Pricing Consistency, Security)

This plan is backend-first and aligned to the extracted PRD requirements.

## 1) OTP Authentication
- OTP request/verify endpoints with resend cooldown (30 seconds).
- Store OTP hashes with expiry and attempt counters.
- Enforce `status=active` for login and role approval flows.
- Generate Farm E-Store ID on registration using `FES` + role + last 4 digits.

## 2) Role Verification & Activation
- Agri-Retailer: require GST/license fields; admin approval gate.
- Agent: admin approval gate.
- Farmer: default active unless restricted by policy.

## 3) Pricing Consistency
- Normalize product variants for retail and B2B.
- Return role-resolved variants in product APIs.
- Store price snapshots in orders (unit price, original price, role, commission).
- Track commission type/value on product.

## 4) Orders & Payments
- Add delivery mode and payment method fields.
- Support COD part-payment (10% upfront) in order schema.
- Store commission snapshots for agents.

## 5) Credits, Membership, Coupons
- Create models and APIs for:
  - Membership plans (pricing + benefits + purchase-limit rules).
  - Kisan Cash credits ledger (earned/redeemed/available).
  - Coupon generation for specific users.

## 6) Inventory & Availability
- Add stock fields to product variants.
- Add optional `total_stock` on product to allow quick "sold out" checks.
- Hide out-of-stock products at API level.
- Define inventory/billing endpoints (scope TBD).

## 7) Security
- Rate limit OTP/login routes.
- Input validation at the edge.
- JWT short TTL + refresh token rotation.
- Structured logs with correlation IDs.

## 8) Validation Rules (Auth/User)
- `mobile` must be 10-15 digits.
- `user_type` must be Farmer/Agri-Retailer/Agent.
- `email` must be valid format when provided.
- Blocked users are denied login/OTP.

## 9) Validation Rules (Cart/Payments)
- Cart items require valid `product_id` (ObjectId) and `qty > 0`.
- Optional `variant_id` must be valid ObjectId.
- Payment create-order requires `Idempotency-Key`, `items[]`, and valid `payment_method`.

## 10) Validation Rules (Products)
- `delivery_speed` must be one of: 30-45 min, same day, tomorrow, within 3 days, within 1 week.
- `sort` must be one of: price_low, price_high, rating, az, za.
- `in_stock` must be true/false when provided.

## 11) Validation Rules (Admin)
- Admin auth required to create admins and manage users.
- `status` must be one of: pending, active, rejected, blocked.
- `user_type` must be Farmer/Agri-Retailer/Agent.

## 12) Validation Rules (Membership/Credits)
- Membership plan price/cashback/validity values must be positive numbers.
- Credits earn/redeem amounts must be positive numbers.
- Credits redeem requires active membership and 50% of order total cap.

## 13) Payment Rules (COD)
- COD requires 10% part payment (`cod_partial_amount`).

## 14) OTP Rules
- Only one active OTP per user; new OTP invalidates previous OTPs.
