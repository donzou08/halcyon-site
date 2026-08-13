const { chromium, devices } = await import(
  process.env.PLAYWRIGHT ?? '/root/projects/halcyon-studio/capture/node_modules/playwright/index.mjs'
)
const OUT = process.env.OUT ?? '/tmp'
const U = process.env.BASE ?? 'http://localhost:4200'
const b = await chromium.launch()
const phone = devices['iPhone 13']
const fails = []
const ok = (l, c, x = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${l}${x ? ' :: ' + x : ''}`); if (!c) fails.push(l) }

for (const slug of ['quotation', 'supervisor', 'tender', 'foundry', 'command-center']) {
  const ctx = await b.newContext({ ...phone })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push('THROWN: ' + e.message))
  p.on('console', (m) => m.type() === 'error' && errs.push('CONSOLE: ' + m.text().slice(0, 70)))
  await p.goto(`${U}/system/${slug}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(600)

  // A page that throws is broken even when every other assertion passes.
  ok(`${slug}: no console errors`, errs.length === 0, errs[0] ?? '')

  // 1. Is the launch button reachable without a marathon scroll?
  const btn = p.getByRole('button', { name: 'Open the demo' })
  const box = await btn.boundingBox()
  const vh = p.viewportSize().height
  ok(`${slug}: launch button within one screen`, !!box && box.y < vh * 1.25,
    box ? `y=${Math.round(box.y)} of ${vh}` : 'NOT FOUND')

  // 2. No inline iframe on a phone (that was the nested-scroll trap)
  ok(`${slug}: no inline iframe on phone`, (await p.locator('iframe').count()) === 0)

  // 3. Open it: does the app fill the screen?
  await btn.click()
  await p.waitForTimeout(2600)
  const fb = await p.locator('iframe').boundingBox()
  ok(`${slug}: opens full width`, !!fb && fb.width >= p.viewportSize().width - 1,
    fb ? `${Math.round(fb.width)}px of ${p.viewportSize().width}` : 'no iframe')

  // 4. Is the app actually usable in there?
  const f = p.frameLocator('iframe')
  const taps = await f.locator('button, a[href], input, select').count().catch(() => -1)
  const body = await f.locator('body').innerText().catch(() => '')
  ok(`${slug}: app is live in full screen`, taps > 0 && body.trim().length > 30, `${taps} controls`)

  // 5. Page behind must not scroll (that is what made touch feel broken)
  const locked = await p.evaluate(() => getComputedStyle(document.body).overflow)
  ok(`${slug}: page behind is locked`, locked === 'hidden', locked)

  await p.screenshot({ path: `${OUT}/MF-${slug}.png` })

  // 6. Close returns you to the page
  await p.getByRole('button', { name: 'Close' }).click()
  await p.waitForTimeout(500)
  ok(`${slug}: closes cleanly`, (await p.locator('iframe').count()) === 0 &&
    (await p.evaluate(() => getComputedStyle(document.body).overflow)) !== 'hidden')

  await ctx.close()
}
await b.close()
console.log(fails.length ? `\n${fails.length} FAILURES: ${fails.join(', ')}` : '\nAll mobile checks passed.')
