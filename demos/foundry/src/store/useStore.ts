import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { plantConfig } from '../config/plantConfig';
import { buildSeed, DEMO_NOW, DEMO_TODAY } from '../data/seed';
import { operatorById, supervisorForShift } from '../data/people';
import { unaccountedOf, reconStateOf } from '../lib/reconcile';
import type {
  CountMode,
  DailyRecord,
  EntryStatus,
  Locale,
  OwnerAction,
  PhotoRecord,
  ReasonCode,
  ShiftId,
  StageEntry,
  StageId,
  VarianceCode,
  WorkerNotification,
} from '../types';

const seed = buildSeed();

/** Four screens, not twelve. */
export type Screen = 'who' | 'count' | 'done';

/** What the bottom sheet is asking for, or null when nothing is open. */
export type Sheet = 'pass' | 'reject' | 'rework' | 'rejectReason' | 'photo' | 'variance' | null;

export interface WorkerSession {
  operatorId: string;
  entryId: string;
  received: number;
  openingCarry: number;
  passed: number;
  rejected: number;
  rejectBreakdown: Partial<Record<ReasonCode, number>>;
  heldRework: number;
  photo?: PhotoRecord;
  varianceReason?: VarianceCode;
  approvedBy?: string;
  closedStatus?: EntryStatus;
  closedAt?: string;
  closedUnaccounted?: number;
}

export interface Filters {
  range: 'today' | 'week';
}

export interface Highlight {
  panel: string;
  token: number;
}

export interface StoreState {
  baseEntries: StageEntry[];
  history: DailyRecord[];

  locale: Locale;
  offline: boolean;
  liveEntries: StageEntry[];
  entryOverrides: Record<string, Partial<StageEntry>>;
  pendingClosures: StageEntry[];
  notifications: WorkerNotification[];
  filters: Filters;
  screen: Screen;
  sheet: Sheet;
  keypad: string;
  /** Reject count waiting on a reason, held between sheet steps. */
  pendingReject: number;
  session: WorkerSession | null;
  closureCount: number;

  highlight: Highlight | null;
  walkthrough: { active: boolean; step: number };
  assumptionsOpen: boolean;
  expandedEntryId: string | null;

  setLocale: (locale: Locale) => void;
  selectOperator: (operatorId: string) => void;
  backToWho: () => void;

  openSheet: (sheet: Sheet) => void;
  closeSheet: () => void;
  pushDigit: (digit: string) => void;
  popDigit: () => void;
  clearDigits: () => void;
  saveCount: (mode: CountMode) => void;
  chooseRejectReason: (code: ReasonCode) => void;
  attachPhoto: (photo: PhotoRecord) => void;

  tryFinish: () => void;
  chooseVarianceReason: (code: VarianceCode) => void;
  approveBySupervisor: () => void;
  finishShift: () => void;

  setOffline: (offline: boolean) => void;
  markNotificationsRead: () => void;
  setFilters: (patch: Partial<Filters>) => void;
  setOwnerAction: (entryId: string, action: OwnerAction) => void;
  toggleExpanded: (entryId: string) => void;
  setAssumptionsOpen: (open: boolean) => void;
  pulse: (panel: string) => void;
  startWalkthrough: () => void;
  setWalkthroughStep: (step: number) => void;
  stopWalkthrough: () => void;
  resetDemo: () => void;
}

const initialFilters: Filters = { range: 'today' };

function closureTimestamp(closureCount: number): string {
  const [h, m] = DEMO_NOW.slice(11, 16).split(':').map(Number);
  const total = h * 60 + m + closureCount + 1;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${DEMO_TODAY}T${hh}:${mm}:00`;
}

function mergeEntries(
  baseEntries: StageEntry[],
  overrides: Record<string, Partial<StageEntry>>,
  liveEntries: StageEntry[],
): StageEntry[] {
  const merged = baseEntries.map((e) => {
    const override = overrides[e.id];
    return override ? { ...e, ...override } : e;
  });
  return merged.concat(liveEntries);
}

/** The running difference for the open session. */
export function sessionUnaccounted(session: WorkerSession | null): number {
  if (!session) return 0;
  return unaccountedOf({
    received: session.received,
    openingCarry: session.openingCarry,
    passed: session.passed,
    rejected: session.rejected,
    heldRework: session.heldRework,
  });
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => {
      /**
       * Writes the running counts through to the shared entry while the shift is
       * still open, so the dashboard moves as the operator taps rather than only
       * at the end. The entry stays open and publishes no difference yet.
       */
      const syncSessionToEntry = (panel: string): void => {
        const state = get();
        const { session, offline } = state;
        if (!session || offline) return;

        const patch: Partial<StageEntry> = {
          passed: session.passed,
          rejected: session.rejected,
          rejectBreakdown: session.rejectBreakdown,
          heldRework: session.heldRework,
          received: session.received,
          openingCarry: session.openingCarry,
          operatorId: session.operatorId,
          status: 'open',
        };

        const isSeeded = state.baseEntries.some((e) => e.id === session.entryId);
        const token = (state.highlight?.token ?? 0) + 1;

        if (isSeeded) {
          set({
            entryOverrides: {
              ...state.entryOverrides,
              [session.entryId]: { ...state.entryOverrides[session.entryId], ...patch },
            },
            highlight: { panel, token },
          });
          return;
        }

        const operator = operatorById[session.operatorId];
        const existing = state.liveEntries.find((e) => e.id === session.entryId);
        const next: StageEntry = {
          ...(existing ?? {
            id: session.entryId,
            date: DEMO_TODAY,
            shiftId: operator.shiftId,
            stageId: operator.stageId,
            partId: 'BC118',
            operatorId: session.operatorId,
            received: session.received,
            openingCarry: session.openingCarry,
            passed: 0,
            rejected: 0,
            rejectBreakdown: {},
            heldRework: 0,
            unaccounted: 0,
            status: 'open',
            ownerAction: 'none',
            live: true,
          }),
          ...patch,
        };
        set({
          liveEntries: state.liveEntries.filter((e) => e.id !== session.entryId).concat(next),
          highlight: { panel, token },
        });
      };

      const commitClosure = (closed: StageEntry): void => {
        const state = get();
        const isSeeded = state.baseEntries.some((e) => e.id === closed.id);
        const token = (state.highlight?.token ?? 0) + 1;
        const panel = closed.status === 'clean' ? 'stages' : 'attention';

        if (isSeeded) {
          set({
            entryOverrides: { ...state.entryOverrides, [closed.id]: { ...closed } },
            highlight: { panel, token },
          });
        } else {
          set({
            liveEntries: state.liveEntries.filter((e) => e.id !== closed.id).concat(closed),
            highlight: { panel, token },
          });
        }
      };

      const close = (): void => {
        const { session, offline, closureCount } = get();
        if (!session) return;

        const unaccounted = sessionUnaccounted(session);
        const recon = reconStateOf(unaccounted);
        const operator = operatorById[session.operatorId];
        const status: EntryStatus =
          recon === 'balanced' || recon === 'tolerance'
            ? 'clean'
            : recon === 'variance'
              ? 'variance'
              : 'approved_variance';

        const closedAt = closureTimestamp(closureCount);
        const base = mergeEntries(
          get().baseEntries,
          get().entryOverrides,
          get().liveEntries,
        ).find((e) => e.id === session.entryId);

        const closed: StageEntry = {
          id: session.entryId,
          date: DEMO_TODAY,
          shiftId: operator.shiftId,
          stageId: operator.stageId,
          partId: base?.partId ?? 'BC118',
          operatorId: operator.id,
          received: session.received,
          openingCarry: session.openingCarry,
          passed: session.passed,
          rejected: session.rejected,
          rejectBreakdown: session.rejectBreakdown,
          heldRework: session.heldRework,
          unaccounted,
          status,
          varianceReason: session.varianceReason,
          supervisorId: session.approvedBy,
          closedAt,
          photo: session.photo,
          ownerAction: 'none',
          live: true,
        };

        const doneSession: WorkerSession = {
          ...session,
          closedStatus: status,
          closedAt,
          closedUnaccounted: unaccounted,
        };

        if (offline) {
          set({
            pendingClosures: get().pendingClosures.concat(closed),
            session: doneSession,
            screen: 'done',
            sheet: null,
            closureCount: closureCount + 1,
          });
          return;
        }

        commitClosure(closed);
        set({
          session: doneSession,
          screen: 'done',
          sheet: null,
          closureCount: closureCount + 1,
        });
      };

      return {
        baseEntries: seed.entries,
        history: seed.history,

        locale: 'en',
        offline: false,
        liveEntries: [],
        entryOverrides: {},
        pendingClosures: [],
        notifications: [],
        filters: initialFilters,
        screen: 'who',
        sheet: null,
        keypad: '',
        pendingReject: 0,
        session: null,
        closureCount: 0,

        highlight: null,
        walkthrough: { active: false, step: 0 },
        assumptionsOpen: false,
        expandedEntryId: null,

        setLocale: (locale) => set({ locale }),

        selectOperator: (operatorId) => {
          const operator = operatorById[operatorId];
          const entry = mergeEntries(
            get().baseEntries,
            get().entryOverrides,
            get().liveEntries,
          ).find(
            (e) =>
              e.date === DEMO_TODAY &&
              e.shiftId === operator.shiftId &&
              e.stageId === operator.stageId,
          );
          const open = entry?.status === 'open';

          set({
            session: {
              operatorId,
              entryId: entry?.id ?? `${DEMO_TODAY}-${operator.shiftId}-${operator.stageId}`,
              received: entry?.received ?? 0,
              openingCarry: entry?.openingCarry ?? 0,
              passed: open ? (entry?.passed ?? 0) : 0,
              rejected: open ? (entry?.rejected ?? 0) : 0,
              rejectBreakdown: open ? { ...(entry?.rejectBreakdown ?? {}) } : {},
              heldRework: open ? (entry?.heldRework ?? 0) : 0,
            },
            screen: 'count',
            sheet: null,
            keypad: '',
          });
        },

        backToWho: () => set({ session: null, screen: 'who', sheet: null, keypad: '' }),

        openSheet: (sheet) => set({ sheet, keypad: '' }),
        closeSheet: () => set({ sheet: null, keypad: '' }),

        pushDigit: (digit) =>
          set({ keypad: (get().keypad + digit).replace(/^0+(?=\d)/, '').slice(0, 6) }),
        popDigit: () => set({ keypad: get().keypad.slice(0, -1) }),
        clearDigits: () => set({ keypad: '' }),

        saveCount: (mode) => {
          const { session, keypad } = get();
          const value = Number(keypad || '0');
          if (!session || value <= 0) return;

          if (mode === 'pass') {
            set({ session: { ...session, passed: value }, sheet: null, keypad: '' });
            syncSessionToEntry('stages');
            return;
          }
          if (mode === 'rework') {
            set({ session: { ...session, heldRework: value }, sheet: null, keypad: '' });
            syncSessionToEntry('stages');
            return;
          }
          /* A reject always names a defect, so the sheet moves on rather than closing. */
          set({ pendingReject: value, sheet: 'rejectReason', keypad: '' });
        },

        chooseRejectReason: (code) => {
          const { session, pendingReject } = get();
          if (!session || pendingReject <= 0) return;

          const next: WorkerSession = {
            ...session,
            rejected: pendingReject,
            rejectBreakdown: { [code]: pendingReject },
          };

          if (pendingReject > plantConfig.photoRequiredRejectThreshold) {
            set({ session: next, sheet: 'photo' });
            syncSessionToEntry('stages');
            return;
          }
          set({ session: next, sheet: null, pendingReject: 0 });
          syncSessionToEntry('stages');
        },

        attachPhoto: (photo) => {
          const { session } = get();
          if (!session) return;
          set({ session: { ...session, photo }, sheet: null, pendingReject: 0 });
        },

        tryFinish: () => {
          const { session } = get();
          if (!session) return;
          const recon = reconStateOf(sessionUnaccounted(session));

          if ((recon === 'variance' || recon === 'approval') && !session.varianceReason) {
            set({ sheet: 'variance' });
            return;
          }
          if (recon === 'approval' && !session.approvedBy) {
            set({ sheet: 'variance' });
            return;
          }
          close();
        },

        chooseVarianceReason: (code) => {
          const { session } = get();
          if (!session) return;
          const recon = reconStateOf(sessionUnaccounted(session));
          set({ session: { ...session, varianceReason: code } });
          /* A small difference closes on the reason alone. A large one waits
             for the shift in-charge, who is named on the same sheet. */
          if (recon !== 'approval') close();
        },

        approveBySupervisor: () => {
          const { session } = get();
          if (!session) return;
          const operator = operatorById[session.operatorId];
          set({ session: { ...session, approvedBy: supervisorForShift(operator.shiftId).id } });
          close();
        },

        finishShift: () => close(),

        setOffline: (offline) => {
          if (offline) {
            set({ offline: true });
            return;
          }
          const queued = get().pendingClosures;
          set({ offline: false, pendingClosures: [] });
          queued.forEach((entry) => commitClosure(entry));
        },

        markNotificationsRead: () =>
          set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),

        setFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),

        setOwnerAction: (entryId, action) => {
          const state = get();
          const inLive = state.liveEntries.some((e) => e.id === entryId);

          if (inLive) {
            set({
              liveEntries: state.liveEntries.map((e) =>
                e.id === entryId ? { ...e, ownerAction: action } : e,
              ),
            });
          } else {
            set({
              entryOverrides: {
                ...state.entryOverrides,
                [entryId]: { ...state.entryOverrides[entryId], ownerAction: action },
              },
            });
          }

          if (action === 'queried') {
            const next = get();
            const entry = mergeEntries(
              next.baseEntries,
              next.entryOverrides,
              next.liveEntries,
            ).find((e) => e.id === entryId);
            if (entry) {
              set({
                notifications: [
                  {
                    id: `note-${entryId}`,
                    entryId,
                    createdAt: closureTimestamp(next.closureCount),
                    kind: 'query',
                    stageId: entry.stageId,
                    read: false,
                  },
                  ...next.notifications.filter((n) => n.entryId !== entryId),
                ],
              });
            }
          }
          set({ expandedEntryId: null });
        },

        toggleExpanded: (entryId) =>
          set({ expandedEntryId: get().expandedEntryId === entryId ? null : entryId }),
        setAssumptionsOpen: (open) => set({ assumptionsOpen: open }),

        pulse: (panel) => set({ highlight: { panel, token: (get().highlight?.token ?? 0) + 1 } }),

        startWalkthrough: () => {
          get().resetDemo();
          set({ locale: 'en', walkthrough: { active: true, step: 0 } });
        },
        setWalkthroughStep: (step) => set({ walkthrough: { active: true, step } }),
        stopWalkthrough: () => set({ walkthrough: { active: false, step: 0 } }),

        resetDemo: () =>
          set({
            locale: 'en',
            offline: false,
            liveEntries: [],
            entryOverrides: {},
            pendingClosures: [],
            notifications: [],
            filters: initialFilters,
            screen: 'who',
            sheet: null,
            keypad: '',
            pendingReject: 0,
            session: null,
            closureCount: 0,
            highlight: null,
            assumptionsOpen: false,
            expandedEntryId: null,
            walkthrough: { active: false, step: 0 },
          }),
      };
    },
    {
      name: 'kestrel_demo_state_v1',
      version: 2,
      /**
       * Anyone carrying saved state from an earlier build starts fresh rather
       * than seeing a console error and a half restored session.
       */
      migrate: () => ({}) as unknown as StoreState,
      partialize: (state) =>
        ({
          locale: state.locale,
          offline: state.offline,
          liveEntries: state.liveEntries,
          entryOverrides: state.entryOverrides,
          pendingClosures: state.pendingClosures,
          notifications: state.notifications,
          filters: state.filters,
          screen: state.screen,
          sheet: state.sheet,
          keypad: state.keypad,
          pendingReject: state.pendingReject,
          session: state.session,
          closureCount: state.closureCount,
        }) as unknown as StoreState,
    },
  ),
);

/** Every entry the owner can see. Work queued on an offline phone is not here yet. */
export function useAllEntries(): StageEntry[] {
  const baseEntries = useStore((s) => s.baseEntries);
  const entryOverrides = useStore((s) => s.entryOverrides);
  const liveEntries = useStore((s) => s.liveEntries);
  return useMemo(
    () => mergeEntries(baseEntries, entryOverrides, liveEntries),
    [baseEntries, entryOverrides, liveEntries],
  );
}

export type { ShiftId, StageId };
