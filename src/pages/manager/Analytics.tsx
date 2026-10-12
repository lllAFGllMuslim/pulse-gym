import { useState } from 'react'
import { Area, Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, AreaChart } from 'recharts'
import { ArrowUpRight, Repeat, Timer, TrendingUp, Wallet } from 'lucide-react'
import { useAccent } from '../../lib/store'
import { distribution, growthSeries, peakSeries, retentionSeries, revenueSeries, weekdayAvg } from '../../data/mock'
import { Card, ChartTip, PageHeader, Segmented, axis, gridProps } from '../../components/ui'
import { inr, inrShort } from '../../lib/utils'

export default function Analytics() {
  const hex = useAccent()
  const [range, setRange] = useState<'3' | '6' | '12'>('12')
  const n = Number(range)
  const rev = revenueSeries.slice(-n), gr = growthSeries.slice(-n), ret = retentionSeries.slice(-n)
  const pie = [hex, '#ffffff', '#7a8290', '#383e48']
  const leg = { wrapperStyle: { fontSize: 12, color: 'rgba(255,255,255,.55)' }, iconType: 'circle' as const, iconSize: 8 }
  const growth = Math.round(((gr[gr.length - 1].total - gr[0].total) / gr[0].total) * 100)

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" sub="What's driving growth, where the floor is busiest, and whether members stay." actions={<Segmented value={range} onChange={setRange} options={[{ id: '3', label: '3 months' }, { id: '6', label: '6 months' }, { id: '12', label: '12 months' }]} />} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_1fr]">
        <Card glow className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-volt/20 blur-[70px]" />
          <div className="flex items-center gap-2 text-sm font-semibold text-white/60"><Repeat size={16} className="text-volt" /> Member retention</div>
          <div className="mt-3 font-display text-[88px] font-extrabold leading-[.85] text-volt">92%</div>
          <p className="mt-3 text-sm text-white/55">of members renewed last cycle, 2 points above your 90% target.</p>
        </Card>
        <Card glow className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-volt/20 blur-[70px]" />
          <div className="flex items-center gap-2 text-sm font-semibold text-white/60"><TrendingUp size={16} className="text-volt" /> Membership growth</div>
          <div className="mt-3 flex items-end gap-3"><span className="font-display text-[88px] font-extrabold leading-[.85] text-volt">+18%</span><ArrowUpRight size={36} className="mb-2 text-volt" /></div>
          <p className="mt-3 text-sm text-white/55">in six months, from 363 to 428 members. {n !== 6 && <span className="text-white/35">Charts below show {n} months.</span>}</p>
        </Card>
        <div className="grid gap-4">
          <Card className="flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[.06] text-volt"><Wallet size={20} /></span><div><div className="font-display text-3xl font-bold leading-none">₹38.4k</div><div className="text-xs text-white/45">Avg. lifetime value per member</div></div></Card>
          <Card className="flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[.06] text-volt"><Timer size={20} /></span><div><div className="font-display text-3xl font-bold leading-none">3.4 visits</div><div className="text-xs text-white/45">Per member, per week</div></div></Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6"><h3 className="font-bold">Revenue</h3><p className="mb-4 text-xs text-white/45">Collected vs monthly target</p>
          <div className="h-64"><ResponsiveContainer><ComposedChart data={rev} margin={{ left: -8 }}><defs><linearGradient id="arv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hex} stopOpacity={0.4} /><stop offset="100%" stopColor={hex} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid {...gridProps} /><XAxis dataKey="m" {...axis} /><YAxis {...axis} tickFormatter={(v) => inrShort(v)} /><Tooltip content={<ChartTip fmt={(v) => inr(v)} />} cursor={{ stroke: hex, strokeOpacity: 0.3 }} /><Legend {...leg} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke={hex} strokeWidth={3} fill="url(#arv)" /><Line type="monotone" dataKey="target" name="Target" stroke="rgba(255,255,255,.55)" strokeDasharray="5 4" strokeWidth={2} dot={false} /></ComposedChart></ResponsiveContainer></div></Card>
        <Card className="p-6"><h3 className="font-bold">Member growth</h3><p className="mb-4 text-xs text-white/45">Joined vs churned, with total members ({growth}% over this range)</p>
          <div className="h-64"><ResponsiveContainer><ComposedChart data={gr} margin={{ left: -14, right: -14 }}><CartesianGrid {...gridProps} /><XAxis dataKey="m" {...axis} /><YAxis yAxisId="a" {...axis} /><YAxis yAxisId="b" orientation="right" {...axis} domain={['dataMin - 20', 'dataMax + 10']} />
            <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,.04)' }} /><Legend {...leg} />
            <Bar yAxisId="a" dataKey="joined" name="Joined" fill={hex} radius={[5, 5, 0, 0]} /><Bar yAxisId="a" dataKey="churned" name="Churned" fill="#fb7185" radius={[5, 5, 0, 0]} />
            <Line yAxisId="b" type="monotone" dataKey="total" name="Total members" stroke="#ffffff" strokeWidth={2.5} dot={false} /></ComposedChart></ResponsiveContainer></div></Card>
        <Card className="p-6"><h3 className="font-bold">Attendance by weekday</h3><p className="mb-4 text-xs text-white/45">Average daily check-ins. Saturday leads the week.</p>
          <div className="h-64"><ResponsiveContainer><BarChart data={weekdayAvg} margin={{ left: -22 }}><CartesianGrid {...gridProps} /><XAxis dataKey="d" {...axis} /><YAxis {...axis} /><Tooltip content={<ChartTip fmt={(v) => `${v} check-ins`} />} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
            <Bar dataKey="avg" name="Avg. check-ins" radius={[8, 8, 0, 0]}>{weekdayAvg.map((w, i) => <Cell key={i} fill={w.avg === 106 ? hex : hex + '55'} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
        <Card className="p-6"><h3 className="font-bold">Peak hours</h3><p className="mb-4 text-xs text-white/45">Two rushes: 7 AM and 6 PM</p>
          <div className="h-64"><ResponsiveContainer><AreaChart data={peakSeries} margin={{ left: -22 }}><defs><linearGradient id="apk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hex} stopOpacity={0.45} /><stop offset="100%" stopColor={hex} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid {...gridProps} /><XAxis dataKey="h" {...axis} interval={2} /><YAxis {...axis} /><Tooltip content={<ChartTip fmt={(v) => `${v} members`} />} cursor={{ stroke: hex, strokeOpacity: 0.3 }} />
            <Area type="monotone" dataKey="load" name="On the floor" stroke={hex} strokeWidth={3} fill="url(#apk)" /></AreaChart></ResponsiveContainer></div></Card>
        <Card className="p-6"><h3 className="font-bold">Membership distribution</h3><p className="mb-2 text-xs text-white/45">428 members across four plans</p>
          <div className="relative h-64"><ResponsiveContainer><PieChart><Tooltip content={<ChartTip fmt={(v) => `${v} members`} />} /><Pie data={distribution} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3} stroke="none">{distribution.map((_, i) => <Cell key={i} fill={pie[i]} />)}</Pie><Legend {...leg} /></PieChart></ResponsiveContainer>
            <div className="pointer-events-none absolute inset-x-0 top-[38%] text-center"><div className="font-display text-5xl font-bold leading-none">428</div><div className="text-xs text-white/45">members</div></div></div></Card>
        <Card className="p-6"><h3 className="font-bold">Retention</h3><p className="mb-4 text-xs text-white/45">Renewal rate by month against the 90% target</p>
          <div className="h-64"><ResponsiveContainer><LineChart data={ret} margin={{ left: -22 }}><CartesianGrid {...gridProps} /><XAxis dataKey="m" {...axis} /><YAxis {...axis} domain={[84, 96]} tickFormatter={(v) => `${v}%`} /><Tooltip content={<ChartTip fmt={(v) => `${v}%`} />} cursor={{ stroke: hex, strokeOpacity: 0.3 }} />
            <ReferenceLine y={90} stroke="rgba(255,255,255,.35)" strokeDasharray="5 4" label={{ value: 'Target 90%', fill: 'rgba(255,255,255,.45)', fontSize: 11, position: 'insideBottomRight' }} />
            <Line type="monotone" dataKey="retention" name="Retention" stroke={hex} strokeWidth={3} dot={{ r: 3, fill: hex, strokeWidth: 0 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div></Card>
      </div>
    </div>
  )
}
