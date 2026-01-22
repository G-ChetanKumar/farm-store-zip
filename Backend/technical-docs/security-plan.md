# Security Plan (Backend)

## Authentication
- OTP-only flow for customer login.
- Short-lived access tokens (<= 15 minutes).
- Refresh token rotation stored server-side.

## Input Validation
- Zod/Joi schemas at the edge.
- Reject unknown fields.

## Rate Limiting
- OTP request/verify per IP and per mobile.
- Login attempt caps.

## Data Security
- Encrypt PII at rest where feasible.
- Redact PII from logs.

## Observability
- Correlation IDs per request.
- Audit logs for auth events.
