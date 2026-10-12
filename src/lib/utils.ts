export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')
const p2 = (n: number) => String(n).padStart(2, '0')
export const iso = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
export const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7))
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 864e5)
export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
export const inrShort = (n: number) =>
  n >= 1e5 ? `₹${(n / 1e5).toFixed(1).replace(/\.0$/, '')}L` : n >= 1e3 ? `₹${(n / 1e3).toFixed(1).replace(/\.0$/, '')}k` : `₹${n}`
export const fmtDate = (s: string | Date, o: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  (typeof s === 'string' ? parse(s) : s).toLocaleDateString('en-IN', o)
export function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const initials = (n: string) => n.split(' ').map((x) => x[0]).slice(0, 2).join('')
export const hashStr = (s: string) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h }
