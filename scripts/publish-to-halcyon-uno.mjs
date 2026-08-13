#!/usr/bin/env node
/**
 * Copies the built portfolio into the halcyon.uno repo at /theworks.
 *
 * The portfolio is served by the halcyon.uno Vercel project rather than by one
 * of its own. That is not laziness: every demo keeps its state in localStorage,
 * and reaching it through a cross-project rewrite or a second domain either
 * partitions that storage away or forces a proxy for every asset path. Living
 * inside the same deployment makes same-origin a fact rather than a
 * configuration, and it leaves one URL to give people.
 *
 * The cost is that the built output is committed twice, and that this has to be
 * run whenever the portfolio changes. `npm run build:all` first, or the copy is
 * of a stale dist.
 *
 *   npm run build:all && npm run publish:theworks
 */
import { cpSync, existsSync, rmSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const target = process.env.HALCYON_UNO ?? join(root, '..', 'halcyon-website')
const mount = (process.env.PORTFOLIO_BASE ?? '/theworks/').replace(/^\/|\/$/g, '')
const out = join(target, mount)

if (!existsSync(dist)) {
  console.error('No dist/. Run `npm run build:all` first.')
  process.exit(1)
}
if (!existsSync(join(target, 'index.html'))) {
  console.error(`Not the halcyon.uno repo: ${target}\nSet HALCYON_UNO to its path.`)
  process.exit(1)
}

// A stale file left behind is worse than a missing one: it is served, and it is
// wrong. The whole directory goes.
rmSync(out, { recursive: true, force: true })
cpSync(dist, out, { recursive: true })

const count = (dir) =>
  readdirSync(dir, { withFileTypes: true }).reduce(
    (n, e) => n + (e.isDirectory() ? count(join(dir, e.name)) : 1),
    0,
  )

console.log(`Copied ${count(out)} files to ${out}`)
console.log(`Commit them in ${target}, then push. Live at halcyon.uno/${mount}`)
