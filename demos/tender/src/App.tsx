import { useState } from 'react'
import Scan from './screens/Scan'
import Results from './screens/Results'
import Detail from './screens/Detail'
import { useDemoState, resetDemo } from './lib/store'

type View = { name: 'scan' } | { name: 'results' } | { name: 'detail'; id: string }

/**
 * Three screens, no router. A visitor who has already run a scan in this
 * browser lands straight on the results, because making somebody watch the
 * same twelve second animation twice is a way to lose them.
 */
export default function App() {
  const { scanned } = useDemoState()
  const [view, setView] = useState<View>(() => ({ name: scanned ? 'results' : 'scan' }))

  return (
    <>
      {view.name === 'scan' && <Scan onDone={() => setView({ name: 'results' })} />}
      {view.name === 'results' && (
        <Results onOpen={(id) => setView({ name: 'detail', id })} />
      )}
      {view.name === 'detail' && (
        <Detail id={view.id} onBack={() => setView({ name: 'results' })} />
      )}

      {view.name !== 'scan' && (
        <button
          onClick={() => {
            resetDemo()
            setView({ name: 'scan' })
          }}
          className="safe-bottom fixed right-4 bottom-2 z-30 rounded-full bg-white/95 px-4 py-2 text-[0.78rem] font-semibold text-slate-500 ring-1 ring-slate-200 backdrop-blur transition hover:text-slate-800"
        >
          Start over
        </button>
      )}
    </>
  )
}
