# Cloudflare Worker for Hugging Face Space

## Purpose
The Worker in `workers/hfspace` does two jobs:
- act as the stable public API endpoint
- keep the Hugging Face Space warm with scheduled health checks

## Directory
- `workers/hfspace/src/index.js`
- `workers/hfspace/wrangler.toml`

## Worker runtime variables
Set these for the Worker itself:

- `HF_SPACE_BASE_URL`
  - Example: `https://your-space-name.hf.space`
- `HF_SPACE_HEALTH_PATH`
  - Recommended: `/api/status`
- `KEEPALIVE_USER_AGENT`
  - Example: `swifttoken-hfspace-keepalive/1.0`

Set this as a secret:

- `HF_SPACE_BEARER_TOKEN`
  - Required when the Space is private.

## Variables for remote publish from your machine
If you want to run `wrangler deploy` non-interactively from local shell or CI, the official variables are:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

These are the correct environment variable names to export before remote operations.

Example:

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...
```

## Suggested Worker secrets setup
```bash
cd workers/hfspace
wrangler secret put HF_SPACE_BEARER_TOKEN
```

## Cron suggestion
Use a 5-minute interval first:

```text
*/5 * * * *
```

You can relax this later if the Space stays responsive enough.

## Request flow
1. Client calls Worker URL.
2. Worker forwards request to `HF_SPACE_BASE_URL`.
3. Worker injects `Authorization: Bearer <HF token>` for a private Space.
4. Scheduled trigger calls `/api/status` to keep the Space warm.
