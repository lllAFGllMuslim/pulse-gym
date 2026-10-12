import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Flame, Lock, Mail, ShieldCheck, Users } from 'lucide-react'
import { useStore } from '../lib/store'
import { Logo } from '../components/ui'

export default function Login() {
  const { login } = useStore()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@') || pw.length < 4) { setErr('Enter a valid email and a password with at least 4 characters.'); return }
    setErr(''); setBusy(true)
    setTimeout(() => login(/manager|admin|owner/i.test(email) ? 'manager' : 'member'), 700)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      {/* hero side */}
      <section className="relative hidden overflow-hidden border-r border-white/[.06] bg-ink-900 lg:block">
        <div className="scanline absolute inset-0" />
        <div className="absolute -left-32 top-1/3 h-[480px] w-[480px] rounded-full bg-volt/10 blur-[120px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo size={40} />
          <div>
            <h1 className="font-display text-[150px] font-extrabold leading-[.82] tracking-tight">TRAIN.<br />TRACK.<br /><span className="text-volt">REPEAT.</span></h1>
            <p className="mt-8 max-w-md text-lg text-white/55">Check-ins, streaks and renewals in one place. Members stay consistent. Managers stay ahead of the floor.</p>
            <svg viewBox="0 0 600 90" className="mt-10 w-full max-w-xl" fill="none">
              <path d="M0 50h150l22-38 30 76 26-60 18 22h354" stroke="rgb(var(--volt))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="600" className="animate-sweep" style={{ filter: 'drop-shadow(0 0 8px rgb(var(--volt)/.8))' }} />
            </svg>
          </div>
          <div className="flex gap-10 text-sm">
            {[['428', 'members trained'], ['87', 'on the floor now'], ['92%', 'renew every cycle']].map(([n, l]) => (
              <div key={l}><div className="font-display text-4xl font-bold text-volt">{n}</div><div className="text-white/45">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* form side */}
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><Logo /></div>
          <h2 className="font-display text-5xl font-bold">Welcome back</h2>
          <p className="mt-2 text-white/50">Sign in to pick up where you left off.</p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="em">Email</label>
              <div className="relative"><Mail size={16} className="absolute left-3.5 top-3.5 text-white/30" />
                <input id="em" className="input !pl-10" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
            </div>
            <div>
              <label className="label" htmlFor="pw">Password</label>
              <div className="relative"><Lock size={16} className="absolute left-3.5 top-3.5 text-white/30" />
                <input id="pw" className="input !px-10" type={show ? 'text' : 'password'} placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-3 text-white/40 hover:text-white" aria-label="Toggle password">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            </div>
            {err && <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{err}</p>}
            <button className="btn-volt w-full !py-3.5 text-base" disabled={busy}>
              {busy ? <span className="h-5 w-5 animate-[spin_.7s_linear_infinite] rounded-full border-2 border-ink-950/30 border-t-ink-950" /> : <>Sign in <ArrowRight size={18} /></>}
            </button>
            <p className="text-center text-xs text-white/35">Tip: use an email with “manager” in it to sign in as staff.</p>
          </form>

          <div className="my-8 flex items-center gap-4 text-xs text-white/35"><span className="h-px flex-1 bg-white/10" />Or jump straight in<span className="h-px flex-1 bg-white/10" /></div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => login('member')} className="card card-lift group p-4 text-left hover:bg-ink-700/80">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-volt text-ink-950"><Flame size={20} /></span>
              <div className="font-bold">Demo as Member</div>
              <div className="text-xs text-white/45">Alex · 12 day streak</div>
            </button>
            <button onClick={() => login('manager')} className="card card-lift group p-4 text-left hover:bg-ink-700/80">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-volt/40 text-volt"><Users size={20} /></span>
              <div className="font-bold">Demo as Gym Manager</div>
              <div className="text-xs text-white/45">Riya · 428 members</div>
            </button>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/30"><ShieldCheck size={14} /> Showcase build. Sample data only, nothing leaves your browser.</p>
        </div>
      </section>
    </div>
  )
}
