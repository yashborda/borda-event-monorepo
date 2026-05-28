# Frostleaf

A pnpm monorepo with two Next.js apps and a NestJS backend.

## Structure

```
frostleaf/
├── apps/
│   ├── admin/      Next.js 16 — internal admin panel    (:3001)
│   ├── website/    Next.js 16 — public-facing site      (:3000)
│   └── backend/    NestJS 11 — REST API                 (:3002)
└── packages/
    ├── typescript-config/   Shared tsconfig bases (all apps)
    ├── eslint-config/       Shared ESLint config (admin + website)
    └── prettier-config/     Shared Prettier config (admin + website)
```

## Prerequisites

| Tool | Version |
| ---- | ------- |
| Node | ≥ 20    |
| pnpm | ≥ 9     |
| Task | ≥ 3     |

Install [Task](https://taskfile.dev):

```bash
sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin
```

## Getting Started

```bash
pnpm install
task dev
```

## Tasks

### Development

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `task dev`         | Start all apps in parallel            |
| `task dev:admin`   | Start admin only (`:3001`)            |
| `task dev:website` | Start website only (`:3000`)          |
| `task dev:backend` | Start backend in watch mode (`:3002`) |

### Build

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `task build`         | Build packages then all apps |
| `task build:admin`   | Build admin                  |
| `task build:website` | Build website                |
| `task build:backend` | Build backend                |

### Lint

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `task lint`             | Lint all apps                    |
| `task lint:admin`       | Lint admin                       |
| `task lint:website`     | Lint website                     |
| `task lint:backend`     | Lint backend                     |
| `task lint:fix`         | Auto-fix lint issues in all apps |
| `task lint:fix:admin`   | Auto-fix lint issues in admin    |
| `task lint:fix:website` | Auto-fix lint issues in website  |
| `task lint:fix:backend` | Auto-fix lint issues in backend  |

### Type Check

| Command                   | Description         |
| ------------------------- | ------------------- |
| `task type-check`         | Type-check all apps |
| `task type-check:admin`   | Type-check admin    |
| `task type-check:website` | Type-check website  |
| `task type-check:backend` | Type-check backend  |

### Format

| Command               | Description                   |
| --------------------- | ----------------------------- |
| `task format`         | Format all apps with Prettier |
| `task format:admin`   | Format admin                  |
| `task format:website` | Format website                |
| `task format:backend` | Format backend                |

### Utilities

| Command        | Description                                 |
| -------------- | ------------------------------------------- |
| `task install` | Install all dependencies                    |
| `task clean`   | Remove `node_modules`, `dist`, `.next` dirs |

## Managing Dependencies

Always run installs from the **repo root** — never inside individual app directories. pnpm will create a single root `pnpm-lock.yaml` and symlink workspace packages automatically.

### Install a dependency in a specific app

```bash
# production dependency
pnpm --filter admin add <package>
pnpm --filter website add <package>
pnpm --filter backend add <package>

# dev dependency
pnpm --filter admin add -D <package>
pnpm --filter website add -D <package>
pnpm --filter backend add -D <package>
```

### Install a dependency in all apps at once

```bash
pnpm --filter "./apps/*" add <package>
```

### Install a dependency in a shared package

```bash
pnpm --filter @pkg/eslint-config add -D <package>
pnpm --filter @pkg/prettier-config add -D <package>
pnpm --filter @pkg/typescript-config add -D <package>
```

### Reference a shared workspace package

Add it to the app's `package.json` using the `workspace:*` protocol, then run `pnpm install`:

```json
"dependencies": {
  "@pkg/ui": "workspace:*"
}
```

### Remove a dependency

```bash
pnpm --filter admin remove <package>
```

### Update all dependencies to latest

```bash
pnpm dlx npm-check-updates --workspaces --root --upgrade
pnpm install
```

## Mail Preview

While the backend is running in development, email templates can be previewed live in the browser — no mail server required.

| URL                                                              | Template                     |
| ---------------------------------------------------------------- | ---------------------------- |
| `http://localhost:3002/api/dev/mail-preview`                     | Index — all templates        |
| `http://localhost:3002/api/dev/mail-preview/welcome.html`        | Welcome / email verification |
| `http://localhost:3002/api/dev/mail-preview/magic-link.html`     | Magic login link             |
| `http://localhost:3002/api/dev/mail-preview/password-reset.html` | Password reset               |

Template variables are substituted with sample data automatically. These routes return `404` when `NODE_ENV=production`.

## Shared Packages

| Package                  | admin | website | backend |
| ------------------------ | :---: | :-----: | :-----: |
| `@pkg/typescript-config` |   ✓   |    ✓    |    ✓    |
| `@pkg/eslint-config`     |   ✓   |    ✓    |    —    |
| `@pkg/prettier-config`   |   ✓   |    ✓    |    —    |

Backend uses its own generated ESLint and Prettier config.
