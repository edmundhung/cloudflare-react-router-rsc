# React Router RSC on Cloudflare Workers

This template runs React Router's experimental RSC Framework Mode on Cloudflare Workers.

> **Warning**: RSC Framework Mode is experimental.

## Quick Start

```bash
pnpm install
pnpm dev
```

## Cloudflare Setup Guide

Starting from the [RSC Framework Mode template](https://github.com/remix-run/react-router-templates/tree/main/unstable_rsc-framework-mode):

### 1. Install dependencies

```bash
pnpm add -D @cloudflare/vite-plugin wrangler
pnpm remove @react-router/serve @remix-run/node-fetch-server
```

### 2. Update vite.config.ts

```ts
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
	plugins: [
		cloudflare({
			viteEnvironment: {
				name: "rsc",
				childEnvironments: ["ssr"],
			},
		}),
		// ... keep existing plugins, but update rsc():
		rsc({ serverHandler: false }),
	],
	environments: {
		rsc: {
			optimizeDeps: {
				exclude: ["react-router"],
			},
		},
		ssr: {
			optimizeDeps: {
				exclude: ["react-router"],
			},
		},
	},
});
```

> **Note**: See [Known Issues](#known-issues) for why `serverHandler: false` and `optimizeDeps.exclude` are needed.

### 3. Create wrangler.json

```json
{
	"$schema": "./node_modules/wrangler/config-schema.json",
	"name": "my-app",
	"main": "@react-router/dev/config/default-rsc-entries/entry.rsc",
	"compatibility_date": "2026-01-29",
	"compatibility_flags": ["nodejs_compat"]
}
```

- `main` points to React Router's default RSC entry (no custom worker needed)
- `nodejs_compat` is required for React's usage on Async Local Storage APIs

### 4. Other files

The rest follows the [standard Cloudflare React Router setup](https://developers.cloudflare.com/workers/frameworks/framework-guides/react-router/):

- [package.json](./package.json) - Add `preview`, `deploy`, `cf-typegen` scripts
- [tsconfig.json](./tsconfig.json), [tsconfig.node.json](./tsconfig.node.json), [tsconfig.cloudflare.json](./tsconfig.cloudflare.json)
- [.gitignore](./.gitignore) - Add `/.wrangler/`

## Known Issues

These workarounds will be resolved in future versions of the plugins.

### Hook errors on first dev load

`Invalid hook call` errors after clearing `node_modules/.vite`. The `reactRouterRSC` plugin's `optimizeDeps.include` for `react-router` can cause duplicate React instances in worker environments.

**Fix**: Exclude `react-router` from optimization in `rsc`/`ssr` environments (see config above).

### `cloudflare:*` imports fail in preview mode

`ERR_UNSUPPORTED_ESM_URL_SCHEME` when using Durable Objects or other `cloudflare:*` imports. The `@vitejs/plugin-rsc` preview server tries to import the RSC entry in Node.js, which doesn't support `cloudflare:*`.

**Fix**: Set `rsc({ serverHandler: false })` since the Cloudflare plugin handles requests via workerd.

## Resources

- [React Router RSC Docs](https://reactrouter.com/how-to/react-server-components)
- [Cloudflare Vite Plugin](https://developers.cloudflare.com/workers/vite-plugin/)
