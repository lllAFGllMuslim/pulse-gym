import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MEMBERS, memberAttendance, type Member, type PlanId } from '../data/mock'
import { addDays, iso, mulberry32, today } from './utils'

export type Role = 'member' | 'manager' | null
export const ACCENTS = {
  Volt: { rgb: '200 255 46', hex: '#c8ff2e' },
  Cyan: { rgb: '34 211 238', hex: '#22d3ee' },
  Ember: { rgb: '255 122 61', hex: '#ff7a3d' },
  Violet: { rgb: '167 139 250', hex: '#a78bfa' },
} as const
export type AccentName = keyof typeof ACCENTS

export interface Profile { name: string; email: string; phone: string; goal: string; branch: string }
interface Persisted {
  day: string; role: Role; streak: number; longest: number; visitsMonth: number; totalVisits: number
  attendance: Record<string, number>; checkedAt: string | null; members: Member[]; read: string[]
  profile: Profile; accent: AccentName; toggles: Record<string, boolean>; reminded: string[]; plan: PlanId
}
interface Toast { id: number; msg: string }
interface Ctx extends Persisted {
  toasts: Toast[]
  login: (r: Role) => void; logout: () => void; checkIn: () => void
  addMember: (m: Omit<Member, 'id'>) => Member
  markAllRead: () => void; updateProfile: (p: Partial<Profile>) => void
  setAccent: (a: AccentName) => void; toggle: (k: string) => void; remind: (id: string) => void
  setPlan: (p: PlanId) => void; toast: (m: string) => void; reset: () => void
}

const KEY = 'pulse-gym-demo-v1'
const baseAttendance = () => {
  const r = mulberry32(42), out: Record<string, number> = {}, T = today()
  for (let d = 1; d <= 35; d++) {
    if (d <= 12) out[iso(addDays(T, -d))] = r() > 0.5 ? 3 : 2
    else if (d === 13) continue
    else if (r() < 0.6) out[iso(addDays(T, -d))] = 1 + Math.floor(r() * 3)
  }
  return out
}
const fresh = (): Persisted => ({
  day: iso(today()), role: null, streak: 12, longest: 18, visitsMonth: 21, totalVisits: 68,
  attendance: baseAttendance(), checkedAt: null, members: MEMBERS, read: [],
  profile: { name: 'Alex Rivera', email: 'alex.rivera@gmail.com', phone: '+91 98123 45678', goal: 'Build strength', branch: 'PULSE · Cyber Hub' },
  accent: 'Volt', toggles: { renewals: true, failed: true, capacity: true, milestones: false, weekly: true, autoCheckout: true, guestPass: false, twoFactor: true },
  reminded: [], plan: 'Premium',
})
function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as Persisted
      if (p.day === iso(today())) return p
      return { ...fresh(), role: p.role, accent: p.accent, toggles: p.toggles }
    }
  } catch { /* ignore */ }
  return fresh()
}

const C = createContext<Ctx>(null as unknown as Ctx)
export const useStore = () => useContext(C)
export const useAccent = () => ACCENTS[useStore().accent].hex

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Persisted>(load)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ } }, [s])
  useEffect(() => { document.documentElement.style.setProperty('--volt', ACCENTS[s.accent].rgb) }, [s.accent])

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const api: Ctx = useMemo(() => ({
    ...s, toasts, toast,
    login: (role) => setS((p) => ({ ...p, role })),
    logout: () => setS((p) => ({ ...p, role: null })),
    checkIn: () => setS((p) => {
      const k = iso(today())
      if (p.attendance[k]) return p
      const streak = p.streak + 1
      const now = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
      return {
        ...p, streak, longest: Math.max(p.longest, streak), visitsMonth: p.visitsMonth + 1, totalVisits: p.totalVisits + 1,
        attendance: { ...p.attendance, [k]: 3 }, checkedAt: now,
        members: p.members.map((m) => (m.id === 'm0' ? { ...m, streak, longest: Math.max(m.longest, streak), visits: m.visits + 1 } : m)),
      }
    }),
    addMember: (m) => {
      const id = 'm' + (Math.max(...s.members.map((x) => parseInt(x.id.slice(1)))) + 1)
      const nm = { ...m, id }
      setS((p) => ({ ...p, members: [nm, ...p.members] }))
      return nm
    },
    markAllRead: () => setS((p) => ({ ...p, read: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'a1', 'a2', 'a3', 'a4'] })),
    updateProfile: (pr) => setS((p) => ({ ...p, profile: { ...p.profile, ...pr } })),
    setAccent: (accent) => setS((p) => ({ ...p, accent })),
    toggle: (k) => setS((p) => ({ ...p, toggles: { ...p.toggles, [k]: !p.toggles[k] } })),
    remind: (id) => setS((p) => ({ ...p, reminded: [...p.reminded, id] })),
    setPlan: (plan) => setS((p) => ({ ...p, plan })),
    reset: () => { localStorage.removeItem(KEY); setS(fresh()) },
  }), [s, toasts, toast])

  return <C.Provider value={api}>{children}</C.Provider>
}
export { memberAttendance }
