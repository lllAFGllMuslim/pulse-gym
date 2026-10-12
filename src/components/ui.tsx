import { useEffect, useState, type ReactNode } from 'react'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import { cn, hashStr, initials } from '../lib/utils'

export const axis = { tick: { fill: 'rgba(255,255,255,.42)', fontSize: 11 }, axisLine: false, tickLine: false } as const
export const gridProps = { stroke: 'rgba(255,255,255,.06)', vertical: false } as const

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid place-items-center rounded-xl bg-volt shadow-glow-sm" style={{ width: size, height: size }}>
        <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 32 32" fill="none" stroke="#08090b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17h6l3.5-9 6 17 3.5-8H29" /></svg>
      </div>
      <span className="font-display text-[26px] font-extrabold leading-none tracking-wide">PULSE<span className="text-volt"> GYM</span></span>
    </div>
  )
}

export function Card({ className, children, glow }: { className?: string; children: ReactNode; glow?: boolean }) {
  return <div className={cn('card', glow && 'shadow-glow border-volt/20', className)}>{children}</div>
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl font-bold leading-none sm:text-5xl">{title}</h1>
        {sub && <p className="mt-2 max-w-xl text-sm text-white/50">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf = 0; const s = performance.now()
    const tick = (t: number) => { const p = Math.min(1, (t - s) / ms); setV(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}
export function Count({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const v = useCountUp(to)
  return <span className="tabnum">{prefix}{v.toLocaleString('en-IN')}{suffix}</span>
}

export function Stat({ icon, label, value, delta, up = true, hint, accent }: {
  icon: ReactNode; label: string; value: ReactNode; delta?: string; up?: boolean; hint?: string; accent?: boolean
}) {
  return (
    <Card className={cn('card-lift p-5', accent && 'border-volt/25')}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/55">{label}</span>
        <span className={cn('grid h-9 w-9 place-items-center rounded-lg', accent ? 'bg-volt text-ink-950' : 'bg-white/[.06] text-volt')}>{icon}</span>
      </div>
      <div className="mt-3 font-display text-[44px] font-bold leading-none">{value}</div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta && (
          <span className={cn('inline-flex items-center gap-1 font-bold', up ? 'text-volt' : 'text-rose-400')}>
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{delta}
          </span>
        )}
        {hint && <span className="text-white/40">{hint}</span>}
      </div>
    </Card>
  )
}

const tones: Record<string, string> = {
  volt: 'bg-volt/10 text-volt border-volt/25', amber: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25', gray: 'bg-white/[.05] text-white/60 border-white/10',
  sky: 'bg-sky-400/10 text-sky-300 border-sky-400/25',
}
export function Badge({ tone = 'gray', children, dot }: { tone?: keyof typeof tones | string; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold', tones[tone])}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}
    </span>
  )
}
export const statusTone = (s: string) => ({ Active: 'volt', Paid: 'volt', Expiring: 'amber', Pending: 'amber', Expired: 'rose', Failed: 'rose' } as Record<string, string>)[s] || 'gray'
export const planTone = (p: string) => ({ Premium: 'volt', Annual: 'sky', Standard: 'gray', Basic: 'gray' } as Record<string, string>)[p] || 'gray'

const GRADS = ['from-lime-300 to-emerald-500', 'from-sky-300 to-indigo-500', 'from-orange-300 to-rose-500', 'from-fuchsia-300 to-violet-500', 'from-amber-200 to-orange-500', 'from-teal-200 to-cyan-500']
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div className={cn('grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-extrabold text-ink-950', GRADS[hashStr(name) % GRADS.length])}
      style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials(name)}</div>
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('card relative max-h-[90vh] w-full animate-pop overflow-y-auto bg-ink-800 p-6 shadow-2xl', wide ? 'max-w-2xl' : 'max-w-lg')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-3xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ChartTip({ active, payload, label, fmt }: { active?: boolean; payload?: any[]; label?: string; fmt?: (v: number, name: string) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/95 px-3.5 py-2.5 text-xs shadow-2xl backdrop-blur">
      <div className="mb-1.5 font-bold text-white">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5 text-white/70">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span>{p.name}</span>
          <span className="ml-auto pl-4 font-bold text-white">{fmt ? fmt(p.value, p.name) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-ink-900 p-1">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={cn('rounded-lg px-3 py-1.5 text-xs font-bold transition', value === o.id ? 'bg-volt text-ink-950' : 'text-white/55 hover:text-white')}>{o.label}</button>
      ))}
    </div>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition', on ? 'bg-volt' : 'bg-white/15')}>
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-ink-950 transition-all', on ? 'left-[22px]' : 'left-0.5 !bg-white')} />
    </button>
  )
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-white/[.07]', className)}>
      <div className="h-full rounded-full bg-volt shadow-glow-sm transition-all duration-1000" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}
