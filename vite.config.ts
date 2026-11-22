// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// `bun run build:static` (scripts/build-static.mjs) sets BRIGHTPATH_STATIC_BUILD=1 to produce a
// fully prerendered static site for GitHub Pages / Hostinger: nitro is skipped, TanStack Start
// prerenders "/" into the client output, and the Vite base is relative so the files work from
// any folder. The regular `bun run build` (and Lovable's own build, which pins its preset via
// LOVABLE_NITRO_PRESET) is unaffected.
const isStaticBuild = process.env.BRIGHTPATH_STATIC_BUILD === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isStaticBuild
      ? {
          prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: false },
          // With a relative Vite base, Start would derive a "." basepath; pin it to "/".
          // src/router.tsx re-derives the real basepath in the browser at runtime.
          router: { basepath: "/" },
        }
      : {}),
  },
  ...(isStaticBuild ? { nitro: false as const } : {}),
  vite: {
    // Relative base so the static build works at https://<user>.github.io/<repo>/ and in the
    // root (or any folder) of Hostinger public_html. Dev and the Lovable/Cloudflare build keep
    // the default "/" base.
    ...(isStaticBuild ? { base: "./" } : {}),
    environments: {
      // Client bundle only (the server bundle is inlined and must not be re-split):
      // three.js and the react-three stack dwarf the rest of the app; keep them in their own
      // lazy-loaded chunks so the landing page JS stays small.
      client: {
        build: {
          rolldownOptions: {
            output: {
              codeSplitting: {
                // three.js in its own chunk; react-three-fiber/drei stay in the lazy
                // CampusExperience chunk they are imported from.
                groups: [{ name: "three", test: /node_modules[\\/]three[\\/]/ }],
              },
            },
          },
          chunkSizeWarningLimit: 900,
        },
      },
    },
  },
});
