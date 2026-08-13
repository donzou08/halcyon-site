import { NICHES, SYSTEMS, type System } from '../data/catalogue'

/**
 * Search.
 *
 * The point of this field is that a visitor arrives thinking in one of two
 * ways, and both have to work. Either they think in trades ("we do pest
 * control") or they think in jobs ("we keep retyping quotations"). So every
 * system carries both an industry list and a workflow list, and a match on a
 * trade Halcyon has never worked in is a first-class result, not a near-miss.
 *
 * Small enough to score by hand every keystroke. No index, no library.
 */

export interface Hit {
  system: System
  score: number
  /** The strings that matched, to show the visitor why this came up. */
  reasons: string[]
}

interface Field {
  values: string[]
  weight: number
  /** Whether a match here is worth explaining back to the visitor. */
  show: boolean
}

function fieldsOf(s: System): Field[] {
  const niche = NICHES.find((n) => n.slug === s.niche)
  return [
    { values: [s.name], weight: 60, show: false },
    { values: s.workflows, weight: 40, show: true },
    { values: s.alsoWorksFor, weight: 34, show: true },
    { values: [niche?.name ?? ''], weight: 26, show: true },
    { values: s.replaces, weight: 22, show: true },
    { values: s.searchTerms, weight: 18, show: false },
    { values: [s.tagline], weight: 10, show: false },
    { values: s.does, weight: 6, show: false },
    { values: [s.problem], weight: 4, show: false },
    { values: [s.client], weight: 4, show: false },
  ]
}

function normalise(v: string): string {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * People type sentences, not keywords: "we send people to site", "how do I stop
 * quoting twice". Without this list the function words match the prose in every
 * system's `problem` paragraph and the result is all five, ranked by accident.
 */
const STOPWORDS = new Set([
  'a',
  'about',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'been',
  'but',
  'by',
  'can',
  'do',
  'does',
  'each',
  'every',
  'for',
  'from',
  'get',
  'go',
  'goes',
  'had',
  'has',
  'have',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'keep',
  'lot',
  'make',
  'me',
  'my',
  'need',
  'no',
  'not',
  'of',
  'on',
  'one',
  'or',
  'our',
  'out',
  'so',
  'some',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'they',
  'thing',
  'things',
  'this',
  'to',
  'too',
  'up',
  'us',
  'use',
  'want',
  'was',
  'we',
  'what',
  'when',
  'where',
  'which',
  'who',
  'will',
  'with',
  'would',
  'you',
  'your',
])

/**
 * Crude singulariser, applied to both sides of every comparison.
 *
 * People type plurals. "quotations" is one of this page's own suggestion chips,
 * and without this it matched nothing at all: the catalogue says "Quotation
 * Engine" and "quotation", and none of the string tests below reach from one to
 * the other, because the typed word is the longer one.
 *
 * Deliberately not a real stemmer. It has to be right on the vocabulary of this
 * catalogue rather than on English, and a library would be a dependency to make
 * ten words agree. `ss` is excluded so "business" and "process" survive.
 */
function singular(w: string): string {
  if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`
  if (w.length > 4 && (w.endsWith('ches') || w.endsWith('shes') || w.endsWith('sses')))
    return w.slice(0, -2)
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us'))
    return w.slice(0, -1)
  return w
}

/**
 * Score one term against one value.
 *
 * Whole-value equality beats a word starting with the term, which beats the
 * term appearing anywhere. "site" should not rank a system above one actually
 * called "Site something" just because the word is buried in a paragraph.
 *
 * `term` arrives already singularised, so only the value needs reducing here.
 */
function scoreValue(term: string, value: string): number {
  const v = normalise(value)
  if (!v) return 0
  if (v === term) return 1

  const words = v.split(' ')
  const stems = words.map(singular)

  if (stems.some((w) => w === term)) return 0.85
  if (stems.some((w) => w.startsWith(term))) return 0.6
  if (term.length >= 4 && (v.includes(term) || stems.join(' ').includes(term))) return 0.4
  return 0
}

export function search(query: string): Hit[] {
  const q = normalise(query)
  if (!q) return []

  const all = q.split(' ').filter((t) => t.length >= 2)
  // Keep the stopwords only if that is genuinely all the visitor typed, so a
  // one-word query like "one" still does something rather than nothing.
  const meaningful = all.filter((t) => !STOPWORDS.has(t))
  const terms = (meaningful.length > 0 ? meaningful : all).map(singular)
  if (terms.length === 0) return []

  const hits: Hit[] = []

  for (const system of SYSTEMS) {
    const fields = fieldsOf(system)
    let score = 0
    const reasons = new Set<string>()
    /** Every term has to land somewhere, or the query is not about this system. */
    let termsMatched = 0

    for (const term of terms) {
      let best = 0
      for (const field of fields) {
        for (const value of field.values) {
          const s = scoreValue(term, value)
          if (s === 0) continue
          const weighted = s * field.weight
          if (weighted > best) best = weighted
          if (field.show && s >= 0.6) reasons.add(value)
        }
      }
      if (best > 0) {
        termsMatched += 1
        score += best
      }
    }

    if (termsMatched === 0) continue
    // A query where only half the words land is a weaker answer than one where
    // they all do, even if the half that landed scored well.
    score *= termsMatched / terms.length

    hits.push({ system, score, reasons: [...reasons].slice(0, 3) })
  }

  hits.sort((a, b) => b.score - a.score)

  // Showing five results for every query teaches a visitor that the field is
  // decorative. Anything scoring well below the best answer is not an answer.
  const top = hits[0]?.score ?? 0
  return hits.filter((h) => h.score >= top * 0.45)
}

/** Prompts under the field. Each one returns something. */
export const SUGGESTIONS = [
  'Quotations',
  'Field staff',
  'Tenders',
  'Counting production',
  'Everything in one place',
  'Pest control',
  'WhatsApp photos',
]
