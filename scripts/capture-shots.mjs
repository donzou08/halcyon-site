/**
 * Captures the product screenshots the site is built on.
 *
 * The whole argument of this site is "here is the software, running". Cards that
 * carry only prose ask a stranger to take that on trust. These shots are the
 * evidence, so they are generated from the real demos rather than mocked up, and
 * they are regenerated whenever a demo changes.
 *
 *   node scripts/serve-like-vercel.mjs 4200      # in another shell
 *   node scripts/capture-shots.mjs
 *
 * Playwright is not a dependency of this project (the build machine never needs
 * it, and the shots are committed). It is resolved from wherever it already
 * exists on this machine; PLAYWRIGHT_DIR overrides the search.
 */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:4200'
const OUT = resolve(import.meta.dirname, '../public/shots')

const CANDIDATES = [
  process.env.PLAYWRIGHT_DIR,
  '/root/projects/halcyon-studio/capture',
  '/root/projects/Love Brand/lovah',
].filter(Boolean)

function loadPlaywright() {
  for (const dir of CANDIDATES) {
    try {
      return createRequire(`${dir}/package.json`)('playwright')
    } catch {
      /* try the next one */
    }
  }
  throw new Error(
    `Could not find playwright. Set PLAYWRIGHT_DIR to a folder whose node_modules has it.\nTried: ${CANDIDATES.join(', ')}`,
  )
}

/**
 * `phone` shots are 390x844 at 2x, the frame the site draws them in.
 * `screen` shots are 1360x850 at 2x, cropped by the browser chrome we draw.
 *
 * Steps are text to click, `btn:` for a button by accessible name (several demos
 * render a heading with the same words as the button, and the plain text match
 * picks the heading), and `wait:ms` to let an animation land.
 */
const SHOTS = [
  {
    name: 'quotation-review',
    url: '/demos/quotation/',
    kind: 'phone',
    steps: [
      'Continue as Owner',
      'Create new quote',
      'Orion Auto Components',
      'btn:Next',
      '18,000',
      'btn:Next',
      '3mm Epoxy Self-Levelling',
      'btn:Next',
      'btn:Next',
      'wait:600',
    ],
  },
  {
    name: 'quotation-systems',
    url: '/demos/quotation/',
    kind: 'phone',
    steps: ['Continue as Owner', 'Create new quote', 'Orion Auto Components', 'btn:Next', '18,000', 'btn:Next', 'wait:600'],
  },
  {
    name: 'quotation-home',
    url: '/demos/quotation/',
    kind: 'phone',
    steps: ['Continue as Owner', 'wait:600'],
  },
  {
    name: 'supervisor-dashboard',
    url: '/demos/supervisor/',
    kind: 'phone',
    steps: ['Continue as Owner', 'wait:900'],
  },
  {
    name: 'supervisor-home',
    url: '/demos/supervisor/',
    kind: 'phone',
    steps: ['wait:600'],
  },
  {
    name: 'tender-scan',
    url: '/demos/tender/',
    kind: 'phone',
    steps: ["Run today's scan", 'wait:5000'],
  },
  {
    name: 'tender-home',
    url: '/demos/tender/',
    kind: 'phone',
    steps: ['wait:600'],
  },
  {
    name: 'command-center',
    url: '/demos/command-center/',
    kind: 'screen',
    steps: ['wait:1200'],
  },
  {
    name: 'foundry-split',
    url: '/demos/foundry/#/split',
    kind: 'screen',
    steps: ['wait:1200'],
  },
  {
    name: 'foundry-worker',
    url: '/demos/foundry/#/worker',
    kind: 'phone',
    steps: ['wait:900'],
  },
]

const SIZES = {
  phone: { width: 390, height: 844 },
  screen: { width: 1360, height: 850 },
}

const { chromium } = loadPlaywright()

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ args: ['--disable-dev-shm-usage', '--no-sandbox'] })
let failures = 0

for (const shot of SHOTS) {
  const size = SIZES[shot.kind]
  const ctx = await browser.newContext({
    viewport: size,
    deviceScaleFactor: 2,
    isMobile: shot.kind === 'phone',
    hasTouch: shot.kind === 'phone',
  })
  const page = await ctx.newPage()
  try {
    await page.goto(BASE + shot.url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(1200)

    for (const step of shot.steps) {
      if (step.startsWith('wait:')) {
        await page.waitForTimeout(Number(step.slice(5)))
      } else if (step.startsWith('btn:')) {
        await page.getByRole('button', { name: step.slice(4), exact: false }).first().click({ timeout: 8000 })
        await page.waitForTimeout(700)
      } else {
        await page.getByText(step, { exact: false }).first().click({ timeout: 8000 })
        await page.waitForTimeout(700)
      }
    }

    await page.screenshot({ path: `${OUT}/${shot.name}.png` })
    console.log('captured', shot.name)
  } catch (err) {
    failures += 1
    console.error('FAILED  ', shot.name, err.message.split('\n')[0])
  }
  await ctx.close()
}

await browser.close()

if (failures > 0) {
  console.error(`\n${failures} shot(s) failed. The site will fall back to the demo frame for those.`)
  process.exit(1)
}
console.log(`\nAll ${SHOTS.length} shots written to public/shots/`)
