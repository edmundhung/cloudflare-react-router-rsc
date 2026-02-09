import { cloudflare } from "@cloudflare/vite-plugin";
import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		cloudflare({
			viteEnvironment: {
				name: "rsc",
				childEnvironments: ["ssr"],
			},
		}),
		tailwindcss(),
		tsconfigPaths(),
		reactRouterRSC(),
		rsc({
			// Workaround: Disable the default server handler from @vitejs/plugin-rsc.
			// In preview mode, the plugin tries to import the built RSC entry in Node.js,
			// which fails if your entry uses `cloudflare:*` imports (e.g., Durable Objects).
			// The Cloudflare plugin handles requests via workerd instead, so this is safe.
			serverHandler: false,
		}),
		devtoolsJson(),
	],
	environments: {
		// Workaround: Exclude react-router from dependency optimization in worker environments.
		// The reactRouterRSC plugin adds react-router to optimizeDeps.include at the root level
		// (intended for the client), but this can cause duplicate React instances in the rsc/ssr
		// environments running inside workerd, leading to "Invalid hook call" errors on first load.
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
