import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarCheck, Eye, Flame, Mail, Phone, Plus, RefreshCw, Search, Send, Trophy, UserX } from 'lucide-react'
import { useStore } from '../../lib/store'
import { memberAttendance, memberPayments, PLANS, planPrice, type Member, type PlanId } from '../../data/mock'
import { addDays, cn, daysBetween, fmtDate, inr, iso, parse, today } from '../../lib/utils'
import { Avatar, Badge, Card, Count, Modal, PageHeader, Segmented, Stat, planTone, statusTone } from '../../components/ui'
import { MonthCalendar } from '../../components/Calendar'

type SF = 'All' | 'Active' | 'Expiring' | 'Expired'

export default function Members() {
  const { members, addMember, toast, attendance } = useStore()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<SF>('All')
  const [plan, setPlan] = useState<'All' | PlanId>('All')
  const [sort, setSort] = useState('name')
  const [sel, setSel] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const rows = useMemo(() => {
    const r = members.filter((m) => (status === 'All' || m.status === status) && (plan === 'All' || m.plan === plan) && (m.name + m.email).toLowerCase().includes(q.toLowerCase()))
    const f: Record<string, (a: Member, b: Member) => number> = {
      name: (a, b) => a.name.localeCompare(b.name), streak: (a, b) => b.streak - a.streak, visits: (a, b) => b.visits - a.visits, joined: (a, b) => b.joined.localeCompare(a.joined),
    }
    return [...r].sort(f[sort])
  }, [members, q, status, plan, sort])

  const member = members.find((m) => m.id === sel)
  if (member) return <Profile m={member} back={() => setSel(null)} att={member.id === 'm0' ? attendance : memberAttendance(member)} />

  return (
    <div className="space-y-6">
      <PageHeader title="Members" sub={`${members.length} profiles loaded from your 428-member roster. Click a row to open a profile.`}
        actions={<button className="btn-volt" onClick={() => setOpen(true)}><Plus size={16} /> Add member</button>} />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[.06] p-4">
          <div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3.5 top-3 text-white/30" />
            <input className="input !pl-10" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search members" /></div>
          <Segmented<SF> value={status} onChange={setStatus} options={(['All', 'Active', 'Expiring', 'Expired'] as SF[]).map((s) => ({ id: s, label: s }))} />
          <select className="input !w-auto" value={plan} onChange={(e) => setPlan(e.target.value as any)} aria-label="Filter by plan"><option>All</option>{PLANS.map((p) => <option key={p.id}>{p.id}</option>)}</select>
          <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by"><option value="name">Sort: Name</option><option value="streak">Sort: Streak</option><option value="visits">Sort: Visits</option><option value="joined">Sort: Newest</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead><tr className="border-b border-white/[.06]"><th className="th">Name</th><th className="th">Plan</th><th className="th">Streak</th><th className="th">Visits</th><th className="th">Join date</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-white/[.05]">
              {rows.map((m) => (
                <tr key={m.id} onClick={() => setSel(m.id)} className="group cursor-pointer transition hover:bg-white/[.035]">
                  <td className="td"><div className="flex items-center gap-3"><Avatar name={m.name} size={38} /><div><div className="font-bold group-hover:text-volt">{m.name}</div><div className="text-xs text-white/40">{m.email}</div></div></div></td>
                  <td className="td"><Badge tone={planTone(m.plan)}>{m.plan}</Badge></td>
                  <td className="td font-bold tabnum">{m.streak > 0 ? <span>🔥 {m.streak}</span> : <span className="text-white/25">—</span>}</td>
                  <td className="td tabnum text-white/70">{m.visits}</td>
                  <td className="td text-white/60">{fmtDate(m.joined)}</td>
                  <td className="td"><Badge tone={statusTone(m.status)} dot>{m.status}</Badge></td>
                  <td className="td"><div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-volt" aria-label={`View ${m.name}`} onClick={() => setSel(m.id)}><Eye size={16} /></button>
                    <button className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-volt" aria-label={`Message ${m.name}`} onClick={() => toast(`Message sent to ${m.name.split(' ')[0]}`)}><Mail size={16} /></button>
                    <button className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-volt" aria-label={`Renew ${m.name}`} onClick={() => toast(`Renewal link sent to ${m.name.split(' ')[0]}`)}><RefreshCw size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="grid place-items-center gap-2 py-16 text-center"><UserX size={32} className="text-white/25" /><div className="font-bold">No members match these filters</div>
              <button className="btn-ghost" onClick={() => { setQ(''); setStatus('All'); setPlan('All') }}>Clear filters</button></div>
          )}
        </div>
        <div className="border-t border-white/[.06] px-4 py-3 text-xs text-white/40">Showing {rows.length} of {members.length} loaded members</div>
      </Card>

      <AddModal open={open} onClose={() => setOpen(false)} onAdd={(m) => { const n = addMember(m); toast(`${n.name} added on the ${n.plan} plan`); setOpen(false); setSel(n.id) }} />
    </div>
  )
}

function AddModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (m: Omit<Member, 'id'>) => void }) {
  const blank = { name: '', email: '', phone: '', plan: 'Standard' as PlanId, goal: 'Stay active', method: 'UPI' }
  const [f, setF] = useState(blank)
  const [err, setErr] = useState<Record<string, string>>({})
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (f.name.trim().length < 3) er.name = 'Enter the member\'s full name.'
    if (!/\S+@\S+\.\S+/.test(f.email)) er.email = 'Enter a valid email address.'
    setErr(er); if (Object.keys(er).length) return
    const t = today()
    onAdd({ name: f.name.trim(), email: f.email, phone: f.phone || '+91 90000 00000', plan: f.plan, goal: f.goal, streak: 0, longest: 0, visits: 0, joined: iso(t), expires: iso(addDays(t, f.plan === 'Annual' ? 365 : 30)), status: 'Active', trainer: 'Coach Imran' })
    setF(blank)
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })
  return (
    <Modal open={open} onClose={onClose} title="Add member">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><label className="label" htmlFor="an">Full name</label><input id="an" className="input" placeholder="e.g. Nisha Arora" value={f.name} onChange={set('name')} autoFocus />{err.name && <p className="mt-1 text-xs text-rose-300">{err.name}</p>}</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="ae">Email</label><input id="ae" className="input" placeholder="nisha@email.com" value={f.email} onChange={set('email')} />{err.email && <p className="mt-1 text-xs text-rose-300">{err.email}</p>}</div>
          <div><label className="label" htmlFor="ap">Phone</label><input id="ap" className="input" placeholder="+91 98xxx xxxxx" value={f.phone} onChange={set('phone')} /></div>
        </div>
        <div><span className="label">Plan</span>
          <div className="grid grid-cols-2 gap-2">{PLANS.map((p) => (
            <button type="button" key={p.id} onClick={() => setF({ ...f, plan: p.id })} className={cn('rounded-xl border p-3 text-left transition', f.plan === p.id ? 'border-volt bg-volt/10' : 'border-white/10 hover:border-white/25')}>
              <div className="font-bold">{p.id}</div><div className="text-xs text-white/50">{inr(p.price)} / {p.period === 'mo' ? 'month' : 'year'}</div></button>))}</div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="ag">Goal</label><select id="ag" className="input" value={f.goal} onChange={set('goal')}>{['Stay active', 'Lose fat', 'Build muscle', 'Build strength', 'Endurance', 'Flexibility'].map((g) => <option key={g}>{g}</option>)}</select></div>
          <div><label className="label" htmlFor="am">Payment method</label><select id="am" className="input" value={f.method} onChange={set('method')}>{['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash'].map((g) => <option key={g}>{g}</option>)}</select></div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/[.04] px-4 py-3 text-sm"><span className="text-white/55">Due at sign-up</span><b className="font-display text-2xl text-volt">{inr(planPrice(f.plan))}</b></div>
        <div className="flex justify-end gap-2 pt-1"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-volt"><Plus size={16} /> Add member</button></div>
      </form>
    </Modal>
  )
}

function Profile({ m, back, att }: { m: Member; back: () => void; att: Record<string, number> }) {
  const { toast } = useStore()
  const pays = memberPayments(m), left = daysBetween(today(), parse(m.expires))
  const monthN = Object.keys(att).filter((k) => k.slice(0, 7) === iso(today()).slice(0, 7)).length
  const rate = Math.min(98, Math.round((m.visits / Math.max(1, daysBetween(parse(m.joined), today()))) * 100 * 1.9))
  return (
    <div className="space-y-6">
      <button onClick={back} className="flex items-center gap-2 text-sm font-bold text-white/55 hover:text-volt"><ArrowLeft size={16} /> All members</button>
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-volt/10 blur-[80px]" />
        <div className="relative flex flex-wrap items-center gap-6">
          <Avatar name={m.name} size={88} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-5xl font-bold leading-none">{m.name}</h1><Badge tone={statusTone(m.status)} dot>{m.status}</Badge><Badge tone={planTone(m.plan)}>{m.plan}</Badge></div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/55"><span className="flex items-center gap-2"><Mail size={14} />{m.email}</span><span className="flex items-center gap-2"><Phone size={14} />{m.phone}</span><span>Goal: {m.goal}</span><span>Trainer: {m.trainer}</span></div>
          </div>
          <div className="flex gap-2"><button className="btn-ghost" onClick={() => toast(`Message sent to ${m.name.split(' ')[0]}`)}><Send size={16} /> Message</button><button className="btn-volt" onClick={() => toast(`Renewal link sent to ${m.name.split(' ')[0]}`)}><RefreshCw size={16} /> Send renewal</button></div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<Flame size={18} />} label="Current streak" value={<Count to={m.streak} suffix=" d" />} hint="consecutive days" accent />
        <Stat icon={<Trophy size={18} />} label="Longest streak" value={<Count to={m.longest} suffix=" d" />} hint="personal best" />
        <Stat icon={<CalendarCheck size={18} />} label="Total visits" value={<Count to={m.visits} />} hint={`${monthN} in the last 5 weeks`} />
        <Stat icon={<RefreshCw size={18} />} label="Attendance rate" value={`${rate}%`} hint={`since ${fmtDate(m.joined, { month: 'short', year: 'numeric' })}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="p-6"><h3 className="mb-4 font-bold">Attendance calendar</h3><MonthCalendar data={att} /></Card>
        <Card className="p-6">
          <h3 className="mb-4 font-bold">Membership</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {[['Plan', `${m.plan} · ${inr(planPrice(m.plan))}/${m.plan === 'Annual' ? 'yr' : 'mo'}`], ['Status', m.status], ['Member since', fmtDate(m.joined)], ['Expires', fmtDate(m.expires)],
              ['Days remaining', left >= 0 ? `${left} days` : `Expired ${-left} days ago`], ['Auto-renew', m.status === 'Expired' ? 'Off' : 'On']].map(([k, v]) => (
              <div key={k}><dt className="text-xs text-white/40">{k}</dt><dd className="mt-0.5 font-bold">{v}</dd></div>))}
          </dl>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[.07]"><div className={cn('h-full rounded-full', m.status === 'Expired' ? 'bg-rose-500' : m.status === 'Expiring' ? 'bg-amber-400' : 'bg-volt')} style={{ width: `${m.status === 'Expired' ? 100 : Math.max(6, 100 - (left / (m.plan === 'Annual' ? 365 : 30)) * 100)}%` }} /></div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 pb-3"><h3 className="font-bold">Payment history</h3></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[620px]"><thead><tr className="border-y border-white/[.06]"><th className="th">Invoice</th><th className="th">Date</th><th className="th">Plan</th><th className="th">Method</th><th className="th">Amount</th><th className="th">Status</th></tr></thead>
          <tbody className="divide-y divide-white/[.05]">{pays.map((p) => <tr key={p.id}><td className="td font-bold">{p.id}</td><td className="td text-white/60">{fmtDate(p.date)}</td><td className="td">{p.plan}</td><td className="td text-white/60">{p.method}</td><td className="td font-bold">{inr(p.amount)}</td><td className="td"><Badge tone={statusTone(p.status)} dot>{p.status}</Badge></td></tr>)}</tbody></table></div>
      </Card>
    </div>
  )
}
