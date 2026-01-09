# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application

```bash
pnpm dev        # Start development server on port 3000
pnpm build      # Build for production
pnpm preview    # Preview production build
```

### Testing

```bash
pnpm test       # Run all tests with Vitest
```

### Code Quality

```bash
pnpm lint       # Run ESLint
pnpm format     # Run Prettier
pnpm check      # Format and lint with auto-fix
```

### Adding Components

```bash
pnpm dlx shadcn@latest add <component-name>  # Add shadcn/ui components
```

## Architecture Overview

### Stack

- **Framework**: TanStack Start with React 19
- **Router**: TanStack Router (file-based routing)
- **Build Tool**: Vite with Nitro backend
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Testing**: Vitest with Testing Library

### Key Architectural Patterns

#### File-Based Routing

Routes are defined as files in `src/routes/`. TanStack Router automatically generates the route tree:

- `src/routes/__root.tsx` - Root layout component with global shell
- `src/routes/index.tsx` - Home route (`/`)
- New routes are created by adding files in `src/routes/`
- Route tree is auto-generated in `src/routeTree.gen.ts` (do not edit manually)

#### Router Configuration

The router is created via `getRouter()` in `src/router.tsx` which:

- Imports the auto-generated route tree
- Configures scroll restoration
- Sets preload behavior

#### Root Document Structure

`src/routes/__root.tsx` defines:

- HTML document shell via `shellComponent`
- Global head content (meta tags, stylesheets)
- Layout wrapper (Header component)
- TanStack Devtools integration

#### Path Aliases

Use `@/*` to import from `src/` directory:

```typescript
import { cn } from '@/lib/utils'
```

#### Styling Utilities

- `src/lib/utils.ts` exports `cn()` function for merging Tailwind classes with `clsx` and `tailwind-merge`
- Global styles in `src/styles.css`

### Vite Configuration

Plugins are loaded in this order (see `vite.config.ts`):

1. `devtools()` - TanStack devtools
2. `nitro()` - Backend server
3. `viteTsConfigPaths()` - Path alias resolution
4. `tailwindcss()` - Tailwind CSS v4
5. `tanstackStart()` - TanStack Start SSR
6. `viteReact()` - React plugin

### Code Style

Prettier config enforces:

- No semicolons
- Single quotes
- Trailing commas

ESLint extends `@tanstack/eslint-config` with strict TypeScript rules enabled.
