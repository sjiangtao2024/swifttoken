# Task Plan: new-api on Hugging Face Docker Space with Cloudflare Worker keepalive

## Goal
Assess the local `new-api` reference project, design the minimum modifications needed for a Hugging Face Docker Space deployment, then implement and document a keepalive/proxy Worker under `workers/hfspace`.

## Current Phase
Phase 4

## Phases
### Phase 1: Requirements & Discovery
- [x] Understand user intent
- [x] Identify initial constraints and requirements
- [x] Document findings in findings.md
- **Status:** complete

### Phase 2: Planning & Structure
- [x] Define deployment and Worker approach
- [x] Confirm external constraints that affect architecture
- [x] Document decisions with rationale
- **Status:** complete

### Phase 3: Implementation
- [x] Create repo structure excluding reference-only areas
- [x] Add Hugging Face Docker Space deployment assets
- [x] Add Worker implementation under `workers/hfspace`
- [x] Write required docs under `docs/`
- **Status:** complete

### Phase 4: Testing & Verification
- [x] Verify Docker build inputs locally where feasible
- [x] Verify Worker config and env variable names
- [x] Document unresolved remote-only validation items
- **Status:** in_progress

### Phase 5: Delivery
- [ ] Review created files
- [ ] Summarize deployment steps and variables
- [ ] Hand off next remote actions clearly
- **Status:** pending

## Key Questions
1. Will the Hugging Face Space remain private after the first smoke test?
2. Should the upstream runtime stay on `latest`, or be pinned next?
3. Should this repo also gain CI for Worker deployment in the next pass?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use planning files in repo root | This task spans discovery, design, implementation, and remote deployment guidance. |
| Treat `new-api/` as reference-only for now | User explicitly said to exclude it and use it as a reference directory. |
| Use the upstream `calciumion/new-api:latest` image in a thin wrapper | This avoids vendoring the full source tree while preserving a deployable Docker Space. |
| Use Worker variable names `HF_SPACE_BASE_URL`, `HF_SPACE_HEALTH_PATH`, and `HF_SPACE_BEARER_TOKEN` | These names are explicit about target, path, and secret scope. |
| Use `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for remote deploy auth | These are the official Wrangler environment variable names. |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `swifttoken` is not a git repo yet | 1 | Treat current directory as a workspace and defer repo wiring until plan is approved. |
| `git branch -m main` failed with `.git/HEAD.lock: Read-only file system` | 1 | Keep the current branch name for now and note that branch renaming may need a later retry. |

## Notes
- Need to respect exclusion boundaries for `new-api`, `docs`, and `workers` as clarified by the user.
- Remote operations may require SSH/git push and HF/Cloudflare credentials later.
- Remote validation still pending: actual GitHub push, HF Space build, Worker deploy, and end-to-end proxy test.
