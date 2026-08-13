/**
 * Drives a real browser over the whole site.
 *
 * The failures worth catching here are the ones that look like content problems
 * rather than crashes: a demo whose iframe silently renders the shell's own 404
 * page inside the frame, a screenshot that 404s and leaves a card with a hole in
 * it, a search that stops returning the system it is supposed to. None of those
 * throw, and none of them show up in a build.
 *
 *   node scripts/serve-like-vercel.mjs 4400      # in another shell
 *   node scripts/check.mjs [baseUrl]
 */
import { createRequire } from 'node:module'

const BASE = process.argv[2] ?? process.env.BASE ?? 'http://localhost:4400/theworks'

/** The path this site is mounted at, derived from BASE, with no trailing slash. */
const MOUNT = new URL(BASE).pathname.replace(/\/$/, '')
/** Compare a browser pathname against a site-relative route. */
const at = (route) => MOUNT + (route === '/' ? '' : route)

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
      /* next */
    }
  }
  throw new Error('Could not find playwright. Set PLAYWRIGHT_DIR.')
}

const { chromium } = loadPlaywright()

const SYSTEMS = ['quotation', 'supervisor', 'tender', 'foundry', 'command-center']

/**
 * query -> the slug that must come back first.
 *
 * The plurals are here on purpose. Every one of the suggestion chips under the
 * search field is checked, because a chip that returns nothing is worse than no
 * chip: the visitor concludes the field is decorative and stops using it. That
 * is exactly what "Quotations" did before the singulariser went into search.ts.
 */
const SEARCHES = {
  // The suggestion chips, verbatim.
  Quotations: 'quotation',
  'Field staff': 'supervisor',
  Tenders: 'tender',
  'Counting production': 'foundry',
  'Everything in one place': 'command-center',
  'Pest control': 'supervisor',
  'WhatsApp photos': 'supervisor',
  // Trades and tools nobody here has worked in.
  garment: 'foundry',
  cashflow: 'command-center',
  excel: 'quotation',
  scrap: 'foundry',
  gst: 'quotation',
  // Typed as a sentence, the way an owner actually asks.
  'we keep retyping quotations': 'quotation',
  'sites we send people to': 'supervisor',
}

/**
 * query -> a slug that must appear somewhere in the results.
 *
 * Some words genuinely belong to more than one system and forcing a winner
 * would be fitting the ranking to the test. An owner searching "invoices" might
 * mean raising them or chasing them, and both answers are useful, so the only
 * real requirement is that neither is dropped.
 */
const SEARCHES_CONTAIN = {
  invoices: ['quotation', 'command-center'],
  reports: ['supervisor'],
  'one screen': ['command-center'],
}

let failures = 0
const fail = (msg) => {
  failures += 1
  console.error('  FAIL  ' + msg)
}
const pass = (msg) => console.log('  ok    ' + msg)

const browser = await chromium.launch({ args: ['--disable-dev-shm-usage', '--no-sandbox'] })

/* ------------------------------------------------------------------ *
 * Pages load, and nothing 404s that the page depends on.
 * ------------------------------------------------------------------ */
console.log('\nPages')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  const missing = []
  page.on('response', (r) => {
    const p = new URL(r.url()).pathname
    // /_vercel/ is injected by the platform and only exists once deployed.
    if (p.startsWith('/_vercel/')) return
    if (r.status() >= 400 && new URL(r.url()).origin === new URL(BASE).origin) {
      missing.push(`${r.status()} ${p}`)
    }
  })

  /* The bare mount URL, with no trailing slash, is checked first and by itself.
     It is the URL a person types and the one that gets shared, and it is the
     only one that exercises the router's basename against a pathname that does
     not end in a slash. It rendered a blank page in production while every
     other route on this list was fine. */
  {
    const res = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(2500)
    const h1 = await page.locator('h1').first().innerText().catch(() => '')
    if (res && res.status() < 400 && h1.trim()) pass(`${BASE} renders "${h1.trim().slice(0, 34)}"`)
    else fail(`${BASE} (no trailing slash) rendered nothing`)
  }

  for (const path of ['/', '/contact', '/industrial-flooring', ...SYSTEMS.map((s) => `/${s}`)]) {
    missing.length = 0
    const res = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 })
    if (!res || res.status() >= 400) {
      fail(`${path} returned ${res?.status()}`)
      continue
    }
    const h1 = await page.locator('h1').first().innerText().catch(() => '')
    if (!h1.trim()) fail(`${path} has no h1`)
    else if (missing.length) fail(`${path} requested ${missing.join(', ')}`)
    else pass(`${path}  "${h1.trim().slice(0, 46)}"`)
  }

  /* A path nobody published is answered by the host, not by the router.
     Every route this site owns is written to disk at publish time, so an
     unknown one has no file and never reaches the application. That is the
     intended trade: it is what makes the mount independent of one host's
     rewrite semantics, and the cost is that the shell's own 404 page is only
     reachable when the router is already running. The requirement is that an
     unknown path is refused rather than answered with the wrong page, which is
     the failure that actually matters. */
  const res404 = await page.goto(BASE + '/nonsense-route', { waitUntil: 'domcontentloaded' })
  const body = await page.evaluate(() => document.body.innerText).catch(() => '')
  if (body.includes('There is no page here')) pass('an unpublished path shows the 404 page')
  else if (res404 && res404.status() === 404) pass('an unpublished path is refused')
  else fail(`an unpublished path returned ${res404?.status()} and rendered something else`)

  // Old links that exist in the world must still land.
  for (const [from, to] of [
    ['/system/quotation', '/quotation'],
    ['/works/quotation', '/quotation'],
    ['/works', '/'],
    ['/engagements', '/contact'],
    ['/flooring', '/industrial-flooring'],
  ]) {
    await page.goto(BASE + from, { waitUntil: 'networkidle' })
    const landed = new URL(page.url()).pathname.replace(/\/$/, '') || '/'
    landed === (at(to) || '/')
      ? pass(`${from} redirects to ${to}`)
      : fail(`${from} went to ${landed}, expected ${at(to) || '/'}`)
  }

  await ctx.close()
}

/* ------------------------------------------------------------------ *
 * Every product screenshot resolves. A missing one is a hole in a card.
 * ------------------------------------------------------------------ */
console.log('\nScreenshots')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  const broken = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src')),
  )
  const count = await page.locator('img').count()
  if (broken.length) fail(`broken images: ${broken.join(', ')}`)
  else if (count < 5) fail(`only ${count} images on the index, expected at least 5`)
  else pass(`${count} images on the index, all decoded`)
  await ctx.close()
}

/* ------------------------------------------------------------------ *
 * Search still answers the way it is supposed to.
 * ------------------------------------------------------------------ */
console.log('\nSearch')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  const field = page.locator('#system-search')

  for (const [query, slug] of Object.entries(SEARCHES)) {
    await field.fill(query)
    await page.waitForTimeout(220)
    const first = await page
      .locator('article a[href^="/"]')
      .first()
      .getAttribute('href')
      .catch(() => null)
    if (first === at(`/${slug}`)) pass(`"${query}" → ${slug}`)
    else fail(`"${query}" → ${first ?? 'nothing'}, expected ${at(`/${slug}`)}`)
  }

  for (const [query, slugs] of Object.entries(SEARCHES_CONTAIN)) {
    await field.fill(query)
    await page.waitForTimeout(220)
    const hrefs = await page.locator('article a[href^="/"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute('href')),
    )
    const missing = slugs.filter((s) => !hrefs.includes(at(`/${s}`)))
    missing.length === 0
      ? pass(`"${query}" returns ${slugs.join(' and ')}`)
      : fail(`"${query}" dropped ${missing.join(', ')}; got ${hrefs.join(', ') || 'nothing'}`)
  }

  // A query that matches nothing must reach the capture screen, not "no results".
  await field.fill('zzzqqq')
  await page.waitForTimeout(250)
  const asks = await page.locator('text=That is worth a conversation').count()
  asks > 0 ? pass('an unmatched search asks what they run') : fail('empty state did not render')

  await ctx.close()
}

/* ------------------------------------------------------------------ *
 * Every demo boots inside its frame, on a real origin.
 *
 * `serve -s dist` rewrites /demos/<slug>/ to the shell's index.html, so each
 * embed renders the showcase's own 404 inside the phone frame. It looks like a
 * broken demo rather than a broken server, which is exactly why this is checked.
 * ------------------------------------------------------------------ */
console.log('\nDemos')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()

  for (const slug of SYSTEMS) {
    await page.goto(`${BASE}/${slug}`, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(2500)
    const frame = page.frames().find((f) => f.url().includes('/demos/'))
    if (!frame) {
      fail(`${slug}: no demo iframe`)
      continue
    }
    const text = await frame.evaluate(() => document.body.innerText).catch(() => '')
    if (!text.trim()) fail(`${slug}: demo frame is empty`)
    else if (text.includes('There is no page here')) fail(`${slug}: the shell's 404 rendered inside the frame`)
    else pass(`${slug}: booted, "${text.trim().replace(/\s+/g, ' ').slice(0, 40)}"`)
  }
  await ctx.close()
}

/* ------------------------------------------------------------------ *
 * The contact form walks all three steps and refuses to skip one.
 * Nothing is submitted; the last step is filled but never sent.
 * ------------------------------------------------------------------ */
console.log('\nContact form')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/contact', { waitUntil: 'networkidle' })

  await page.getByRole('button', { name: 'Next' }).click()
  await page.waitForTimeout(200)
  const blocked = await page.locator('text=Step 1 of 3').count()
  blocked > 0 ? pass('an empty step 1 does not advance') : fail('step 1 advanced while empty')

  await page.getByRole('button', { name: 'Manufacturing' }).click()
  await page.getByLabel('Company name').fill('Test Industries')
  await page.getByLabel('What does the business actually do?').fill('Checking the form.')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.waitForTimeout(300)
  ;(await page.locator('text=Step 2 of 3').count()) > 0
    ? pass('step 1 advances once answered')
    : fail('step 1 did not advance when valid')

  await page.getByLabel('The main problem').fill('Checking the form.')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.waitForTimeout(300)
  ;(await page.locator('text=Step 3 of 3').count()) > 0
    ? pass('step 2 advances')
    : fail('step 2 did not advance')
  ;(await page.getByRole('button', { name: 'Send this' }).count()) > 0
    ? pass('step 3 offers the send button')
    : fail('no send button on step 3')

  await ctx.close()
}

/* ------------------------------------------------------------------ *
 * Nothing on the site scrolls sideways on a phone.
 * ------------------------------------------------------------------ */
console.log('\nMobile')
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await ctx.newPage()
  for (const path of ['/', '/quotation', '/supervisor', '/command-center', '/contact', '/industrial-flooring']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(600)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    overflow <= 1 ? pass(`${path} does not scroll sideways`) : fail(`${path} overflows by ${overflow}px`)
  }

  // The menu has to open, and close on navigation.
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.waitForTimeout(300)
  // Scoped to the header: the footer carries the same link on every page.
  const menuOpen = await page
    .getByRole('banner')
    .getByRole('link', { name: 'The work', exact: true })
    .isVisible()
  menuOpen ? pass('the mobile menu opens') : fail('the mobile menu did not open')

  /* Below 1024px a demo has no inline frame; it opens over the whole viewport
     instead. That is the only way to reach a demo on a phone, so it is the one
     mobile interaction that has to be exercised rather than merely rendered.
     The button is matched by its full name: "Open menu" also starts with
     "Open", and a looser match opens the navigation and passes for the wrong
     reason. */
  const LAUNCH = [
    ['quotation', 'Open Quotation Engine'],
    ['supervisor', 'Open Field Supervisor'],
    ['foundry', 'Open Production Counting'],
  ]
  for (const [slug, button] of LAUNCH) {
    await page.goto(`${BASE}/${slug}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)
    await page.getByRole('button', { name: button }).click()
    await page.waitForTimeout(3000)

    const frame = page.frames().find((f) => f.url().includes('/demos/'))
    const text = frame ? await frame.evaluate(() => document.body.innerText).catch(() => '') : ''
    if (!text.trim()) fail(`${slug}: the full screen demo is empty on a phone`)
    else if (text.includes('There is no page here')) fail(`${slug}: the shell's 404 rendered full screen`)
    else pass(`${slug}: opens full screen on a phone`)

    const close = page.getByRole('button', { name: 'Close' })
    if ((await close.count()) === 0) {
      fail(`${slug}: no way out of the full screen demo`)
      continue
    }
    await close.click()
    await page.waitForTimeout(400)
    ;(await page.getByRole('button', { name: 'Close' }).count()) === 0
      ? pass(`${slug}: closes again`)
      : fail(`${slug}: Close did not dismiss the demo`)
  }

  // The foundry demo must get its phone route, not the split screen, which is
  // unreadable at 390px.
  await page.goto(`${BASE}/foundry`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.getByRole('button', { name: 'Open Production Counting' }).click()
  await page.waitForTimeout(2500)
  const foundryUrl = page.frames().find((f) => f.url().includes('/demos/'))?.url() ?? ''
  foundryUrl.includes('#/worker')
    ? pass('foundry opens its phone route on a phone')
    : fail(`foundry opened ${foundryUrl || 'nothing'}, expected #/worker`)

  await ctx.close()
}

/* ------------------------------------------------------------------ *
 * The contact block is legible on whatever it is sitting on.
 *
 * This is measured from the rendered page rather than read from the markup,
 * because the markup was correct when it broke. ContactRoutes is styled for the
 * paper ground, and dropping it onto the obsidian closing section rendered
 * near-black text on near-black: two of the three buttons were empty outlines
 * and the third lost its fill. Every link worked, every string was present, and
 * all eighty-two checks passed while the only conversion block on six pages was
 * invisible.
 *
 * Contrast is the one property no amount of asserting on text can catch.
 * ------------------------------------------------------------------ */
console.log('\nContact block legibility')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  // Relative luminance, then the WCAG ratio. Walks up for the first painted
  // background, because the element's own is usually transparent.
  const MEASURE = () => {
    const lum = (c) => {
      const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number)
      const f = (v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const groundOf = (el) => {
      for (let n = el; n; n = n.parentElement) {
        const bg = getComputedStyle(n).backgroundColor
        if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg
      }
      return 'rgb(255,255,255)'
    }
    return [...document.querySelectorAll('a[href*="wa.me"], a[href^="tel:"], a[href^="mailto:"]')]
      .filter((a) => a.offsetParent !== null)
      .map((a) => {
        const cs = getComputedStyle(a)
        const own = cs.backgroundColor
        const ground = /rgba\(0, 0, 0, 0\)|transparent/.test(own) ? groundOf(a.parentElement) : own
        const L1 = lum(cs.color)
        const L2 = lum(ground)
        const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
        return { label: a.innerText.trim().slice(0, 22), ratio: Math.round(ratio * 10) / 10 }
      })
  }

  for (const path of ['/', '/industrial-flooring', '/supervisor', '/contact']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const results = await page.evaluate(MEASURE)
    if (results.length === 0) {
      fail(`${path} shows no contact link at all`)
      continue
    }
    const illegible = results.filter((r) => r.ratio < 4.5)
    illegible.length === 0
      ? pass(`${path}: ${results.length} contact links legible (worst ${Math.min(...results.map((r) => r.ratio))}:1)`)
      : fail(`${path} illegible: ${illegible.map((r) => `"${r.label}" ${r.ratio}:1`).join(', ')}`)
  }
  await ctx.close()
}

/* ------------------------------------------------------------------ *
 * The published figures are exactly the ones in the ledger.
 *
 * This site and halcyon.uno/work both quote the same production counts, read on
 * 2026-08-04. They drifted apart once already: this site carried 23 sites and
 * 100% GPS while the case studies carried 97 and 92%, and a visitor crossing
 * between them saw one system described two ways. Pinning the exact strings is
 * the only thing that catches that, because both sets look perfectly reasonable
 * on their own page.
 *
 * Changing a figure here means changing it in proof-ledger.md and on
 * halcyon.uno in the same pass, and then changing this list.
 * ------------------------------------------------------------------ */
console.log('\nProof figures')
{
  const EXPECTED = {
    '/supervisor': ['289', '97', '100%'],
    '/quotation': ['₹47.54 cr', '36', 'Under 1 minute'],
    '/tender': ['5 minutes', '129', '9'],
  }
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  for (const [path, values] of Object.entries(EXPECTED)) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    const text = await page.evaluate(() => document.body.innerText)
    const missing = values.filter((v) => !text.includes(v))
    missing.length === 0
      ? pass(`${path} carries ${values.join(', ')}`)
      : fail(`${path} is missing ${missing.join(', ')}`)
  }

  /* Retired figures must not come back from an old draft. 92% was published as
     a weaker version of a capability claim; every check-in captures a location,
     which is 100%. */
  for (const path of ['/supervisor', '/', '/industrial-flooring']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    const text = await page.evaluate(() => document.body.innerText)
    const retired = ['92%', '23 sites tracked live', '28 team members'].filter((r) =>
      text.includes(r),
    )
    retired.length === 0
      ? pass(`${path} carries no retired figure`)
      : fail(`${path} reinstated: ${retired.join(', ')}`)
  }
  await ctx.close()
}

/* ------------------------------------------------------------------ *
 * The flooring landing page reaches its three systems.
 *
 * It exists to send a flooring contractor into the tender, quotation and
 * supervisor demos. A page that describes them without linking to them is a
 * brochure, which is the thing this site is not.
 * ------------------------------------------------------------------ */
console.log('\nIndustrial flooring page')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/industrial-flooring', { waitUntil: 'networkidle' })

  for (const slug of ['tender', 'quotation', 'supervisor']) {
    const n = await page.locator(`a[href="${at('/' + slug)}"]`).count()
    n > 0 ? pass(`links to ${slug}`) : fail(`no link to /${slug} on the flooring page`)
  }

  // The rate card and the stage sequence are what prove it knows the trade.
  const text = await page.evaluate(() => document.body.innerText)
  const trade = ['6mm PU Concrete', 'ESD', 'Surface preparation', 'Line marking', 'CGST']
  const absent = trade.filter((t) => !text.includes(t))
  absent.length === 0
    ? pass('carries the rate card and the stage sequence')
    : fail(`flooring page is missing: ${absent.join(', ')}`)

  const imgs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).filter((i) => i.complete && i.naturalWidth === 0)
      .length,
  )
  imgs === 0 ? pass('every screenshot decodes') : fail(`${imgs} broken screenshots`)

  await ctx.close()
}

/* ------------------------------------------------------------------ *
 * The ways to reach a person actually work.
 *
 * These are the only conversion on the site, and every one of them is a
 * hand-built URL that fails silently: a tel: link with a space in it does
 * nothing on a phone, and a wa.me link with a + or a space in the number opens
 * WhatsApp on an error screen rather than a chat. Nothing in a build or a type
 * check looks at the inside of an href.
 * ------------------------------------------------------------------ */
console.log('\nContact routes')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/contact', { waitUntil: 'networkidle' })

  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')),
  )

  /* The header button is checked on a system page rather than /contact,
     because it has to be there on every page. The bottom-of-page WhatsApp
     links sit around 4000px down, which is not a route to anything: the whole
     point of this one is that it is reachable without scrolling. */
  {
    const hdr = await page.evaluate(() => {
      const a = document.querySelector('header a[href*="wa.me"]')
      if (!a) return null
      const r = a.getBoundingClientRect()
      return { top: Math.round(r.top), visible: r.width > 0 && r.height > 0, svg: !!a.querySelector('svg') }
    })
    if (!hdr) fail('no WhatsApp button in the header')
    else if (!hdr.visible || hdr.top > 120) fail(`header WhatsApp button is not reachable (top ${hdr.top})`)
    else if (!hdr.svg) fail('header WhatsApp button has no glyph')
    else pass(`WhatsApp button sits in the header (${hdr.top}px from the top)`)
  }

  const tel = hrefs.filter((h) => h.startsWith('tel:'))
  const wa = hrefs.filter((h) => h.includes('wa.me'))
  const mail = hrefs.filter((h) => h.startsWith('mailto:'))

  // tel: must be digits after a single leading +, or a dialler ignores it.
  const badTel = tel.filter((h) => !/^tel:\+[0-9]{8,15}$/.test(h))
  tel.length === 0
    ? fail('no phone link on /contact')
    : badTel.length
      ? fail(`malformed tel link: ${badTel.join(', ')}`)
      : pass(`phone link is diallable (${tel[0]})`)

  // wa.me wants bare digits including the country code. No +, no spaces.
  const badWa = wa.filter((h) => !/^https:\/\/wa\.me\/[0-9]{10,15}(\?|$)/.test(h))
  wa.length === 0
    ? fail('no WhatsApp link on /contact')
    : badWa.length
      ? fail(`malformed WhatsApp link: ${badWa.join(', ')}`)
      : pass(`WhatsApp link is well formed (${wa[0].split('?')[0]})`)

  mail.length ? pass(`email link present (${mail[0].split('?')[0]})`) : fail('no email link')

  // The message a system page sends should name that system, or the first
  // thing Sanjith sees is an unknown number saying nothing.
  await page.goto(BASE + '/supervisor', { waitUntil: 'networkidle' })
  // Every one of them, not just the first: the header, the closing button and
  // the footer are three separate entry points and all three should arrive
  // saying what the visitor was reading.
  const sysWa = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href*="wa.me"]')).map((a) => a.getAttribute('href')),
  )
  const generic = sysWa.filter((h) => !decodeURIComponent(h).includes('Field Supervisor'))
  sysWa.length === 0
    ? fail('no WhatsApp link on a system page')
    : generic.length
      ? fail(`${generic.length} of ${sysWa.length} WhatsApp links do not name the system`)
      : pass(`all ${sysWa.length} WhatsApp links on a system page name it`)

  await ctx.close()
}

/* ------------------------------------------------------------------ *
 * The status vocabulary is gone for good.
 *
 * These read as the products Halcyon has built. Labelling one live, in
 * production or a demonstration turned a portfolio into a status board, and
 * the words creep back in the moment somebody edits copy without knowing why
 * they went.
 * ------------------------------------------------------------------ */
console.log('\nCopy')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const banned = ['Running in production', 'In progress', 'Demonstration', 'Branded for']
  for (const path of ['/', '/quotation', '/foundry', '/contact', '/industrial-flooring']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    const text = await page.evaluate(() => document.body.innerText)
    const found = banned.filter((b) => text.includes(b))
    found.length === 0
      ? pass(`${path} carries no status labels`)
      : fail(`${path} still says: ${found.join(', ')}`)
  }

  // And no prices, anywhere.
  for (const path of ['/', '/quotation', '/contact', '/industrial-flooring']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    const text = await page.evaluate(() => document.body.innerText)
    // A rupee figure with thousands separators is a price. The demos have
    // plenty inside their own iframes; this only reads the shell.
    const price = text.match(/₹\s?[\d,]{5,}/)
    price ? fail(`${path} publishes a price: ${price[0]}`) : pass(`${path} publishes no price`)
  }
  await ctx.close()
}

await browser.close()

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) failed.\n`)
process.exit(failures === 0 ? 0 : 1)
