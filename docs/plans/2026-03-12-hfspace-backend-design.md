# swifttoken HF Space backend design

## Goal
Deploy a minimal `new-api` backend to a Hugging Face Docker Space without vendoring the full reference repository, then place Cloudflare Worker keepalive and proxy logic in `workers/hfspace`.

## Chosen approach
- Use the upstream `calciumion/new-api:latest` image as the runtime base.
- Add a thin wrapper `Dockerfile` in the repository root for Hugging Face Docker Space.
- Persist SQLite data in `/data`, which is the natural persistent path for the application and the Hugging Face persistent storage mount.
- Keep the Hugging Face Space private after initial smoke testing.
- Expose a Cloudflare Worker as the public-facing entrypoint, with two responsibilities:
  - Scheduled keepalive requests to the private Space.
  - Reverse proxy requests from the public endpoint to the private Space.

## Why this approach
- It avoids copying the full `new-api` source tree into the deployment repo.
- It preserves the reference project as a local comparison target only.
- It minimizes maintenance by tracking the upstream runtime image rather than rebuilding Go and frontend assets in the Space.
- It keeps the security boundary simple: external traffic goes to Cloudflare, Cloudflare talks to Hugging Face.

## Runtime design
### Hugging Face Space
- Runtime image: `calciumion/new-api:latest`
- Wrapper config:
  - `PORT=3000`
  - `TZ=Asia/Shanghai`
  - `SQLITE_PATH=/data/one-api.db?_busy_timeout=30000`
  - process args: `--log-dir /data/logs`
- Storage:
  - database file in `/data`
  - logs in `/data/logs`
- Health endpoint:
  - `GET /api/status`

### Cloudflare Worker
- `fetch` handler:
  - forwards request method, path, query, headers, and body to Hugging Face Space
  - injects Hugging Face bearer token when the Space is private
  - strips host-specific headers that should not be forwarded directly
- `scheduled` handler:
  - periodically calls the health endpoint to reduce cold starts
  - writes simple status logs

## Required variables
### Hugging Face Space variables
- `SESSION_SECRET`
- `CRYPTO_SECRET`
- optional: `TZ`
- optional: `SQLITE_PATH` if deviating from the default wrapper

### Worker secrets/vars
- `HF_SPACE_BASE_URL`
- `HF_SPACE_BEARER_TOKEN`
- `HF_SPACE_HEALTH_PATH`
- `KEEPALIVE_USER_AGENT`

### Local/CI remote publish variables
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## First-run operation
- Deploy the Docker Space.
- Open the Space URL and complete the `new-api` web setup wizard.
- Create the initial admin account through the setup UI.
- Add upstream channels and tokens only after the Worker path is in front and the Space visibility is correct.

## Risks and non-goals
- This first version does not add custom application patches to `new-api`.
- The upstream image tag `latest` may change behavior; pinning a version is a later hardening step.
- Hugging Face persistent storage must be enabled if database persistence across restarts is required.
