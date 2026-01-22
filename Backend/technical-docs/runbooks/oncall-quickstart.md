# On-Call Quickstart

## Who to Page
- Primary: Backend on-call
- Secondary: Security champion for auth/PII issues

## Where to Look
- API logs with correlation IDs
- MongoDB performance metrics
- SMS/OTP provider status

## Common Remediations
- Roll back last deployment
- Disable OTP spam sources via rate limiting
- Toggle feature flags for risky changes
