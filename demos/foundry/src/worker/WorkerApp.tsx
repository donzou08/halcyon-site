import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Delete,
  Flag,
  Globe,
  MessageSquareWarning,
  ShieldCheck,
  Volume2,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';

import { FoundryLockup } from '../components/Brand';
import { Num } from '../components/Primitives';
import { operatorById, operators, supervisorForShift } from '../data/people';
import { reasonsForStage, varianceReasons } from '../data/reasons';
import { DEMO_NOW, DEMO_TODAY } from '../data/seed';
import { previousStage, stageById } from '../data/stages';
import { localeMeta } from '../i18n';
import { hasVoiceFor, speak, useTranslation } from '../i18n/useTranslation';
import { clockOf } from '../lib/format';
import { reconStateOf } from '../lib/reconcile';
import { sessionUnaccounted, useStore } from '../store/useStore';
import type { CountMode, ReconState } from '../types';

/* Shared bits ------------------------------------------------------------- */

const tone: Record<ReconState, { text: string; bg: string; border: string; hex: string }> = {
  balanced: { text: 'text-good', bg: 'bg-goodsoft', border: 'border-good', hex: '#16A34A' },
  tolerance: { text: 'text-good', bg: 'bg-goodsoft', border: 'border-good', hex: '#16A34A' },
  variance: { text: 'text-warn', bg: 'bg-warnsoft', border: 'border-warn', hex: '#D97706' },
  approval: { text: 'text-bad', bg: 'bg-badsoft', border: 'border-bad', hex: '#DC2626' },
};

/** Reads the line aloud. Hidden when the browser has no voice for the language. */
function Speak({ text }: { text: string }) {
  const { speechTag } = useTranslation();
  const [canSpeak, setCanSpeak] = useState(false);

  useEffect(() => {
    const check = () => setCanSpeak(hasVoiceFor(speechTag));
    check();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', check);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', check);
    }
  }, [speechTag]);

  if (!canSpeak) return null;
  return (
    <button
      type="button"
      onClick={() => speak(text, speechTag)}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted active:bg-canvas"
    >
      <Volume2 size={18} strokeWidth={2} />
    </button>
  );
}

function BigButton({
  onClick,
  children,
  disabled,
  variant = 'dark',
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'dark' | 'good' | 'ghost';
}) {
  const styles = {
    dark: 'bg-ink text-white',
    good: 'bg-good text-white',
    ghost: 'bg-white text-ink border border-line',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-[68px] w-full rounded-control text-[19px] font-semibold transition-transform duration-150 ease-out active:scale-[0.98] ${
        disabled ? 'bg-line text-faint active:scale-100' : styles[variant]
      }`}
    >
      {children}
    </button>
  );
}

/* Bottom sheet ------------------------------------------------------------ */

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <div className="flex-1 bg-ink/30" />
      <div className="animate-sheetIn flex max-h-full flex-col rounded-t-[20px] bg-white">
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
          <h2 className="text-[19px] leading-tight font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted active:bg-canvas"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-5">{children}</div>
      </div>
    </div>
  );
}

function Keypad() {
  const keypad = useStore((s) => s.keypad);
  const pushDigit = useStore((s) => s.pushDigit);
  const popDigit = useStore((s) => s.popDigit);

  const key =
    'h-16 rounded-control bg-canvas text-[26px] font-semibold text-ink num transition-transform duration-100 ease-out active:scale-[0.96] active:bg-line';

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-3 mb-1 flex h-[76px] items-center justify-center rounded-control border-2 border-line">
        <span className="num text-[44px] leading-none font-semibold">{keypad || '0'}</span>
      </div>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
        <button key={d} type="button" className={key} onClick={() => pushDigit(d)}>
          {d}
        </button>
      ))}
      <button type="button" className={`${key} col-span-2`} onClick={() => pushDigit('0')}>
        0
      </button>
      <button
        type="button"
        onClick={popDigit}
        aria-label="Backspace"
        className="flex h-16 items-center justify-center rounded-control bg-canvas text-muted active:bg-line"
      >
        <Delete size={24} strokeWidth={2} />
      </button>
    </div>
  );
}

/* Screens ----------------------------------------------------------------- */

function WhoScreen() {
  const { t } = useTranslation();
  const selectOperator = useStore((s) => s.selectOperator);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4 pt-1 pb-3">
        <FoundryLockup compact />
        <div className="mt-3 flex items-start gap-2">
          <h1 className="flex-1 text-[24px] leading-tight font-bold">{t('op.title')}</h1>
          <Speak text={t('op.title')} />
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
        {operators.map((operator) => (
          <button
            key={operator.id}
            type="button"
            onClick={() => selectOperator(operator.id)}
            className="card flex min-h-[76px] w-full items-center gap-3 px-4 py-3 text-left transition-transform duration-150 ease-out active:scale-[0.99] active:bg-canvas"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[18px] font-semibold">{operator.name}</span>
              <span className="block truncate text-[14px] text-muted">
                {t(stageById[operator.stageId].nameKey)}
              </span>
            </span>
            <ChevronRight size={20} strokeWidth={2} className="shrink-0 text-faint" />
          </button>
        ))}
      </div>
    </div>
  );
}

function CountRow({
  label,
  value,
  onClick,
  accent,
}: {
  label: string;
  value: number;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[72px] w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 active:bg-canvas"
    >
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
      <span className="flex-1 text-[17px]">{label}</span>
      <span className="num text-[28px] leading-none font-semibold">
        {value > 0 ? <Num value={value} /> : <span className="text-faint">0</span>}
      </span>
      <ChevronRight size={18} strokeWidth={2} className="shrink-0 text-faint" />
    </button>
  );
}

function CountScreen() {
  const { t } = useTranslation();
  const session = useStore((s) => s.session);
  const openSheet = useStore((s) => s.openSheet);
  const tryFinish = useStore((s) => s.tryFinish);
  if (!session) return null;

  const operator = operatorById[session.operatorId];
  const previous = previousStage(operator.stageId);
  const difference = sessionUnaccounted(session);
  const state = reconStateOf(difference);
  const ready = session.passed > 0;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4">
      <div className="card mt-1 px-5 py-4">
        <p className="text-[14px] text-muted">{t('home.received')}</p>
        <p className="num mt-1 text-[46px] leading-none font-bold">
          <Num value={session.received} />
        </p>
        {previous && (
          <p className="mt-1.5 text-[14px] text-muted">
            {t('home.receivedLabel')} {t(previous.nameKey)}
          </p>
        )}
      </div>

      <div className="mt-4 mb-2 flex items-center gap-2">
        <p className="flex-1 text-[14px] text-muted">{t('count.tapToEnter')}</p>
        <Speak text={t('count.tapToEnter')} />
      </div>

      <div className="card divide-y divide-line overflow-hidden">
        <CountRow
          label={t('home.passed')}
          value={session.passed}
          accent="#16A34A"
          onClick={() => openSheet('pass')}
        />
        <CountRow
          label={t('home.rejected')}
          value={session.rejected}
          accent="#DC2626"
          onClick={() => openSheet('reject')}
        />
        <CountRow
          label={t('home.rework')}
          value={session.heldRework}
          accent="#D97706"
          onClick={() => openSheet('rework')}
        />
      </div>

      <div
        className={`mt-3 flex items-center justify-between gap-3 rounded-card border px-5 py-4 ${tone[state].bg} ${tone[state].border}`}
      >
        <span className={`flex items-center gap-2 text-[16px] font-medium ${tone[state].text}`}>
          {state === 'balanced' || state === 'tolerance' ? (
            <Check size={18} strokeWidth={2.5} />
          ) : (
            <Flag size={18} strokeWidth={2.5} />
          )}
          {t('close.unaccounted')}
        </span>
        <span className={`num text-[40px] leading-none font-bold ${tone[state].text}`}>
          <Num value={difference} />
        </span>
      </div>

      <div className="mt-4">
        <BigButton onClick={tryFinish} disabled={!ready}>
          {t('home.close')}
        </BigButton>
        {!ready && <p className="mt-2 text-center text-[13px] text-muted">{t('home.closeLocked')}</p>}
      </div>
    </div>
  );
}

function DoneScreen() {
  const { t } = useTranslation();
  const session = useStore((s) => s.session);
  const backToWho = useStore((s) => s.backToWho);
  const offline = useStore((s) => s.offline);
  if (!session) return null;

  const difference = session.closedUnaccounted ?? 0;
  const state = reconStateOf(difference);
  const headline =
    session.closedStatus === 'approved_variance'
      ? t('done.approved')
      : session.closedStatus === 'variance'
        ? t('done.variance')
        : t('done.balanced');

  const rows = [
    { label: t('close.passed'), value: session.passed },
    { label: t('close.rejected'), value: session.rejected },
    { label: t('close.rework'), value: session.heldRework },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4">
      <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <span
          className={`flex h-20 w-20 items-center justify-center rounded-full ${tone[state].bg}`}
        >
          <Check size={40} strokeWidth={3} className={tone[state].text} />
        </span>
        <h1 className="mt-4 text-[22px] leading-tight font-bold">{headline}</h1>
        <p className="num mt-1 text-[15px] text-muted">
          {t('done.at')} {clockOf(session.closedAt ?? '')}
        </p>

        <div className="card mt-5 w-full divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="text-[15px] text-muted">{row.label}</span>
              <span className="num text-[20px] font-semibold">
                <Num value={row.value} />
              </span>
            </div>
          ))}
          <div className={`flex items-center justify-between gap-3 px-5 py-3 ${tone[state].bg}`}>
            <span className={`text-[15px] font-medium ${tone[state].text}`}>
              {t('close.unaccounted')}
            </span>
            <span className={`num text-[24px] font-bold ${tone[state].text}`}>
              <Num value={difference} />
            </span>
          </div>
        </div>

        {offline && (
          <p className="mt-3 text-[14px] text-warn">{t('offline.queued', { n: 1 })}</p>
        )}
      </div>

      <BigButton onClick={backToWho} variant="good">
        {t('done.finish')}
      </BigButton>
    </div>
  );
}

/* Sheets ------------------------------------------------------------------ */

function CountSheet({ mode }: { mode: CountMode }) {
  const { t } = useTranslation();
  const closeSheet = useStore((s) => s.closeSheet);
  const saveCount = useStore((s) => s.saveCount);
  const keypad = useStore((s) => s.keypad);

  return (
    <Sheet title={t(`count.${mode}.title`)} onClose={closeSheet}>
      <Keypad />
      <div className="mt-3">
        <BigButton onClick={() => saveCount(mode)} disabled={Number(keypad || '0') <= 0}>
          {t('count.confirm')}
        </BigButton>
      </div>
    </Sheet>
  );
}

function RejectReasonSheet() {
  const { t } = useTranslation();
  const session = useStore((s) => s.session);
  const closeSheet = useStore((s) => s.closeSheet);
  const chooseRejectReason = useStore((s) => s.chooseRejectReason);
  const pendingReject = useStore((s) => s.pendingReject);
  if (!session) return null;

  const applicable = reasonsForStage(operatorById[session.operatorId].stageId);

  return (
    <Sheet title={t('reason.title')} onClose={closeSheet}>
      <p className="num mb-3 text-[15px] text-muted">
        <Num value={pendingReject} className="text-bad" /> {t('count.units')}
      </p>
      <div className="space-y-2">
        {applicable.map((reason) => (
          <button
            key={reason.code}
            type="button"
            onClick={() => chooseRejectReason(reason.code)}
            className="min-h-[64px] w-full rounded-control border border-line px-4 py-3 text-left text-[17px] transition-transform duration-150 ease-out active:scale-[0.99] active:bg-canvas"
          >
            {t(`reason.${reason.code}`)}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function PhotoSheet() {
  const { t } = useTranslation();
  const closeSheet = useStore((s) => s.closeSheet);
  const attachPhoto = useStore((s) => s.attachPhoto);
  const closureCount = useStore((s) => s.closureCount);
  const [shot, setShot] = useState(false);
  const stamp = `17:${String(26 + closureCount).padStart(2, '0')}`;

  return (
    <Sheet title={t('photo.title')} onClose={closeSheet}>
      <button
        type="button"
        onClick={() => setShot(true)}
        className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-control bg-canvas"
      >
        {shot ? (
          <>
            <span className="h-full w-full bg-[#8A8F98]" />
            <span className="num absolute right-2 bottom-2 rounded bg-ink/70 px-2 py-1 text-[12px] text-white">
              {DEMO_TODAY} {stamp}
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 text-muted">
            <Camera size={30} strokeWidth={1.75} />
            <span className="text-[15px]">{t('photo.simulate')}</span>
          </span>
        )}
      </button>
      <div className="mt-3">
        <BigButton
          onClick={() =>
            attachPhoto({ kind: 'simulated', capturedAt: `${DEMO_TODAY}T${stamp}:00` })
          }
          disabled={!shot}
        >
          {t('photo.use')}
        </BigButton>
      </div>
    </Sheet>
  );
}

function VarianceSheet() {
  const { t } = useTranslation();
  const session = useStore((s) => s.session);
  const closeSheet = useStore((s) => s.closeSheet);
  const chooseVarianceReason = useStore((s) => s.chooseVarianceReason);
  const approveBySupervisor = useStore((s) => s.approveBySupervisor);
  if (!session) return null;

  const difference = sessionUnaccounted(session);
  const state = reconStateOf(difference);
  const supervisor = supervisorForShift(operatorById[session.operatorId].shiftId);
  const chosen = session.varianceReason;

  return (
    <Sheet title={t('close.variance.title')} onClose={closeSheet}>
      <div
        className={`mb-3 flex items-center justify-between gap-3 rounded-control px-4 py-3 ${tone[state].bg}`}
      >
        <span className={`text-[15px] font-medium ${tone[state].text}`}>
          {t('close.unaccounted')}
        </span>
        <span className={`num text-[30px] leading-none font-bold ${tone[state].text}`}>
          <Num value={difference} />
        </span>
      </div>

      {!chosen ? (
        <div className="space-y-2">
          {varianceReasons.map((reason) => (
            <button
              key={reason.code}
              type="button"
              onClick={() => chooseVarianceReason(reason.code)}
              className="min-h-[64px] w-full rounded-control border border-line px-4 py-3 text-left text-[17px] transition-transform duration-150 ease-out active:scale-[0.99] active:bg-canvas"
            >
              {t(`variance.${reason.code}`)}
            </button>
          ))}
        </div>
      ) : (
        /* A large difference waits for the shift in-charge, who is named here.
           One tap, because a PIN nobody checks is theatre. */
        <div>
          <p className="rounded-control border border-line px-4 py-3 text-[16px]">
            {t(`variance.${chosen}`)}
          </p>
          <p className="mt-4 flex items-center gap-2 text-[15px] text-muted">
            <ShieldCheck size={18} strokeWidth={2} />
            {t('close.supervisor.who', { name: supervisor.name })}
          </p>
          <div className="mt-3">
            <BigButton onClick={approveBySupervisor} variant="good">
              {t('close.approve', { name: supervisor.name.split(' ')[0] })}
            </BigButton>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function LanguageSheet({ onClose }: { onClose: () => void }) {
  const { t, locale, setLocale } = useTranslation();
  return (
    <Sheet title={t('lang.title')} onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        {localeMeta.map((meta) => (
          <button
            key={meta.code}
            type="button"
            lang={meta.code}
            onClick={() => {
              setLocale(meta.code);
              onClose();
            }}
            className={`flex h-[68px] items-center justify-center rounded-control border text-[18px] ${
              locale === meta.code
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-white text-ink'
            }`}
            style={{ fontFamily: `${meta.fontFamily}, Inter, sans-serif` }}
          >
            {meta.nativeName}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/* Shell ------------------------------------------------------------------- */

function QueryBanner() {
  const { t } = useTranslation();
  const notifications = useStore((s) => s.notifications);
  const markNotificationsRead = useStore((s) => s.markNotificationsRead);
  const unread = notifications.find((n) => !n.read);
  if (!unread) return null;

  return (
    <button
      type="button"
      onClick={markNotificationsRead}
      className="animate-riseIn mx-4 mb-2 flex items-start gap-2.5 rounded-control border border-warn bg-warnsoft px-4 py-3 text-left"
    >
      <MessageSquareWarning size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-warn" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-warn">{t('notify.query.title')}</span>
        <span className="block text-[14px] text-muted">
          {t('notify.query.body', {
            stage: t(stageById[unread.stageId].nameKey),
            time: clockOf(unread.createdAt),
          })}
        </span>
      </span>
    </button>
  );
}

export function WorkerApp() {
  const { t, locale, fontFamily } = useTranslation();
  const screen = useStore((s) => s.screen);
  const sheet = useStore((s) => s.sheet);
  const session = useStore((s) => s.session);
  const offline = useStore((s) => s.offline);
  const setOffline = useStore((s) => s.setOffline);
  const queued = useStore((s) => s.pendingClosures.length);
  const backToWho = useStore((s) => s.backToWho);
  const [languageOpen, setLanguageOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [screen]);

  const operator = session ? operatorById[session.operatorId] : null;

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-canvas"
      style={{ ['--script-font' as string]: fontFamily }}
      lang={locale}
    >
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        {screen === 'count' ? (
          <button
            type="button"
            onClick={backToWho}
            aria-label={t('nav.back')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted active:bg-white"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
        ) : (
          <span className="h-10 w-10 shrink-0" />
        )}

        <div className="min-w-0 flex-1 text-center">
          {operator ? (
            <>
              <p className="truncate text-[15px] font-semibold">{operator.name}</p>
              <p className="truncate text-[12px] text-muted">
                {t(stageById[operator.stageId].nameKey)} · {t(`shift.${operator.shiftId}`)}
              </p>
            </>
          ) : (
            <p className="num text-[13px] text-muted">{clockOf(DEMO_NOW)}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOffline(!offline)}
          aria-label="Signal"
          className={`flex h-10 shrink-0 items-center gap-1 rounded-full px-2 ${
            offline ? 'bg-warnsoft text-warn' : 'text-faint'
          }`}
        >
          {offline ? <WifiOff size={17} strokeWidth={2} /> : <Wifi size={17} strokeWidth={2} />}
          {queued > 0 && <span className="num text-[12px] font-semibold">{queued}</span>}
        </button>
        <button
          type="button"
          onClick={() => setLanguageOpen(true)}
          aria-label={t('nav.language')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted active:bg-white"
        >
          <Globe size={20} strokeWidth={2} />
        </button>
      </header>

      <QueryBanner />

      <div ref={scrollRef} key={screen} className="animate-fadeIn flex min-h-0 flex-1 flex-col">
        {screen === 'who' && <WhoScreen />}
        {screen === 'count' && <CountScreen />}
        {screen === 'done' && <DoneScreen />}
      </div>

      <p className="pb-2 text-center text-[11px] text-faint">{t('demo.dataNote')}</p>

      {sheet === 'pass' && <CountSheet mode="pass" />}
      {sheet === 'reject' && <CountSheet mode="reject" />}
      {sheet === 'rework' && <CountSheet mode="rework" />}
      {sheet === 'rejectReason' && <RejectReasonSheet />}
      {sheet === 'photo' && <PhotoSheet />}
      {sheet === 'variance' && <VarianceSheet />}
      {languageOpen && <LanguageSheet onClose={() => setLanguageOpen(false)} />}
    </div>
  );
}
