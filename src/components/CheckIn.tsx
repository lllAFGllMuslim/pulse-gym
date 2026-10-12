import { useEffect, useMemo, useState } from 'react'
import { Check, Fingerprint } from 'lucide-react'
import { useStore } from '../lib/store'
import { iso, today } from '../lib/utils'

export function CheckIn() {
  const { attendance, streak, checkIn, checkedAt, toast } = useStore()
  const done = !!attendance[iso(today())]
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done'>(done ? 'done' : 'idle')
  const [burst, setBurst] = useState(false)
  useEffect(() => { if (done) setPhase('done') }, [done])
  const bits = useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2, r = 110 + (i % 3) * 30
    return { tx: Math.cos(a) * r, ty: Math.sin(a) * r, s: 6 + (i % 4) * 2 }
  }), [])

  const click = () => {
    if (phase !== 'idle') return
    setPhase('loading')
    setTimeout(() => {
      checkIn(); setBurst(true); setPhase('done')
      toast(`Checked in — ${streak + 1} day streak`)
      setTimeout(() => setBurst(false), 1100)
    }, 950)
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative grid h-56 w-56 place-items-center">
        {phase === 'idle' && <>
          <span className="absolute inset-4 animate-ring rounded-full border-2 border-volt/60" />
          <span className="absolute inset-4 animate-ring rounded-full border-2 border-volt/40 [animation-delay:1.2s]" />
        </>}
        {burst && bits.map((b, i) => (
          <span key={i} className="absolute left-1/2 top-1/2 animate-burst rounded-full bg-volt" style={{ width: b.s, height: b.s, '--tx': `${b.tx}px`, '--ty': `${b.ty}px` } as React.CSSProperties} />
        ))}
        <button onClick={click} disabled={phase !== 'idle'} aria-label="Check in"
          className={`relative grid h-44 w-44 place-items-center rounded-full transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt ${
            phase === 'done' ? 'bg-volt/10 ring-2 ring-volt shadow-glow' : 'bg-volt shadow-glow hover:scale-105 active:scale-95'}`}>
          {phase === 'idle' && <span className="flex flex-col items-center gap-1 text-ink-950"><Fingerprint size={44} strokeWidth={2.2} /><span className="font-display text-4xl font-extrabold leading-none">CHECK IN</span></span>}
          {phase === 'loading' && <span className="flex flex-col items-center gap-2 text-ink-950"><span className="h-11 w-11 animate-[spin_.8s_linear_infinite] rounded-full border-4 border-ink-950/25 border-t-ink-950" /><span className="text-sm font-bold">Verifying pass…</span></span>}
          {phase === 'done' && <span key="d" className="flex animate-pop flex-col items-center gap-1 text-volt"><Check size={56} strokeWidth={3.2} /><span className="font-display text-3xl font-bold leading-none">CHECKED IN</span></span>}
        </button>
      </div>
      <div className="mt-3 h-14 text-center">
        {phase === 'done' ? (
          <div key={streak} className="animate-pop">
            <div className="text-lg font-extrabold">✓ Checked In — <span className="text-volt">🔥 {streak} Day Streak</span></div>
            <div className="text-xs text-white/45">{checkedAt ? `Logged at ${checkedAt}. ` : ''}See you tomorrow.</div>
          </div>
        ) : (
          <div className="text-sm text-white/50">Tap to log today's session and extend your streak to <b className="text-white">{streak + 1}</b>.</div>
        )}
      </div>
    </div>
  )
}
