/**
 * The industrial flooring landing page.
 *
 * A vertical page for one trade, and the only page on this site written to be
 * read by somebody who knows the subject better than we do. That changes what it
 * can say. Generic operations copy reads as somebody who has never stood on a
 * site; naming the coat order, the coverage categories or the way a serial rolls
 * at the financial year reads as somebody who has.
 *
 * **Everything here is taken from the two systems actually running in
 * production**, not from the public demos, which are simplified rebuilds. Where
 * the two differ, this file follows production, because the page is describing
 * what gets built rather than what is embedded below it.
 *
 * **No market statistics.** The observations about where money leaks describe
 * the work, not research dressed as fact. The only numbers on the page come from
 * the proof ledger, through the catalogue.
 *
 * **No real end-client names.** The production system carries the actual
 * factories it is deployed across. Those never appear here, exactly as the demos
 * wear invented companies.
 */

export interface Leak {
  /** Which of the three systems answers it. */
  slug: string
  stage: string
  title: string
  body: string
  cost: string
}

/**
 * The spine: three places a flooring contract loses money, in the order they
 * happen. Each maps to one system, which is why this trade gets a page.
 */
export const LEAKS: Leak[] = [
  {
    slug: 'tender',
    stage: 'Finding the job',
    title: 'The tender that closed before anyone opened it',
    body: 'Public flooring work is posted across portals that do not talk to each other, and several put a CAPTCHA in front of the list. Checking them properly is most of a morning, so in practice it happens on a Monday, or when somebody remembers.',
    cost: 'A job closes unseen. The ones you do open still have to be read in full before the turnover threshold or the registration class tells you it was never yours.',
  },
  {
    slug: 'quotation',
    stage: 'Pricing the job',
    title: 'An hour of retyping, and the primer left off',
    body: 'Rates live in a spreadsheet, the document lives in Word, and the version that reached the customer is whichever was saved last. Surface preparation gets forgotten on the fast ones. Filler for undulations gets guessed.',
    cost: 'A margin set by whoever typed it. Three weeks on, nobody can say what the job was quoted at, or which of the four revisions the customer is holding.',
  },
  {
    slug: 'supervisor',
    stage: 'Running the job',
    title: 'A site you hear about in the evening',
    body: 'Updates arrive as photographs in a WhatsApp group with no location, no time and no order to them. Working out whether a site moved today means scrolling back through a thousand messages, or ringing four people.',
    cost: 'Rework, found late. It never shows up as a labour problem in the accounts, because nobody compared the area quoted with the area actually laid.',
  },
]

export interface Feature {
  label: string
  body: string
}

/**
 * The Quotation Engine, in the depth the production system deserves.
 *
 * Two things sell it and neither is "it makes a PDF". The first is that the
 * document is the one they already send, down to the letterhead artwork and the
 * page geometry. The second is that every quote is kept, which turns a folder of
 * Word files into something you can ask questions of.
 */
export const QUOTATION_DEPTH: Feature[] = [
  {
    label: 'The PDF is the document you already send',
    body: 'Not a template that resembles it. The real letterhead artwork sits in the file, and the page geometry is taken from the master quotation shell the company was already using, so the margins and banners land where they always did. A customer receiving it cannot tell it came from software.',
  },
  {
    label: 'It carries everything a quotation legally needs',
    body: 'GSTIN and SAC code, CGST and SGST or IGST at the rates you set, the basic amount, a round-off line of its own, bank name, branch, account number and IFSC for payment, your payment terms, validity in days, and the signatory’s name, title and phone.',
  },
  {
    label: 'Serial numbers that behave like your books',
    body: 'A configurable prefix, the division, the number, and the Indian financial year, rolling at April so it reads 26-27 from June. Every revision keeps the serial, so a quote reissued four times is still one quote with four versions rather than four quotes.',
  },
  {
    label: 'Past quotes is the part nobody expects',
    body: 'Every quotation ever raised, in one list, showing the latest version of each serial. Filter by company, site location, division, brand, salesperson or date range, and the total value and the count for this week, this month and this year move with the filter.',
  },
  {
    label: 'The pipeline you did not know you had',
    body: 'Because the quotes are kept, the value of everything quoted and not yet won is a number rather than a feeling. What was sent to whom, when, at what price, and whether anyone followed it up.',
  },
  {
    label: 'Export to Excel for anyone who wants Excel',
    body: 'One row per line item, so the product, quantity and rate are meaningful and the sheet pivots. Quote-level identifiers repeat on every row; the money appears only on the first row of each quote, so a summed column cannot double count.',
  },
  {
    label: 'Priced the way a resin floor is actually built',
    body: 'Layer by layer. Primer by coverage rate, filler by the kilogram, screed and top coat by area times thickness times the density of that particular material. Change a thickness and the quantity follows, because it is the same arithmetic your estimator does by hand.',
  },
  {
    label: 'Customers, sites and their own prices',
    body: 'A company has sites; a site has an address, a state, a delivery address and its own contact. Prices can be overridden per customer, so the one who negotiated a rate two years ago keeps it without anybody having to remember.',
  },
]

/**
 * The Field Supervisor, in production depth.
 *
 * The demo shows check-in and check-out. The running system is a great deal more
 * than that, and the parts that matter most to an owner are the ones that turn
 * a day of work into a number he can act on without asking anybody.
 */
export const SUPERVISOR_DEPTH: Feature[] = [
  {
    label: 'A name and a four digit PIN',
    body: 'No email address, no password reset, no app store. It installs to the home screen like an app and signs in the way a supervisor expects a phone to work. That decision is why it is used, and it was not a small one.',
  },
  {
    label: 'Progress is calculated from area, not estimated',
    body: 'Each stage is complete to the extent of the coverage logged against it, divided by the site area. The overall figure is the average of the stages, so it can never disagree with the breakdown underneath it. Nobody drags a slider.',
  },
  {
    label: 'And it shows you the arithmetic',
    body: 'A separate page sets out how the number was reached, stage by stage, and checks it against the target date for that stage so a site that is behind says so. A progress figure nobody can interrogate is a progress figure nobody believes.',
  },
  {
    label: 'Coverage totals across every site',
    body: 'Primer, screed, top coat, yellow line, filling and oil removal, each with its thickness and quantity, added up for today, this week and this month. That is the number that tells you whether the month was busy, and it is a by-product of checking out.',
  },
  {
    label: 'The work day, not just the visit',
    body: 'It starts from home and ends at home, so travel is the sum of the legs home to site to site to home, with a road factor over the straight line. Overnight work rolls into the right day. Holiday and rest days block check-in. Travel compensation stops being an argument.',
  },
  {
    label: 'Stock on site, and when it runs low',
    body: 'Material, consumable, tool and machinery, with what was there and what is left. A low reading flags itself, which is cheaper than a team standing on a floor waiting for a drum.',
  },
  {
    label: 'Issues that are quality or safety, and get closed',
    body: 'Raised on site with photographs, acknowledged by the owner, then resolved or dismissed on the record. Not a message in a group that scrolls away by Thursday.',
  },
  {
    label: 'The daily report writes itself, and goes out on WhatsApp',
    body: 'One tap at the end of the day. Everything the owner exports, in a branded PDF or a full Excel workbook, is customer-facing and carries no emoji, because some of it gets forwarded.',
  },
]

/**
 * How a system is actually made.
 *
 * The correction that prompted this section: nothing "ships with" a rate card.
 * A page that lists one implies a product with a fixed catalogue, which is the
 * opposite of what is being sold and would be caught out in the first meeting.
 */
export const BUILT_FROM_YOURS: Feature[] = [
  {
    label: 'Your systems and your brands',
    body: 'The products in the demo belong to the contractor it was built for. Yours are different: your material brands, your build-ups, your densities, your thicknesses. They go in as they are, and they are editable afterwards without calling us.',
  },
  {
    label: 'Your rates, and your exceptions',
    body: 'Including the ones that are not on any list. The customer with a rate agreed two years ago, the division that prices differently, the job that carries a support commitment because it is going overseas.',
  },
  {
    label: 'Your document',
    body: 'Send the quotation you send today. The output is built to match it, on your letterhead, with your terms, your bank details and your signature block, so nothing about the way you look to a customer changes.',
  },
  {
    label: 'Your stages',
    body: 'A resin floor is not the only way to build a floor. The stages a job moves through are set per site, with a target date each, and the progress calculation follows whatever you set rather than a fixed list.',
  },
]

/** One contractor's rate card. Shown as an example, never as a catalogue. */
export const EXAMPLE_RATE_CARD: Feature[] = [
  { label: '300 Micron Epoxy Coating', body: 'Two-coat roller-applied, light traffic' },
  { label: '2mm Epoxy Self-Levelling', body: 'Seamless self-smoothing screed' },
  { label: '3mm Epoxy Self-Levelling', body: 'Heavier build for forklift traffic' },
  { label: '5mm Epoxy Self-Levelling', body: 'Heavy-duty, impact-loaded bays' },
  { label: '6mm PU Concrete', body: 'Thermal shock and chemicals, wet process' },
  { label: '2mm ESD Anti-Static', body: 'Conductive grid with earthing' },
  { label: '1mm Anti-Skid', body: 'Broadcast aggregate, ramps and wet zones' },
  { label: 'Floor Hardener / Densifier', body: 'Lithium silicate with mechanical polish' },
]

/** The stages the Field Supervisor tracks a job through, in one contractor's setup. */
export const STAGES = ['Surface preparation', 'Primer', 'Screed / body coat', 'Top coat', 'Line marking']

/**
 * What it does not do.
 *
 * On a page aimed at people who have been sold software before, the limits are
 * more persuasive than the features, and saying them first is cheaper than being
 * caught on them in a meeting.
 */
export const LIMITS: Feature[] = [
  {
    label: 'It is not accounting software',
    body: 'It does not file returns and it does not replace Tally. It produces the quotation and the site record your accounts are built from.',
  },
  {
    label: 'It does not price the job for you',
    body: 'The rates are yours and the judgement stays yours. What goes is the retyping, the arithmetic, and the chance of sending last year’s rate.',
  },
  {
    label: 'It cannot fix a rate card that is wrong',
    body: 'If the rate is short, the quote is short, faster. Getting that right is the first conversation, and it is usually the valuable one.',
  },
  {
    label: 'The demos here are not your system',
    body: 'They are the shape of it, on invented data for an invented company. Yours is built from your rate card, your stages and your paperwork.',
  },
]
