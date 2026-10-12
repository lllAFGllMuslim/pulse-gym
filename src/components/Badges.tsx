import { Dumbbell, Flame, Lock, Medal, Moon, Sparkles, Sunrise, Target, Timer, Trophy, Zap } from 'lucide-react'
import { cn } from '../lib/utils'
import { getBadges } from '../data/mock'

const ICONS: Record<string, JSX.Element> = {
  dumbbell: <Dumbbell size={22} />, zap: <Zap size={22} />, flame: <Flame size={22} />, sparkles: <Sparkles size={22} />,
  sunrise: <Sunrise size={22} />, moon: <Moon size={22} />, trophy: <Trophy size={22} />, medal: <Medal size={22} />,
  timer: <Timer size={20} />, target: <Target size={20} />,
}
export const iconFor = (k: string) => ICONS[k] ?? ICONS.dumbbell

export function BadgeCard({ b, compact }: { b: ReturnType<typeof getBadges>[number]; compact?: boolean }) {
  return (
    <div className={cn('rounded-2xl border p-4 transition', b.unlocked ? 'border-volt/25 bg-volt/[.06]' : 'border-white/[.07] bg-white/[.02]')}>
      <div className={cn('mb-3 grid h-12 w-12 place-items-center rounded-xl', b.unlocked ? 'bg-volt text-ink-950 shadow-glow-sm' : 'bg-white/[.06] text-white/35')}>
        {b.unlocked ? iconFor(b.icon) : <Lock size={18} />}
      </div>
      <div className="text-sm font-bold">{b.name}</div>
      {!compact && <p className="mt-0.5 text-xs text-white/45">{b.desc}</p>}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-volt" style={{ width: `${(b.cur / b.goal) * 100}%` }} /></div>
      <div className="mt-1.5 text-[11px] text-white/40">{b.unlocked ? 'Unlocked' : `${b.cur} of ${b.goal}`}</div>
    </div>
  )
}
