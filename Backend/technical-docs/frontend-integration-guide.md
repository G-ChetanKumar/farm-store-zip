# Frontend Integration Guide

## Front-End Developer Contract (Essential)
- **Source of truth**: `api-contracts/openapi.yaml` -> auto-gen TS client (fetch/axios) with types.
- **Auth**: FE stores only **access token** in memory or HTTP-only cookie (preferred). No localStorage for refresh tokens.
- **Error surface**: BE returns `safeMessage`; FE shows that; never render raw `details`.
- **Rate limits**: FE must debounce rapid actions; honor `Retry-After` headers.
- **Versioning**: Breaking changes require `/vN` path bump and FE PR prepared before merge.
- **Event streams** (SSE/WebSocket): FE handles reconnect with backoff; include `x-correlation-id` in messages.
- **AI UI**: Show tool plan and steps to the user; allow cancel; show token/usage summary when applicable.

## API Usage Patterns

### Authentication
- OTP request -> OTP verify -> profile completion.
- Only show protected screens if `status=active`.

### Pricing
- Use `variants` returned by product APIs (role-resolved).
- Store `variant_id`, `unit_price`, `original_price`, and `commission` in cart state.

### Orders
- Persist `delivery_mode` and `payment_method` in order creation.
- Display `price_snapshot` from order rather than recomputing.
