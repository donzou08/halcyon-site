# halcyon-site, project context

**The Halcyon portfolio.** The five systems Halcyon has built, each one running
rather than pictured, plus a contact route. Created 2026-08-13.

**It is not the company website, and it is not its own deployment.** It is
**served by the halcyon.uno Vercel project at `/theworks`**, from a copy of
`dist/` committed into the `halcyon-website` repo. That is what
`npm run publish:theworks` does. An earlier version of this repo was a full
marketing site with its own home, approach and pricing pages; Sanjith cut all of
that on 2026-08-13 so the two do not compete.

## The mount point, which everything depends on

`base` in `vite.config.ts` is **`/theworks/`**, and it is baked into every URL in
the build. Three consequences, each of which has already caused a silent failure:

1. **Runtime paths must go through `src/lib/paths.ts`.** Vite rewrites the URLs
   it can see in the module graph; a path built from a template string at runtime
   is invisible to it. Every screenshot and every demo URL is exactly that, so
   `asset()` and `demoUrl()` exist and must be used.
2. **The demos are rebuilt with the mount in front of them.** Each demo's own
   vite config says `base: '/demos/<slug>/'`, which is right only at a domain
   root. `scripts/build-demos.mjs` overrides it to `/theworks/demos/<slug>/`.
   Without that the iframe loads an empty page.
3. **Serving `dist/` at the root passes tests that production fails.**
   `scripts/serve-like-vercel.mjs` mounts it at `/theworks/`, and `check.mjs`
   and `capture-shots.mjs` both default to `http://localhost:4400/theworks`.

Publishing anywhere else means `PORTFOLIO_BASE=/somewhere/ npm run build:all`,
which every one of those scripts reads.

## Publishing

```bash
npm run build:all          # demos, then the shell, both with the mount
npm run publish:theworks   # copies dist/ into ../halcyon-website/theworks/
```

Then commit and push in `halcyon-website`. Vercel redeploys halcyon.uno and the
portfolio goes with it. Routing lives in that repo's `vercel.json`: real files
first, then each demo's own index.html, then the portfolio shell, then the
marketing page.

Read [README.md](README.md) for architecture, [PRODUCT.md](PRODUCT.md) for what
Halcyon is and the content gates, [DESIGN.md](DESIGN.md) for the visual system.
This file holds the decisions and the traps.

## What replaced what

| Old | Status |
| --- | --- |
| `/root/projects/halcyon-website` | **The live halcyon.uno, and it stays that way.** Edit only what Sanjith asks for; its dark identity is deliberate and is not to be brought in line with this site. |
| `/root/projects/halcyon-works` | Superseded by this repo. Its Vercel deploy still exists and will drift. Retire it. |

## Decisions worth not relitigating

- **Portfolio only.** No home page above the work, no approach page, no pricing
  page. Sanjith's call on 2026-08-13: halcyon.uno carries the company story and
  this carries the work. Routes are flat (`/quotation`, not `/works/quotation`)
  precisely so the whole site can be mounted under `halcyon.uno/works` without
  every path reading `/works/works/`.

- **No status labels anywhere.** Nothing says live, in production, in progress or
  demonstration. Sanjith's instruction: "just say the products we have done."
  `provenance` still exists in the catalogue because it decides which systems may
  carry figures, but it is never rendered. The honesty now sits in what is
  absent: two of the five have never been deployed for anyone, and nothing on the
  page asserts otherwise for any of them. `scripts/check.mjs` fails if any of
  those words reappear on a page.

- **No prices, anywhere, on either site.** The tiers came off this repo and off
  halcyon.uno on 2026-08-13. Publishing them taught a reader to pick a package
  and ask what it includes, which is the opposite of the useful conversation, and
  it framed the work before anyone had seen the work. The line is that every
  system is quoted on the complexity of the job, after the workflow is mapped.
  `check.mjs` fails on a rupee figure appearing in the shell.
- **Light, not dark.** Chosen by Sanjith on 2026-08-13 after the old site was
  read as "a posh night event instead of a website for a tech company". The
  reasoning is in DESIGN.md. The mark, wordmark and gold are unchanged.
- **No serif.** Cormorant Garamond is gone from the site entirely. This was the
  largest single cause of the old read and reintroducing it undoes the work.
- **WhatsApp belongs on this site and not on halcyon.uno.** Sanjith reversed the
  earlier no-WhatsApp rule for the portfolio on 2026-08-13: this is the funnel,
  so it offers WhatsApp, phone, email and the form side by side, and the WhatsApp
  message is pre-filled with the system the visitor was looking at. halcyon.uno
  still names no chat app. Everything is behind `HAS_WHATSAPP` / `HAS_PHONE` and
  disappears cleanly while the number is empty.
- **This site names no client; halcyon.uno names one.** The demos wear invented
  companies (Meridian, Kestrel, Ashwood) because a public rebuild must not carry
  a real customer's data. halcyon.uno separately names **Swathi Engineering
  Agencies**, because that is the claim being made over there. Both are honest;
  do not "fix" one to match the other, and do not bring the real client's name
  onto this site.
- **`demos/foundry` was rebranded and must stay that way.** It came from
  `/root/projects/SAC Demo`, branded for **SAC Engine Components, Gummidipoondi**,
  a real company. Publishing that name would read as "SAC is a Halcyon client".
  It is **Kestrel Castings, Hosur**, invented. Never reintroduce the SAC name.
- **The Command Center demo is a static rebuild**, not the private Next.js and
  Supabase tool in `/root/projects/halcyon-command-center`.

## Traps

- **`serve -s dist` breaks every demo silently.** It rewrites `/demos/quotation/`
  to the shell's `index.html`, so each embed renders this site's own 404 page
  inside the phone frame. It looks like a broken demo, not a broken server. Use
  `node scripts/serve-like-vercel.mjs 4400`. `scripts/check.mjs` catches it.
- **`public/demos/` is build output and is committed.** Editing `demos/<slug>/src`
  changes nothing until `node scripts/build-demos.mjs <slug>` runs.
- **`public/shots/` is generated and is committed.** After changing a demo, run
  `node scripts/capture-shots.mjs` against a running server or the cards will
  show the old screens. The site's whole argument is those screenshots.
- **Demo React Router apps must use `HashRouter`.** `BrowserRouter` inside
  `/demos/<slug>/` needs per-demo rewrites that `vercel.json` does not provide.
- **The foundry demo has two routes.** `#/split` for the desktop frame and
  `#/worker` for the phone, via `demoPhone`. The split view is unreadable at 390px.
- **The contact form's record keys are a contract.** `Name`, `Role`, `Email`,
  `Phone`, `Company`, `City`, `Industry`, `What the business does`, `Challenge`,
  `Handled today` land in a Google Sheet through an Apps Script endpoint.
  Renaming one in `src/pages/Contact.tsx` silently drops a column; change the
  Apps Script `fields` array in the same pass.
- **Don't shadow `Error`.** A local component called `Error` in a file that also
  does `throw new Error(...)` fails to compile with a message about construct
  signatures, which does not point at the shadowing. It is `FieldError`.
- **Playwright is not a dependency here.** `capture-shots.mjs` and `check.mjs`
  resolve it from `/root/projects/halcyon-studio/capture`. Override with
  `PLAYWRIGHT_DIR`. The build machine never needs it.
- **Full-page screenshots crash on this box.** Roughly 400MB of RAM is free, and
  `fullPage: true` at 2x device scale kills the tab with "Target crashed". Take
  viewport shots at scroll offsets instead.

## Still to do

- **`CONTACT.phone` in `src/data/site.ts` is empty, and so is the WhatsApp
  route.** Sanjith's number was never in any repo, so it was left blank rather
  than guessed: a wrong number on a live site sends enquiries to a stranger.
  Every surface that would show it is behind `HAS_PHONE` / `HAS_WHATSAPP` and
  omits the row, so the site is correct as it stands. Filling `phone` lights up
  the footer, `/contact`, and the WhatsApp button on every system page. Set
  `whatsapp` as well only if it differs from the phone number.
- **`window.HALCYON_ANALYTICS` in `index.html` has empty IDs.** Nothing loads
  while they are empty. The Meta pixel matters before any advertising spend,
  because without it there is no retargeting audience.
- Em dashes survive in demo source **comments**. Visible demo copy is clean.

## Verified demo flows

Both production rebuilds were walked end to end on 2026-08-13 and work:

- **Quotation.** Sign in, pick a customer, area, system, extras, review with the
  correct CGST/SGST split, generate. It produces a numbered quote and a real
  10.8 kB PDF. Sales Rep and Owner see different quote histories.
- **Supervisor.** The visitor lands **mid-shift and already checked in**, which
  is why `tryThis` starts at check-out rather than check-in. Check out, and the
  owner dashboard's visit count and on-site count both move. That cross-role
  update is the moment worth showing; do not reorder the instructions past it.

## Adding a system

1. Put the app in `demos/<slug>/` with `base: '/demos/<slug>/'` in its Vite
   config, and `HashRouter` if it routes.
2. Add the slug to `DEMOS` in `scripts/build-demos.mjs`.
3. Add an entry to `SYSTEMS` in `src/data/catalogue.ts`, including
   `storagePrefixes` so Reset can clear it, and a `code`. Check `tryThis`
   against the demo's **actual arrival state**, which is not always its start.
4. Add its shots to `SHOTS` in `scripts/capture-shots.mjs`, then run it.
5. `npm run build:all`, then `node scripts/check.mjs`.

`alsoWorksFor` is what makes this site work for a stranger, so list trades the
workflow honestly reaches rather than an aspirational spread. `searchTerms` is
invisible and exists to catch the words an owner actually types, including the
tools being replaced ("excel", "whatsapp", "tally").
