import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CircleAlert, Clock, Download, IndianRupee, RefreshCw, Repeat, Search } from 'lucide-react'
import { useAccent, useStore } from '../../lib/store'
import { ALL_PAYMENTS, dailyCollections, methodSplit } from '../../data/mock'
import { fmtDate, inr, inrShort } from '../../lib/utils'
import { Avatar, Badge, Card, ChartTip, PageHeader, Segmented, Stat, axis, gridProps, statusTone } from '../../components/ui'

type F = 'All' | 'Paid' | 'Pending' | 'Failed'
export default function Payments() {
  const { toast } = useStore()
  const hex = useAccent()
  const [f, setF] = useState<F>('All')
  const [q, setQ] = useState('')
  const [n, setN] = useState(14)
  const pending = ALL_PAYMENTS.filter((p) => p.status === 'Pending'), failed = ALL_PAYMENTS.filter((p) => p.status === 'Failed')
  const rows = useMemo(() => ALL_PAYMENTS.filter((p) => (f === 'All' || p.status === f) && (p.member + p.id).toLowerCase().includes(q.toLowerCase())), [f, q])
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" sub="Collections, pending invoices and every transaction in one ledger." actions={<button className="btn-ghost" onClick={() => toast('Ledger exported as CSV')}><Download size={16} /> Export CSV</button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<IndianRupee size={18} />} label="Revenue this month" value="₹3.4L" delta="14%" hint="vs last month" accent />
        <Stat icon={<Clock size={18} />} label="Pending" value={inrShort(pending.reduce((a, p) => a + p.amount, 0) + 36500)} up={false} hint={`${pending.length + 14} invoices open`} />
        <Stat icon={<Repeat size={18} />} label="Renewals this week" value="38" delta="6" hint="26 auto, 12 manual" />
        <Stat icon={<CircleAlert size={18} />} label="Failed" value={failed.length + 3} up={false} hint="retry scheduled tonight" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6"><h3 className="font-bold">Daily collections</h3><p className="mb-4 text-xs text-white/45">Last 14 days</p>
          <div className="h-56"><ResponsiveContainer><BarChart data={dailyCollections} margin={{ left: -10 }}><CartesianGrid {...gridProps} /><XAxis dataKey="d" {...axis} interval={1} /><YAxis {...axis} tickFormatter={(v) => inrShort(v)} />
            <Tooltip content={<ChartTip fmt={(v) => inr(v)} />} cursor={{ fill: 'rgba(255,255,255,.04)' }} /><Bar dataKey="amt" name="Collected" radius={[6, 6, 0, 0]}>{dailyCollections.map((_, i) => <Cell key={i} fill={i === 13 ? hex : hex + '55'} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
        <Card className="p-6"><h3 className="mb-4 font-bold">How members pay</h3>
          <div className="space-y-4">{methodSplit.map((m) => <div key={m.m}><div className="mb-1.5 flex justify-between text-sm"><span className="text-white/65">{m.m}</span><b>{m.p}%</b></div><div className="h-2 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-volt" style={{ width: `${m.p}%` }} /></div></div>)}</div>
          <p className="mt-6 rounded-xl bg-white/[.04] p-3 text-xs text-white/50">UPI AutoPay renewals fail 3x less often than card mandates. Nudge card members to switch.</p></Card>
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[.06] p-4">
          <div className="relative min-w-[220px] flex-1"><Search size={16} className="absolute left-3.5 top-3 text-white/30" /><input className="input !pl-10" placeholder="Search by member or invoice" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search payments" /></div>
          <Segmented<F> value={f} onChange={setF} options={(['All', 'Paid', 'Pending', 'Failed'] as F[]).map((s) => ({ id: s, label: s }))} />
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[820px]"><thead><tr className="border-b border-white/[.06]"><th className="th">Invoice</th><th className="th">Member</th><th className="th">Plan</th><th className="th">Method</th><th className="th">Date</th><th className="th">Amount</th><th className="th">Status</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-white/[.05]">{rows.slice(0, n).map((p) => (
            <tr key={p.id} className="hover:bg-white/[.02]"><td className="td font-bold">{p.id}</td><td className="td"><div className="flex items-center gap-2.5"><Avatar name={p.member} size={30} />{p.member}</div></td><td className="td text-white/60">{p.plan}</td><td className="td text-white/60">{p.method}</td><td className="td text-white/60">{fmtDate(p.date)}</td><td className="td font-bold tabnum">{inr(p.amount)}</td><td className="td"><Badge tone={statusTone(p.status)} dot>{p.status}</Badge></td>
              <td className="td text-right">{p.status === 'Paid' ? <button className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-volt" aria-label="Download invoice" onClick={() => toast(`Invoice ${p.id} downloaded`)}><Download size={16} /></button> : <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => toast(p.status === 'Failed' ? `Retrying ${inr(p.amount)} from ${p.member.split(' ')[0]}` : `Payment link sent to ${p.member.split(' ')[0]}`)}><RefreshCw size={13} /> {p.status === 'Failed' ? 'Retry' : 'Nudge'}</button>}</td></tr>))}</tbody></table>
          {rows.length === 0 && <div className="py-14 text-center text-sm text-white/45">No transactions match. Try another status or clear the search.</div>}</div>
        <div className="flex items-center justify-between border-t border-white/[.06] px-4 py-3 text-xs text-white/40"><span>Showing {Math.min(n, rows.length)} of {rows.length} transactions</span>{n < rows.length && <button className="font-bold text-volt" onClick={() => setN(n + 14)}>Show more</button>}</div>
      </Card>
    </div>
  )
}
