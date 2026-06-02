# @pkg/ui

Shared UI component library for the Borda Event monorepo, built with [shadcn/ui](https://ui.shadcn.com).

## Adding a component

Components are added via the shadcn CLI, run from the **monorepo root**:

```bash
pnpm --filter @pkg/ui exec pnpm dlx shadcn@latest add <component-name>
```

Example — adding the `dialog` component:

```bash
pnpm --filter @pkg/ui exec pnpm dlx shadcn@latest add dialog
```

The CLI reads `packages/ui/components.json` and writes the component into `packages/ui/src/components/ui/`.

## Available components

- `badge`
- `button`
- `card`
- `input`

## Usage in apps

Import components from the package:

```tsx
import { Button } from '@pkg/ui'
```
