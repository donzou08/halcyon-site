#!/usr/bin/env node
/**
 * A local server that follows the same rule as vercel.json: anything under
 * /demos/ is served straight off disk, everything else falls back to the
 * showcase's index.html so client-side routing works.
 *
 * This exists because `serve -s` rewrites *every* path to index.html, which
 * silently turns each embedded demo into the showcase's own 404 page. That is
 * exactly the failure this configuration has to prevent, so it needs a server
 * that can actually reproduce production behaviour.
 *
 *   node scripts/serve-like-vercel.mjs [port]
 */

import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const port = Number(process.argv[2] ?? 4200)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
}

function resolve(urlPath) {
  // Strip the query, decode, and refuse anything that climbs out of dist.
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0]))
  if (clean.includes('..')) return null
  let file = join(root, clean)
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  return existsSync(file) && statSync(file).isFile() ? file : null
}

createServer((req, res) => {
  const path = req.url ?? '/'
  let file = resolve(path)

  // Everything outside /demos/ falls back to the SPA shell.
  if (!file && !path.startsWith('/demos/')) file = join(root, 'index.html')

  if (!file || !existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('Not found')
    return
  }

  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  })
  createReadStream(file).pipe(res)
}).listen(port, () => console.log(`dist on http://localhost:${port} (demos served from disk)`))
