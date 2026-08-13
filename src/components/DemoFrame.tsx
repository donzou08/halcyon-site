import { useCallback, useEffect, useState } from 'react'
import type { System } from '../data/catalogue'

type Frame = 'phone' | 'desktop'

/** True when the viewport is wide enough to show a device frame beside the page. */
function useIsWide() {
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setWide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return wide
}

/** Wipe the keys this demo owns. Same origin, so the parent's storage is the demo's. */
function clearStorage(prefixes: string[]) {
  try {
    const doomed: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key && prefixes.some((p) => key.startsWith(p))) doomed.push(key)
    }
    doomed.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* storage blocked; a reload still returns the demo to its start */
  }
}

/**
 * The demo, embedded.
 *
 * Served from this same origin under /demos/, which is not a convenience: every
 * demo keeps its state in localStorage, and a cross-origin iframe would have
 * that partitioned away by Safari, leaving each demo unable to remember anything
 * one click after a visitor started using it. Shared origin is also how Reset
 * works, since the parent's localStorage *is* the demo's.
 *
 * **On a phone there is no inline frame.** These are mobile-first applications,
 * and putting one inside a 306px box on a 390px screen gives you a phone drawn
 * inside a phone, under a page that is also scrolling. Touch cannot tell the two
 * scrolls apart, and the app feels broken when it is not. So below 1024px the
 * demo opens full screen instead, where it gets the whole viewport and the only
 * scroll on the page is its own.
 */
export function DemoFrame({ system }: { system: System }) {
  const wide = useIsWide()
  const [frame, setFrame] = useState<Frame>(system.defaultFrame)
  const [nonce, setNonce] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  // On a phone the demo always gets the phone route where one exists.
  const effectiveFrame: Frame = wide ? frame : 'phone'
  const src = effectiveFrame === 'phone' && system.demoPhone ? system.demoPhone : system.demo

  const reset = useCallback(() => {
    clearStorage(system.storagePrefixes)
    setLoading(true)
    setNonce((n) => n + 1)
  }, [system.storagePrefixes])

  // Lock the page behind the overlay, and let Escape close it.
  useEffect(() => {
    if (!fullscreen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [fullscreen])

  if (!wide) {
    return (
      <>
        <LaunchCard system={system} onOpen={() => setFullscreen(true)} />
        {fullscreen && (
          <Fullscreen
            system={system}
            src={src}
            nonce={nonce}
            onReset={() => {
              clearStorage(system.storagePrefixes)
              setNonce((n) => n + 1)
            }}
            onClose={() => setFullscreen(false)}
          />
        )}
      </>
    )
  }

  return (
    <div>
      <div className="border border-rule-strong bg-raised">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-rule px-3 py-2.5">
          <div className="flex items-center border border-rule">
            {(['phone', 'desktop'] as Frame[]).map((f) => (
              <button
                key={f}
                onClick={() => setFrame(f)}
                aria-pressed={frame === f}
                className={`px-3 py-1.5 text-[0.78rem] transition-colors ${
                  frame === f ? 'bg-ink text-paper' : 'text-ink-3 hover:text-ink'
                }`}
              >
                {f === 'phone' ? 'On a phone' : 'On a screen'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFullscreen(true)}
            className="text-[0.8rem] font-500 text-gold-ink transition-opacity hover:opacity-70"
          >
            Full screen
          </button>
          <button
            onClick={reset}
            className="text-[0.8rem] text-ink-3 transition-colors hover:text-ink"
          >
            Reset the demo
          </button>
          <a
            href={system.demo}
            target="_blank"
            rel="noreferrer"
            className="text-[0.8rem] text-ink-3 transition-colors hover:text-ink"
          >
            Open in its own tab
          </a>
          <span className="field ml-auto hidden lg:block">Live application</span>
        </div>

        <div
          className={`relative bg-sunk ${
            frame === 'phone' ? 'flex justify-center px-4 py-8' : 'p-3'
          }`}
        >
          {loading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <span className="field">Loading the application</span>
            </div>
          )}
          <div
            className={
              frame === 'phone'
                ? 'w-full max-w-[390px] overflow-hidden rounded-[22px] border border-rule-strong bg-white'
                : 'w-full overflow-hidden border border-rule-strong bg-white'
            }
            style={{ height: frame === 'phone' ? 760 : 720 }}
          >
            <iframe
              key={`${system.slug}-${frame}-${nonce}`}
              src={src}
              title={`${system.name} demonstration`}
              onLoad={() => setLoading(false)}
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-3">
        This is the real application, not a recording. Nothing you do here reaches anyone, and Reset
        puts it back to the start.
      </p>

      {fullscreen && (
        <Fullscreen
          system={system}
          src={src}
          nonce={nonce}
          onReset={() => {
            clearStorage(system.storagePrefixes)
            setNonce((n) => n + 1)
          }}
          onClose={() => setFullscreen(false)}
        />
      )}
    </div>
  )
}

/**
 * What a phone gets instead of an iframe: one large target, above everything
 * else on the page, that says plainly what happens when you press it.
 */
function LaunchCard({ system, onOpen }: { system: System; onOpen: () => void }) {
  return (
    <div className="border border-rule-strong bg-raised">
      <div className="border-b border-rule px-5 py-2.5">
        <span className="field">The application</span>
      </div>
      <div className="p-5">
        <p className="text-[0.95rem] leading-relaxed text-ink-2">
          This is the real thing, running on your phone, filled with invented data. Press anything.
          Nothing you do reaches anyone.
        </p>
        <button
          onClick={onOpen}
          className="mt-5 w-full bg-ink px-6 py-4 text-[1rem] font-500 text-paper transition-opacity active:opacity-80"
        >
          Open {system.name}
        </button>
        <a
          href={system.demoPhone ?? system.demo}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block w-full border border-rule-strong px-6 py-3 text-center text-[0.85rem] text-ink-2"
        >
          Open in a new tab instead
        </a>
      </div>
    </div>
  )
}

/** The demo with the entire viewport, and a thin bar to get back out. */
function Fullscreen({
  system,
  src,
  nonce,
  onReset,
  onClose,
}: {
  system: System
  src: string
  nonce: number
  onReset: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-obsidian">
      <div className="flex shrink-0 items-center gap-3 border-b border-obsidian-rule px-4 py-2.5">
        <span className="min-w-0 flex-1 truncate text-[0.85rem] text-on-obsidian">
          {system.name}
        </span>
        <button
          onClick={onReset}
          className="shrink-0 text-[0.8rem] text-on-obsidian-2 active:text-on-obsidian"
        >
          Reset
        </button>
        <button
          onClick={onClose}
          className="shrink-0 border border-obsidian-rule px-3.5 py-1.5 text-[0.8rem] text-on-obsidian active:border-gold active:text-gold"
        >
          Close
        </button>
      </div>
      <iframe
        key={`fs-${system.slug}-${nonce}`}
        src={src}
        title={`${system.name} demonstration`}
        className="min-h-0 w-full flex-1 border-0 bg-white"
      />
    </div>
  )
}
