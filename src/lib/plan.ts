// The 30-day plan from V0.md, video-only. Source of truth for the plan_days seed.

export type Level = "beginner" | "intermediate" | "upper" | "advanced";

export type PlanDay = {
  day_number: number;
  week: number;
  focus: string;
  level_label: string;
  target: string;
  is_review: boolean;
};

export const TOTAL_DAYS = 30;
export const DAILY_MAX_MIN = 30;

type WeekSpec = Omit<PlanDay, "day_number" | "is_review"> & {
  days: [number, number];
  levels: Level[];
};

export const WEEKS: WeekSpec[] = [
  {
    week: 1,
    days: [1, 7],
    focus: "Find your level and build the habit",
    level_label: "DS Intermediate, slower guides",
    target: "7 sessions done; a level where you understand 80-90%",
    levels: ["beginner", "intermediate"],
  },
  {
    week: 2,
    days: [8, 14],
    focus: "Volume at a comfortable level",
    level_label: "DS Intermediate, any guide",
    target: "About 3.5 hours total; no rewinding most videos",
    levels: ["intermediate"],
  },
  {
    week: 3,
    days: [15, 21],
    focus: "Faster speech and new accents",
    level_label: "DS upper Intermediate, mixed countries",
    target: "Normal-speed Intermediate videos feel comfortable",
    levels: ["upper", "intermediate"],
  },
  {
    week: 4,
    days: [22, 28],
    focus: "Stretch toward real speech",
    level_label: "DS upper Intermediate + Advanced short videos",
    target: "Follow the gist of a 10-min Advanced video",
    levels: ["upper", "advanced"],
  },
  {
    week: 5,
    days: [29, 30],
    focus: "Review",
    level_label: "Rewatch week-1 videos",
    target: "Notice how much easier they are; set next month's level",
    levels: [],
  },
];

export const PLAN_DAYS: PlanDay[] = WEEKS.flatMap((w) => {
  const days: PlanDay[] = [];
  for (let n = w.days[0]; n <= w.days[1]; n++) {
    days.push({
      day_number: n,
      week: w.week,
      focus: w.focus,
      level_label: w.level_label,
      target: w.target,
      is_review: w.week === 5,
    });
  }
  return days;
});

export function weekOf(day: number): number {
  return WEEKS.find((w) => day >= w.days[0] && day <= w.days[1])?.week ?? 5;
}

// Week 4: Advanced videos only on two days (V0: "DS Advanced short videos twice").
const ADVANCED_DAYS = new Set([24, 27]);

export type SeedVideo = { key: string; level: Level; duration_min: number };

/**
 * Deterministically assign suggested videos to each day.
 * Each day gets videos totalling at most DAILY_MAX_MIN, never reusing a video
 * until its level pool is exhausted. Review days rewatch week-1 picks.
 */
export function assignVideos(videos: SeedVideo[]): Map<number, string[]> {
  const pools = new Map<Level, SeedVideo[]>();
  for (const v of videos) {
    if (v.duration_min > DAILY_MAX_MIN) continue;
    pools.set(v.level, [...(pools.get(v.level) ?? []), v]);
  }
  const cursor = new Map<Level, number>();
  const take = (level: Level): SeedVideo | undefined => {
    const pool = pools.get(level);
    if (!pool?.length) return undefined;
    const i = cursor.get(level) ?? 0;
    cursor.set(level, i + 1);
    return pool[i % pool.length];
  };

  const result = new Map<number, string[]>();
  for (const day of PLAN_DAYS) {
    if (day.is_review) continue;
    const spec = WEEKS[day.week - 1];
    // Week 4: advanced on its two days, upper otherwise.
    const order: Level[] =
      day.week === 4
        ? ADVANCED_DAYS.has(day.day_number)
          ? ["advanced", "upper"]
          : ["upper", "intermediate"]
        : spec.levels;

    const picked: SeedVideo[] = [];
    let total = 0;
    // Alternate across the day's levels, starting with the first.
    for (let attempt = 0; attempt < 6 && picked.length < 3; attempt++) {
      const level = order[attempt % order.length];
      const v = take(level);
      if (!v || picked.some((p) => p.key === v.key)) continue;
      if (total + v.duration_min > DAILY_MAX_MIN) {
        // Give the slot back so the video is used on a later day.
        cursor.set(level, (cursor.get(level) ?? 1) - 1);
        break;
      }
      picked.push(v);
      total += v.duration_min;
    }
    result.set(day.day_number, picked.map((p) => p.key));
  }

  // Days 29-30: rewatch the first videos of days 1-2 and 3-4.
  result.set(29, [...(result.get(1) ?? []).slice(0, 1), ...(result.get(2) ?? []).slice(0, 1)]);
  result.set(30, [...(result.get(3) ?? []).slice(0, 1), ...(result.get(4) ?? []).slice(0, 1)]);
  for (const n of [29, 30]) {
    const keys = result.get(n)!;
    const total = keys.reduce((s, k) => s + (videos.find((v) => v.key === k)?.duration_min ?? 0), 0);
    if (total > DAILY_MAX_MIN) result.set(n, keys.slice(0, 1));
  }
  return result;
}
