// CD50 Phase 4 §6.3 — stable public entry point for the generated client.
//
// `src/generated/index.ts` is auto-overwritten on every `npm run generate`
// and only re-exports the per-operation SDK functions + types. This file
// adds the bits consumers also need (the `client` instance, `createClient`,
// `createConfig`) into a single import path that won't be clobbered by
// regeneration.
//
// Usage:
//
//   import { Spotzee, client, createConfig } from '@spotzee/js-sdk/generated'
//
//   client.setConfig({
//     baseUrl: 'https://apix.spotzee.com/api/client',
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       'Spotzee-Version': '2026-04-28',
//       'x-spotzee-client-type': 'sdk-js',
//     },
//   })
//
//   const { data, error } = await Spotzee.listContacts({ query: { limit: 50 } })
//   // ↑ data is typed as `Contact[]`, error is typed `ErrorResponse | undefined`
//
//   // Type-only imports work the same way:
//   import type { Spotzee } from '@spotzee/js-sdk/generated'
//   const c: Spotzee.Contact = …
//
// Namespace import (NOT `export * from`) so the CJS emit doesn't need the
// `__exportStar` runtime helper — avoids pulling in `tslib` as a runtime dep.
// Side benefit: `Spotzee.Client` (generated config type) doesn't collide
// with the hand-written `Client` class exported from the package root.
//
// Explicit `.js` extensions on relative paths are required by Node's strict
// ESM resolver (https://nodejs.org/api/esm.html#mandatory-file-extensions).
// TypeScript emits them as-is and resolves them correctly at compile time.
import * as Spotzee from './generated/index.js'
export { Spotzee }

// `client` (the singleton) is exported from the top-level client.gen.ts;
// `client/` subdir has the framework primitives (createClient, createConfig,
// mergeHeaders). These are flat (single-name) re-exports — no helper needed.
export { client } from './generated/client.gen.js'
export { createClient, createConfig, mergeHeaders } from './generated/client/index.js'
