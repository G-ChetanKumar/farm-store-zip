# Agentic AI Development Rules (.mdd)

**Scope:** Node.js (TypeScript preferred) + MongoDB services, with an agentic AI layer. This document defines non‑negotiable rules for coding, security, documentation, testing, observability, DevOps, and front‑end collaboration. Treat this as your in‑brain checklist.

---

## 0) Golden Principles
- **Safety first:** No PII leakage, no live-key exposure, no training on customer data without explicit consent.
- **Least privilege:** Every resource, token, role, and query grants only what is necessary.
- **Deterministic surfaces:** AI agents produce *auditable plans* and *constrained tool calls*; all side‑effects are logged & replayable.
- **Docs as code:** Every change updates the relevant doc section and examples.
- **Defense‑in‑depth:** Validate → Authorize → Sanitize → Log (redacted) → Rate limit → Observe.
- **Reproducibility:** `make dev` / `npm run dev` brings a new machine to a working state with seed data.

---

## 1) Repository & Technical Docs Layout
```
/technical-docs/
  agent-rules.mdd                # This file (authoritative rules)
  backend-security-checklist.md  # Copy the Security section (2) verbatim + team additions
  frontend-integration-guide.md  # Copy the Front-end contract (9) + API usage patterns
  api-contracts/
    openapi.yaml                 # Generated from code, never hand-edited
  runbooks/
    incident-response.md         # What to do when things go wrong
    oncall-quickstart.md         # Who to page, where logs are, common remediations
  threat-model.md                # Data flows, STRIDE risks, mitigations, sign-offs
  decisions/
    ADR-0001-tech-stack.md       # Architecture Decision Records (ADR template below)
```

**Rule:** Any PR that changes behavior must update the impacted doc file(s).

---

## 2) Security Rules (Non‑negotiable)

### 2.1 Authentication & Tokens
- **JWT access tokens**: short TTL (≤ 15 min), **HTTP‑only, Secure, SameSite=strict** if cookie; otherwise Bearer in TLS only.
- **Refresh tokens**: rotate on every use, store server‑side hash; bind to device/IP when feasible.
- **Key management**: All secrets in a vault (Azure Key Vault/AWS Secrets Manager). **No `.env` committed.**
- **mTLS for service→service** calls where possible.

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

### 2.7 AI‑Specific Safety
- Tooling sandbox: FS/network access is **deny‑by‑default**; explicit allow-list per tool.
- Prompt‑injection mitigation: strip/neutralize untrusted instructions, constrain with system prompts, and **verify outputs** with validators.
- Toxicity/PII guardrails before responses leave the server.

### 2.8 Supply Chain
- Lockfile committed; dependabot/renovate enabled.
- SCA (e.g., `npm audit`, Snyk) gates CI; known criticals block release.

---

## 3) Coding Standards (Node.js + TypeScript)
- **TypeScript required** for backend & agent tools. `strict: true`, `noImplicitAny: true`.
- **ESLint + Prettier** mandatory; CI fails on lint.
- Layered architecture:
  - `src/api` (controllers/routes)
  - `src/services` (use‑cases)
  - `src/repos` (Mongo data access)
  - `src/agents` (planners/tools/policies)
  - `src/lib` (cross-cutting utils)
- **Dependency rule**: API→services→repos; never reverse.
- **Error model**: use typed errors (e.g., `AppError` with `code`, `http`, `safeMessage`). No `throw new Error("string")`.
- **Asynchronicity**: `await` all promises; no floating promises; use `p-timeout` on remote calls.

Example error:
```ts
throw new AppError({ code: 'VALIDATION_ERROR', http: 400, safeMessage: 'Invalid input', details });
```

---

## 4) MongoDB Rules
- **Drivers**: Official driver or Mongoose 8+. If Mongoose, use lean queries (`.lean()`) for read APIs.
- **Schema design**: Prefer **embedding** for 1:1 / 1:small‑N; **referencing** for large N/many-to-many.
- **Validation**: Enforce with JSON Schema/Mongoose validators and also at API DTO level.
- **Indexes**: Required for all high‑QPS queries; define in code with explicit names; review with `explain()` in PRs affecting queries.
- **Transactions**: Use session transactions for multi‑doc invariants; idempotency keys for at‑least‑once flows.
- **TTL indexes** for ephemeral documents (sessions, temp artifacts).
- **Pagination**: Use cursor‑based (`_id`/`createdAt`) not skip/limit for large collections.

---

## 5) API Design Rules
- **OpenAPI‑first**: Routes generated from `openapi.yaml` (source-of-truth is code annotations → generator → file overwrite).
- Resource naming: plural nouns, kebab-case paths. Version in URL: `/api/v1/...`.
- **Idempotency**: All POSTs with side‑effects accept `Idempotency-Key`.
- **Consistent responses**: `{ success, data, error }` envelope.
- **Error codes** are stable and documented.

---

## 6) Observability & Logging
- **Correlation ID** per request propagated to all logs & downstreams.
- **Structured logs** (JSON) with levels; never log secrets or PII.
- **Metrics**: p95/p99 latency, error rate, throttle rate, token usage, model latency.
- **Tracing**: OpenTelemetry enabled; spans for agent planning, tool calls, DB ops.

---

## 7) Testing Rules
- **Pyramid**: Unit >> Integration >> E2E.
- **Minimum coverage**: 80% lines/branches; security codepaths must be tested.
- **Fixture data**: Factory methods; no real secrets; seeded Mongo via Docker.
- **Contract tests** against OpenAPI; **snapshot tests** for prompts & tool outputs.
- **Chaos tests** for timeouts, partial failures, rate limits.

---

## 8) CI/CD Gates
- Lint + typecheck + unit tests must pass.
- **Security**: SCA, secret scan, license scan; fail on critical.
- **DB migrations** (if any) applied on ephemeral env; smoke E2E must pass.
- **Blue/green** or **canary** deploys; feature flags for risky changes.

---

## 9) Front‑End Developer Contract (Essential)
- **Source of truth**: `api-contracts/openapi.yaml` → auto‑gen TS client (fetch/axios) with types.
- **Auth**: FE stores only **access token** in memory or HTTP‑only cookie (preferred). No localStorage for refresh tokens.
- **Error surface**: BE returns `safeMessage`; FE shows that; never render raw `details`.
- **Rate limits**: FE must debounce rapid actions; honor `Retry-After` headers.
- **Versioning**: Breaking changes require `/vN` path bump and FE PR prepared before merge.
- **Event streams** (SSE/WebSocket): FE handles reconnect with backoff; include `x-correlation-id` in messages.
- **AI UI**: Show tool plan and steps to the user; allow cancel; show token/usage summary when applicable.

---

## 10) Agentic Layer Rules
- **Planner → Executor → Reviewer** pattern:
  1. **Planner** creates a step list with goals, constraints, tools, and acceptance checks.
  2. **Executor** calls whitelisted tools with validated params (schema‑checked).
  3. **Reviewer/Verifier** validates outputs against constraints and business rules.
- **Tooling contracts**:
  - Each tool has: name, description, JSON schema, timeout, idempotency strategy, and **side‑effect level** (read‑only vs mutating).
  - All tool calls are **logged** with arguments redacted and **auditable**.
- **Safety policies** embedded in system prompts: forbidden data/classes of actions, escalation rules, and when to require human approval.
- **Self‑limiting**: Max steps per task, max tokens per step, and early‑stop on repeated failures.
- **Determinism**: Set model, temperature, and seeds for reproducibility in non‑creative paths.

---

## 11) Performance & Cost Rules
- **Caching**: Read‑through cache (Redis) for hot reads; cache model responses with input hashing when safe.
- **Batching**: Coalesce DB queries and model requests when possible.
- **Pagination & streaming**: Stream large responses (SSE/NDJSON) to keep TTFB low.
- **Budgets**: Per‑request token & latency budgets enforced; alert when breached.

---

## 12) Error Handling & Incident Response
- Map known failure modes to **typed errors** and **user‑safe messages**.
- On incident: capture timeline, correlation ID, inputs (redacted), outputs, and infrastructure graphs; attach to `runbooks/incident-response.md`.
- Post‑mortem must include **action items with owners and due dates**.

---

## 13) Documentation Rules (Write It Down)
- **ADR Template**
```
# ADR-XXXX: <Decision Title>
Status: Proposed | Accepted | Superseded
Context:
Decision:
Consequences (Positive/Negative):
Alternatives Considered:
Links:
```
- **Endpoint doc block template** (JSDoc atop handlers) drives OpenAPI:
```
/**
 * @route POST /api/v1/messages
 * @summary Send a message to the agent
 * @security bearerAuth
 * @body {SendMessageDto}
 * @response 200 {MessageResponse}
 */
```
- **Runbook pattern**: trigger → quick checks → deep dives → escalation matrix.

---

## 14) Local Dev Environment
- `docker-compose up` for Mongo, Redis, mailhog.
- `npm run dev` starts API with hot reload and seeds sample data & a demo user.
- Example `.env.example` committed with **placeholders only**.

---

## 15) Release Checklist (PR must tick all)
- [ ] Lint/Typecheck/Test green; coverage ≥ 80%.
- [ ] OpenAPI updated & client regenerated.
- [ ] Migrations applied & rollback tested.
- [ ] Threat model updated if data flow changed.
- [ ] Docs updated under `/technical-docs`.
- [ ] Feature flags & monitoring in place.

---

## 16) Sample Snippets (Drop‑in)

**Express security middleware**
```ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

app.use(helmet({
  contentSecurityPolicy: false, // enable and tune when using SSR
  referrerPolicy: { policy: 'no-referrer' },
}));
app.use(cors({ origin: ['https://app.example.com'], credentials: true }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));
```

**Zod validation at the edge**
```ts
const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});
app.post('/api/v1/users', async (req, res, next) => {
  const parsed = CreateUser.safeParse(req.body);
  if (!parsed.success) return next(new AppError({ http: 400, code: 'VALIDATION_ERROR', details: parsed.error }));
  // ...
});
```

**Mongo index definition**
```ts
userSchema.index({ email: 1 }, { unique: true, name: 'uniq_user_email' });
```

**OpenTelemetry setup (sketch)**
```ts
import { NodeSDK } from '@opentelemetry/sdk-node';
new NodeSDK({
  traceExporter: /* OTLP exporter */,
  spanProcessor: /* batch processor */,
}).start();
```

---

## 17) Governance
- A **Security Champion** reviews PRs affecting auth, data access, or agents.
- Weekly **docs hygiene**: ensure `/technical-docs` mirrors reality.
- Quarterly **threat modeling** refresh and incident drill.

---

## 18) Glossary
- **Agent**: A system that plans, invokes tools, and verifies outcomes under strict policies.
- **Tool**: A bounded, schema‑validated capability exposed to the agent (DB query, HTTP call, file op).
- **Plan**: A structured set of steps with constraints and validation checks.

---

### Final Rule
**If it’s not in code and not in `/technical-docs`, it does not exist.**

