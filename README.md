# DailyOS — Personal Productivity & Habit Management Platform

**DailyOS** is a personal growth operating system built exclusively for **Kabir Ubale**.

It combines daily task execution, custom habit tracking with streak accountability, calendar planning, long-term goals, Pomodoro focus sessions, productivity analytics, and daily journaling into one clean, distraction-free environment.

---

## ⚡ Core Features

- **Personalized Workspace**: Tailored for **Kabir Ubale** with personalized greetings and focus metrics.
- **Dedicated Daily Habits**: Fast 1-click habit creation with popular presets (*Drink 3L Water*, *Read 20 Pages*, *Deep Work Coding*, *50 Push-ups*, *Meditation*, *Digital Sunset*).
- **Streak Accountability**: Habit streaks calculated with flexible schedules (weekdays, custom days, daily).
- **Cross-Device Real-Time Sync**: Seamless synchronization between Phone and Laptop via Supabase WebSockets.
- **Local Storage First & Offline Capable**: Instant responsiveness with offline browser storage, automatically syncing with Supabase PostgreSQL when online.
- **Focus Timer**: Built-in Pomodoro timer with ambient sounds and session logging.
- **Daily Reflection**: Morning intention and evening review linked to your daily journal.

---

## 🚀 Getting Started

### 1. Install & Run Locally

```bash
npm install
npm run dev
```

Open your browser at:
👉 **[http://localhost:5173/](http://localhost:5173/)**

### 2. Open on Phone (Local Wi-Fi)

Make sure your phone and laptop are on the same Wi-Fi, then visit:
👉 **`http://192.168.0.106:5173/`**

Add it to your Home Screen on iOS (Safari Share $\rightarrow$ Add to Home Screen) or Android (Chrome $\rightarrow$ Install App) for a full-screen native mobile experience.

### 3. Connect Supabase Database

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase-schema.sql` in the Supabase SQL Editor.
3. In DailyOS, click **Sync Phone** or go to **Settings $\rightarrow$ Supabase Cloud** and enter your Project URL and Anon key.
