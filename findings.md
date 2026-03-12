# Findings & Decisions

## Requirements
- Target architecture: backend first, based on `new-api`, deployed to Hugging Face as a Docker Space.
- Add a Cloudflare Worker for keepalive under `workers/hfspace`.
- Frontend is deferred.
- User already has a Hugging Face account and a Cloudflare Worker token.
- User provided GitHub repo: `git@github.com:sjiangtao2024/swifttoken.git` (derived from the HTTPS URL for SSH use).
- `new-api/` is a local reference project and should not be treated as the final repo payload by default.

## Research Findings
- `new-api` has an explicit Docker deployment path via `Dockerfile` and `docker-compose.yml`.
- `new-api` includes project-level constraints in its own `AGENTS.md`, including protected branding and a Go + React architecture.
- `new-api` already supports `PORT`, SQLite fallback, `/data` persistence, and `/api/status` as a useful health endpoint.
- Hugging Face Docker Space metadata is declared in the root `README.md` YAML, and `app_port` can be set there.
- Hugging Face storage docs describe `/data` as the persistent mount path when persistent storage is enabled.
- Cloudflare Wrangler official system environment variables for non-interactive deploys are `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Prefer Hugging Face Docker Space instead of adapting to a static/runtime Space | The reference project is already container-oriented, minimizing invasive changes. |
| Wrap the published upstream image instead of copying `new-api` source | The user marked `new-api/` as reference-only and asked to exclude it from the final payload. |
| First HF version uses SQLite only | This removes Redis/Postgres dependencies and fits the smallest Docker Space footprint. |
| Worker should both proxy and keepalive | This creates one stable entrypoint instead of exposing the Space URL directly. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Local workspace started without git metadata | Resolved by running `git init` and adding the GitHub SSH remote. |
| Local git branch rename hit a filesystem lock error | Left branch name unchanged; this does not block file creation or later push. |

## Resources
- `/home/yukun/dev/swifttoken/new-api/README.md`
- `/home/yukun/dev/swifttoken/new-api/README.zh_CN.md`
- `/home/yukun/dev/swifttoken/new-api/AGENTS.md`
- https://huggingface.co/docs/hub/en/spaces-sdks-docker
- https://huggingface.co/docs/hub/spaces-storage
- https://developers.cloudflare.com/workers/wrangler/system-environment-variables/
- https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/

## Visual/Browser Findings
- Hugging Face Docker Space docs show `sdk: docker` and `app_port` in the root `README.md` YAML block.
- Hugging Face storage docs state persistent storage, when enabled, is mounted at `/data`.
- Cloudflare docs list `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as supported Wrangler system environment variables.
