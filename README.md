---
title: swifttoken-backend
emoji: "\U0001F365"
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 3000
pinned: false
license: mit
---

# swifttoken backend

This repository packages `new-api` for a Hugging Face Docker Space and includes a Cloudflare Worker for keepalive and proxying.

Deployment notes are in [`docs/`](./docs/):

- [`docs/hf-space-deploy.md`](./docs/hf-space-deploy.md)
- [`docs/workers-hfspace.md`](./docs/workers-hfspace.md)
- [`docs/plans/2026-03-12-hfspace-backend-design.md`](./docs/plans/2026-03-12-hfspace-backend-design.md)
