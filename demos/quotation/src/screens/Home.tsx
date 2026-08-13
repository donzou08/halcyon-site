import { ChevronRight, FilePlus2, History, Settings as SettingsIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { DemoBadge, DemoBadgeSpacer, MeridianLogo, PoweredByHalcyon } from '../components/branding'
import type { DemoUser } from '../lib/session'
import { listQuotes } from '../lib/store'
import { formatINRWhole } from '../lib/format'

export default function Home({
  user,
  onNewQuote,
  onPastQuotes,
  onSettings,
  onLogout,
}: {
  user: DemoUser
  onNewQuote: () => void
  onPastQuotes: () => void
  onSettings: () => void
  onLogout: () => void
}) {
  const firstName = user.name.split(' ')[0]
  const quotes = listQuotes()
  // The owner sees the whole team's pipeline; a rep sees only their own quotes.
  const mine = user.role === 'owner' ? quotes : quotes.filter((q) => q.createdByName === user.name)
  const openValue = mine
    .filter((q) => q.status === 'Sent' || q.status === 'Pending')
    .reduce((sum, q) => sum + q.grandTotal, 0)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-10">
      <DemoBadge />
      <DemoBadgeSpacer />

      <header className="flex items-center justify-between py-5">
        <MeridianLogo />
        <button onClick={onLogout} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          Switch user
        </button>
      </header>

      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Hi {firstName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.title}
          {user.role === 'owner' && ' · sees all team quotes'}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Stat label="Quotes on record" value={String(mine.length)} />
        <Stat label="Open pipeline" value={formatINRWhole(openValue)} />
      </div>

      <div className="space-y-3">
        <MenuCard
          icon={<FilePlus2 />}
          accent
          title="Create new quote"
          subtitle="Customer → area → system → PDF"
          onClick={onNewQuote}
        />
        <MenuCard
          icon={<History />}
          title="Past quotes"
          subtitle={user.role === 'owner' ? 'Everything the team has sent' : 'Quotes you have created'}
          onClick={onPastQuotes}
        />
        <MenuCard
          icon={<SettingsIcon />}
          title="Rate card & company details"
          subtitle="What the quote is priced from"
          onClick={onSettings}
        />
      </div>

      <PoweredByHalcyon className="mt-10" />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="num text-xl font-bold text-brand-800">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{label}</div>
    </div>
  )
}

function MenuCard({
  icon,
  title,
  subtitle,
  onClick,
  accent,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  onClick: () => void
  accent?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl p-5 text-left shadow-sm ring-1 transition active:scale-[0.99] ${
        accent
          ? 'bg-brand-600 text-white ring-brand-700 hover:bg-brand-700'
          : 'bg-white text-slate-900 ring-slate-200 hover:bg-slate-50'
      }`}
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
          accent ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-600'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold">{title}</span>
        <span className={`block text-sm ${accent ? 'text-white/80' : 'text-slate-500'}`}>
          {subtitle}
        </span>
      </span>
      <ChevronRight className={accent ? 'text-white/80' : 'text-slate-400'} />
    </button>
  )
}
