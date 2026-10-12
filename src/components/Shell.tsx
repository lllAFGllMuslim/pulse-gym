import { useState, type ReactNode } from 'react'
import { AlertTriangle, BadgeCheck, BarChart3, Bell, CalendarCheck, CheckCheck, CreditCard, Flame, IndianRupee, Info, LayoutDashboard, LogOut, Menu, Settings, Trophy, User, UserPlus, Users, Wallet, X } from 'lucide-react'
import { useStore, type Role } from '../lib/store'
import { MANAGER_NOTIFS, MEMBER_NOTIFS, type Notif } from '../data/mock'
import { cn } from '../lib/utils'
import { Avatar, Logo } from './ui'

type NavItem = { id: string; label: string; icon: ReactNode }
const I = 18
export const NAV: Record<'member' | 'manager', NavItem[]> = {
  member: [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={I} /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck size={I} /> },
    { id: 'membership', label: 'Membership', icon: <CreditCard size={I} /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={I} /> },
    { id: 'profile', label: 'Profile', icon: <User size={I} /> },
  ],
  manager: [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={I} /> },
    { id: 'members', label: 'Members', icon: <Users size={I} /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck size={I} /> },
    { id: 'memberships', label: 'Memberships', icon: <BadgeCheck size={I} /> },
    { id: 'payments', label: 'Payments', icon: <Wallet size={I} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={I} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={I} /> },
  ],
}
const notifIcon = (k: Notif['kind']) => ({ warn: <AlertTriangle size={16} />, money: <IndianRupee size={16} />, streak: <Flame size={16} />, info: <Info size={16} />, user: <UserPlus size={16} /> }[k])

export function Shell({ role, page, setPage, children }: { role: 'member' | 'manager'; page: string; setPage: (p: string) => void; children: ReactNode }) {
  const { login, logout, profile, read, markAllRead, toasts } = useStore()
  const [drawer, setDrawer] = useState(false)
  const [bell, setBell] = useState(false)
  const nav = NAV[role], notifs = role === 'manager' ? MANAGER_NOTIFS : MEMBER_NOTIFS
  const unread = notifs.filter((n) => !read.includes(n.id)).length
  const go = (id: string) => { setPage(id); setDrawer(false) }
  const switchTo = (r: Exclude<Role, null>) => { if (r !== role) login(r) }

  const Side = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6"><Logo /></div>
      <div className="px-5 pb-2 text-xs font-semibold text-white/35">{role === 'manager' ? 'Gym manager console' : 'Member space'}</div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => (
          <button key={n.id} onClick={() => go(n.id)}
            className={cn('group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              page === n.id ? 'bg-volt/10 text-volt' : 'text-white/55 hover:bg-white/[.05] hover:text-white')}>
            {page === n.id && <span className="absolute -left-3 top-2 h-6 w-1 rounded-r-full bg-volt shadow-glow-sm" />}
            {n.icon}{n.label}
          </button>
        ))}
      </nav>
      <div className="m-3 rounded-2xl border border-white/[.07] bg-ink-900 p-3">
        <div className="flex items-center gap-3">
          <Avatar name={role === 'manager' ? 'Riya Kapoor' : profile.name} size={38} />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{role === 'manager' ? 'Riya Kapoor' : profile.name}</div>
            <div className="text-xs text-white/45">{role === 'manager' ? 'General manager' : 'Premium member'}</div>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost mt-3 w-full !py-2 text-xs"><LogOut size={14} /> Sign out</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[.06] bg-ink-900/90 backdrop-blur lg:block">{Side}</aside>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-drawer border-r border-white/10 bg-ink-900">
            <button onClick={() => setDrawer(false)} className="absolute right-3 top-5 rounded-lg p-2 text-white/60 hover:bg-white/10" aria-label="Close menu"><X size={18} /></button>
            {Side}
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/[.06] bg-ink-950/80 px-4 py-3 backdrop-blur-xl sm:px-8">
        <button onClick={() => setDrawer(true)} className="rounded-xl border border-white/10 p-2 lg:hidden" aria-label="Open menu"><Menu size={20} /></button>
        <div className="lg:hidden"><Logo size={28} /></div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-xl border border-white/10 bg-ink-900 p-1 sm:inline-flex" role="group" aria-label="Switch demo role">
            {(['member', 'manager'] as const).map((r) => (
              <button key={r} onClick={() => switchTo(r)} className={cn('rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition', role === r ? 'bg-volt text-ink-950' : 'text-white/55 hover:text-white')}>{r}</button>
            ))}
          </div>
          <button onClick={() => switchTo(role === 'member' ? 'manager' : 'member')} className="btn-ghost !px-3 !py-2 text-xs sm:hidden">{role === 'member' ? 'Manager' : 'Member'}</button>
          <div className="relative">
            <button onClick={() => setBell((b) => !b)} className="relative rounded-xl border border-white/10 bg-ink-900 p-2.5 hover:border-volt/40" aria-label="Notifications">
              <Bell size={18} />
              {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-volt px-1 text-[11px] font-extrabold text-ink-950">{unread}</span>}
            </button>
            {bell && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBell(false)} />
                <div className="fixed inset-x-3 top-16 z-50 animate-pop overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96">
                  <div className="flex items-center justify-between border-b border-white/[.07] px-4 py-3">
                    <div className="font-bold">Notifications</div>
                    <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-bold text-volt"><CheckCheck size={14} /> Mark all read</button>
                  </div>
                  <div className="max-h-[60vh] divide-y divide-white/[.05] overflow-y-auto">
                    {notifs.map((n) => (
                      <div key={n.id} className="flex gap-3 px-4 py-3.5 hover:bg-white/[.03]">
                        <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg', n.kind === 'warn' ? 'bg-amber-400/10 text-amber-300' : 'bg-volt/10 text-volt')}>{notifIcon(n.kind)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2"><span className="text-sm font-bold">{n.title}</span>{!read.includes(n.id) && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-volt" />}</div>
                          <p className="mt-0.5 text-xs leading-relaxed text-white/50">{n.body}</p>
                          <span className="mt-1 block text-[11px] text-white/30">{n.ago}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <Avatar name={role === 'manager' ? 'Riya Kapoor' : profile.name} size={38} />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 sm:py-8">
        <div key={role + page} className="animate-rise">{children}</div>
      </main>

      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex animate-pop items-center gap-2.5 rounded-xl border border-volt/30 bg-ink-800 px-4 py-3 text-sm font-semibold shadow-glow-sm">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-volt text-ink-950"><CheckCheck size={12} strokeWidth={3} /></span>{t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}
