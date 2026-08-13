/**
 * Everything this site loads by URL goes through here.
 *
 * The portfolio is not served from the root of a domain. It is mounted at
 * `/theworks` on halcyon.uno, so a hard-coded `/shots/x.png` or
 * `/demos/quotation/` resolves to halcyon.uno's root and 404s. Vite rewrites the
 * URLs it can see for itself (the module graph, the CSS), but a path built at
 * runtime out of a template string is invisible to it, and those are exactly the
 * ones this site is made of: every screenshot and every demo.
 *
 * `import.meta.env.BASE_URL` is whatever `base` is set to in vite.config.ts, and
 * always ends in a slash.
 */

/** Absolute URL for something in `public/`, given a path relative to it. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

/**
 * Absolute URL for a demo, keeping any hash route intact.
 *
 * The foundry demo addresses its two views with `#/split` and `#/worker`, and a
 * naive join would put the base after the hash.
 */
export function demoUrl(path: string): string {
  return asset(path)
}
