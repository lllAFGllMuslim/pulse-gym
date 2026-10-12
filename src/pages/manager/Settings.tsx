import { useState } from 'react'
import { Check, RotateCcw, Save } from 'lucide-react'
import { ACCENTS, useStore, type AccentName } from '../../lib/store'
import { cn } from '../../lib/utils'
import { Card, PageHeader, Toggle } from '../../components/ui'

const GROUPS: { title: string; sub: string; items: [string, string, string][] }[] = [
  { title: 'Alerts', sub: 'Choose what lands in your notification bell.', items: [
    ['renewals', 'Upcoming renewals', 'Daily digest of memberships expiring within 7 days'],
    ['failed', 'Failed payments', 'Instant alert when a charge or mandate is declined'],
    ['capacity', 'Capacity warnings', 'Alert when the floor passes 85% of capacity'],
    ['milestones', 'Member milestones', 'Streak and visit milestones worth celebrating'],
    ['weekly', 'Weekly report', 'Monday summary of revenue, growth and retention'] ] },
  { title: 'Check-in rules', sub: 'How the front desk and member app behave.', items: [
    ['autoCheckout', 'Auto check-out after 3 hours', 'Keeps live occupancy accurate when members forget to leave'],
    ['guestPass', 'Allow guest passes on Standard', 'Standard members can bring one guest per month'],
    ['twoFactor', 'Staff two-step sign-in', 'Require a one-time code for manager accounts'] ] },
]

export default function Settings() {
  const { toggles, toggle, accent, setAccent, toast, reset } = useStore()
  const [g, setG] = useState({ name: 'PULSE · Cyber Hub', phone: '+91 124 456 7890', gst: '06ABCDE1234F1Z5', cap: 150, open: '05:00', close: '23:00' })
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" sub="Gym details, alerts, check-in rules and how PULSE looks for your team." actions={<button className="btn-volt" onClick={() => toast('Settings saved')}><Save size={16} /> Save changes</button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-bold">Gym profile</h3><p className="mb-5 text-xs text-white/45">Shown on invoices and the member app.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label" htmlFor="gn">Gym name</label><input id="gn" className="input" value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} /></div>
            <div><label className="label" htmlFor="gp">Front desk phone</label><input id="gp" className="input" value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value })} /></div>
            <div><label className="label" htmlFor="gg">GSTIN</label><input id="gg" className="input" value={g.gst} onChange={(e) => setG({ ...g, gst: e.target.value })} /></div>
            <div><label className="label" htmlFor="go">Opens</label><input id="go" type="time" className="input" value={g.open} onChange={(e) => setG({ ...g, open: e.target.value })} /></div>
            <div><label className="label" htmlFor="gc">Closes</label><input id="gc" type="time" className="input" value={g.close} onChange={(e) => setG({ ...g, close: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="gk">Floor capacity: <b className="text-volt">{g.cap}</b> members</label><input id="gk" type="range" min={50} max={300} step={5} value={g.cap} onChange={(e) => setG({ ...g, cap: +e.target.value })} className="w-full accent-[rgb(var(--volt))]" /></div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold">Appearance</h3><p className="mb-5 text-xs text-white/45">Pick the accent colour used across charts, buttons and glow. It changes instantly.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(ACCENTS) as AccentName[]).map((a) => (
              <button key={a} onClick={() => { setAccent(a); toast(`${a} accent applied`) }} className={cn('rounded-xl border p-3 text-left transition', accent === a ? 'border-white/60 bg-white/[.06]' : 'border-white/10 hover:border-white/25')}>
                <span className="mb-2 grid h-9 w-9 place-items-center rounded-lg text-ink-950" style={{ background: ACCENTS[a].hex, boxShadow: `0 0 20px ${ACCENTS[a].hex}66` }}>{accent === a && <Check size={18} strokeWidth={3} />}</span>
                <span className="text-sm font-bold">{a}</span></button>))}
          </div>
          <div className="mt-6 rounded-xl border border-white/[.07] bg-ink-900 p-4"><div className="flex items-center justify-between"><div><div className="text-sm font-bold">Reset demo data</div><div className="text-xs text-white/45">Clears your check-ins, added members and settings, then restarts the tour.</div></div>
            <button className="btn-ghost !px-3 !py-2 text-xs" onClick={() => { reset(); toast('Demo data reset') }}><RotateCcw size={14} /> Reset</button></div></div>
        </Card>
        {GROUPS.map((gr) => (
          <Card key={gr.title} className="p-6"><h3 className="font-bold">{gr.title}</h3><p className="mb-3 text-xs text-white/45">{gr.sub}</p>
            <ul className="divide-y divide-white/[.06]">{gr.items.map(([k, t, d]) => (
              <li key={k} className="flex items-center justify-between gap-4 py-3.5"><div><div className="text-sm font-bold">{t}</div><div className="text-xs text-white/45">{d}</div></div><Toggle on={!!toggles[k]} onChange={() => toggle(k)} label={t} /></li>))}</ul></Card>
        ))}
      </div>
    </div>
  )
}
