# Backend Security Checklist

This file contains the Security Rules (Section 2) verbatim and team additions below.

## 2) Security Rules (Non-negotiable)

### 2.1 Authentication & Tokens
- **JWT access tokens**: short TTL (<= 15 min), **HTTP-only, Secure, SameSite=strict** if cookie; otherwise Bearer in TLS only.
- **Refresh tokens**: rotate on every use, store server-side hash; bind to device/IP when feasible.
- **Key management**: All secrets in a vault (Azure Key Vault/AWS Secrets Manager). **No `.env` committed.**
- **mTLS for service->service** calls where possible.

### 2.2 Authorization
- **Zanzibar/OPA/ABAC** style preferred. At minimum, explicit **RBAC guards per route**.
- Authorization is checked **after identity & before business logic**.

### 2.3 Input Validation & Sanitization
- Validate **at the edge** using zod/joi/yup DTOs; reject unknown fields.
- **MongoDB NoSQL injection**: never pass client objects directly to `$where`, `$regex` without bounding; whitelist fields for filters/sorts.
- Sanitize strings against HTML/JS; escape output server-side where rendered (SSR/Emails).

### 2.4 Transport & Headers
- Force **TLS 1.2+**.
- Use `helmet()` with explicit policies:
  - `contentSecurityPolicy`, `referrerPolicy`, `hsts`, `xContentTypeOptions`, `xFrameOptions`.
- **CORS**: explicit allowlist, no `*` with credentials.

### 2.5 Rate Limiting & Abuse Controls
- Per IP **and** per identity limits (login, chat completions, tool calls).
- Sliding window (Redis) + circuit breakers for downstreams.

### 2.6 Data Security & Privacy
- **PII fields** encrypted at rest (Mongo field-level crypto or at storage level) and redacted in logs.
- **Data retention** policies codified; automatic TTL/archival collections when possible.
- **Right to be forgotten** procedure documented & testable.

### 2.7 AI-Specific Safety
- Tooling sandbox: FS/network access is **deny-by-default**; explicit allow-list per tool.
- Prompt-injection mitigation: strip/neutralize untrusted instructions, constrain with system prompts, and **verify outputs** with validators.
- Toxicity/PII guardrails before responses leave the server.

### 2.8 Supply Chain
- Lockfile committed; dependabot/renovate enabled.
- SCA (e.g., `npm audit`, Snyk) gates CI; known criticals block release.

## Team Additions
- Enforce OTP request throttling by mobile and IP.
- Store OTP hashes only; never store OTP in logs.
- Block login for `status=pending` except for admin override.
- Record security events with correlation IDs (OTP request, OTP verify, login failures).
