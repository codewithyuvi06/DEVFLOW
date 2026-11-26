import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '../context/AuthContext'

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

const compactDensity = user?.preferences?.compactDensity ?? false
  return (
    <div className={`app-shell ${compactDensity ? 'compact-density' : ''}`}>
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-shell">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="main-content"><Outlet /></main>
        <footer className="app-footer"><span>© 2026 DEVFLOW</span><span>Made for teams who ship.</span><span className="footer-build"><i/> Preview build</span></footer>
      </div>
    </div>
  )
}
