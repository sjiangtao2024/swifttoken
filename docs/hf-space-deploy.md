# Hugging Face Docker Space deployment

## What this repo deploys
- Root `Dockerfile` wraps the upstream `calciumion/new-api:latest` image.
- The Space serves `new-api` on port `3000`.
- SQLite data lives in `/data/one-api.db`.

## Why no local source copy
`new-api/` is treated as a local reference directory only. The deployable backend uses the published upstream image so the repository stays small and avoids source duplication.

## Space settings
Create a Docker Space and point it at this repository root.

Recommended settings:
- Visibility: `private` after smoke testing
- Persistent storage: enabled
- Port: handled by `app_port: 3000` in the root `README.md`

## Required Hugging Face secrets
Add these in the Space settings:

- `SESSION_SECRET`
  - Random long string for session signing.
- `CRYPTO_SECRET`
  - Random long string for encryption.

Optional variables:
- `TZ=Asia/Shanghai`
- `SQLITE_PATH=/data/one-api.db?_busy_timeout=30000`

## First deployment
1. Push this repository to GitHub.
2. Connect the Hugging Face Space to the GitHub repository.
3. Wait for the Docker build to complete.
4. Open the Space URL.
5. Finish the `new-api` setup wizard and create the initial admin account.

## Health check
Use:

```text
/api/status
```

Expected success response includes `success: true`.

## Validation checklist
- Space homepage loads.
- Setup wizard is reachable on first run.
- After initialization, `GET /api/status` returns success.
- Restarting the Space preserves the SQLite database when persistent storage is enabled.

## Notes
- `new-api` already supports `PORT`, SQLite fallback, and `/data` persistence, so no app code changes were required for the first HF deployment.
- If you want tighter control later, pin the upstream image to a specific version instead of `latest`.
