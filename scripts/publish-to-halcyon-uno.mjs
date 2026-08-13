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
import { cpSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
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

/**
 * Give every client-side route a real index.html.
 *
 * The portfolio is a single page application, so `/theworks/quotation` is not a
 * file, and normally the host is told to answer it with the shell. On this
 * project that could not be made to work: with `cleanUrls` on, Vercel answers
 * the missing file with a 404 before any rewrite runs, and the legacy `routes`
 * array does not compose with `cleanUrls` either. Both failures look like a bad
 * pattern and are neither.
 *
 * Writing the shell to each route sidesteps the question. Every URL becomes a
 * real file, the filesystem serves it with no rule at all, and the router takes
 * over once it loads. It costs a few kilobytes and it cannot silently break.
 */
const shell = join(out, 'index.html')

// Only the systems. NICHES declares slugs too, and those are anchors on the
// index rather than routes.
const catalogue = readFileSync(join(root, 'src/data/catalogue.ts'), 'utf8')
const systemsBlock = catalogue.slice(catalogue.indexOf('export const SYSTEMS'))
const slugs = [...systemsBlock.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((m) => m[1])

if (slugs.length === 0) {
  console.error('Found no system slugs in catalogue.ts. Routes would 404.')
  process.exit(1)
}

const routes = [
  'contact',
  ...slugs,
  // Shapes that exist in Instagram captions and LinkedIn posts already, and the
  // pages this site used to carry. main.tsx redirects every one of them, but a
  // redirect that lives in the router only runs once the router has loaded, and
  // it cannot load if the server never serves anything.
  'works',
  'systems',
  'approach',
  'engagements',
  'pricing',
  ...slugs.map((s) => `works/${s}`),
  ...slugs.map((s) => `system/${s}`),
]

for (const route of routes) {
  const dir = join(out, route)
  mkdirSync(dir, { recursive: true })
  copyFileSync(shell, join(dir, 'index.html'))
}

const count = (dir) =>
  readdirSync(dir, { withFileTypes: true }).reduce(
    (n, e) => n + (e.isDirectory() ? count(join(dir, e.name)) : 1),
    0,
  )

console.log(`Copied ${count(out)} files to ${out}`)
console.log(`Wrote ${routes.length} route shells: ${routes.slice(0, 6).join(', ')}, ...`)
console.log(`Commit them in ${target}, then push. Live at halcyon.uno/${mount}`)
