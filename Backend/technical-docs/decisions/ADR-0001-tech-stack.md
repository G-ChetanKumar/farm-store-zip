# ADR-0001: Backend Tech Stack

Status: Proposed

## Context
Farm E-Store requires OTP auth, role-based pricing, and order consistency for a mid-scale user base (~50K).

## Decision
Use Node.js (TypeScript), Express, and MongoDB with Mongoose for the backend.

## Consequences
- Fast iteration and good ecosystem support.
- Requires disciplined schema validation and indexes.

## Alternatives Considered
- NestJS with TypeORM
- Go + PostgreSQL

## Links
- technical-docs/agent-rules.mdd
