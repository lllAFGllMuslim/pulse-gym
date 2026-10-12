import { useEffect, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, ChevronRight, IndianRupee, LogIn, UserCheck, Users, Flame, UserPlus, Info } from 'lucide-react'
import { useAccent, useStore } from '../../lib/store'
import { growthSeries, MANAGER_NOTIFS, peakSeries, RECENT_CHECKINS, revenueSeries, weekSeries, ZONES0 } from '../../data/mock'
import { cn, iso, today, inrShort } from '../../lib/utils'
import { Avatar, Badge, Card, ChartTip, Count, Stat, axis, gridProps, planTone } from '../../components/ui'

export default function Overview({ go }: { go: (p: string) => void }) {
  const { read, attendance, profile, checkedAt } = useStore()
  const hex = useAccent()
  const [zones, setZones] = useState(ZONES0)
  useEffect(() => {
    const t = setInterval(() => setZones((z) => z.map((x) => ({ ...x, now: Math.max(4, Math.min(x.cap - 2, x.now + Math.round(Math.random() * 2 - 1))) }))), 3500)
    return () => clearInterval(t)
  }, [])
  const total = zones.reduce((a, z) => a + z.now, 0), pct = total / 150
  const alexIn = !!attendance[iso(today())]
  const feed = alexIn ? [{ name: profile.name, plan: 'Premium', ago: 'just now', time: checkedAt || '' }, ...RECENT_CHECKINS] : RECENT_CHECKINS
  const C = 2 * Math.PI * 70

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-4xl font-bold sm:text-5xl">Good evening, Riya</h1><p className="mt-1 text-white/50">PULSE · Cyber Hub is at {Math.round(pct * 100)}% capacity. Evening rush peaks in about an hour.</p></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={<Users size={18} />} label="Total members" value={<Count to={428} />} delta="+12" hint="this month" />
        <Stat icon={<UserCheck size={18} />} label="Active" value={<Count to={312} />} hint="73% of all members" />
        <Stat icon={<LogIn size={18} />} label="Check-ins today" value={<Count to={87} />} delta="9%" hint="vs yesterday" accent />
        <Stat icon={<IndianRupee size={18} />} label="Monthly revenue" value="₹3.4L" delta="14%" hint="vs last month" />
        <Stat icon={<AlertTriangle size={18} />} label="Expiring soon" value={<Count to={12} />} up={false} hint="within 7 days" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        <Card glow className="p-6">
          <div className="flex items-center justify-between"><h3 className="font-bold">Live gym occupancy</h3><span className="flex items-center gap-1.5 text-xs font-bold text-volt"><span className="h-2 w-2 animate-beat rounded-full bg-volt" /> Live</span></div>
          <div className="my-5 grid place-items-center">
            <div className="relative h-52 w-52">
              <svg viewBox="0 0 160 160" className="-rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" fill="none" stroke={hex} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 8px ${hex}99)` }} />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center"><div><div className="font-display text-6xl font-extrabold leading-none tabnum">{total}<span className="text-2xl text-white/35">/150</span></div><div className="mt-1 text-xs text-white/50">members on the floor</div></div></div>
            </div>
          </div>
          <div className="space-y-3">
            {zones.map((z) => (
              <div key={z.name}><div className="mb-1 flex justify-between text-xs"><span className="text-white/60">{z.name}</span><span className="font-bold tabnum">{z.now}/{z.cap}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]"><div className={cn('h-full rounded-full transition-all duration-1000', z.now / z.cap > 0.8 ? 'bg-amber-400' : 'bg-volt')} style={{ width: `${(z.now / z.cap) * 100}%` }} /></div></div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between"><div><h3 className="font-bold">Attendance, last 7 days</h3><p className="text-xs text-white/45">Average 90 check-ins a day</p></div><Badge tone="volt">Today: 87</Badge></div>
            <div className="h-48"><ResponsiveContainer><BarChart data={weekSeries} margin={{ left: -22 }}><CartesianGrid {...gridProps} /><XAxis dataKey="d" {...axis} /><YAxis {...axis} /><Tooltip content={<ChartTip fmt={(v) => `${v} check-ins`} />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
              <Bar dataKey="checkins" name="Check-ins" radius={[8, 8, 0, 0]}>{weekSeries.map((w, i) => <Cell key={i} fill={w.today ? hex : hex + '55'} />)}</Bar></BarChart></ResponsiveContainer></div>
          </Card>
          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between"><div><h3 className="font-bold">Peak hours</h3><p className="text-xs text-white/45">Average members on the floor, by hour</p></div><Badge tone="amber">Peak 6 PM · 112</Badge></div>
            <div className="h-44"><ResponsiveContainer><AreaChart data={peakSeries} margin={{ left: -22 }}><defs><linearGradient id="pk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hex} stopOpacity={0.45} /><stop offset="100%" stopColor={hex} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid {...gridProps} /><XAxis dataKey="h" {...axis} interval={2} /><YAxis {...axis} /><Tooltip content={<ChartTip fmt={(v) => `${v} members`} />} cursor={{ stroke: hex, strokeOpacity: 0.3 }} />
              <Area type="monotone" dataKey="load" name="On the floor" stroke={hex} strokeWidth={3} fill="url(#pk)" /></AreaChart></ResponsiveContainer></div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold">Monthly revenue</h3><p className="text-xs text-white/45">Up 56% over twelve months</p></div><span className="font-display text-3xl font-bold text-volt">{inrShort(340000)}</span></div>
          <div className="h-52"><ResponsiveContainer><AreaChart data={revenueSeries} margin={{ left: -10 }}><defs><linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hex} stopOpacity={0.4} /><stop offset="100%" stopColor={hex} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid {...gridProps} /><XAxis dataKey="m" {...axis} /><YAxis {...axis} tickFormatter={(v) => inrShort(v)} /><Tooltip content={<ChartTip fmt={(v) => '₹' + v.toLocaleString('en-IN')} />} cursor={{ stroke: hex, strokeOpacity: 0.3 }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke={hex} strokeWidth={3} fill="url(#rv)" /></AreaChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold">Member growth</h3><p className="text-xs text-white/45">Net +16 members this month</p></div><span className="font-display text-3xl font-bold text-volt">428</span></div>
          <div className="h-52"><ResponsiveContainer><LineChart data={growthSeries} margin={{ left: -18 }}><CartesianGrid {...gridProps} /><XAxis dataKey="m" {...axis} /><YAxis {...axis} domain={['dataMin - 20', 'dataMax + 10']} /><Tooltip content={<ChartTip fmt={(v) => `${v} members`} />} cursor={{ stroke: hex, strokeOpacity: 0.3 }} />
            <Line type="monotone" dataKey="total" name="Members" stroke={hex} strokeWidth={3} dot={false} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Recent check-ins</h3><button onClick={() => go('attendance')} className="flex items-center text-xs font-bold text-volt">Open log <ChevronRight size={14} /></button></div>
          <ul className="divide-y divide-white/[.06]">
            {feed.slice(0, 7).map((c, i) => (
              <li key={c.name + i} className={cn('flex items-center gap-3 py-2.5', i === 0 && alexIn && 'animate-pop')}>
                <Avatar name={c.name} size={36} /><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{c.name}</div><div className="text-xs text-white/40">{c.time}</div></div>
                <Badge tone={planTone(c.plan)}>{c.plan}</Badge><span className="w-20 text-right text-xs text-white/40">{c.ago}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Notifications</h3><Badge tone="amber">{MANAGER_NOTIFS.filter((n) => !read.includes(n.id)).length} unread</Badge></div>
          <ul className="space-y-3">
            {MANAGER_NOTIFS.slice(0, 5).map((n) => (
              <li key={n.id} className="flex gap-3 rounded-xl bg-white/[.03] p-3">
                <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', n.kind === 'warn' ? 'bg-amber-400/10 text-amber-300' : 'bg-volt/10 text-volt')}>
                  {n.kind === 'warn' ? <AlertTriangle size={16} /> : n.kind === 'money' ? <IndianRupee size={16} /> : n.kind === 'streak' ? <Flame size={16} /> : n.kind === 'user' ? <UserPlus size={16} /> : <Info size={16} />}</span>
                <div className="min-w-0"><div className="text-sm font-bold">{n.title}</div><div className="text-xs text-white/45">{n.body}</div></div><span className="shrink-0 text-[11px] text-white/30">{n.ago}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
