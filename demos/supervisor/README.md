# Meridian Supervisors — Demo

A portfolio demo built by **Halcyon**. It recreates a production field-supervision tool
that replaced a stream of status phone calls and WhatsApp messages with GPS-verified
check-ins, a live owner dashboard, and issue logging that reaches the owner immediately.

> **Everything in this app is fictional.** The company, its sites, its people, the phone
> numbers and the coordinates are invented for demonstration. No real client data appears
> anywhere in this repository. A persistent **"Demo — Sample Data"** badge is visible on
> every screen.

## The demo client

**Meridian Industrial Flooring Pvt Ltd** — a fictional Chennai contractor. Its four sites
here match the four customers in the companion quotation demo, so the two tell one story.

## What to look at

### The owner dashboard — the payoff screen

Log in as **Owner (Ravi)**. Everything is already populated: someone is on site, a site
finished today, an issue is waiting, and one site hasn't started.

At the top is a **Demo controls** panel. This is the thing to use in a live meeting:

- **Simulate check-in** — a supervisor arrives at a site. Watch the tiles, the team-status
  list and the site cards all move at once, while the client is looking at the screen.
- **Simulate check-out** — the longest-running visit closes, coverage is logged, and the
  site's progress bar advances.
- **Advance 45 min** — nudges the demo clock, so the "2h 24m on site" durations tick along.
- **Reset demo** — back to the seeded state between meetings.

**Capturing a screenshot? Add `?clean=1`.** A row of *Simulate* buttons makes a working
system look staged, so `?clean=1` hides the panel (and the "demo clock" note the clock
control leaves in the header) while everything else stays exactly as it is. `?presenter=0`
is an alias, `?clean=0` puts the controls back, and the setting sticks for the browser tab
so it survives moving between screens.

The **"Demo — Sample Data"** badge is never hidden, in any mode. The buttons are a staging
artefact; the badge is a disclosure. Only the first one is in the way. See
`src/lib/captureMode.ts`.

### The field app

Log out and come back in as a **Supervisor**. The flow is the real one:

1. **Start work day** — the day has to be open before any check-in is allowed.
2. **Check in here** — captures a location, shows the distance to site and the accuracy,
   and asks for today's target, the headcount and materials taken.
3. **Report an issue** — type, severity, description, photo. It lands on the owner's
   dashboard immediately.
4. **Check out** — and this is the part worth showing deliberately.

### The constraint that makes the whole thing work

**A supervisor cannot end their work day with an open visit, and cannot close a visit
without entering completion figures.** Try it: check in somewhere, then tap *End work day*.
You're stopped and routed to check-out. On the check-out screen, the submit button stays
disabled until there is both a description of the work *and* at least one quantity.

That constraint is the difference between an attendance log and a progress record. Without
it you get "checked in, checked out" and nobody knows what actually moved. It's also why
the owner's percentages can be trusted — every one of them traces back to a number a
supervisor typed while standing on the floor.

Progress is computed, never estimated: each stage is credited by the area logged against it
divided by the site area, and the overall figure is the mean of the stages, so it always
reconciles with the breakdown shown underneath it.

## GPS in a meeting room

The production tool reads the device GPS. A demo has to work indoors, on a laptop, possibly
with location blocked, and almost certainly not in a Chennai industrial estate.

So `src/lib/geo.ts` tries the real GPS with a short timeout and falls back to a preset
coordinate near the selected site — also falling back if a *real* fix comes back more than
5 km away. The distance check, the "At site" badge and the accuracy readout all behave
exactly as they do in the field, and a small note makes clear when a preset was used.

## How it works

No backend, no database, no authentication. `src/data/store.ts` is an in-memory cache that
screens read synchronously, with mutations that bump a version number so every mounted
screen re-renders — the same shape as the production data layer, with Supabase and its
realtime subscription swapped for `localStorage`.

`now()` is routed through the store rather than calling `new Date()` directly, which is what
lets the presenter advance the demo clock and have the whole app move at once.

### The demo stays "today"

The seed is a story about *today*: a work day open since this morning, someone on site for
the last couple of hours, a visit that closed a few hours ago. Persist that to
`localStorage`, reopen it a week later, and the story falls apart — work days are keyed by
date so they disappear, while visits keep their old dates and linger. That produced a
screen showing **"Start your work day"** directly above **"On site now · 198h 53m"**.

So the state records the date it was seeded on and is rebuilt whenever that isn't today.
Someone arriving at the public URL months from now sees the same coherent day the first
visitor did. Same-day state is untouched, so a mid-meeting refresh doesn't lose anything.

Two guards back that up: a visit only counts as active if it is dated today, and the
*Advance 45 min* control refuses to step past midnight rather than stranding the seeded day
in the past.

Photos are kept as local object URLs. Nothing is uploaded anywhere.

### The parts that carry the real thinking

| File | What lives there |
| --- | --- |
| `src/data/store.ts` | The data layer, the status derivation, the progress maths, and `canEndWorkDay` — the gate. |
| `src/pages/CheckOut.tsx` | The completion-figures requirement. |
| `src/lib/geo.ts` | Haversine distance and the GPS-with-fallback capture. |
| `src/data/seed.ts` | The entire fictional dataset. The one file to read to confirm nothing real is here. |
| `src/pages/OwnerDashboard.tsx` | The payoff screen and the presenter controls. |

## Run it

```bash
npm install && npm run dev
```

```bash
npm run build
```

There's a headless test covering the seeded statuses, the check-out gate, the progress
maths and the presenter controls:

```bash
npx tsx --tsconfig tsconfig.app.json scripts/testStore.ts
```

And a second one covering day rollover — that stale state is rebuilt, that same-day state is
preserved, and that the demo clock stays inside the seeded day. It runs in its own process
because the store is a module singleton whose `load()` happens once, at import:

```bash
npx tsx --tsconfig tsconfig.app.json scripts/testDayRollover.ts
```

## Stack

Vite 8 · React 19 · TypeScript 6 · Tailwind CSS 4 (CSS-first `@theme`) · React Router 7.
Static build — deploys to any static host. `vercel.json` and `public/_redirects` carry the
SPA rewrites for Vercel and Netlify respectively.

## Known limitations

These are demo-scope decisions, not defects:

- **No AI progress assessment.** The production tool sends each check-out to a model that
  works out per-stage progress and pending work. Here progress is computed arithmetically
  from logged coverage — same output shape, no API key needed.
- **No exports.** The production tool produces PDF and Excel day reports.
- **No travel tracking, inventory or applicator teams.** All present in production, cut here
  to keep the demo to the three screens that carry the story.

---

Powered by Halcyon
