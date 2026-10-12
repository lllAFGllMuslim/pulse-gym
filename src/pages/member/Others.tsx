import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Check, Clock, Crown, Download, Flame, LogOut, Pause, Percent, Save, Trophy } from 'lucide-react'
import { useAccent, useStore } from '../../lib/store'
import { getBadges, memberPayments, monthlyVisits, PLANS, sessions } from '../../data/mock'
import { cn, daysBetween, fmtDate, inr, parse, today } from '../../lib/utils'
import { Avatar, Badge, Card, ChartTip, Count, PageHeader, Progress, Stat, axis, gridProps, statusTone } from '../../components/ui'
import { Heatmap } from '../../components/Calendar'
import { BadgeCard } from '../../components/Badges'

export function MemberAttendance() {
  const { attendance, visitsMonth, streak, longest } = useStore()
  const hex = useAccent()
  const data = monthlyVisits.map((d, i, a) => (i === a.length - 1 ? { ...d, visits: visitsMonth } : d))
  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" sub="Every session you've logged, with the rhythm behind it." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<Percent size={18} />} label="Attendance rate" value="86%" delta="+6%" hint="vs last month" />
        <Stat icon={<Flame size={18} />} label="Current streak" value={<Count to={streak} suffix=" days" />} hint={`Best: ${longest} days`} accent />
        <Stat icon={<Clock size={18} />} label="Avg. session" value="64 min" delta="+5 min" hint="vs last month" />
        <Stat icon={<Check size={18} />} label="Favourite slot" value="6–7 AM" hint="14 of your last 21 visits" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-6"><h3 className="mb-4 font-bold">Last 5 weeks</h3><Heatmap data={attendance} big /></Card>
        <Card className="p-6">
          <h3 className="mb-1 font-bold">Visits per month</h3><p className="mb-4 text-xs text-white/45">Last 6 months</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ left: -22 }}>
                <CartesianGrid {...gridProps} /><XAxis dataKey="m" {...axis} /><YAxis {...axis} />
                <Tooltip content={<ChartTip fmt={(v) => `${v} visits`} />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
                <Bar dataKey="visits" name="Visits" radius={[8, 8, 0, 0]}>{data.map((_, i) => <Cell key={i} fill={i === data.length - 1 ? hex : hex + '55'} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <div className="p-6 pb-3"><h3 className="font-bold">Recent sessions</h3></div>
        <div className="divide-y divide-white/[.06]">
          {sessions.map((s) => (
            <div key={s.date} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-6 py-3.5 hover:bg-white/[.02]">
              <div className="w-28 text-sm font-bold">{fmtDate(s.date, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
              <div className="min-w-0 flex-1 text-sm text-white/70">{s.w}</div>
              <div className="text-xs text-white/45">{s.time}</div><Badge>{s.mins} min</Badge><Badge tone="volt">{s.kcal} kcal</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function MemberMembership() {
  const { members, plan, setPlan, toast } = useStore()
  const me = members.find((m) => m.id === 'm0')!
  const left = daysBetween(today(), parse(me.expires)), pays = memberPayments(me)
  const cur = PLANS.find((p) => p.id === plan)!
  return (
    <div className="space-y-6">
      <PageHeader title="Membership" sub="Your plan, billing and upgrade options." actions={<button className="btn-ghost" onClick={() => toast('Membership paused for 14 days')}><Pause size={16} /> Pause membership</button>} />
      <Card glow className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-volt text-ink-950 shadow-glow-sm"><Crown size={30} /></span>
            <div><div className="flex items-center gap-3"><span className="font-display text-5xl font-bold leading-none">{cur.id}</span><Badge tone="volt" dot>Active</Badge></div>
              <p className="mt-1 text-sm text-white/50">{inr(cur.price)} per {cur.period === 'mo' ? 'month' : 'year'} · Member since {fmtDate(me.joined, { month: 'long', year: 'numeric' })}</p></div>
          </div>
          <div className="w-full max-w-sm"><div className="mb-2 flex justify-between text-sm"><span className="text-white/55">Renews {fmtDate(me.expires)}</span><b>{left} days left</b></div><Progress value={((30 - left) / 30) * 100} /></div>
        </div>
      </Card>
      <div>
        <h3 className="mb-3 font-bold">Change plan</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => (
            <Card key={p.id} className={cn('flex flex-col p-5', p.id === plan && 'border-volt/50 shadow-glow-sm')}>
              <div className="flex items-center justify-between"><span className="font-display text-3xl font-bold">{p.id}</span>{p.id === plan && <Badge tone="volt">Current</Badge>}{p.popular && p.id !== plan && <Badge tone="sky">Popular</Badge>}</div>
              <div className="mt-1 font-display text-4xl font-bold text-volt">{inr(p.price)}<span className="text-sm font-semibold text-white/40"> /{p.period}</span></div>
              <ul className="my-4 flex-1 space-y-2 text-sm text-white/65">{p.features.map((f) => <li key={f} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-volt" />{f}</li>)}</ul>
              <button disabled={p.id === plan} className={p.id === plan ? 'btn-ghost' : 'btn-volt'} onClick={() => { setPlan(p.id); toast(`Switched to ${p.id}. Applies from your next cycle.`) }}>{p.id === plan ? 'Your plan' : `Switch to ${p.id}`}</button>
            </Card>
          ))}
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="p-6 pb-3"><h3 className="font-bold">Billing history</h3></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[620px]"><thead><tr className="border-y border-white/[.06]"><th className="th">Invoice</th><th className="th">Date</th><th className="th">Method</th><th className="th">Amount</th><th className="th">Status</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-white/[.05]">{pays.map((p) => (
            <tr key={p.id} className="hover:bg-white/[.02]"><td className="td font-bold">{p.id}</td><td className="td text-white/60">{fmtDate(p.date)}</td><td className="td text-white/60">{p.method}</td><td className="td font-bold">{inr(p.amount)}</td><td className="td"><Badge tone={statusTone(p.status)} dot>{p.status}</Badge></td>
              <td className="td text-right"><button onClick={() => toast(`Invoice ${p.id} downloaded`)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-volt" aria-label="Download invoice"><Download size={16} /></button></td></tr>))}</tbody></table></div>
      </Card>
    </div>
  )
}

export function MemberAchievements() {
  const { streak, longest, totalVisits } = useStore()
  const badges = getBadges({ streak, longest, total: totalVisits }), got = badges.filter((b) => b.unlocked).length
  return (
    <div className="space-y-6">
      <PageHeader title="Achievements" sub="Badges are earned by showing up. Keep the streak going to unlock the next one." />
      <Card className="flex flex-wrap items-center gap-6 p-6">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-volt text-ink-950 shadow-glow-sm"><Trophy size={30} /></span>
        <div className="flex-1"><div className="font-display text-5xl font-bold leading-none">{got}<span className="text-white/30"> / {badges.length}</span></div><div className="mt-1 text-sm text-white/50">badges unlocked</div></div>
        <div className="w-full max-w-xs"><Progress value={(got / badges.length) * 100} /></div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{badges.map((b) => <BadgeCard key={b.id} b={b} />)}</div>
    </div>
  )
}

export function MemberProfile() {
  const { profile, updateProfile, toast, logout, streak, longest, totalVisits } = useStore()
  const [f, setF] = useState(profile)
  const goals = ['Build strength', 'Lose fat', 'Build muscle', 'Endurance', 'Flexibility', 'Stay active']
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" sub="Keep your details current so the front desk can find you fast." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="flex flex-col items-center p-6 text-center">
          <Avatar name={f.name || 'Alex Rivera'} size={96} />
          <div className="mt-4 font-display text-3xl font-bold">{f.name}</div>
          <div className="text-sm text-white/45">{f.branch}</div>
          <div className="mt-5 grid w-full grid-cols-3 gap-2 border-t border-white/[.07] pt-5">
            {[[streak, 'Streak'], [longest, 'Best'], [totalVisits, 'Visits']].map(([n, l]) => <div key={l as string}><div className="font-display text-3xl font-bold text-volt">{n}</div><div className="text-[11px] text-white/45">{l}</div></div>)}
          </div>
          <button onClick={logout} className="btn-ghost mt-6 w-full"><LogOut size={16} /> Sign out</button>
        </Card>
        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="pn">Full name</label><input id="pn" className="input" value={f.name} onChange={set('name')} /></div>
            <div><label className="label" htmlFor="pe">Email</label><input id="pe" className="input" value={f.email} onChange={set('email')} /></div>
            <div><label className="label" htmlFor="pp">Phone</label><input id="pp" className="input" value={f.phone} onChange={set('phone')} /></div>
            <div><label className="label" htmlFor="pb">Home branch</label><input id="pb" className="input" value={f.branch} onChange={set('branch')} /></div>
          </div>
          <div className="mt-5"><span className="label">Training goal</span>
            <div className="flex flex-wrap gap-2">{goals.map((g) => <button key={g} onClick={() => setF({ ...f, goal: g })} className={cn('rounded-full border px-3.5 py-1.5 text-xs font-bold transition', f.goal === g ? 'border-volt bg-volt text-ink-950' : 'border-white/10 text-white/60 hover:border-white/30')}>{g}</button>)}</div></div>
          <div className="mt-6 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setF(profile)}>Discard changes</button><button className="btn-volt" onClick={() => { updateProfile(f); toast('Profile saved') }}><Save size={16} /> Save changes</button></div>
        </Card>
      </div>
    </div>
  )
}
