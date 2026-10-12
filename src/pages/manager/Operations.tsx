import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, BadgeCheck, Check, Clock, LogIn, Send, Timer, UserCheck, Users, UserX } from 'lucide-react'
import { useAccent, useStore } from '../../lib/store'
import { distribution, heatGrid, peakSeries, PLANS, RECENT_CHECKINS } from '../../data/mock'
import { cn, daysBetween, fmtDate, inr, parse, today } from '../../lib/utils'
import { Avatar, Badge, Card, ChartTip, Count, PageHeader, Stat, axis, gridProps, planTone, statusTone } from '../../components/ui'

export function ManagerAttendance() {
  const { members } = useStore()
  const hex = useAccent()
  const now = new Date().getHours()
  const data = peakSeries.map((p) => ({ h: p.h, typical: p.load, today: p.hour <= now ? Math.round(p.load * 0.93) : null }))
  const max = Math.max(...heatGrid.flatMap((r) => r.cells))
  const streakOf = (n: string) => members.find((m) => m.name === n)?.streak ?? 0
  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" sub="Who is in, when the floor fills up, and how today compares with a normal day." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<LogIn size={18} />} label="Check-ins today" value={<Count to={87} />} delta="9%" hint="vs yesterday" accent />
        <Stat icon={<Users size={18} />} label="On the floor now" value={<Count to={87} suffix="/150" />} hint="58% capacity" />
        <Stat icon={<Timer size={18} />} label="Avg. session" value="68 min" delta="4 min" hint="vs last week" />
        <Stat icon={<UserX size={18} />} label="Walk-ins today" value={<Count to={9} />} hint="Guest passes: 4" />
      </div>
      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold">Today vs a typical day</h3><p className="text-xs text-white/45">Members on the floor, by hour</p></div>
          <div className="flex gap-4 text-xs text-white/55"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-volt" />Today</span><span className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-white/60" />Typical</span></div></div>
        <div className="h-64"><ResponsiveContainer><ComposedChart data={data} margin={{ left: -22 }}><CartesianGrid {...gridProps} /><XAxis dataKey="h" {...axis} interval={1} /><YAxis {...axis} />
          <Tooltip content={<ChartTip fmt={(v) => `${v} members`} />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
          <Bar dataKey="today" name="Today" fill={hex} radius={[6, 6, 0, 0]} /><Line type="monotone" dataKey="typical" name="Typical" stroke="rgba(255,255,255,.65)" strokeWidth={2} strokeDasharray="5 4" dot={false} /></ComposedChart></ResponsiveContainer></div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="p-6">
          <h3 className="font-bold">Busiest times this month</h3><p className="mb-4 text-xs text-white/45">Darker means busier. Plan staffing around the bright blocks.</p>
          <div className="overflow-x-auto"><div className="min-w-[560px]">
            <div className="mb-1.5 ml-10 grid gap-1" style={{ gridTemplateColumns: `repeat(${peakSeries.length},1fr)` }}>{peakSeries.map((p, i) => <span key={i} className="text-center text-[10px] text-white/35">{i % 2 === 0 ? p.h.replace(' ', '').toLowerCase() : ''}</span>)}</div>
            {heatGrid.map((r) => (
              <div key={r.d} className="mb-1 flex items-center gap-1"><span className="w-9 text-xs font-semibold text-white/45">{r.d}</span>
                <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${peakSeries.length},1fr)` }}>{r.cells.map((c, i) => <div key={i} title={`${r.d} ${peakSeries[i].h}: ${c} members`} className="h-8 rounded-md transition hover:scale-110" style={{ background: `rgb(var(--volt) / ${0.05 + (c / max) * 0.95})` }} />)}</div></div>
            ))}
          </div></div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-3 font-bold">Live check-in log</h3>
          <ul className="max-h-[340px] divide-y divide-white/[.06] overflow-y-auto pr-1">
            {RECENT_CHECKINS.map((c) => (
              <li key={c.name} className="flex items-center gap-3 py-2.5"><Avatar name={c.name} size={34} /><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{c.name}</div><div className="text-xs text-white/40">In at {c.time} · 🔥 {streakOf(c.name)}</div></div><Badge tone={planTone(c.plan)}>{c.plan}</Badge></li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

export function Memberships() {
  const { members, reminded, remind, toast } = useStore()
  const expiring = members.filter((m) => m.status === 'Expiring'), expired = members.filter((m) => m.status === 'Expired')
  const total = distribution.reduce((a, d) => a + d.value, 0)
  return (
    <div className="space-y-6">
      <PageHeader title="Memberships" sub="Plans, subscriber mix and who needs a nudge before they lapse." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<UserCheck size={18} />} label="Active memberships" value={<Count to={312} />} delta="+12" hint="this month" accent />
        <Stat icon={<AlertTriangle size={18} />} label="Expiring in 7 days" value={<Count to={12} />} up={false} hint="₹28k at risk" />
        <Stat icon={<Clock size={18} />} label="Expired" value={<Count to={116} />} hint="27 won back this quarter" up={false} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => (
          <Card key={p.id} className={cn('card-lift flex flex-col p-5', p.popular && 'border-volt/30')}>
            <div className="flex items-center justify-between"><span className="font-display text-3xl font-bold">{p.id}</span>{p.popular && <Badge tone="volt">Most popular</Badge>}</div>
            <div className="mt-1 text-xs text-white/45">{p.tagline}</div>
            <div className="mt-4 font-display text-5xl font-bold leading-none text-volt">{inr(p.price)}<span className="text-base font-semibold text-white/40"> /{p.period}</span></div>
            <ul className="my-5 flex-1 space-y-2 text-sm text-white/65">{p.features.map((f) => <li key={f} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-volt" />{f}</li>)}</ul>
            <div className="border-t border-white/[.07] pt-4"><div className="mb-1.5 flex justify-between text-xs"><span className="text-white/50">{p.subs} subscribers</span><b>{Math.round((p.subs / total) * 100)}%</b></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-volt" style={{ width: `${(p.subs / total) * 100}%` }} /></div></div>
            <button className="btn-ghost mt-4 !py-2 text-xs" onClick={() => toast(`${p.id} plan editor opens in the full product`)}>Edit plan</button>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4"><div><h3 className="font-bold">Needs attention</h3><p className="text-xs text-white/45">Top {expiring.length + expired.length} of 128 expiring or expired memberships</p></div>
          <button className="btn-volt !py-2 text-xs" onClick={() => { expiring.forEach((m) => remind(m.id)); toast(`Reminders sent to ${expiring.length} members`) }}><Send size={14} /> Remind all expiring</button></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px]"><thead><tr className="border-y border-white/[.06]"><th className="th">Member</th><th className="th">Plan</th><th className="th">Expiry</th><th className="th">Status</th><th className="th text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-white/[.05]">{[...expiring, ...expired].map((m) => { const d = daysBetween(today(), parse(m.expires)), sent = reminded.includes(m.id); return (
            <tr key={m.id} className="hover:bg-white/[.02]"><td className="td"><div className="flex items-center gap-3"><Avatar name={m.name} size={34} /><span className="font-bold">{m.name}</span></div></td>
              <td className="td"><Badge tone={planTone(m.plan)}>{m.plan}</Badge></td><td className="td text-white/60">{fmtDate(m.expires)} <span className="text-white/35">· {d >= 0 ? `in ${d}d` : `${-d}d ago`}</span></td>
              <td className="td"><Badge tone={statusTone(m.status)} dot>{m.status}</Badge></td>
              <td className="td text-right"><button disabled={sent} onClick={() => { remind(m.id); toast(`${m.status === 'Expired' ? 'Win-back offer' : 'Reminder'} sent to ${m.name.split(' ')[0]}`) }} className={cn('btn !py-1.5 text-xs', sent ? 'text-volt' : 'btn-ghost')}>{sent ? <><BadgeCheck size={14} /> Sent</> : <><Send size={14} /> {m.status === 'Expired' ? 'Win back' : 'Remind'}</>}</button></td></tr>) })}</tbody></table></div>
      </Card>
    </div>
  )
}
