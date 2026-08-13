/**
 * The industrial flooring landing page.
 *
 * A vertical page for one trade, and the only page on this site written to be
 * read by a person who already knows their business better than we do. That
 * changes what it can say. Generic operations copy ("streamline your workflow")
 * reads as someone who has never stood on a site; naming a CSP profile, a
 * moisture reading or the order of coats reads as someone who has. So the page
 * is built out of the trade's own vocabulary, and every detail in it is taken
 * from the three applications themselves rather than invented for the page.
 *
 * **Nothing here is a market statistic.** The observations about where money
 * leaks are descriptions of the work, not research findings dressed as facts,
 * because a figure that cannot be defended in a meeting costs more than every
 * figure that can. The only numbers on the page come from the proof ledger, via
 * the catalogue.
 */

export interface Leak {
  /** Which of the three systems answers it. */
  slug: string
  stage: string
  title: string
  /** The pain, in the owner's language. Not a feature. */
  body: string
  /** What it costs when it goes wrong. */
  cost: string
}

/**
 * The spine of the page: three places a flooring contract loses money, in the
 * order they happen. Each maps to one of the three systems, which is why this
 * trade gets a page of its own rather than a card.
 */
export const LEAKS: Leak[] = [
  {
    slug: 'tender',
    stage: 'Finding the job',
    title: 'The tenders you never saw',
    body: 'Public flooring work is posted across portals that do not talk to each other, and several put a CAPTCHA in front of the list. Checking them properly is most of a morning, so in practice it happens on a Monday, or when somebody remembers.',
    cost: 'A job closes unseen. The ones you do see still have to be read in full before you can tell that the turnover threshold or the registration class rules you out.',
  },
  {
    slug: 'quotation',
    stage: 'Pricing the job',
    title: 'The quote that took an hour and left out the primer',
    body: 'Rates live in a spreadsheet, the document lives in Word, and the version that reached the customer is whichever was saved last. Surface preparation gets forgotten on the fast ones. Filler for undulations gets estimated from memory.',
    cost: 'A margin decided by whoever typed it. Three weeks later nobody can say what the job was quoted at, or which revision the customer is holding.',
  },
  {
    slug: 'supervisor',
    stage: 'Running the job',
    title: 'A site you find out about in the evening',
    body: 'Updates arrive as photographs in a WhatsApp group with no location, no time and no order to them. Working out whether a site moved today means scrolling back through a thousand messages or ringing four people.',
    cost: 'Rework, found late. It never shows up as a labour problem in the accounts, because nobody compared the hours quoted with the hours spent.',
  },
]

export interface TradeDetail {
  label: string
  body: string
}

/**
 * The section that does the actual persuading.
 *
 * Every line is something the software already handles and a contractor would
 * have to explain to any general-purpose tool. This is what separates a system
 * built for the trade from one configured for it, and it is checkable: all of it
 * is visible in the demos on this page.
 */
export const KNOWS_THE_TRADE: TradeDetail[] = [
  {
    label: 'The rate card is your systems, not line items',
    body: 'Eight of them, from a 300 micron roller-applied coating at the light end to 6mm PU concrete for wet process areas, with 2mm, 3mm and 5mm epoxy self-levelling in between. Thickness is part of the product, not a note in the description.',
  },
  {
    label: 'ESD, anti-skid and densifier are priced like everything else',
    body: 'A conductive grid with earthing for a clean room and a broadcast aggregate finish for a loading ramp are different jobs at different rates, and both sit in the same rate card as the epoxy.',
  },
  {
    label: 'Square feet and square metres, both, at once',
    body: 'Drawings arrive in one and rates are quoted in the other. The area is entered in whichever unit the site gave you and the quote prints in the one the customer expects, converted rather than retyped.',
  },
  {
    label: 'GST decided by where the site is',
    body: 'Within Tamil Nadu it splits into CGST and SGST. Outside it, IGST. The customer record carries the site, so the split is a consequence of the address rather than a decision somebody has to remember to make.',
  },
  {
    label: 'Filler and line marking are add-ons, because they are',
    body: 'Undulations and potholes are priced by the kilogram of filler compound, separately from area. Safety line marking is a switch, not a renegotiation. Both are the items most often left off a fast quote.',
  },
  {
    label: 'The stages are the stages',
    body: 'Surface preparation, primer, screed or body coat, top coat, line marking. A supervisor closing a visit picks the stage actually reached, and the owner sees progress against those five rather than a percentage somebody guessed.',
  },
  {
    label: 'Completion is measured in area, not in ticks',
    body: 'A visit cannot be closed without a figure for what was coated or how much material went down. That is what the progress percentage is built from, so it cannot drift away from the work.',
  },
  {
    label: 'It runs on the phone the supervisor already has',
    body: 'The field app is built for a mid-range Android on a patchy connection, standing on a floor, because a tool that needs a desk is a tool that gets filled in from memory at the end of the week.',
  },
]

export interface FloorSystem {
  name: string
  detail: string
}

/** The rate card, exactly as the Quotation Engine carries it. */
export const RATE_CARD: FloorSystem[] = [
  { name: '300 Micron Epoxy Coating', detail: 'Two-coat roller-applied, light traffic' },
  { name: '2mm Epoxy Self-Levelling', detail: 'Seamless self-smoothing screed' },
  { name: '3mm Epoxy Self-Levelling', detail: 'Heavier build for forklift traffic' },
  { name: '5mm Epoxy Self-Levelling', detail: 'Heavy-duty, impact-loaded bays' },
  { name: '6mm PU Concrete', detail: 'Thermal shock and chemicals, wet process' },
  { name: '2mm ESD Anti-Static', detail: 'Conductive grid with earthing' },
  { name: '1mm Anti-Skid', detail: 'Broadcast aggregate, ramps and wet zones' },
  { name: 'Floor Hardener / Densifier', detail: 'Lithium silicate with mechanical polish' },
]

/** The five stages the Field Supervisor tracks a job through. */
export const STAGES = [
  'Surface preparation',
  'Primer',
  'Screed / body coat',
  'Top coat',
  'Line marking',
]

/**
 * What it does not do.
 *
 * On a page aimed at people who have been sold software before, the limits are
 * more persuasive than the features. Every one of these is true, and saying it
 * first is cheaper than being caught on it in a meeting.
 */
export const LIMITS: TradeDetail[] = [
  {
    label: 'It is not accounting software',
    body: 'It does not file returns and it does not replace Tally. It produces the quotation and the site record that your accounts are built from.',
  },
  {
    label: 'It does not price the job for you',
    body: 'The rates are yours and the judgement stays yours. What it removes is the retyping, the arithmetic and the chance of sending last month’s rate.',
  },
  {
    label: 'It cannot fix a rate card that is wrong',
    body: 'If the rate is short, the quote is short, faster. Getting the rate card right is the first conversation, and it is usually the valuable one.',
  },
  {
    label: 'The demos here are not your system',
    body: 'They are the shape of it, running on invented data for an invented flooring company. Yours would be built from your rate card, your stages and your paperwork.',
  },
]
