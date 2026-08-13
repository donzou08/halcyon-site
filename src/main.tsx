import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import './index.css'
import { ScrollToTop } from './components/chrome'
import Home from './pages/Home'
import Works from './pages/Works'
import System from './pages/System'
import Approach from './pages/Approach'
import Engagements from './pages/Engagements'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

/**
 * The browser loads this application once, so every route change after that is
 * invisible to an advertising pixel unless it is reported by hand. Without this,
 * a campaign sees one page view of the home page per visitor and cannot tell a
 * visit that opened three systems from one that bounced.
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
 * The Works used to be a separate deployment where a system lived at
 * `/system/:slug`. Those links are in Instagram captions and LinkedIn posts that
 * cannot be edited, so the old shape is kept as a redirect rather than left to
 * land on a 404.
 */
function LegacySystemRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/works/${slug ?? ''}`} replace />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <TrackRoutes />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/works" element={<Works />} />
        <Route path="/works/:slug" element={<System />} />
        <Route path="/approach" element={<Approach />} />
        <Route path="/engagements" element={<Engagements />} />
        <Route path="/contact" element={<Contact />} />

        {/* Links that exist in the world already. */}
        <Route path="/system/:slug" element={<LegacySystemRedirect />} />
        <Route path="/systems" element={<Navigate to="/works" replace />} />
        <Route path="/work" element={<Navigate to="/works" replace />} />
        <Route path="/pricing" element={<Navigate to="/engagements" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
