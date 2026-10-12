import { addDays, cn, fmtDate, iso, startOfWeek, today } from '../lib/utils'

const LV = ['bg-white/[.045]', 'bg-volt/25', 'bg-volt/55 text-ink-950', 'bg-volt text-ink-950 shadow-[0_0_14px_rgb(var(--volt)/.45)]']

export function Heatmap({ data, weeks = 5, big }: { data: Record<string, number>; weeks?: number; big?: boolean }) {
  const t = today(), start = addDays(startOfWeek(t), -(weeks - 1) * 7)
  const cells = Array.from({ length: weeks * 7 }, (_, i) => { const d = addDays(start, i); return { d, k: iso(d), lv: data[iso(d)] || 0, future: d > t, now: iso(d) === iso(t) } })
  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-white/35">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((x) => <span key={x}>{x}</span>)}
      </div>
      <div className={cn('grid grid-cols-7', big ? 'gap-2' : 'gap-1.5')}>
        {cells.map((c) => (
          <div key={c.k} title={`${fmtDate(c.d, { weekday: 'short', day: 'numeric', month: 'short' })} · ${c.future ? 'upcoming' : c.lv ? 'trained' : 'rest day'}`}
            className={cn('grid aspect-square place-items-center rounded-lg text-[11px] font-bold text-white/30 transition-transform hover:scale-110',
              LV[c.lv], c.future && 'opacity-30', c.now && 'ring-2 ring-white/80')}>
            {c.d.getDate()}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-white/40">
        Rest {LV.map((l, i) => <span key={i} className={cn('h-3 w-3 rounded', l.split(' ')[0], i === 3 && '!shadow-none')} />)} Intense
      </div>
    </div>
  )
}

export function MonthCalendar({ data }: { data: Record<string, number> }) {
  const t = today(), first = new Date(t.getFullYear(), t.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7, days = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()
  return (
    <div>
      <div className="mb-3 text-sm font-bold">{fmtDate(first, { month: 'long', year: 'numeric' })}</div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-white/35">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x, i) => <span key={i}>{x}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: lead }, (_, i) => <div key={'b' + i} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(t.getFullYear(), t.getMonth(), i + 1), lv = data[iso(d)] || 0, future = d > t
          return (
            <div key={i} className={cn('grid aspect-square place-items-center rounded-lg text-xs font-bold', LV[lv], !lv && 'text-white/35', future && 'opacity-30', iso(d) === iso(t) && 'ring-2 ring-white/80')}>{i + 1}</div>
          )
        })}
      </div>
    </div>
  )
}
