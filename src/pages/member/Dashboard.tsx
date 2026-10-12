import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarCheck, Check, ChevronRight, Crown, RefreshCw, Trophy } from 'lucide-react'
import { useAccent, useStore } from '../../lib/store'
import { activitySeries, getBadges, RECORDS } from '../../data/mock'
import { addDays, cn, daysBetween, fmtDate, iso, parse, startOfWeek, today } from '../../lib/utils'
import { Badge, Card, ChartTip, Count, Progress, Segmented, axis, gridProps } from '../../components/ui'
import { CheckIn } from '../../components/CheckIn'
import { Heatmap } from '../../components/Calendar'
import { BadgeCard, iconFor } from '../../components/Badges'

export default function MemberDashboard({ go }: { go: (p: string) => void }) {
  const { streak, longest, visitsMonth, totalVisits, attendance, members, profile, toast } = useStore()
  const hex = useAccent()
  const [metric, setMetric] = useState<'minutes' | 'calories'>('minutes')
  const me = members.find((m) => m.id === 'm0')!
  const left = daysBetween(today(), parse(me.expires))
  const badges = getBadges({ streak, longest, total: totalVisits })
  const week = Array.from({ length: 7 }, (_, i) => { const d = addDays(startOfWeek(today()), i); return { d, done: !!attendance[iso(d)], future: d > today(), now: iso(d) === iso(today()) } })
  const weekDone = week.filter((w) => w.done).length
  const next = [14, 21, 30, 50].find((n) => n > streak) ?? 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Welcome back, {profile.name.split(' ')[0]}</h1>
        <p className="mt-1 text-white/50">{fmtDate(today(), { weekday: 'long', day: 'numeric', month: 'long' })}. Today's plan: pull day, 60 minutes.</p>
      </div>

      {/* streak + check in */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card glow className="overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-volt/15 blur-[90px]" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-end gap-3 sm:gap-5">
                <span className="animate-flame text-[72px] leading-none sm:text-[104px]" aria-hidden>🔥</span>
                <div key={streak} className="animate-pop">
                  <div className="font-display text-[110px] font-extrabold leading-[.8] text-volt sm:text-[168px]" style={{ textShadow: '0 0 50px rgb(var(--volt)/.45)' }}>{streak}</div>
                </div>
                <div className="pb-2 font-display text-3xl font-bold leading-none sm:pb-4 sm:text-5xl">Day<br />Streak</div>
              </div>
              <div className="mt-7 max-w-md">
                <div className="mb-2 flex justify-between text-xs text-white/50"><span>Next milestone: {next}-day streak</span><span>{next - streak} to go</span></div>
                <Progress value={(streak / next) * 100} />
              </div>
            </div>
            <CheckIn />
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {[
            { v: visitsMonth, l: 'Visits this month', s: '+4 vs last month', i: <CalendarCheck size={18} /> },
            { v: totalVisits, l: 'Total visits', s: 'Since you joined in ' + fmtDate(me.joined, { month: 'short', year: 'numeric' }), i: <Check size={18} /> },
            { v: longest, l: 'Longest streak', s: 'Personal best, in days', i: <Trophy size={18} /> },
          ].map((x) => (
            <Card key={x.l} className="card-lift flex items-center gap-4 p-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[.06] text-volt">{x.i}</span>
              <div className="min-w-0"><div className="font-display text-5xl font-bold leading-none"><Count to={x.v} /></div><div className="mt-1 truncate text-sm font-semibold">{x.l}</div><div className="truncate text-xs text-white/40">{x.s}</div></div>
            </Card>
          ))}
        </div>
      </div>

      {/* weekly + heatmap + membership */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between"><h3 className="font-bold">This week</h3><Badge tone="volt">{weekDone} of 5 goal</Badge></div>
          <div className="grid grid-cols-7 gap-2">
            {week.map((w) => (
              <div key={w.d.toISOString()} className="flex flex-col items-center gap-2">
                <div className={cn('grid h-12 w-full place-items-center rounded-xl border transition', w.done ? 'border-volt bg-volt text-ink-950 shadow-glow-sm' : w.now ? 'border-volt/50 border-dashed text-volt' : 'border-white/10 bg-white/[.03] text-white/25', w.future && !w.now && 'opacity-40')}>
                  {w.done ? <Check size={20} strokeWidth={3} /> : <span className="text-sm font-bold">{w.d.getDate()}</span>}
                </div>
                <span className={cn('text-[11px] font-semibold', w.now ? 'text-volt' : 'text-white/40')}>{w.d.toLocaleString('en-US', { weekday: 'short' })}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-white/50">{weekDone >= 5 ? 'Weekly goal complete. Nice work.' : `${5 - weekDone} more session${5 - weekDone > 1 ? 's' : ''} to hit your weekly goal.`}</p>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between"><h3 className="font-bold">Monthly heatmap</h3><button onClick={() => go('attendance')} className="flex items-center text-xs font-bold text-volt">Full history <ChevronRight size={14} /></button></div>
          <Heatmap data={attendance} />
        </Card>

        <Card className="flex flex-col p-6">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Membership</h3><Badge tone="volt" dot>Active</Badge></div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-volt text-ink-950"><Crown size={22} /></span>
            <div><div className="font-display text-3xl font-bold leading-none">Premium</div><div className="text-xs text-white/45">₹2,999 per month · Auto-renew on</div></div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs"><span className="text-white/50">Renews {fmtDate(me.expires, { day: 'numeric', month: 'short' })}</span><b>{left} days left</b></div>
            <Progress value={((30 - left) / 30) * 100} />
          </div>
          <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
            <button className="btn-volt !py-2.5 text-xs" onClick={() => toast('Renewed early. Next cycle starts after ' + fmtDate(me.expires, { day: 'numeric', month: 'short' }))}><RefreshCw size={14} /> Renew early</button>
            <button className="btn-ghost !py-2.5 text-xs" onClick={() => go('membership')}>Manage plan</button>
          </div>
        </Card>
      </div>

      {/* activity + records */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="font-bold">Training activity</h3><p className="text-xs text-white/45">Last 8 weeks. Trending up 52% since week one.</p></div>
            <Segmented value={metric} onChange={setMetric} options={[{ id: 'minutes', label: 'Minutes' }, { id: 'calories', label: 'Calories' }]} />
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={activitySeries} margin={{ left: -18, right: 6, top: 8 }}>
                <defs><linearGradient id="actG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hex} stopOpacity={0.4} /><stop offset="100%" stopColor={hex} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid {...gridProps} /><XAxis dataKey="w" {...axis} /><YAxis {...axis} />
                <Tooltip content={<ChartTip fmt={(v) => (metric === 'minutes' ? `${v} min` : `${v.toLocaleString('en-IN')} kcal`)} />} cursor={{ stroke: hex, strokeOpacity: 0.3 }} />
                <Area type="monotone" dataKey={metric} name={metric === 'minutes' ? 'Active time' : 'Energy burned'} stroke={hex} strokeWidth={3} fill="url(#actG)" dot={{ r: 3, fill: hex, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-bold">Personal records</h3>
          <ul className="divide-y divide-white/[.06]">
            {RECORDS.map((r) => (
              <li key={r.lift} className="flex items-center gap-3 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/[.06] text-volt">{iconFor(r.icon)}</span>
                <div className="min-w-0 flex-1"><div className="text-sm font-bold">{r.lift}</div><div className="text-xs text-white/40">{r.when}</div></div>
                <div className="text-right"><div className="font-display text-2xl font-bold leading-none">{r.value}</div><div className="text-[11px] font-bold text-volt">{r.delta}</div></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div><h3 className="font-bold">Achievements</h3><p className="text-xs text-white/45">{badges.filter((b) => b.unlocked).length} of {badges.length} unlocked</p></div>
          <button onClick={() => go('achievements')} className="flex items-center text-xs font-bold text-volt">View all <ChevronRight size={14} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">{badges.map((b) => <BadgeCard key={b.id} b={b} compact />)}</div>
      </Card>
    </div>
  )
}
