import { Link } from 'react-router-dom'
import { nicheBySlug, type System } from '../data/catalogue'

/**
 * One system, as a row in a catalogue.
 *
 * A row rather than a tile, for two reasons. The demos are a mix of phone
 * applications and desktop ones, and a grid of equal tiles has to crop a tall
 * phone screen and a wide dashboard to the same band, which throws away the part
 * of each that is worth seeing. And on the search page a ranked list of rows is
 * the shape an answer already has.
 *
 * The image leads. An earlier version led with prose, which asked a stranger to
 * take on trust that working software existed. The screenshot is the proof; the
 * words explain it.
 *
 * **No status badge.** These read as the products Halcyon has built, and
 * labelling each one live, in progress or a demonstration turned a portfolio
 * into a status board. Nothing here claims a client either way, so nothing needs
 * qualifying: the figures that appear are the ones that can be defended, and the
 * systems without them simply carry none.
 *
 * **The two shot shapes get different layouts, deliberately.** A phone screen
 * stays beside the text from `sm` up. Below that both are a banner, because
 * letterboxing a 390x844 image into a full-width mobile column leaves two grey
 * margins and a hundred-pixel sliver of the app.
 */
export function SystemCard({
  system,
  reasons,
}: {
  system: System
  /** Phrases that matched the query, shown so the result looks reasoned. */
  reasons?: string[]
}) {
  const shot = system.shots[0]
  const isPhone = shot?.kind === 'phone'
  const niche = nicheBySlug(system.niche)

  return (
    <article className="group relative border border-rule bg-raised transition-colors hover:border-rule-strong">
      <div className="flex flex-col sm:flex-row">
        {/* The image is positioned rather than flowed, so the text decides how
            tall the row is. Left in the flow, a 390x844 phone screen in a 200px
            column forces a 433px row and empties the card across the middle. */}
        {shot && (
          <div
            className={`relative h-[184px] shrink-0 self-stretch overflow-hidden border-b border-rule bg-sunk sm:h-auto sm:border-r sm:border-b-0 ${
              isPhone ? 'sm:w-[168px] lg:w-[196px]' : 'sm:w-[280px] lg:w-[330px]'
            }`}
          >
            <img
              src={`/shots/${shot.src}.png`}
              alt=""
              width={shot.kind === 'phone' ? 390 : 1360}
              height={shot.kind === 'phone' ? 844 : 850}
              loading="lazy"
              decoding="async"
              style={{ '--focus': shot.focus ?? '50% 0%' } as React.CSSProperties}
              className="shot-crop absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:flex-row lg:gap-8">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="field">{system.code}</span>
              <span className="h-3 w-px bg-rule-strong" aria-hidden="true" />
              <span className="field">{niche?.name ?? ''}</span>
            </div>

            <h3 className="display-sm mt-3 text-[1.25rem] sm:text-[1.5rem]">
              <Link
                to={`/${system.slug}`}
                className="after:absolute after:inset-0 after:content-['']"
              >
                {system.name}
              </Link>
            </h3>

            <p className="prose-measure mt-2 text-[0.9rem] leading-relaxed text-ink-2 sm:text-[0.95rem]">
              {system.tagline}
            </p>

            {reasons && reasons.length > 0 && (
              <div className="mt-4 flex flex-wrap items-baseline gap-2">
                <span className="field">Matched</span>
                {reasons.map((r) => (
                  <span
                    key={r}
                    className="border border-gold/45 bg-gold-wash px-2 py-0.5 text-[0.74rem] text-gold-ink"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto pt-5">
              <span className="relative z-10 text-[0.85rem] font-500 text-ink transition-colors group-hover:text-gold-ink">
                Open it{' '}
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </div>
          </div>

          {/* The spec column. Figures where a datasheet keeps them, which is also
              what stops a wide row from running out of content halfway across. */}
          <div className="mt-5 shrink-0 border-t border-rule pt-4 lg:mt-0 lg:w-[210px] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            {system.proof.length > 0 ? (
              <dl className="flex flex-wrap gap-x-8 gap-y-3 lg:block lg:space-y-4">
                {system.proof.map((p) => (
                  <div key={p.label}>
                    <dt className="text-[0.72rem] leading-snug text-ink-3">{p.label}</dt>
                    <dd className="num mt-0.5 text-[1rem] leading-tight font-500 text-gold-ink">
                      {p.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div>
                <span className="field">What it handles</span>
                <ul className="mt-2.5 space-y-1.5">
                  {system.workflows.slice(0, 3).map((w) => (
                    <li key={w} className="text-[0.82rem] leading-snug text-ink-2">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
