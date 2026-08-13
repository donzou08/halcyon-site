import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * The portfolio is mounted at halcyon.uno/theworks, not at the root of a domain.
 *
 * `base` is what makes every URL Vite emits carry that prefix. Paths built at
 * runtime are invisible to it and go through `src/lib/paths.ts` instead.
 *
 * Override with PORTFOLIO_BASE to publish it somewhere else. Changing it means
 * rebuilding and recopying: the prefix is baked into the output.
 */
const base = process.env.PORTFOLIO_BASE ?? '/theworks/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: { port: 4100 },
})
