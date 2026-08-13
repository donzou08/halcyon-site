# Halcyon, design system

The durable visual decisions. Product truth is in [PRODUCT.md](PRODUCT.md).

## The world: a technical document

Halcyon sells to people who read engineering drawings, datasheets, rate cards
and GST invoices all day. The site is built as one of those documents: a strict
grid, hairline rules doing structural work, tabular figures, named field labels,
and a title block.

**What this replaced, and why.** Until August 2026 the site was centred Cormorant
Garamond, gold italic display type, and a hexagon watermark on pure black. That
is the visual grammar of a wedding invitation or a hotel, and Sanjith's own read
was "a posh night event instead of a website for a tech company". The diagnosis
holds: tech companies signal competence through density and evidence, and the
old arrangement signalled taste. Halcyon's proof numbers are strong and they were
buried under it.

The mark, the wordmark and the gold are the brand and are unchanged. The
arrangement was never the brand.

## Non-negotiables

- **No serif anywhere.** Not for display, not for figures, not for accents. The
  serif is what made the old site read as an invitation.
- **Light ground.** Chosen from the use scene: an owner on a phone in a factory
  office or on site, in daylight, often on a cheap screen. Dark type on paper
  survives that; a dark theme with gold hairlines does not.
- **Gold is a stamp, never a field.** It marks the primary action and the figure
  that matters. A large gold fill is the failure mode of the old design.
- **No gradients, no drop shadows, no glow, no glass.** Inherited from the
  previous identity and still correct. Rules, weight and space do the work.
- **No icon set.** Where a mark is needed it is a rule, a dot, or a number.
- **Product screenshots lead.** A card that carries only prose asks a stranger to
  take working software on trust. Every system card leads with a real captured
  screen. This is the single most important rule on the page.

## Tokens

Defined in `src/index.css` under `@theme`. Contrast is measured against `paper`.

| Token | Value | Use | Contrast |
| --- | --- | --- | --- |
| `paper` | `#f8f8f6` | The page | |
| `raised` | `#ffffff` | A panel on the page | |
| `sunk` | `#f1f0ec` | Insets, sheet headers, image wells | |
| `ink` | `#111110` | Headings, primary text | 17.8:1 |
| `ink-2` | `#46453f` | Body copy | 9.0:1 |
| `ink-3` | `#6e6c64` | Field labels, captions | 4.95:1 |
| `rule` | `#e3e2dc` | Hairlines | |
| `rule-strong` | `#c6c4bb` | Structural rules, input borders | |
| `gold` | `#a8801f` | Borders, dots, large figures, rules | 3.42:1 |
| `gold-ink` | `#7a5d11` | **Any gold text set small** | 5.80:1 |
| `obsidian` | `#111110` | Punctuation sections and the footer | |
| `teal` | `#14574f` | Section field labels only | 7.9:1 |

**The gold split matters.** `gold` fails for body text at 3.42:1. Small gold type
uses `gold-ink`. On obsidian the plain `gold` is 5.2:1 and is correct there.

## Type

- **Archivo** (400/500/600/700) for everything. A grotesque with enough character
  to be a display face and enough neutrality to set a table.
- **Spline Sans Mono** (400/500/600) for figures, codes and field labels. Mono is
  used for data and measurement, never as a costume for "technical".

Classes in `src/index.css`:

| Class | What it is |
| --- | --- |
| `.display` | Headlines. 600, `-0.028em`, balanced |
| `.display-sm` | Sub-headings and card titles |
| `.field` | The document's field label. Mono, 11px, `0.14em`, uppercase, `ink-3` |
| `.field-teal` | A field label opening a section |
| `.num` | Tabular figures. Never reflows between rows |
| `.prose-measure` | 68ch. Body copy never runs wider |
| `.stamp` | The approval stamp. Gold border, mono, uppercase |
| `.hairline-grid` | 1px gap over a rule-coloured ground, so cells share hairlines without doubling at the seams |
| `.shot-crop` | Card thumbnails. Honours a shot's `--focus` below `sm`, top-aligned above it |

## Motion

One authored moment per surface, and content is visible by default.

- `.plot` runs once on the hero screenshot, a `clip-path` wipe reading as a
  plotter drawing the sheet.
- `.settle` is for content arriving after a keystroke or a step change, so a
  result set reads as an answer rather than a repaint.
- Everything else is a colour or transform transition on hover.
- `prefers-reduced-motion` disables all of it.

## Layout

- `Container` is `max-w-[1240px]`, `px-5` / `sm:px-8`. Every section uses it so
  the grid never drifts.
- Sections separate with `border-b border-rule`, not with space alone.
- Each page opens with a **sheet header**: a `sunk` strip of field labels naming
  the page and its status.
- The footer is a **title block**: named cells in a hairline grid.
- More space above a heading than below it.

## The two shot shapes

Phone captures are 390x844, desktop captures 1360x850, and they cannot share a
crop. Below `sm` both are a full-width banner and each shot declares a `focus`
(`object-position`) so the crop lands on the part worth seeing, because the top
of a phone screen is usually a progress bar. From `sm` up, a shot sits in a side
column that crops height rather than width, where the top is always right.

**The image is positioned, not flowed.** In the flow, a 390x844 screen in a 200px
column forces a 433px row and leaves the card empty across the middle.

## What is not ours to restyle

The five demos keep their own identities. Meridian's blue and Kestrel's blue are
those fictional clients' brands, and repainting them to match this site would
undo the point: these are systems built for one business each. Only the Command
Center wears Halcyon's obsidian and gold, because it is the one system here that
is Halcyon's own.
