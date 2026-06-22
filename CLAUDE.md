# CLAUDE.md

This file provides repo-specific guidance for AI coding agents working in this SDK.

## Rebranding

Use Spotzee branding in code, comments, docs, URLs, package metadata, and generated examples. Do not add retired upstream brand references except where a legally required third-party licence notice must preserve an original copyright holder.

## Authorship

Author fields, credits, and attributions for Spotzee-authored work must use `Roshan Jonnalagadda`.

## Git Operations

AI agents may stage, commit, push, and open PRs only after explicit user approval in the current thread. Without that approval, provide the exact commands or commit message for the user to run manually.

Never push directly to `main`; push an agent branch and open a ready-for-review PR unless the user explicitly requests a different flow.

## Functionality Preservation

Maintain backwards-compatible SDK behaviour for existing consumers. Runtime SDK methods must continue to work identically unless the user explicitly approves a breaking change.

## Build Commands

```bash
npm run package:build
npm run package:build:esm
npm run package:build:cjs
npm run package:publish --tag=<version>
```

## Generated OpenAPI Client

The public generated client in `src/generated/` mirrors the hosted Spotzee OpenAPI spec. When the API spec changes, run `npm run generate` or `npm run package:build` and commit the generated source changes together.

Validate generated-client changes with `npm run package:build`, CJS/ESM import smoke checks for the exported methods, `npm pack --dry-run`, `npm audit --audit-level=moderate --omit=dev`, and `git diff --check`.

## Architecture

Single-file runtime SDK (`index.ts`) provides:

- `Client`: server-side client requiring explicit identity per call.
- `BrowserClient`: browser client that manages anonymous identity and caches identified users.
- `Spotzee`: static browser singleton exposed as `window.Spotzee`.

The generated API client is exported separately through `@spotzee/js-sdk/generated`.
