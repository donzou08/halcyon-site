/**
 * Everything the portfolio says outside the catalogue.
 *
 * This site is the portfolio and nothing else. The company site is halcyon.uno
 * and is unchanged; this one exists to show the work and to start a
 * conversation. It is written to be mounted at halcyon.uno/works later.
 *
 * House style: no em dashes; "we", not "I", except where Sanjith personally
 * does the thing; never the word "free"; never lead with AI.
 *
 * **No prices anywhere.** Work is scoped and quoted per project on the
 * complexity of the job, and publishing tiers invited people to shop a package
 * rather than describe their problem.
 */

export const CONTACT = {
  founder: 'Sanjith Dhandapani',
  role: 'Founder, Halcyon',
  email: 'sanjith@halcyon.uno',
  site: 'https://halcyon.uno',

  /**
   * The number, in one place.
   *
   * This is the only line to change when the number changes. It drives the
   * WhatsApp button in the header of every page, the WhatsApp and phone rows on
   * /contact, the footer, and the button at the bottom of every system page.
   * Nothing else hard-codes it.
   *
   * Write it as it should read, for example '+91 98765 43210'. The country code
   * matters: the WhatsApp link is built from the digits, and wa.me will not open
   * a chat without one.
   */
  phone: '+91 91760 88866',

  /**
   * A separate WhatsApp number, for when the two differ.
   *
   * Empty means WhatsApp uses `phone` above, which is the case today: the number
   * is Sanjith's personal one. When a business number arrives, the choice is:
   *
   * - **Business WhatsApp, personal phone stays private:** put the new number
   *   here and leave `phone` alone. The site then shows the business number for
   *   WhatsApp and the personal one for calls, which is probably not what you
   *   want.
   * - **Business number for everything:** change `phone` and leave this empty.
   *   That is the usual answer, and it is one line.
   */
  whatsapp: '',

  responseTime: 'Personally, within 24 hours.',
} as const

const digits = (v: string) => v.replace(/[^\d]/g, '')

export const HAS_PHONE = CONTACT.phone.trim().length > 0
export const PHONE_HREF = `tel:+${digits(CONTACT.phone)}`

const waNumber = CONTACT.whatsapp.trim() || CONTACT.phone.trim()
export const HAS_WHATSAPP = waNumber.length > 0

/**
 * A WhatsApp link carrying the system the visitor was looking at.
 *
 * The first message decides whether a conversation happens, and "Hi" from an
 * unknown number rarely gets one. Naming the system means Sanjith opens the
 * chat already knowing what they came for.
 */
export function whatsappHref(system?: string): string {
  const text = system
    ? `Hi Sanjith, I was looking at the ${system} on the Halcyon site.`
    : 'Hi Sanjith, I was looking at the Halcyon site.'
  return `https://wa.me/${digits(waNumber)}?text=${encodeURIComponent(text)}`
}

export const REACH = 'In person across Chennai and Tamil Nadu, and over a call anywhere in India.'

/**
 * What replaced the pricing tiers.
 *
 * The old site published Starter, Growth and Partner with rupee ranges. It
 * taught people to pick a package and ask what it includes, which is the
 * opposite of the conversation worth having, and it priced work before anyone
 * had seen the work.
 */
export const PRICING_STANCE = {
  heading: 'What it costs depends on what it has to do.',
  body: 'Every system here was quoted on the complexity of the job: how many people touch it, how much of your existing process it has to carry, and how much has to be built from nothing. There is no package to choose from and no per-seat licence. Tell us what the work looks like and you get a number for that work.',
  note: 'The first conversation and the map it produces are included at no cost, and they are yours whether or not you go ahead.',
} as const

/** Why the demonstrations carry invented data, said once, plainly. */
export const SAMPLE_DATA_NOTE =
  'Every business, person, price and figure inside these is invented. No client data appears anywhere on this site, which is the whole reason these public versions exist separately from the systems themselves.'
