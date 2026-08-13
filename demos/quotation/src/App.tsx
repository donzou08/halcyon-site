import { useState } from 'react'
import type { QuoteInput, QuoteSnapshot, SavedQuote } from './types'
import { computeQuote } from './lib/calc'
import { buildSerial, formatDate } from './lib/quote'
import { nextSerialNumber, saveQuote } from './lib/store'
import { clearUser, loadUser, saveUser, type DemoUser } from './lib/session'
import { DEFAULT_CONFIG } from './data/seed'
import Login from './screens/Login'
import Home from './screens/Home'
import Calculator from './screens/Calculator'
import QuotePreview from './screens/QuotePreview'
import PastQuotes from './screens/PastQuotes'
import Settings from './screens/Settings'

type View = 'home' | 'calculator' | 'quote' | 'pastQuotes' | 'settings'

/** A blank quote, ready for the wizard. */
function emptyInput(preparedBy: string): QuoteInput {
  return {
    customer: {
      customerId: null,
      company: '',
      companyAddress: '',
      gstNumber: '',
      siteId: null,
      siteLabel: '',
      siteAddress: '',
      pincode: '',
      state: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
    },
    preparedBy,
    areaSqm: 0,
    areaUnit: 'sqft',
    systems: [],
    fillerEnabled: false,
    fillerKg: 0,
    fillerRate: DEFAULT_CONFIG.filler.ratePerKg,
    lineMarkingEnabled: false,
    lineWidthId: 'w4',
    lineLength: 0,
    lineUnit: 'ft',
    lineRatePerFoot: DEFAULT_CONFIG.lineWidths.find((w) => w.id === 'w4')!.ratePerFoot,
    remarks: '',
    rounding: DEFAULT_CONFIG.rounding,
  }
}

export default function App() {
  const config = DEFAULT_CONFIG
  const [user, setUser] = useState<DemoUser | null>(() => loadUser())
  const [view, setView] = useState<View>('home')
  const [input, setInput] = useState<QuoteInput>(() => emptyInput(''))
  const [snapshot, setSnapshot] = useState<QuoteSnapshot | null>(null)

  if (!user) {
    return (
      <Login
        onPick={(u) => {
          saveUser(u)
          setUser(u)
          setInput(emptyInput(u.name))
          setView('home')
        }}
      />
    )
  }

  /**
   * The generate pipeline, mirroring production: reserve a serial for the
   * financial year → compute the quote → build a self-contained snapshot →
   * save it to history → show the preview.
   *
   * The snapshot carries its own copy of the config so a quote always re-renders
   * exactly as it was sent, even if the rate card changes afterwards.
   */
  function handleGenerate() {
    const quote = computeQuote(input, config)
    const now = new Date()
    const quoteNumber = buildSerial(config, nextSerialNumber(), now)

    const snap: QuoteSnapshot = {
      config,
      input,
      quote,
      meta: {
        quoteNumber,
        date: formatDate(now),
        dateISO: now.toISOString(),
        subject: config.defaultSubject,
        customer: input.customer,
        remarks: input.remarks,
        preparedByName: input.preparedBy || user!.name,
      },
    }

    const row: SavedQuote = {
      id: `q-${now.getTime()}`,
      quoteNumber,
      customerName: input.customer.company,
      siteLabel: input.customer.siteLabel,
      systemSummary: input.systems.map((s) => s.name).join(' + '),
      createdByName: snap.meta.preparedByName,
      subtotal: quote.subtotal,
      grandTotal: quote.totalPayable,
      gstMode: quote.gstMode,
      status: 'Sent',
      createdAt: now.toISOString(),
      data: snap,
    }
    saveQuote(row)

    setSnapshot(snap)
    setView('quote')
  }

  function startNewQuote() {
    setInput(emptyInput(user!.name))
    setSnapshot(null)
    setView('calculator')
  }

  switch (view) {
    case 'calculator':
      return (
        <Calculator
          config={config}
          input={input}
          setInput={setInput}
          onGenerate={handleGenerate}
          onBack={() => setView('home')}
        />
      )

    case 'quote':
      return snapshot ? (
        <QuotePreview
          snapshot={snapshot}
          onBack={() => setView(snapshot.meta.quoteNumber ? 'home' : 'calculator')}
          onHome={() => setView('home')}
        />
      ) : null

    case 'pastQuotes':
      return (
        <PastQuotes
          user={user}
          onBack={() => setView('home')}
          onView={(s) => {
            setSnapshot(s)
            setView('quote')
          }}
        />
      )

    case 'settings':
      return <Settings config={config} onBack={() => setView('home')} />

    default:
      return (
        <Home
          user={user}
          onNewQuote={startNewQuote}
          onPastQuotes={() => setView('pastQuotes')}
          onSettings={() => setView('settings')}
          onLogout={() => {
            clearUser()
            setUser(null)
          }}
        />
      )
  }
}
