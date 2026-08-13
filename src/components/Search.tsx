import { SUGGESTIONS } from '../lib/search'
import { CONTACT } from '../data/site'

export function SearchField({
  value,
  onChange,
  autoFocus = false,
}: {
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}) {
  return (
    <div>
      <label htmlFor="system-search" className="field field-teal">
        Search by trade, or by the job
      </label>
      <div className="relative mt-3">
        <input
          id="system-search"
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pest control, quotations…"
          autoComplete="off"
          className="searchfield display-sm w-full pr-10 text-[1.35rem] text-ink placeholder:font-400 placeholder:text-ink-3/70 sm:text-[1.7rem]"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            aria-label="Clear the search"
            className="absolute top-1 right-0 flex h-8 w-8 items-center justify-center text-ink-3 transition-colors hover:text-ink"
          >
            <span aria-hidden="true" className="text-[1.1rem]">
              ×
            </span>
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="field mr-1">Try</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className="border border-rule bg-raised px-3 py-1.5 text-[0.82rem] text-ink-2 transition-colors hover:border-gold hover:text-gold-ink"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * What a visitor sees when nothing matches.
 *
 * This is the most valuable screen on the site, so it does not say "no results".
 * Somebody has just told us, in their own words, what their business does and
 * what it struggles with, which is the exact thing a first call is for. The
 * screen asks them to finish that sentence and carries their own words into the
 * message so they do not have to type it twice.
 */
export function NoResults({ query }: { query: string }) {
  const subject = encodeURIComponent(`Halcyon, ${query}`)
  const body = encodeURIComponent(
    `I searched the Halcyon site for "${query}" and did not find it.\n\n` +
      `What we run:\n\n` +
      `The job we keep doing twice:\n\n`,
  )

  return (
    <div className="settle border border-rule bg-raised">
      <div className="border-b border-rule px-6 py-3 sm:px-10">
        <span className="field">No system indexed under this term</span>
      </div>
      <div className="px-6 py-10 sm:px-10 sm:py-14">
        <h2 className="display max-w-2xl text-[1.8rem] sm:text-[2.4rem]">
          Nothing here matches “{query}”. That is worth a conversation, not an apology.
        </h2>
        <p className="prose-measure mt-6 text-[1rem] leading-relaxed text-ink-2">
          Five systems is not a product range, it is what has been built so far. The useful question
          is not whether we have already made something for your trade. It is whether the job you
          are doing twice looks like one of these underneath, and that is usually decided in about
          twenty minutes on a call.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a
            href={`mailto:${CONTACT.email}?subject=${subject}&body=${body}`}
            className="border border-ink bg-ink px-6 py-3.5 text-[0.9rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink"
          >
            Tell us what you run
          </a>
          <span className="text-[0.86rem] text-ink-3">
            Your search term is already in the message.
          </span>
        </div>
      </div>
    </div>
  )
}
