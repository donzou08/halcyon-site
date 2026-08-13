import { useEffect, useRef, useState, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

import { useStore } from '../store/useStore';
import { num } from '../lib/format';

/** Any numeral. Tabular figures so columns line up and nothing jumps. */
export function Num({
  value,
  className = '',
  raw,
}: {
  value?: number;
  className?: string;
  raw?: string;
}) {
  return <span className={`num ${className}`}>{raw ?? num(value ?? 0)}</span>;
}

/** Counts from the old figure to the new one, so a change is visible. */
export function AnimatedNumber({
  value,
  className = '',
  format = num,
  duration = 600,
}: {
  value: number;
  className?: string;
  format?: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  useEffect(() => {
    fromRef.current = display;
  }, [display]);

  return <span className={`num ${className}`}>{format(display)}</span>;
}

/**
 * A white card. When an operator action changes what it shows, it rings and
 * scrolls itself into view, so the thing being talked about is on screen.
 */
export function Card({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const highlight = useStore((s) => s.highlight);
  const lit = id !== undefined && highlight?.panel === id;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!lit) return;
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [lit, highlight?.token]);

  return (
    <section
      ref={ref}
      key={lit ? `${id}-${highlight?.token}` : id}
      className={`card ${lit ? 'animate-pulseRing' : ''} ${className}`}
    >
      {children}
    </section>
  );
}

export function HalcyonFooter() {
  return (
    <footer className="py-3 text-center text-xs" style={{ color: '#94A3B8' }}>
      Powered by{' '}
      <a
        href="https://halcyon.uno"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.06em',
          color: 'inherit',
          textDecoration: 'none',
          borderBottom: '1px solid currentColor',
        }}
      >
        Halcyon
      </a>
    </footer>
  );
}

/** Available everywhere. Two presses, so one stray click cannot wipe the demo. */
export function ResetButton() {
  const resetDemo = useStore((s) => s.resetDemo);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 3000);
    return () => window.clearTimeout(t);
  }, [armed]);

  return (
    <button
      type="button"
      onClick={() => {
        if (armed) {
          resetDemo();
          setArmed(false);
        } else {
          setArmed(true);
        }
      }}
      className={`flex items-center gap-1.5 rounded-control border px-3 py-2 text-sm font-medium transition-colors ${
        armed
          ? 'border-bad bg-badsoft text-bad'
          : 'border-line bg-white text-muted hover:text-ink'
      }`}
    >
      <RotateCcw size={14} strokeWidth={2} />
      {armed ? 'Tap again to reset' : 'Start over'}
    </button>
  );
}
