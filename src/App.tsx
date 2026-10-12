import { useEffect, useState } from 'react'
import { useStore } from './lib/store'
import { Shell } from './components/Shell'
import Login from './pages/Login'
import MemberDashboard from './pages/member/Dashboard'
import { MemberAttendance, MemberMembership, MemberAchievements, MemberProfile } from './pages/member/Others'
import Overview from './pages/manager/Overview'
import Members from './pages/manager/Members'
import { ManagerAttendance, Memberships } from './pages/manager/Operations'
import Payments from './pages/manager/Payments'
import Analytics from './pages/manager/Analytics'
import Settings from './pages/manager/Settings'

export default function App() {
  const { role } = useStore()
  const [page, setPage] = useState('dashboard')
  useEffect(() => { setPage(role === 'manager' ? 'overview' : 'dashboard') }, [role])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [page, role])

  if (!role) return <Login />
  const pages: Record<string, JSX.Element> =
    role === 'member'
      ? { dashboard: <MemberDashboard go={setPage} />, attendance: <MemberAttendance />, membership: <MemberMembership />, achievements: <MemberAchievements />, profile: <MemberProfile /> }
      : { overview: <Overview go={setPage} />, members: <Members />, attendance: <ManagerAttendance />, memberships: <Memberships />, payments: <Payments />, analytics: <Analytics />, settings: <Settings /> }
  const fallback = role === 'manager' ? 'overview' : 'dashboard'
  const current = pages[page] ? page : fallback
  return <Shell role={role} page={current} setPage={setPage}>{pages[current]}</Shell>
}
