import type { Shot } from '../data/catalogue'

/**
 * A screenshot, presented as a plate in a technical document.
 *
 * Deliberately not a glossy device mockup. A rendered iPhone shell with a notch
 * and a reflection is the stock way to show an app, it dates immediately, and it
 * spends the visitor's attention on the phone rather than on the software. A
 * ruled frame with a strip carrying the plate number and the device is the same
 * information in this site's own vocabulary, and it puts the pixels first.
 *
 * The aspect ratios are the capture viewports in `scripts/capture-shots.mjs`.
 * They are declared here so the frame reserves its space before the image
 * decodes and the page does not shift as shots arrive.
 */

const RATIO: Record<Shot['kind'], string> = {
  phone: '390 / 844',
  screen: '1360 / 850',
}

const DEVICE: Record<Shot['kind'], string> = {
  phone: 'On a phone',
  screen: 'On a screen',
}

export function Plate({
  shot,
  index,
  showCaption = true,
  priority = false,
  className = '',
}: {
  shot: Shot
  /** Plate number within its page. One-based. */
  index?: number
  showCaption?: boolean
  /** The hero shot is the largest paint on the page and must not lazy-load. */
  priority?: boolean
  className?: string
}) {
  return (
    <figure className={`m-0 ${className}`}>
      <div className="border border-rule-strong bg-raised">
        <div className="flex items-center justify-between border-b border-rule px-3 py-2">
          <span className="field">
            {index !== undefined ? `Plate ${String(index).padStart(2, '0')} · ` : ''}
            {DEVICE[shot.kind]}
          </span>
          <span className="field">Sample data</span>
        </div>
        <div style={{ aspectRatio: RATIO[shot.kind] }} className="overflow-hidden bg-sunk">
          <img
            src={`/shots/${shot.src}.png`}
            alt={shot.caption}
            width={shot.kind === 'phone' ? 390 : 1360}
            height={shot.kind === 'phone' ? 844 : 850}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>
      {showCaption && (
        <figcaption className="mt-3 text-[0.82rem] leading-relaxed text-ink-3">
          {shot.caption}
        </figcaption>
      )}
    </figure>
  )
}

/**
 * The bare image, no frame. Used where the surrounding component already draws
 * one, as on a system card, so the plate strip is not repeated inside a card
 * that is itself ruled.
 */
export function ShotImage({
  shot,
  className = '',
  priority = false,
}: {
  shot: Shot
  className?: string
  priority?: boolean
}) {
  return (
    <div style={{ aspectRatio: RATIO[shot.kind] }} className={`overflow-hidden bg-sunk ${className}`}>
      <img
        src={`/shots/${shot.src}.png`}
        alt={shot.caption}
        width={shot.kind === 'phone' ? 390 : 1360}
        height={shot.kind === 'phone' ? 844 : 850}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.015]"
      />
    </div>
  )
}
