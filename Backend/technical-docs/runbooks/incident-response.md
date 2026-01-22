# Incident Response Runbook

## Trigger
- Elevated error rate, timeouts, payment failures, OTP failures, or data inconsistency.

## Quick Checks
- Check error dashboard and logs for correlation IDs.
- Verify database connectivity and latency.
- Confirm downstreams (SMS provider, payment gateway) are healthy.

## Deep Dives
- Trace a failing request end-to-end with correlation ID.
- Inspect recent deploys and config changes.
- Validate rate limits and throttling.

## Escalation
- Page the on-call owner and security champion.
- If PII risk suspected, isolate data access and rotate credentials.
