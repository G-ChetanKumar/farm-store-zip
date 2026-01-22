# Threat Model

## Data Flows
- Client -> API (OTP, login, products, orders)
- API -> MongoDB
- API -> SMS gateway
- API -> Payment gateway

## Risks (STRIDE)
- Spoofing: OTP abuse, account takeover
- Tampering: order price manipulation
- Repudiation: lack of audit logs
- Information disclosure: PII leakage in logs
- Denial of service: OTP endpoint abuse
- Elevation of privilege: role misuse

## Mitigations
- Rate limiting and OTP attempt caps
- Price snapshot stored in orders
- Correlation IDs and audit logging
- Redaction of sensitive fields
- RBAC on admin routes
