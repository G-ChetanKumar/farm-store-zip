# Backend Tasks (with Sample Test Data)

## Scope
This checklist covers all remaining missing backend features plus test data for verification.

## Task Table

| Status | Task | Sample Test Data |
| --- | --- | --- |
| ☐ | Coupons: add schema + `POST /api/v1/coupons`, `GET /api/v1/coupons/:userId`, `POST /api/v1/coupons/apply` | `{ "code": "SAVE50", "user_id": "<userId>", "discount_type": "flat", "value": 50, "expires_at": "2025-12-31" }` |
| ☐ | Inventory: add `stock_qty` updates + `PUT /api/v1/inventory/adjust`, `GET /api/v1/inventory/summary` | `{ "product_id": "<prodId>", "variant_id": "<varId>", "delta": -5, "reason": "order" }` |
| ☐ | Versioned counters: `GET /api/v1/counters` (alias existing counter data) | n/a |
| ☐ | Reviews/Comments: add schema + endpoints with purchase validation | `{ "product_id": "<prodId>", "rating": 4, "comment": "Good quality" }` |
| ☐ | Admin monitoring: failed payments list, COD tracking, commission ledger | Query params: `status=failed`, `payment_method=cod` |
| ☐ | Response whitelisting: users/admins/products/cart/orders only return needed fields | n/a |
| ☐ | Order creation: replace legacy `/api/order/add-order` with snapshot-based create flow | Uses `/api/v1/payments/create-order` response |
| ☐ | Role-based pricing enforcement in cart/order (use server snapshot only) | `user_type=Agent` cart -> commission snapshot |
| ☐ | Shipment tracking: add shipment fields + `GET /api/v1/orders/:id/tracking` | `{ "carrier": "Delhivery", "tracking_id": "TRK123" }` |
| ☐ | Refunds/returns: add refund model + `POST /api/v1/refunds`, `GET /api/v1/refunds/:orderId` | `{ "order_id": "<orderId>", "reason": "Damaged" }` |
| ☐ | Reviews moderation (admin): `GET /api/v1/reviews/pending`, `PATCH /api/v1/reviews/:id/approve` | n/a |
| ☐ | Admin analytics: orders summary, payments status counts, COD vs prepaid | Query params: `from`, `to` |
| ☐ | Agent commission ledger/payouts: `GET /api/v1/agents/:id/commissions`, `POST /api/v1/agents/:id/payouts` | `{ "amount": 500, "method": "upi" }` |

## Example End-to-End Test Users

- Farmer (B2C): `{ "mobile": "919900000001", "user_type": "Farmer" }`
- Agri-Retailer (B2B): `{ "mobile": "919900000002", "user_type": "Agri-Retailer", "gstin": "29ABCDE1234F1Z5", "license_number": "LIC-123" }`
- Agent (B2A): `{ "mobile": "919900000003", "user_type": "Agent", "agent_code": "AGT-001" }`

## Example Products (create via admin)

- Tomato 500gm (retail): `package_qty[0].sell_price=99`, `mrp_price=120`, `stock_qty=50`
- Tomato 5kg (B2B): `retailer_package_qty[0].sell_price=850`, `mrp_price=1000`, `stock_qty=20`
- Agent commission: `agent_commission=25`

## Example Checkout

- Cart items: `{ "product_id": "<prodId>", "variant_index": 0, "qty": 2 }`
- COD: `payment_method=cod` (expects 10% partial)
