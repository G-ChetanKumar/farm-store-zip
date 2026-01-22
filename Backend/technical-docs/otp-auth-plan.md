# OTP Authentication Plan

## Data Model
- `User` adds:
  - `otp_last_sent_at`, `otp_attempts`, role metadata fields
  - `farmestore_id` generated on registration
- `Otp` collection: `user_id`, `otp_hash`, `expires_at`, `attempts`, `verified`

## Farm E-Store ID Rules
- Format: `FES` + role + last 4 digits of mobile
  - Farmer: `FESB2CXXXX`
  - Agri-Retailer: `FESB2BXXXX`
  - Agent: `FESB2AXXXX`

## Endpoints
- `POST /api/v1/auth/request-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/resend-otp`
- `POST /api/v1/auth/complete-profile`

## Rules
- Rate limit by IP and mobile.
- OTP expires in 5 minutes.
- Max 5 attempts per OTP.
- Resend cooldown: 30 seconds.
- Enforce `status=active` for retail/agent users.
