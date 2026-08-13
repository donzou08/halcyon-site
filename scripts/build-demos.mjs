#!/usr/bin/env node
/**
 * Builds every vendored demo and drops its output into public/demos/<slug>/.
 *
 * The demos are separate Vite apps with their own dependencies and their own
 * React versions, so they are never bundled into the showcase. They are built
 * independently and served as static sub-applications from the same origin,
 * which is what lets the showcase embed them in an iframe and still reach into
 * their localStorage to reset them. A cross-origin embed could not do that:
 * Safari partitions third-party storage, and every one of these demos keeps its
 * state in localStorage.
 *
 * Output is committed, so a deploy only ever has to build the shell.
 *
 *   node scripts/build-demos.mjs              build all
 *   node scripts/build-demos.mjs tender       build one
 */

import { execSync } from 'node:child_process'
import { cpSync, existsSync, rmSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DEMOS = ['quotation', 'supervisor', 'tender', 'foundry', 'command-center']

/**
 * The site's mount point. Must match `base` in vite.config.ts.
 *
 * Each demo's own vite config sets `base: '/demos/<slug>/'`, which is right only
 * when the site is served from the root of a domain. It is not: it lives at
 * halcyon.uno/theworks, so every demo has to be rebuilt with the mount in front
 * of it or its script and stylesheet resolve to halcyon.uno/demos/... and the
 * iframe renders an empty page. The failure is silent, and it looks like a
 * broken demo rather than a wrong path, so it is worth overriding here rather
 * than in five separate configs that can drift.
 */
const MOUNT = (process.env.PORTFOLIO_BASE ?? '/theworks/').replace(/\/?$/, '/')

const only = process.argv.slice(2)
const targets = only.length ? DEMOS.filter((d) => only.includes(d)) : DEMOS

if (only.length && targets.length !== only.length) {
  console.error(`Unknown demo. Known: ${DEMOS.join(', ')}`)
  process.exit(1)
}

for (const slug of targets) {
  const dir = join(root, 'demos', slug)
  const out = join(root, 'public', 'demos', slug)

  if (!existsSync(join(dir, 'node_modules'))) {
    console.log(`\n[${slug}] installing dependencies`)
    execSync('npm install --no-audit --no-fund', { cwd: dir, stdio: 'inherit' })
  }

  const base = `${MOUNT}demos/${slug}/`
  console.log(`\n[${slug}] building with base ${base}`)
  execSync(`npm run build -- --base=${base}`, { cwd: dir, stdio: 'inherit' })

  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  cpSync(join(dir, 'dist'), out, { recursive: true })
  console.log(`[${slug}] -> public/demos/${slug}/`)
}

console.log(`\nDone. ${targets.length} demo${targets.length === 1 ? '' : 's'} built.`)
