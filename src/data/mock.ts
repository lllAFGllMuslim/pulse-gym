import { addDays, iso, mulberry32, today } from '../lib/utils'

export type PlanId = 'Basic' | 'Standard' | 'Premium' | 'Annual'
export type Status = 'Active' | 'Expiring' | 'Expired'
export interface Plan { id: PlanId; price: number; period: 'mo' | 'yr'; tagline: string; features: string[]; subs: number; popular?: boolean }
export interface Member {
  id: string; name: string; email: string; phone: string; plan: PlanId
  streak: number; longest: number; visits: number; joined: string; expires: string
  status: Status; goal: string; trainer: string
}
export interface Payment { id: string; memberId: string; member: string; plan: PlanId; amount: number; method: string; status: 'Paid' | 'Pending' | 'Failed'; date: string }

export const PLANS: Plan[] = [
  { id: 'Basic', price: 999, period: 'mo', tagline: 'Floor access, zero fluff', subs: 74, features: ['Gym floor access', '6 AM – 4 PM entry', 'Locker on request', '1 free trainer consult'] },
  { id: 'Standard', price: 1499, period: 'mo', tagline: 'The all-rounder', subs: 148, popular: true, features: ['Full-day access', 'Group classes', 'Steam & recovery zone', 'Monthly body scan'] },
  { id: 'Premium', price: 2999, period: 'mo', tagline: 'Train like a pro', subs: 121, features: ['24/7 access', 'Personal trainer · 4 sessions', 'Custom nutrition plan', 'Priority class booking', '2 guest passes'] },
  { id: 'Annual', price: 19999, period: 'yr', tagline: 'Best value, two months free', subs: 85, features: ['Everything in Premium', 'Locked-in annual rate', 'Free PULSE merch kit', 'Freeze up to 30 days', 'Quarterly assessments'] },
]
export const planPrice = (id: PlanId) => PLANS.find((p) => p.id === id)!.price

const T = today()
const TRAINERS = ['Coach Imran', 'Coach Divya', 'Coach Rishi', 'Coach Natasha']
// name, plan, streak, longest, visits, joinedDaysAgo, expiresInDays, goal
const RAW: [string, PlanId, number, number, number, number, number, string][] = [
  ['Alex Rivera', 'Premium', 12, 18, 68, 142, 18, 'Build strength'],
  ['Rohan Mehta', 'Premium', 34, 41, 212, 410, 22, 'Powerlifting'],
  ['Priya Sharma', 'Standard', 21, 28, 156, 288, 9, 'Lose fat'],
  ['Arjun Nair', 'Annual', 9, 33, 301, 612, 140, 'Marathon prep'],
  ['Sneha Kapoor', 'Basic', 0, 7, 24, 96, -6, 'Stay active'],
  ['Vikram Singh', 'Premium', 17, 25, 118, 201, 5, 'Build muscle'],
  ['Ananya Iyer', 'Standard', 6, 19, 87, 175, 14, 'Flexibility'],
  ['Karan Malhotra', 'Basic', 3, 11, 41, 120, 2, 'Lose fat'],
  ['Neha Gupta', 'Annual', 27, 30, 244, 520, 205, 'CrossFit'],
  ['Aditya Verma', 'Standard', 0, 14, 63, 233, -14, 'Build muscle'],
  ['Ishita Rao', 'Premium', 14, 22, 97, 160, 27, 'Tone up'],
  ['Rahul Khanna', 'Basic', 2, 9, 33, 75, 6, 'Stay active'],
  ['Meera Reddy', 'Standard', 11, 17, 72, 130, 11, 'Endurance'],
  ['Siddharth Joshi', 'Premium', 0, 26, 133, 340, -3, 'Powerlifting'],
  ['Pooja Bansal', 'Standard', 8, 15, 58, 110, 19, 'Tone up'],
  ['Dev Patel', 'Annual', 45, 52, 389, 700, 96, 'Bodybuilding'],
  ['Kavya Menon', 'Basic', 5, 12, 37, 88, 13, 'Lose fat'],
  ['Aarav Chopra', 'Premium', 19, 24, 104, 190, 4, 'Build strength'],
  ['Tanvi Desai', 'Standard', 1, 10, 29, 64, 1, 'Stay active'],
]
export const MEMBERS: Member[] = RAW.map(([name, plan, streak, longest, visits, jd, ex, goal], i) => {
  const first = name.split(' ')[0].toLowerCase(), last = name.split(' ')[1].toLowerCase()
  return {
    id: `m${i}`, name, plan, streak, longest, visits, goal,
    email: `${first}.${last}@gmail.com`,
    phone: `+91 9${String(8123 + i * 371).slice(0, 4)} ${String(10000 + i * 4827).slice(0, 5)}`,
    joined: iso(addDays(T, -jd)), expires: iso(addDays(T, ex)),
    status: ex < 0 ? 'Expired' : ex <= 7 ? 'Expiring' : 'Active',
    trainer: TRAINERS[i % TRAINERS.length],
  }
})

export function memberAttendance(m: Member): Record<string, number> {
  const r = mulberry32(parseInt(m.id.slice(1)) * 97 + 13), out: Record<string, number> = {}
  for (let d = 1; d <= 35; d++) {
    const k = iso(addDays(T, -d))
    if (d <= m.streak) out[k] = r() > 0.5 ? 3 : 2
    else if (d === m.streak + 1) continue
    else if (r() < (m.status === 'Expired' ? 0.2 : 0.55)) out[k] = 1 + Math.floor(r() * 3)
  }
  return out
}

const METHODS = ['UPI', 'Credit Card', 'Net Banking', 'Debit Card', 'UPI', 'UPI']
export function memberPayments(m: Member): Payment[] {
  const n = parseInt(m.id.slice(1)), r = mulberry32(n * 31 + 5)
  const count = m.plan === 'Annual' ? 2 : 4, base = 1 + Math.floor(r() * 24)
  return Array.from({ length: count }, (_, k) => {
    let status: Payment['status'] = 'Paid'
    if (k === 0 && m.status === 'Expired') status = n % 2 ? 'Pending' : 'Failed'
    if (k === 0 && m.status === 'Expiring' && n % 2 === 0) status = 'Pending'
    return {
      id: `INV-${10200 + n * 10 + k}`, memberId: m.id, member: m.name, plan: m.plan, amount: planPrice(m.plan),
      method: METHODS[(n + k) % METHODS.length], status, date: iso(addDays(T, -(base + k * (m.plan === 'Annual' ? 365 : 30)))),
    }
  })
}
export const ALL_PAYMENTS: Payment[] = MEMBERS.flatMap(memberPayments).sort((a, b) => b.date.localeCompare(a.date))

/* ---------- charts ---------- */
export const monthLabels = (n: number) =>
  Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (n - 1 - i)); return d.toLocaleString('en-US', { month: 'short' }) })
const L12 = monthLabels(12)
const REV = [218, 226, 241, 252, 266, 271, 284, 296, 308, 319, 331, 340]
const TOT = [280, 292, 311, 328, 346, 363, 372, 384, 397, 409, 419, 428]
const CHURN = [6, 7, 5, 6, 6, 5, 7, 6, 7, 7, 7, 7]
const RET = [88, 89, 89, 90, 91, 90, 91, 92, 91, 92, 93, 92]
export const revenueSeries = L12.map((m, i) => ({ m, revenue: REV[i] * 1000, target: Math.round(REV[i] * 1000 * 0.94) }))
export const growthSeries = L12.map((m, i) => ({ m, total: TOT[i], churned: CHURN[i], joined: (i ? TOT[i] - TOT[i - 1] : 12) + CHURN[i] }))
export const retentionSeries = L12.map((m, i) => ({ m, retention: RET[i], target: 90 }))

const DAYS = Array.from({ length: 7 }, (_, i) => addDays(T, i - 6).toLocaleString('en-US', { weekday: 'short' }))
const WK = [96, 88, 92, 85, 79, 104, 87]
export const weekSeries = DAYS.map((d, i) => ({ d, checkins: WK[i], today: i === 6 }))
const PH = [24, 58, 96, 88, 52, 34, 30, 28, 26, 32, 45, 68, 104, 112, 86, 54, 32, 18]
const hl = (h: number) => (h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`)
export const peakSeries = PH.map((v, i) => ({ h: hl(i + 5), hour: i + 5, load: v }))
export const weekdayAvg = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ d, avg: [98, 91, 94, 88, 82, 106, 71][i] }))
export const heatGrid = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, di) => {
  const r = mulberry32(di * 11 + 3), f = [1, 0.95, 0.98, 0.92, 0.85, 1.08, 0.72][di]
  return { d, cells: peakSeries.map((p) => Math.round(p.load * f * (0.88 + r() * 0.24))) }
})
export const distribution = [
  { name: 'Standard', value: 148 }, { name: 'Premium', value: 121 }, { name: 'Annual', value: 85 }, { name: 'Basic', value: 74 },
]
export const ZONES0 = [
  { name: 'Free weights', now: 34, cap: 50 }, { name: 'Cardio floor', now: 28, cap: 45 },
  { name: 'Studio', now: 15, cap: 30 }, { name: 'Functional rig', now: 10, cap: 25 },
]
export const dailyCollections = Array.from({ length: 14 }, (_, i) => ({
  d: addDays(T, i - 13).toLocaleString('en-US', { day: 'numeric', month: 'short' }),
  amt: [8200, 14800, 11400, 9900, 17600, 21300, 12500, 9700, 13900, 16200, 10800, 18900, 22400, 14100][i],
}))
export const methodSplit = [{ m: 'UPI', p: 54 }, { m: 'Cards', p: 28 }, { m: 'Net banking', p: 12 }, { m: 'Cash', p: 6 }]

export const RECENT_CHECKINS = [
  { name: 'Rohan Mehta', plan: 'Premium', ago: '2 min ago', time: '6:52 PM' },
  { name: 'Priya Sharma', plan: 'Standard', ago: '4 min ago', time: '6:50 PM' },
  { name: 'Dev Patel', plan: 'Annual', ago: '7 min ago', time: '6:47 PM' },
  { name: 'Ishita Rao', plan: 'Premium', ago: '9 min ago', time: '6:45 PM' },
  { name: 'Aarav Chopra', plan: 'Premium', ago: '12 min ago', time: '6:42 PM' },
  { name: 'Neha Gupta', plan: 'Annual', ago: '15 min ago', time: '6:39 PM' },
  { name: 'Meera Reddy', plan: 'Standard', ago: '18 min ago', time: '6:36 PM' },
  { name: 'Vikram Singh', plan: 'Premium', ago: '21 min ago', time: '6:33 PM' },
  { name: 'Pooja Bansal', plan: 'Standard', ago: '26 min ago', time: '6:28 PM' },
  { name: 'Kavya Menon', plan: 'Basic', ago: '31 min ago', time: '6:23 PM' },
  { name: 'Ananya Iyer', plan: 'Standard', ago: '38 min ago', time: '6:16 PM' },
  { name: 'Arjun Nair', plan: 'Annual', ago: '44 min ago', time: '6:10 PM' },
]

export interface Notif { id: string; kind: 'warn' | 'money' | 'streak' | 'info' | 'user'; title: string; body: string; ago: string }
export const MANAGER_NOTIFS: Notif[] = [
  { id: 'n1', kind: 'warn', title: '12 memberships expire this week', body: 'Send renewal reminders to protect about ₹28k in monthly revenue.', ago: '10 min ago' },
  { id: 'n2', kind: 'money', title: 'Payment failed for Sneha Kapoor', body: '₹999 UPI mandate was declined. Retry or contact the member.', ago: '42 min ago' },
  { id: 'n3', kind: 'streak', title: 'Dev Patel reached a 45-day streak', body: 'Longest active streak at the gym. Worth a shout-out.', ago: '1 hr ago' },
  { id: 'n4', kind: 'user', title: '3 new sign-ups today', body: 'Two Standard and one Annual plan. Welcome sessions are open.', ago: '3 hr ago' },
  { id: 'n5', kind: 'warn', title: 'Evening rush hit 85% capacity', body: 'Free weights stayed above 90% from 6:30 to 7:30 PM yesterday.', ago: 'Yesterday' },
  { id: 'n6', kind: 'info', title: 'Weekly report is ready', body: 'Retention held at 92% and revenue grew 3.6% week over week.', ago: 'Yesterday' },
]
export const MEMBER_NOTIFS: Notif[] = [
  { id: 'a1', kind: 'streak', title: 'Keep your 12-day streak alive', body: 'Check in before midnight to make it 13 and unlock Lucky 13.', ago: 'Just now' },
  { id: 'a2', kind: 'info', title: 'Premium renews in 18 days', body: 'Your plan auto-renews at ₹2,999 on the due date.', ago: '2 hr ago' },
  { id: 'a3', kind: 'user', title: 'Priya challenged you', body: 'A 7-day streak race starts Monday. Accept in the app.', ago: 'Yesterday' },
  { id: 'a4', kind: 'money', title: 'Payment received', body: 'We got your ₹2,999 payment. Invoice is in Membership.', ago: '12 days ago' },
]

export function getBadges(s: { streak: number; longest: number; total: number }) {
  return [
    { id: 'first', name: 'First Rep', desc: 'Complete your first check-in', icon: 'dumbbell', cur: Math.min(s.total, 1), goal: 1 },
    { id: 'week', name: 'Week Warrior', desc: 'Hit a 7-day streak', icon: 'zap', cur: Math.min(s.longest, 7), goal: 7 },
    { id: 'fort', name: 'Fortnight Force', desc: 'Hit a 14-day streak', icon: 'flame', cur: Math.min(s.longest, 14), goal: 14 },
    { id: 'lucky', name: 'Lucky 13', desc: 'Reach a 13-day active streak', icon: 'sparkles', cur: Math.min(s.streak, 13), goal: 13 },
    { id: 'early', name: 'Early Bird', desc: '20 workouts before 7 AM', icon: 'sunrise', cur: 20, goal: 20 },
    { id: 'owl', name: 'Night Owl', desc: '10 workouts after 9 PM', icon: 'moon', cur: 10, goal: 10 },
    { id: 'century', name: 'Century Club', desc: '100 total visits', icon: 'trophy', cur: Math.min(s.total, 100), goal: 100 },
    { id: 'iron', name: 'Iron Month', desc: 'Hit a 30-day streak', icon: 'medal', cur: Math.min(s.longest, 30), goal: 30 },
  ].map((b) => ({ ...b, unlocked: b.cur >= b.goal }))
}

export const RECORDS = [
  { lift: 'Bench press', value: '82.5 kg', delta: '+5 kg', when: '9 days ago', icon: 'dumbbell' },
  { lift: 'Back squat', value: '110 kg', delta: '+7.5 kg', when: '3 weeks ago', icon: 'dumbbell' },
  { lift: 'Deadlift', value: '135 kg', delta: '+10 kg', when: '5 weeks ago', icon: 'dumbbell' },
  { lift: '5K run', value: '24:12', delta: '−0:48', when: '2 weeks ago', icon: 'timer' },
  { lift: 'Plank hold', value: '3:20', delta: '+0:25', when: '6 days ago', icon: 'timer' },
  { lift: 'Pull-ups', value: '14 reps', delta: '+2', when: '12 days ago', icon: 'target' },
]
export const activitySeries = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'].map((w, i) => ({
  w, minutes: [210, 245, 190, 260, 285, 240, 300, 320][i], calories: [1480, 1720, 1310, 1850, 2040, 1690, 2210, 2380][i], sessions: [3, 4, 3, 4, 5, 4, 5, 5][i],
}))
export const monthlyVisits = monthLabels(6).map((m, i) => ({ m, visits: [14, 17, 19, 22, 18, 21][i] }))
const WORKOUTS = ['Push day · chest & triceps', 'Leg day · squats & lunges', 'HIIT conditioning', 'Pull day · back & biceps', 'Mobility & core', 'Full body strength', 'Cardio · 5K tempo', 'Shoulders & arms']
export const sessions = WORKOUTS.map((w, i) => ({ w, date: iso(addDays(T, -(i + 1))), time: ['6:40 AM', '7:05 AM', '6:15 PM', '6:50 AM', '7:20 PM', '6:30 AM', '6:05 PM', '6:45 AM'][i], mins: [72, 81, 45, 68, 38, 76, 52, 64][i], kcal: [520, 610, 480, 440, 210, 590, 560, 470][i] }))
