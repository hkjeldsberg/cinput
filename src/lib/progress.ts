// Pure progress logic: dates, day states, streaks, V0 rules, badges.
import { TOTAL_DAYS } from "./plan";

export type DayState = "done" | "today" | "missed" | "upcoming";

const MS_DAY = 86_400_000;

/** Today's date (YYYY-MM-DD) in the given IANA time zone. */
export function todayIn(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}

function toUtc(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

export function dayDate(startDate: string, day: number): string {
  return new Date(toUtc(startDate) + (day - 1) * MS_DAY).toISOString().slice(0, 10);
}

/** Day number for `today`; < 1 before start, > 30 after the plan ends. */
export function currentDay(startDate: string, today: string): number {
  return Math.round((toUtc(today) - toUtc(startDate)) / MS_DAY) + 1;
}

export function dayState(day: number, current: number, done: Set<number>): DayState {
  if (done.has(day)) return "done";
  if (day === current) return "today";
  return day < current ? "missed" : "upcoming";
}

/** Consecutive done days ending today, or yesterday if today is still open. */
export function streak(done: Set<number>, current: number): number {
  let day = Math.min(current, TOTAL_DAYS);
  if (!done.has(day)) day -= 1;
  let n = 0;
  while (day >= 1 && done.has(day)) {
    n++;
    day--;
  }
  return n;
}

/** Missed days in a row right before today (V0: 2+ means a 10-min easy restart). */
export function missedInARow(done: Set<number>, current: number): number {
  let n = 0;
  for (let day = Math.min(current, TOTAL_DAYS + 1) - 1; day >= 1 && !done.has(day); day--) n++;
  return n;
}

export type Hint = "easier" | "right" | "harder";

/** V0: above 90% try harder, below 75% go easier. */
export function comprehensionHint(pct: number): Hint {
  if (pct > 90) return "harder";
  if (pct < 75) return "easier";
  return "right";
}

export type LogLite = { comprehension_pct: number; rewound: boolean; watched_at: string };

/** V0: three videos in a row above 90% without rewinding. */
export function levelUpReady(logs: LogLite[]): boolean {
  const last = [...logs].sort((a, b) => a.watched_at.localeCompare(b.watched_at)).slice(-3);
  return last.length === 3 && last.every((l) => l.comprehension_pct > 90 && !l.rewound);
}

export type Stats = {
  daysDone: number;
  minutes: number;
  bestStreak: number;
  levelUp: boolean;
  phrases: number;
};

export function bestStreak(done: Set<number>): number {
  let best = 0;
  let run = 0;
  for (let day = 1; day <= TOTAL_DAYS; day++) {
    run = done.has(day) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

export type Badge = { id: string; label: string; emoji: string; earned: boolean; hint: string };

export function badges(s: Stats, goals: { hours: number; days: number }): Badge[] {
  return [
    { id: "first", label: "Primer paso", emoji: "🌱", earned: s.daysDone >= 1, hint: "Finish your first day" },
    { id: "streak7", label: "Racha de 7", emoji: "🔥", earned: s.bestStreak >= 7, hint: "7 days in a row" },
    { id: "phrases25", label: "Coleccionista", emoji: "📝", earned: s.phrases >= 25, hint: "Save 25 phrases" },
    { id: "hours5", label: "Cinco horas", emoji: "⏱️", earned: s.minutes >= 300, hint: "5 hours of input" },
    {
      id: "hoursGoal",
      label: `${goals.hours} horas`,
      emoji: "🏆",
      earned: s.minutes >= goals.hours * 60,
      hint: `${goals.hours} hours of input`,
    },
    {
      id: "daysGoal",
      label: `${goals.days} días`,
      emoji: "🎯",
      earned: s.daysDone >= goals.days,
      hint: `${goals.days} of 30 days done`,
    },
    { id: "levelUp", label: "¡Sube de nivel!", emoji: "🚀", earned: s.levelUp, hint: "3 videos >90% without rewinding" },
  ];
}
