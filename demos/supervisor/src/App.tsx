import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from './lib/session'
import Login from './pages/Login'
import OwnerDashboard from './pages/OwnerDashboard'
import SupervisorHome from './pages/SupervisorHome'
import CheckIn from './pages/CheckIn'
import CheckOut from './pages/CheckOut'
import ReportIssue from './pages/ReportIssue'
import SiteDetail from './pages/SiteDetail'
import TeamList from './pages/TeamList'

export default function App() {
  const user = useSession()
  if (!user) return <Login />

  const isOwner = user.role === 'owner'

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={isOwner ? <OwnerDashboard user={user} /> : <SupervisorHome user={user} />}
        />

        {/* Field actions — supervisors only. */}
        <Route
          path="/checkin/:siteId"
          element={isOwner ? <Navigate to="/" /> : <CheckIn user={user} />}
        />
        <Route
          path="/checkout/:visitId"
          element={isOwner ? <Navigate to="/" /> : <CheckOut />}
        />
        <Route
          path="/issue/:siteId"
          element={isOwner ? <Navigate to="/" /> : <ReportIssue user={user} />}
        />

        {/* Readable by everyone. */}
        <Route path="/site/:siteId" element={<SiteDetail />} />
        <Route path="/team" element={<TeamList />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  )
}
