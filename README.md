# PULSE GYM — frontend demo

A premium gym-management showcase built with **React + TypeScript + Tailwind CSS + Lucide + Recharts** (Vite).
Everything is mock data stored in `localStorage`. No backend, auth, payments or database.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
```

Node 18+ required.

## What to try

- **Login page**: use "Demo as Member" or "Demo as Gym Manager". The email form also works (an email containing "manager" signs you in as staff).
- **Member**: tap CHECK IN. The streak goes 12 → 13, Lucky 13 unlocks, and the manager's recent check-ins list shows Alex.
- **Manager**: search/filter members, open a profile, add a member, send reminders, retry failed payments, change the accent colour in Settings.
- Switch roles any time from the top bar. Use Settings → Reset demo data to start over.

## Structure

```
src/
  data/mock.ts        members, plans, payments, chart series
  lib/store.tsx       localStorage-backed state (check-in, members, toasts, accent)
  components/         Shell (sidebar/topbar), CheckIn, Calendar/Heatmap, ui kit
  pages/member/       Dashboard, Attendance, Membership, Achievements, Profile
  pages/manager/      Overview, Members, Attendance, Memberships, Payments, Analytics, Settings
```
