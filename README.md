# kub_design_back

A TypeScript backend that exposes the Kubernetes API over REST and WebSocket. It is intended as a reference for building dashboards or clients on top of `@kubernetes/client-node`, translating cluster resources into a consistent JSON surface.

## Overview

The service wraps the official Kubernetes client and normalizes responses (lists, details, events, logs, related resources) behind a predictable HTTP contract. It also provides interactive terminals for both the local host and running Pods.

- **Runtime:** Node.js (ES modules), TypeScript
- **HTTP:** Express 5
- **Kubernetes:** `@kubernetes/client-node`
- **Realtime:** `ws` + `node-pty` for PTY sessions and Pod exec

## Architecture

```
src/
├── index.ts            # App bootstrap, HTTP + WebSocket servers, Pod exec
├── config/             # CLI/env configuration (web_config, web_env)
├── middleware/         # Request bootstrap and auth
├── model/              # API/domain type definitions
├── controller/         # Per-resource logic (list, detail, events, logs)
│   └── ressource/      # Grouped by kind (pod, deployment, service, ...)
└── routes/
    ├── routes.ts       # /api/v1 route table
    ├── handler/        # APIHandler: maps routes to controllers
    └── resource/       # Reusable helpers (scaling, cron triggers)
```

Controllers hold the Kubernetes interaction; the handler adapts controllers to HTTP; routes only declare paths. Resource kinds are kept isolated so a new kind follows the same pattern: model → controller → handler → route.

## Requirements

- Node.js 20+
- A kubeconfig resolvable from the default location (`~/.kube/config`) or in-cluster config

## Getting started

```bash
npm install
npm run dev
```

The API listens on `PORT` (default `8000`). All endpoints are namespaced under `/api/v1`.

## API surface

A representative sample of the routing convention:

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/pod/:namespace` | List Pods |
| GET | `/api/v1/pod/:namespace/:pod` | Pod detail |
| GET | `/api/v1/deployment/:namespace/:deployment` | Deployment detail |
| GET | `/api/v1/service/:namespace` | List Services |
| GET | `/api/v1/log/:namespace/:podName/:container` | Container logs |
| GET | `/api/v1/scale/:kind/:namespace/:name` | Read replica count |
| PUT | `/api/v1/scale/:kind/:namespace/:name` | Scale a workload |
| GET/PUT/DELETE | `/api/v1/_raw/:kind/...` | Generic raw resource access |

Resource groups include pods, deployments, statefulsets, daemonsets, jobs, cronjobs, services, ingresses, configmaps, secrets, RBAC, storage, networking, and CRDs. See `src/routes/routes.ts` for the full table.

## WebSocket endpoints

| Port | Purpose |
| ---- | ------- |
| `8000` | Pod shell: `/ws/pod/:namespace/:pod/shell/:container` |
| `8888` | Host PTY terminal |
| `9999` | `kubectl-ai` assisted terminal |

Pod exec probes a list of common shells (`bash`, `sh`, `zsh`, ...) and attaches the first that succeeds.

## Configuration

Options are parsed via `yargs` in `src/config/web_config.ts`: TLS cert paths, listen addresses, namespace, kubeconfig path, system banner, and settings ConfigMap name. `PORT` overrides the HTTP port.

Deployment assets live in `chart/` (Dex OIDC for authentication, ingress, cert generation) and `chart_podman/` for local Podman setups.

## Notes

- Auth is delegated to an external OIDC provider (Dex); the backend assumes kubeconfig-based credentials by default.
- The raw resource routes (`_raw`) are intended for generic or emerging resource types not yet modeled explicitly.
