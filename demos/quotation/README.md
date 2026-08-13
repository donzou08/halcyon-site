# Meridian Quotation — Demo

A portfolio demo built by **Halcyon**. It recreates a production tool that takes
industrial-flooring quotation from roughly an hour of spreadsheet-and-Word work down to
under a minute, ending in a branded, GST-correct PDF.

> **Everything in this app is fictional.** The company, its customers, the people, the
> GSTINs, the phone numbers, the addresses and every rate are invented for demonstration.
> No real client data appears anywhere in this repository. A persistent
> **"Demo — Sample Data"** badge is visible on every screen, and the generated PDF carries
> its own demo notice on every page.

## The demo client

**Meridian Industrial Flooring Pvt Ltd** — a fictional Chennai contractor doing industrial
epoxy, PU and protective flooring. The same fictional company appears in the companion
supervisor demo, so the two tell one story.

## What to look at

The whole pitch is one interaction. From the login screen:

1. **Continue as Owner** — no password, no PIN, no friction.
2. **Create new quote** → pick a customer and site → enter an area → pick a system →
   skip or add extras → review.
3. **Generate Quote** → **Download PDF**.

Under a minute, start to finish. A few things worth pointing out while clicking through:

- **The GST split is decided by the site, not the customer.** Bluewave Electronics has two
  sites: Oragadam (Tamil Nadu) and Sri City (Andhra Pradesh). Switch between them on step 1
  and watch the quote flip between **CGST + SGST** and **IGST**. That is Indian
  place-of-supply law, and getting it wrong is a real problem for a real contractor.
- **The running total never leaves the screen.** It updates on every keystroke, so a
  salesperson always knows what they're about to quote.
- **Rates are editable per line.** The catalogue is a starting point, not a cage.
- **Past quotes** carry a full snapshot, so an old quote re-renders exactly as it was sent
  even after the rate card moves.

## How it works

No backend, no database, no authentication. All data comes from a seed file
(`src/data/seed.ts`) and lives in memory, mirrored to `localStorage` so a mid-meeting
refresh doesn't lose your work. **Settings → Reset demo data** puts everything back.

**Capturing a screenshot? Add `?clean=1`.** That hides *Reset demo data*, the one
presenter-only control in the app, because a reset button makes a working system look
staged. `?presenter=0` is an alias, `?clean=0` puts it back, and the setting sticks for the
browser tab. The **"Demo — Sample Data"** badge is never hidden, in any mode: the reset
button is a staging artefact, the badge is a disclosure, and only the first one is in the
way. The companion supervisor demo takes the same flag. See `src/lib/captureMode.ts`.

### The demo stays "today"

The seeded history is dated relative to the day it was built — "2 days ago", "6 days ago".
Persisted to `localStorage` and reopened months later, the newest quote on record would be
from last season, which makes a live demo look abandoned. So the seed date is stored
alongside the history and it is rebuilt whenever the day has changed. Quotes generated
during a session survive a refresh, which is what matters mid-meeting. The companion
supervisor demo does the same thing, for the same reason.

The PDF is generated **in the browser** with `@react-pdf/renderer` — nothing is uploaded
anywhere. It's lazy-loaded, so the ~480 kB PDF engine only downloads when someone actually
asks for a PDF; the app itself is ~76 kB gzipped.

### The parts that carry the real thinking

| File | What lives there |
| --- | --- |
| `src/lib/calc.ts` | The quotation engine. Line amounts, the rounding conventions, the GST split. |
| `src/lib/gst.ts` | Place-of-supply rules and the pincode → state lookup. |
| `src/lib/pdf.tsx` | The quotation document, drawn as vector type — no letterhead bitmap. |
| `src/data/seed.ts` | The entire fictional dataset. The one file to read to confirm nothing real is here. |
| `src/screens/Calculator.tsx` | The five-step wizard. |

Two conventions inherited from how these quotes are actually written by hand:

- **The Basic Amount is rounded to the whole rupee before GST is applied**, so the printed
  tax figures always reconcile against the printed basic.
- **Rounding the grand total produces an explicit "Round Off" line** rather than silently
  adjusting the total.

## Run it

```bash
npm install && npm run dev
```

```bash
npm run build
```

There's a headless smoke test that checks the arithmetic and renders a real PDF:

```bash
npx tsx --tsconfig tsconfig.app.json scripts/testPdf.tsx
```

It verifies that line amounts sum to the rounded basic, that basic + GST equals the grand
total, that the inter-state quote carries IGST and no CGST/SGST, and that switching between
sq.ft and sq.m leaves the total unchanged.

Two more, each in its own process because the store is a module singleton loaded once:

```bash
npx tsx --tsconfig tsconfig.app.json scripts/testValidity.ts
npx tsx --tsconfig tsconfig.app.json scripts/testDayRollover.ts
```

The first renders an old quote's PDF and checks the validity window is measured from the
date the quote was raised rather than from whenever it is reopened. The second checks that
a stale history is rebuilt and a same-day one is preserved.

## Stack

Vite 8 · React 19 · TypeScript 6 · Tailwind CSS 3 · `@react-pdf/renderer` · `lucide-react`.
Static build — deploys to any static host with no server.

## Known limitations

These are demo-scope decisions, not defects:

- **Settings is read-only.** In production the catalogue is editable and shared across the
  team in real time; here it's a display of what the quote is priced from.
- **No page numbers in the PDF footer.** `@react-pdf/renderer`'s dynamic `render` callback
  doesn't fire inside this document (confirmed against a minimal reproduction where it
  does), so a "Page N of M" marker would silently render as nothing. The footer is static
  instead.
- **No divisions or amendments.** The production tool numbers quotes per division and
  supports amending a sent quote. Both are cut here to keep the wizard to five steps.

---

Powered by Halcyon
