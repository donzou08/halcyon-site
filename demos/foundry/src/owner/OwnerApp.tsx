import { useMemo } from 'react';
import { Check, ChevronDown, Download, MessageSquare } from 'lucide-react';

import { FoundryLockup } from '../components/Brand';
import { AnimatedNumber, Card, Num, ResetButton } from '../components/Primitives';
import { operatorById, partById, supervisorById } from '../data/people';
import { reasonByCode, varianceByCode } from '../data/reasons';
import { DEMO_TODAY } from '../data/seed';
import { previousStage, stageById } from '../data/stages';
import { downloadCsv, entriesToCsv } from '../lib/csv';
import { clockOf, inr, num, pct } from '../lib/format';
import { valueOf } from '../lib/reconcile';
import { useAllEntries, useStore } from '../store/useStore';
import { AssumptionsDrawer } from './AssumptionsDrawer';
import {
  attentionOf,
  headlineOf,
  inRange,
  resolveRange,
  shiftRowsOf,
  stageRowsOf,
} from './selectors';
import type { StageEntry } from '../types';

/* Shared table furniture --------------------------------------------------- */

const TH = 'px-3 py-2 text-[11px] font-semibold tracking-[0.06em] text-faint uppercase';
const TD = 'px-3 py-2.5 text-[14px]';

function CardHead({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
      <h2 className="text-[14px] font-semibold">{title}</h2>
      {meta && <span className="text-[12px] text-muted">{meta}</span>}
    </div>
  );
}

/* Metric strip ------------------------------------------------------------- */

function Metric({
  label,
  value,
  sub,
  tone = 'ink',
  wide,
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: 'ink' | 'bad';
  wide?: boolean;
}) {
  return (
    <div className={`px-5 py-4 ${wide ? 'bg-badsoft/45' : ''}`}>
      <p className={`text-[11px] font-semibold tracking-[0.06em] uppercase ${tone === 'bad' ? 'text-bad' : 'text-faint'}`}>
        {label}
      </p>
      <p
        className={`mt-1.5 leading-none font-semibold ${
          wide ? 'text-[38px] text-bad' : 'text-[26px] text-ink'
        }`}
      >
        <AnimatedNumber value={value} />
      </p>
      {sub && <p className="mt-1.5 text-[12px] text-muted">{sub}</p>}
    </div>
  );
}

function MetricStrip({
  headline,
  rangeLabel,
}: {
  headline: ReturnType<typeof headlineOf>;
  rangeLabel: string;
}) {
  return (
    <Card id="kpi" className="grid grid-cols-2 divide-x divide-line md:grid-cols-3 xl:grid-cols-5">
      <Metric label="Poured" value={headline.poured} sub={rangeLabel} />
      <Metric label="Dispatched" value={headline.dispatched} sub={rangeLabel} />
      <Metric label="Rejected" value={headline.rejected} sub="Named defect" />
      <Metric
        label="Unaccounted"
        value={headline.unaccounted}
        sub={`${inr(valueOf(headline.unaccounted))} at cost`}
        tone="bad"
        wide
      />
      <Metric label="In process" value={headline.inProcess} sub="Still on the line" />
    </Card>
  );
}

/* Stage losses ------------------------------------------------------------- */

function StageLosses({ rows }: { rows: ReturnType<typeof stageRowsOf> }) {
  const worst = Math.max(...rows.map((r) => r.lost), 1);

  return (
    <Card id="stages" className="overflow-hidden">
      <CardHead title="Stage losses" meta="In, out, difference" />
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-line">
            <th className={`${TH} text-left`}>Stage</th>
            <th className={`${TH} text-right`}>In</th>
            <th className={`${TH} text-right`}>Out</th>
            <th className={`${TH} text-right`}>Loss</th>
            <th className={`${TH} w-[26%] text-left`}>Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.stageId} className="border-b border-line last:border-0">
              <td className={`${TD} whitespace-nowrap`}>{row.name}</td>
              <td className={`${TD} num text-right text-muted`}>
                <Num value={row.received} />
              </td>
              <td className={`${TD} num text-right text-muted`}>
                <Num value={row.received - row.lost} />
              </td>
              <td className={`${TD} num text-right font-semibold`}>
                <Num value={row.lost} />
              </td>
              <td className="px-3 py-2.5">
                <span className="flex h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                  <span
                    className="h-full rounded-full bg-bad"
                    style={{ width: `${Math.max(2, (row.lost / worst) * 100)}%` }}
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* Shift split -------------------------------------------------------------- */

function ShiftSplit({ rows }: { rows: ReturnType<typeof shiftRowsOf> }) {
  const total = rows.reduce((a, r) => a + r.unaccounted, 0) || 1;
  const worst = rows.reduce((a, b) => (b.unaccounted > a.unaccounted ? b : a), rows[0]);

  return (
    <Card id="shifts">
      <CardHead title="Shift split" meta="Unaccounted, 7 days" />
      <div className="divide-y divide-line">
        {rows.map((row) => {
          const isWorst = row.shiftId === worst?.shiftId;
          return (
            <div key={row.shiftId} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-semibold ${
                  isWorst ? 'bg-badsoft text-bad' : 'bg-canvas text-muted'
                }`}
              >
                {row.shiftId}
              </span>
              <span className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-canvas">
                <span
                  className={`h-full rounded-full ${isWorst ? 'bg-bad' : 'bg-faint'}`}
                  style={{ width: `${(row.unaccounted / total) * 100}%` }}
                />
              </span>
              <span
                className={`num w-16 shrink-0 text-right text-[15px] font-semibold ${
                  isWorst ? 'text-bad' : 'text-ink'
                }`}
              >
                <Num value={row.unaccounted} />
              </span>
              <span className="num w-11 shrink-0 text-right text-[12px] text-muted">
                {pct((row.unaccounted / total) * 100, 0)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* Thirty day trend --------------------------------------------------------- */

function Trend({ values, today }: { values: number[]; today: number }) {
  const w = 300;
  const h = 56;
  const completed = values.slice(0, -1);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const high = Math.max(...completed);
  const low = Math.min(...completed);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / span) * h).toFixed(1)}`)
    .join(' ');
  const lastY = h - ((values[values.length - 1] - min) / span) * h;

  return (
    <Card>
      <CardHead title="Unaccounted" meta="30 days" />
      <div className="px-4 py-3">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke="#DC2626"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
          <circle cx={w} cy={lastY} r="3" fill="#DC2626" />
        </svg>
        <div className="mt-2 flex justify-between border-t border-line pt-2 text-[12px]">
          <span className="text-muted">
            Low <span className="num text-ink">{num(low)}</span>
          </span>
          <span className="text-muted">
            High <span className="num text-ink">{num(high)}</span>
          </span>
          <span className="text-muted">
            Today <span className="num font-semibold text-bad">{num(today)}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

/* Open variances ----------------------------------------------------------- */

function VarianceRow({ entry, striped }: { entry: StageEntry; striped: boolean }) {
  const expandedEntryId = useStore((s) => s.expandedEntryId);
  const toggleExpanded = useStore((s) => s.toggleExpanded);
  const setOwnerAction = useStore((s) => s.setOwnerAction);

  const open = expandedEntryId === entry.id;
  const operator = operatorById[entry.operatorId];
  const supervisor = entry.supervisorId ? supervisorById[entry.supervisorId] : null;
  const previous = previousStage(entry.stageId);
  const rejects = Object.entries(entry.rejectBreakdown).filter(([, c]) => (c ?? 0) > 0);

  return (
    <>
      <tr
        data-variance-row={entry.id}
        onClick={() => toggleExpanded(entry.id)}
        className={`cursor-pointer border-b border-line hover:bg-brandsoft/60 ${
          striped && !open ? 'bg-canvas/50' : ''
        } ${open ? 'bg-brandsoft/70' : ''}`}
      >
        <td className={`${TD} num whitespace-nowrap text-muted`}>{clockOf(entry.closedAt ?? '')}</td>
        <td className={`${TD} whitespace-nowrap font-medium`}>{stageById[entry.stageId].nameEn}</td>
        <td className={`${TD} whitespace-nowrap`}>{operator?.name}</td>
        <td className={`${TD} num text-center text-muted`}>{entry.shiftId}</td>
        <td className={`${TD} num text-right font-semibold text-bad`}>
          <Num value={entry.unaccounted} />
        </td>
        <td className={`${TD} num whitespace-nowrap text-right text-muted`}>
          {inr(valueOf(entry.unaccounted))}
        </td>
        <td className={`${TD} text-muted`}>
          {entry.varianceReason ? varianceByCode[entry.varianceReason].labelEn : ''}
        </td>
        <td className={`${TD} whitespace-nowrap text-muted`}>{supervisor?.name ?? '—'}</td>
        <td className="px-3 py-2.5 text-right">
          <ChevronDown
            size={16}
            strokeWidth={2}
            className={`inline text-faint transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </td>
      </tr>

      {open && (
        <tr className="border-b border-line bg-brandsoft/30">
          <td colSpan={9} className="px-3 pt-1 pb-4">
            <div className="grid gap-4 px-1 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)_auto]">
              <div>
                <p className={`${TH} px-0`}>Reconciliation</p>
                <table className="mt-1 w-full">
                  <tbody className="text-[13px]">
                    {[
                      {
                        k: `Received from ${previous ? stageById[previous.id].nameEn : 'furnace'}`,
                        v: entry.received,
                        s: '',
                      },
                      { k: 'Passed on', v: entry.passed, s: '−' },
                      { k: 'Rejected', v: entry.rejected, s: '−' },
                      { k: 'Rework', v: entry.heldRework, s: '−' },
                    ].map((r) => (
                      <tr key={r.k}>
                        <td className="py-1 text-muted">{r.k}</td>
                        <td className="num py-1 text-right">
                          {r.s}
                          <Num value={r.v} />
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-line">
                      <td className="py-1.5 font-semibold">Unaccounted</td>
                      <td className="num py-1.5 text-right font-semibold text-bad">
                        <Num value={entry.unaccounted} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-[13px]">
                <p className={`${TH} px-0`}>Detail</p>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <dt className="text-muted">Part</dt>
                  <dd className="num">{partById[entry.partId]?.code ?? entry.partId}</dd>
                  {rejects.length > 0 && (
                    <>
                      <dt className="text-muted">Defect</dt>
                      <dd>
                        {rejects
                          .map(
                            ([code, count]) =>
                              `${reasonByCode[code as keyof typeof reasonByCode].labelEn} · ${count}`,
                          )
                          .join(', ')}
                      </dd>
                    </>
                  )}
                  {supervisor && (
                    <>
                      <dt className="text-muted">Approved</dt>
                      <dd>
                        {supervisor.name} · <span className="num">{clockOf(entry.closedAt ?? '')}</span>
                      </dd>
                    </>
                  )}
                  <dt className="text-muted">Evidence</dt>
                  <dd>{entry.photo ? 'Photograph attached' : 'None'}</dd>
                </dl>

                {entry.photo && (
                  <div className="relative mt-2 aspect-[4/3] w-[164px] overflow-hidden rounded-md bg-[#8A8F98]">
                    <span className="num absolute right-1.5 bottom-1.5 rounded bg-ink/70 px-1.5 py-0.5 text-[10px] text-white">
                      {entry.photo.capturedAt.slice(0, 10)} {clockOf(entry.photo.capturedAt)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 md:flex-col">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOwnerAction(entry.id, 'accepted');
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[13px] font-semibold text-white transition-transform duration-150 active:scale-[0.97]"
                >
                  <Check size={14} strokeWidth={2.5} />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOwnerAction(entry.id, 'queried');
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-line bg-white px-4 py-2 text-[13px] font-semibold transition-transform duration-150 active:scale-[0.97]"
                >
                  <MessageSquare size={14} strokeWidth={2.5} />
                  Query
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const SHOWN = 8;

function OpenVariances({ rows }: { rows: StageEntry[] }) {
  const shown = rows.slice(0, SHOWN);
  const rest = rows.length - shown.length;
  const total = rows.reduce((a, r) => a + Math.abs(r.unaccounted), 0);

  return (
    <Card id="attention" className="overflow-hidden">
      <CardHead title="Open variances" meta={`${rows.length} waiting · ${inr(valueOf(total))}`} />
      {rows.length === 0 ? (
        <p className="py-10 text-center text-[14px] text-muted">Nothing waiting</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className={`${TH} text-left`}>Time</th>
                <th className={`${TH} text-left`}>Stage</th>
                <th className={`${TH} text-left`}>Operator</th>
                <th className={`${TH} text-center`}>Shift</th>
                <th className={`${TH} text-right`}>Qty</th>
                <th className={`${TH} text-right`}>Value</th>
                <th className={`${TH} text-left`}>Reason</th>
                <th className={`${TH} text-left`}>Approved by</th>
                <th className={TH} />
              </tr>
            </thead>
            <tbody>
              {shown.map((entry, i) => (
                <VarianceRow key={entry.id} entry={entry} striped={i % 2 === 1} />
              ))}
            </tbody>
          </table>
          {rest > 0 && (
            <p className="border-t border-line px-4 py-2.5 text-[13px] text-muted">
              <Num value={rest} /> more from earlier shifts
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

/* Shell -------------------------------------------------------------------- */

export function OwnerApp({ dense = false }: { dense?: boolean } = {}) {
  const entries = useAllEntries();
  const history = useStore((s) => s.history);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const setAssumptionsOpen = useStore((s) => s.setAssumptionsOpen);

  const range = resolveRange(filters.range);
  const scoped = useMemo(() => inRange(entries, range), [entries, range.from, range.to]);

  const headline = useMemo(() => headlineOf(scoped), [scoped]);
  const stageRows = useMemo(() => stageRowsOf(scoped), [scoped]);
  const shiftRows = useMemo(() => shiftRowsOf(entries), [entries]);
  const attention = useMemo(() => attentionOf(entries, range), [entries, range.from, range.to]);

  const todayUnaccounted = useMemo(
    () =>
      entries
        .filter((e) => e.date === DEMO_TODAY && e.status !== 'open')
        .reduce((acc, e) => acc + e.unaccounted, 0),
    [entries],
  );

  const trend = useMemo(
    () => history.slice(-29).map((d) => d.unaccounted).concat(todayUnaccounted),
    [history, todayUnaccounted],
  );

  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-white px-5 py-2.5">
        {dense ? <span className="sr-only">Office view</span> : <FoundryLockup />}

        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-md border border-line p-0.5">
            {(['today', 'week'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilters({ range: value })}
                className={`rounded px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                  filters.range === value ? 'bg-brand text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {value === 'today' ? 'Today' : '7 days'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              downloadCsv(
                `kestrel-counts-${range.from}-to-${range.to}.csv`,
                entriesToCsv(
                  [...scoped].sort((a, b) =>
                    (a.closedAt ?? a.date).localeCompare(b.closedAt ?? b.date),
                  ),
                ),
              )
            }
            className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
          >
            <Download size={14} strokeWidth={2} />
            Export
          </button>

          {!dense && <ResetButton />}
        </div>
      </header>

      <main className={`flex-1 space-y-3 p-4 ${dense ? '' : 'mx-auto w-full max-w-[1240px]'}`}>
        <MetricStrip headline={headline} rangeLabel={range.label} />

        <div className={`grid gap-3 ${dense ? 'grid-cols-1' : 'lg:grid-cols-[1.55fr_1fr]'}`}>
          <StageLosses rows={stageRows} />
          <div className="space-y-3">
            <ShiftSplit rows={shiftRows} />
            <Trend values={trend} today={todayUnaccounted} />
          </div>
        </div>

        <OpenVariances rows={attention} />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-2 text-[12px]">
          <span className="text-faint">Demonstration data</span>
          <button
            type="button"
            onClick={() => setAssumptionsOpen(true)}
            className="text-muted underline decoration-line underline-offset-4 transition-colors duration-150 hover:text-brand"
          >
            Figures and assumptions
          </button>
        </div>
      </main>

      <AssumptionsDrawer />
    </div>
  );
}
