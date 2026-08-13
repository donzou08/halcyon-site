import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import './index.css'
import { ScrollToTop } from './components/chrome'
import Home from './pages/Home'
import System from './pages/System'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

/**
 * The browser loads this application once, so every route change after that is
 * invisible to an advertising pixel unless it is reported by hand. Without this,
 * a campaign sees one page view of the index per visitor and cannot tell a visit
 * that opened three systems from one that bounced.
 *
 * The initial load is already counted by the snippet in index.html, so this
 * skips the first render rather than double counting it.
 */
function TrackRoutes() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (window.__halcyonFirstRoute === undefined) {
      window.__halcyonFirstRoute = pathname
      return
    }
    window.halcyonTrackPage?.(pathname)
  }, [pathname])
  return null
}

declare global {
  interface Window {
    __halcyonFirstRoute?: string
  }
}

/**
 * Links that already exist in the world.
 *
 * The systems used to live at `/works/:slug`, and before that at `/system/:slug`.
 * Both shapes are in Instagram captions and LinkedIn posts that cannot be
 * edited, so they redirect rather than 404. The flat `/:slug` is the shape now,
 * because this site is intended to be mounted at halcyon.uno/works, and
 * `/works/works/quotation` would be the alternative.
 */
function LegacyRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/${slug ?? ''}`} replace />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <TrackRoutes />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/works" element={<Navigate to="/" replace />} />
        <Route path="/works/:slug" element={<LegacyRedirect />} />
        <Route path="/system/:slug" element={<LegacyRedirect />} />
        <Route path="/systems" element={<Navigate to="/" replace />} />
        {/* The marketing pages this site used to carry now live only on
            halcyon.uno, and pricing is no longer published anywhere. */}
        <Route path="/approach" element={<Navigate to="/" replace />} />
        <Route path="/engagements" element={<Navigate to="/contact" replace />} />
        <Route path="/pricing" element={<Navigate to="/contact" replace />} />

        {/* Static routes above win over this, so /contact is never a slug. */}
        <Route path="/:slug" element={<System />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
