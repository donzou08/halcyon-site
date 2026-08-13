import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

import { FoundryLockup } from '../components/Brand';
import { HalcyonFooter, ResetButton } from '../components/Primitives';
import { DEMO_TODAY, WALKTHROUGH_ENTRY_ID } from '../data/seed';
import { inr, num } from '../lib/format';
import { valueOf } from '../lib/reconcile';
import { OwnerApp } from '../owner/OwnerApp';
import { useAllEntries, useStore } from '../store/useStore';
import { WorkerApp } from '../worker/WorkerApp';

/* Guided walkthrough, seven steps ----------------------------------------- */

interface Step {
  side: 'owner' | 'phone';
  caption: (ctx: { unaccounted: number; value: string }) => string;
  run?: (after: (ms: number, fn: () => void) => void) => void;
}

const s = () => useStore.getState();

function type(
  after: (ms: number, fn: () => void) => void,
  digits: string[],
  startAt: number,
  gap = 240,
): number {
  digits.forEach((d, i) => after(startAt + i * gap, () => s().pushDigit(d)));
  return startAt + digits.length * gap;
}

export const walkthroughSteps: Step[] = [
  {
    side: 'owner',
    caption: (ctx) =>
      `${num(ctx.unaccounted)} castings poured today cannot be placed at any stage. That is ${ctx.value} at what they cost to make.`,
    run: () => s().pulse('gap'),
  },
  {
    side: 'phone',
    caption: () =>
      'The phone is in Tamil because this operator reads Tamil. Ten languages, set per person rather than per plant.',
    run: (after) => {
      after(600, () => s().setLocale('ta'));
      after(1600, () => s().selectOperator('KC-2263'));
    },
  },
  {
    side: 'phone',
    caption: () =>
      'He received 6,480 from knockout. He taps one line and enters what he passed on: 5,940.',
    run: (after) => {
      s().openSheet('pass');
      const end = type(after, ['5', '9', '4', '0'], 500);
      after(end + 400, () => s().saveCount('pass'));
    },
  },
  {
    side: 'phone',
    caption: () =>
      '310 rejected for sand inclusion, with a photo of the pile. The reason is captured where the work happened, not reconstructed at month end.',
    run: (after) => {
      after(300, () => s().openSheet('reject'));
      const end = type(after, ['3', '1', '0'], 800);
      after(end + 400, () => s().saveCount('reject'));
      after(end + 1200, () => s().chooseRejectReason('SANDINC'));
      after(end + 2400, () =>
        s().attachPhoto({ kind: 'simulated', capturedAt: `${DEMO_TODAY}T17:26:00` }),
      );
    },
  },
  {
    side: 'phone',
    caption: () =>
      '6,480 in, 6,290 accounted for. The shift will not close until somebody says where the other 190 went.',
    run: (after) => after(500, () => s().tryFinish()),
  },
  {
    side: 'phone',
    caption: () =>
      'He names a cause, the shift in-charge approves it with one tap, and the shift closes. The difference now has a name against it.',
    run: (after) => {
      after(400, () => s().chooseVarianceReason('MISCOUNT_PREV'));
      after(1600, () => s().approveBySupervisor());
    },
  },
  {
    side: 'owner',
    caption: () =>
      'It reaches the office in seconds. Tap the line to see the count and the photo behind it, then say it is fine or ask about it.',
    run: (after) => {
      s().pulse('attention');
      after(700, () => s().toggleExpanded(WALKTHROUGH_ENTRY_ID));
    },
  },
];

function useCaption() {
  const walkthrough = useStore((st) => st.walkthrough);
  const entries = useAllEntries();

  const unaccounted = useMemo(
    () =>
      entries
        .filter((e) => e.date === DEMO_TODAY && e.status !== 'open')
        .reduce((acc, e) => acc + e.unaccounted, 0),
    [entries],
  );

  if (!walkthrough.active) return null;
  const step = walkthroughSteps[walkthrough.step];
  if (!step) return null;

  return {
    text: step.caption({ unaccounted, value: inr(valueOf(unaccounted)) }),
    side: step.side,
    index: walkthrough.step,
  };
}

function WalkthroughBar() {
  const walkthrough = useStore((st) => st.walkthrough);
  const setWalkthroughStep = useStore((st) => st.setWalkthroughStep);
  const stopWalkthrough = useStore((st) => st.stopWalkthrough);
  const startWalkthrough = useStore((st) => st.startWalkthrough);

  /**
   * Steps are timed so the room can watch them happen. Reaching for Next early
   * runs whatever is still pending rather than dropping it, and a step never
   * runs twice, so the figures are the same however fast this is clicked.
   */
  const pending = useRef<Array<{ id: number; fn: () => void; done: boolean }>>([]);
  const highestRun = useRef(-1);

  const flush = useCallback(() => {
    const queued = pending.current;
    pending.current = [];
    queued.forEach((item) => {
      window.clearTimeout(item.id);
      if (!item.done) {
        item.done = true;
        item.fn();
      }
    });
  }, []);

  useEffect(
    () => () => {
      pending.current.forEach((item) => window.clearTimeout(item.id));
      pending.current = [];
    },
    [],
  );

  const runStep = useCallback(
    (index: number) => {
      flush();
      if (index <= highestRun.current) return;
      highestRun.current = index;

      walkthroughSteps[index]?.run?.((ms, fn) => {
        const item = { id: 0, fn, done: false };
        item.id = window.setTimeout(() => {
          if (item.done) return;
          item.done = true;
          fn();
        }, ms);
        pending.current.push(item);
      });
    },
    [flush],
  );

  if (!walkthrough.active) {
    return (
      <button
        type="button"
        onClick={() => {
          flush();
          highestRun.current = -1;
          startWalkthrough();
          window.setTimeout(() => runStep(0), 60);
        }}
        className="flex items-center gap-2 rounded-control bg-ink px-4 py-2.5 text-[14px] font-semibold text-white"
      >
        <Play size={14} strokeWidth={2.5} />
        Show me how it works
      </button>
    );
  }

  const isLast = walkthrough.step === walkthroughSteps.length - 1;

  return (
    <div className="flex items-center gap-2">
      <span className="num text-[13px] text-muted">
        {walkthrough.step + 1} of {walkthroughSteps.length}
      </span>
      <button
        type="button"
        disabled={walkthrough.step === 0}
        onClick={() => {
          const next = walkthrough.step - 1;
          setWalkthroughStep(next);
          runStep(next);
        }}
        aria-label="Back a step"
        className="flex h-10 w-10 items-center justify-center rounded-control border border-line bg-white text-muted disabled:opacity-40"
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => {
          if (isLast) {
            flush();
            stopWalkthrough();
            return;
          }
          const next = walkthrough.step + 1;
          setWalkthroughStep(next);
          runStep(next);
        }}
        className="flex items-center gap-1.5 rounded-control bg-ink px-4 py-2.5 text-[14px] font-semibold text-white"
      >
        {isLast ? 'Finish' : 'Next'}
        {!isLast && <ChevronRight size={14} strokeWidth={2.5} />}
      </button>
      <button
        type="button"
        onClick={() => {
          flush();
          stopWalkthrough();
        }}
        aria-label="Close"
        className="flex h-10 w-10 items-center justify-center rounded-control border border-line bg-white text-muted"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/** Always under the phone, so the viewer's eye learns one place to look. */
function CaptionCard({ text, index }: { text: string; index: number }) {
  return (
    <div key={index} className="animate-riseIn card w-full p-5">
      <p className="num text-[12px] font-semibold tracking-wide text-faint uppercase">
        Step {index + 1}
      </p>
      <p className="mt-1.5 text-[17px] leading-relaxed">{text}</p>
    </div>
  );
}

/* Split view --------------------------------------------------------------- */

/**
 * ?clean=1 hides the presenter controls for recording, the same convention the
 * other Halcyon demos use. The "Demonstration data" note is never hidden.
 */
function useCleanMode(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    const value = new URLSearchParams(window.location.search).get('clean');
    return value === '1' || value === 'true';
  }, []);
}

export function SplitView() {
  const clean = useCleanMode();
  const [ratio, setRatio] = useState(0.38);
  const caption = useCaption();

  const headerRef = useRef<HTMLElement | null>(null);
  const [chromeTop, setChromeTop] = useState(0);
  useEffect(() => {
    const measure = () => setChromeTop(headerRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setRatio(Math.min(0.7, Math.max(0.24, (event.clientX - rect.left) / rect.width)));
    }
    function onUp() {
      draggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div
      className="flex h-screen flex-col bg-canvas"
      style={{ ['--overlay-top' as string]: `${chromeTop}px` }}
    >
      <header
        ref={headerRef}
        className="relative z-50 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-white px-5 py-3"
      >
        <Link to="/" className="transition-opacity duration-150 hover:opacity-80">
          <FoundryLockup />
        </Link>
        {!clean && (
          <span className="ml-auto flex items-center gap-2">
            <WalkthroughBar />
            <ResetButton />
          </span>
        )}
      </header>

      <div ref={containerRef} className="flex min-h-0 flex-1">
        <div
          className="flex min-w-0 flex-col gap-3 overflow-hidden p-6"
          style={{ width: `${ratio * 100}%` }}
        >
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex h-full max-h-[820px] w-full max-w-[380px] flex-col overflow-hidden rounded-[28px] border-4 border-ink bg-white shadow-lift">
              <WorkerApp />
            </div>
          </div>
          {caption && <CaptionCard text={caption.text} index={caption.index} />}
        </div>

        <div
          onPointerDown={() => {
            draggingRef.current = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
          className="group flex w-2 shrink-0 cursor-col-resize items-center justify-center border-x border-line bg-white"
          role="separator"
          aria-orientation="vertical"
        >
          <span className="h-10 w-0.5 rounded-full bg-line group-hover:bg-muted" />
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto">
          <OwnerApp dense />
          <HalcyonFooter />
        </div>
      </div>
    </div>
  );
}
