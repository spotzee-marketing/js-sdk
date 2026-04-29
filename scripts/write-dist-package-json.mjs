#!/usr/bin/env node
//
// Per Node's official dual-package recipe
// (https://nodejs.org/api/packages.html#dual-commonjses-module-packages),
// a `package.json` inside each output directory declares its `type` so Node
// resolves `lib/esm/*.js` as ESM and `lib/cjs/*.js` as CommonJS — independent
// of the parent package's `type` field.
//
// Required because the SDK ships dual builds (CJS + ESM) without setting
// `"type": "module"` at the package root.
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const targets = [
    [resolve(root, 'lib/cjs/package.json'), { type: 'commonjs' }],
    [resolve(root, 'lib/esm/package.json'), { type: 'module' }],
]

for (const [path, body] of targets) {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, JSON.stringify(body, null, 2) + '\n')
    console.log(`wrote ${path}`)
}
