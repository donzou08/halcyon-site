# Halcyon

The Halcyon website. Marketing pages, the portfolio portal, and five working
applications, on one origin and one deploy.

Nothing here is client data.

---

## Routes

| Route | What it is |
| --- | --- |
| `/` | Home. The claim, a live product screen, the index, the production proof |
| `/works` | The portal. Search by trade or by the job, then the catalogue |
| `/works/:slug` | One system: title block, the running demo, what it replaces |
| `/approach` | How the work happens, and straight answers to the awkward questions |
| `/engagements` | The rate card |
| `/contact` | A three-step intake that posts to Formspree and a Google Sheet |
| `/demos/:slug/` | The five applications, served as static sub-apps |

`/system/:slug` redirects to `/works/:slug`, because that shape is in Instagram
captions and LinkedIn posts that cannot be edited.

---

## The five systems

| System | Sector | Provenance | Demo |
| --- | --- | --- | --- |
| **Quotation Engine** | Industrial flooring | Running in production | `/demos/quotation/` |
| **Field Supervisor** | Industrial flooring | Running in production | `/demos/supervisor/` |
| **Tender Intelligence** | Industrial flooring | In progress | `/demos/tender/` |
| **Production Counting** | Manufacturing and foundry | Demonstration | `/demos/foundry/` |
| **Command Center** | Any business | Demonstration | `/demos/command-center/` |

**Provenance is stated on every card and never implied.** Three rebuild systems
running for a real client; two have not been deployed for anyone.

---

## The three things that make it work

### 1. The screenshots are real, and generated

Every card leads with a captured screen of the actual demo, produced by
`scripts/capture-shots.mjs` driving a browser through the app to a state worth
seeing: the quotation at its priced review, the supervisor at the owner
dashboard, the tender scan mid-run. Nothing is mocked up, and after a demo
changes the shots are regenerated so a card can never show a screen the visitor
will not reach.

### 2. Search spans trades, not just product names

A visitor arrives thinking either "we do pest control" or "we keep retyping
quotations", and both have to return something. Every system carries an
`alsoWorksFor` list of trades alongside its `workflows`, and a match on a trade
Halcyon has never worked in is a first-class result. The matched phrases are
shown back on the card, so the answer looks reasoned rather than lucky.

Query terms are singularised before matching. Without it, "quotations", one of
the page's own suggestion chips, returned nothing at all.

When nothing matches, the page does not say "no results". It asks what the
visitor runs, with their search term already in the message. That screen is the
most valuable one on the site.

### 3. The demos are embedded, same origin

Each demo is a separate Vite application, built independently and served as a
static sub-application from `/demos/<slug>/`.

**Same origin is a requirement, not a convenience.** Every demo keeps its state
in `localStorage`, and Safari partitions third-party storage while Chrome heads
the same way, so a cross-origin embed would leave the demos unable to remember
anything one click after a visitor started. Because the origin is shared, this
site's `localStorage` *is* the demo's, which is also how **Reset the demo**
works: the parent clears the keys matching that system's declared prefixes and
reloads the frame.

Below 1024px a demo opens full screen instead of in an inline frame. A
mobile-first application inside a 306px box on a 390px screen is a phone drawn
inside a phone, under a page that is also scrolling, and touch cannot tell the
two scrolls apart.

---

## Layout

```
halcyon-site/
├── src/
│   ├── data/catalogue.ts     every system, its copy, its tags, its proof, its shots
│   ├── data/site.ts          contact, engagements, the production systems
│   ├── lib/search.ts         the scoring
│   ├── components/           chrome, search, cards, plates, the demo frame
│   └── pages/                Home, Works, System, Approach, Engagements, Contact, NotFound
├── demos/                    five independent Vite apps, each with its own deps
├── public/demos/             their built output, committed
├── public/shots/             captured product screenshots, committed
└── scripts/
    ├── build-demos.mjs       builds demos/* into public/demos/*
    ├── capture-shots.mjs     drives the demos and captures public/shots/*
    ├── serve-like-vercel.mjs a local server matching vercel.json
    └── check.mjs             browser checks over the whole site
```

`public/demos/` and `public/shots/` are **committed on purpose**. A deploy then
only has to build the shell, instead of running five separate installs on a
build machine where any one of them failing takes the site down.

---

## Running it

```bash
npm install && npm run build:all
```

Then, because `npm run dev` does not serve `public/demos` the way production
does:

```bash
npm run build && node scripts/serve-like-vercel.mjs 4400
```

`serve -s dist` will **not** do. It rewrites every path to `index.html`,
including `/demos/quotation/`, which silently turns each embedded demo into this
site's own 404 page inside the phone frame.

### Changing a demo

```bash
node scripts/build-demos.mjs quotation
node scripts/capture-shots.mjs
```

Then commit the changed files under `public/demos/` and `public/shots/`.

### Checking it

```bash
node scripts/check.mjs
```

Drives a real browser over the site: every page renders and requests nothing
that 404s, every demo boots inside its frame, every screenshot decodes, search
returns the right system for every suggestion chip and a dozen other queries,
the contact form walks its three steps and refuses to skip one, and no page
scrolls sideways on a phone.

---

## Deploying

There is no Vercel CLI in this environment, so:

```bash
gh repo create halcyon-site --public --source=. --push
```

Import the repo at vercel.com/new. Vite is detected automatically. `vercel.json`
already carries the SPA rewrite that excludes `/demos/`, and the
`X-Frame-Options: SAMEORIGIN` header on the demos.

**The domain move is deliberate and manual.** `halcyon.uno` currently points at
the old `halcyon-website` project. Deploy this, look at the preview URL, and move
the domain only when you are happy. The old site stays live and untouched until
then.

---

## Rules this repo follows

- **No real client data, ever.** Meridian Industrial Flooring, Kestrel Castings
  and Ashwood Contracts do not exist.
- **Figures come from `halcyon-studio/brand/proof-ledger.md`,** verbatim, not
  rounded and never converted to a percentage. Systems with no ledger entry carry
  no numbers, which is the correct answer rather than a gap to be filled.
- **No em dashes in visible copy.** The one exception is the demos' own
  `DEMO — SAMPLE DATA` badge, quoted as it is.
- **No gradients, drop shadows, glow or icons.** Gold marks the primary action
  and the figure that matters, never a large fill.
- **Nothing mentions WhatsApp.** The advertisement decides that; the site is a
  website.
- Client demos wear the client's identity. Only the Command Center wears
  Halcyon's own obsidian and gold, because it is the one system here that is
  Halcyon's rather than a client's.

---

Powered by Halcyon
