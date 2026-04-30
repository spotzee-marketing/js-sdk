// CD50 Phase 4 §6.3 — typed-client generator config.
// Pulls the live Spotzee OpenAPI 3.1 spec and emits TypeScript types + a fetch
// client into `src/generated/`. Re-run with `npm run generate` whenever the
// API spec changes; the version pin in `index.ts` (`SPOTZEE_API_VERSION`)
// dictates the API revision the generated types target.
//
// Set `SPOTZEE_OPENAPI_INPUT` to a local file path (or alternate URL) to
// generate against an unpublished spec — useful when the rename in
// spotzee-js-app has not yet been deployed to production. Default reads
// the live runtime spec.
import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
    // The live, runtime-emitted spec. Caches once per process boot server-side
    // with ETag, so repeat generations are cheap.
    input: process.env.SPOTZEE_OPENAPI_INPUT || 'https://apix.spotzee.com/api/openapi.json',
    output: {
        path: 'src/generated',
        // Emit `./foo.js` extensions on relative imports — required by Node's
        // strict ESM resolver (https://nodejs.org/api/esm.html#mandatory-file-extensions).
        // TypeScript carries the `.js` through unchanged in its emit, so it's
        // safe for both CJS and ESM builds. Canonical generator option per
        // https://heyapi.dev/openapi-ts/configuration/output (`output.module.extension`).
        module: {
            extension: '.js',
        },
        format: false,
        lint: false,
    },
    plugins: [
        // Type definitions for every component schema in the spec.
        '@hey-api/typescript',
        // SDK functions per operation (e.g. listUsers, createCampaign…).
        '@hey-api/sdk',
        // Generic fetch-based client suitable for both Node and browser.
        // Host code can swap baseUrl / headers via the generated `client.setConfig({...})`.
        '@hey-api/client-fetch',
    ],
})
