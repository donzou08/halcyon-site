# halcyon-site, project context

The unified Halcyon website: marketing pages, the portfolio portal, and all five
demos, on one origin and one deploy. Created 2026-08-13 by merging
`halcyon-website` (the marketing site) and `halcyon-works` (the portal).

Read [README.md](README.md) for architecture, [PRODUCT.md](PRODUCT.md) for what
Halcyon is and the content gates, [DESIGN.md](DESIGN.md) for the visual system.
This file holds the decisions and the traps.

## What replaced what

| Old | Status |
| --- | --- |
| `/root/projects/halcyon-website` | The live halcyon.uno until the domain is moved here. **Do not edit it.** Kept as the rollback. |
| `/root/projects/halcyon-works` | Superseded by `/works` here. Its Vercel deploy still exists and will drift. |

Both old repos are untouched, so there is no window where anything is broken.
Once halcyon.uno points here, retire them rather than leaving three sites live.

## Decisions worth not relitigating

- **One repo, one deploy.** `/works` is a route, not a subdomain. The demos need
  to be same-origin (see README), and the previous split meant the marketing site
  never linked to the work and the two designs drifted apart.
- **Light, not dark.** Chosen by Sanjith on 2026-08-13 after the old site was
  read as "a posh night event instead of a website for a tech company". The
  reasoning is in DESIGN.md. The mark, wordmark and gold are unchanged.
- **No serif.** Cormorant Garamond is gone from the site entirely. This was the
  largest single cause of the old read and reintroducing it undoes the work.
- **Nothing on the site mentions WhatsApp.** Sanjith's instruction, 2026-08-13:
  the advertisement decides whether a visitor goes to WhatsApp or to the site,
  and the site itself stays a website. Do not add a WhatsApp button, a `wa.me`
  link, or a floating chat affordance.
- **The two halves name different clients on purpose.** The marketing pages name
  **Swathi Engineering Agencies**, because that is the claim being made there.
  The demos wear **Meridian Industrial Flooring**, invented, because a public
  rebuild must not carry a real customer's data. Both are honest; do not
  "fix" one to match the other.
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

- **`CONTACT.phone` in `src/data/site.ts` is empty.** Sanjith's number was never
  in any repo, so it was left blank rather than guessed: a wrong number on a live
  site sends enquiries to a stranger. Every surface that would show it is behind
  `HAS_PHONE` and simply omits the row, so the site is correct as it stands.
  Filling the constant makes it appear in the footer and on `/contact`.
- **`window.HALCYON_ANALYTICS` in `index.html` has empty IDs.** Nothing loads
  while they are empty. The Meta pixel matters before any advertising spend,
  because without it there is no retargeting audience.
- Em dashes survive in demo source **comments**. Visible demo copy is clean.

## Adding a system

1. Put the app in `demos/<slug>/` with `base: '/demos/<slug>/'` in its Vite
   config, and `HashRouter` if it routes.
2. Add the slug to `DEMOS` in `scripts/build-demos.mjs`.
3. Add an entry to `SYSTEMS` in `src/data/catalogue.ts`, including
   `storagePrefixes` so Reset can clear it, and a `code`.
4. Add its shots to `SHOTS` in `scripts/capture-shots.mjs`, then run it.
5. `npm run build:all`, then `node scripts/check.mjs`.

`alsoWorksFor` is what makes this site work for a stranger, so list trades the
workflow honestly reaches rather than an aspirational spread. `searchTerms` is
invisible and exists to catch the words an owner actually types, including the
tools being replaced ("excel", "whatsapp", "tally").
